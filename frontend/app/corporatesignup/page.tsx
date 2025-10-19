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
  Building2,
  CheckCircle,
  Globe,
  Phone,
  Calendar,
  MapPin,
  Users,
  Briefcase,
  ArrowLeft,
  Target,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";

type CorporateSignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  industrySector: string;
  websiteUrl?: string;
  yearEstablished?: number;
  contactNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  companyDescription: string;
  companySize: string;
  companyType: string;
  csrFocusAreas: string[];
};

export default function CorporateSignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedCsrFocusAreas, setSelectedCsrFocusAreas] = useState<string[]>(
    []
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
    setValue,
  } = useForm<CorporateSignupFormValues>({
    mode: "onChange",
    defaultValues: {
      role: "corporate",
    },
  });

  const industrySectorOptions = [
    "it-software",
    "healthcare",
    "finance",
    "manufacturing",
    "retail",
    "education",
    "consulting",
    "real-estate",
    "other",
  ];

  const companyTypeOptions = [
    "private-limited",
    "public-limited",
    "llp",
    "partnership",
    "sole-proprietorship",
    "mnc",
    "startup",
    "other",
  ];

  const companySizeOptions = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

  const csrFocusAreaOptions = [
    "employee-volunteering",
    "community-development",
    "education-skill-development",
    "environment-sustainability",
    "healthcare",
    "disaster-relief",
    "women-empowerment",
    "rural-development",
    "other",
  ];

  const watchedFields = watch();

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      fields: ["name", "email", "password", "confirmPassword"],
    },
    {
      number: 2,
      title: "Company Details",
      fields: [
        "industrySector",
        "companyType",
        "contactNumber",
        "companyDescription",
      ],
    },
    {
      number: 3,
      title: "CSR & Additional",
      fields: ["companySize", "csrFocusAreas", "address"],
    },
    { number: 4, title: "Complete" },
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

  const toggleCsrFocusArea = (area: string) => {
    const newFocusAreas = selectedCsrFocusAreas.includes(area)
      ? selectedCsrFocusAreas.filter((a) => a !== area)
      : [...selectedCsrFocusAreas, area];

    setSelectedCsrFocusAreas(newFocusAreas);
    setValue("csrFocusAreas", newFocusAreas, { shouldValidate: true });
  };

  const getDisplayName = (value: string) => {
    const displayNames: { [key: string]: string } = {
      "it-software": "IT & Software",
      "public-limited": "Public Limited",
      "private-limited": "Private Limited",
      "sole-proprietorship": "Sole Proprietorship",
      "employee-volunteering": "Employee Volunteering",
      "education-skill-development": "Education & Skill Development",
      "environment-sustainability": "Environment & Sustainability",
      "women-empowerment": "Women Empowerment",
      "rural-development": "Rural Development",
      "community-development": "Community Development",
      "disaster-relief": "Disaster Relief",
      llp: "LLP (Limited Liability Partnership)",
      mnc: "Multinational Corporation",
      partnership: "Partnership",
    };
    return (
      displayNames[value] ||
      value
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const onSubmit = async (data: CorporateSignupFormValues) => {
    try {
      const signupData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "corporate" as any,
        industrySector: data.industrySector,
        companyType: data.companyType,
        websiteUrl: data.websiteUrl,
        yearEstablished: data.yearEstablished
          ? Number(data.yearEstablished)
          : undefined,
        contactNumber: data.contactNumber,
        address: {
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zip: data.address.zip,
          country: data.address.country,
        },
        companyDescription: data.companyDescription,
        companySize: data.companySize,
        csrFocusAreas: data.csrFocusAreas || [],
      };

      console.log(
        "Submitting Corporate data:",
        JSON.stringify(signupData, null, 2)
      );

      const success = await signup(signupData);
      if (success) {
        toast.success("Corporate account created successfully!");
        router.push("/");
      } else {
        toast.error("Signup failed. Please check your details and try again.");
      }
    } catch (error) {
      console.error("Corporate signup error:", error);
      toast.error("An unexpected error occurred. Please try again.");
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
            width={150} // optional but recommended
            height={150} // optional but recommended
            priority // optional (for above-the-fold images)
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

      {/* Back to Main Signup */}
      <div className="mb-4">
        <Link
          href="/signup"
          className="flex items-center text-[#3ABBA5] hover:text-[#36a894] transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Signup Options
        </Link>
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
                        activeStep >= step.number
                          ? "text-[#3ABBA5]"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 rounded-full transition-all duration-300 ${
                        activeStep > step.number
                          ? "bg-[#3ABBA5]"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-[#3ABBA5] mr-3" />
              <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-[#3ABBA5] to-[#50C878] bg-clip-text text-transparent">
                Corporate Signup
              </h2>
            </div>
            <p className="text-gray-600 text-lg">
              {activeStep === 1 && "Create your corporate account"}
              {activeStep === 2 && "Tell us about your company"}
              {activeStep === 3 && "CSR & Additional information"}
              {activeStep === 4 && "Complete your corporate profile"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Information */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Enter company name"
                        {...register("name", {
                          required: "Company name is required",
                        })}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.name
                            ? "border-red-400 focus:ring-red-400"
                            : "border-gray-200 focus:border-[#3ABBA5]"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm animate-shake">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        placeholder="company@example.com"
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

                  {/* Password Field */}
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
                            value: 6,
                            message: "Minimum 6 characters",
                          },
                        })}
                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.password
                            ? "border-red-400 focus:ring-red-400"
                            : "border-gray-200 focus:border-[#3ABBA5]"
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
                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.confirmPassword
                            ? "border-red-400 focus:ring-red-400"
                            : "border-gray-200 focus:border-[#3ABBA5]"
                        }`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                        {!errors.confirmPassword &&
                          watchedFields.confirmPassword && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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
                </div>
              </div>
            )}

            {/* Step 2: Company Details */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-2xl p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-xl font-bold text-[#3ABBA5] mb-6 text-center">
                    Company Information
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Industry Sector */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Industry Sector *
                      </label>
                      <select
                        {...register("industrySector", {
                          required: "Please select industry sector",
                        })}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                      >
                        <option value="">Select industry sector</option>
                        {industrySectorOptions.map((sector) => (
                          <option key={sector} value={sector}>
                            {getDisplayName(sector)}
                          </option>
                        ))}
                      </select>
                      {errors.industrySector && (
                        <p className="text-red-500 text-sm animate-shake">
                          {errors.industrySector.message}
                        </p>
                      )}
                    </div>

                    {/* Company Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Company Type *
                      </label>
                      <select
                        {...register("companyType", {
                          required: "Please select company type",
                        })}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                      >
                        <option value="">Select company type</option>
                        {companyTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {getDisplayName(type)}
                          </option>
                        ))}
                      </select>
                      {errors.companyType && (
                        <p className="text-red-500 text-sm animate-shake">
                          {errors.companyType.message}
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
                          placeholder="9876543210"
                          {...register("contactNumber", {
                            required: "Contact number is required",
                          })}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                      </div>
                      {errors.contactNumber && (
                        <p className="text-red-500 text-sm animate-shake">
                          {errors.contactNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Website URL
                      </label>
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
                  </div>

                  {/* Company Description */}
                  <div className="space-y-2 mt-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Company Description *
                    </label>
                    <textarea
                      placeholder="Describe your company's mission, values, and business activities..."
                      rows={4}
                      {...register("companyDescription", {
                        required: "Description is required",
                      })}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none resize-none transition-all"
                    />
                    {errors.companyDescription && (
                      <p className="text-red-500 text-sm animate-shake">
                        {errors.companyDescription.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: CSR & Additional Info */}
            {activeStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-2xl p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-xl font-bold text-[#3ABBA5] mb-6 text-center">
                    CSR & Additional Information
                  </h3>

                  {/* Company Size */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-semibold text-gray-700">
                      Company Size *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <select
                        {...register("companySize", {
                          required: "Company size is required",
                        })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 text-gray-700 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                      >
                        <option value="">Select company size</option>
                        {companySizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size} employees
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.companySize && (
                      <p className="text-red-500 text-sm animate-shake">
                        {errors.companySize.message}
                      </p>
                    )}
                  </div>

                  {/* CSR Focus Areas */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-semibold text-gray-700">
                      CSR Focus Areas (Select areas of interest)
                    </label>
                    <div className="relative">
                      <Target className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
                      <div className="pl-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {csrFocusAreaOptions.map((area) => (
                            <label
                              key={area}
                              className="flex items-center space-x-3 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={area}
                                checked={selectedCsrFocusAreas.includes(area)}
                                onChange={() => toggleCsrFocusArea(area)}
                                className="hidden"
                              />
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  selectedCsrFocusAreas.includes(area)
                                    ? "bg-[#3ABBA5] border-[#3ABBA5]"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {selectedCsrFocusAreas.includes(area) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-sm text-gray-700">
                                {getDisplayName(area)}
                              </span>
                            </label>
                          ))}
                        </div>
                        <input type="hidden" {...register("csrFocusAreas")} />
                      </div>
                    </div>
                  </div>

                  {/* Year Established */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-semibold text-gray-700">
                      Year Established
                    </label>
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

                  {/* Address Fields */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Company Address *
                    </label>
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
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                            />
                            {errors.address?.street && (
                              <p className="text-red-500 text-sm">
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
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                            />
                            {errors.address?.city && (
                              <p className="text-red-500 text-sm">
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
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                            />
                            {errors.address?.state && (
                              <p className="text-red-500 text-sm">
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
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                            />
                            {errors.address?.zip && (
                              <p className="text-red-500 text-sm">
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
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                            />
                            {errors.address?.country && (
                              <p className="text-red-500 text-sm">
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

            {/* Step 4: Complete */}
            {activeStep === 4 && (
              <div className="text-center space-y-6 animate-fadeIn">
                <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Ready to Join!
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You're all set to create your corporate account. Review your
                    information and click create account to get started.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Company Summary
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Company Name:</strong> {watchedFields.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {watchedFields.email}
                    </p>
                    <p>
                      <strong>Industry Sector:</strong>{" "}
                      {getDisplayName(watchedFields.industrySector)}
                    </p>
                    <p>
                      <strong>Company Type:</strong>{" "}
                      {getDisplayName(watchedFields.companyType)}
                    </p>
                    <p>
                      <strong>Company Size:</strong> {watchedFields.companySize}
                    </p>
                    <p>
                      <strong>CSR Focus Areas:</strong>{" "}
                      {selectedCsrFocusAreas
                        .map((area) => getDisplayName(area))
                        .join(", ")}
                    </p>
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
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Creating Account...
                    </span>
                  ) : (
                    "Create Corporate Account"
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center pt-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#3ABBA5] font-semibold hover:underline transition-colors"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
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
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
