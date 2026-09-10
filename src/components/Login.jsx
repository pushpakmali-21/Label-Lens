import React, { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setError("");
    onLogin({ email: email.trim(), password, rememberMe });
  };

  return (
    <main className="min-h-screen bg-ink text-text-1 flex items-center justify-center px-4 py-8 bg-grid-mesh">
      <section className="w-full max-w-md bg-panel border border-panel-line rounded-xl p-6 sm:p-8 shadow-glass">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-3xl font-serif italic">
            <span className="text-text-1">Label</span>
            <span className="bg-gradient-to-r from-brass to-citizen-primary bg-clip-text text-transparent font-bold">Lens</span>
          </div>
          <p className="text-xs font-mono uppercase tracking-wider text-brass mt-3">
            LMPC Compliance Verification System
          </p>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-serif text-text-1">Secure sign in</h1>
          <p className="text-sm text-text-2 mt-1">Access your LabelLens workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-xs font-mono uppercase text-text-3">Email</span>
            <div className="relative mt-2">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brass" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-panel-line bg-panel-darker py-3 pl-10 pr-3 text-sm text-text-1 placeholder:text-text-3 outline-none focus:border-brass"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-mono uppercase text-text-3">Password</span>
            <div className="relative mt-2">
              <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brass" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-panel-line bg-panel-darker py-3 pl-10 pr-11 text-sm text-text-1 placeholder:text-text-3 outline-none focus:border-brass"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-text-3 hover:text-brass"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm text-text-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="rounded border-panel-line text-brass focus:ring-brass"
            />
            Remember me
          </label>

          {error && <p className="text-sm text-status-fail">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-brass py-3 text-sm font-bold text-brass-ink hover:bg-brass-strong transition-colors"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
