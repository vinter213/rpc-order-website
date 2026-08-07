"use strict";

/**
 * RPC account configuration.
 *
 * Keep only the PUBLIC Supabase Project URL and Publishable/anon key here.
 * Never place sb_secret, service_role, Resend API keys,
 * or Discord secrets in this browser file or in GitHub.
 */
window.RPC_AUTH_CONFIG = Object.freeze({
  supabaseUrl: "https://kltlmugbsyavyauexxyv.supabase.co",
  supabasePublishableKey: "sb_publishable_NCCF2witA7aP2Ln7y4MT8A_KnDMIZsD",

  // Public Storage bucket created by SUPABASE_ACCOUNT_SETUP.sql.
  avatarBucket: "avatars",

  // Leave empty to return to the current site automatically.
  // Production and local URLs must be added to Supabase Redirect URLs.
  oauthRedirectUrl: "",

  otpCooldownSeconds: 60,
  siteName: "RPC • RedPad Creator"
});
