"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
}

const HERO_STATS: StatItem[] = [
  { value: "50K+", label: "Volunteers" },
  { value: "200+", label: "NGO Partners" },
  { value: "1M+", label: "Lives Impacted" },
];

export default function CorporateHero() {
  return (
    <section className="bg-[#f0f9f8]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 border border-[#39c2ba]/20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <g clipPath="url(#clip0_595_634)">
                <path d="M7.34496 1.87605C7.37353 1.72312 7.45468 1.58499 7.57436 1.4856C7.69404 1.3862 7.84472 1.33179 8.00029 1.33179C8.15587 1.33179 8.30655 1.3862 8.42623 1.4856C8.54591 1.58499 8.62706 1.72312 8.65563 1.87605L9.35629 5.58138C9.40606 5.84482 9.53408 6.08713 9.72365 6.2767C9.91322 6.46627 10.1555 6.59429 10.419 6.64405L14.1243 7.34472C14.2772 7.37328 14.4154 7.45443 14.5147 7.57412C14.6141 7.6938 14.6686 7.84447 14.6686 8.00005C14.6686 8.15563 14.6141 8.3063 14.5147 8.42599C14.4154 8.54567 14.2772 8.62682 14.1243 8.65538L10.419 9.35605C10.1555 9.40581 9.91322 9.53383 9.72365 9.7234C9.53408 9.91297 9.40606 10.1553 9.35629 10.4187L8.65563 14.1241C8.62706 14.277 8.54591 14.4151 8.42623 14.5145C8.30655 14.6139 8.15587 14.6683 8.00029 14.6683C7.84472 14.6683 7.69404 14.6139 7.57436 14.5145C7.45468 14.4151 7.37353 14.277 7.34496 14.1241L6.64429 10.4187C6.59453 10.1553 6.46651 9.91297 6.27694 9.7234C6.08737 9.53383 5.84506 9.40581 5.58163 9.35605L1.87629 8.65538C1.72336 8.62682 1.58524 8.54567 1.48584 8.42599C1.38644 8.3063 1.33203 8.15563 1.33203 8.00005C1.33203 7.84447 1.38644 7.6938 1.48584 7.57412C1.58524 7.45443 1.72336 7.37328 1.87629 7.34472L5.58163 6.64405C5.84506 6.59429 6.08737 6.46627 6.27694 6.2767C6.46651 6.08713 6.59453 5.84482 6.64429 5.58138L7.34496 1.87605Z" stroke="#FFC857" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.333 1.33337V4.00004" stroke="#FFC857" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.6667 2.66663H12" stroke="#FFC857" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.66634 14.6667C3.40272 14.6667 3.99967 14.0697 3.99967 13.3333C3.99967 12.597 3.40272 12 2.66634 12C1.92996 12 1.33301 12.597 1.33301 13.3333C1.33301 14.0697 1.92996 14.6667 2.66634 14.6667Z" stroke="#FFC857" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_595_634">
                  <rect width="16" height="16" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            <span className="text-[#173043] text-sm">Trusted by 500+ Organizations</span>
          </div>

          <h1 className="text-[#173043] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight">
            Together, We Create Change
          </h1>

          <p className="text-[#173043]/80 text-lg font-normal leading-relaxed">
            Connect corporations, NGOs, and volunteers to build meaningful CSR
            projects that drive sustainable social impact across communities.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button className="px-6 py-3 bg-[#39c2ba] rounded-lg text-white text-sm font-medium hover:bg-[#2da59e] hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2 cursor-pointer">
              Get Involved
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 bg-white border border-[#e6eef2] rounded-lg text-[#173043] text-sm font-medium hover:bg-gray-50 hover:border-[#39c2ba] hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              Start A CSR Project
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-4">
            {HERO_STATS.map((stat, idx) => (
              <div key={idx}>
                <div className="text-[#39c2ba] text-2xl sm:text-3xl font-normal">{stat.value}</div>
                <div className="text-[#173043]/70 text-xs sm:text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full">
          <Image
            src="/images/CorporatePage.png"
            alt="Hero Image"
            fill
            className="rounded-3xl shadow-2xl object-cover"
            priority
          />
          <div className="absolute -bottom-5 left-0 sm:transform sm:-translate-x-12 bg-white rounded-2xl shadow-xl p-3 sm:p-4 w-40 sm:w-48 z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#8ce27a] rounded-full flex items-center justify-center shrink-0">
                <span className="text-lg sm:text-xl">🌱</span>
              </div>
              <div>
                <div className="text-[#173043] text-xs sm:text-sm font-semibold">15K Trees Planted</div>
                <div className="text-[#173043]/70 text-[10px] sm:text-xs">This month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
