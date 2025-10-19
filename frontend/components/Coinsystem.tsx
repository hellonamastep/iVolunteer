import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Coins } from "lucide-react";

const Coinsystem = () => {
  const actions = [
    {
      imagePath: "/opportunitiesMascot.svg",
      title: "Explore Opportunities",
      desc: "Find local NGOs and volunteer projects that inspire you.",
      reward: "+10",
    },
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

    <section className="py-16 px-6 md:px-12 text-center bg-gradient-to-br from-blue-100 to-white">
      {/* Header */}
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
        Kickstart Your Journey with iVolunteer 🚀
      </h2>
      <p className="text-gray-500 mb-8 max-w-2xl mx-auto text-xl">
        Register today and get{" "}
        <span className="font-semibold text-blue-600">5 free coins </span>
        to begin your impact journey! Choose one of these simple actions to
        unlock rewards and start making a difference.
      </p>

      {/* CTA Button */}
      <div className="mb-12">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all"
        >
          <Link href="/signup">
           Register & Get 5 Coins
           </Link>
        </motion.button>

      </div>

      {/* Content Container */}
      <div className="container mx-auto px-6 md:px-12 pt-32 pb-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
          {/* Left Side - Mascot Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 flex justify-center"
          >
            <div className="relative w-60 h-60 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
              {/* mascot image */}
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
            className="w-full md:w-1/2 text-center flex flex-col items-center md:text-left"
          >
            <h2
              className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 mb-4 leading-tight md:whitespace-nowrap"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Kickstart Your Journey with NAMASTEP
            </h2>
            <p
              className="text-gray-700 text-center md:text-left text-base sm:text-lg mb-6 px-2 sm:px-0"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Register today and get{" "}
              <span className="font-bold text-[#72B526]">5 free coins</span> to
              begin your impact journey! Choose one of these simple actions to
              unlock rewards and start making a difference.
            </p>

            {/* Button */}
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#4a9fb0" }}
                whileTap={{
                  scale: 0.98,
                  y: 2,
                  boxShadow: "0px 6px 0px #499373",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full max-w-[496px] h-[56px] bg-[#59B4C3] px-14 text-white font-bold text-[20px] leading-[28px] rounded-[15px] shadow-[0px_8px_0px_#499373] flex items-center justify-center uppercase"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                REGISTER & GET COINS
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section - Action Cards */}
      <div className="bg-white py-12 px-6 md:px-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {actions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-lg transition-all text-center"
            >
              {/* Mascot Image */}
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={item.imagePath}
                  alt={item.title}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Title */}
              <h3
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                {item.title}
              </h3>

              {/* Description */}
              <p
                className="text-gray-600 text-sm mb-4"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                {item.desc}
              </p>

              {/* Reward Badge */}
              <div className="relative inline-flex items-center justify-center w-[120px] h-[56px] bg-[#FFCC00] shadow-[0px_4px_0px_#CCA300] rounded-[48px]">
                <Coins className="w-[23px] h-[23px] text-[#0F1729] absolute left-6" />
                <span className="font-['Satoshi'] font-bold text-[17.4px] leading-[28px] text-[#0F1729] ml-2">
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
  );
};

export default Coinsystem;
