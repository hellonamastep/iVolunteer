"use client";

import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";

export default function CorporateCTA() {
  return (
    <section className="bg-gradient-to-br from-[#59b4c3] to-[#eff396] py-20 relative">
      <div className="absolute top-4 left-4 lg:top-8 lg:left-16 z-10">
        <Image src="/placeholder-logo.png" alt="iVolunteer Mascot" width={100} height={100} className="object-contain lg:w-[210px] lg:h-[210px]" />
      </div>
      <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-16 z-10">
        <Image src="/mascots/video_mascots/mascot_planting_video.gif" alt="iVolunteer Mascot" width={120} height={120} className="object-contain lg:w-[300px] lg:h-[300px]" unoptimized />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-normal">
          Join Us In Creating Sustainable Change
        </h2>

        <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto px-4">
          Whether you're a corporate looking to make an impact, an NGO seeking partnerships, or a volunteer ready to contribute—start your journey today.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button className="px-6 py-3 bg-white rounded-2xl text-[#173043] text-sm font-normal hover:bg-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-2 cursor-pointer group">
            Get Started Today
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <button className="px-6 py-3 bg-white border-2 border-white rounded-2xl text-[#000] text-sm font-normal hover:bg-white/90 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            Contact Us
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-white/90">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-base">Free To Get Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-base">24/7 Support</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-base">Verified Partners</span>
          </div>
        </div>
      </div>
    </section>
  );
}
