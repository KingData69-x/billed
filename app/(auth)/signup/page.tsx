"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-white text-center mb-2">Create your account</h1>
      <p className="text-zinc-400 text-center text-sm mb-8">Free forever. No credit card needed.</p>

      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Alex Johnson"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create free account
        </Button>
        <p className="text-xs text-zinc-500 text-center">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline hover:text-zinc-300">Terms</Link>
          {" & "}
          <Link href="/privacy" className="underline hover:text-zinc-300">Privacy Policy</Link>
        </p>
      </form>

      <p className="text-center text-zinc-500 text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
