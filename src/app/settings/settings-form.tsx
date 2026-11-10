"use client";

import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, Mail, Save, Sprout, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount } from "./actions";

type Notice = { text: string; success: boolean } | null;

type SettingsFormProps = {
  canDeleteAccount: boolean;
  email: string;
  fullName: string;
  username: string;
};

export default function SettingsForm({ canDeleteAccount, email: initialEmail, fullName: initialFullName, username: initialUsername }: SettingsFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [profileNotice, setProfileNotice] = useState<Notice>(null);
  const [emailNotice, setEmailNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [deleteNotice, setDeleteNotice] = useState<Notice>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileNotice(null);
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername && !/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      setProfileNotice({ text: "Use 3–30 letters, numbers, or underscores for your username.", success: false });
      return;
    }

    setIsSavingProfile(true);
    try {
      const { error } = await createClient().auth.updateUser({
        data: { full_name: fullName.trim(), username: normalizedUsername },
      });
      if (error) throw error;
      setUsername(normalizedUsername);
      setProfileNotice({ text: "Profile updated.", success: true });
      router.refresh();
    } catch (error) {
      setProfileNotice({ text: error instanceof Error ? error.message : "Could not update your profile.", success: false });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailNotice(null);
    if (email.trim().toLowerCase() === initialEmail.toLowerCase()) {
      setEmailNotice({ text: "Enter a different email address to make a change.", success: false });
      return;
    }

    setIsSavingEmail(true);
    try {
      const { error } = await createClient().auth.updateUser(
        { email: email.trim() },
        { emailRedirectTo: `${window.location.origin}/auth/callback` },
      );
      if (error) throw error;
      setEmailNotice({ text: "Check your inbox to confirm the email change.", success: true });
    } catch (error) {
      setEmailNotice({ text: error instanceof Error ? error.message : "Could not update your email.", success: false });
    } finally {
      setIsSavingEmail(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordNotice(null);
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ text: "The passwords do not match.", success: false });
      return;
    }

    setIsSavingPassword(true);
    try {
      const { error } = await createClient().auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice({ text: "Password updated.", success: true });
    } catch (error) {
      setPasswordNotice({ text: error instanceof Error ? error.message : "Could not update your password.", success: false });
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleDeleteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteNotice(null);
    setIsDeleting(true);
    try {
      const result = await deleteAccount(new FormData(event.currentTarget));
      if (result.error) {
        setDeleteNotice({ text: result.error, success: false });
        return;
      }
      router.replace("/");
      router.refresh();
    } catch (error) {
      setDeleteNotice({ text: error instanceof Error ? error.message : "Could not delete your account.", success: false });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="dashboard-shell settings-shell">
      <header className="dashboard-header">
        <Link className="brand-mark" href="/dashboard" aria-label="SpaciTech dashboard">
          <span className="brand-icon"><Sprout size={19} strokeWidth={1.8} /></span>
          <span>SpaciTech</span>
        </Link>
        <nav className="dashboard-actions" aria-label="Account navigation">
          <Link className="dashboard-action" href="/dashboard"><ArrowLeft aria-hidden="true" size={16} />Dashboard</Link>
          <form action={signOut}>
            <button className="text-button" type="submit">Sign out</button>
          </form>
        </nav>
      </header>

      <div className="settings-content">
        <div className="settings-intro">
          <p className="eyebrow">ACCOUNT SETTINGS</p>
          <h1 className="display-type">Your account</h1>
          <p>Manage your profile and sign-in details.</p>
        </div>

        <section className="settings-section" aria-labelledby="profile-heading">
          <div className="settings-section-copy">
            <h2 id="profile-heading">Profile</h2>
            <p>Update the name and username associated with your account.</p>
          </div>
          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <label className="field-label">
              Display name
              <input autoComplete="name" className="field-input" maxLength={80} onChange={(event) => setFullName(event.target.value)} value={fullName} />
            </label>
            <label className="field-label">
              Username
              <input autoCapitalize="none" autoComplete="username" className="field-input" maxLength={30} onChange={(event) => setUsername(event.target.value)} value={username} />
              <span className="settings-help">3–30 letters, numbers, or underscores.</span>
            </label>
            {profileNotice && <p className={`form-message${profileNotice.success ? " success" : ""}`} role="status">{profileNotice.text}</p>}
            <button className="primary-button settings-submit" disabled={isSavingProfile} type="submit">
              {isSavingProfile ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : <Save aria-hidden="true" size={16} />}
              Save profile
            </button>
          </form>
        </section>

        <section className="settings-section" aria-labelledby="email-heading">
          <div className="settings-section-copy">
            <h2 id="email-heading">Email address</h2>
            <p>Changing your email may require confirmation from your inbox.</p>
          </div>
          <form className="settings-form" onSubmit={handleEmailSubmit}>
            <label className="field-label">
              Email address
              <input autoComplete="email" className="field-input" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </label>
            {emailNotice && <p className={`form-message${emailNotice.success ? " success" : ""}`} role="status">{emailNotice.text}</p>}
            <button className="primary-button settings-submit" disabled={isSavingEmail} type="submit">
              {isSavingEmail ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : <Mail aria-hidden="true" size={16} />}
              Update email
            </button>
          </form>
        </section>

        <section className="settings-section" aria-labelledby="password-heading">
          <div className="settings-section-copy">
            <h2 id="password-heading">Password</h2>
            <p>Choose a new password with at least 8 characters.</p>
          </div>
          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <div className="settings-password-grid">
              <div className="password-field">
                <label className="field-label" htmlFor="settings-new-password">New password</label>
                <div className="password-control">
                  <input autoComplete="new-password" className="field-input" id="settings-new-password" minLength={8} onChange={(event) => setNewPassword(event.target.value)} required type={newPasswordVisible ? "text" : "password"} value={newPassword} />
                  <button aria-label={newPasswordVisible ? "Hide new password" : "Show new password"} aria-pressed={newPasswordVisible} className="password-toggle" onClick={() => setNewPasswordVisible((visible) => !visible)} type="button">
                    {newPasswordVisible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                  </button>
                </div>
              </div>
              <div className="password-field">
                <label className="field-label" htmlFor="settings-confirm-password">Confirm new password</label>
                <div className="password-control">
                  <input autoComplete="new-password" className="field-input" id="settings-confirm-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type={confirmPasswordVisible ? "text" : "password"} value={confirmPassword} />
                  <button aria-label={confirmPasswordVisible ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={confirmPasswordVisible} className="password-toggle" onClick={() => setConfirmPasswordVisible((visible) => !visible)} type="button">
                    {confirmPasswordVisible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                  </button>
                </div>
              </div>
            </div>
            {passwordNotice && <p className={`form-message${passwordNotice.success ? " success" : ""}`} role="status">{passwordNotice.text}</p>}
            <button className="primary-button settings-submit" disabled={isSavingPassword} type="submit">
              {isSavingPassword ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : <ArrowRight aria-hidden="true" size={16} />}
              Change password
            </button>
          </form>
        </section>

        <section className="settings-section settings-danger" aria-labelledby="delete-heading">
          <div className="settings-section-copy">
            <h2 id="delete-heading">Delete account</h2>
            <p>This permanently deletes your account and signs you out. This cannot be undone.</p>
          </div>
          <div className="settings-form">
            {!canDeleteAccount ? (
              <p className="setup-note">Account deletion needs the server-only <code>SUPABASE_SERVICE_ROLE_KEY</code> configured in the app environment.</p>
            ) : (
              <form className="settings-form" onSubmit={handleDeleteSubmit}>
                <label className="field-label">
                  Current password
                  <input autoComplete="current-password" className="field-input" minLength={8} name="currentPassword" onChange={(event) => setDeletePassword(event.target.value)} required type="password" value={deletePassword} />
                </label>
                <label className="field-label">
                  Type DELETE to confirm
                  <input autoComplete="off" className="field-input" name="confirmation" onChange={(event) => setDeleteConfirmation(event.target.value)} required value={deleteConfirmation} />
                </label>
                {deleteNotice && <p className="form-message" role="alert">{deleteNotice.text}</p>}
                <button className="primary-button danger-button settings-submit" disabled={isDeleting || deleteConfirmation !== "DELETE" || deletePassword.length < 8} type="submit">
                  {isDeleting ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : <Trash2 aria-hidden="true" size={16} />}
                  Delete account
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}