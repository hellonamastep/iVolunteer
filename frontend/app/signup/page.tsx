"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building2,
  HeartHandshake,
  CheckCircle,
  Globe,
  Phone,
  Calendar,
  MapPin,
  Users,
  Target,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  // volunteer-specific
  age?: number;
  city?: string;
  profession?: string;
  professionOther?: string; // For when "other" is selected
  contactNumber?: string;
  nearestRailwayStation?: string;
  // ngo-specific
  organizationType?: string;
  websiteUrl?: string;
  yearEstablished?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  ngoDescription?: string;
  focusAreas?: string[];
  organizationSize?: string;
};

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
    setValue,
    setError,
    clearErrors,
  } = useForm<SignupFormValues>({
    mode: "onChange",
  });

  const roleOptions = [
    { value: "user", label: "Volunteer", icon: HeartHandshake },
    { value: "ngo", label: "NGO", icon: Building2 },
  ];

  // Match exact backend enum values for focus areas
  const focusAreaOptions = [
    "environment",
    "education",
    "health",
    "poverty",
    "children",
    "elderly",
    "animal-welfare",
    "disaster-relief",
    "community-development",
    "women-empowerment",
    "skill-development",
    "other",
  ];

  // Match exact backend enum values for organization size
  const organizationSizeOptions = ["1-10", "11-50", "51-100", "101-500", "500+"];

  const selectedRole = watch("role");
  const watchedFields = watch();
  const selectedProfession = watch("profession");
  const emailValue = watch("email");

  // Check if email already exists
  const checkEmailExists = async (email: string) => {
    if (!email || !/^\S+@\S+$/i.test(email)) return;
    
    setEmailCheckLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.exists) {
        setEmailExists(true);
        setError("email", {
          type: "manual",
          message: "This email is already registered. Please login instead.",
        });
      } else {
        setEmailExists(false);
        clearErrors("email");
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  // Debounce email check
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (emailValue && emailValue.length > 0) {
        checkEmailExists(emailValue);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [emailValue]);

  const steps = [
    { number: 1, title: "Account Type", fields: ["role"] },
    {
      number: 2,
      title: "Basic Info",
      fields: ["name", "email", "age", "city"],
    },
    ...(selectedRole === "user"
      ? [
          {
            number: 3,
            title: "Personal Details",
            fields: ["password", "confirmPassword", "contactNumber", "nearestRailwayStation", "profession"],
          },
        ]
      : []),
    ...(selectedRole === "ngo"
      ? [
          {
            number: 3,
            title: "Organization Info",
            fields: ["organizationType", "contactNumber", "ngoDescription"],
          },
          {
            number: 4,
            title: "Additional Details",
            fields: ["organizationSize", "focusAreas", "address"],
          },
        ]
      : []),
    { number: selectedRole === "ngo" ? 5 : 4, title: "Complete" },
  ];

  const handleNext = async () => {
    const currentStepFields = steps[activeStep - 1].fields;
    const isValid = await trigger(currentStepFields as any);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const toggleFocusArea = (area: string) => {
    const newFocusAreas = selectedFocusAreas.includes(area)
      ? selectedFocusAreas.filter((a) => a !== area)
      : [...selectedFocusAreas, area];

    setSelectedFocusAreas(newFocusAreas);
    setValue("focusAreas", newFocusAreas, { shouldValidate: true });
  };

  // Validate description word count - FIXED VERSION
  const validateDescription = (value: string | undefined) => {
    if (!value || value.trim() === "") return "Description is required";
    const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 10) return "Description must be at least 10 words";
    return true;
  };

 const onSubmit = async (data: SignupFormValues) => {
  try {
    const payload: any = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    };

    if (data.role === "ngo") {
      payload.organizationType = data.organizationType;
      payload.websiteUrl = data.websiteUrl;
      payload.yearEstablished = data.yearEstablished ? Number(data.yearEstablished) : undefined;
      payload.contactNumber = data.contactNumber;
      payload.address = {
        street: data.address?.street || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        zip: data.address?.zip || "",
        country: data.address?.country || "India",
      };
      payload.ngoDescription = data.ngoDescription;
      payload.focusAreas = data.focusAreas || [];
      payload.organizationSize = data.organizationSize;
    } else if (data.role === "user") {
      payload.age = data.age ? Number(data.age) : undefined;
      payload.city = data.city || "";
      payload.profession = data.profession === "other" ? data.professionOther : data.profession;
      payload.contactNumber = data.contactNumber || "";
      payload.nearestRailwayStation = data.nearestRailwayStation || "";
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // receive cookies if your BE sets any
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Signup failed");

    // Backend returns message: "Registered. Check email for verification code."
    // Go to OTP screen with email in query
    toast.success("Account created. Check your email for the code.");
    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
  } catch (err: any) {
    const msg = err?.message?.toLowerCase?.() || "";
    if (msg.includes("already")) {
      toast.error("Account already exists. Please login.");
      setTimeout(() => router.push("/login"), 1200);
    } else {
      toast.error(err?.message || "Signup failed");
    }
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-[#E9FDF1] via-[#F0FDF4] to-[#E9FDF1] font-['Manrope']">
      {/* Header - Responsive */}
      <div className="flex flex-col items-center mb-4 sm:mb-6 lg:mb-8">
        <div className="relative">
          <Image
            src="/images/loginmascot.gif"
            alt="Namastep Logo"
            width={80}
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
            priority
          />
        </div>
        <h1 className="text-[#50C878] font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-wide">
          NAMASTEP
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm lg:text-base mt-1 text-center max-w-xs sm:max-w-sm">
          Make Doing Good Fun, Rewarding & Impactful
        </p>
      </div>

      {/* Signup Card - Responsive */}
      <div className="bg-white/95 backdrop-blur-sm w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Progress Steps - Responsive */}
          <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center min-w-12 sm:min-w-16">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-300 ${
                        activeStep >= step.number
                          ? "bg-[#3ABBA5] text-white shadow-md sm:shadow-lg"
                          : "bg-gray-200 text-gray-400"
                      } ${
                        activeStep === step.number
                          ? "ring-2 sm:ring-4 ring-[#3ABBA5]/20 scale-110"
                          : ""
                      }`}
                    >
                      {activeStep > step.number ? "✓" : step.number}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs lg:text-sm mt-1 font-medium text-center ${
                        activeStep >= step.number ? "text-[#3ABBA5]" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-4 h-1 sm:w-6 sm:h-1 lg:w-12 lg:h-1 rounded-full transition-all duration-300 ${
                        activeStep > step.number ? "bg-[#3ABBA5]" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-[#3ABBA5] to-[#50C878] bg-clip-text text-transparent">
              Join Our Community
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              {activeStep === 1 && "Choose your account type to get started"}
              {activeStep === 2 && "Tell us about yourself"}
              {activeStep === 3 && selectedRole === "user" && "Secure your account and additional details"}
              {activeStep === 3 && selectedRole === "ngo" && "Organization information"}
              {activeStep === 4 && selectedRole === "ngo" && "Additional details"}
              {activeStep === (selectedRole === "ngo" ? 5 : 4) && "Complete your profile"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Step 1: Role Selection - Responsive */}
            {activeStep === 1 && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedRole === opt.value;

                    return (
                      <label key={opt.value} className="cursor-pointer group">
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("role", {
                            required: "Please select a role",
                          })}
                          className="hidden"
                        />
                        <div
                          className={`relative p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border-2 transition-all duration-200 group-hover:scale-[1.02] sm:group-hover:scale-105 ${
                            isSelected
                              ? "border-[#3ABBA5] bg-[#3ABBA5]/5 shadow-md sm:shadow-lg"
                              : "border-gray-200 bg-white hover:border-[#3ABBA5]/50"
                          }`}
                        >
                          <div className="flex sm:flex-col items-center sm:items-center space-x-3 sm:space-x-0 sm:space-y-2 lg:space-y-3">
                            <div
                              className={`p-2 sm:p-3 lg:p-4 rounded-full transition-colors ${
                                isSelected ? "bg-[#3ABBA5] text-white" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                            </div>
                            <div className="flex-1 sm:text-center">
                              <h3 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg">{opt.label}</h3>
                              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                                {opt.value === "user" ? "Individual volunteer" : "Register organization"}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#3ABBA5]" />
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.role && <p className="text-red-500 text-xs sm:text-sm text-center animate-shake">{errors.role.message}</p>}
              </div>
            )}

            {/* Step 2: Basic Information - Responsive */}
            {activeStep === 2 && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {/* Name Field */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      {selectedRole === "ngo" ? "Organization Name" : "Full Name"} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <input
                        type="text"
                        placeholder={selectedRole === "ngo" ? "Organization name" : "Your full name"}
                        {...register("name", {
                          required: "This field is required",
                        })}
                        className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.name ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.name.message}</p>}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-10 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.email ? "border-red-400" : emailExists ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                      {emailCheckLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {!emailCheckLoading && emailValue && !errors.email && !emailExists && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {errors.email && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.email.message}</p>}
                  </div>

                  {/* Volunteer-specific fields in Step 2 */}
                  {selectedRole === "user" && (
                    <>
                      <div className="space-y-1 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">Age *</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                          <input
                            type="number"
                            placeholder="e.g., 25"
                            {...register("age", {
                              required: "Age is required",
                              valueAsNumber: true,
                              min: { value: 13, message: "Must be at least 13 years old" },
                              max: { value: 120, message: "Invalid age" },
                            })}
                            className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                        </div>
                        {errors.age && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.age.message}</p>}
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">City *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                          <input
                            type="text"
                            placeholder="e.g., Mumbai, Delhi, Bangalore"
                            {...register("city", {
                              required: "City is required",
                              minLength: {
                                value: 2,
                                message: "City name must be at least 2 characters"
                              },
                              maxLength: {
                                value: 50,
                                message: "City name cannot exceed 50 characters"
                              },
                              pattern: {
                                value: /^[a-zA-Z\s\-'.]+$/,
                                message: "Please enter a valid city name (letters, spaces, hyphens, apostrophes only)"
                              },
                              validate: {
                                noNumbers: (value) => 
                                  !/\d/.test(value || "") || "City name cannot contain numbers",
                                noSpecialChars: (value) =>
                                  /^[a-zA-Z\s\-'.]+$/.test(value || "") || "City name contains invalid characters",
                                notOnlySpaces: (value) =>
                                  (value || "").trim().length > 0 || "City name cannot be only spaces",
                                validFormat: (value) => {
                                  const trimmed = (value || "").trim();
                                  return trimmed.length >= 2 || "Please enter a valid city name";
                                }
                              }
                            })}
                            className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                        </div>
                        {errors.city && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.city.message}</p>}
                      </div>
                    </>
                  )}

                  {/* NGO-specific fields: Password fields only for NGOs in Step 2 */}
                  {selectedRole === "ngo" && (
                    <>
                      {/* Password Field */}
                      <div className="space-y-1 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("password", {
                              required: "Password is required",
                              minLength: {
                                value: 8,
                                message: "Minimum 8 characters",
                              },
                            })}
                            className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-8 sm:pr-10 lg:pr-12 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                              errors.password ? "border-red-400" : "border-gray-200"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.password.message}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">Confirm Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("confirmPassword", {
                              required: "Please confirm your password",
                              validate: (val) => val === watchedFields.password || "Passwords do not match",
                            })}
                            className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-8 sm:pr-10 lg:pr-12 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                              errors.confirmPassword ? "border-red-400" : "border-gray-200"
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
                            {!errors.confirmPassword && watchedFields.confirmPassword && <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />}
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                            </button>
                          </div>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.confirmPassword.message}</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Volunteer Personal Details - Responsive */}
            {activeStep === 3 && selectedRole === "user" && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-[#3ABBA5] mb-3 sm:mb-4 lg:mb-6 text-center">Secure Your Account & Additional Details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {/* Password Field */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 8,
                              message: "Minimum 8 characters",
                            },
                          })}
                          className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-8 sm:pr-10 lg:pr-12 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                            errors.password ? "border-red-400" : "border-gray-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (val) => val === watchedFields.password || "Passwords do not match",
                          })}
                          className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-8 sm:pr-10 lg:pr-12 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                            errors.confirmPassword ? "border-red-400" : "border-gray-200"
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
                          {!errors.confirmPassword && watchedFields.confirmPassword && <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />}
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </button>
                        </div>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.confirmPassword.message}</p>}
                    </div>

                    {/* Contact Number Field */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Contact Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type="tel"
                          placeholder="9876543210"
                          maxLength={10}
                          {...register("contactNumber", {
                            required: "Contact number is required",
                            pattern: {
                              value: /^[6-9]\d{9}$/,
                              message: "Please enter a valid 10-digit mobile number"
                            },
                            minLength: {
                              value: 10,
                              message: "Contact number must be exactly 10 digits"
                            },
                            maxLength: {
                              value: 10,
                              message: "Contact number must be exactly 10 digits"
                            }
                          })}
                          className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                      </div>
                      {errors.contactNumber && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.contactNumber.message}</p>}
                    </div>

                    {/* Nearest Railway Station Field */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Nearest Railway Station *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type="text"
                          placeholder="e.g., Mumbai Central"
                          {...register("nearestRailwayStation", {
                            required: "Nearest railway station is required",
                            maxLength: {
                              value: 100,
                              message: "Railway station name cannot exceed 100 characters"
                            }
                          })}
                          className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                      </div>
                      {errors.nearestRailwayStation && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.nearestRailwayStation.message}</p>}
                    </div>

                    {/* Profession Dropdown Field */}
                    <div className="space-y-1 sm:space-y-2 col-span-1 sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Profession *</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 z-10" />
                        <select
                          {...register("profession", {
                            required: "Profession is required",
                          })}
                          className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all appearance-none bg-white"
                        >
                          <option value="">Select your profession</option>
                          <option value="student">Student</option>
                          <option value="teacher">Teacher/Educator</option>
                          <option value="engineer">Engineer</option>
                          <option value="doctor">Doctor/Healthcare Professional</option>
                          <option value="nurse">Nurse</option>
                          <option value="software-developer">Software Developer/IT Professional</option>
                          <option value="designer">Designer</option>
                          <option value="accountant">Accountant</option>
                          <option value="lawyer">Lawyer</option>
                          <option value="business-owner">Business Owner</option>
                          <option value="manager">Manager</option>
                          <option value="sales-marketing">Sales/Marketing Professional</option>
                          <option value="consultant">Consultant</option>
                          <option value="artist">Artist/Creative Professional</option>
                          <option value="writer">Writer/Journalist</option>
                          <option value="social-worker">Social Worker</option>
                          <option value="government-employee">Government Employee</option>
                          <option value="retired">Retired</option>
                          <option value="homemaker">Homemaker</option>
                          <option value="freelancer">Freelancer</option>
                          <option value="entrepreneur">Entrepreneur</option>
                          <option value="researcher">Researcher/Scientist</option>
                          <option value="skilled-worker">Skilled Worker/Technician</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {errors.profession && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.profession.message}</p>}
                    </div>

                    {/* Conditional: If "other" is selected, show text input */}
                    {selectedProfession === "other" && (
                      <div className="space-y-1 sm:space-y-2 col-span-1 sm:col-span-2 animate-fadeIn">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">Please specify your profession *</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                          <input
                            type="text"
                            placeholder="Enter your profession"
                            {...register("professionOther", {
                              required: selectedProfession === "other" ? "Please specify your profession" : false,
                              maxLength: {
                                value: 100,
                                message: "Profession cannot exceed 100 characters"
                              }
                            })}
                            className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                        </div>
                        {errors.professionOther && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.professionOther.message}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: NGO Basic Details - Responsive */}
            {activeStep === 3 && selectedRole === "ngo" && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-[#3ABBA5] mb-3 sm:mb-4 lg:mb-6 text-center">Organization Information</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {/* Organization Type */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Organization Type *</label>
                      <select
                        {...register("organizationType", {
                          required: "Please select organization type",
                        })}
                        className="w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                      >
                        <option value="">Select type</option>
                        <option value="non-profit">Non-profit</option>
                        <option value="charity">Charity</option>
                        <option value="foundation">Foundation</option>
                        <option value="trust">Trust</option>
                        <option value="society">Society</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.organizationType && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.organizationType.message}</p>}
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Contact Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type="tel"
                          placeholder="9876543210"
                          maxLength={10}
                          {...register("contactNumber", {
                            required: "Contact number is required",
                            pattern: {
                              value: /^[6-9]\d{9}$/,
                              message: "Please enter a valid 10-digit mobile number"
                            },
                            minLength: {
                              value: 10,
                              message: "Contact number must be exactly 10 digits"
                            },
                            maxLength: {
                              value: 10,
                              message: "Contact number must be exactly 10 digits"
                            }
                          })}
                          className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                      </div>
                      {errors.contactNumber && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.contactNumber.message}</p>}
                    </div>

                    {/* Website */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type="url"
                          placeholder="https://example.com"
                          {...register("websiteUrl")}
                          className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Year Established */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">Year Established</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type="number"
                          placeholder="2010"
                          {...register("yearEstablished")}
                          className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Organization Description */}
                  <div className="space-y-1 sm:space-y-2 mt-3 sm:mt-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">Organization Description *</label>
                    <textarea
                      placeholder="Describe your organization's mission, vision, and activities (minimum 10 words)..."
                      rows={3}
                      {...register("ngoDescription", {
                        required: "Description is required",
                        validate: validateDescription
                      })}
                      className="w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none resize-none transition-all"
                    />
                    {errors.ngoDescription && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.ngoDescription.message}</p>}
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Current word count: {watchedFields.ngoDescription ? watchedFields.ngoDescription.trim().split(/\s+/).filter(word => word.length > 0).length : 0}/10
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: NGO Additional Details - Responsive */}
            {activeStep === 4 && selectedRole === "ngo" && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-[#3ABBA5] mb-3 sm:mb-4 lg:mb-6 text-center">Additional Details</h3>

                  {/* Organization Size */}
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">Organization Size *</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <select
                        {...register("organizationSize", {
                          required: "Organization size is required",
                        })}
                        className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                      >
                        <option value="">Select organization size</option>
                        {organizationSizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size} employees
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.organizationSize && <p className="text-red-500 text-xs sm:text-sm animate-shake">{errors.organizationSize.message}</p>}
                  </div>

                  {/* Focus Areas */}
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">Focus Areas * (Select at least one)</label>
                    <div className="relative">
                      <Target className="absolute left-3 top-2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <div className="pl-8 sm:pl-10 lg:pl-12">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 lg:gap-3">
                          {focusAreaOptions.map((area) => (
                            <label key={area} className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                value={area}
                                checked={selectedFocusAreas.includes(area)}
                                onChange={() => toggleFocusArea(area)}
                                className="hidden"
                              />
                              <div
                                className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded border flex items-center justify-center transition-all ${
                                  selectedFocusAreas.includes(area) ? "bg-[#3ABBA5] border-[#3ABBA5]" : "border-gray-300 bg-white"
                                }`}
                              >
                                {selectedFocusAreas.includes(area) && <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-white" />}
                              </div>
                              <span className="text-xs sm:text-sm text-gray-700">{area}</span>
                            </label>
                          ))}
                        </div>
                        {errors.focusAreas && <p className="text-red-500 text-xs sm:text-sm animate-shake mt-1">Please select at least one focus area</p>}
                        <input
                          type="hidden"
                          {...register("focusAreas", {
                            validate: (val) => (val && val.length > 0) || "Please select at least one focus area",
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">Address *</label>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="space-y-1 sm:space-y-2">
                        <input
                          type="text"
                          placeholder="Street Address"
                          {...register("address.street", {
                            required: "Street address is required",
                          })}
                          className="w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                        {errors.address?.street && <p className="text-red-500 text-xs sm:text-sm">{errors.address.street.message}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <div className="space-y-1 sm:space-y-2">
                          <input
                            type="text"
                            placeholder="City"
                            {...register("address.city", {
                              required: "City is required",
                              minLength: {
                                value: 2,
                                message: "City name must be at least 2 characters"
                              },
                              maxLength: {
                                value: 50,
                                message: "City name cannot exceed 50 characters"
                              },
                              pattern: {
                                value: /^[a-zA-Z\s\-'.]+$/,
                                message: "Please enter a valid city name"
                              },
                              validate: {
                                noNumbers: (value) => 
                                  !/\d/.test(value || "") || "City name cannot contain numbers",
                                notOnlySpaces: (value) =>
                                  (value || "").trim().length > 0 || "City name cannot be only spaces"
                              }
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                          {errors.address?.city && <p className="text-red-500 text-xs">{errors.address.city.message}</p>}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <input
                            type="text"
                            placeholder="State"
                            {...register("address.state", {
                              required: "State is required",
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                          {errors.address?.state && <p className="text-red-500 text-xs">{errors.address.state.message}</p>}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <input
                            type="text"
                            placeholder="ZIP Code"
                            {...register("address.zip", {
                              required: "ZIP code is required",
                              pattern: {
                                value: /^\d+$/,
                                message: "ZIP code must contain only digits"
                              }
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                          {errors.address?.zip && <p className="text-red-500 text-xs">{errors.address.zip.message}</p>}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <input
                            type="text"
                            placeholder="Country"
                            {...register("address.country", {
                              required: "Country is required",
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                          {errors.address?.country && <p className="text-red-500 text-xs">{errors.address.country.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5/4: Complete - Responsive */}
            {activeStep === (selectedRole === "ngo" ? 5 : 4) && (
              <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6 animate-fadeIn">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-green-500" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Ready to Join!</h3>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base max-w-xs sm:max-w-md mx-auto">
                    You're all set to create your {selectedRole === "ngo" ? "organization" : "volunteer"} account. Review your information and click create account to get started.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-left max-w-xs sm:max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-800 mb-2 text-xs sm:text-sm lg:text-base">Account Summary</h4>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <p><strong>Role:</strong> {selectedRole === "ngo" ? "NGO" : "Volunteer"}</p>
                    <p><strong>Name:</strong> {watchedFields.name}</p>
                    <p><strong>Email:</strong> {watchedFields.email}</p>
                    {selectedRole === "ngo" && (
                      <>
                        <p><strong>Organization Type:</strong> {watchedFields.organizationType}</p>
                        <p><strong>Contact:</strong> {watchedFields.contactNumber}</p>
                        <p><strong>Focus Areas:</strong> {selectedFocusAreas.join(", ")}</p>
                        <p><strong>Organization Size:</strong> {watchedFields.organizationSize}</p>
                      </>
                    )}
                    {selectedRole === "user" && (
                      <>
                        <p><strong>Age:</strong> {watchedFields.age}</p>
                        <p><strong>City:</strong> {watchedFields.city}</p>
                        <p><strong>Contact Number:</strong> {watchedFields.contactNumber}</p>
                        <p><strong>Nearest Railway Station:</strong> {watchedFields.nearestRailwayStation}</p>
                        <p><strong>Profession:</strong> {watchedFields.profession === "other" ? watchedFields.professionOther : watchedFields.profession}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons - Responsive */}
            <div className="flex justify-between pt-3 sm:pt-4 lg:pt-6 border-t border-gray-200">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {activeStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-[#3ABBA5] text-white font-semibold rounded-lg hover:bg-[#36a894] transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#3ABBA5] to-[#50C878] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link - Responsive */}
          <div className="text-center pt-3 sm:pt-4 lg:pt-6">
            <p className="text-gray-600 text-xs sm:text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#3ABBA5] font-semibold hover:underline transition-colors">
                Log in here
              </Link>
            </p>
            <p className="text-gray-600 text-xs sm:text-sm">
              Are you a corporate partner?{" "}
              <Link href="/corporatesignup" className="text-indigo-400 font-semibold hover:underline transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}