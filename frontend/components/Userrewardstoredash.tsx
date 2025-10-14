import React from "react";
import Image from "next/image";
import { Gift, Coins, Zap } from "lucide-react";

const rewards = [
  {
    id: 1,
    title: "$25 Gift Card",
    coins: 500,
    image: "/images/coupon1.jpg",
    popular: false
  },
  {
    id: 2,
    title: "iVolunteer T-Shirt",
    coins: 1000,
    image: "/images/c2.jpg",
    popular: true
  },
  {
    id: 3,
    title: "$50 Gift Card",
    coins: 1000,
    image: "/images/coupon1.jpg",
    popular: false
  },
  {
    id: 4,
    title: "iVolunteer Water Bottle",
    coins: 750,
    image: "/images/c2.jpg",
    popular: true
  },
];

const Userrewardstoredash = () => {
  return (
    <div className="px-4 py-6 md:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="bg-gradient-to-r from-[#7FD47F]/20 to-[#F9D71C]/20 border-2 border-[#7FD47F] rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 opacity-10">
            <Gift className="w-full h-full text-[#7FD47F]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-[#7FD47F]" />
              <h2 className="text-xl font-normal text-[#2C3E50]">Rewards Store</h2>
            </div>
            <p className="text-[#6B7280] text-sm mb-4">
              Exchange your well-earned coins for exciting rewards and merchandise. Stay tuned! 🎉
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-full">
                <span className="text-sm text-[#EC4899]">🎁 Exclusive Merch</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-full">
                <span className="text-sm text-[#4FC3DC]">🎟️ Gift Cards</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-full">
                <span className="text-sm text-[#7B68EE]">🏅 Special Badges</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-normal text-[#2C3E50] mb-4">Something Awesome is Coming!</h3>
        <p className="text-[#6B7280] text-sm mb-6">
          We're working hard to bring you amazing rewards. Keep collecting coins and stay tuned for the big reveal! 🎊
        </p>
        
        <div className="bg-[#E8F8F7]/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 bg-[#4FC3DC]/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-16 h-16 text-[#4FC3DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-medium text-[#2C3E50] mb-3">Something Awesome is Coming!</h3>
          <p className="text-[#6B7280] text-base mb-8 max-w-2xl">
            We're working hard to bring you amazing rewards. Keep collecting coins and stay tuned for the big reveal! 🎊
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-lg">🎁</span>
              <span className="text-sm text-[#2C3E50] font-medium">Exclusive Merch</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-lg">🎟️</span>
              <span className="text-sm text-[#2C3E50] font-medium">Gift Cards</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-lg">🏅</span>
              <span className="text-sm text-[#2C3E50] font-medium">Special Badges</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Userrewardstoredash;