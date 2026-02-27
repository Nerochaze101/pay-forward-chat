import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { withdrawalId } = await req.json();

    if (!withdrawalId) {
      return new Response(JSON.stringify({ error: "withdrawalId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to process the withdrawal
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the user is an admin
    const { data: adminRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the withdrawal
    const { data: withdrawal, error: wErr } = await adminClient
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();

    if (wErr || !withdrawal) {
      return new Response(JSON.stringify({ error: "Withdrawal not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (withdrawal.status !== "pending") {
      return new Response(JSON.stringify({ error: "Already processed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY")!;

    // Step 1: Resolve bank account
    const bankListRes = await fetch("https://api.paystack.co/bank?currency=NGN", {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const bankListData = await bankListRes.json();
    const bank = bankListData.data?.find(
      (b: any) => b.name.toLowerCase() === withdrawal.bank_name.toLowerCase()
    );

    if (!bank) {
      return new Response(
        JSON.stringify({ error: `Bank "${withdrawal.bank_name}" not found on Paystack. Check the bank name.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Create transfer recipient
    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: withdrawal.account_name,
        account_number: withdrawal.account_number,
        bank_code: bank.code,
        currency: "NGN",
      }),
    });
    const recipientData = await recipientRes.json();

    if (!recipientData.status) {
      return new Response(
        JSON.stringify({ error: recipientData.message || "Failed to create recipient" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Initiate transfer (amount in kobo)
    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: withdrawal.amount * 100,
        recipient: recipientData.data.recipient_code,
        reason: `WhisperBox withdrawal #${withdrawal.id.slice(0, 8)}`,
        reference: withdrawal.id,
      }),
    });
    const transferData = await transferRes.json();

    if (!transferData.status) {
      return new Response(
        JSON.stringify({ error: transferData.message || "Transfer failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update withdrawal status to processing
    await adminClient
      .from("withdrawals")
      .update({ status: "processing" })
      .eq("id", withdrawalId);

    return new Response(
      JSON.stringify({ success: true, message: "Transfer initiated", transfer: transferData.data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
