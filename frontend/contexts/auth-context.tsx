// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import { usePoints } from "./points-context";
// import api from "@/lib/api";

// export type UserRole = "user" | "ngo" | "admin" | "corporate";

// export interface User {
//   _id: string;
//   id: string;
//   email: string;
//   name: string;
//   role: UserRole;
//   points: number;
//   coins: number;
//   volunteeredHours: number;
//   totalRewards: number;
//   completedEvents: string[];
//   createdAt: string;
//   profilePicture?: string;
//   cloudinaryPublicId?: string;
//   city?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
//   signup: (data: SignupData) => Promise<boolean>;
//   logout: () => void;
//   googleLogin: (credentialResponse: any) => Promise<boolean>;
// }

// interface SignupData {
//   name: string;
//   email: string;
//   password: string;
//   role: UserRole;
//   age?: number;
//   city?: string;
//   profession?: string;
//   organizationType?: string;
//   websiteUrl?: string;
//   yearEstablished?: number;
//   contactNumber?: string;
//   address?: { street?: string; city?: string; state?: string; zip?: string; country?: string };
//   ngoDescription?: string;
//   focusAreas?: string[];
//   organizationSize?: string;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // ---- helpers ----
// const mapUser = (u: any): User => ({
//   _id: u.userId,
//   id: u.userId,
//   email: u.email,
//   name: u.name,
//   role: u.role,
//   points: u.points ?? 0,
//   coins: u.coins ?? 0,
//   volunteeredHours: 0,
//   totalRewards: 0,
//   completedEvents: [],
//   createdAt: new Date().toISOString(),
//   profilePicture: u.profilePicture ?? undefined,
//   cloudinaryPublicId: u.cloudinaryPublicId ?? undefined,
//   city: u.city ?? undefined,
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const { earnPoints } = usePoints();

//   // --- bootstrap from localStorage or backend cookie ---
//   useEffect(() => {
//     const boot = async () => {
//       try {
//         const saved = localStorage.getItem("auth-user");
//         if (saved) {
//           setUser(JSON.parse(saved));
//           return;
//         }
//         const base = process.env.NEXT_PUBLIC_OAUTH_BASE_URL; // e.g. http://localhost:5000/api
//         if (!base) return;

//         const r = await fetch(`${base}/v1/auth/user`, { credentials: "include" });
//         if (!r.ok) return;
//         const json = await r.json();
//         const u = json?.user ?? json?.data?.user;
//         if (u) {
//           const mapped = mapUser(u);
//           setUser(mapped);
//           localStorage.setItem("auth-user", JSON.stringify(mapped));
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     boot();
//   }, []);

//   useEffect(() => {
//     const onExpire = () => {
//       toast.error("Your session has expired. Please log in again.");
//       logout();
//     };
//     window.addEventListener("token-expired", onExpire);
//     return () => window.removeEventListener("token-expired", onExpire);
//   }, []);

//   interface AuthResponse {
//     user: {
//       userId: string;
//       email: string;
//       name: string;
//       role: UserRole;
//       coins?: number;
//       profilePicture?: string;
//       cloudinaryPublicId?: string;
//       city?: string;
//       points?: number;
//     };
//     tokens: { accessToken: string; refreshToken: string };
//     message: string;
//   }

