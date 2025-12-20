"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Building2, Heart } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#E8F5E9] via-[#E0F2F1] to-[#E8F5E9] font-inter isolate overflow-hidden min-h-[85vh]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#4FC3DC]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-[#8CE27A]/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#FFC857]/10 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-8 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 max-w-7xl w-full mx-auto">
            
            {/* Left: Mascot with animated rings */}
            <motion.div
              className="relative flex justify-center items-center order-1 lg:order-1 h-[320px] sm:h-[380px] md:h-[440px] lg:h-[500px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Outer ring - animated rotation */}
              <motion.div 
                className="absolute w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] rounded-full border-[3px] border-[#4FC3DC]/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle ring with gradient */}
              <div className="absolute w-[240px] h-[240px] sm:w-[290px] sm:h-[290px] md:w-[340px] md:h-[340px] lg:w-[380px] lg:h-[380px] rounded-full bg-gradient-to-br from-[#4FC3DC]/20 to-[#8CE27A]/20 backdrop-blur-sm" />
              
              {/* Inner solid circle - background for mascot */}
              <div className="absolute w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] lg:w-[310px] lg:h-[310px] rounded-full bg-gradient-to-br from-[#4FC3DC] to-[#5BCCC4] shadow-lg" />
              
              {/* Mascot Image */}
              <motion.img
                src="/mascott 1.svg"
                alt="NAMASTEP Mascot"
                className="relative z-20 w-[180px] h-[230px] sm:w-[220px] sm:h-[280px] md:w-[260px] md:h-[330px] lg:w-[300px] lg:h-[382px] object-contain"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Right: Headlines and CTAs */}
            <motion.div
              className="flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-xl mx-auto lg:mx-0 order-2 lg:order-2 px-4 sm:px-0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h1
                className="font-semibold text-[#1a1a1a] leading-[1.2] text-[26px] sm:text-[32px] md:text-[38px] lg:text-[44px] mb-4"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                Make Doing Good Fun, Rewarding & Impactful
              </h1>

              <p className="text-gray-600 text-base sm:text-lg mb-6 max-w-md">
                One place to find volunteering opportunities, run CSR projects, and manage NGO events. Earn KarmaCoins for your contributions.
              </p>

              {/* Primary CTA */}
              <Link href="/signup?role=user" className="w-full sm:w-auto mb-4">
                <motion.button
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#4FC3DC] text-white font-semibold text-base sm:text-lg rounded-full shadow-md hover:shadow-lg transition-all"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                  whileHover={{ scale: 1.02, backgroundColor: "#3db5ce" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started — I'm a Volunteer
                </motion.button>
              </Link>

              {/* Role Selection Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-2">
                <Link href="/signup?role=user">
                  <motion.button
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium text-sm rounded-full shadow-sm hover:shadow-md hover:border-[#4FC3DC] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Users className="w-4 h-4 text-[#4FC3DC]" />
                    I am a Volunteer
                  </motion.button>
                </Link>

                <Link href="/signup?role=corporate">
                  <motion.button
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium text-sm rounded-full shadow-sm hover:shadow-md hover:border-[#4FC3DC] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Building2 className="w-4 h-4 text-[#4FC3DC]" />
                    I'm with a Company (CSR)
                  </motion.button>
                </Link>

                <Link href="/signup?role=ngo">
                  <motion.button
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium text-sm rounded-full shadow-sm hover:shadow-md hover:border-[#4FC3DC] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Heart className="w-4 h-4 text-[#4FC3DC]" />
                    I'm an NGO
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[60px] sm:h-[80px] md:h-[100px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#4FC3DC"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
