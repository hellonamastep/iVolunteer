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
  HeartHandshake,
  CheckCircle,
  Globe,
  Phone,
  Calendar,
  MapPin,
  Users,
  Target,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  indianStatesData,
  railwayStationsByCity,
} from "@/lib/locationData";
import Logo from "@/components/logo";

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  otp: string;
  // volunteer-specific
  age?: number;
  state?: string;
  city?: string;
  profession?: string;
  professionOther?: string;
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
  // corporate-specific
  industrySector?: string;
  companyType?: string;
  companyDescription?: string;
  companySize?: string;
  csrFocusAreas?: string[];
};

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <p className="text-red-500 text-xs sm:text-sm animate-shake">
      {message}
    </p>
  );
};

// Reusable Password Field Component
const PasswordField = ({
  register,
  errors,
  showPassword,
  setShowPassword,
  fieldName = "password",
  label = "Password *",
}: {
  register: any;
  errors: any;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  fieldName?: string;
  label?: string;
}) => (
  <div className="space-y-1 sm:space-y-2">
    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
      {label}
    </label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
      <input
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        {...register(fieldName, {
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Minimum 8 characters",
          },
        })}
        className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-8 sm:pr-10 lg:pr-12 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
          errors[fieldName] ? "border-red-400" : "border-gray-200"
        }`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {showPassword ? (
          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
        ) : (
          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
        )}
      </button>
    </div>
    <FieldError message={errors[fieldName]?.message} />
  </div>
);

// Reusable Confirm Password Field Component
const ConfirmPasswordField = ({
  register,
  errors,
  showConfirmPassword,
  setShowConfirmPassword,
  watchedPassword,
  watchedConfirmPassword,
}: {
  register: any;
  errors: any;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (val: boolean) => void;
  watchedPassword: string;
  watchedConfirmPassword: string;
}) => (
  <div className="space-y-1 sm:space-y-2">
    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
      Confirm Password *
    </label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
      <input
        type={showConfirmPassword ? "text" : "password"}
        placeholder="••••••••"
        {...register("confirmPassword", {
          required: "Please confirm your password",
          validate: (val: string) =>
            val === watchedPassword || "Passwords do not match",
        })}
        className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-8 sm:pr-10 lg:pr-12 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
          errors.confirmPassword ? "border-red-400" : "border-gray-200"
        }`}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
        {!errors.confirmPassword && watchedConfirmPassword && (
          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
        )}
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showConfirmPassword ? (
            <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </button>
      </div>
    </div>
    <FieldError message={errors.confirmPassword?.message} />
  </div>
);

