"use client";

import React, { useEffect } from "react";
import { useAdmin } from "@/contexts/admin-context";
import { Calendar, Gift, Clock, Sparkles, Users, Shield } from "lucide-react";

const Adminstats = () => {
  const {
    pendingEvents,
    pendingDonationEvents,
    fetchPendingEvents,
    fetchPendingDonationEvents,
  } = useAdmin();

  useEffect(() => {
    fetchPendingEvents();
    fetchPendingDonationEvents();
  }, []);

  const metrics = [
    {
      title: "Pending Events",
      value: pendingEvents.length,
      icon: <Calendar className="w-5 h-5 text-[#5D8A6E]" />,
      gradient: "from-[#F0F7F4] to-[#E1F0E8]",
      border: "border-l-4 border-[#5D8A6E]",
      accent: "bg-[#5D8A6E]/10",
      description: "Awaiting approval",
      trend: "community gatherings"
    },
    {
      title: "Pending Donation Events",
      value: pendingDonationEvents.length,
      icon: <Gift className="w-5 h-5 text-[#A56CB4]" />,
      gradient: "from-[#F9F3FB] to-[#F4EAF7]",
      border: "border-l-4 border-[#A56CB4]",
      accent: "bg-[#A56CB4]/10",
      description: "Needs review",
      trend: "charity drives"
    },
    {
      title: "Total Events",
      value: pendingEvents.length + pendingDonationEvents.length,
      icon: <Clock className="w-5 h-5 text-[#4A8BBA]" />,
      gradient: "from-[#F0F7FC] to-[#E4F0F8]",
      border: "border-l-4 border-[#4A8BBA]",
      accent: "bg-[#4A8BBA]/10",
      description: "Combined total",
      trend: "all activities"
    },
  ];

  return (
    <div className="  dark:from-gray-900 dark:to-green-950/20">
      {/* Attractive but Simple Header */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-2">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-green-100 dark:border-green-900/30 shadow-sm mb-4">
              <div className="w-2 h-2 bg-[#5D8A6E] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                System Active
              </span>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Admin Dashboard
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#5D8A6E] to-[#A56CB4] rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Welcome back! Here's your overview of community activities waiting for attention.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm border border-green-100 dark:border-green-900/30">
                <Sparkles className="w-5 h-5 text-[#7AA981]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Event Overview
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Real-time insights into community activities
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Admin Privileges</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={metric.title}
                className={`relative p-6 rounded-3xl bg-gradient-to-br ${metric.gradient} ${metric.border} shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden border border-white/50 dark:border-gray-700/50`}
              >
                {/* Animated background elements */}
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full ${metric.accent} opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>
                <div className={`absolute bottom-0 left-0 w-16 h-16 -ml-4 -mb-4 rounded-full ${metric.accent} opacity-30 group-hover:scale-125 transition-transform duration-700 delay-100`}></div>
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 shadow-sm backdrop-blur-sm border border-white/50 ${metric.accent}`}>
                      {metric.icon}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/50">
                      #{index + 1}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 tracking-wide uppercase">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                      {metric.value}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {metric.description}
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                  
                  {/* Interactive dots */}
                  <div className="flex gap-1.5 mt-6">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          i === 0 
                            ? "bg-[#5D8A6E]" 
                            : i === 1 
                            ? "bg-[#A56CB4]" 
                            : "bg-[#4A8BBA]"
                        } ${i === index % 3 ? "opacity-100 scale-110" : "opacity-30"}`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 dark:border-green-900/30 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Users className="w-5 h-5 text-[#5D8A6E]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Community Impact
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Managing {pendingEvents.length + pendingDonationEvents.length} total volunteer opportunities
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Last updated: Just now
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  iVolunteer Community Dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adminstats;