import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/app/auth-form";
import { createClient } from "@/lib/supabase/server";

export default function Home() {
  return (
    <Suspense fallback={<AuthForm />}>
      <AuthRedirect />
    </Suspense>
  );
}

async function AuthRedirect() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) redirect("/dashboard");
  }

  return (
    <AuthForm />
  );
}
