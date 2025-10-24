"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function VerifyEmailPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const email = (sp.get("email") || "").toLowerCase();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const disabled = otp.trim().length !== 6;

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  const submit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Verification failed");

      // success: BE also sets cookies; you are logged in
      toast.success("Email verified");
      router.replace("/"); // or dashboard
    } catch (e: any) {
      toast.error(e?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      setResending(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Could not resend");
      toast.success("Code sent");
    } catch (e: any) {
      toast.error(e?.message || "Resend failed");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Verify your email</h1>
        <p className="text-gray-600 text-sm">
          We sent a 6-digit code to <span className="font-semibold">{email}</span>. Enter it below.
        </p>

        <input
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full border rounded-lg p-3 tracking-widest text-center text-xl"
          placeholder="••••••"
        />

        <button
          disabled={disabled || loading}
          onClick={submit}
          className="w-full rounded-lg bg-emerald-600 text-white py-3 font-semibold disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>

        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="w-full rounded-lg border py-3 font-semibold"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>

        <button
          type="button"
          onClick={() => router.replace(`/register?email=${encodeURIComponent(email)}`)}
          className="w-full text-sm text-gray-500 underline pt-2"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}
