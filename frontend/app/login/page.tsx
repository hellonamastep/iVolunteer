"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import moscatt from "@/public/images/moscatt.png";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

type FormValues = {
  email: string;
  password: string;
  otp?: string;
};

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    mode: "onSubmit",
    shouldFocusError: false, // Prevent auto-focus that might cause issues
  });

  // const handleOtpChange = (index: number, value: string) => {
  //   if (value.length > 1) {
  //     value = value.charAt(0); // Only take first character
  //   }

  //   // Only allow numbers
  //   if (!/^\d*$/.test(value)) return;

  //   const newOtp = [...otp];
  //   newOtp[index] = value;
  //   setOtp(newOtp);

  //   // Auto-focus next input
  //   if (value && index < 5) {
  //     otpRefs.current[index + 1]?.focus();
  //   }

  //   // Auto-submit when all fields are filled
  //   if (newOtp.every((digit) => digit !== "") && index === 5) {
  //     handleSubmit(onSubmit)();
  //   }
  // };

  // const handleOtpKeyDown = (
  //   index: number,
  //   e: React.KeyboardEvent<HTMLInputElement>
  // ) => {
  //   if (e.key === "Backspace" && !otp[index] && index > 0) {
  //     // Move to previous input on backspace
  //     otpRefs.current[index - 1]?.focus();
  //   }
  // };

  // const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  //   e.preventDefault();
  //   const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
  //   if (/^\d+$/.test(pastedData)) {
  //     const newOtp = [...otp];
  //     for (let i = 0; i < pastedData.length && i < 6; i++) {
  //       newOtp[i] = pastedData[i];
  //     }
  //     setOtp(newOtp);

  //     // Focus the next empty input or last input
  //     const nextIndex = Math.min(pastedData.length, 5);
  //     otpRefs.current[nextIndex]?.focus();
  //   }
  // };

  // Fixed ref callback function
  // const setOtpRef = (index: number) => (el: HTMLInputElement | null) => {
  //   otpRefs.current[index] = el;
  // };

  const onSubmit = async (data: FormValues) => {
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success("Login successful!");
        router.push("/");
      }
      // Error toast is already shown by auth context
      // Don't throw or return anything that could cause issues
      return false; // Explicitly return false to prevent any default behavior
    } catch (error) {
      // Catch any unexpected errors
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
      return false; // Prevent default behavior
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#E9FDF1] to-[#E9FDF1]/80 font-['Manrope'] px-4 sm:px-6 lg:px-8 py-8">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-4 w-full max-w-xs sm:max-w-sm">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 mb-2">
          <Image
            src="/images/auth.png"
            alt="Namastep Logo"
            width={150}
            height={150}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <h1 className="text-[#50C878] font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-wide text-center">
          NAMASTEP
        </h1>
        <p className="text-gray-600 text-sm sm:text-md mt-1 text-center px-2">
          Make Doing Good Fun, Rewarding & Impactful
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-[#FFFDF9] w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl shadow-lg border border-[#f0f0f0] overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <div className="w-1/2 text-center py-3 font-semibold text-[#3ABBA5] border-b-2 border-[#3ABBA5] text-sm sm:text-base">
            Login
          </div>
          <Link
            href="/signup"
            className="w-1/2 text-center py-3 font-semibold text-gray-400 hover:text-[#3ABBA5] transition-all text-sm sm:text-base"
          >
            Sign Up
          </Link>
        </div>

        {/* Form Section */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmit)(e);
          }}
          className="px-8 pt-8 pb-10 text-gray-700"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 text-gray-800 text-center sm:text-left">
            Welcome Back!
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 text-center sm:text-left">
            Continue your journey to make an impact
          </p>

          {/* Email */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email",
                  },
                })}
                className={`w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 rounded-full border text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none text-sm sm:text-base ${
                  errors.email
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4 sm:mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs sm:text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm text-[#3ABBA5] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Min 6 characters" },
                })}
                className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 rounded-full border text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none text-sm sm:text-base ${
                  errors.password
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-center mt-4 rounded-md">
            <GoogleLogin
              onSuccess={async (credentialResponse: CredentialResponse) => {
                const success = await googleLogin(credentialResponse);
                if (success) {
                  toast.success("Login successful via Google!");
                  router.push("/");
                } else {
                  toast.error("Google login failed. Try again.");
                }
              }}
              onError={() => {
                toast.error("Google login failed. Try again.");
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-4 sm:py-3 bg-[#3ABBA5] text-white font-semibold rounded-full shadow-md hover:bg-[#36a894] transition-all duration-300 disabled:opacity-70 text-sm sm:text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pb-4 sm:pb-6 px-4">
          <p className="text-xs sm:text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#3ABBA5] font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
