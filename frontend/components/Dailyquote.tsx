"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, QuoteIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useUser } from "@/contexts/user-context";
import { useAuth } from "@/contexts/auth-context";

const quotes = [
  "Believe you can and you're halfway there.",
  "Do something today that your future self will thank you for.",
  "The best time to start was yesterday. The next best time is now.",
  "Push yourself, because no one else is going to do it for you.",
  "Don't stop until you're proud.",
];

const Dailyquote = () => {
  const [todayQuote, setTodayQuote] = useState("");
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const { dailyRewardClaimed, claimDailyReward, refreshUserStats } = useUser();
  const { user } = useAuth();

  useEffect(() => {
    const quoteIndex = new Date().getDate() % quotes.length;
    setTodayQuote(quotes[quoteIndex]);
  }, []);

  const handleCollect = async () => {
    if (!user || dailyRewardClaimed || isClaimingReward) return;
    
    try {
      setIsClaimingReward(true);
      const success = await claimDailyReward("daily_quote");
      
      if (success) {
        toast.success("You collected +10 coins!");
        // Refresh user stats to get updated coin count
        await refreshUserStats();
      } else {
        toast.error("Failed to claim daily reward. Please try again.");
      }
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsClaimingReward(false);
    }
  };

  return (
    <section className="flex items-center justify-center px-4 py-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#4FC3DC]/20 to-[#7FD47F]/20 border-2 border-[#4FC3DC] rounded-2xl p-6 w-full flex flex-col-reverse md:flex-row items-center justify-between gap-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all duration-300 relative overflow-hidden"
      >
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-28 h-28 opacity-10">
          <svg className="w-full h-full text-[#4FC3DC]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>

        {/* Left Side - Text Content */}
        <div className="flex-1 text-left relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#F9D71C]" />
            <p className="text-sm font-normal text-[#2C3E50]">
              Daily Inspiration
            </p>
          </div>

          <div className="relative mb-4">
            <p className="text-lg md:text-xl font-normal text-[#2C3E50] leading-relaxed">
              "{todayQuote}"
            </p>
          </div>

          {/* <p className="text-[#6B7280] mb-5 text-sm">
            Collect your daily bonus of 10 coins for motivation! 🌟
          </p> */}

          {/* {!dailyRewardClaimed && user ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCollect}
              disabled={isClaimingReward}
              className="bg-[#4FC3DC] text-white px-6 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {isClaimingReward ? "Claiming..." : "Explore 50 Cities"}
              
            </motion.button>
          ) : dailyRewardClaimed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 bg-[#7FD47F]/20 text-[#7FD47F] px-4 py-2 rounded-full text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Today's reward collected!</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 bg-gray-100 text-[#6B7280] px-4 py-2 rounded-full text-sm"
            >
              <span className="font-medium">Please login to claim rewards</span>
            </motion.div>
          )} */}
          <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              // onClick={handleCollect}
              // disabled={isClaimingReward}
              className="bg-[#4FC3DC] text-white px-6 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Explore 50 Cities
              
            </motion.button>
        </div>

        {/* Right Side - Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0 relative z-10"
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden flex items-center justify-center">
            <Image
            src="/images/dailyreward.jpg"
            alt="Daily Bonus"
            width={160}
            height={160}
            className="rounded-lg object-contain"
          />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Dailyquote;
