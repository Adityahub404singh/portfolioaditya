
import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Fingerprint,
  ArrowUpRight,
  Sparkles,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Code2,
  Database,
} from "lucide-react";

import {
  supabase,
  isSupabaseConfigured,
  adminEmail,
} from "../lib/supabase";

import { usePortfolio } from "../hooks/usePortfolio";

const styles = `
.admin-login-screen {
  --login-red: #ed3448;
  --login-red-light: #ff6475;
  --login-white: #f7f4f2;
  --login-muted: #a49b9a;
  --login-border: rgba(255,255,255,.12);
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  width: 100%;
  padding: 48px 22px;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: var(--login-white);
  background: transparent !important;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.admin-login-screen *,
.admin-login-screen *::before,
.admin-login-screen *::after {
  box-sizing: border-box;
}

.admin-login-screen::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse at 50% 42%,
      rgba(237,52,72,.17),
      transparent 48%
    ),
    linear-gradient(
      110deg,
      rgba(4,5,8,.40),
      rgba(4,5,8,.12),
      rgba(4,5,8,.48)
    );
}

.admin-login-screen::after {
  content: "";
  position: absolute;
  width: 540px;
  height: 540px;
  right: -210px;
  bottom: -250px;
  z-index: -1;
  border: 1px solid rgba(237,52,72,.15);
  border-radius: 50%;
  box-shadow:
    0 0 0 45px rgba(237,52,72,.025),
    0 0 0 90px rgba(237,52,72,.018),
    0 0 0 135px rgba(237,52,72,.012);
  pointer-events: none;
}

.admin-login-layout {
  width: min(1080px, 100%);
  display: grid;
  grid-template-columns: 1fr 440px;
  align-items: center;
  gap: clamp(35px, 7vw, 95px);
  position: relative;
  z-index: 2;
}

.admin-login-intro {
  max-width: 520px;
  padding: 30px 0;
  animation: adminIntroIn .8s cubic-bezier(.2,.8,.2,1) both;
}

.admin-login-back {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: rgba(255,255,255,.7);
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  transition: color .25s ease, transform .25s ease;
}

.admin-login-back:hover {
  color: #fff;
  transform: translateX(-4px);
}

.admin-login-intro-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 66px;
}

.admin-login-logo {
  width: 53px;
  height: 53px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 13px;
  background: linear-gradient(
    145deg,
    rgba(255,255,255,.13),
    rgba(255,255,255,.025)
  );
  box-shadow: 0 12px 35px rgba(0,0,0,.25);
  font-size: 17px;
  font-weight: 950;
  letter-spacing: -1px;
}

.admin-login-logo span {
  color: var(--login-red-light);
}

.admin-login-brand-copy strong {
  display: block;
  font-size: 13px;
  letter-spacing: -.2px;
}

.admin-login-brand-copy small {
  display: block;
  margin-top: 5px;
  color: var(--login-muted);
  font-size: 8px;
  letter-spacing: 1.6px;
}

.admin-login-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  color: var(--login-red-light);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 2.5px;
}

.admin-login-kicker::before {
  content: "";
  width: 24px;
  height: 1px;
  background: var(--login-red);
}

.admin-login-intro h1 {
  margin: 20px 0 17px;
  max-width: 510px;
  font-size: clamp(42px, 5.6vw, 76px);
  line-height: .98;
  letter-spacing: -4px;
  font-weight: 950;
  text-wrap: balance;
}

.admin-login-intro h1 em {
  display: block;
  color: var(--login-red-light);
  font-style: normal;
}

.admin-login-intro > p {
  max-width: 430px;
  color: rgba(238,231,230,.67);
  font-size: 13px;
  line-height: 1.95;
}

.admin-login-feature-list {
  display: grid;
  gap: 13px;
  margin-top: 36px;
}

.admin-login-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255,255,255,.75);
  font-size: 11px;
}

.admin-login-feature-icon {
  width: 33px;
  height: 33px;
  flex: 0 0 33px;
  display: grid;
  place-items: center;
  color: var(--login-red-light);
  border: 1px solid rgba(237,52,72,.22);
  border-radius: 9px;
  background: rgba(237,52,72,.075);
}

.admin-login-system {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 40px;
}

.admin-login-system span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 11px;
  border: 1px solid var(--login-border);
  border-radius: 6px;
  background: rgba(255,255,255,.035);
  color: #aaa2a1;
  font-size: 9px;
}

.admin-login-system svg {
  color: var(--login-red-light);
}

.admin-login-card {
  position: relative;
  width: 100%;
  padding: 34px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.17);
  border-radius: 20px;
  background:
    radial-gradient(
      ellipse at 100% 0%,
      rgba(237,52,72,.13),
      transparent 43%
    ),
    linear-gradient(
      145deg,
      rgba(30,27,29,.91),
      rgba(10,10,12,.91)
    );
  backdrop-filter: blur(28px) saturate(130%);
  -webkit-backdrop-filter: blur(28px) saturate(130%);
  box-shadow:
    0 35px 100px rgba(0,0,0,.5),
    0 0 70px rgba(237,52,72,.055),
    inset 0 1px 0 rgba(255,255,255,.09);
  animation: adminCardIn .85s cubic-bezier(.2,.8,.2,1) both;
  transform-style: preserve-3d;
}

.admin-login-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 12%;
  right: 12%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,.5),
    transparent
  );
}

.admin-login-card::after {
  content: "";
  position: absolute;
  width: 180px;
  height: 180px;
  top: -105px;
  right: -80px;
  border: 1px solid rgba(237,52,72,.18);
  border-radius: 50%;
  box-shadow: 0 0 0 22px rgba(237,52,72,.025);
  pointer-events: none;
}

.admin-login-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.admin-login-card-brand {
  font-size: 23px;
  font-weight: 950;
  letter-spacing: -1.5px;
}

.admin-login-card-brand span {
  color: var(--login-red-light);
}

.admin-login-secure {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid rgba(111,218,157,.18);
  border-radius: 30px;
  background: rgba(111,218,157,.07);
  color: #91e6b3;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .8px;
}

.admin-login-secure svg {
  width: 12px;
  height: 12px;
}

.admin-login-heading {
  position: relative;
  z-index: 1;
  margin: 34px 0 28px;
}

.admin-login-eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #ff7a88;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 2px;
}

.admin-login-eyebrow i {
  width: 20px;
  height: 1px;
  background: var(--login-red);
}

.admin-login-heading h2 {
  margin: 14px 0 10px;
  font-size: clamp(30px, 4vw, 39px);
  line-height: 1.06;
  letter-spacing: -1.8px;
  font-weight: 900;
}

.admin-login-heading h2 em {
  color: var(--login-red-light);
  font-style: normal;
}

.admin-login-heading p {
  margin: 0;
  color: var(--login-muted);
  font-size: 11px;
  line-height: 1.8;
}

.admin-login-form {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 19px;
}

.admin-login-field {
  display: grid;
  gap: 9px;
}

.admin-login-field > label {
  color: #e7dfdc;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: .4px;
}

.admin-login-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.admin-login-input-icon {
  position: absolute;
  left: 14px;
  width: 16px;
  height: 16px;
  color: #928889;
  pointer-events: none;
}

.admin-login-input {
  width: 100%;
  height: 49px;
  padding: 0 44px;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 9px;
  outline: none;
  background: rgba(255,255,255,.055);
  color: #fff;
  font: inherit;
  font-size: 12px;
  transition:
    border-color .25s ease,
    background .25s ease,
    box-shadow .25s ease;
}

.admin-login-input::placeholder {
  color: #82797a;
}

.admin-login-input:hover {
  border-color: rgba(255,255,255,.25);
}

.admin-login-input:focus {
  border-color: rgba(255,100,117,.75);
  background: rgba(237,52,72,.045);
  box-shadow: 0 0 0 4px rgba(237,52,72,.09);
}

.admin-login-input:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.admin-login-password-toggle {
  position: absolute;
  right: 9px;
  width: 33px;
  height: 33px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #a49b9a;
  cursor: pointer;
  transition: .2s ease;
}

.admin-login-password-toggle:hover {
  color: #fff;
  background: rgba(255,255,255,.08);
}

.admin-login-password-toggle:focus-visible {
  outline: 2px solid var(--login-red-light);
  outline-offset: 2px;
}

.admin-login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: -4px;
}

.admin-login-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #bcb4b2;
  font-size: 10px;
  cursor: pointer;
  user-select: none;
}

.admin-login-checkbox input {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--login-red);
  cursor: pointer;
}

.admin-login-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 13px;
  border: 1px solid rgba(255,89,105,.28);
  border-radius: 8px;
  background: rgba(237,52,72,.09);
  color: #ffabb4;
  font-size: 10px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.admin-login-error svg {
  flex: 0 0 15px;
  margin-top: 1px;
}

.admin-login-submit {
  position: relative;
  width: 100%;
  min-height: 51px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 9px;
  background: linear-gradient(110deg,#f04458,#c31735 75%,#9c1029);
  color: #fff;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: .3px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(195,23,53,.2);
  transition:
    transform .25s ease,
    box-shadow .25s ease,
    filter .25s ease;
}

.admin-login-submit::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 25%,
    rgba(255,255,255,.2),
    transparent 75%
  );
  transform: translateX(-110%);
  transition: transform .65s ease;
}

.admin-login-submit:hover:not(:disabled)::before {
  transform: translateX(110%);
}

.admin-login-submit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 17px 35px rgba(195,23,53,.32);
  filter: brightness(1.08);
}

.admin-login-submit:active:not(:disabled) {
  transform: translateY(-1px) scale(.99);
}

.admin-login-submit:disabled {
  opacity: .7;
  cursor: wait;
}

.admin-login-submit > * {
  position: relative;
  z-index: 1;
}

.admin-login-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,.09);
  color: #968d8c;
  font-size: 9px;
  line-height: 1.8;
}

.admin-login-footer svg {
  flex: 0 0 15px;
  color: #83dca5;
  margin-top: 2px;
}

.admin-login-bottom {
  position: absolute;
  bottom: 19px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255,255,255,.38);
  font-size: 8px;
  letter-spacing: 1.5px;
}

.admin-login-bottom span {
  color: var(--login-red-light);
}

.admin-login-screen a:focus-visible,
.admin-login-screen button:focus-visible {
  outline: 2px solid var(--login-red-light);
  outline-offset: 4px;
}

@keyframes adminIntroIn {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes adminCardIn {
  from {
    opacity: 0;
    transform: translateY(28px) rotateX(3deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

@media (max-width: 850px) {
  .admin-login-layout {
    grid-template-columns: 1fr 410px;
    gap: 30px;
  }

  .admin-login-intro h1 {
    font-size: clamp(39px, 6vw, 58px);
  }

  .admin-login-card {
    padding: 27px;
  }
}

@media (max-width: 680px) {
  .admin-login-screen {
    min-height: 100svh;
    padding: 35px 18px 65px;
  }

  .admin-login-layout {
    width: min(440px,100%);
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .admin-login-intro {
    padding: 0;
  }

  .admin-login-intro-brand {
    margin-top: 30px;
  }

  .admin-login-kicker {
    margin-top: 25px;
  }

  .admin-login-intro h1 {
    margin-top: 14px;
    font-size: clamp(40px, 11vw, 58px);
    letter-spacing: -2.5px;
  }

  .admin-login-intro > p {
    font-size: 12px;
  }

  .admin-login-feature-list,
  .admin-login-system {
    display: none;
  }

  .admin-login-card {
    padding: 25px 22px;
    border-radius: 16px;
  }

  .admin-login-heading {
    margin: 27px 0 24px;
  }

  .admin-login-bottom {
    position: relative;
    bottom: auto;
    margin-top: 30px;
  }
}

@media (max-width: 380px) {
  .admin-login-screen {
    padding-left: 13px;
    padding-right: 13px;
  }

  .admin-login-card {
    padding: 22px 17px;
  }

  .admin-login-heading h2 {
    font-size: 31px;
  }

  .admin-login-options {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-login-screen *,
  .admin-login-screen *::before,
  .admin-login-screen *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export default function AdminLogin() {
  const { session } = usePortfolio();
  const navigate = useNavigate();

  const [email, setEmail] = useState(adminEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (session) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Connect your Supabase project before signing in."
      );
      return;
    }

    if (!normalizedEmail || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    setBusy(true);

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (authError) {
        setError(
          authError.message ||
          "Sign in failed. Please check your credentials."
        );
        return;
      }

      if (!data?.session) {
        setError(
          "Authentication was not completed. Please try signing in again."
        );
        return;
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.message ||
        "Unable to sign in. Check your internet connection and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{styles}</style>

      <main className="admin-login-screen">
        <div className="admin-login-layout">

          {/* LEFT: INTRODUCTION */}

          <section className="admin-login-intro">
            <Link to="/" className="admin-login-back">
              <ArrowLeft size={15} />
              Back to public portfolio
            </Link>

            <div className="admin-login-intro-brand">
              <div className="admin-login-logo">
                APS<span>.</span>
              </div>

              <div className="admin-login-brand-copy">
                <strong>Aditya Pratap Singh</strong>
                <small>DEVELOPER · BUILDER · LEARNER</small>
              </div>
            </div>

            <div className="admin-login-kicker">
              PRIVATE WORKSPACE
            </div>

            <h1>
              Your work.
              <em>Your control.</em>
            </h1>

            <p>
              A private workspace to manage your portfolio,
              projects, technical progress, achievements and
              professional journey from one place.
            </p>

            <div className="admin-login-feature-list">
              <div className="admin-login-feature">
                <span className="admin-login-feature-icon">
                  <Database size={16} />
                </span>
                <span>Manage portfolio content and projects</span>
              </div>

              <div className="admin-login-feature">
                <span className="admin-login-feature-icon">
                  <Code2 size={16} />
                </span>
                <span>Update DSA progress and technical skills</span>
              </div>

              <div className="admin-login-feature">
                <span className="admin-login-feature-icon">
                  <ShieldCheck size={16} />
                </span>
                <span>Secure authentication powered by Supabase</span>
              </div>
            </div>

            <div className="admin-login-system">
              <span>
                <Terminal size={13} />
                ADMIN SYSTEM
              </span>
              <span>
                <Sparkles size={13} />
                PERSONAL WORKSPACE
              </span>
            </div>
          </section>

          {/* RIGHT: LOGIN CARD */}

          <section className="admin-login-card">
            <div className="admin-login-card-top">
              <div className="admin-login-card-brand">
                APS<span>.</span>
              </div>

              <div className="admin-login-secure">
                <ShieldCheck size={12} />
                SECURE AREA
              </div>
            </div>

            <div className="admin-login-heading">
              <div className="admin-login-eyebrow">
                <i />
                ADMIN ACCESS / 001
              </div>

              <h2>
                Welcome
                <br />
                <em>back.</em>
              </h2>

              <p>
                Sign in with your authorized administrator
                account to access your portfolio control room.
              </p>
            </div>

            <form
              className="admin-login-form"
              onSubmit={submit}
              noValidate={false}
            >
              <div className="admin-login-field">
                <label htmlFor="admin-email">
                  EMAIL ADDRESS
                </label>

                <div className="admin-login-input-wrap">
                  <Fingerprint
                    className="admin-login-input-icon"
                    size={16}
                  />

                  <input
                    id="admin-email"
                    name="email"
                    className="admin-login-input"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    disabled={busy}
                    required
                  />
                </div>
              </div>

              <div className="admin-login-field">
                <label htmlFor="admin-password">
                  PASSWORD
                </label>

                <div className="admin-login-input-wrap">
                  <LockKeyhole
                    className="admin-login-input-icon"
                    size={16}
                  />

                  <input
                    id="admin-password"
                    name="password"
                    className="admin-login-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    disabled={busy}
                    required
                  />

                  <button
                    type="button"
                    className="admin-login-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div className="admin-login-options">
                <label className="admin-login-checkbox">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(event.target.checked)
                    }
                    disabled={busy}
                  />
                  Show password
                </label>
              </div>

              {error && (
                <div className="admin-login-error" role="alert">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="admin-login-submit"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <LoaderCircle size={16} className="admin-login-spinner" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole size={16} />
                    <span>Enter Control Room</span>
                    <ArrowUpRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="admin-login-footer">
              <CheckCircle2 size={15} />
              <span>
                Protected administrator access. Authentication
                is handled by your configured Supabase project.
                Only authorized accounts should be used.
              </span>
            </div>
          </section>
        </div>

        <div className="admin-login-bottom">
          BUILT WITH PRECISION <span>·</span> APS PORTFOLIO
        </div>
      </main>
    </>
  );
}
