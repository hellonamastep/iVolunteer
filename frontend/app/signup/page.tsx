


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
  Briefcase,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  // Volunteer-specific fields
  age?: number;
  city?: string;
  profession?: string;
  contactNumber?: string;
  nearestRailwayStation?: string;
  // NGO-specific fields
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
    setValue,
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

  const steps = [
    { number: 1, title: "Account Type", fields: ["role"] },
    {
      number: 2,
      title: "Basic Info",
      fields: selectedRole === "user" 
        ? ["name", "email", "age", "city", "profession", "contactNumber", "nearestRailwayStation", "password", "confirmPassword"]
        : ["name", "email", "password", "confirmPassword"],
    },
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
    { number: selectedRole === "ngo" ? 5 : 3, title: "Complete" },
  ];

  const handleNext = async () => {
    const currentStepFields = steps[activeStep - 1].fields;
    const isValid = await trigger(currentStepFields as any);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    } else {
      // Show error message when validation fails
      toast.error("Please fill in all required fields correctly to proceed to the next step.");
      
      // Scroll to top to see error messages
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Log validation errors for debugging
      console.log("Validation errors:", errors);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Get current step validation errors
  const getCurrentStepErrors = () => {
    const currentStepFields = steps[activeStep - 1]?.fields || [];
    const stepErrors: string[] = [];
    
    currentStepFields.forEach((field) => {
      if (field === 'address') {
        // Special handling for address field - check all nested address fields
        const addressError = errors.address;
        if (addressError && typeof addressError === 'object') {
          const addressFields = ['street', 'city', 'state', 'zip', 'country'];
          addressFields.forEach((addressField) => {
            const fieldError = (addressError as any)[addressField];
            if (fieldError?.message && typeof fieldError.message === 'string') {
              stepErrors.push(fieldError.message);
            }
          });
        }
      } else if (field.includes('.')) {
        // Handle other nested fields like address.street
        const [parent, child] = field.split('.');
        const parentError = errors[parent as keyof typeof errors];
        if (parentError && typeof parentError === 'object') {
          const childError = (parentError as any)[child];
          if (childError?.message && typeof childError.message === 'string') {
            stepErrors.push(childError.message);
          }
        }
      } else if (errors[field as keyof typeof errors]) {
        const error = errors[field as keyof typeof errors];
        if (error && typeof error === 'object' && 'message' in error) {
          stepErrors.push(error.message as string);
        }
      }
    });
    
    return stepErrors;
  };

  const toggleFocusArea = (area: string) => {
    const newFocusAreas = selectedFocusAreas.includes(area)
      ? selectedFocusAreas.filter((a) => a !== area)
      : [...selectedFocusAreas, area];

    setSelectedFocusAreas(newFocusAreas);
    setValue("focusAreas", newFocusAreas, { shouldValidate: true });
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      console.log("Form data received:", data);
      
      const signupData: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      // Add volunteer-specific fields
      if (data.role === "user") {
        signupData.age = data.age;
        signupData.city = data.city;
        signupData.profession = data.profession;
        signupData.contactNumber = data.contactNumber;
        signupData.nearestRailwayStation = data.nearestRailwayStation;
      }

      // Add NGO-specific fields
      if (data.role === "ngo") {
        signupData.organizationType = data.organizationType;
        signupData.websiteUrl = data.websiteUrl;
        signupData.yearEstablished = data.yearEstablished ? Number(data.yearEstablished) : undefined;
        signupData.contactNumber = data.contactNumber;
        signupData.address = {
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          zip: data.address?.zip || "",
          country: data.address?.country || "",
        };
        signupData.ngoDescription = data.ngoDescription;
        signupData.focusAreas = data.focusAreas || [];
        signupData.organizationSize = data.organizationSize;
      }

      console.log("Submitting signup data:", JSON.stringify(signupData, null, 2));
      console.log("Submitting signup data:", JSON.stringify(signupData, null, 2));

      const success = await signup(signupData);
      if (success) {
        toast.success("Account created successfully! Welcome to Namastep!");
        router.push("/");
      } else {
        toast.error("Signup failed. Please check your details and try again.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "An unexpected error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#E9FDF1] via-[#F0FDF4] to-[#E9FDF1] font-['Manrope']">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <Image
            src="/images/auth.png"
            alt="Namastep Logo"
            width={150}
            height={150}
            priority
          />
          <div className="absolute -inset-2 bg-[#50C878]/20 rounded-full blur-sm animate-pulse"></div>
        </div>
        <h1 className="text-[#50C878] font-extrabold text-3xl tracking-wide drop-shadow-sm">
          NAMASTEP
        </h1>
        <p className="text-gray-600 text-sm mt-2 text-center max-w-md">
          Make Doing Good Fun, Rewarding & Impactful
        </p>
      </div>

      {/* Signup Card */}
      <div className="bg-white/95 backdrop-blur-sm w-full max-w-4xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8">
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                        activeStep >= step.number
                          ? "bg-[#3ABBA5] text-white shadow-lg shadow-[#3ABBA5]/30"
                          : "bg-gray-200 text-gray-400"
                      } ${
                        activeStep === step.number
                          ? "ring-4 ring-[#3ABBA5]/20 scale-110"
                          : ""
                      }`}
                    >
                      {activeStep > step.number ? "✓" : step.number}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        activeStep >= step.number ? "text-[#3ABBA5]" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 rounded-full transition-all duration-300 ${
                        activeStep > step.number ? "bg-[#3ABBA5]" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-[#3ABBA5] to-[#50C878] bg-clip-text text-transparent">
              Join Our Community
            </h2>
            <p className="text-gray-600 text-lg">
              {activeStep === 1 && "Choose your account type to get started"}
              {activeStep === 2 && "Tell us about yourself"}
              {activeStep === 3 && selectedRole === "ngo" && "Organization information"}
              {activeStep === 4 && selectedRole === "ngo" && "Additional details"}
              {activeStep === (selectedRole === "ngo" ? 5 : 3) && "Complete your profile"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Validation Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800">
                      Please correct the following errors:
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                      {getCurrentStepErrors().map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Role Selection */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ${
                            isSelected
                              ? "border-[#3ABBA5] bg-[#3ABBA5]/5 shadow-lg shadow-[#3ABBA5]/20"
                              : "border-gray-200 bg-white hover:border-[#3ABBA5]/50"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div
                              className={`p-3 rounded-full transition-colors ${
                                isSelected ? "bg-[#3ABBA5] text-white" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Icon className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{opt.label}</h3>
                            <p className="text-sm text-gray-600">
                              {opt.value === "user" ? "Join as an individual volunteer" : "Register your organization"}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle className="w-6 h-6 text-[#3ABBA5]" />
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.role && <p className="text-red-500 text-sm text-center animate-shake">{errors.role.message}</p>}
              </div>
            )}

            {/* Step 2: Basic Information */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {selectedRole === "ngo" ? "Organization Name" : "Full Name"} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder={selectedRole === "ngo" ? "Enter organization name" : "Enter your full name"}
                        {...register("name", {
                          required: "This field is required",
                        })}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.name ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-[#3ABBA5]"
                        }`}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm animate-shake">{errors.name.message}</p>}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
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
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.email
                            ? "border-red-400 focus:ring-red-400"
                            : "border-gray-200 focus:border-[#3ABBA5]"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm animate-shake">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Volunteer-specific fields - shown before password */}
                  {selectedRole === "user" && (
                    <>
                      {/* Age */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Age *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="number"
                            placeholder="Enter your age"
                            min="13"
                            max="120"
                            {...register("age", {
                              required: "Age is required",
                              valueAsNumber: true,
                              min: {
                                value: 13,
                                message: "You must be at least 13 years old"
                              },
                              max: {
                                value: 120,
                                message: "Please enter a valid age"
                              }
                            })}
                            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                              errors.age
                                ? "border-red-400 focus:ring-red-400"
                                : "border-gray-200 focus:border-[#3ABBA5]"
                            }`}
                          />
                        </div>
                        {errors.age && (
                          <p className="text-red-500 text-sm animate-shake">
                            {errors.age.message}
                          </p>
                        )}
                      </div>

                      {/* City */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          City *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            placeholder="Enter your city"
                            {...register("city", {
                              required: "City is required",
                              minLength: {
                                value: 2,
                                message: "City name must be at least 2 characters"
                              },
                              maxLength: {
                                value: 100,
                                message: "City name cannot exceed 100 characters"
                              }
                            })}
                            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                              errors.city
                                ? "border-red-400 focus:ring-red-400"
                                : "border-gray-200 focus:border-[#3ABBA5]"
                            }`}
                          />
                        </div>
                        {errors.city && (
                          <p className="text-red-500 text-sm animate-shake">
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      {/* Profession */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Profession *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            placeholder="Enter your profession"
                            {...register("profession", {
                              required: "Profession is required",
                              maxLength: {
                                value: 100,
                                message: "Profession cannot exceed 100 characters"
                              }
                            })}
                            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                              errors.profession
                                ? "border-red-400 focus:ring-red-400"
                                : "border-gray-200 focus:border-[#3ABBA5]"
                            }`}
                          />
                        </div>
                        {errors.profession && (
                          <p className="text-red-500 text-sm animate-shake">
                            {errors.profession.message}
                          </p>
                        )}
                      </div>

                      {/* Contact Number */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Contact Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="tel"
                            placeholder="Enter your contact number"
                            {...register("contactNumber", {
                              required: "Contact number is required",
                              pattern: {
                                value: /^[\+]?[1-9][\d]{0,15}$/,
                                message: "Please provide a valid contact number"
                              }
                            })}
                            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                              errors.contactNumber
                                ? "border-red-400 focus:ring-red-400"
                                : "border-gray-200 focus:border-[#3ABBA5]"
                            }`}
                          />
                        </div>
                        {errors.contactNumber && (
                          <p className="text-red-500 text-sm animate-shake">
                            {errors.contactNumber.message}
                          </p>
                        )}
                      </div>

                      {/* Nearest Railway Station */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Nearest Railway Station *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            placeholder="Enter nearest railway station"
                            {...register("nearestRailwayStation", {
                              required: "Nearest railway station is required",
                              maxLength: {
                                value: 100,
                                message: "Railway station name cannot exceed 100 characters"
                              }
                            })}
                            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                              errors.nearestRailwayStation
                                ? "border-red-400 focus:ring-red-400"
                                : "border-gray-200 focus:border-[#3ABBA5]"
                            }`}
                          />
                        </div>
                        {errors.nearestRailwayStation && (
                          <p className="text-red-500 text-sm animate-shake">
                            {errors.nearestRailwayStation.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Password Field - Now at the bottom */}
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
                          minLength: {
                            value: 8,
                            message: "Minimum 8 characters",
                          },
                        })}
                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.password ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-[#3ABBA5]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm animate-shake">{errors.password.message}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (val) => val === watchedFields.password || "Passwords do not match",
                        })}
                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.confirmPassword ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-[#3ABBA5]"
                        }`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                        {!errors.confirmPassword && watchedFields.confirmPassword && <CheckCircle className="h-5 w-5 text-green-500" />}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm animate-shake">{errors.confirmPassword.message}</p>}
                  </div>

                  {/* Volunteer-specific fields: only show when role === 'user' */}
                  {selectedRole === "user" && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Age *</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="number"
                            placeholder="e.g., 25"
                            {...register("age", {
                              required: "Age is required for volunteers",
                              valueAsNumber: true,
                              min: { value: 1, message: "Invalid age" },
                            })}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                        </div>
                        {errors.age && <p className="text-red-500 text-sm animate-shake">{errors.age.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">City *</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            placeholder="Your city"
                            {...register("city", {
                              required: "City is required for volunteers",
                            })}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                        </div>
                        {errors.city && <p className="text-red-500 text-sm animate-shake">{errors.city.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Profession *</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            placeholder="Your profession"
                            {...register("profession", {
                              required: "Profession is required for volunteers",
                            })}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                        </div>
                        {errors.profession && <p className="text-red-500 text-sm animate-shake">{errors.profession.message}</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: NGO Basic Details */}
            {activeStep === 3 && selectedRole === "ngo" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-2xl p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-xl font-bold text-[#3ABBA5] mb-6 text-center">Organization Information</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Organization Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Organization Type *</label>
                      <select
                        {...register("organizationType", {
                          required: "Please select organization type",
                        })}
                        className={`w-full px-4 py-4 rounded-xl border-2 text-gray-700 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.organizationType
                            ? "border-red-400 focus:ring-red-400"
                            : "border-gray-200 focus:border-[#3ABBA5]"
                        }`}
                      >
                        <option value="">Select type</option>
                        <option value="non-profit">Non-profit</option>
                        <option value="charity">Charity</option>
                        <option value="foundation">Foundation</option>
                        <option value="trust">Trust</option>
                        <option value="society">Society</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.organizationType && <p className="text-red-500 text-sm animate-shake">{errors.organizationType.message}</p>}
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Contact Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="tel"
                          placeholder="9876543210"
                          {...register("contactNumber", {
                            required: "Contact number is required",
                            pattern: {
                              value: /^[\+]?[1-9][\d]{0,15}$/,
                              message: "Please provide a valid contact number"
                            },
                            minLength: {
                              value: 10,
                              message: "Contact number must be at least 10 digits"
                            }
                          })}
                          className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                            errors.contactNumber
                              ? "border-red-400 focus:ring-red-400"
                              : "border-gray-200 focus:border-[#3ABBA5]"
                          }`}
                        />
                      </div>
                      {errors.contactNumber && <p className="text-red-500 text-sm animate-shake">{errors.contactNumber.message}</p>}
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="url"
                          placeholder="https://example.com"
                          {...register("websiteUrl")}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Year Established */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Year Established</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="number"
                          placeholder="2010"
                          {...register("yearEstablished")}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Organization Description */}
                  <div className="space-y-2 mt-4">
                    <label className="block text-sm font-semibold text-gray-700">Organization Description *</label>
                    <textarea
                      placeholder="Describe your organization's mission, vision, and activities..."
                      rows={4}
                      {...register("ngoDescription", {
                        required: "Description is required",
                        minLength: {
                          value: 10,
                          message: "Description must be at least 10 characters"
                        },
                        maxLength: {
                          value: 1000,
                          message: "Description cannot exceed 1000 characters"
                        }
                      })}
                      className={`w-full px-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none resize-none transition-all ${
                        errors.ngoDescription
                          ? "border-red-400 focus:ring-red-400"
                          : "border-gray-200 focus:border-[#3ABBA5]"
                      }`}
                    />
                    {errors.ngoDescription && (
                      <p className="text-red-500 text-sm animate-shake">
                        {errors.ngoDescription.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: NGO Additional Details */}
            {activeStep === 4 && selectedRole === "ngo" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-2xl p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-xl font-bold text-[#3ABBA5] mb-6 text-center">Additional Details</h3>

                  {/* Organization Size */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-semibold text-gray-700">Organization Size *</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <select
                        {...register("organizationSize", {
                          required: "Organization size is required",
                        })}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.organizationSize
                            ? "border-red-400 focus:ring-red-400"
                            : "border-gray-200 focus:border-[#3ABBA5]"
                        }`}
                      >
                        <option value="">Select organization size</option>
                        {organizationSizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size} employees
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.organizationSize && <p className="text-red-500 text-sm animate-shake">{errors.organizationSize.message}</p>}
                  </div>

                  {/* Focus Areas */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-semibold text-gray-700">Focus Areas * (Select at least one)</label>
                    <div className="relative">
                      <Target className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
                      <div className="pl-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {focusAreaOptions.map((area) => (
                            <label key={area} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                value={area}
                                checked={selectedFocusAreas.includes(area)}
                                onChange={() => toggleFocusArea(area)}
                                className="hidden"
                              />
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  selectedFocusAreas.includes(area) ? "bg-[#3ABBA5] border-[#3ABBA5]" : "border-gray-300 bg-white"
                                }`}
                              >
                                {selectedFocusAreas.includes(area) && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-sm text-gray-700">{area}</span>
                            </label>
                          ))}
                        </div>
                        {errors.focusAreas && <p className="text-red-500 text-sm animate-shake mt-2">Please select at least one focus area</p>}
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
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
                      <div className="pl-12 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Street Address"
                              {...register("address.street", {
                                required: "Street address is required",
                              })}
                              className={`w-full px-4 py-3 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                                errors.address?.street
                                  ? "border-red-400 focus:ring-red-400"
                                  : "border-gray-200 focus:border-[#3ABBA5]"
                              }`}
                            />
                            {errors.address?.street && (
                              <p className="text-red-500 text-sm animate-shake">
                                {errors.address.street.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="City"
                              {...register("address.city", {
                                required: "City is required",
                              })}
                              className={`w-full px-4 py-3 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                                errors.address?.city
                                  ? "border-red-400 focus:ring-red-400"
                                  : "border-gray-200 focus:border-[#3ABBA5]"
                              }`}
                            />
                            {errors.address?.city && (
                              <p className="text-red-500 text-sm animate-shake">
                                {errors.address.city.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="State"
                              {...register("address.state", {
                                required: "State is required",
                              })}
                              className={`w-full px-4 py-3 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                                errors.address?.state
                                  ? "border-red-400 focus:ring-red-400"
                                  : "border-gray-200 focus:border-[#3ABBA5]"
                              }`}
                            />
                            {errors.address?.state && (
                              <p className="text-red-500 text-sm animate-shake">
                                {errors.address.state.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="ZIP Code"
                              {...register("address.zip", {
                                required: "ZIP code is required",
                              })}
                              className={`w-full px-4 py-3 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                                errors.address?.zip
                                  ? "border-red-400 focus:ring-red-400"
                                  : "border-gray-200 focus:border-[#3ABBA5]"
                              }`}
                            />
                            {errors.address?.zip && (
                              <p className="text-red-500 text-sm animate-shake">
                                {errors.address.zip.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Country"
                              {...register("address.country", {
                                required: "Country is required",
                              })}
                              className={`w-full px-4 py-3 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                                errors.address?.country
                                  ? "border-red-400 focus:ring-red-400"
                                  : "border-gray-200 focus:border-[#3ABBA5]"
                              }`}
                            />
                            {errors.address?.country && (
                              <p className="text-red-500 text-sm animate-shake">
                                {errors.address.country.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5/3: Complete */}
            {activeStep === (selectedRole === "ngo" ? 5 : 3) && (
              <div className="text-center space-y-6 animate-fadeIn">
                <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Join!</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You're all set to create your {selectedRole === "ngo" ? "organization" : "volunteer"} account. Review your information and click create account to get started.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-800 mb-3">Account Summary</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Role:</strong> {selectedRole === "ngo" ? "NGO" : "Volunteer"}
                    </p>
                    <p>
                      <strong>Name:</strong> {watchedFields.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {watchedFields.email}
                    </p>
                    {selectedRole === "ngo" && (
                      <>
                        <p>
                          <strong>Organization Type:</strong> {watchedFields.organizationType}
                        </p>
                        <p>
                          <strong>Contact:</strong> {watchedFields.contactNumber}
                        </p>
                        <p>
                          <strong>Focus Areas:</strong> {selectedFocusAreas.join(", ")}
                        </p>
                        <p>
                          <strong>Organization Size:</strong> {watchedFields.organizationSize}
                        </p>
                      </>
                    )}
                    {selectedRole === "user" && (
                      <>
                        <p>
                          <strong>Age:</strong> {watchedFields.age}
                        </p>
                        <p>
                          <strong>City:</strong> {watchedFields.city}
                        </p>
                        <p>
                          <strong>Profession:</strong> {watchedFields.profession}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-8 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
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
                  className="px-8 py-3 bg-[#3ABBA5] text-white font-semibold rounded-xl shadow-lg hover:bg-[#36a894] hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-[#3ABBA5] to-[#50C878] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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

          {/* Login Link */}
          <div className="text-center pt-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#3ABBA5] font-semibold hover:underline transition-colors">
                Log in here
              </Link>
            </p>
            <p className="text-gray-600">
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
