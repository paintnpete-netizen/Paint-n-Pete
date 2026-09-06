/**
 * Client portal API — proxies to Apps Script (same web app as website booking).
 *
 * Env (Netlify site for portal.paintnpete.com):
 *   BOOKING_SCRIPT_URL or PORTAL_SCRIPT_URL — Apps Script /exec URL (key in query string)
 *   PORTAL_OPERATOR_KEY or WEBHOOK_SECRET — for portal_publish only (if not in URL)
 *   STRIPE_SECRET_KEY — Stripe secret key (sk_test_… or sk_live_…)
 */
const CORS_ORIGINS = [
  "https://paintnpete-hq.netlify.app",
  "https://portal.paintnpete.com",
  "https://paintnpete-portal.netlify.app",
  "http://localhost:8888",
  "http://127.0.0.1:8888",
];

function corsHeaders(event) {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || "";
  const allow = CORS_ORIGINS.indexOf(origin) >= 0 ? origin : CORS_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonHeaders(event) {
  return Object.assign(
    {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    corsHeaders(event)
  );
}
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

async function readScript(url, options) {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = ctrl
    ? setTimeout(function () {
        try {
          ctrl.abort();
        } catch (err) {}
      }, 25000)
    : null;
  try {
    const res = await fetch(
      url,
      Object.assign({ redirect: "follow", signal: ctrl ? ctrl.signal : undefined }, options || {})
    );
    const text = await res.text();
    try {
      return { status: res.status, data: JSON.parse(text) };
    } catch (err) {
      if (String(text).trim() === "ok") {
        return { status: res.status, data: { ok: false, error: "backend did not accept POST" } };
      }
      if (String(text).trim() === "forbidden") {
        return { status: 403, data: { ok: false, error: "forbidden" } };
      }
      const isHtml = /<!DOCTYPE html|<html|Inactivity Timeout/i.test(text);
      const error = isHtml
        ? "portal backend unavailable — Apps Script web app is not serving JSON"
        : "bad json";
      return { status: res.status, data: { ok: false, error: error } };
    }
  } catch (err) {
    const aborted = err && (err.name === "AbortError" || /abort/i.test(String(err && err.message)));
    return {
      status: 504,
      data: {
        ok: false,
        error: aborted
          ? "portal backend timed out — try again in a moment"
          : "portal backend unreachable",
      },
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function portalOrigin_(event) {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || "";
  if (origin && CORS_ORIGINS.indexOf(origin) >= 0) return origin;
  return process.env.PORTAL_PUBLIC_URL || "https://paintnpete-portal.netlify.app";
}

async function handleAcceptDeposit_(body, event, url) {
  const stripeKey = process.env.STRIPE_SECRET_KEY || "";
  if (!stripeKey) {
    return {
      ok: false,
      error:
        "Online card payments are not set up yet. Call 727-902-1986 to pay your deposit.",
    };
  }

  const prep = await readScript(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "portal_accept_deposit_prepare",
      session: body.session,
    }),
  });
  if (!prep.data || !prep.data.ok) {
    return prep.data || { ok: false, error: "could not prepare deposit" };
  }

  const origin = portalOrigin_(event);
  const successUrl = origin + "/?deposit=success";
  const cancelUrl = origin + "/?deposit=cancelled";

  const site = prep.data.site_address ? " · " + prep.data.site_address : "";
  const jobNumber = prep.data.job_number || "";
  const suffix = jobNumber.replace(/[^A-Za-z0-9-]/g, "").slice(0, 12) || "DEPOSIT";
  const Stripe = require("stripe");
  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: prep.data.client_email || undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: prep.data.deposit_cents,
          product_data: {
            name: "Deposit — Paint'n Pete",
            description:
              "50% deposit to schedule · " + jobNumber + site,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      job_number: jobNumber,
      payment_type: "deposit",
      client_name: prep.data.client_name || "",
    },
    payment_intent_data: {
      statement_descriptor_suffix: suffix,
      description: "Paint'n Pete deposit · " + jobNumber,
      metadata: {
        job_number: jobNumber,
        payment_type: "deposit",
      },
    },
    custom_text: {
      submit: {
        message:
          "This 50% deposit schedules your project. The remaining balance is due when the job is complete.",
      },
    },
    phone_number_collection: { enabled: true },
    billing_address_collection: "auto",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { ok: true, checkout_url: session.url };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event), body: "" };
  }

  const headers = jsonHeaders(event);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: "POST only" }) };
  }

  const url = scriptUrl();
  if (!url) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ ok: false, error: "portal api not configured" }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "bad json" }) };
  }

  const action = String(body.action || "");
  // Never proxy ops_* through the public portal function (secrets / diagnostics).
  if (action.indexOf("ops_") === 0) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ ok: false, error: "forbidden" }),
    };
  }

  if (body.action === "portal_publish") {
    body.operator_key = operatorKey_();
  }
  if (body.action === "portal_admin_bootstrap") {
    body.operator_key = operatorKey_();
  }
  if (body.action === "portal_setup_tabs") {
    body.operator_key = operatorKey_();
  }

  if (action === "portal_accept_deposit") {
    try {
      const data = await handleAcceptDeposit_(body, event, url);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          ok: false,
          error: "Could not start checkout. Try again or call 727-902-1986.",
        }),
      };
    }
  }

  const result = await readScript(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (result.status === 403 || result.data === "forbidden" || result.data.raw === "forbidden") {
    return { statusCode: 403, headers, body: JSON.stringify({ ok: false, error: "forbidden" }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.data),
  };
};
