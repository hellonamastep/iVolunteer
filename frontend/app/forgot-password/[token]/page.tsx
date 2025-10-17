"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

type FormValues = { password: string; passwordConfirm: string };

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>() || ({} as { token: string });
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>();

  const pwd = watch("password") || "";
  const pwdConfirm = watch("passwordConfirm") || "";

  const score = useMemo(() => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return Math.min(s, 4);
  }, [pwd]);

  const strengthLabel = ["Very weak", "Weak", "Good", "Strong", "Excellent"][score] || "Very weak";

  const onSubmit = async (data: FormValues) => {
    try {
      if (!token) throw new Error("Invalid or expired reset link");
      if (data.password !== data.passwordConfirm) throw new Error("Passwords do not match");

      const res = await api.post(`/v1/auth/reset-password/${token}`, {
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });

      if (res.status >= 200 && res.status < 300) {
        toast.success("Password reset successful");
        reset();
        router.push("/login");
        return;
      }
      throw new Error("Reset failed");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong";
      toast.error(msg);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#E9FDF1] to-[#E9FDF1]/80 font-['Manrope']">
        <div className="bg-white/80 backdrop-blur w-full max-w-md p-8 rounded-2xl shadow-lg text-center border border-[#f0f0f0]">
          <ShieldCheck className="mx-auto h-10 w-10 text-[#3ABBA5]" />
          <h2 className="mt-3 text-xl font-semibold text-gray-800">Invalid reset link</h2>
          <p className="text-gray-600 mt-1">Request a new password reset.</p>
          <Link href="/forgot-password" className="inline-flex items-center gap-2 mt-4 text-[#3ABBA5] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Go to Forgot password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#E9FDF1] to-[#E9FDF1]/80 font-['Manrope']">
      <div className="flex flex-col items-center mb-4">
        <Image
          src="/images/auth.png"
          alt="Namastep Logo"
          width={120}
          height={120}
          priority
          className="h-auto"
        />
        <h1 className="text-[#50C878] font-extrabold text-2xl tracking-wide">NAMASTEP</h1>
        <p className="text-gray-600 text-md mt-1 text-center">Make Doing Good Fun, Rewarding & Impactful</p>
      </div>

      <div className="bg-[#FFFDF9] w-full max-w-md rounded-2xl shadow-lg border border-[#f0f0f0] overflow-hidden">
        <div className="flex border-b border-gray-100">
          <div className="w-full text-center py-3 font-semibold text-[#3ABBA5] border-b-2 border-[#3ABBA5]">
            Reset Password
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pt-8 pb-10 text-gray-700">
          <h2 className="text-xl font-semibold mb-1 text-gray-800">Set a new password</h2>
          <p className="text-sm text-gray-500 mb-6">Choose a strong password to secure your account</p>

          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">
              New password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Enter new password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Min 8 characters" },
                })}
                className={`w-full pl-10 pr-10 py-3 rounded-full border text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none ${
                  errors.password ? "border-red-400 focus:ring-red-400" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}

            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-2 transition-all duration-300 ${
                    score <= 1
                      ? "bg-red-400 w-1/4"
                      : score === 2
                      ? "bg-yellow-400 w-2/4"
                      : score === 3
                      ? "bg-[#3ABBA5] w-3/4"
                      : "bg-emerald-600 w-full"
                  }`}
                />
              </div>
              <p className="text-xs mt-1 text-gray-500">Strength: {strengthLabel}</p>
              <ul className="text-xs mt-2 text-gray-500 list-disc pl-5 space-y-1">
                <li>At least 8 characters</li>
                <li>Use upper and lower case</li>
                <li>Add a number and a symbol</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPwd2 ? "text" : "password"}
                placeholder="Re-enter new password"
                {...register("passwordConfirm", {
                  required: "Confirmation is required",
                  validate: (v) => v === pwd || "Passwords do not match",
                })}
                className={`w-full pl-10 pr-10 py-3 rounded-full border text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none ${
                  errors.passwordConfirm ? "border-red-400 focus:ring-red-400" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPwd2((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPwd2 ? "Hide password" : "Show password"}
              >
                {showPwd2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.passwordConfirm && (
              <p className="text-red-500 text-sm mt-1">{String(errors.passwordConfirm.message)}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !pwd || !pwdConfirm}
            className="w-full py-3 bg-[#3ABBA5] text-white font-semibold rounded-full shadow-md hover:bg-[#36a894] transition-all duration-300 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Save new password"
            )}
          </button>

          <div className="text-center mt-6">
            <Link href="/login" className="text-sm text-[#3ABBA5] hover:underline inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
