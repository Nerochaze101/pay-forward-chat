import { supabase } from "@/integrations/supabase/client";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUsername(profileId: string, username: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", profileId);
  if (error) throw error;
}

export async function getMessages(profileId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function sendAnonymousMessage(profileId: string, content: string) {
  const { error } = await supabase
    .from("messages")
    .insert({ profile_id: profileId, content });
  if (error) throw error;
}

export async function recordPageView(profileId: string) {
  const { error } = await supabase
    .from("page_views")
    .insert({ profile_id: profileId });
  if (error) throw error;
}

export async function getWithdrawals(profileId: string) {
  const { data, error } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function requestWithdrawal(
  profileId: string,
  amount: number,
  bankName: string,
  accountNumber: string,
  accountName: string
) {
  const { error } = await supabase
    .from("withdrawals")
    .insert({
      profile_id: profileId,
      amount,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
    });
  if (error) throw error;
}
