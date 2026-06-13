"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setRefCode(ref);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (refCode && data.user) {
      await supabase.from("profiles").update({ referred_by: refCode }).eq("id", data.user.id);
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-white text-center mb-2">Create your account</h1>
      <p className="text-zinc-400 text-center text-sm mb-8">Free forever. No credit card needed.</p>

      {refCode && (
        <div className="mb-4 text-xs text-center py-2 px-3 rounded-lg" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#fb923c" }}>
          You were referred by a Swiftbill user 🎉
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
        <Input label="Full name" type="text" placeholder="Alex Johnson" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">Create free account</Button>
        <p className="text-xs text-zinc-500 text-center">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline hover:text-zinc-300">Terms</Link>
          {" & "}
          <Link href="/privacy" className="underline hover:text-zinc-300">Privacy Policy</Link>
        </p>
      </form>

      <p className="text-center text-zinc-500 text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
