"use client";

import { useState, FormEvent } from "react";
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
    <div className="min-h-screen bg-va-bg flex items-center justify-center p-4">
      {/* Dark navy hero strip at top */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-va-hero z-50" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-semibold text-va-navy tracking-tight">Ventures Accelerated</h1>
          <div className="mt-3 w-16 h-0.5 bg-va-accent mx-auto" />
          <p className="mt-4 font-body text-va-text-muted text-sm tracking-widest uppercase">Customer Portal</p>
        </div>

        <div className="bg-va-surface rounded-card border border-va-border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <div className="p-3 bg-va-red/5 border border-va-red/20 rounded-card"><p className="text-sm text-va-red font-body">{error}</p></div>}
            <Button type="submit" variant="navy" size="lg" loading={loading} className="w-full mt-2">Sign In</Button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs font-body text-va-text-muted">Skeppsbron 10, Stockholm, Sweden</p>
      </div>
    </div>
  );
}
