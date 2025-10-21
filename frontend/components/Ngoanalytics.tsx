"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  CalendarCheck, 
  CalendarClock, 
  HeartHandshake, 
  PiggyBank, 
  TrendingUp,
  BarChart3,
  Target,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useNGO } from "@/contexts/ngo-context"; // import your context

const Ngoanalytics = () => {
  const { organizationEvents, fetchOrganizationEvents, loading } = useNGO();
  const [stats, setStats] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false); // For mobile toggle

  useEffect(() => {
    fetchOrganizationEvents(); // fetch organization events on mount
  }, []);

  useEffect(() => {
    // Compute stats dynamically from organization events
    const activeEvents = organizationEvents.filter(e => new Date(e.date) > new Date()).length;
    const upcomingEvents = organizationEvents.filter(e => new Date(e.date) > new Date()).length; // same as active for demo
    const totalVolunteers = organizationEvents.reduce((acc, e) => acc + (e.participants?.length || 0), 0);
    const fundsRaised = organizationEvents.reduce((acc, e) => acc + (e.sponsorshipAmount || 0), 0);
    const communitiesImpacted = new Set(organizationEvents.map(e => e.location)).size;

    setStats([
      {
        title: "Active Events",
        value: activeEvents,
        icon: <CalendarCheck className="w-6 h-6 text-[#4BA89E]" />,
        color: "text-[#4BA89E]",
        bg: "bg-gradient-to-br from-[#E0F7F5] to-[#9ee0d9]",
        border: "border-transparent",
        trend: { value: 12, isPositive: true }
      },
      {
        title: "Upcoming Events",
        value: upcomingEvents,
        icon: <CalendarClock className="w-6 h-6 text-[#4BA89E]" />,
        color: "text-[#4BA89E]",
        bg: "bg-gradient-to-br from-[#E0F7F5] to-[#b1e7e1]",
        border: "border-transparent",
        trend: { value: 5, isPositive: false }
      },
      {
        title: "Total Volunteers",
        value: totalVolunteers,
        icon: <Users className="w-6 h-6 text-[#4BA89E]" />,
        color: "text-[#4BA89E]",
        bg: "bg-gradient-to-br from-[#E0F7F5] to-[#9ee0d9]",
        border: "border-transparent",
        trend: { value: 24, isPositive: true }
      },
      {
        title: "Funds Raised",
        value: `₹${fundsRaised.toLocaleString()}`,
        icon: <PiggyBank className="w-6 h-6 text-[#4BA89E]" />,
        color: "text-[#4BA89E]",
        bg: "bg-gradient-to-br from-[#E0F7F5] to-[#b1e7e1]",
        border: "border-transparent",
        trend: { value: 18, isPositive: true }
      },
      {
        title: "Communities Impacted",
        value: communitiesImpacted,
        icon: <HeartHandshake className="w-6 h-6 text-[#4BA89E]" />,
        color: "text-[#4BA89E]",
        bg: "bg-gradient-to-br from-[#E0F7F5] to-[#9ee0d9]",
        border: "border-transparent",
        trend: { value: 8, isPositive: true }
      },
    ]);
  }, [organizationEvents]);

  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => setIsVisible(true), []);

  if (loading) return (
    <div className="flex justify-center items-center p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
    </div>
  );

  return (
    <section className="px-4 py-8 md:px-8 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Mobile Toggle Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden w-full flex items-center justify-between p-4 bg-gradient-to-br from-[#4FC3DC] to-[#5BCCC4] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-white font-semibold text-base">Analytics Dashboard</h2>
                <p className="text-white/80 text-xs">Tap to view metrics</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.div>
          </button>
        </motion.div>

        {/* Desktop Header (Always Visible) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-[#4FC3DC] to-[#5BCCC4] rounded-xl">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-base font-normal text-[#2C3E50]">
              NGO Analytics Dashboard
            </h1>
          </div>
          <p className="text-[#6B7280] text-base">Track your organization's impact and performance metrics</p>
        </motion.div>

        {/* Mobile: Horizontal Scrollable Cards (Conditional) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mb-6 overflow-hidden"
            >
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className={`${stat.bg} rounded-2xl p-5 flex flex-col justify-between shadow-lg min-w-[240px] snap-center flex-shrink-0`}
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-7">
                        <div className="flex-1">
                          {stat.icon}
                        </div>
                      </div>
                      
                      <div className="">
                        <p className={`text-3xl font-medium ${stat.color} mb-3`}>{stat.value}</p>
                        <p className="text-xs font-normal text-[#6B7280] uppercase tracking-wide">{stat.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop: Horizontal Scrollable Cards */}
        <div className="hidden md:block overflow-hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#4FC3DC] scrollbar-track-gray-100 hover:scrollbar-thumb-[#5BCCC4]">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`${stat.bg} rounded-2xl p-5 flex flex-col justify-between shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden relative cursor-pointer transition-all duration-300 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.15),0px_4px_6px_-2px_rgba(0,0,0,0.1)] hover:brightness-105 hover:saturate-150 min-w-[200px] snap-center flex-shrink-0`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-7">
                    <div className="flex-1">
                      {stat.icon}
                    </div>
                  </div>
                  
                  <div className="">
                    <p className={`text-3xl font-medium ${stat.color} mb-3`}>{stat.value}</p>
                    <p className="text-xs font-normal text-[#6B7280] uppercase tracking-wide">{stat.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <style jsx>{`
            .scrollbar-thin::-webkit-scrollbar {
              height: 8px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background: #4FC3DC;
              border-radius: 10px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
              background: #5BCCC4;
            }
          `}</style>
        </div>
      </div>
    </section>
  );
};

export default Ngoanalytics;
