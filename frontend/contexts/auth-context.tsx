"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { usePoints } from "./points-context";
import api from "@/lib/api";
import { jwtDecode } from 'jwt-decode'

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
  profilePicture?: string;  // Add profile picture field
  cloudinaryPublicId?: string;  // Add cloudinary ID field
  city?: string;  // Add city field for regional filtering
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
    googleLogin: (credentialResponse: any) => Promise<boolean>; // <-- ADD THIS
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // Volunteer-specific fields
  age?: number;
  city?: string;
  profession?: string;
  // NGO-specific fields
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { earnPoints } = usePoints();

  useEffect(() => {
    const savedUser = localStorage.getItem("auth-user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleTokenExpired = () => {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      logout();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("token-expired", handleTokenExpired);
      return () => window.removeEventListener("token-expired", handleTokenExpired);
    }
  }, []);

  interface AuthResponse {
    user: {
      userId: string;
      email: string;
      name: string;
      role: UserRole;
      coins?: number;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
    message: string;
  }

  const signup = async (signupData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<AuthResponse>(
        "/v1/auth/register",
        signupData,
        { withCredentials: true }
      );

      const mappedUser: User = {
        _id: data.user.userId,
        id: data.user.userId,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        points: 0,
        coins: data.user.coins || 50,
        volunteeredHours: 0,
        totalRewards: 0,
        completedEvents: [],
        createdAt: new Date().toISOString(),
        profilePicture: (data.user as any).profilePicture || undefined,
        cloudinaryPublicId: (data.user as any).cloudinaryPublicId || undefined,
      };

      setUser(mappedUser);
      localStorage.setItem("auth-user", JSON.stringify(mappedUser));
      localStorage.setItem("auth-token", data.tokens.accessToken);
      localStorage.setItem("refresh-token", data.tokens.refreshToken);

      if (earnPoints) await earnPoints("register");

      setTimeout(() => {
        toast({
          title: "🎉 Welcome to iVolunteer!",
          description: "You've been awarded 50 coins as a welcome bonus!",
          variant: "default",
        });
      }, 100);

      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Signup failed:", err.response?.data?.message || err.message);
      toast({
        title: "Registration Failed",
        description: err.response?.data?.message || err.message || "Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
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

    const mappedUser: User = {
      _id: data.user.userId,
      id: data.user.userId,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      points: 0,
      coins: data.user.coins || 0,
      volunteeredHours: 0,
      totalRewards: 0,
      completedEvents: [],
      createdAt: new Date().toISOString(),
    };

    setUser(mappedUser);
    localStorage.setItem("auth-user", JSON.stringify(mappedUser));
    localStorage.setItem("auth-token", data.tokens.accessToken);
    localStorage.setItem("refresh-token", data.tokens.refreshToken);

    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });

    return true;
  } catch (err: any) {
    console.error("Login failed:", err.response?.data?.message || err.message);
    toast({
      title: "Login Failed",
      description: err.response?.data?.message || "Please try again.",
      variant: "destructive",
    });
    return false;
  } finally {
    setIsLoading(false);
  }
};



const googleLogin = async (credentialResponse: any): Promise<boolean> => {
  try {
    if (!credentialResponse?.credential) {
      console.error("Google credential missing");
      return false;
    }

    const decoded: any = jwtDecode(credentialResponse.credential);

    const res = await fetch(
      "https://namastep-irod.onrender.com/api/v1/auth/google-login",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          profilePicture: decoded.picture,
        }),
      }
    );

    const result = await res.json();

    if (!res.ok || !result.success || !result.data?.tokens) {
      console.error("Google login failed", result);
      return false;
    }

    // Store tokens
    localStorage.setItem("accessToken", result.data.tokens.accessToken);
    localStorage.setItem("refreshToken", result.data.tokens.refreshToken);

    return true;
  } catch (err) {
    console.error("Error in googleLogin:", err);
    return false;
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth-user");
    localStorage.removeItem("auth-token");
    localStorage.removeItem("refresh-token");
   
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login,  signup, logout,googleLogin}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};