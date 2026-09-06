#!/usr/bin/env node
/** Open Stripe activation in your default browser (logged-in session). */
import { execSync } from "child_process";

const ACCT = "acct_1U8o9bFgQoPneNp3";
const URL = `https://dashboard.stripe.com/${ACCT}/test/setup`;

console.log("Opening Stripe activation:", URL);
execSync(`open "${URL}"`, { stdio: "inherit" });