//   const signup = async (signupData: SignupData): Promise<boolean> => {
//     setIsLoading(true);
//     try {
//       const { data } = await api.post<AuthResponse>("/v1/auth/register", signupData, {
//         withCredentials: true,
//       });
//       const mapped = mapUser(data.user);
//       setUser(mapped);
//       localStorage.setItem("auth-user", JSON.stringify(mapped));
//       localStorage.setItem("auth-token", data.tokens.accessToken);
//       localStorage.setItem("refresh-token", data.tokens.refreshToken);
//       if (earnPoints) await earnPoints("register");
//       setTimeout(() => toast.success("🎉 Welcome to iVolunteer! You've been awarded 50 coins as a welcome bonus!"), 100);
//       return true;
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const login = async (email: string, password: string, role: UserRole = "user"): Promise<boolean> => {
//     setIsLoading(true);
//     try {
//       const { data } = await api.post<AuthResponse>(
//         "/v1/auth/login",
//         { email, password, role },
//         { withCredentials: true }
//       );
//       const mapped = mapUser(data.user);
//       setUser(mapped);
//       localStorage.setItem("auth-user", JSON.stringify(mapped));
//       localStorage.setItem("auth-token", data.tokens.accessToken);
//       localStorage.setItem("refresh-token", data.tokens.refreshToken);
//       return true;
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || "Login failed. Please try again.");
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // keep if you still use one-tap elsewhere
//   const googleLogin = async (credentialResponse: any): Promise<boolean> => {
//     setIsLoading(true);
//     try {
//       if (!credentialResponse?.credential) return false;
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/google-login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ idToken: credentialResponse.credential }),
//       });
//       const result = await res.json();
//       if (!res.ok || !result?.success || !result?.data?.tokens) return false;
//       const mapped = mapUser(result.data.user);
//       setUser(mapped);
//       localStorage.setItem("auth-user", JSON.stringify(mapped));
//       localStorage.setItem("auth-token", result.data.tokens.accessToken);
//       localStorage.setItem("refresh-token", result.data.tokens.refreshToken);
//       return true;
//     } catch {
//       toast.error("Google login failed. Try again.");
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("auth-user");
//     localStorage.removeItem("auth-token");
//     localStorage.removeItem("refresh-token");
//     // Optional: also clear HttpOnly cookie server-side
//     // fetch(`${process.env.NEXT_PUBLIC_OAUTH_BASE_URL}/v1/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, signup, logout, googleLogin }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// };
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { usePoints } from "./points-context";
import api from "@/lib/api";

export type UserRole = "user" | "ngo" | "admin" | "corporate";

export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: UserRole;
  points: number;
  coins: number;
  volunteeredHours: number;
  totalRewards: number;
  completedEvents: string[];
  createdAt: string;
  profilePicture?: string;
  cloudinaryPublicId?: string;
  city?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  googleLogin: (credentialResponse: any) => Promise<boolean>;
  // OTP functions
  sendOTP: (email: string) => Promise<OTPResponse>;
  verifyOTP: (email: string, otp: string) => Promise<VerifyOTPResponse>;
  resendOTP: (email: string) => Promise<OTPResponse>;
  isOTPSent: boolean;
  setIsOTPSent: (value: boolean) => void;
  otpLoading: boolean;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  age?: number;
  city?: string;
  profession?: string;
  organizationType?: string;
  websiteUrl?: string;
  yearEstablished?: number;
  contactNumber?: string;
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
  otp: string; // Add OTP field
}

