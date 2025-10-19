"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  CalendarCheck, 
  CalendarClock, 
  HeartHandshake, 
  PiggyBank, 
  TrendingUp,
  BarChart3,
  Target
} from "lucide-react";
import { useNGO } from "@/contexts/ngo-context"; // import your context

const Ngoanalytics = () => {
  const { organizationEvents, fetchOrganizationEvents, loading } = useNGO();
  const [stats, setStats] = useState<any[]>([]);

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
        icon: <CalendarCheck className="w-6 h-6 text-[#3B82F6]" />,
        color: "text-[#3B82F6]",
        bg: "bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]",
        border: "border-transparent",
        trend: { value: 12, isPositive: true }
      },
      {
        title: "Upcoming Events",
        value: upcomingEvents,
        icon: <CalendarClock className="w-6 h-6 text-[#7B68EE]" />,
        color: "text-[#7B68EE]",
        bg: "bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF]",
        border: "border-transparent",
        trend: { value: 5, isPositive: false }
      },
      {
        title: "Total Volunteers",
        value: totalVolunteers,
        icon: <Users className="w-6 h-6 text-[#7FD47F]" />,
        color: "text-[#7FD47F]",
        bg: "bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]",
        border: "border-transparent",
        trend: { value: 24, isPositive: true }
      },
      {
        title: "Funds Raised",
        value: `$${fundsRaised.toLocaleString()}`,
        icon: <PiggyBank className="w-6 h-6 text-[#F9D71C]" />,
        color: "text-[#F9D71C]",
        bg: "bg-gradient-to-br from-[#FEFCE8] to-[#FEF9C2]",
        border: "border-transparent",
        trend: { value: 18, isPositive: true }
      },
      {
        title: "Communities Impacted",
        value: communitiesImpacted,
        icon: <HeartHandshake className="w-6 h-6 text-[#EC4899]" />,
        color: "text-[#EC4899]",
        bg: "bg-gradient-to-br from-[#FDF2F8] to-[#FCE7F3]",
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`${stat.bg} rounded-2xl p-5 flex flex-col justify-between shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden relative cursor-pointer transition-all duration-300 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.15),0px_4px_6px_-2px_rgba(0,0,0,0.1)] hover:brightness-105 hover:saturate-150`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-7">
                  <div className="flex-1">
                    {stat.icon}
                  </div>
                  <div className="p-2 rounded-xl bg-white/60">
                    <TrendingUp className={`w-4 h-4 ${stat.trend.isPositive ? 'text-[#7FD47F]' : 'text-[#EF4444] rotate-180'}`} />
                  </div>
                </div>
                
                <div className="">
                  <p className={`text-3xl font-medium ${stat.color} mb-3`}>{stat.value}</p>
                  <p className="text-xs font-normal text-[#6B7280] uppercase tracking-wide">{stat.title}</p>
                </div>
                
                <div className="flex items-center pt-3 border-t border-gray-100">
                  <div className={`flex items-center text-xs font-normal ${stat.trend.isPositive ? 'text-[#7FD47F]' : 'text-[#EF4444]'}`}>
                    <span>+{stat.trend.value}%</span>
                  </div>
                  <span className="text-xs text-[#6B7280] ml-1">from last month</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ngoanalytics;
