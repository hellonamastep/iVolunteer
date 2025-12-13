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
} from "lucide-react";

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
  const [interests, setInterests] = useState<CorporateInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/corporate-interest/ngo-interests");
      const data = response.data as { interests?: CorporateInterest[] };
      setInterests(data.interests || []);
    } catch (err: any) {
      console.error("Error fetching corporate interests:", err);
      setError(err.response?.data?.message || "Failed to load interests");
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = interests.filter(i => i.status === "pending").length;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#39c2ba]/10 via-[#8ce27a]/10 to-[#f5f8c3]/50 rounded-3xl p-8 md:p-12">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#39c2ba]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#39c2ba]/10 via-[#8ce27a]/10 to-[#f5f8c3]/50 rounded-3xl p-8 md:p-12">
        <div className="text-center py-6">
          <p className="text-red-500 text-sm mb-3">{error}</p>
          <button
            onClick={fetchInterests}
            className="px-4 py-2 bg-[#39c2ba] text-white rounded-lg hover:bg-[#2da59e] transition-colors text-sm"
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
      className="bg-gradient-to-br from-[#39c2ba]/10 via-[#8ce27a]/10 to-[#f5f8c3]/50 rounded-3xl p-8 md:p-12 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#39c2ba]/30"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Side - Icon & Info */}
        <div className="flex-1 space-y-4">
          <div className="w-20 h-20 bg-[#39c2ba] rounded-2xl flex items-center justify-center shadow-lg">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#173043]">
            Corporate Interests
          </h3>
          <p className="text-[#173043]/70 text-base md:text-lg">
            {interests.length === 0 ? (
              "No corporate interests yet. When organizations express interest in your events, they will appear here."
            ) : pendingCount > 0 ? (
              `${pendingCount} pending ${pendingCount === 1 ? 'request' : 'requests'} awaiting your response`
            ) : (
              `${interests.length} corporate ${interests.length === 1 ? 'organization has' : 'organizations have'} shown interest in your events`
            )}
          </p>
          <div className="flex items-center gap-2 text-[#39c2ba] font-medium">
            <span>View All Interests</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Right Side - Visual Element */}
        <div className="flex-shrink-0">
          <div className="relative w-40 h-40 md:w-48 md:h-48">
            <div className="absolute inset-0 bg-gradient-to-br from-[#39c2ba] to-[#8ce27a] rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-[#39c2ba] to-[#8ce27a] rounded-full opacity-40"></div>
            <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#39c2ba]">
                  {interests.length}
                </div>
                <div className="text-sm text-[#173043]/60 mt-1">
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
