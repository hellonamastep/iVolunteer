"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion } from "framer-motion";
import {
  Building2,
  ArrowRight,
  Briefcase,
  Loader2,
  Users,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface CorporateInterest {
  _id: string;
  event: {
    _id: string;
    title: string;
    date: string;
  };
  corporateUser: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

const CorporateInterestsSection = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [interests, setInterests] = useState<CorporateInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if user is authenticated and is an NGO
    if (user && user.role === "ngo") {
      fetchInterests();
    } else if (user && user.role !== "ngo") {
      // User is authenticated but not an NGO - don't show error, just don't load
      setLoading(false);
    } else {
      // User not authenticated yet - wait
      setLoading(true);
    }
  }, [user]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if auth token exists
      const token = localStorage.getItem("auth-token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await api.get("/v1/corporate-interest/ngo-interests");
      const data = response.data as { interests?: CorporateInterest[] };
      setInterests(data.interests || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching corporate interests:", err);
      
      // Handle different error types
      if (err.response?.status === 403) {
        setError("Access denied. This feature is only available for NGO accounts.");
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(err.response?.data?.message || "Failed to load interests");
      }
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = interests.filter(i => i.status === "pending").length;

  // Don't render for non-NGO users
  if (user && user.role !== "ngo") {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-[#39c2ba]/10 via-[#8ce27a]/10 to-[#f5f8c3]/50 rounded-3xl p-6 md:p-8 lg:p-12">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#39c2ba]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gradient-to-br from-red-50 to-red-100/50 rounded-3xl p-6 md:p-8 border-2 border-red-200">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium mb-2">Unable to load Corporate Interests</p>
          <p className="text-red-500 text-sm mb-4 max-w-md">{error}</p>
          <button
            onClick={fetchInterests}
            className="px-6 py-2 bg-[#39c2ba] text-white rounded-lg hover:bg-[#2da59e] transition-colors text-sm font-medium shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => router.push("/corporate-interests")}
      className="w-full bg-gradient-to-br from-[#39c2ba]/10 via-[#8ce27a]/10 to-[#f5f8c3]/50 rounded-3xl p-6 md:p-8 lg:p-12 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#39c2ba]/30"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        {/* Left Side - Icon & Info */}
        <div className="flex-1 space-y-3 md:space-y-4 text-center md:text-left w-full">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#39c2ba] rounded-2xl flex items-center justify-center shadow-lg mx-auto md:mx-0">
            <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#173043]">
            Corporate Interests
          </h3>
          <p className="text-[#173043]/70 text-sm md:text-base lg:text-lg">
            {interests.length === 0 ? (
              "No corporate interests yet. When organizations express interest in your events, they will appear here."
            ) : pendingCount > 0 ? (
              `${pendingCount} pending ${pendingCount === 1 ? 'request' : 'requests'} awaiting your response`
            ) : (
              `${interests.length} corporate ${interests.length === 1 ? 'organization has' : 'organizations have'} shown interest in your events`
            )}
          </p>
          <div className="flex items-center gap-2 text-[#39c2ba] font-medium justify-center md:justify-start">
            <span>View All Interests</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Right Side - Visual Element */}
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
            <div className="absolute inset-0 bg-gradient-to-br from-[#39c2ba] to-[#8ce27a] rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-3 md:inset-4 bg-gradient-to-br from-[#39c2ba] to-[#8ce27a] rounded-full opacity-40"></div>
            <div className="absolute inset-6 md:inset-8 bg-white rounded-full flex items-center justify-center shadow-xl">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#39c2ba]">
                  {interests.length}
                </div>
                <div className="text-xs md:text-sm text-[#173043]/60 mt-1">
                  {pendingCount > 0 ? (
                    <span className="text-yellow-600 font-medium">{pendingCount} Pending</span>
                  ) : (
                    "Interests"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CorporateInterestsSection;
