"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); setLoading(false); return; }
      if (!data.user) { setError("Authentication failed"); setLoading(false); return; }
      const { data: userRole } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).single();
      router.push(userRole?.role === "admin" ? "/admin" : "/dashboard");
    } catch { setError("An unexpected error occurred"); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-va-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient accent strip */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-va-gradient z-50" />

      {/* Ambient gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(6,182,212,0.35) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <Image
            src="/va-accelerator-01.webp"
            alt="Ventures Accelerated"
            width={1456}
            height={816}
            priority
            className="h-28 w-auto mx-auto opacity-95"
          />
          <div className="mt-5 w-16 h-0.5 bg-va-gradient mx-auto rounded-full" />
          <p className="mt-4 font-body text-va-text-muted text-xs tracking-[0.25em] uppercase">
            Customer Portal
          </p>
        </div>

        <div className="bg-va-surface/80 backdrop-blur-xl rounded-card border border-va-border p-8 shadow-va-glow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div className="p-3 bg-va-red/10 border border-va-red/30 rounded-card">
                <p className="text-sm text-va-red font-body">{error}</p>
              </div>
            )}
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              Sign In
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs font-body text-va-text-muted">
          Skeppsbron 10, Stockholm, Sweden
        </p>
      </div>
    </div>
  );
}
