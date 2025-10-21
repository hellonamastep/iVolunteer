"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSearchParams } from "next/navigation";

import Coinsystem from "@/components/Coinsystem";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Gamified from "@/components/Gamified";
import { Header } from "@/components/header";
import Howitworks from "@/components/Howitworks";
import Hero from "@/components/ui/Hero";

import Adminstats from "@/components/Adminstats";
import Dailyquote from "@/components/Dailyquote";
import Eventbutton from "@/components/Eventbutton";
import Ngoanalytics from "@/components/Ngoanalytics";
import Ngoeventtable from "@/components/Ngoeventtable";
import Sponsorshipopp from "@/components/Sponsorshipopp";
import Useractivity from "@/components/Useractivity";
import Useranalytics from "@/components/Useranalytics";
import Userrewardstoredash from "@/components/Userrewardstoredash";
import Donationeventbutton from "@/components/Donationeventbutton";
import PointsDisplay from "@/components/PointsDisplay.";
import { motion } from "framer-motion";
import PendingRequestsCTA from "@/components/PendingRequestsCTA";
import PendingGroupsCTA from "@/components/PendingGroupsCTA";
import Donationreqcta from "@/components/Donationreqcta";
import Eventcompltreqcta from "@/components/Eventcompltreqcta";
import Addblogcta from "@/components/Addblogcta";
import Manageblogscta from "@/components/Manageblogscta";
import Copeventdash from "@/components/Copeventdash";
import Managecopeventcta from "@/components/Managecopeventcta";
import { PendingParticipationRequests } from "@/components/PendingParticipationRequests";
import RecentActivities from "@/components/RecentActivities";

