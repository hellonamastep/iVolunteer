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
    <section className="relative py-16 px-6 md:px-12 bg-white">
      <div className="max-w-4xl mx-auto text-center mb-12 relative z-10">
        <h2
          className="w-full max-w-[480px] mx-auto h-[120px] flex items-center justify-center text-center text-[55px] leading-[60px] font-normal text-[#0F1729]"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          Frequently Asked Questions ❓
        </h2>
        <p
          className="text-[#65758B] mt-5 text-[18.7px] leading-7 font-normal"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          Got questions? We've got answers. Here's everything you need to know
          about getting started with NAMASTEP.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4 relative z-10">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white border-2 border-[#E1E7EF] border-opacity-60 shadow-[0px_6px_0px_#E1E7EF] rounded-[50px] hover:shadow-[0px_8px_0px_#E1E7EF] transition-all"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="flex justify-between items-center w-full px-9 py-6 text-left"
            >
              <span
                className="font-normal text-[20px] leading-7 text-[#0F1729]"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4 text-[#0F1729]" />
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
                    className="px-9 pb-6 text-[#65758B] text-[17.7px] leading-[29px]"
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