// OTP Interfaces
interface OTPResponse {
  success: boolean;
  message: string;
  otp?: string; // Only in development
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- helpers ----
const mapUser = (u: any): User => ({
  _id: u.userId,
  id: u.userId,
  email: u.email,
  name: u.name,
  role: u.role,
  points: u.points ?? 0,
  coins: u.coins ?? 0,
  volunteeredHours: 0,
  totalRewards: 0,
  completedEvents: [],
  createdAt: new Date().toISOString(),
  profilePicture: u.profilePicture ?? undefined,
  cloudinaryPublicId: u.cloudinaryPublicId ?? undefined,
  city: u.city ?? undefined,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const { earnPoints } = usePoints();

  // --- bootstrap from localStorage or backend cookie ---
  useEffect(() => {
    const boot = async () => {
      try {
        const saved = localStorage.getItem("auth-user");
        if (saved) {
          setUser(JSON.parse(saved));
          return;
        }
        const base = process.env.NEXT_PUBLIC_OAUTH_BASE_URL;
        if (!base) return;

        const r = await fetch(`${base}/v1/auth/user`, {
          credentials: "include",
        });
        if (!r.ok) return;
        const json = await r.json();
        const u = json?.user ?? json?.data?.user;
        if (u) {
          const mapped = mapUser(u);
          setUser(mapped);
          localStorage.setItem("auth-user", JSON.stringify(mapped));
        }
      } finally {
        setIsLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const onExpire = () => {
      toast.error("Your session has expired. Please log in again.");
      logout();
    };
    window.addEventListener("token-expired", onExpire);
    return () => window.removeEventListener("token-expired", onExpire);
  }, []);

  interface AuthResponse {
    user: {
      userId: string;
      email: string;
      name: string;
      role: UserRole;
      coins?: number;
      profilePicture?: string;
      cloudinaryPublicId?: string;
      city?: string;
      points?: number;
    };
    tokens: { accessToken: string; refreshToken: string };
    message: string;
  }

  // OTP Functions - Fix the endpoints
  const sendOTP = async (email: string): Promise<OTPResponse> => {
    setOtpLoading(true);
    try {
      const { data } = await api.post<OTPResponse>("/v1/auth/send-otp", {
        email,
      });
      setIsOTPSent(true);
      toast.success("OTP sent successfully!");
      return data;
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to send OTP. Please try again."
      );
      throw err;
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = async (
    email: string,
    otp: string
  ): Promise<VerifyOTPResponse> => {
    setOtpLoading(true);
    try {
      const { data } = await api.post<VerifyOTPResponse>(
        "/v1/auth/verify-otp",
        { email, otp }
      );
      toast.success("Email verified successfully!");
      return data;
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Invalid OTP. Please try again."
      );
      throw err;
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOTP = async (email: string): Promise<OTPResponse> => {
    setOtpLoading(true);
    try {
      const { data } = await api.post<OTPResponse>("/v1/auth/resend-otp", {
        email,
      });
      toast.success("OTP resent successfully!");
      return data;
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to resend OTP. Please try again."
      );
      throw err;
    } finally {
      setOtpLoading(false);
    }
  };

const signup = async (signupData: SignupData): Promise<boolean> => {
  setIsLoading(true);
  try {
    // console.log("📦 Auth Context - Signup data received:", {
    //   email: signupData.email,
    //   hasOTP: !!signupData.otp,
    //   otpValue: signupData.otp,
    //   otpLength: signupData.otp?.length,
    //   role: signupData.role,
    //   allKeys: Object.keys(signupData)
    // });

    // Validate OTP exists
    if (!signupData.otp) {
      console.error("❌ OTP is missing in auth context");
      toast.error("❌ OTP is missing from signup data");
      return false;
    }

    if (!signupData.email) {
      console.error("❌ Email is missing in auth context");
      toast.error("❌ Email is missing from signup data");
      return false;
    }

    // Log what will be sent
    console.log("🌐 About to send to API:", {
      url: "/v1/auth/register",
      dataKeys: Object.keys(signupData),
      hasOTP: !!signupData.otp,
      otpValue: signupData.otp
    });
    
    // Make API call - signupData should contain OTP
    const { data } = await api.post<AuthResponse>(
      "/v1/auth/register",
      signupData, // ✅ This should include OTP
      {
        withCredentials: true,
      }
    );

    // console.log("✅ Registration successful:", {
    //   userId: data.user.userId,
    //   email: data.user.email,
    // });

    const mapped = mapUser(data.user);
    setUser(mapped);
    localStorage.setItem("auth-user", JSON.stringify(mapped));
    localStorage.setItem("auth-token", data.tokens.accessToken);
    localStorage.setItem("refresh-token", data.tokens.refreshToken);

    if (earnPoints) await earnPoints("register");
    setTimeout(
      () =>
        toast.success(
          "🎉 Welcome to iVolunteer! You've been awarded 50 coins as a welcome bonus!"
        ),
      100
    );
    setIsOTPSent(false);
    return true;
  } catch (err: any) {
    console.error("💥 Signup error:", {
      status: err?.response?.status,
      message: err?.response?.data?.message,
      data: err?.response?.data,
      fullError: err,
    });

    const errorMessage =
      err?.response?.data?.message || err?.message || "Registration failed";
    toast.error(errorMessage);
    return false;
  } finally {
    setIsLoading(false);
  }
};
  const login = async (
    email: string,
    password: string,
    role: UserRole = "user"
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<AuthResponse>(
        "/v1/auth/login",
        { email, password, role },
        { withCredentials: true }
      );
      const mapped = mapUser(data.user);
      setUser(mapped);
      localStorage.setItem("auth-user", JSON.stringify(mapped));
      localStorage.setItem("auth-token", data.tokens.accessToken);
      localStorage.setItem("refresh-token", data.tokens.refreshToken);
      return true;
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Login failed. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credentialResponse: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!credentialResponse?.credential) return false;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/google-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken: credentialResponse.credential }),
        }
      );
      const result = await res.json();
      if (!res.ok || !result?.success || !result?.data?.tokens) return false;
      const mapped = mapUser(result.data.user);
      setUser(mapped);
      localStorage.setItem("auth-user", JSON.stringify(mapped));
      localStorage.setItem("auth-token", result.data.tokens.accessToken);
      localStorage.setItem("refresh-token", result.data.tokens.refreshToken);
      return true;
    } catch {
      toast.error("Google login failed. Try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth-user");
    localStorage.removeItem("auth-token");
    localStorage.removeItem("refresh-token");
    setIsOTPSent(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        googleLogin,
        // OTP functions
        sendOTP,
        verifyOTP,
        resendOTP,
        isOTPSent,
        setIsOTPSent,
        otpLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
