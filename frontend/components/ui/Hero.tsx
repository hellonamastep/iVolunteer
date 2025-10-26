"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative bg-white font-inter isolate overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero rows */}
        <div className="relative mt-8 sm:mt-12 md:mt-16 min-h-[60vh] sm:min-h-[65vh] md:min-h-[70vh] flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 max-w-7xl w-full py-8 sm:py-10 md:py-12">
            {/* Left: Mascot with the bg yellow blob */}
            <motion.div
              className="relative flex justify-center items-center order-1 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Yellow Ellipse - Large with 50% opacity */}
              <div className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] md:w-[550px] md:h-[550px] lg:w-[615px] lg:h-[615px] rounded-full bg-[#EFF396] opacity-50 z-0"></div>

              {/* Yellow Ellipse - Smaller with 100% opacity */}
              <div className="absolute w-[310px] h-[310px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] lg:w-[540px] lg:h-[540px] rounded-full bg-[#EFF396] z-[2]"></div>

              {/* Mascot */}
              <motion.img
                src="/mascott 1.svg"
                alt="Hero Mascot"
                className="relative z-10 w-[280px] h-[357px] sm:w-[330px] sm:h-[421px] md:w-[380px] md:h-[485px] lg:w-[430px] lg:h-[548px] max-w-full"
              />
            </motion.div>

            {/* Right: Headlines and btns */}
            <motion.div
              className="flex flex-col items-center justify-center text-center w-full max-w-xl gap-6 sm:gap-7 md:gap-8 order-2 lg:order-2"
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
                <Link href="/signup" className="w-full max-w-[496px]">
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

                <Link href="/login" className="w-full max-w-[496px]">
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

      {/* Wave SVG  */}
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
