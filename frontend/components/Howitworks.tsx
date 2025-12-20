"use client";
import React from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Coins } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover Opportunities",
    desc: "Search and filter events that match your interests",
  },
  {
    icon: UserPlus,
    title: "Sign Up & Join",
    desc: "Choose your role and participate in activities",
  },
  {
    icon: Coins,
    title: "Earn KarmaCoins",
    desc: "Get recognized for your contributions",
  },
];

const Howitworks = () => {
  return (
    <section className="relative w-full bg-[#4FC3DC] py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full" />
        <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            className="text-white text-3xl sm:text-4xl md:text-5xl font-semibold mb-4"
            style={{ fontFamily: "Satoshi, sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How NAMASTEP Works
          </motion.h2>
          <motion.p
            className="text-white/80 text-base sm:text-lg max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Simple, rewarding, and impactful
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -5 }}
              >
                {/* Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#4FC3DC]" />
                </div>

                {/* Content */}
                <h3
                  className="text-gray-900 text-lg sm:text-xl font-semibold mb-2"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-gray-500 text-sm sm:text-base"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Howitworks;
