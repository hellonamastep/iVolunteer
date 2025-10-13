"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

type AdminSignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function AdminSignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminSignupFormValues>({
    mode: "onChange",
  });

  const watchedFields = watch();

  const onSubmit = async (data: AdminSignupFormValues) => {
    const signupData = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: "admin" as any,
    };

    const success = await signup(signupData);
    if (success) {
      toast.success("Admin account created successfully!");
      router.push("/");
    } else {
      toast.error(
        "Admin signup failed. Please check your details and try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 font-['Manrope']">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -inset-2 bg-blue-400/20 rounded-2xl blur-sm animate-pulse"></div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          NAMASTEP <span className="text-blue-600">Admin</span>
        </h1>
        <p className="text-gray-600 text-sm text-center max-w-md">
          Platform Administration Portal
        </p>
      </div>

      {/* Admin Signup Card */}
      <div className="bg-white/95 backdrop-blur-sm w-full max-w-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Admin Registration
            </h2>
            <p className="text-gray-600 text-lg">
              Create your administrator account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name", { required: "Full name is required" })}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                    errors.name
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm animate-shake">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  placeholder="admin@namastep.org"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                    errors.email
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm animate-shake">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Minimum 8 characters" },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Must include uppercase, lowercase, and number",
                    },
                  })}
                  className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                    errors.password
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm animate-shake">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      val === watchedFields.password ||
                      "Passwords do not match",
                  })}
                  className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  {!errors.confirmPassword && watchedFields.confirmPassword && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm animate-shake">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Admin Account...
                </span>
              ) : (
                "Create Admin Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-gray-200 mt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-semibold hover:underline transition-colors"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
