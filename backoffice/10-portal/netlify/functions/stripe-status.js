/**
 * Stripe account status for operator setup page (no secrets returned).
 */
exports.handler = async () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY || "";
  if (!stripeKey) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ ok: false, error: "stripe not configured" }),
    };
  }

  const Stripe = require("stripe");
  const stripe = new Stripe(stripeKey);

  try {
    const account = await stripe.rawRequest("GET", "/v1/account");
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });

    let testCheckoutOk = false;
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: "https://paintnpete-portal.netlify.app/?deposit=success",
        cancel_url: "https://paintnpete-portal.netlify.app/?deposit=cancelled",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 100,
              product_data: { name: "Status probe" },
            },
            quantity: 1,
          },
        ],
      });
      testCheckoutOk = !!session.url;
    } catch (err) {
      testCheckoutOk = false;
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({
        ok: true,
        charges_enabled: !!account.charges_enabled,
        payouts_enabled: !!account.payouts_enabled,
        details_submitted: !!account.details_submitted,
        display_name: (account.settings && account.settings.dashboard && account.settings.dashboard.display_name) || "",
        statement_descriptor:
          (account.settings && account.settings.payments && account.settings.payments.statement_descriptor) || "",
        webhook_count: webhooks.data ? webhooks.data.length : 0,
        test_checkout_ok: testCheckoutOk,
      }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ ok: false, error: "stripe error" }),
    };
  }
};