// Reusable Contact Number Field Component
const ContactNumberField = ({
  register,
  errors,
  showErrorBorder = true,
}: {
  register: any;
  errors: any;
  showErrorBorder?: boolean;
}) => (
  <div className="space-y-1 sm:space-y-2">
    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
      Contact Number *
    </label>
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
      <input
        type="tel"
        placeholder="9876543210"
        maxLength={10}
        inputMode="numeric"
        onKeyDown={(e) => {
          if (
            !/[0-9]/.test(e.key) &&
            !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
          ) {
            e.preventDefault();
          }
        }}
        {...register("contactNumber", {
          required: "Contact number is required",
          pattern: {
            value: /^[6-9]\d{9}$/,
            message: "Please enter a valid 10-digit mobile number",
          },
        })}
        className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
          showErrorBorder && errors.contactNumber ? "border-red-400" : "border-gray-200"
        }`}
      />
    </div>
    <FieldError message={errors.contactNumber?.message} />
  </div>
);

export default function SignupPage() {
  const {
    signup,
    sendOTP,
    verifyOTP,
    resendOTP,
    isOTPSent,
    setIsOTPSent,
    otpLoading,
  } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isEmailFieldTouched, setIsEmailFieldTouched] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedNgoState, setSelectedNgoState] = useState<string>("");
  const [selectedNgoCity, setSelectedNgoCity] = useState<string>("");
  const [selectedCsrFocusAreas, setSelectedCsrFocusAreas] = useState<string[]>([]);

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

  const organizationSizeOptions = [
    "1-10",
    "11-50",
    "51-100",
    "101-500",
    "500+",
  ];

  // Corporate-specific options
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
        ?.split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") ||
      ""
    );
  };

  const selectedRole = watch("role");
  const watchedFields = watch();
  const selectedProfession = watch("profession");
  const emailValue = watch("email");
  const otpValue = watch("otp");

  const [verifiedOTP, setVerifiedOTP] = useState<string>("");

  // Handle corporate signup link click
  const handleCorporateSignup = () => {
    setValue("role", "corporate");
    setActiveStep(2);
  };

  // Check for corporate parameter in URL on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'corporate') {
      setValue("role", "corporate");
      setActiveStep(2);
    }
  }, []);

  // Automatically send OTP when user reaches Step 3
  React.useEffect(() => {
    if (activeStep === 3 && emailValue && !emailExists && !isOTPSent && !otpLoading) {
      handleSendOTP();
    }
  }, [activeStep]);

  // Auto-verify OTP when 6 digits are entered
  React.useEffect(() => {
    if (otpValue && otpValue.length === 6 && !otpVerified && !otpLoading) {
      handleVerifyOTP();
    }
  }, [otpValue]);

  // OTP Timer for resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpResendTimer > 0) {
      interval = setInterval(() => {
        setOtpResendTimer((timer) => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpResendTimer]);

  // Check if email already exists
  const checkEmailExists = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return;

    setEmailCheckLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/check-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.exists) {
        setEmailExists(true);
        setEmailVerified(false);
        setError("email", {
          type: "manual",
          message: "This email is already registered. Please login instead.",
        });
      } else {
        setEmailExists(false);
        setEmailVerified(true);
        clearErrors("email");
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!emailValue || emailExists) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await sendOTP(emailValue);
      setOtpResendTimer(60);
      // Toast already shown in auth-context
    } catch (error) {
      // Error handled in the context
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const result = await verifyOTP(emailValue, otpValue);
      if (result.success) {
        setOtpVerified(true);
        setVerifiedOTP(otpValue);

        setValue("otp", otpValue, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    } catch (error) {
      setOtpVerified(false);
      setVerifiedOTP("");
      setValue("otp", "", { shouldValidate: false });
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (otpResendTimer > 0) return;

    try {
      await resendOTP(emailValue);
      setOtpResendTimer(60);
      // Toast already shown in auth-context
    } catch (error) {
      // Error handled in the context
    }
  };

  // Debounce email check
  React.useEffect(() => {
    // Reset verification state when email changes
    if (isEmailFieldTouched) {
      setEmailVerified(false);
    }

    const timeoutId = setTimeout(() => {
      if (emailValue && emailValue.length > 0) {
        checkEmailExists(emailValue);
      } else {
        setEmailVerified(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [emailValue]);

  const steps = [
    { number: 1, title: "Account Type", fields: ["role"] },
    {
      number: 2,
      title: "Basic Info",
      fields: ["name", "email", "age", "city"],
    },
    {
      number: 3,
      title: "Email Verification",
      fields: ["otp"],
    },
    ...(selectedRole === "user"
      ? [
          {
            number: 4,
            title: "Personal Details",
            fields: [
              "password",
              "confirmPassword",
              "profession",
            ],
          },
        ]
      : []),
    ...(selectedRole === "ngo"
      ? [
          {
            number: 4,
            title: "Organization Info",
            fields: [
              "password",
              "confirmPassword",
              "organizationType",
              "contactNumber",
              "ngoDescription",
            ],
          },
          {
            number: 5,
            title: "Additional Details",
            fields: ["organizationSize", "focusAreas", "address"],
          },
        ]
      : []),
    ...(selectedRole === "corporate"
      ? [
          {
            number: 4,
            title: "Company Details",
            fields: [
              "password",
              "confirmPassword",
              "industrySector",
              "companyType",
              "contactNumber",
              "companyDescription",
            ],
          },
          {
            number: 5,
            title: "CSR & Additional",
            fields: ["companySize", "csrFocusAreas", "address"],
          },
        ]
      : []),
    { number: selectedRole === "ngo" || selectedRole === "corporate" ? 6 : 5, title: "Complete" },
  ];

  const handleNext = async () => {
    const currentStepFields = steps[activeStep - 1].fields;
    const isValid = await trigger(currentStepFields as any);

    if (!isValid) {
      return;
    }

    if (activeStep === 2) {
      setActiveStep(3);
      return;
    }

    if (activeStep === 3) {
      if (!otpVerified) {
        toast.error("Please verify your email with OTP first");
        return;
      }
      setActiveStep(4);
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeStep < steps.length) {
        handleNext();
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const toggleFocusArea = (area: string) => {
    const newFocusAreas = selectedFocusAreas.includes(area)
      ? selectedFocusAreas.filter((a) => a !== area)
      : [...selectedFocusAreas, area];

    setSelectedFocusAreas(newFocusAreas);
    setValue("focusAreas", newFocusAreas, { shouldValidate: true });
  };

  const toggleCsrFocusArea = (area: string) => {
    const newFocusAreas = selectedCsrFocusAreas.includes(area)
      ? selectedCsrFocusAreas.filter((a) => a !== area)
      : [...selectedCsrFocusAreas, area];

    setSelectedCsrFocusAreas(newFocusAreas);
    setValue("csrFocusAreas", newFocusAreas, { shouldValidate: true });
  };

  const validateDescription = (value: string | undefined) => {
    if (!value || value.trim() === "") return "Description is required";
    const wordCount = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    if (wordCount < 10) return "Description must be at least 10 words";
    return true;
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      if (!otpVerified) {
        toast.error("Please verify your email with OTP first");
        setActiveStep(3);
        return;
      }

      const otpToSend = data.otp || verifiedOTP || watch("otp");

      if (!otpToSend || otpToSend.length !== 6) {
        toast.error(
          "OTP verification failed. Please verify your email again."
        );
        setActiveStep(3);
        setOtpVerified(false);
        return;
      }

      const signupData: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role as any,
        otp: otpToSend,
      };

      // Add role-specific fields
      if (data.role === "ngo") {
        signupData.organizationType = data.organizationType;
        signupData.websiteUrl = data.websiteUrl || "";
        signupData.yearEstablished = data.yearEstablished
          ? Number(data.yearEstablished)
          : undefined;
        signupData.contactNumber = data.contactNumber;

        signupData.address = {
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          zip: data.address?.zip || "",
          country: data.address?.country || "India",
        };

        signupData.ngoDescription = data.ngoDescription;
        signupData.focusAreas = data.focusAreas || [];
        signupData.organizationSize = data.organizationSize;
      } else if (data.role === "user") {
        signupData.age = data.age ? Number(data.age) : undefined;
        signupData.state = data.state || "";
        signupData.city = data.city || "";
        signupData.profession =
          data.profession === "other" ? data.professionOther : data.profession;
        signupData.contactNumber = data.contactNumber || "";
        signupData.nearestRailwayStation = data.nearestRailwayStation || "";
      } else if (data.role === "corporate") {
        signupData.industrySector = data.industrySector;
        signupData.companyType = data.companyType;
        signupData.websiteUrl = data.websiteUrl || "";
        signupData.yearEstablished = data.yearEstablished
          ? Number(data.yearEstablished)
          : undefined;
        signupData.contactNumber = data.contactNumber;

        signupData.address = {
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          zip: data.address?.zip || "",
          country: data.address?.country || "India",
        };

        signupData.companyDescription = data.companyDescription;
        signupData.companySize = data.companySize;
        signupData.csrFocusAreas = data.csrFocusAreas || [];
      }

      const success = await signup(signupData);

      if (success) {
        // Toast already shown in auth-context
        router.push("/");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);

      // Check if user already exists - handle different error formats
      const errorMessage = error?.message?.toLowerCase() ||
        error?.response?.data?.message?.toLowerCase() ||
        error?.toString().toLowerCase();

      if (errorMessage.includes("already exists") ||
        errorMessage.includes("user exists") ||
        errorMessage.includes("email already") ||
        errorMessage.includes("account exists")) {
        toast.error("Account already exists. Please login instead.");
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-[#E9FDF1] via-[#F0FDF4] to-[#E9FDF1] font-['Manrope']">
      {/* Header */}
      <div className="flex flex-col items-center mb-4 sm:mb-6 lg:mb-8">
        <Logo />
        <p className="text-gray-600 text-xs sm:text-sm lg:text-base mt-1 text-center max-w-xs sm:max-w-sm">
          Make Doing Good Fun, Rewarding & Impactful
        </p>
      </div>

      {/* Signup Card */}
      <div className="bg-white/95 backdrop-blur-sm w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Progress Steps */}
          <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8 px-2">
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              {steps.map((step, index) => {
                // On small screens, only show first step, active step, and last step
                const isFirstStep = step.number === 1;
                const isLastStep = step.number === steps.length;
                const isActiveStep = step.number === activeStep;
                const shouldShowOnMobile = isFirstStep || isLastStep || isActiveStep;
                
                return (
                  <React.Fragment key={step.number}>
                    <div className={`flex flex-col items-center min-w-[40px] sm:min-w-16 ${!shouldShowOnMobile ? 'hidden sm:flex' : ''}`}>
                      <div
                        className={`w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-[10px] sm:text-sm transition-all duration-300 ${activeStep >= step.number
                          ? "bg-[#3ABBA5] text-white shadow-md sm:shadow-lg"
                          : "bg-gray-200 text-gray-400"
                          } ${activeStep === step.number
                            ? "ring-1 sm:ring-4 ring-[#3ABBA5]/20 scale-110"
                            : ""
                          }`}
                      >
                        {activeStep > step.number ? "✓" : step.number}
                      </div>
                      <span
                        className={`text-[8px] sm:text-xs lg:text-sm mt-1 font-medium text-center max-w-[40px] sm:max-w-none leading-tight ${
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
                        className={`w-3 h-0.5 sm:w-6 sm:h-1 lg:w-12 lg:h-1 rounded-full transition-all duration-300 flex-shrink-0 ${
                          activeStep > step.number
                            ? "bg-[#3ABBA5]"
                            : "bg-gray-200"
                        } ${!shouldShowOnMobile && (index === steps.length - 2 || !steps[index + 1] || !(steps[index + 1].number === 1 || steps[index + 1].number === steps.length || steps[index + 1].number === activeStep)) ? 'hidden sm:block' : ''}`}
                      ></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-[#3ABBA5] to-[#50C878] bg-clip-text text-transparent">
              Join Our Community
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              {activeStep === 1 && "Choose your account type to get started"}
              {activeStep === 2 && "Tell us about yourself"}
              {activeStep === 3 && "Verify your email address"}
              {activeStep === 4 &&
                selectedRole === "user" &&
                "Secure your account and additional details"}
              {activeStep === 4 &&
                selectedRole === "ngo" &&
                "Organization information"}
              {activeStep === 4 &&
                selectedRole === "corporate" &&
                "Company information"}
              {activeStep === 5 &&
                selectedRole === "ngo" &&
                "Additional details"}
              {activeStep === 5 &&
                selectedRole === "corporate" &&
                "CSR & Additional information"}
              {activeStep === (selectedRole === "ngo" || selectedRole === "corporate" ? 6 : 5) &&
                "Complete your profile"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyPress={handleKeyPress}
            className="space-y-4 sm:space-y-6 lg:space-y-8"
          >
            {/* Step 1: Role Selection */}
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
                          className={`relative p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border-2 transition-all duration-200 group-hover:scale-[1.02] sm:group-hover:scale-105 ${isSelected
                            ? "border-[#3ABBA5] bg-[#3ABBA5]/5 shadow-md sm:shadow-lg"
                            : "border-gray-200 bg-white hover:border-[#3ABBA5]/50"
                            }`}
                        >
                          <div className="flex sm:flex-col items-center sm:items-center space-x-3 sm:space-x-0 sm:space-y-2 lg:space-y-3">
                            <div
                              className={`p-2 sm:p-3 lg:p-4 rounded-full transition-colors ${
                                isSelected
                                  ? "bg-[#3ABBA5] text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                            </div>
                            <div className="flex-1 sm:text-center">
                              <h3 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg">
                                {opt.label}
                              </h3>
                              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                                {opt.value === "user"
                                  ? "Individual volunteer"
                                  : "Register organization"}
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
                <FieldError message={errors.role?.message} />
              </div>
            )}

            {/* Step 2: Basic Information */}
            {activeStep === 2 && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {/* Name Field */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      {selectedRole === "ngo"
                        ? "Organization Name"
                        : "Full Name"}{" "}
                      *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <input
                        type="text"
                        placeholder={
                          selectedRole === "ngo"
                            ? "Organization name"
                            : "Your full name"
                        }
                        {...register("name", {
                          required: "This field is required",
                        })}
                        className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${errors.name ? "border-red-400" : "border-gray-200"
                          }`}
                      />
                    </div>
                    <FieldError message={errors.name?.message} />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,
                            message: "Email must include a valid domain",
                          },
                        })}
                        onFocus={() => setIsEmailFieldTouched(true)}
                        onChange={(e) => {
                          setIsEmailFieldTouched(true);
                          setEmailVerified(false);
                          register("email").onChange(e);
                        }}
                        className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-10 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.email || emailExists ? "border-red-400" : "border-gray-200"
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
                    <FieldError message={errors.email?.message} />
                  </div>

                  {/* Volunteer-specific fields in Step 2 */}
                  {selectedRole === "user" && (
                    <>
                      <div className="space-y-1 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                          Age *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                          <input
                            type="number"
                            placeholder="e.g., 25"
                            {...register("age", {
                              required: "Age is required",
                              valueAsNumber: true,
                              min: {
                                value: 13,
                                message: "Must be at least 13 years old",
                              },
                              max: { value: 120, message: "Invalid age" },
                            })}
                            className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                        </div>
                        <FieldError message={errors.age?.message} />
                      </div>

                      {/* State Field */}
                      <div className="space-y-1 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">State *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 z-10" />
                          <select
                            {...register("state", {
                              required: "State is required",
                            })}
                            onChange={(e) => {
                              setSelectedState(e.target.value);
                              setSelectedCity("");
                              setValue("city", "");
                            }}
                            className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all appearance-none bg-white"
                          >
                            <option value="">Select State</option>
                            {Object.keys(indianStatesData).sort().map((state) => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <FieldError message={errors.state?.message} />
                      </div>

                      {/* City Field */}
                      <div className="space-y-1 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                          City *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 z-10" />
                          <select
                            {...register("city", {
                              required: "City is required",
                            })}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            disabled={!selectedState}
                            className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select City</option>
                            {selectedState && indianStatesData[selectedState]?.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>
                        <FieldError message={errors.city?.message} />
                      </div>

                      {/* Nearest Railway Station Field */}
                      <div className="space-y-1 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">Nearest Railway Station *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 z-10" />
                          <select
                            {...register("nearestRailwayStation", {
                              required: "Nearest railway station is required",
                            })}
                            disabled={!selectedCity}
                            className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select Railway Station</option>
                            {selectedCity && railwayStationsByCity[selectedCity]?.map((station) => (
                              <option key={station} value={station}>{station}</option>
                            ))}
                            {selectedCity && !railwayStationsByCity[selectedCity] && (
                              <option value="Other">Other</option>
                            )}
                          </select>
                        </div>
                        <FieldError message={errors.nearestRailwayStation?.message} />
                      </div>

                      {/* Contact Number Field */}
                      <ContactNumberField
                        register={register}
                        errors={errors}
                        showErrorBorder={false}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {activeStep === 3 && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-[#3ABBA5] mb-3 sm:mb-4 lg:mb-6 text-center">
                    Verify Your Email
                  </h3>

                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-gray-600 text-sm sm:text-base mb-2">
                      We've sent a 6-digit verification code to:
                    </p>
                    <p className="font-semibold text-gray-800">{emailValue}</p>
                  </div>

                  <div className="space-y-4">
                    {/* OTP Input */}
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                        Enter OTP *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          {...register("otp", {
                            required: "OTP is required",
                            pattern: {
                              value: /^\d{6}$/,
                              message: "Please enter a valid 6-digit OTP",
                            },
                          })}
                          className={`flex-1 px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                            errors.otp ? "border-red-400" : "border-gray-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={
                            !otpValue ||
                            otpValue.length !== 6 ||
                            otpLoading ||
                            otpVerified
                          }
                          className="px-4 py-2 sm:py-3 bg-[#3ABBA5] text-white font-semibold rounded-lg hover:bg-[#36a894] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm"
                        >
                          {otpLoading ? (
                            <svg
                              className="animate-spin h-4 w-4 text-white"
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
                          ) : otpVerified ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </div>
                      <FieldError message={errors.otp?.message} />
                      {otpVerified && (
                        <p className="text-green-500 text-xs sm:text-sm">
                          ✓ Email verified successfully!
                        </p>
                      )}
                    </div>

                    {/* OTP Actions */}
                    <div className="flex justify-between items-center">
                      {!isOTPSent ? (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={!emailValue || emailExists || otpLoading}
                          className="text-[#3ABBA5] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        >
                          {otpLoading ? "Sending..." : "Send OTP"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={otpResendTimer > 0 || otpLoading}
                          className="flex items-center space-x-1 text-[#3ABBA5] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        >
                          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>
                            {otpResendTimer > 0
                              ? `Resend in ${otpResendTimer}s`
                              : "Resend OTP"}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm"
                      >
                        Change email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Volunteer Personal Details */}
            {activeStep === 4 && selectedRole === "user" && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-[#3ABBA5] mb-3 sm:mb-4 lg:mb-6 text-center">
                    Secure Your Account & Additional Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {/* Password Field */}
                    <PasswordField
                      register={register}
                      errors={errors}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                    />

                    {/* Confirm Password */}
                    <ConfirmPasswordField
                      register={register}
                      errors={errors}
                      showConfirmPassword={showConfirmPassword}
                      setShowConfirmPassword={setShowConfirmPassword}
                      watchedPassword={watchedFields.password}
                      watchedConfirmPassword={watchedFields.confirmPassword}
                    />

                    {/* Profession Dropdown Field */}
                    <div className="space-y-1 sm:space-y-2 col-span-1 sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                        Profession *
                      </label>
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
                          <option value="doctor">
                            Doctor/Healthcare Professional
                          </option>
                          <option value="nurse">Nurse</option>
                          <option value="software-developer">
                            Software Developer/IT Professional
                          </option>
                          <option value="designer">Designer</option>
                          <option value="accountant">Accountant</option>
                          <option value="lawyer">Lawyer</option>
                          <option value="business-owner">Business Owner</option>
                          <option value="manager">Manager</option>
                          <option value="sales-marketing">
                            Sales/Marketing Professional
                          </option>
                          <option value="consultant">Consultant</option>
                          <option value="artist">
                            Artist/Creative Professional
                          </option>
                          <option value="writer">Writer/Journalist</option>
                          <option value="social-worker">Social Worker</option>
                          <option value="government-employee">
                            Government Employee
                          </option>
                          <option value="retired">Retired</option>
                          <option value="homemaker">Homemaker</option>
                          <option value="freelancer">Freelancer</option>
                          <option value="entrepreneur">Entrepreneur</option>
                          <option value="researcher">
                            Researcher/Scientist
                          </option>
                          <option value="skilled-worker">
                            Skilled Worker/Technician
                          </option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <FieldError message={errors.profession?.message} />
                    </div>

                    {/* Conditional: If "other" is selected, show text input */}
                    {selectedProfession === "other" && (
                      <div className="space-y-1 sm:space-y-2 col-span-1 sm:col-span-2 animate-fadeIn">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                          Please specify your profession *
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                          <input
                            type="text"
                            placeholder="Enter your profession"
                            {...register("professionOther", {
                              required:
                                selectedProfession === "other"
                                  ? "Please specify your profession"
                                  : false,
                            })}
                            className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                        </div>
                        <FieldError message={errors.professionOther?.message} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: NGO Basic Details */}
            {activeStep === 4 && selectedRole === "ngo" && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-[#3ABBA5] mb-3 sm:mb-4 lg:mb-6 text-center">
                    Organization Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {/* Password Field for NGO */}
                    <PasswordField
                      register={register}
                      errors={errors}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                    />

                    {/* Confirm Password for NGO */}
                    <ConfirmPasswordField
                      register={register}
                      errors={errors}
                      showConfirmPassword={showConfirmPassword}
                      setShowConfirmPassword={setShowConfirmPassword}
                      watchedPassword={watchedFields.password}
                      watchedConfirmPassword={watchedFields.confirmPassword}
                    />

                    {/* Organization Type */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                        Organization Type *
                      </label>
                      <select
                        {...register("organizationType", {
                          required: "Please select organization type",
                        })}
                        className={`w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.organizationType ? "border-red-400" : "border-gray-200"
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
                      <FieldError message={errors.organizationType?.message} />
                    </div>

                    {/* Contact Number */}
                    <ContactNumberField
                      register={register}
                      errors={errors}
                      showErrorBorder={true}
                    />

                    {/* Website */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                        Website URL
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type="text"
                          placeholder="https://example.com"
                          {...register("websiteUrl", {
                            pattern: {
                              value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                              message: "Domain must end with a dot + at least 2 letters (e.g., .com, .org)",
                            },
                          })}
                          className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                            errors.websiteUrl ? "border-red-400" : "border-gray-200"
                          }`}
                        />
                      </div>
                      <FieldError message={errors.websiteUrl?.message} />
                    </div>

                    {/* Year Established */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                        Year Established
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type="number"
                          placeholder="2010"
                          {...register("yearEstablished", {
                            valueAsNumber: true,
                            min: {
                              value: 1800,
                              message: "Year must be after 1800"
                            },
                            max: {
                              value: new Date().getFullYear(),
                              message: "Year cannot be in the future"
                            }
                          })}
                          className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                            errors.yearEstablished ? "border-red-400" : "border-gray-200"
                          }`}
                        />
                      </div>
                      <FieldError message={errors.yearEstablished?.message} />
                    </div>
                  </div>

                  {/* Organization Description */}
                  <div className="space-y-1 sm:space-y-2 mt-3 sm:mt-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Organization Description *
                    </label>
                    <textarea
                      placeholder="Describe your organization's mission, vision, and activities (minimum 10 words)..."
                      rows={3}
                      {...register("ngoDescription", {
                        required: "Description is required",
                        validate: validateDescription,
                      })}
                      className="w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none resize-none transition-all"
                    />
                    {errors.ngoDescription && (
                      <p className="text-red-500 text-xs sm:text-sm animate-shake">
                        {errors.ngoDescription.message}
                      </p>
                    )}
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Current word count:{" "}
                      {watchedFields.ngoDescription
                        ? watchedFields.ngoDescription
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0).length
                        : 0}
                      /10
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: NGO Additional Details */}
            {activeStep === 5 && selectedRole === "ngo" && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-[#3ABBA5] mb-3 sm:mb-4 lg:mb-6 text-center">
                    Additional Details
                  </h3>

                  {/* Organization Size */}
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Organization Size *
                    </label>
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
                    <FieldError message={errors.organizationSize?.message} />
                  </div>

                  {/* Focus Areas */}
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Focus Areas * (Select at least one)
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <div className="pl-8 sm:pl-10 lg:pl-12">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 lg:gap-3">
                          {focusAreaOptions.map((area) => (
                            <label
                              key={area}
                              className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={area}
                                checked={selectedFocusAreas.includes(area)}
                                onChange={() => toggleFocusArea(area)}
                                className="hidden"
                              />
                              <div
                                className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded border flex items-center justify-center transition-all ${
                                  selectedFocusAreas.includes(area)
                                    ? "bg-[#3ABBA5] border-[#3ABBA5]"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {selectedFocusAreas.includes(area) && (
                                  <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                )}
                              </div>
                              <span className="text-xs sm:text-sm text-gray-700">
                                {area}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.focusAreas && (
                          <p className="text-red-500 text-xs sm:text-sm animate-shake mt-1">
                            Please select at least one focus area
                          </p>
                        )}
                        <input
                          type="hidden"
                          {...register("focusAreas", {
                            validate: (val) =>
                              (val && val.length > 0) ||
                              "Please select at least one focus area",
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Address *
                    </label>
                    <div className="space-y-2 sm:space-y-3">

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <div className="space-y-1 sm:space-y-2">
                          <input
                            type="text"
                            value="India"
                            readOnly
                            {...register("address.country", {
                              required: "Country is required",
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all bg-gray-50 cursor-not-allowed"
                          />
                          {errors.address?.country && (
                            <p className="text-red-500 text-xs">
                              {errors.address.country.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                          <select
                            {...register("address.state", {
                              required: "State is required",
                            })}
                            onChange={(e) => {
                              setSelectedNgoState(e.target.value);
                              setSelectedNgoCity("");
                              setValue("address.city", "");
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all appearance-none bg-white"
                          >
                            <option value="">Select State</option>
                            {Object.keys(indianStatesData).sort().map((state) => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          {errors.address?.state && <p className="text-red-500 text-xs">{errors.address.state.message}</p>}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <select
                            {...register("address.city", {
                              required: "City is required",
                            })}
                            onChange={(e) => setSelectedNgoCity(e.target.value)}
                            disabled={!selectedNgoState}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select City</option>
                            {selectedNgoState && indianStatesData[selectedNgoState]?.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                          {errors.address?.city && <p className="text-red-500 text-xs">{errors.address.city.message}</p>}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <input
                            type="text"
                            placeholder="ZIP Code"
                            maxLength={6}
                            {...register("address.zip", {
                              required: "ZIP code is required",
                              pattern: {
                                value: /^\d{6}$/,
                                message: "Invalid ZIP code.",
                              },
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                          {errors.address?.zip && (
                            <p className="text-red-500 text-xs">
                              {errors.address.zip.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <input
                          type="text"
                          placeholder="Street Address"
                          {...register("address.street", {
                            required: "Street address is required",
                          })}
                          className="w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                        <FieldError message={errors.address?.street?.message} />
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">Account Security</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                                message: "Password must be at least 8 characters",
                              },
                              validate: {
                                hasUpperCase: (value) =>
                                  /[A-Z]/.test(value || "") || "Password must contain at least 1 uppercase letter",
                                hasLowerCase: (value) =>
                                  /[a-z]/.test(value || "") || "Password must contain at least 1 lowercase letter",
                                hasSpecialChar: (value) =>
                                  /[!@#$%^&*(),.?":{}|<>]/.test(value || "") || "Password must contain at least 1 special character",
                              }
                            })}
                            className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-8 sm:pr-10 lg:pr-12 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${errors.password ? "border-red-400" : "border-gray-200"
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
                            className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-8 sm:pr-10 lg:pr-12 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${errors.confirmPassword ? "border-red-400" : "border-gray-200"
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Corporate Company Details */}
            {activeStep === 4 && selectedRole === "corporate" && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-[#3ABBA5] mb-3 sm:mb-4 lg:mb-6 text-center">
                    Company Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {/* Password Field for Corporate */}
                    <PasswordField
                      register={register}
                      errors={errors}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                    />

                    {/* Confirm Password for Corporate */}
                    <ConfirmPasswordField
                      register={register}
                      errors={errors}
                      showConfirmPassword={showConfirmPassword}
                      setShowConfirmPassword={setShowConfirmPassword}
                      watchedPassword={watchedFields.password}
                      watchedConfirmPassword={watchedFields.confirmPassword}
                    />

                    {/* Industry Sector */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                        Industry Sector *
                      </label>
                      <select
                        {...register("industrySector", {
                          required: "Please select industry sector",
                        })}
                        className={`w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.industrySector ? "border-red-400" : "border-gray-200"
                        }`}
                      >
                        <option value="">Select industry sector</option>
                        {industrySectorOptions.map((sector) => (
                          <option key={sector} value={sector}>
                            {getDisplayName(sector)}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.industrySector?.message} />
                    </div>

                    {/* Company Type */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                        Company Type *
                      </label>
                      <select
                        {...register("companyType", {
                          required: "Please select company type",
                        })}
                        className={`w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.companyType ? "border-red-400" : "border-gray-200"
                        }`}
                      >
                        <option value="">Select company type</option>
                        {companyTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {getDisplayName(type)}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.companyType?.message} />
                    </div>

                    {/* Contact Number */}
                    <ContactNumberField
                      register={register}
                      errors={errors}
                      showErrorBorder={true}
                    />

                    {/* Website */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                        Website URL
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <input
                          type="text"
                          placeholder="https://example.com"
                          {...register("websiteUrl", {
                            pattern: {
                              value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                              message: "Domain must end with a dot + at least 2 letters (e.g., .com, .org)",
                            },
                          })}
                          className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                            errors.websiteUrl ? "border-red-400" : "border-gray-200"
                          }`}
                        />
                      </div>
                      <FieldError message={errors.websiteUrl?.message} />
                    </div>
                  </div>

                  {/* Company Description */}
                  <div className="space-y-1 sm:space-y-2 mt-3 sm:mt-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Company Description *
                    </label>
                    <textarea
                      placeholder="Describe your company's mission, values, and business activities (minimum 10 words)..."
                      rows={3}
                      {...register("companyDescription", {
                        required: "Description is required",
                        validate: validateDescription,
                      })}
                      className="w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none resize-none transition-all"
                    />
                    {errors.companyDescription && (
                      <p className="text-red-500 text-xs sm:text-sm animate-shake">
                        {errors.companyDescription.message}
                      </p>
                    )}
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Current word count:{" "}
                      {watchedFields.companyDescription
                        ? watchedFields.companyDescription
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0).length
                        : 0}
                      /10
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Corporate CSR & Additional Details */}
            {activeStep === 5 && selectedRole === "corporate" && (
              <div className="space-y-3 sm:space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#3ABBA5]/5 to-[#50C878]/5 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-[#3ABBA5]/20">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-[#3ABBA5] mb-3 sm:mb-4 lg:mb-6 text-center">
                    CSR & Additional Information
                  </h3>

                  {/* Company Size */}
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Company Size *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <select
                        {...register("companySize", {
                          required: "Company size is required",
                        })}
                        className="w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                      >
                        <option value="">Select company size</option>
                        {companySizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size} employees
                          </option>
                        ))}
                      </select>
                    </div>
                    <FieldError message={errors.companySize?.message} />
                  </div>

                  {/* CSR Focus Areas */}
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      CSR Focus Areas (Select areas of interest)
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <div className="pl-8 sm:pl-10 lg:pl-12">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-3">
                          {csrFocusAreaOptions.map((area) => (
                            <label
                              key={area}
                              className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={area}
                                checked={selectedCsrFocusAreas.includes(area)}
                                onChange={() => toggleCsrFocusArea(area)}
                                className="hidden"
                              />
                              <div
                                className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded border flex items-center justify-center transition-all ${
                                  selectedCsrFocusAreas.includes(area)
                                    ? "bg-[#3ABBA5] border-[#3ABBA5]"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {selectedCsrFocusAreas.includes(area) && (
                                  <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                )}
                              </div>
                              <span className="text-xs sm:text-sm text-gray-700">
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
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Year Established
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <input
                        type="number"
                        placeholder="2010"
                        {...register("yearEstablished", {
                          valueAsNumber: true,
                          min: {
                            value: 1800,
                            message: "Year must be after 1800"
                          },
                          max: {
                            value: new Date().getFullYear(),
                            message: "Year cannot be in the future"
                          }
                        })}
                        className={`w-full pl-8 sm:pl-10 lg:pl-12 pr-3 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all ${
                          errors.yearEstablished ? "border-red-400" : "border-gray-200"
                        }`}
                      />
                    </div>
                    <FieldError message={errors.yearEstablished?.message} />
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Company Address *
                    </label>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <div className="space-y-1 sm:space-y-2">
                          <input
                            type="text"
                            value="India"
                            readOnly
                            {...register("address.country", {
                              required: "Country is required",
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all bg-gray-50 cursor-not-allowed"
                          />
                          {errors.address?.country && (
                            <p className="text-red-500 text-xs">
                              {errors.address.country.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                          <select
                            {...register("address.state", {
                              required: "State is required",
                            })}
                            onChange={(e) => {
                              setSelectedNgoState(e.target.value);
                              setSelectedNgoCity("");
                              setValue("address.city", "");
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all appearance-none bg-white"
                          >
                            <option value="">Select State</option>
                            {Object.keys(indianStatesData).sort().map((state) => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          {errors.address?.state && <p className="text-red-500 text-xs">{errors.address.state.message}</p>}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <select
                            {...register("address.city", {
                              required: "City is required",
                            })}
                            onChange={(e) => setSelectedNgoCity(e.target.value)}
                            disabled={!selectedNgoState}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select City</option>
                            {selectedNgoState && indianStatesData[selectedNgoState]?.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                          {errors.address?.city && <p className="text-red-500 text-xs">{errors.address.city.message}</p>}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <input
                            type="text"
                            placeholder="ZIP Code"
                            maxLength={6}
                            {...register("address.zip", {
                              required: "ZIP code is required",
                              pattern: {
                                value: /^\d{6}$/,
                                message: "Invalid ZIP code.",
                              },
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                          />
                          {errors.address?.zip && (
                            <p className="text-red-500 text-xs">
                              {errors.address.zip.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <input
                          type="text"
                          placeholder="Street Address"
                          {...register("address.street", {
                            required: "Street address is required",
                          })}
                          className="w-full px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base placeholder-gray-400 focus:ring-1 sm:focus:ring-2 focus:ring-[#3ABBA5] focus:border-[#3ABBA5] outline-none transition-all"
                        />
                        <FieldError message={errors.address?.street?.message} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6/5: Complete */}
            {activeStep === (selectedRole === "ngo" || selectedRole === "corporate" ? 6 : 5) && (
              <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6 animate-fadeIn">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-green-500" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                    Ready to Join!
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base max-w-xs sm:max-w-md mx-auto">
                    You're all set to create your{" "}
                    {selectedRole === "ngo" ? "organization" : selectedRole === "corporate" ? "corporate" : "volunteer"}{" "}
                    account. Review your information and click create account to
                    get started.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-left max-w-xs sm:max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-800 mb-2 text-xs sm:text-sm lg:text-base">
                    Account Summary
                  </h4>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <p>
                      <strong>Role:</strong>{" "}
                      {selectedRole === "ngo" ? "NGO" : selectedRole === "corporate" ? "Corporate" : "Volunteer"}
                    </p>
                    <p>
                      <strong>Name:</strong> {watchedFields.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {watchedFields.email}
                    </p>
                    <p>
                      <strong>Email Verified:</strong>{" "}
                      {otpVerified ? "✓ Yes" : "✗ No"}
                    </p>
                    {selectedRole === "ngo" && (
                      <>
                        <p>
                          <strong>Organization Type:</strong>{" "}
                          {watchedFields.organizationType}
                        </p>
                        <p>
                          <strong>Contact:</strong>{" "}
                          {watchedFields.contactNumber}
                        </p>
                        <p>
                          <strong>Focus Areas:</strong>{" "}
                          {selectedFocusAreas.join(", ")}
                        </p>
                        <p>
                          <strong>Organization Size:</strong>{" "}
                          {watchedFields.organizationSize}
                        </p>
                      </>
                    )}
                    {selectedRole === "corporate" && (
                      <>
                        <p>
                          <strong>Industry Sector:</strong>{" "}
                          {getDisplayName(watchedFields.industrySector || "")}
                        </p>
                        <p>
                          <strong>Company Type:</strong>{" "}
                          {getDisplayName(watchedFields.companyType || "")}
                        </p>
                        <p>
                          <strong>Contact:</strong>{" "}
                          {watchedFields.contactNumber}
                        </p>
                        <p>
                          <strong>Company Size:</strong>{" "}
                          {watchedFields.companySize}
                        </p>
                        <p>
                          <strong>CSR Focus Areas:</strong>{" "}
                          {selectedCsrFocusAreas.map((area) => getDisplayName(area)).join(", ")}
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
                          <strong>Contact Number:</strong>{" "}
                          {watchedFields.contactNumber}
                        </p>
                        <p>
                          <strong>Nearest Railway Station:</strong>{" "}
                          {watchedFields.nearestRailwayStation}
                        </p>
                        <p>
                          <strong>Profession:</strong>{" "}
                          {watchedFields.profession === "other"
                            ? watchedFields.professionOther
                            : watchedFields.profession}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
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
                  disabled={
                    (activeStep === 2 && (emailCheckLoading || emailExists || !emailVerified || (isEmailFieldTouched && !emailValue))) ||
                    (activeStep === 3 && !otpVerified)
                  }
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-[#3ABBA5] text-white font-semibold rounded-lg hover:bg-[#36a894] transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !otpVerified}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#3ABBA5] to-[#50C878] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
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
                    "Create Account"
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center pt-3 sm:pt-4 lg:pt-6">
            <p className="text-gray-600 text-xs sm:text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#3ABBA5] font-semibold hover:underline transition-colors"
              >
                Log in here
              </Link>
            </p>
            <p className="text-gray-600 text-xs sm:text-sm mt-2">
              Are you a corporate partner?{" "}
              <button
                type="button"
                onClick={handleCorporateSignup}
                className="text-[#8B5CF6] font-semibold hover:underline transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}