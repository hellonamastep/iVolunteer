"use client";

import { useState, useRef } from "react";
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
  HeartHandshake,
  Users,
  Shield,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import api from "@/lib/api";

type FormValues = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: string;
  // Volunteer-specific fields
  age?: number;
  city?: string;
  profession?: string;
  customProfession?: string;
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
  // Corporate-specific fields
  companyType?: string;
  industrySector?: string;
  companySize?: string;
  companyDescription?: string;
  csrFocusAreas?: string[];
  otp?: string;
};

export default function AuthPage() {
  const { signup, login, verifyOtp } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange", // Enable real-time validation
    reValidateMode: "onChange", // Re-validate on every change
  });

  const roleOptions = [
    { value: "admin", label: "Admin", icon: Shield },
    { value: "user", label: "Volunteer", icon: HeartHandshake },
    { value: "ngo", label: "NGO", icon: Building2 },
    { value: "corporate", label: "Corporate", icon: Users },
  ];

  const selectedRole = watch("role");

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setProfilePicture(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (tab === "signup") {
      // Signup logic stays the same
      const signupData = {
        name: data.name!,
        email: data.email,
        password: data.password,
        role: data.role as any,
        ...(data.role === "user" && {
          age: data.age,
          city: data.city,
          profession: data.profession === "other" ? data.customProfession : data.profession,
          contactNumber: data.contactNumber,
          nearestRailwayStation: data.nearestRailwayStation
        }),
        ...(data.role === "ngo" && {
          organizationType: data.organizationType,
          websiteUrl: data.websiteUrl,
          yearEstablished: data.yearEstablished
            ? Number(data.yearEstablished)
            : undefined,
          contactNumber: data.contactNumber,
          address: data.address,
          ngoDescription: data.ngoDescription,
          focusAreas: data.focusAreas || [],
          organizationSize: data.organizationSize,
        }),
        ...(data.role === "corporate" && {
          companyType: data.companyType,
          industrySector: data.industrySector,
          companySize: data.companySize,
          websiteUrl: data.websiteUrl,
          yearEstablished: data.yearEstablished
            ? Number(data.yearEstablished)
            : undefined,
          contactNumber: data.contactNumber,
          address: data.address,
          companyDescription: data.companyDescription,
          csrFocusAreas: data.csrFocusAreas || [],
        }),
      };

      const success = await signup(signupData);
      if (success) {
        // Upload profile picture if provided
        if (profilePicture) {
          try {
            const formData = new FormData();
            formData.append("profilePicture", profilePicture);

            const token = localStorage.getItem("auth-token");
            await api.post(
              `/auth/upload-profile-picture`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            toast.success("Profile picture uploaded successfully!");
          } catch (error) {
            console.error("Error uploading profile picture:", error);
            toast.warn("Account created but profile picture upload failed. You can upload it later from your profile.");
          }
        }

        toast.success("Account created successfully!");
        router.push("/");
      } else {
        toast.error("Signup failed. Please check your details and try again.");
      }
    } else {
      // Login with OTP
      if (!otpSent) {
        // Step 1: Request OTP
        const success = await login(
          data.email,
          data.password,
          data.role as any
        );
        if (success) {
          setOtpSent(true);
          setEmailForOtp(data.email);
          toast.info(
            "OTP sent to your email. Please enter it to complete login."
          );
        }
      } else {
        // Step 2: Verify OTP
        if (!data.otp) {
          toast.error("Please enter the OTP sent to your email.");
          return;
        }
        const success = await verifyOtp(emailForOtp, data.otp);
        if (success) {
          toast.success("Login successful!");
          router.push("/");
        } else {
          toast.error("Invalid OTP. Please try again.");
        }
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 font-['Manrope'] text-gray-800 dark:text-gray-200">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6 border border-gray-200 dark:border-gray-700">
          {/* Tabs */}
          <div className="flex bg-gray-50 dark:bg-gray-700 rounded-lg p-1 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all duration-300 ${
                tab === "login"
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all duration-300 ${
                tab === "signup"
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {tab === "login"
                ? "Login to Your Account"
                : "Create a New Account"}
            </h2>
            <p className="text-gray-500 mt-2">
              {tab === "login"
                ? "Sign in to continue your volunteering journey"
                : "Join our community of volunteers and organizations"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 font-['Manrope'] tracking-wide">
                I am a: <span className="text-red-500">*</span>
              </label>

              {tab === "login" ? (
                // roles for Login
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedRole === opt.value;

                    return (
                      <label key={opt.value} className="cursor-pointer">
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("role", {
                            required: "Role is required",
                          })}
                          className="hidden"
                        />
                        <div
                          className={`flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition-colors duration-200 border ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {opt.label}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                // roles for Signup
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedRole === opt.value;

                    return (
                      <label key={opt.value} className="cursor-pointer">
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("role", {
                            required: "Role is required",
                          })}
                          className="hidden"
                        />
                        <div
                          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg font-semibold transition-all border ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-500"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-sm">{opt.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* OTP Input: Only show when login tab is active and OTP has been sent */}
              {tab === "login" && otpSent && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    {...register("otp", { required: "OTP is required" })}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.otp.message}
                    </p>
                  )}
                </div>
              )}

              {errors.role && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Full Name / Organization Name / Company Name Field for signup only */}
            {tab === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {selectedRole === "ngo"
                    ? "Organization Name"
                    : selectedRole === "corporate"
                    ? "Company Name"
                    : "Full Name"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                      selectedRole === "ngo"
                        ? "Enter your organization name"
                        : selectedRole === "corporate"
                        ? "Enter your company name"
                        : "Enter your full name"
                    }
                    {...register("name", { required: "Name is required" })}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.name
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            )}

            {/* Profile Picture Upload - Optional for all roles during signup */}
            {tab === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                
                {!profilePicturePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Click to upload profile picture
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={profilePicturePreview} alt="Profile preview" />
                        <AvatarFallback>
                          <User className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {profilePicture?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(profilePicture!.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-200 peer-focus:text-blue-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email",
                    },
                  })}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.email
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field for Admin Signup */}
            {tab === "signup" && selectedRole === "admin" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.password
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: (val) =>
                          val === watch("password") || "Passwords do not match",
                      })}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.confirmPassword
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                    />

                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {!errors.confirmPassword && watch("confirmPassword") && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600"
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Password Field for Login */}
            {tab === "login" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.password
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            )}

            {/* Volunteer-specific fields for signup */}
            {tab === "signup" && selectedRole === "user" && (
              <>
                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your age"
                    min="13"
                    max="120"
                    {...register("age", {
                      required: selectedRole === "user" ? "Age is required" : false,
                      valueAsNumber: true,
                      min: { 
                        value: 13, 
                        message: "You must be at least 13 years old" 
                      },
                      max: { 
                        value: 120, 
                        message: "Please enter a valid age" 
                      },
                      validate: {
                        validAge: (value) => {
                          if (!value && selectedRole !== "user") return true;
                          if (!value) return "Age is required";
                          if (value < 13 || value > 120) {
                            return "Please enter a valid age between 13 and 120";
                          }
                          return true;
                        }
                      }
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.age
                        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.age.message}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your city"
                    {...register("city", {
                      required: selectedRole === "user" ? "City is required" : false,
                      minLength: {
                        value: 2,
                        message: "City name must be at least 2 characters"
                      },
                      maxLength: {
                        value: 100,
                        message: "City name cannot exceed 100 characters"
                      }
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.city
                        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                {/* Profession */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profession <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("profession", {
                      required: selectedRole === "user" ? "Profession is required" : false
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.profession
                        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white`}
                  >
                    <option value="">Select your profession</option>
                    <option value="student">Student</option>
                    <option value="teacher-educator">Teacher/Educator</option>
                    <option value="software-engineer">Software Engineer</option>
                    <option value="data-scientist">Data Scientist</option>
                    <option value="doctor-medical-professional">Doctor/Medical Professional</option>
                    <option value="nurse">Nurse</option>
                    <option value="engineer">Engineer</option>
                    <option value="accountant">Accountant</option>
                    <option value="business-analyst">Business Analyst</option>
                    <option value="marketing-professional">Marketing Professional</option>
                    <option value="sales-professional">Sales Professional</option>
                    <option value="hr-professional">HR Professional</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="designer">Designer</option>
                    <option value="architect">Architect</option>
                    <option value="consultant">Consultant</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="artist">Artist</option>
                    <option value="writer-author">Writer/Author</option>
                    <option value="journalist">Journalist</option>
                    <option value="photographer">Photographer</option>
                    <option value="chef-cook">Chef/Cook</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="farmer">Farmer</option>
                    <option value="researcher-scientist">Researcher/Scientist</option>
                    <option value="government-employee">Government Employee</option>
                    <option value="police-officer">Police Officer</option>
                    <option value="military-defense">Military/Defense</option>
                    <option value="social-worker">Social Worker</option>
                    <option value="homemaker">Homemaker</option>
                    <option value="retired">Retired</option>
                    <option value="unemployed-seeking">Unemployed/Seeking Opportunities</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.profession && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.profession.message}
                    </p>
                  )}
                </div>

                {/* Custom Profession - shown when "Other" is selected */}
                {watch("profession") === "other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Please specify your profession <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your profession"
                      {...register("customProfession", {
                        required: watch("profession") === "other" ? "Please specify your profession" : false,
                        maxLength: {
                          value: 100,
                          message: "Profession cannot exceed 100 characters"
                        }
                      })}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.customProfession
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                        } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    />
                    {errors.customProfession && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.customProfession.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your contact number"
                    {...register("contactNumber", {
                      required: selectedRole === "user" ? "Contact number is required" : false,
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: "Please provide a valid contact number"
                      }
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.contactNumber
                        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contactNumber.message}
                    </p>
                  )}
                </div>

                {/* Nearest Railway Station */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nearest Railway Station <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your nearest railway station"
                    {...register("nearestRailwayStation", {
                      required: selectedRole === "user" ? "Nearest railway station is required" : false,
                      maxLength: {
                        value: 100,
                        message: "Railway station name cannot exceed 100 characters"
                      }
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors.nearestRailwayStation
                        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                  />
                  {errors.nearestRailwayStation && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.nearestRailwayStation.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.password
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: (val) =>
                          val === watch("password") || "Passwords do not match",
                      })}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.password
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                    />

                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {!errors.confirmPassword && watch("confirmPassword") && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600"
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* NGO-specific fields for signup */}
            {tab === "signup" && selectedRole === "ngo" && (
              <>
                {/* Organization Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("organizationType", {
                      required:
                        selectedRole === "ngo"
                          ? "Organization type is required"
                          : false,
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors.organizationType
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white`}
                  >
                    <option value="">Select organization type</option>
                    <option value="non-profit">Non-profit</option>
                    <option value="charity">Charity</option>
                    <option value="foundation">Foundation</option>
                    <option value="trust">Trust</option>
                    <option value="society">Society</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.organizationType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.organizationType.message}
                    </p>
                  )}
                </div>

                {/* Website or Social Media URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website or Social Media URL{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com or https://facebook.com/yourorg"
                    {...register("websiteUrl", {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message:
                          "Please enter a valid URL starting with http:// or https://",
                      },
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors.websiteUrl
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                  />
                  {errors.websiteUrl && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.websiteUrl.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Year Established */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year Established{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="2010"
                      min="1800"
                      max={new Date().getFullYear()}
                      {...register("yearEstablished", {
                        valueAsNumber: true,
                        min: {
                          value: 1800,
                          message: "Year must be after 1800",
                        },
                        max: {
                          value: new Date().getFullYear(),
                          message: "Year cannot be in the future",
                        },
                        validate: {
                          validYear: (value) => {
                            if (!value) return true; // Optional field
                            const currentYear = new Date().getFullYear();
                            return (
                              (value >= 1800 && value <= currentYear) ||
                              `Year must be between 1800 and ${currentYear}`
                            );
                          },
                        },
                      })}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${
                          errors.yearEstablished
                            ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                            : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                        } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    />
                    {errors.yearEstablished && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.yearEstablished.message}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210 or 011-12345678"
                      {...register("contactNumber", {
                        required:
                          selectedRole === "ngo"
                            ? "Contact number is required"
                            : false,
                        validate: {
                          validPhone: (value) => {
                            if (!value && selectedRole !== "ngo") return true;
                            if (!value) return "Contact number is required";

                            // Remove all non-digits for validation
                            const digitsOnly = value.replace(/\D/g, "");

                            // Check for valid phone number patterns
                            // Mobile: 10 digits starting with 6-9 (Indian mobile)
                            // Landline: 8-11 digits (can start with area codes like 011, 022, etc.)
                            // International: 7-15 digits

                            if (
                              digitsOnly.length < 7 ||
                              digitsOnly.length > 15
                            ) {
                              return "Contact number must be 7-15 digits long";
                            }

                            // Indian mobile number validation (10 digits starting with 6-9)
                            if (
                              digitsOnly.length === 10 &&
                              /^[6-9]/.test(digitsOnly)
                            ) {
                              return true;
                            }

                            // Indian landline validation (area code + 7-8 digits)
                            if (
                              digitsOnly.length >= 10 &&
                              digitsOnly.length <= 11
                            ) {
                              // Common Indian area codes
                              const areaCodes = [
                                "011",
                                "022",
                                "033",
                                "040",
                                "044",
                                "080",
                                "020",
                                "079",
                                "0484",
                                "0471",
                              ];
                              const hasValidAreaCode = areaCodes.some((code) =>
                                digitsOnly.startsWith(code)
                              );
                              if (hasValidAreaCode) {
                                return true;
                              }
                            }

                            // International or other valid formats (7-15 digits)
                            if (
                              digitsOnly.length >= 7 &&
                              digitsOnly.length <= 15
                            ) {
                              return true;
                            }

                            return "Please enter a valid mobile number (10 digits) or landline number";
                          },
                        },
                      })}
                      onInput={(e) => {
                        // Allow numbers, spaces, hyphens, parentheses, and plus sign
                        const target = e.target as HTMLInputElement;
                        target.value = target.value
                          .replace(/[^0-9\s\-\(\)\+]/g, "")
                          .slice(0, 20);
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${
                          errors.contactNumber
                            ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                            : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                        } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    />
                    {errors.contactNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.contactNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Street address"
                      {...register("address.street", {
                        required:
                          selectedRole === "ngo"
                            ? "Street address is required"
                            : false,
                      })}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${
                          errors.address?.street
                            ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                            : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                        } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    />
                    {errors.address?.street && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address.street.message}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        {...register("address.city", {
                          required:
                            selectedRole === "ngo" ? "City is required" : false,
                        })}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${
                            errors.address?.city
                              ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                              : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      <input
                        type="text"
                        placeholder="State"
                        {...register("address.state", {
                          required:
                            selectedRole === "ngo"
                              ? "State is required"
                              : false,
                        })}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${
                            errors.address?.state
                              ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                              : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                    </div>
                    {(errors.address?.city || errors.address?.state) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address?.city?.message ||
                          errors.address?.state?.message}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        {...register("address.zip", {
                          required:
                            selectedRole === "ngo"
                              ? "ZIP code is required"
                              : false,
                          validate: {
                            validZip: (value) => {
                              if (!value && selectedRole !== "ngo") return true;
                              if (!value) return "ZIP code is required";

                              const country =
                                watch("address.country")?.toLowerCase();

                              // For India, ZIP code should be numeric and 6 digits
                              if (country === "india" || !country) {
                                if (!/^\d{6}$/.test(value)) {
                                  return "Indian PIN code must be 6 digits";
                                }
                              }

                              return true;
                            },
                          },
                        })}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${
                            errors.address?.zip
                              ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                              : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        defaultValue="India"
                        {...register("address.country", {
                          required:
                            selectedRole === "ngo"
                              ? "Country is required"
                              : false,
                        })}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${
                            errors.address?.country
                              ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                              : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                    </div>
                    {(errors.address?.zip || errors.address?.country) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address?.zip?.message ||
                          errors.address?.country?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* NGO Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Description{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe your organization's mission and activities..."
                    rows={4}
                    {...register("ngoDescription", {
                      required:
                        selectedRole === "ngo"
                          ? "Organization description is required"
                          : false,
                      maxLength: {
                        value: 1000,
                        message: "Description cannot exceed 1000 characters",
                      },
                      validate: {
                        wordCount: (value) => {
                          if (!value && selectedRole !== "ngo") return true;
                          if (!value)
                            return "Organization description is required";

                          // Count words by splitting on whitespace and filtering empty strings
                          const words = value
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0);

                          if (words.length < 10) {
                            return `Description must contain at least 10 words (currently ${words.length} words)`;
                          }

                          return true;
                        },
                      },
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors.ngoDescription
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none`}
                  />
                  {/* Word count indicator */}
                  <div className="flex justify-between items-center mt-1">
                    {errors.ngoDescription && (
                      <p className="text-red-500 text-sm">
                        {errors.ngoDescription.message}
                      </p>
                    )}
                    {watch("ngoDescription") && (
                      <p className="text-sm text-gray-500 ml-auto">
                        {(() => {
                          const description = watch("ngoDescription");
                          if (!description) return "0 words";
                          const words = description
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0);
                          return `${words.length} words`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Focus Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Focus Areas <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
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
                    ].map((area) => (
                      <label
                        key={area}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={area}
                          {...register("focusAreas", {
                            required:
                              selectedRole === "ngo"
                                ? "Please select at least one focus area"
                                : false,
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {area.replace("-", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.focusAreas && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.focusAreas.message}
                    </p>
                  )}
                </div>

                {/* Organization Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("organizationSize", {
                      required:
                        selectedRole === "ngo"
                          ? "Organization size is required"
                          : false,
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors.organizationSize
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white`}
                  >
                    <option value="">Select organization size</option>
                    <option value="1-10">1-10 people</option>
                    <option value="11-50">11-50 people</option>
                    <option value="51-100">51-100 people</option>
                    <option value="101-500">101-500 people</option>
                    <option value="500+">500+ people</option>
                  </select>
                  {errors.organizationSize && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.organizationSize.message}
                    </p>
                  )}
                </div>

                {/* Password Field for NGO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.password
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

                {/* Confirm Password for NGO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: (val) =>
                          val === watch("password") || "Passwords do not match",
                      })}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.confirmPassword
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                    />

                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {!errors.confirmPassword && watch("confirmPassword") && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600"
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Corporate-specific fields for signup */}
            {tab === "signup" && selectedRole === "corporate" && (
              <>
                {/* Company Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("companyType", {
                      required:
                        selectedRole === "corporate"
                          ? "Company type is required"
                          : false,
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors.companyType
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white`}
                  >
                    <option value="">Select company type</option>
                    <option value="private-limited">Private Limited</option>
                    <option value="public-limited">Public Limited</option>
                    <option value="llp">
                      LLP (Limited Liability Partnership)
                    </option>
                    <option value="partnership">Partnership</option>
                    <option value="sole-proprietorship">
                      Sole Proprietorship
                    </option>
                    <option value="mnc">MNC (Multinational Corporation)</option>
                    <option value="startup">Startup</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.companyType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companyType.message}
                    </p>
                  )}
                </div>

                {/* Industry Sector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry Sector <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("industrySector", {
                      required:
                        selectedRole === "corporate"
                          ? "Industry sector is required"
                          : false,
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors.industrySector
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white`}
                  >
                    <option value="">Select industry sector</option>
                    <option value="it-software">IT/Software</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="education">Education</option>
                    <option value="consulting">Consulting</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.industrySector && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.industrySector.message}
                    </p>
                  )}
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("companySize", {
                      required:
                        selectedRole === "corporate"
                          ? "Company size is required"
                          : false,
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors.companySize
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white`}
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                  {errors.companySize && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companySize.message}
                    </p>
                  )}
                </div>

                {/* Website URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Website URL{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com or https://linkedin.com/company/yourcompany"
                    {...register("websiteUrl", {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message:
                          "Please enter a valid URL starting with http:// or https://",
                      },
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors.websiteUrl
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                  />
                  {errors.websiteUrl && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.websiteUrl.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Year Established */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year Established{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="2010"
                      min="1800"
                      max={new Date().getFullYear()}
                      {...register("yearEstablished", {
                        valueAsNumber: true,
                        min: {
                          value: 1800,
                          message: "Year must be after 1800",
                        },
                        max: {
                          value: new Date().getFullYear(),
                          message: "Year cannot be in the future",
                        },
                        validate: {
                          validYear: (value) => {
                            if (!value) return true; // Optional field
                            const currentYear = new Date().getFullYear();
                            return (
                              (value >= 1800 && value <= currentYear) ||
                              `Year must be between 1800 and ${currentYear}`
                            );
                          },
                        },
                      })}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${
                          errors.yearEstablished
                            ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                            : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                        } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    />
                    {errors.yearEstablished && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.yearEstablished.message}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210 or 011-12345678"
                      {...register("contactNumber", {
                        required:
                          selectedRole === "corporate"
                            ? "Contact number is required"
                            : false,
                        validate: {
                          validPhone: (value) => {
                            if (!value && selectedRole !== "corporate")
                              return true;
                            if (!value) return "Contact number is required";

                            // Remove all non-digits for validation
                            const digitsOnly = value.replace(/\D/g, "");

                            // Check for valid phone number patterns
                            if (
                              digitsOnly.length < 7 ||
                              digitsOnly.length > 15
                            ) {
                              return "Contact number must be 7-15 digits long";
                            }

                            // Indian mobile number validation (10 digits starting with 6-9)
                            if (
                              digitsOnly.length === 10 &&
                              /^[6-9]/.test(digitsOnly)
                            ) {
                              return true;
                            }

                            // Indian landline validation (area code + 7-8 digits)
                            if (
                              digitsOnly.length >= 10 &&
                              digitsOnly.length <= 11
                            ) {
                              const areaCodes = [
                                "011",
                                "022",
                                "033",
                                "040",
                                "044",
                                "080",
                                "020",
                                "079",
                                "0484",
                                "0471",
                              ];
                              const hasValidAreaCode = areaCodes.some((code) =>
                                digitsOnly.startsWith(code)
                              );
                              if (hasValidAreaCode) {
                                return true;
                              }
                            }

                            // International or other valid formats (7-15 digits)
                            if (
                              digitsOnly.length >= 7 &&
                              digitsOnly.length <= 15
                            ) {
                              return true;
                            }

                            return "Please enter a valid mobile number (10 digits) or landline number";
                          },
                        },
                      })}
                      onInput={(e) => {
                        // Allow numbers, spaces, hyphens, parentheses, and plus sign
                        const target = e.target as HTMLInputElement;
                        target.value = target.value
                          .replace(/[^0-9\s\-\(\)\+]/g, "")
                          .slice(0, 20);
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${
                          errors.contactNumber
                            ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                            : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                        } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    />
                    {errors.contactNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.contactNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Address <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Street address"
                      {...register("address.street", {
                        required:
                          selectedRole === "corporate"
                            ? "Street address is required"
                            : false,
                      })}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${
                          errors.address?.street
                            ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                            : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                        } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    />
                    {errors.address?.street && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address.street.message}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        {...register("address.city", {
                          required:
                            selectedRole === "corporate"
                              ? "City is required"
                              : false,
                        })}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${
                            errors.address?.city
                              ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                              : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      <input
                        type="text"
                        placeholder="State"
                        {...register("address.state", {
                          required:
                            selectedRole === "corporate"
                              ? "State is required"
                              : false,
                        })}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${
                            errors.address?.state
                              ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                              : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                    </div>
                    {(errors.address?.city || errors.address?.state) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address?.city?.message ||
                          errors.address?.state?.message}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        {...register("address.zip", {
                          required:
                            selectedRole === "corporate"
                              ? "ZIP code is required"
                              : false,
                          validate: {
                            validZip: (value) => {
                              if (!value && selectedRole !== "corporate")
                                return true;
                              if (!value) return "ZIP code is required";

                              const country =
                                watch("address.country")?.toLowerCase();

                              // For India, ZIP code should be numeric and 6 digits
                              if (country === "india" || !country) {
                                if (!/^\d{6}$/.test(value)) {
                                  return "Indian PIN code must be 6 digits";
                                }
                              }

                              return true;
                            },
                          },
                        })}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${
                            errors.address?.zip
                              ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                              : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        defaultValue="India"
                        {...register("address.country", {
                          required:
                            selectedRole === "corporate"
                              ? "Country is required"
                              : false,
                        })}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${
                            errors.address?.country
                              ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                              : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                    </div>
                    {(errors.address?.zip || errors.address?.country) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address?.zip?.message ||
                          errors.address?.country?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe your company's business activities and services..."
                    rows={4}
                    {...register("companyDescription", {
                      required:
                        selectedRole === "corporate"
                          ? "Company description is required"
                          : false,
                      maxLength: {
                        value: 1000,
                        message: "Description cannot exceed 1000 characters",
                      },
                      validate: {
                        wordCount: (value) => {
                          if (!value && selectedRole !== "corporate")
                            return true;
                          if (!value) return "Company description is required";

                          // Count words by splitting on whitespace and filtering empty strings
                          const words = value
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0);

                          if (words.length < 10) {
                            return `Description must contain at least 10 words (currently ${words.length} words)`;
                          }

                          return true;
                        },
                      },
                    })}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${
                        errors.companyDescription
                          ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
                          : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none`}
                  />
                  {/* Word count indicator */}
                  <div className="flex justify-between items-center mt-1">
                    {errors.companyDescription && (
                      <p className="text-red-500 text-sm">
                        {errors.companyDescription.message}
                      </p>
                    )}
                    {watch("companyDescription") && (
                      <p className="text-sm text-gray-500 ml-auto">
                        {(() => {
                          const description = watch("companyDescription");
                          if (!description) return "0 words";
                          const words = description
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0);
                          return `${words.length} words`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>

                {/* CSR Focus Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CSR Focus Areas <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "employee-volunteering",
                      "community-development",
                      "education-skill-development",
                      "environment-sustainability",
                      "healthcare",
                      "disaster-relief",
                      "women-empowerment",
                      "rural-development",
                      "other",
                    ].map((area) => (
                      <label
                        key={area}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={area}
                          {...register("csrFocusAreas", {
                            required:
                              selectedRole === "corporate"
                                ? "Please select at least one CSR focus area"
                                : false,
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {area
                            .replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.csrFocusAreas && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.csrFocusAreas.message}
                    </p>
                  )}
                </div>

                {/* Password Field for Corporate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.password
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

                {/* Confirm Password for Corporate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: (val) =>
                          val === watch("password") || "Passwords do not match",
                      })}
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      errors.confirmPassword
        ? "border border-red-500 focus:!border-red-500 focus:!ring-red-500"
        : "border border-gray-300 dark:border-gray-600 focus:!border-blue-500 focus:!ring-blue-500"
    } 
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    ![&]:border-green-500 ![&]:focus:border-green-500 ![&]:focus:ring-green-500
    ![&:focus]:border-green-500 ![&:focus]:ring-green-500`}
                    />

                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {!errors.confirmPassword && watch("confirmPassword") && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600"
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Forgot Password (Login only) */}
            {tab === "login" && (
              <div className="flex items-center justify-end">
                <a
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  href="#"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-gray-800"
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
                  {tab === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : tab === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Link */}
          {tab === "signup" && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Already have an account?{" "}
              <button
                onClick={() => setTab("login")}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
