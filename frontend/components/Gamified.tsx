import React from "react";
import { Award } from "lucide-react";
import { motion, Variants } from "framer-motion";

const rewards = [
  { id: 1, name: "Community Champion" },
  { id: 2, name: "Event Enthusiast" },
  { id: 3, name: "Volunteer Veteran" },
  { id: 4, name: "Social Star" },
];

// ✅ Strongly typed animation variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const Gamified = () => {
  return (
    <section className="relative w-full bg-[#EFF396] py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Mascot at top right in mobile view */}
        <motion.div
          className="lg:hidden absolute top-0 right-2 z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative w-[90px] h-[100px] sm:w-[120px] sm:h-[140px]">
            {/* Background Vector */}
            <div className="absolute inset-0">
              <img
                src="/gamifiedVector.svg"
                alt="Background shape"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Mascot on top */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/gamifiedMascot.svg"
                alt="Rewards illustration"
                className="w-[90px] h-[110px] sm:w-[110px] sm:h-[130px] object-contain z-10 transform -translate-y-3 -translate-x-1"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Left Side - Content */}
          <motion.div
            className="space-y-6 sm:space-y-8 text-start md:space-y-10 lg:space-y-12 pt-[40px] sm:pt-[130px] lg:pt-0"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Heading */}
            <h2
              className="font-medium text-[28px] sm:text-[36px] md:text-[44px] lg:text-[48px] leading-[1.5] text-[#0F1729] text-center lg:text-justify"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Get Gamified Rewards
            </h2>

            {/* Reward Badges Grid */}
            <motion.div
              className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-2 lg:gap-y-5 lg:gap-x-8 max-w-full mx-auto"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  className="relative text-start flex items-center gap-2 justify-center sm:gap-3 h-[60px] sm:h-[68px] md:h-[78px] lg:h-[82px] px-3 sm:px-4 md:px-6 lg:px-8 bg-[#59B4C3] rounded-[30px] sm:rounded-[34px] md:rounded-[40px] shadow-[0px_4px_0px_#E1E7EF] sm:shadow-[0px_6px_0px_#E1E7EF] w-full"
                  variants={item}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-[#6FC380] rounded-full shadow-[0px_8px_12px_-3px_rgba(0,0,0,0.1)] flex items-center justify-center">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white stroke-[2.5]" />
                  </div>

                  {/* Text */}
                  <span
                    className="font-medium text-start text-[13px] sm:text-[14px] md:text-[16px] lg:text-[18px] leading-[1.3] text-white lg:text-left flex-1"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    {reward.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Description */}
            <div className="space-y-4 mt-10 sm:space-y-5 md:space-y-6">
              <h3
                className="font-medium text-justify text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] leading-[1.2] text-[#0F1729] lg:text-justify"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                Earn Coins & Badges
              </h3>
              <p
                className="font-normal text-[16px] sm:text-[18px] md:text-[20px] leading-[1.6] text-[#65758B] max-w-2xl mx-auto text-justify lg:text-justify"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                Your efforts are recognized and rewarded. Collect coins for
                every activity and exchange them for coupons & gifts. Unlock
                exclusive badges to showcase your achievements.
              </p>
            </div>
          </motion.div>

          {/* Right Side - Mascot (Desktop Only) */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="relative w-[280px] h-[420px] sm:w-[320px] sm:h-[480px] md:w-[350px] md:h-[525px]">
                {/* Background Vector */}
                <div className="absolute inset-0">
                  <img
                    src="/gamifiedVector.svg"
                    alt="Background shape"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Mascot on top */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/gamifiedMascot.svg"
                    alt="Rewards illustration"
                    className="w-[260px] h-[325px] sm:w-[290px] sm:h-[362px] md:w-[320px] md:h-[400px] object-contain z-10 transform -translate-y-14 -translate-x-5"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Gamified;
