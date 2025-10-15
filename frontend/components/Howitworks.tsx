"use client";
import Image from "next/image";
import React from "react";
import { motion, Variants } from "framer-motion";

const steps = [
  {
    step: 1,
    title: "Discover",
    desc: "Explore a wide range of volunteering opportunities, community events, and charitable causes.",
  },
  {
    step: 2,
    title: "Participate",
    desc: "Engage in activities that match your interests and contribute your time & skills.",
  },
  {
    step: 3,
    title: "Get Rewarded",
    desc: "Earn recognition, badges, and rewards for your valuable contributions.",
  },
];

// ✅ Animation Variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.3 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Howitworks = () => {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Main Content Section with Green Background */}
      <div className="relative w-full bg-[#74E291] pt-16 pb-12 px-6 md:px-12">
        <div className="relative z-30 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-12">
            {/* Left side: Text */}
            <motion.div
              className="w-full md:w-1/2"
              variants={container}
              initial="hidden"
              animate="show"
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-8">
                <motion.h1
                  className="font-medium text-[36px] sm:text-[48px] leading-[60px] text-[#0F1729]"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  How it Works
                </motion.h1>
                <motion.span
                  className="text-5xl"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  ⭐
                </motion.span>
              </div>
              <motion.h2
                className="font-normal text-[28px] sm:text-[36px] leading-[40px] text-[#0F1729] mb-4"
                style={{ fontFamily: "Satoshi, sans-serif" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Your Journey with NAMASTEP
              </motion.h2>
              <motion.p
                className="font-normal text-[18px] sm:text-[19.8px] leading-[32px] text-[#65758B] mb-10 max-w-[550px]"
                style={{ fontFamily: "Satoshi, sans-serif" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                Joining NAMASTEP is simple. Discover opportunities that match
                your interests, contribute to your community, and see your
                impact grow.
              </motion.p>
              <div className="space-y-8">
                {steps.map((step) => (
                  <motion.div
                    key={step.step}
                    className="flex items-start gap-5"
                    variants={item}
                  >
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-[#EFF396] shadow-[0px_6px_0px_#59B4C3] rounded-full font-normal text-2xl text-black">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-normal text-[24px] leading-[32px] text-[#0F1729] mb-2"
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="font-normal text-[17.7px] leading-[29px] text-[#65758B] max-w-[400px]"
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="w-full md:w-1/2 flex justify-center md:justify-end relative"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Mascot Image */}
              <div className="relative w-full max-w-[500px] h-[400px] md:h-[623px]">
                <Image
                  src="/howItworksMascot2.png"
                  alt="How it works illustration"
                  fill
                  className="object-contain relative z-10"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Inverted Wave at bottom */}
      <div className="relative w-full h-[160px]">
        <Image
          src="/InvertedGreenWave.svg"
          alt="Wave decoration"
          fill
          className="object-cover object-top"
          priority
        />
      </div>
    </section>
  );
};

export default Howitworks;
