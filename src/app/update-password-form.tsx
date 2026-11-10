"use client";

import { ArrowRight, Eye, EyeOff, LoaderCircle, Sprout } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) throw error;
      router.replace("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update your password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-main">
        <Link className="brand-mark" href="/" aria-label="SpaciMore home">
          <span className="brand-icon"><Sprout size={19} strokeWidth={1.8} /></span>
          <span>SpaciMore</span>
        </Link>
        <div className="auth-content">
          <p className="eyebrow">ONE LAST STEP</p>
          <h1 className="auth-title display-type">Choose a new password</h1>
          <p className="auth-description">Make it something only you know.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="password-field">
              <label className="field-label" htmlFor="new-password">New password</label>
              <div className="password-control">
                <input
                  autoComplete="new-password"
                  className="field-input"
                  id="new-password"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  aria-pressed={isPasswordVisible}
                  className="password-toggle"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  title={isPasswordVisible ? "Hide password" : "Show password"}
                  type="button"
                >
                  {isPasswordVisible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
              </div>
            </div>
            {message && <p className="form-message" role="alert">{message}</p>}
            <button className="primary-button" disabled={isLoading || !isConfigured} type="submit">
              {isLoading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : null}
              Update password
              {!isLoading && <ArrowRight aria-hidden="true" size={16} />}
            </button>
          </form>
          {!isConfigured && <p className="setup-note">Add your Supabase URL and publishable key to <code>.env.local</code> to enable authentication.</p>}
        </div>
        <span className="eyebrow">© SpaciMore</span>
      </section>
      <aside className="auth-aside" aria-hidden="true">
        <span className="aside-kicker">A quieter kind of progress</span>
        <div className="artwork"><span className="artwork-leaf" /><span className="artwork-stem" /></div>
        <div className="aside-copy"><h2 className="display-type">Make room for what matters.</h2></div>
        <div className="aside-foot"><span>TAKE IT AT YOUR PACE</span><span>01 — 01</span></div>
      </aside>
    </main>
  );
}