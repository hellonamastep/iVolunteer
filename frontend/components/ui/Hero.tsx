"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative bg-white font-inter isolate pb-[40px] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero rows */}
        <div className="relative mt-4 sm:mt-8 md:mt-12 lg:mt-16 min-h-[60vh] sm:min-h-[65vh] md:min-h-[70vh] flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center gap-4 sm:gap-8 md:gap-10 lg:gap-16 xl:gap-20 2xl:gap-24 max-w-7xl w-full py-4 sm:py-8 md:py-10 lg:py-12">
            {/* Left: Mascot with the bg yellow blob */}
            <motion.div
              className="relative flex justify-center items-center order-1 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Yellow Ellipse - Large with 50% opacity */}
              {/* <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[480px] lg:w-[615px] lg:h-[615px] rounded-full bg-[#EFF396] opacity-50 z-0"></div> */}

              {/* Yellow Ellipse - Smaller with 100% opacity */}
              {/* <div className="absolute w-[240px] h-[240px] sm:w-[330px] sm:h-[330px] md:w-[420px] md:h-[420px] lg:w-[540px] lg:h-[540px] rounded-full bg-[#EFF396] z-[2]"></div> */}

              {/* Mascot */}
              <motion.img
                src="/mascots/video_mascots/mascot_planting_video.gif"
                alt="Hero Mascot"
                className="relative z-10 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px] max-w-full object-contain"
              />
            </motion.div>

            {/* Right: Headlines and btns */}
            <motion.div
              className="flex flex-col items-center justify-center text-center w-full max-w-xl gap-4 sm:gap-6 md:gap-7 lg:gap-8 order-2 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h1
                className="font-normal text-[#0F1729] leading-[150%] text-[28px] sm:text-[32px] md:text-[40px] lg:text-[48px] text-center px-4 sm:px-0"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                <span className="block">Make Doing Good Fun,</span>
                <span className="block">Rewarding &amp; Impactful</span>
              </h1>

              <div className="flex flex-col items-center justify-center w-full gap-3 sm:gap-4 mt-2 px-4 sm:px-6 md:px-0">
                <Link href="/login" className="w-full max-w-[496px]">
                  <motion.button
                    className="w-full h-12 sm:h-14 px-4 sm:px-6 bg-[#59B4C3] text-white font-semibold text-[16px] sm:text-[18px] md:text-[20px] leading-[140%] rounded-[12px] sm:rounded-[15px] shadow-[0px_6px_0px_#499373] sm:shadow-[0px_8px_0px_#499373] transition-colors"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "#4a9fb0",
                    }}
                    whileTap={{
                      scale: 0.95,
                      y: 2,
                      boxShadow: "0px 4px 0px #499373",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    GET STARTED
                  </motion.button>
                </Link>

                <Link href="/signup" className="w-full max-w-[496px]">
                  <motion.button
                    className="w-full h-12 sm:h-14 px-4 sm:px-6 bg-white text-[#59B4C3] font-semibold text-[16px] sm:text-[18px] md:text-[20px] leading-[140%] rounded-[12px] sm:rounded-[15px] shadow-[0px_6px_0px_#E5E5E5] sm:shadow-[0px_8px_0px_#E5E5E5] transition-colors"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "#f9fafb",
                    }}
                    whileTap={{
                      scale: 0.95,
                      y: 2,
                      boxShadow: "0px 4px 0px #E5E5E5",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    I ALREADY HAVE AN ACCOUNT
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Spacing before wave */}
        <div className="h-12 sm:h-16 md:h-20 lg:h-24"></div>
      </div>

      {/* Wave SVG */}
      <div className="absolute bottom-[-2px] left-0 right-0 w-full overflow-hidden leading-[0]">
        <img
          src="/wave.svg"
          alt="Wave divider"
          className="w-full h-[120px] sm:h-[120px] md:h-[140px] lg:h-[160px] block object-cover object-bottom"
          style={{ display: "block", verticalAlign: "bottom" }}
        />
      </div>
    </section>
  );
};

export default Hero;
