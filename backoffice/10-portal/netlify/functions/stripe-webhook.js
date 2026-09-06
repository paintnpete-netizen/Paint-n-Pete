/**
 * Stripe webhook — marks deposit_paid on ActiveJobs when Checkout completes.
 *
 * Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PORTAL_SCRIPT_URL, PORTAL_OPERATOR_KEY
 */
const CORS_ORIGINS = [
  "https://paintnpete-hq.netlify.app",
  "https://portal.paintnpete.com",
  "https://paintnpete-portal.netlify.app",
];

function scriptUrl(extraQuery) {
  const base = process.env.BOOKING_SCRIPT_URL || process.env.PORTAL_SCRIPT_URL || "";
  if (!base) return "";
  const join = base.indexOf("?") >= 0 ? "&" : "?";
  return extraQuery ? base + join + extraQuery : base;
}

function operatorKey_() {
  const fromEnv = process.env.PORTAL_OPERATOR_KEY || process.env.WEBHOOK_SECRET || "";
  if (fromEnv) return fromEnv;
  const base = process.env.BOOKING_SCRIPT_URL || process.env.PORTAL_SCRIPT_URL || "";
  const m = base.match(/[?&]key=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

async function notifyDepositPaid(jobNumber, stripePaymentId, extras) {
  const url = scriptUrl();
  if (!url) return { ok: false, error: "portal api not configured" };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "portal_deposit_paid",
      operator_key: operatorKey_(),
      job_number: jobNumber,
      stripe_payment_id: stripePaymentId || "",
      amount_cents: extras && extras.amount_cents != null ? extras.amount_cents : null,
      stripe_fee_cents: extras && extras.stripe_fee_cents != null ? extras.stripe_fee_cents : null,
    }),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    return { ok: false, error: "bad json from portal backend" };
  }
}

async function stripeFeeFromPaymentIntent(stripe, paymentIntentId, amountFallback) {
  if (paymentIntentId && String(paymentIntentId).indexOf("pi_") === 0) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ["latest_charge.balance_transaction"],
      });
      const charge = pi.latest_charge;
      const bt =
        charge && typeof charge === "object" ? charge.balance_transaction : null;
      if (bt && typeof bt === "object" && bt.fee != null) {
        return {
          amount_cents: pi.amount_received || pi.amount || amountFallback || null,
          stripe_fee_cents: Number(bt.fee) || 0,
        };
      }
      return {
        amount_cents: pi.amount_received || pi.amount || amountFallback || null,
        stripe_fee_cents: null,
      };
    } catch (err) {
      /* fall through */
    }
  }
  return { amount_cents: amountFallback || null, stripe_fee_cents: null };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "POST only" };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!stripeKey || !webhookSecret) {
    return { statusCode: 503, body: "stripe webhook not configured" };
  }

  const sig = event.headers["stripe-signature"] || event.headers["Stripe-Signature"] || "";
  const Stripe = require("stripe");
  const stripe = new Stripe(stripeKey);

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    return { statusCode: 400, body: "Webhook signature verification failed" };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const meta = session.metadata || {};
    if (meta.payment_type === "deposit" && meta.job_number) {
      const paymentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.id;
      const feeInfo = await stripeFeeFromPaymentIntent(
        stripe,
        paymentId,
        session.amount_total
      );
      // Standard US card estimate if Stripe fee not expanded yet
      if (feeInfo.stripe_fee_cents == null && feeInfo.amount_cents) {
        feeInfo.stripe_fee_cents =
          Math.round(Number(feeInfo.amount_cents) * 0.029) + 30;
      }
      await notifyDepositPaid(meta.job_number, paymentId, feeInfo);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
