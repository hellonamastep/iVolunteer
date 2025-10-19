import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Coinsystem = () => {
  const actions = [
    {
      icon: "🔍",
      title: "Explore Opportunities",
      desc: "Find local NGOs and volunteer projects that inspire you.",
      reward: "+10 Coins",
    },
    {
      icon: "💝",
      title: "Make a Donation",
      desc: "Support a cause you care about and instantly earn 75 reward points.",
      reward: "+75 Coins",
    },
    {
      icon: "🤝",
      title: "Join Activities",
      desc: "Participate in community events and connect with like-minded changemakers.",
      reward: "+20 Coins",
    },
  ];

  return (
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

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {actions.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            viewport={{ once: true }}
            className="bg-gray-50 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{item.desc}</p>

            {/* Reward Highlight */}
            <span className="inline-block bg-blue-100 text-blue-800 text-md font-semibold px-3 py-1 rounded-full">
              {item.reward}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Coinsystem;
