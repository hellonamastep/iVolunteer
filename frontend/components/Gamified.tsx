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
    <section className="relative w-full bg-[#EFF396] py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Left Side - Content */}
          <motion.div
            className="space-y-8 sm:space-y-10 md:space-y-12"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Heading */}
            <h2
              className="font-medium text-[32px] sm:text-[40px] md:text-[48px] leading-[1.5] text-[#0F1729] text-justify"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Get Gamified Rewards
            </h2>

            {/* Mascot below heading in mobile view */}
            <motion.div
              className="flex lg:hidden items-center justify-center -mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="relative w-[280px] h-[420px] sm:w-[320px] sm:h-[480px]">
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
                      className="w-[260px] h-[325px] sm:w-[290px] sm:h-[362px] object-contain z-10 transform -translate-y-14 -translate-x-5"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reward Badges Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-y-5 lg:gap-x-16 max-w-[280px] sm:max-w-2xl lg:max-w-3xl mx-auto"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  className="relative flex items-center gap-2 sm:gap-3 h-[78px] sm:h-[82px] md:h-[86px] px-4 sm:px-8 bg-[#59B4C3] rounded-[40px] sm:rounded-[44px] shadow-[0px_6px_0px_#E1E7EF] min-w-[240px] sm:min-w-[280px] md:min-w-[320px] lg:min-w-[310px]"
                  variants={item}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-[#6FC380] rounded-full shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center">
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
                  </div>

                  {/* Text */}
                  <span
                    className="font-medium text-[16px] sm:text-[18px] leading-[1.2] sm:leading-[1.56] text-white whitespace-normal sm:whitespace-nowrap text-justify"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    {reward.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Description */}
            <div className="space-y-6">
              <h3
                className="font-medium text-[28px] sm:text-[32px] md:text-[36px] leading-[1.11] text-[#0F1729] text-justify"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                Earn Coins & Badges
              </h3>
              <p
                className="font-normal text-[18px] sm:text-[20px] leading-[1.6] text-[#65758B] max-w-2xl mx-auto text-justify"
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
