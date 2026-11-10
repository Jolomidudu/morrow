"use client";

import { ArrowRight, Eye, EyeOff, LoaderCircle, Mail, Sprout } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup" | "reset";

const modeCopy: Record<AuthMode, { title: string; description: string; button: string }> = {
  signin: {
    title: "Welcome To Morrow",
    description: "Pick up where you left off.",
    button: "Sign in",
  },
  signup: {
    title: "A fresh beginning",
    description: "Create an account to find your space here.",
    button: "Create account",
  },
  reset: {
    title: "A way back in",
    description: "We’ll send you a link to reset your password.",
    button: "Send reset link",
  },
};

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const copy = modeCopy[mode];

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setIsPasswordVisible(false);
    setMessage("");
    setIsSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/dashboard");
          return;
        }
        setMessage("Check your inbox for a confirmation link to finish creating your account.");
        setIsSuccess(true);
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/dashboard");
        return;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });
        if (error) throw error;
        setMessage("If an account exists for that email, a reset link is on its way.");
        setIsSuccess(true);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-main">
        <Link className="brand-mark" href="/" aria-label="Morrow home">
          <span className="brand-icon"><Sprout size={19} strokeWidth={1.8} /></span>
          <span>Morrow</span>
        </Link>

        <div className="auth-content">
          <p className="eyebrow">A PLACE TO BEGIN AGAIN</p>
          <h1 className="auth-title display-type">{copy.title}</h1>
          <p className="auth-description">{copy.description}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label className="field-label">
                Your name
                <input
                  autoComplete="name"
                  className="field-input"
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Alex Morgan"
                  required
                  value={name}
                />
              </label>
            )}

            <label className="field-label">
              Email address
              <input
                autoComplete="email"
                className="field-input"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </label>

            {mode !== "reset" && (
              <div className="password-field">
                <label className="field-label" htmlFor="auth-password">Password</label>
                <div className="password-control">
                  <input
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="field-input"
                    id="auth-password"
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
            )}

            {mode === "signin" && (
              <div className="form-row">
                <button className="text-button" onClick={() => changeMode("reset")} type="button">
                  Forgot password?
                </button>
              </div>
            )}

            {message && <p className={`form-message${isSuccess ? " success" : ""}`} role="status">{message}</p>}

            <button className="primary-button" disabled={isLoading || !isConfigured} type="submit">
              {isLoading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : <Mail aria-hidden="true" size={16} />}
              {copy.button}
              {!isLoading && <ArrowRight aria-hidden="true" size={16} />}
            </button>
          </form>

          {mode === "reset" ? (
            <p className="auth-switch">
              Remember your password?{" "}
              <button className="text-button" onClick={() => changeMode("signin")} type="button">Sign in</button>
            </p>
          ) : (
            <p className="auth-switch">
              {mode === "signin" ? "New around here?" : "Already have an account?"}{" "}
              <button className="text-button" onClick={() => changeMode(mode === "signin" ? "signup" : "signin")} type="button">
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          )}

          {!isConfigured && (
            <p className="setup-note">
              Add your Supabase URL and publishable key to <code>.env.local</code> to enable authentication.
            </p>
          )}
        </div>

        <span className="eyebrow">© MORROW</span>
      </section>

      <aside className="auth-aside" aria-label="Morrow">
        <span className="aside-kicker">A quieter kind of progress</span>
        <div className="artwork" aria-hidden="true">
          <span className="artwork-leaf" />
          <span className="artwork-stem" />
        </div>
        <div className="aside-copy">
          <h2 className="display-type">Make room for what matters.</h2>
          <p>A little space to gather your thoughts and begin again, whenever you need.</p>
        </div>
        <div className="aside-foot"><span>TAKE IT AT YOUR PACE</span><span>01 — 01</span></div>
      </aside>
    </main>
  );
}