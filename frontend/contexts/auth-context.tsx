// "use client";
// import React, { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { usePoints } from "./points-context";
// import api from "@/lib/api";
// import { jwtDecode } from 'jwt-decode'
// import { log } from "node:console";

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
//   profilePicture?: string;  // Add profile picture field
//   cloudinaryPublicId?: string;  // Add cloudinary ID field
//   city?: string;  // Add city field for regional filtering
// }

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
//   signup: (data: SignupData) => Promise<boolean>;
//   logout: () => void;
//     googleLogin: (credentialResponse: any) => Promise<boolean>; // <-- ADD THIS
// }

// interface SignupData {
//   name: string;
//   email: string;
//   password: string;
//   role: UserRole;
//   // Volunteer-specific fields
//   age?: number;
//   city?: string;
//   profession?: string;
//   // NGO-specific fields
//   organizationType?: string;
//   websiteUrl?: string;
//   yearEstablished?: number;
//   contactNumber?: string;
//   address?: {
//     street?: string;
//     city?: string;
//     state?: string;
//     zip?: string;
//     country?: string;
//   };
//   ngoDescription?: string;
//   focusAreas?: string[];
//   organizationSize?: string;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const { earnPoints } = usePoints();

//   useEffect(() => {
//     const savedUser = localStorage.getItem("auth-user");
//     if (savedUser) setUser(JSON.parse(savedUser));
//     setIsLoading(false);
//   }, []);

//   useEffect(() => {
//     const handleTokenExpired = () => {
//       toast.error("Your session has expired. Please log in again.");
//       logout();
//     };

//     if (typeof window !== "undefined") {
//       window.addEventListener("token-expired", handleTokenExpired);
//       return () => window.removeEventListener("token-expired", handleTokenExpired);
//     }
//   }, []);

//   interface AuthResponse {
//     user: {
//       userId: string;
//       email: string;
//       name: string;
//       role: UserRole;
//       coins?: number;
//     };
//     tokens: {
//       accessToken: string;
//       refreshToken: string;
//     };
//     message: string;
//   }

//   const signup = async (signupData: SignupData): Promise<boolean> => {
//     setIsLoading(true);
//     try {
//       const { data } = await api.post<AuthResponse>(
//         "/v1/auth/register",
//         signupData,
//         { withCredentials: true }
//       );

//       const mappedUser: User = {
//         _id: data.user.userId,
//         id: data.user.userId,
//         email: data.user.email,
//         name: data.user.name,
//         role: data.user.role,
//         points: 0,
//         coins: data.user.coins || 50,
//         volunteeredHours: 0,
//         totalRewards: 0,
//         completedEvents: [],
//         createdAt: new Date().toISOString(),
//         profilePicture: (data.user as any).profilePicture || undefined,
//         cloudinaryPublicId: (data.user as any).cloudinaryPublicId || undefined,
//       };

//       setUser(mappedUser);
//       localStorage.setItem("auth-user", JSON.stringify(mappedUser));
//       localStorage.setItem("auth-token", data.tokens.accessToken);
//       localStorage.setItem("refresh-token", data.tokens.refreshToken);

//       if (earnPoints) await earnPoints("register");

//       setTimeout(() => {
//         toast.success("🎉 Welcome to iVolunteer! You've been awarded 50 coins as a welcome bonus!");
//       }, 100);

//       setIsLoading(false);
//       return true;
//     } catch (err: any) {
//       console.error("Signup failed:", err.response?.data?.message || err.message);
//       toast.error(err.response?.data?.message || err.message || "Registration failed. Please try again.");
//       setIsLoading(false);
//       return false;
//     }
//   };

  

//   const login = async (
//   email: string,
//   password: string,
//   role: UserRole = "user"
// ): Promise<boolean> => {
//   setIsLoading(true);
//   try {
//     const { data } = await api.post<AuthResponse>(
//       "/v1/auth/login",
//       { email, password, role },
//       { withCredentials: true }
//     );

//     const mappedUser: User = {
//       _id: data.user.userId,
//       id: data.user.userId,
//       email: data.user.email,
//       name: data.user.name,
//       role: data.user.role,
//       points: 0,
//       coins: data.user.coins || 0,
//       volunteeredHours: 0,
//       totalRewards: 0,
//       completedEvents: [],
//       createdAt: new Date().toISOString(),
//     };

