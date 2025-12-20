"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Building2, Heart, ArrowRight } from "lucide-react";

const paths = [
  {
    icon: Users,
    iconBg: "bg-[#E8F5E9]",
    iconColor: "text-[#4FC3DC]",
    title: "Volunteers",
    description: "Discover local events you care about. Sign up, join, and gain KarmaCoins for each verified participation.",
    cta: "Explore Opportunities",
    ctaLink: "/volunteer",
    borderColor: "hover:border-[#4FC3DC]",
  },
  {
    icon: Building2,
    iconBg: "bg-[#E3F2FD]",
    iconColor: "text-[#4FC3DC]",
    title: "Corporates",
    description: "Post CSR programs, invite employees, measure impact, and collaborate with trusted NGOs.",
    cta: "Post CSR Project",
    ctaLink: "/add-corporate-event",
    borderColor: "hover:border-[#4FC3DC]",
  },
  {
    icon: Heart,
    iconBg: "bg-[#F3E5F5]",
    iconColor: "text-[#4FC3DC]",
    title: "NGOs",
    description: "Create events, recruit volunteers, manage donations, and report impact with ease.",
    cta: "Create Event",
    ctaLink: "/add-event",
    borderColor: "hover:border-[#4FC3DC]",
  },
];

const ChooseYourPath = () => {
  return (
    <section className="relative w-full bg-white py-16 sm:py-20 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            className="text-gray-900 text-3xl sm:text-4xl md:text-5xl font-semibold mb-4"
            style={{ fontFamily: "Satoshi, sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Choose Your Path
          </motion.h2>
          <motion.p
            className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Whether you want to volunteer, run CSR initiatives, or organize events
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {paths.map((path, index) => {
            const Icon = path.icon;
            return (
              <motion.div
                key={index}
                className={`bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 ${path.borderColor} transition-all duration-300 hover:shadow-lg group`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -5 }}
              >
                {/* Icon */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${path.iconBg} rounded-full flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${path.iconColor}`} />
                </div>

                {/* Content */}
                <h3
                  className="text-gray-900 text-lg sm:text-xl font-semibold mb-3"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {path.title}
                </h3>
                <p
                  className="text-gray-500 text-sm sm:text-base mb-6 leading-relaxed"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {path.description}
                </p>

                {/* CTA Button */}
                <Link href={path.ctaLink}>
                  <motion.button
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 border-2 border-[#4FC3DC] text-[#4FC3DC] font-medium text-sm sm:text-base rounded-full hover:bg-[#4FC3DC] hover:text-white transition-all duration-300 group-hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {path.cta}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ChooseYourPath;
