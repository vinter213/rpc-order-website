"use strict";

/**
 * RPC account authentication configuration.
 *
 * Paste ONLY the public Supabase Project URL and Publishable/anon key.
 * Never put a service_role key into a website file.
 */
window.RPC_AUTH_CONFIG = Object.freeze({
  supabaseUrl: "PASTE_SUPABASE_PROJECT_URL_HERE",
  supabasePublishableKey: "PASTE_SUPABASE_PUBLISHABLE_KEY_HERE",
  otpCooldownSeconds: 60,
  siteName: "RPC • RedPad Creator"
});
