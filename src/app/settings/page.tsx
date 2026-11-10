import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";

export default function SettingsPage() {
  return (
    <Suspense fallback={<main className="dashboard-shell" aria-busy="true" />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <SettingsForm
      canDeleteAccount={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}
      email={user.email ?? ""}
      fullName={typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : ""}
      username={typeof user.user_metadata.username === "string" ? user.user_metadata.username : ""}
    />
  );
}