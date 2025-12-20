import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is NAMASTEP?",
    answer:
      "NAMASTEP is a comprehensive platform that connects volunteers, corporates (CSR teams), and NGOs. It enables volunteers to discover and join meaningful opportunities, helps corporates run impactful CSR programs, and empowers NGOs to organize events and recruit volunteers — all in one place.",
  },
  {
    question: "How do I earn KarmaCoins?",
    answer:
      "You can earn KarmaCoins by registering, participating in volunteering events, making donations, or engaging with community activities. Each verified participation rewards you with coins.",
  },
  {
    question: "Can I redeem KarmaCoins for money or rewards?",
    answer:
      "KarmaCoins are designed for recognition and gamification purposes. They can be used to unlock badges, climb the leaderboard, and gain community recognition. While they're not redeemable for cash, they showcase your contributions and impact.",
  },
  {
    question: "Is NAMASTEP free to use?",
    answer:
      "Yes, NAMASTEP is completely free for volunteers to use. NGOs and organizations can also list their opportunities and manage events at no cost. Our mission is to make volunteering accessible to everyone.",
  },
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.h2
            className="text-gray-900 text-3xl sm:text-4xl md:text-5xl font-semibold mb-4"
            style={{ fontFamily: "Satoshi, sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-gray-500 text-base sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Everything you need to know about NAMASTEP
          </motion.p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                activeIndex === index
                  ? "border-[#4FC3DC] shadow-md"
                  : "border-gray-100 hover:border-gray-200"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex justify-between items-center w-full px-5 sm:px-6 py-4 sm:py-5 text-left"
              >
                <span
                  className={`font-medium text-base sm:text-lg pr-4 ${
                    activeIndex === index ? "text-[#4FC3DC]" : "text-gray-900"
                  }`}
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activeIndex === index
                      ? "bg-[#4FC3DC] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false} mode="wait">
                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      transition: {
                        height: {
                          duration: 0.4,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        },
                        opacity: {
                          duration: 0.25,
                          ease: "easeInOut",
                        },
                      },
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      transition: {
                        height: {
                          duration: 0.3,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        },
                        opacity: {
                          duration: 0.2,
                          ease: "easeInOut",
                        },
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-5 sm:px-6 pb-5 text-gray-600 text-sm sm:text-base leading-relaxed"
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    >
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
