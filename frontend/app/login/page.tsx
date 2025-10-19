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

type FormValues = {
  email: string;
  password: string;
  otp?: string;
};

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  // const [otpSent, setOtpSent] = useState(false);
  // const [emailForOtp, setEmailForOtp] = useState("");
  // const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  // const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#E9FDF1] to-[#E9FDF1]/80 font-['Manrope']">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-4">
        <Image
          src="/images/auth.png"
          alt="Namastep Logo"
          width={150} // optional but recommended
          height={150} // optional but recommended
          priority // optional (for above-the-fold images)
        />
        <h1 className="text-[#50C878] font-extrabold text-2xl tracking-wide">
          NAMASTEP
        </h1>
        <p className="text-gray-600 text-md mt-1 text-center">
          Make Doing Good Fun, Rewarding & Impactful
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-[#FFFDF9] w-full max-w-md rounded-2xl shadow-lg border border-[#f0f0f0] overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <div className="w-1/2 text-center py-3 font-semibold text-[#3ABBA5] border-b-2 border-[#3ABBA5]">
            Login
          </div>
          <Link
            href="/signup"
            className="w-1/2 text-center py-3 font-semibold text-gray-400 hover:text-[#3ABBA5] transition-all"
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
          <h2 className="text-xl font-semibold mb-1 text-gray-800">
            Welcome Back!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Continue your journey to make an impact
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
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email",
                  },
                })}
                className={`w-full pl-10 pr-3 py-3 rounded-full border text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none ${
                  errors.email
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Min 6 characters" },
                })}
                className={`w-full pl-10 pr-10 py-3 rounded-full border text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none ${
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
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* OTP Field (Visible After Sending) */}
          {/* {otpSent && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-center">
                Enter 6-digit OTP <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-center gap-2 mb-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={setOtpRef(index)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-[#3ABBA5] focus:ring-2 focus:ring-[#3ABBA5] outline-none transition-all"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div> */}
          {/* )} */}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
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
        <div className="text-center pb-6">
          <p className="text-sm text-gray-500">
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
