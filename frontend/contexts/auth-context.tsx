"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { usePoints } from "./points-context"; // <-- import points context

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

  // ✅ Correctly usePoints inside component
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
      coins?: number; // Add coins field for registration response
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
      console.log("Attempting signup for:", { name: signupData.name, email: signupData.email, role: signupData.role });
      const { data } = await axios.post<AuthResponse>(
        "http://localhost:5000/api/v1/auth/register",
        signupData,
        { withCredentials: true } // if your backend uses cookies for JWT
      );

      console.log("Signup response received:", data);

      // Map the response user to our User interface
      const mappedUser: User = {
        _id: data.user.userId,
        id: data.user.userId,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        points: 0,
        coins: data.user.coins || 50, // Use coins from response (should be 50 for new users)
        volunteeredHours: 0,
        totalRewards: 0,
        completedEvents: [],
        createdAt: new Date().toISOString(),
        profilePicture: (data.user as any).profilePicture || undefined,
        cloudinaryPublicId: (data.user as any).cloudinaryPublicId || undefined,
      };

      console.log("Mapped user object with coins:", mappedUser.coins);

      setUser(mappedUser);
      localStorage.setItem("auth-user", JSON.stringify(mappedUser));
      localStorage.setItem("auth-token", data.tokens.accessToken);
      localStorage.setItem("refresh-token", data.tokens.refreshToken);

      // ✅ Award points after registration
      if (earnPoints) {
        await earnPoints("register"); // PTS001
      }

      // Show welcome bonus notification
      console.log("Showing welcome toast notification");
      
      // Use setTimeout to ensure the toast appears after state updates
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
      console.error(
        "Signup failed:",
        err.response?.data?.message || err.message
      );
      
      // Show specific error message from backend with better formatting
      let errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred during signup";
      
      // Parse and improve validation error messages
      if (errorMessage.includes("fails to match the required pattern")) {
        if (errorMessage.includes("address.zip")) {
          errorMessage = "Invalid ZIP/PIN code format. For India, please enter a 6-digit PIN code.";
        } else if (errorMessage.includes("contactNumber")) {
          errorMessage = "Invalid contact number format. Please enter a valid phone number with at least 10 digits.";
        } else if (errorMessage.includes("websiteUrl")) {
          errorMessage = "Invalid website URL format. Please enter a valid URL starting with http:// or https://";
        } else {
          errorMessage = "Please check the format of your input fields and try again.";
        }
      } else if (errorMessage.includes("must contain at least 10 words")) {
        errorMessage = "Organization description is too short. Please provide at least 10 words describing your organization.";
      } else if (errorMessage.includes("An account with this email already exists")) {
        errorMessage = "An account with this email already exists. Please try logging in or use a different email address.";
      } else if (errorMessage.includes("is required")) {
        // Extract field name from required error
        const fieldMatch = errorMessage.match(/"([^"]+)" is required/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1].replace(/([A-Z])/g, ' $1').toLowerCase();
          errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required for your registration.`;
        }
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
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
      const { data } = await axios.post<AuthResponse>(
        "http://localhost:5000/api/v1/auth/login",
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
        profilePicture: (data.user as any).profilePicture || undefined,
        cloudinaryPublicId: (data.user as any).cloudinaryPublicId || undefined,
      };

      setUser(mappedUser);
      localStorage.setItem("auth-user", JSON.stringify(mappedUser));
      if (data.tokens) {
        localStorage.setItem("auth-token", data.tokens.accessToken);
        localStorage.setItem("refresh-token", data.tokens.refreshToken);
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error(
        "Login failed:",
        err.response?.data?.message || err.message
      );
      
      // Show specific error message from backend with better formatting
      let errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred during login";
      
      // Parse and improve login error messages
      if (errorMessage.includes("User does not exist")) {
        errorMessage = "No account found with this email address. Please check your email or sign up for a new account.";
      } else if (errorMessage.includes("Invalid password")) {
        errorMessage = "Incorrect password. Please check your password and try again.";
      } else if (errorMessage.includes("validation")) {
        errorMessage = "Please check your email and password format and try again.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth-user");
    localStorage.removeItem("auth-token");
    localStorage.removeItem("refresh-token");
    console.log("User logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
