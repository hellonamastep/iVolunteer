"use client";
import React from "react";
import { motion } from "framer-motion";
import { Coins, Award, Flame, PiggyBank, Wallet, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Add this import

const Useranalytics = () => {
  const {
    activeCoins,
    totalCoinsEarned,
    totalSpend,
    badges,
    streak,
    isLoading,
  } = useUser();

  const router = useRouter(); 

  const stats = [
    {
      title: "Active Coins",
      value: activeCoins,
      icon: <Coins className="w-6 h-6 text-[#4FC3DC]" />,
      color: "text-[#4FC3DC]",
    },
    {
      title: "Total Coins Earned",
      value: totalCoinsEarned,
      icon: <PiggyBank className="w-6 h-6 text-[#7FD47F]" />,
      color: "text-[#7FD47F]",
    },
    {
      title: "Goal Speed",
      value: 0, // You can replace this with actual goal speed data
      icon: <Flame className="w-6 h-6 text-[#F9D71C]" />,
      color: "text-[#F9D71C]",
    },
    {
      title: "Badges",
      value: badges || 0,
      icon: <Award className="w-6 h-6 text-[#EC4899]" />,
      color: "text-[#EC4899]",
      link: "/badges",
    },
  ];

  if (isLoading) {
    return (
      <section className="px-4 py-6 md:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] flex flex-col h-[174.4px]"
              >
                <div className="flex justify-between items-start mb-9">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 md:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => {
            const CardContent = (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  scale: stat.link ? 1.03 : 1.02,
                  transition: { duration: 0.2 },
                }}
                className={`bg-white rounded-2xl px-5 pt-5 pb-0 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-lg flex flex-col h-[174.4px] transition-all ${
                  stat.link ? "cursor-pointer" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-9">
                  <p className="text-xs font-normal text-[#6B7280] uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <div className="flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
                <p className={`text-3xl font-medium ${stat.color}`}>
                  {stat.value}
                </p>
              </motion.div>
            );

            return stat.link ? (
              <Link key={stat.title} href={stat.link} className="block">
                {CardContent}
              </Link>
            ) : (
              CardContent
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Useranalytics;
