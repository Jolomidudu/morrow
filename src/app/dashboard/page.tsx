import { Suspense } from "react";
import { Mail, Sprout } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="dashboard-shell" aria-busy="true" />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const name = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "friend";

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand-mark" href="/" aria-label="SpaciTech home">
          <span className="brand-icon"><Sprout size={19} strokeWidth={1.8} /></span>
          <span>Spaci</span>
        </Link>
        <form action={signOut}>
          <button className="text-button" type="submit">Sign out</button>
        </form>
      </header>
      <section className="dashboard-content">
        <p className="eyebrow">YOUR SPACE</p>
        <h1 className="display-type">Good to see you, {name}.</h1>
        <p>Take a breath. You’re right where you need to be.</p>
        <div className="dashboard-email"><Mail aria-hidden="true" size={17} />{user.email}</div>
      </section>
    </main>
  );
}