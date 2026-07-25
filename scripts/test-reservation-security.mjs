#!/usr/bin/env node
/**
 * End-to-end security tests for public.create_reservation.
 * Runs against the live Supabase project using the anon key
 * (same key the browser uses — so this proves what an attacker sees).
 *
 * Usage: node scripts/test-reservation-security.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yuvugrgoadxbmfvebsiu.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dnVncmdvYWR4Ym1mdmVic2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzI4MjksImV4cCI6MjA3MTIwODgyOX0.BRFuekDb-TkxGlYHDwZfLuLyRkKkCLvaBb8oanhg2ck";

const sb = createClient(SUPABASE_URL, ANON);

const results = [];
const rec = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✅ PASS" : "❌ FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

// ---- helpers -----------------------------------------------------------
const rand = () => Math.random().toString(36).slice(2, 10);
const addDays = (baseISO, n) => {
  const d = new Date(baseISO + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

async function makeCustomer() {
  const email = `sec-test-${rand()}@example.invalid`;
  const { data, error } = await sb.rpc("create_or_get_customer", {
    p_email: email,
    p_first_name: "Sec",
    p_last_name: "Test",
    p_phone: "+37060000000",
    p_address: "Test 1, Druskininkai",
  });
  if (error) throw error;
  return data;
}

async function callCreate(overrides = {}) {
  const base = {
    p_customer_id: overrides.p_customer_id,
    p_car_id: overrides.p_car_id ?? "6", // Mercedes SLK — has tiered pricing
    p_start_date: overrides.p_start_date,
    p_end_date: overrides.p_end_date,
    p_pickup_time: "10:00",
    p_return_time: "10:00",
    p_insurance_code: null,
    p_service_codes: [],
    p_package_code: null,
    p_delivery_fee: 0,
    p_payment_method: "online",
    p_payment_provider: "stripe",
    p_status: "awaiting_payment",
    p_language: "lt",
    p_pricing_notes: null,
    ...overrides,
  };
  return sb.rpc("create_reservation", base);
}

// Use far-future dates to avoid colliding with real reservations
const FAR = new Date(Date.now() + (365 + Math.floor(Math.random()*3650)) * 86400000).toISOString().slice(0,10);
console.log("base test date:", FAR);

// ---- tests -------------------------------------------------------------
async function run() {
  const customer = await makeCustomer();
  console.log("test customer:", customer);

  // 1) Client cannot inject arbitrary price fields — the RPC signature
  //    does not accept them. Attempting to pass p_daily_rate should
  //    return a PostgREST error rather than a discount.
  {
    const { error } = await sb.rpc("create_reservation", {
      p_customer_id: customer,
      p_car_id: "6",
      p_start_date: addDays(FAR, 0),
      p_end_date: addDays(FAR, 1),
      p_pickup_time: "10:00",
      p_return_time: "10:00",
      // tamper attempt:
      p_daily_rate: 0.01,
      p_total_amount: 0.01,
    });
    rec(
      "client cannot pass p_daily_rate / p_total_amount",
      !!error,
      error?.message?.slice(0, 120) ?? ""
    );
  }

  // 2) Tier picking — 2 days = tier1 rate from DB
  {
    const { data, error } = await callCreate({
      p_customer_id: customer,
      p_start_date: addDays(FAR, 10),
      p_end_date: addDays(FAR, 11),
    });
    const dr = data?.daily_rate ? Number(data.daily_rate) : null;
    rec("tier1 (1-2 days) selected for Mercedes SLK", !error && dr === 120, `daily_rate=${dr}`);
  }

  // 3) Tier picking — 5 days = tier2
  {
    const { data, error } = await callCreate({
      p_customer_id: customer,
      p_start_date: addDays(FAR, 20),
      p_end_date: addDays(FAR, 24),
    });
    const dr = data?.daily_rate ? Number(data.daily_rate) : null;
    rec("tier2 (3-6 days) selected for Mercedes SLK", !error && dr === 110, `daily_rate=${dr}`);
  }

  // 4) Tier picking — 10 days = tier3
  {
    const { data, error } = await callCreate({
      p_customer_id: customer,
      p_start_date: addDays(FAR, 30),
      p_end_date: addDays(FAR, 39),
    });
    const dr = data?.daily_rate ? Number(data.daily_rate) : null;
    rec("tier3 (7+ days) selected for Mercedes SLK", !error && dr === 100, `daily_rate=${dr}`);
  }

  // 5) Invalid insurance code is rejected
  {
    const { error } = await callCreate({
      p_customer_id: customer,
      p_start_date: addDays(FAR, 50),
      p_end_date: addDays(FAR, 51),
      p_insurance_code: "nonexistent-hack",
    });
    rec("invalid insurance code rejected", !!error, error?.message?.slice(0, 120) ?? "");
  }

  // 6) Concurrent double-booking — only one succeeds
  {
    const s = addDays(FAR, 60);
    const e = addDays(FAR, 62);
    const [a, b] = await Promise.all([
      callCreate({ p_customer_id: customer, p_start_date: s, p_end_date: e }),
      callCreate({ p_customer_id: customer, p_start_date: s, p_end_date: e }),
    ]);
    const successes = [a, b].filter((r) => !r.error && r.data?.id).length;
    const conflictErrs = [a, b].filter((r) =>
      (r.error?.message || "").includes("DATE_CONFLICT")
    ).length;
    rec(
      "two concurrent bookings — exactly one succeeds",
      successes === 1 && conflictErrs === 1,
      `successes=${successes} conflicts=${conflictErrs}`
    );
  }

  // 7) check_car_availability reports the just-taken slot as unavailable
  {
    const s = addDays(FAR, 60);
    const e = addDays(FAR, 62);
    const { data, error } = await sb.rpc("check_car_availability", {
      p_car_id: "6",
      p_start_date: s,
      p_end_date: e,
    });
    rec(
      "check_car_availability blocks just-taken dates",
      !error && data?.available === false,
      `reason=${data?.reason}`
    );
  }

  // ---- summary ---------------------------------------------------------
  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} passed`);
  process.exit(passed === results.length ? 0 : 1);
}

run().catch((e) => {
  console.error("test runner crashed:", e);
  process.exit(2);
});
