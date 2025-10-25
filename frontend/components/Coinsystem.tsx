import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Coins } from "lucide-react";

const Coinsystem = () => {
  const actions = [
    {
      imagePath: "/DonateMascot.svg",
      title: "Make a Donation",
      desc: "Support a cause you care about and instantly earn 75 reward points.",
      reward: "+75",
    },
    {
      imagePath: "/joinActivitiesMascot.svg",
      title: "Join Activities",
      desc: "Participate in community events and connect with like-minded changemakers.",
      reward: "+20",
    },
  ];

  return (
    <>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <section className="relative w-full overflow-hidden">
        {/* Inverted Wave SVG at top */}
        <div className="absolute top-0 left-0 w-full h-[160px] z-0">
          <Image
            src="/InvertedWave.svg"
            alt="Wave decoration"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Main Content */}

        {/* Content Container */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 md:pb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Left Side - Mascot Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2 flex justify-center order-2 md:order-1"
            >
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80">
                <Image
                  src="/kickstartJournyMascot.svg"
                  alt="NAMASTEP Mascot"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Right Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2 text-center pt-[50px] md:text-left flex flex-col items-center md:items-start order-1 md:order-2"
            >
              <h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 mb-3 sm:mb-4 leading-tight px-2"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                Kickstart Your Journey with NAMASTEP
              </h2>
              <p
                className="text-gray-700 text-center md:text-left text-sm sm:text-base md:text-lg mb-4 sm:mb-5 md:mb-6 px-4 sm:px-2 md:px-0 leading-relaxed"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                Register today and get{" "}
                <span className="font-bold text-[#72B526]">5 free coins</span>{" "}
                to begin your impact journey! Choose one of these simple actions
                to unlock rewards and start making a difference.
              </p>

              {/* Button */}
              <Link href="/signup" className="w-full max-w-[496px]">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#4a9fb0" }}
                  whileTap={{
                    scale: 0.98,
                    y: 2,
                    boxShadow: "0px 6px 0px #499373",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full h-12 sm:h-14 md:h-[56px] bg-[#59B4C3] px-8 sm:px-12 md:px-14 text-white font-bold text-base sm:text-lg md:text-[20px] leading-tight rounded-[12px] sm:rounded-[15px] shadow-[0px_6px_0px_#499373] sm:shadow-[0px_8px_0px_#499373] flex items-center justify-center uppercase"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  REGISTER & GET COINS
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section - Action Cards */}
        <div className="bg-white py-3 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory sm:justify-center sm:overflow-visible sm:gap-5 md:gap-7 lg:gap-8 max-w-4xl mx-auto pb-4 sm:pb-0 scrollbar-hide">
            {actions.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 hover:shadow-lg transition-all text-center snap-center flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
              >
                {/* Mascot Image */}
                <div className="relative w-full h-36 sm:h-40 md:h-48 mb-3 sm:mb-4">
                  <Image
                    src={item.imagePath}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-base text-center sm:text-lg md:text-xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  className="text-gray-600 text-center text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed px-1"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {item.desc}
                </p>

                {/* Reward Badge */}
                <div className="relative inline-flex items-center justify-center w-[100px] h-[48px] sm:w-[110px] sm:h-[52px] md:w-[120px] md:h-[56px] bg-[#FFCC00] shadow-[0px_3px_0px_#CCA300] sm:shadow-[0px_4px_0px_#CCA300] rounded-[40px] sm:rounded-[48px]">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F1729] absolute left-4 sm:left-5 md:left-6" />
                  <span className="font-['Satoshi'] font-bold text-sm sm:text-base md:text-[17.4px] leading-tight text-[#0F1729] ml-1 sm:ml-2">
                    {item.reward}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Green Wave at bottom */}
        <div className="relative w-full h-[160px]">
          <Image
            src="/greenWave.svg"
            alt="Green wave decoration"
            fill
            className="object-cover object-top"
            priority
          />
        </div>
      </section>
    </>
  );
};

export default Coinsystem;
