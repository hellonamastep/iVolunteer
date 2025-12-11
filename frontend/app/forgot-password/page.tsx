// app/(auth)/forgot-password/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import Logo from "@/components/logo";

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await api.post("/v1/auth/forget-password", { email: data.email });
      if (res.status < 200 || res.status >= 300) throw new Error("Request failed");
      toast.success("If an account exists, a password reset email was sent.");
      setEmailSent(true);
      reset();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#E9FDF1] to-[#E9FDF1]/80 font-['Manrope']">
      {/* Logo */}
      <div className="flex flex-col items-center mb-4">
        <Logo/>
        <p className="text-gray-600 text-md mt-1 text-center">Make Doing Good Fun, Rewarding & Impactful</p>
      </div>

      {/* Card */}
      <div className="bg-[#FFFDF9] w-full max-w-md rounded-2xl shadow-lg border border-[#f0f0f0] overflow-hidden">
        {/* Header */}
        <div className="flex border-b border-gray-100">
          <div className="w-full text-center py-3 font-semibold text-[#3ABBA5] border-b-2 border-[#3ABBA5]">
            Forgot Password
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pt-8 pb-10 text-gray-700">
          <h2 className="text-xl font-semibold mb-1 text-gray-800">Reset your password</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your registered email address. We’ll send you a link to reset your password.
          </p>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                className={`w-full pl-10 pr-3 py-3 rounded-full border text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none ${
                  errors.email ? "border-red-400 focus:ring-red-400" : "border-gray-300"
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#3ABBA5] text-white font-semibold rounded-full shadow-md hover:bg-[#36a894] transition-all duration-300 disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          {/* Message */}
          {emailSent && (
            <p className="text-center text-sm text-green-600 mt-4">
              If your email exists in our system, you will receive a reset link shortly.
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-sm text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="text-[#3ABBA5] font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