// Dashboard components
function AdminDashboard() {
  return (
    <section className=" h-full w-full min-w-[350px] bg-white">
      <Header />
      <Adminstats />

      <div className="flex justify-center  m-6 md:m-0">
        <div className="max-w-7xl w-full space-y-6">
          {/* Header Section */}
          <div className="text-center mb-2 mt-20">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              Quick Actions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Manage pending requests and review submissions that need your
              attention
            </p>
          </div>

          {/* CTA Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-3 mt-14">
            <Donationreqcta />
            <PendingRequestsCTA />
          </div>
        </div>
      </div>
      <PendingGroupsCTA />

      <Eventcompltreqcta />
      <Addblogcta />
      <Manageblogscta />
      <Managecopeventcta />
      <Footer />
    </section>
  );
}

function NGODashboard() {
  const searchParams = useSearchParams();
  const ngoEventTableRef = useRef<HTMLDivElement>(null);

  // Handle scrollTo parameter
  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo === 'ngoeventtable' && ngoEventTableRef.current) {
      setTimeout(() => {
        if (ngoEventTableRef.current) {
          const tableTop = ngoEventTableRef.current.getBoundingClientRect().top + window.pageYOffset;
          const screenHeight = window.innerHeight;
          const scrollOffset = screenHeight * 0.3;
          
          window.scrollTo({ 
            top: tableTop - scrollOffset, 
            behavior: "smooth" 
          });
        }
      }, 300); // Small delay to ensure content is rendered
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#E8F8F7] min-w-[350px] relative overflow-hidden">
      {/* Decorative background pattern circles */}
      <div className="absolute w-32 h-32 bg-[#5BCCC4] opacity-[0.05] rounded-full top-16 left-16"></div>
      <div className="absolute w-40 h-40 bg-[#8CE27A] opacity-[0.06] rounded-full top-[432px] right-64"></div>
      <div className="absolute w-24 h-24 bg-[#FFC857] opacity-[0.06] rounded-full top-[519px] left-48"></div>
      <div className="absolute w-36 h-36 bg-[#5BCCC4] opacity-[0.04] rounded-full top-56 right-[452px]"></div>
      <div className="absolute w-28 h-28 bg-[#8CE27A] opacity-[0.05] rounded-full top-80 left-[627px]"></div>
      <div className="absolute w-20 h-20 bg-[#FFC857] opacity-[0.04] rounded-full top-[325px] left-[431px]"></div>
      <div className="absolute w-32 h-32 bg-[#EC4899] opacity-[0.03] rounded-full top-[417px] left-[554px]"></div>
      <div className="absolute w-24 h-24 bg-[#4FC3DC] opacity-[0.04] rounded-full top-36 right-72"></div>
      
      {/* Animated Video Mascots - Positioned at edges to avoid content overlap */}
      <motion.img
        src="/mascots/video_mascots/mascot_joyDance_video.gif"
        alt="joy dance mascot"
        className="absolute top-20 left-4 w-24 h-24 md:w-32 md:h-32 lg:left-8 pointer-events-none z-[5] hidden md:block"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.img
        src="/mascots/video_mascots/mascot_holdingmoney_video.gif"
        alt="holding money mascot"
        className="absolute top-24 right-4 w-24 h-24 md:w-32 md:h-32 lg:right-8 pointer-events-none z-[5] hidden md:block"
        animate={{
          y: [0, 12, 0],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      
      <motion.img
        src="/mascots/video_mascots/mascot_jumping_video.gif"
        alt="jumping mascot"
        className="absolute bottom-32 right-4 w-24 h-24 md:w-32 md:h-32 lg:right-12 pointer-events-none z-[5] hidden md:block"
        animate={{
          y: [0, 18, 0],
          rotate: [0, -8, 8, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      {/* <motion.img
        src="/mascots/video_mascots/mascot_planting_video.gif"
        alt="planting mascot"
        className="absolute bottom-40 left-4 w-24 h-24 md:w-32 md:h-32 lg:left-10 pointer-events-none z-[5] hidden lg:block"
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      /> */}
      
      <div className="relative z-10">
        <Header />
        <div className="pb-8">
          <Ngoanalytics />
          
          {/* Main content grid - Left column: Participation Requests + Top Volunteers, Right column: Recent Activities */}
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
            {/* Left Column - Participation Requests & Top Volunteers */}
            <div className="flex flex-col gap-5">
              <PendingParticipationRequests />
              
              {/* Top Volunteers Section */}
              <div className="bg-white rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#F9D71C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-base font-normal text-[#2C3E50]">Top Volunteers</h3>
                  </div>
                  <button className="text-sm text-[#4FC3DC] font-medium flex items-center gap-1">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {/* Volunteer 1 */}
                  <div className="flex items-center justify-between bg-[#E8F8F7] rounded-[14px] p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#4FC3DC] rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-normal">A</span>
                      </div>
                      <div>
                        <p className="text-base font-medium text-[#2C3E50]">Atharva</p>
                        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                          <span>45h</span>
                          <span>12 events</span>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-[#F9D71C]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>4.9</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="bg-[#4FC3DC] text-white text-sm font-medium px-4 py-2 rounded-full">
                      Message
                    </button>
                  </div>

                  {/* Volunteer 2 */}
                  <div className="flex items-center justify-between bg-[#E8F8F7] rounded-[14px] p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#7FD47F] rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-normal">S</span>
                      </div>
                      <div>
                        <p className="text-base font-medium text-[#2C3E50]">Sushil</p>
                        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                          <span>38h</span>
                          <span>10 events</span>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-[#F9D71C]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="bg-[#4FC3DC] text-white text-sm font-medium px-4 py-2 rounded-full">
                      Message
                    </button>
                  </div>

                  {/* Volunteer 3 */}
                  <div className="flex items-center justify-between bg-[#E8F8F7] rounded-[14px] p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#7B68EE] rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-normal">M</span>
                      </div>
                      <div>
                        <p className="text-base font-medium text-[#2C3E50]">Saif</p>
                        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                          <span>32h</span>
                          <span>9 events</span>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-[#F9D71C]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>4.7</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="bg-[#4FC3DC] text-white text-sm font-medium px-4 py-2 rounded-full">
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Recent Activities - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <RecentActivities />
            </div>
          </div>
          
          <div className="flex md:flex-row flex-col w-full px-4 md:px-8 gap-6 mt-8 max-w-[1200px] mx-auto">
            <Eventbutton />
            <Donationeventbutton />
          </div>
    
      <div ref={ngoEventTableRef}>
        <Ngoeventtable />
      </div>
          
          {/* Inspirational Quote Section */}
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-8">
            <div className="bg-gradient-to-r from-[#4FC3DC]/20 to-[#7FD47F]/20 border-2 border-[#4FC3DC] rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 opacity-10">
                <svg className="w-full h-full text-[#4FC3DC]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="relative z-10">
                <div className="max-w-4xl">
                  <h3 className="text-lg font-normal bg-gradient-to-r from-[#0A0A0A] to-[#0A0A0A] bg-clip-text text-transparent mb-2">
                    "Alone we can do so little; together we can do so much." — Helen Keller
                  </h3>
                  <p className="text-base text-[#6B7280]">
                    Your organization is making a real difference. Keep up the amazing work! 🌟
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

function VolunteerDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#E8F8F7] min-w-[350px] relative overflow-hidden">
      {/* Decorative background pattern circles */}
      <div className="absolute w-32 h-32 bg-[#5BCCC4] opacity-[0.05] rounded-full top-16 left-16"></div>
      <div className="absolute w-40 h-40 bg-[#8CE27A] opacity-[0.06] rounded-full top-[432px] right-64"></div>
      <div className="absolute w-24 h-24 bg-[#FFC857] opacity-[0.06] rounded-full top-[519px] left-48"></div>
      <div className="absolute w-36 h-36 bg-[#5BCCC4] opacity-[0.04] rounded-full top-56 right-[452px]"></div>
      <div className="absolute w-28 h-28 bg-[#8CE27A] opacity-[0.05] rounded-full top-80 left-[627px]"></div>
      <div className="absolute w-20 h-20 bg-[#FFC857] opacity-[0.04] rounded-full top-[325px] left-[431px]"></div>
      <div className="absolute w-32 h-32 bg-[#EC4899] opacity-[0.03] rounded-full top-[417px] left-[554px]"></div>
      <div className="absolute w-24 h-24 bg-[#4FC3DC] opacity-[0.04] rounded-full top-36 right-72"></div>
      
      {/* Animated Mascots */}
      <motion.img
        src="/mascots/mascot_happy.png"
        alt="happy mascot"
        className="absolute top-32 left-12 w-20 h-20 md:w-24 md:h-24 opacity-30 pointer-events-none"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.img
        src="/mascots/mascot_believe.png"
        alt="believe mascot"
        className="absolute top-48 right-20 w-16 h-16 md:w-20 md:h-20 opacity-30 pointer-events-none"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      
      <motion.img
        src="/mascots/mascot_reading.png"
        alt="reading mascot"
        className="absolute bottom-40 left-24 w-20 h-20 md:w-24 md:h-24 opacity-30 pointer-events-none"
        animate={{
          y: [0, -15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      <motion.img
        src="/mascots/mascot_star.png"
        alt="star mascot"
        className="absolute top-96 left-1/4 w-16 h-16 md:w-20 md:h-20 opacity-25 pointer-events-none hidden md:block"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />
      
      <motion.img
        src="/mascots/mascot_playing.png"
        alt="playing mascot"
        className="absolute bottom-64 right-32 w-20 h-20 md:w-24 md:h-24 opacity-30 pointer-events-none"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.img
        src="/mascots/mascot_dreaming.png"
        alt="dreaming mascot"
        className="absolute top-1/3 right-16 w-16 h-16 md:w-20 md:h-20 opacity-25 pointer-events-none hidden md:block"
        animate={{
          y: [0, -10, 0],
          x: [0, -10, 0],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5,
        }}
      />
      
      <motion.img
        src="/mascots/mascot_chear.png"
        alt="cheer mascot"
        className="absolute bottom-1/4 left-1/3 w-16 h-16 md:w-20 md:h-20 opacity-25 pointer-events-none hidden lg:block"
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -12, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
      
      <motion.img
        src="/mascots/mascot_gift.png"
        alt="gift mascot"
        className="absolute top-2/3 left-16 w-20 h-20 md:w-24 md:h-24 opacity-30 pointer-events-none"
        animate={{
          y: [0, 18, 0],
          rotate: [0, 8, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3.5,
        }}
      />
      
      <motion.img
        src="/mascots/mascot_wink.png"
        alt="wink mascot"
        className="absolute top-1/2 right-24 w-16 h-16 md:w-20 md:h-20 opacity-25 pointer-events-none hidden lg:block"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
      
      <motion.img
        src="/mascots/mascot_painting.png"
        alt="painting mascot"
        className="absolute bottom-1/3 right-12 w-16 h-16 md:w-20 md:h-20 opacity-25 pointer-events-none hidden md:block"
        animate={{
          y: [0, 12, 0],
          rotate: [0, -8, 8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4.5,
        }}
      />
      
      <motion.img
        src="/mascots/mascot_okay.png"
        alt="okay mascot"
        className="absolute top-1/4 left-20 w-16 h-16 md:w-18 md:h-18 opacity-25 pointer-events-none hidden lg:block"
        animate={{
          x: [0, 15, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 pt-24">
        <div className="px-4 md:px-8 mt-6">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl md:text-3xl font-normal text-[#2C3E50] mb-2"
          >
            Welcome back, {user?.name || "User"} 👋
          </motion.h2>
          <p className="text-[#6B7280] text-base">Let's continue making a positive impact today! 🌟</p>
        </div>
        <div className="pb-8">
          <PointsDisplay />
          <Useranalytics />
          <Dailyquote />
          <Useractivity />
          <Userrewardstoredash />
        </div>
        <Footer />
      </div>
    </div>
  );
}

function CorporateDashboard() {
  return (
    <section className="bg-gradient-to-br from-emerald-50 to-green-50">
      <Header />
      {/* <div className="p-8">
        <h1 className="text-5xl font-bold text-emerald-700 mb-4">
          Corporate Dashboard
        </h1>
        <p className="text-emerald-600 text-lg font-light">
          Welcome back. Here's what's happening.
        </p>
      </div> */}
      <Sponsorshipopp />
      <Copeventdash />
      {/* <CSRAnalytics /> */}
      <Footer />
    </section>
  );
}

// Main landing page
function LandingPage() {
  return (
    <div className="min-w-[350px]">
      <Header />
      <Hero />
      <Gamified />
      <Howitworks />
      <Coinsystem />
      <Faq />
      <Footer />
    </div>
  );
}

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p className="p-6">Loading...</p>;

  // Show dashboard if user is logged in
  if (user) {
    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "ngo":
        return <NGODashboard />;
      case "user": // volunteer
        return <VolunteerDashboard />;
      case "corporate":
        return <CorporateDashboard />;
      default:
        return <p className="p-6">Unknown role. Please contact support.</p>;
    }
  }

  // Show landing page if not logged in
  return <LandingPage />;
}