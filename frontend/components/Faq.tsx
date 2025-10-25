import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is NAMASTEP?",
    answer:
      "NAMASTEP is a platform that connects you with NGOs, donation drives, and volunteering opportunities to make a meaningful impact in your community.",
  },
  {
    question: "How do I earn coins?",
    answer:
      "You can earn coins by registering, donating, joining activities, or participating in volunteering events.",
  },
  {
    question: "Can I redeem my coins?",
    answer:
      "Yes! Coins can be redeemed for exclusive rewards, recognition, and participation perks in future activities.",
  },
  {
    question: "Is NAMASTEP free to use?",
    answer:
      "Absolutely. NAMASTEP is completely free to use for volunteers. NGOs and organizations can also list opportunities at no cost.",
  },
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="relative py-12 sm:py-14 md:py-16 px-4 sm:px-6 md:px-8 lg:px-12 bg-white">
      <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10 md:mb-12 relative z-10">
        <h2
          className="w-full max-w-[90%] sm:max-w-[480px] mx-auto min-h-[80px] sm:min-h-[100px] md:min-h-[120px] flex items-center justify-center text-center text-[32px] sm:text-[42px] md:text-[48px] lg:text-[55px] leading-tight font-normal text-[#0F1729] px-2"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          Frequently Asked Questions ❓
        </h2>
        <p
          className="text-[#65758B] mt-4 sm:mt-5 text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18.7px] leading-relaxed font-normal px-4 sm:px-2"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          Got questions? We've got answers. Here's everything you need to know
          about getting started with NAMASTEP.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 relative z-10">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white border-2 border-[#E1E7EF] border-opacity-60 shadow-[0px_4px_0px_#E1E7EF] sm:shadow-[0px_5px_0px_#E1E7EF] md:shadow-[0px_6px_0px_#E1E7EF] rounded-[32px] sm:rounded-[40px] md:rounded-[50px] hover:shadow-[0px_6px_0px_#E1E7EF] sm:hover:shadow-[0px_7px_0px_#E1E7EF] md:hover:shadow-[0px_8px_0px_#E1E7EF] transition-all"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="flex justify-between items-center w-full px-5 sm:px-7 md:px-9 py-4 sm:py-5 md:py-6 text-left gap-3"
            >
              <span
                className="font-normal text-[16px] sm:text-[18px] md:text-[20px] leading-tight text-[#0F1729] flex-1"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F1729]" />
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
                    className="px-5 sm:px-7 md:px-9 pb-4 sm:pb-5 md:pb-6 text-[#65758B] text-[14px] sm:text-[16px] md:text-[17.7px] leading-relaxed"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Faq;
