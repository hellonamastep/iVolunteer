"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Coins, Award, Trophy, Users } from "lucide-react";

const features = [
  {
    icon: Coins,
    text: "Earn for every activity",
    color: "text-yellow-500",
  },
  {
    icon: Award,
    text: "Unlock achievement badges",
    color: "text-green-500",
  },
  {
    icon: Trophy,
    text: "Climb the leaderboard",
    color: "text-purple-500",
  },
];

const Gamified = () => {
  return (
    <section className="relative w-full bg-[#F8F9FA] py-16 sm:py-20 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-gray-900 text-2xl sm:text-3xl md:text-4xl font-semibold mb-4"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Get Gamified Rewards
            </h2>
            <p
              className="text-gray-500 text-base sm:text-lg mb-8 max-w-lg"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Earn KarmaCoins by participating. Use them to unlock badges, appear on the leaderboard, and gain community recognition — purely for fun and engagement.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center ${feature.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-gray-700 font-medium text-base sm:text-lg">
                      {feature.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Button */}
            <Link href="/rewards">
              <motion.button
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#4FC3DC] text-[#4FC3DC] font-medium text-sm sm:text-base rounded-full hover:bg-[#4FC3DC] hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                How KarmaCoins Work
              </motion.button>
            </Link>
          </motion.div>

          {/* Right Side - Illustration */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Main circular container */}
              <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px]">
                {/* Background gradient circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8CE27A]/30 to-[#4FC3DC]/30" />
                
                {/* Inner circle */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#8CE27A] to-[#5BCCC4] flex items-center justify-center">
                  {/* Coin icons floating */}
                  <motion.div
                    className="absolute top-8 right-8 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Coins className="w-6 h-6 text-yellow-700" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-12 left-8 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <Coins className="w-5 h-5 text-yellow-700" />
                  </motion.div>

                  {/* Center mascot placeholder or icon */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <Users className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#4FC3DC]" />
                  </div>
                </div>

                {/* Decorative ring */}
                <motion.div
                  className="absolute -inset-4 border-2 border-dashed border-[#4FC3DC]/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Gamified;