//     setUser(mappedUser);
//     localStorage.setItem("auth-user", JSON.stringify(mappedUser));
//     localStorage.setItem("auth-token", data.tokens.accessToken);
//     localStorage.setItem("refresh-token", data.tokens.refreshToken);

//     // Don't show toast here - let the login page handle it
//     // toast.success("Login successful! Welcome back!");

//     return true;
//   } catch (err: any) {
//     console.error("Login failed:", err.response?.data?.message || err.message);
//     // Show the specific error message from backend
//     toast.error(err.response?.data?.message || "Login failed. Please try again.");
//     return false;
//   } finally {
//     setIsLoading(false);
//   }
// };



// const googleLogin = async (credentialResponse: any): Promise<boolean> => {
//   setIsLoading(true);
//   try {
//     if (!credentialResponse?.credential) return false;

//     // Send the raw Google JWT to backend; backend already verifies/creates user
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/google-login`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include", // allow HttpOnly cookies if you use them
//         body: JSON.stringify({ idToken: credentialResponse.credential }),
//       }
//     );

//     const result = await res.json();
//     // your ApiResponse: { success, data: { user, tokens }, message }
//     if (!res.ok || !result?.success || !result?.data?.tokens) return false;

//     const d = result.data;

//     // Map to your User type
//     const mappedUser: User = {
//       _id: d.user.userId,
//       id:  d.user.userId,
//       email: d.user.email,
//       name: d.user.name,
//       role: d.user.role,
//       points: 0,
//       coins: d.user.coins ?? 0,
//       volunteeredHours: 0,
//       totalRewards: 0,
//       completedEvents: [],
//       createdAt: new Date().toISOString(),
//       profilePicture: d.user.profilePicture ?? undefined,
//       cloudinaryPublicId: d.user.cloudinaryPublicId ?? undefined,
//       city: d.user.city ?? undefined,
//     };

//     // Persist using the SAME keys used elsewhere
//     setUser(mappedUser);
//     console.log(user);
    
//     localStorage.setItem("auth-user", JSON.stringify(mappedUser));
//     localStorage.setItem("auth-token", d.tokens.accessToken);
//     localStorage.setItem("refresh-token", d.tokens.refreshToken);

//     setIsLoading(false);
//     return true;
//   } catch (err: any) {
//     console.error("Google login error:", err?.message || err);
//     toast.error("Google login failed. Try again.");
//     return false;
//   } finally {
//     setIsLoading(false);
//   }
// };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("auth-user");
//     localStorage.removeItem("auth-token");
//     localStorage.removeItem("refresh-token");
   
//   };

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login,  signup, logout,googleLogin}}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
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
  address?: { street?: string; city?: string; state?: string; zip?: string; country?: string };
  ngoDescription?: string;
  focusAreas?: string[];
  organizationSize?: string;
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
        const base = process.env.NEXT_PUBLIC_OAUTH_BASE_URL; // e.g. http://localhost:5000/api
        if (!base) return;

        const r = await fetch(`${base}/v1/auth/user`, { credentials: "include" });
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

  const signup = async (signupData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/v1/auth/register", signupData, {
        withCredentials: true,
      });
      const mapped = mapUser(data.user);
      setUser(mapped);
      localStorage.setItem("auth-user", JSON.stringify(mapped));
      localStorage.setItem("auth-token", data.tokens.accessToken);
      localStorage.setItem("refresh-token", data.tokens.refreshToken);
      if (earnPoints) await earnPoints("register");
      setTimeout(() => toast.success("🎉 Welcome to iVolunteer! You've been awarded 50 coins as a welcome bonus!"), 100);
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: UserRole = "user"): Promise<boolean> => {
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
      toast.error(err?.response?.data?.message || "Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // keep if you still use one-tap elsewhere
  const googleLogin = async (credentialResponse: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!credentialResponse?.credential) return false;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });
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
    // Optional: also clear HttpOnly cookie server-side
    // fetch(`${process.env.NEXT_PUBLIC_OAUTH_BASE_URL}/v1/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
