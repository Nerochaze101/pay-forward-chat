import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = Deno.env.get("PAYSTACK_SECRET_KEY")!;

    // Verify Paystack signature
    const hash = createHmac("sha512", secret).update(body).digest("hex");
    if (hash !== signature) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event.event === "transfer.success") {
      const reference = event.data.reference;
      await adminClient
        .from("withdrawals")
        .update({ status: "completed", processed_at: new Date().toISOString() })
        .eq("id", reference);

      // Deduct balance from profile
      const { data: withdrawal } = await adminClient
        .from("withdrawals")
        .select("profile_id, amount")
        .eq("id", reference)
        .single();

      if (withdrawal) {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("balance")
          .eq("id", withdrawal.profile_id)
          .single();

        if (profile) {
          await adminClient
            .from("profiles")
            .update({ balance: Math.max(0, profile.balance - withdrawal.amount) })
            .eq("id", withdrawal.profile_id);
        }
      }
    } else if (event.event === "transfer.failed" || event.event === "transfer.reversed") {
      const reference = event.data.reference;
      await adminClient
        .from("withdrawals")
        .update({ status: "failed" })
        .eq("id", reference);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Server error", { status: 500 });
  }
});
