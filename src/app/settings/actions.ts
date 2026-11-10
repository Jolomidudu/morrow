"use server";

import "server-only";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function deleteAccount(formData: FormData) {
  if (formData.get("confirmation") !== "DELETE") {
    return { error: "Type DELETE to confirm account deletion." };
  }

  const password = formData.get("currentPassword");
  if (typeof password !== "string" || password.length < 8) {
    return { error: "Enter your current password to continue." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return { error: "Account deletion is not configured for this deployment." };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    return { error: "Your session could not be verified. Sign in again and retry." };
  }

  const { error: reauthenticationError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (reauthenticationError) {
    return { error: "Your current password could not be verified. The account was not deleted." };
  }

  const admin = createSupabaseAdminClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return { error: "The account could not be deleted. Please try again." };
  }

  await supabase.auth.signOut({ scope: "local" });
  return { success: true };
}