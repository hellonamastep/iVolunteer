"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  Clock,
  ArrowRight,
  Briefcase,
  Target,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface CorporateEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  city: string;
  category: string;
  volunteersNeeded: number;
  image?: string;
  corporatePartner?: string;
  csrObjectives?: string[];
  status: string;
  createdBy: {
    name: string;
    organizationName?: string;
  };
  bids?: Array<{
    _id: string;
    status: string;
  }>;
}

export default function CorporateEventsList() {
  const [events, setEvents] = useState<CorporateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCorporateEvents = async () => {
      try {
        setLoading(true);
        // Use dedicated endpoint for approved corporate events
        const response = await api.get("/v1/event/approved-corporate");
        const corporateEvents = (response.data as { events?: CorporateEvent[] })?.events || [];
        setEvents(corporateEvents);
      } catch (err: any) {
        console.error("Error fetching corporate events:", err);
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchCorporateEvents();

    // Auto-scroll to corporate events section on mount with slight delay
    setTimeout(() => {
      const section = document.getElementById('corporate-events');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <section className="bg-[#f0f9f8] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#f0f9f8] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Events</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#39c2ba] text-white rounded-lg hover:bg-[#2da59e] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="corporate-events" className="bg-[#f0f9f8] py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f8c3] rounded-full">
            <Briefcase className="w-4 h-4 text-[#173043]" />
            <span className="text-[#173043] text-base">Your CSR Events</span>
          </div>
          <h2 className="text-[#173043] text-3xl sm:text-4xl lg:text-5xl font-normal">
            Corporate Events Dashboard
          </h2>
          <p className="text-[#173043]/80 text-base sm:text-lg max-w-2xl mx-auto">
            Track and manage your corporate social responsibility events and initiatives.
          </p>
        </div>

        {/* Clickable Corporate Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => router.push("/allcorporateevents")}
          className="bg-gradient-to-br from-[#39c2ba]/10 via-[#8ce27a]/10 to-[#f5f8c3]/50 rounded-3xl p-8 md:p-12 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#39c2ba]/30"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left Side - Icon & Info */}
            <div className="flex-1 space-y-4">
              <div className="w-20 h-20 bg-[#39c2ba] rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold text-[#173043]">
                Explore Corporate Events
              </h3>
              <p className="text-[#173043]/70 text-base md:text-lg">
                {loading ? (
                  <span className="animate-pulse">Loading events...</span>
                ) : error ? (
                  <span className="text-red-600">Error loading events</span>
                ) : events.length === 0 ? (
                  "No corporate events available yet. Check back soon!"
                ) : (
                  `${events.length} corporate ${events.length === 1 ? 'event' : 'events'} available for your organization`
                )}
              </p>
              <div className="flex items-center gap-2 text-[#39c2ba] font-medium">
                <span>View All Events</span>
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
                      {loading ? "..." : events.length}
                    </div>
                    <div className="text-sm text-[#173043]/60 mt-1">Events</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
