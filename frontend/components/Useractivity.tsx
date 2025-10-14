"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, HeartHandshake, Clock } from "lucide-react";

const activities = [
  {
    title: "Join a Community",
    desc: "Connect with like-minded individuals and make a difference together.",
    link: "Explore Communities",
    href: "#",
    img: "/images/community.avif",
    icon: <Users className="w-5 h-5" />,
    color: "bg-blue-500"
  },
  {
    title: "Donate",
    desc: "Support environmental causes with your generous contributions.",
    link: "Donate Now",
    href: "#",
    img: "/images/donate.jpg",
    icon: <HeartHandshake className="w-5 h-5" />,
    color: "bg-green-500"
  },
  {
    title: "Become a Volunteer",
    desc: "Contribute your time and skills to meaningful initiatives.",
    link: "Get Started",
    href: "#",
    img: "/images/volunteer.jpg",
    icon: <Clock className="w-5 h-5" />,
    color: "bg-purple-500"
  },
];

const Useractivity = () => {
  // Leaderboard data
  const leaderboardData = [
    { name: "Sarah Chen", points: "2850 pts", avatar: "S", color: "bg-[#FFD700]", position: 1, rank: "1" },
    { name: "Mike Johnson", points: "2640 pts", avatar: "M", color: "bg-[#C0C0C0]", position: 2, rank: "2" },
    { name: "Emma Davis", points: "2420 pts", avatar: "E", color: "bg-[#CD7F32]", position: 3, rank: "3" },
    { name: "Alex Wong", points: "2180 points", avatar: "A", color: "bg-[#4FC3DC]", position: 4 },
    { name: "vol (You)", points: "0 points", avatar: "V", color: "bg-[#7FD47F]", position: 5, isYou: true },
  ];

  return (
    <section className="px-4 py-6 md:px-8">
      <div className="max-w-8xl mx-auto">
        {/* Leaderboard Title */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏆</span>
            <h3 className="text-xl font-normal text-[#2C3E50]">Leaderboard</h3>
          </div>
          <p className="text-sm text-[#6B7280]">See how you stack up against other amazing volunteers! 🚀</p>
        </div>

        {/* Flex container for Leaderboard and Your Rank */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Leaderboard Section */}
          <div className="flex-1 bg-[#E8F8F7] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] p-6">
            <div className="flex items-center justify-end mb-6">
              <button className="text-sm text-[#4FC3DC] font-medium flex items-center gap-1 hover:text-[#4FC3DC]/80 transition-colors">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          {/* Podium Display */}
          <div className="flex items-end justify-center gap-3 mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center relative"
            >
              <div className="w-12 h-12 bg-[#C0C0C0] rounded-full flex items-center justify-center mb-1.5 relative">
                <span className="text-white text-lg font-medium">M</span>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#C0C0C0] rounded-full flex items-center justify-center text-white text-xs font-medium">
                  2
                </div>
              </div>
              <p className="text-xs font-medium text-[#2C3E50] mb-0.5">Mike Johnson</p>
              <p className="text-xs text-[#6B7280] mb-2">2640 pts</p>
              <div className="bg-[#E8E8E8] rounded-t-lg w-[88px] h-[88px] flex items-start justify-center pt-4">
                <span className="text-4xl font-normal text-[#C0C0C0]">2</span>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="flex flex-col items-center relative"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <svg className="w-6 h-6 text-[#FFD700]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L9.5 8.5L3 9.3L7.5 13.8L6.5 20.5L12 17.5L17.5 20.5L16.5 13.8L21 9.3L14.5 8.5L12 2Z" />
                </svg>
              </div>
              <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center mb-1.5 mt-4 relative">
                <span className="text-white text-lg font-medium">S</span>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-[#FFD700] rounded-full flex items-center justify-center text-white text-xs font-medium">
                  1
                </div>
              </div>
              <p className="text-xs font-medium text-[#2C3E50] mb-0.5">Sarah Chen</p>
              <p className="text-xs text-[#6B7280] mb-2">2850 pts</p>
              <div className="bg-[#FFF9E6] rounded-t-lg w-[88px] h-[120px] flex items-start justify-center pt-4">
                <span className="text-4xl font-normal text-[#FFD700]">1</span>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center relative"
            >
              <div className="w-12 h-12 bg-[#CD7F32] rounded-full flex items-center justify-center mb-1.5 relative">
                <span className="text-white text-lg font-medium">E</span>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#CD7F32] rounded-full flex items-center justify-center text-white text-xs font-medium">
                  3
                </div>
              </div>
              <p className="text-xs font-medium text-[#2C3E50] mb-0.5">Emma Davis</p>
              <p className="text-xs text-[#6B7280] mb-2">2420 pts</p>
              <div className="bg-[#F5E6D3] rounded-t-lg w-[88px] h-[72px] flex items-start justify-center pt-4">
                <span className="text-4xl font-normal text-[#CD7F32]">3</span>
              </div>
            </motion.div>
          </div>

          {/* List View */}
          <div className="space-y-2.5">
            {leaderboardData.slice(3).map((user, index) => (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`flex items-center justify-between p-3.5 rounded-xl ${
                  user.isYou 
                    ? "bg-[#C5F5ED] border-2 border-[#7FD47F]" 
                    : "bg-[#C5EEF5]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#6B7280] font-medium text-sm w-4">{index + 4}</span>
                  <div className={`w-10 h-10 ${user.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-medium text-base">{user.avatar}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#2C3E50]">{user.name}</p>
                      {user.isYou && (
                        <span className="bg-[#4FC3DC] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-[#2C3E50]">{user.points}</span>
                  {user.isYou && (
                    <svg className="w-5 h-5 text-[#7FD47F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          </div>

          {/* Your Rank Card */}
          <div className="lg:w-[380px] bg-gradient-to-br from-[#B8E9FF] to-[#D4F1F4] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-[#4FC3DC] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-base font-normal text-[#2C3E50] mb-2">Your Rank</p>
              <p className="text-5xl font-medium text-[#2C3E50] mb-2">#5</p>
              <p className="text-sm text-[#6B7280]">Keep going! You're doing great 💪</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                <span className="text-sm text-[#6B7280]">Points to #4</span>
                <span className="text-lg font-medium text-[#2C3E50]">2180</span>
              </div>
              <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                <span className="text-sm text-[#6B7280]">Points to #1</span>
                <span className="text-lg font-medium text-[#2C3E50]">2850</span>
              </div>
            </div>

            <button className="w-full bg-[#4FC3DC] text-white py-3 rounded-full text-sm font-medium hover:bg-[#4FC3DC]/90 transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Earn More Points
            </button>
          </div>
        </div>

        {/* Get Involved Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-normal text-[#2C3E50] mb-4 px-2">Get Involved</h2>
          <p className="text-[#6B7280] text-sm mb-6 px-2">
            Discover impactful ways to contribute to your community and make a positive impact 🌍
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activities.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl overflow-hidden shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all duration-300 group"
            >
              {/* Image with overlay */}
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                
                {/* Icon badge */}
                <div className={`absolute top-3 right-3 ${item.color} w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md`}>
                  {item.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-medium text-[#2C3E50] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#6B7280] text-sm mb-4 leading-relaxed">
                  {item.desc}
                </p>
                <a
                  href={item.href}
                  className="inline-flex items-center font-medium text-[#4FC3DC] hover:text-[#4FC3DC]/80 transition-colors group-hover:gap-2 gap-1 text-sm"
                >
                  <span>{item.link}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">Ready to make a difference?</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2">
            Explore All Opportunities
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Useractivity;