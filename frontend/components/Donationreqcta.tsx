"use client";

import React from "react";
import Link from "next/link";
import { useAdmin } from "@/contexts/admin-context";
import { Gift, ArrowRight } from "lucide-react";

interface CTAButtonProps {
  className?: string;
}

const DonationReqCTA = ({ className = "" }: CTAButtonProps) => {
  const { pendingDonationEvents } = useAdmin();
  const pendingCount = pendingDonationEvents.length;
  const hasPending = pendingCount > 0;

  return (
    <Link href="/donationpendingreq" passHref>
      <div className={`
        group relative bg-gradient-to-br from-white to-gray-50/80 rounded-3xl p-8 
        cursor-pointer overflow-hidden border border-gray-200/50
        hover:shadow-2xl hover:-translate-y-1 transition-all duration-500
        backdrop-blur-sm
        ${className}
      `}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(165,108,180,0.03)_25%,rgba(165,108,180,0.03)_50%,transparent_50%,transparent_75%,rgba(165,108,180,0.03)_75%)] bg-[length:8px_8px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Accent Border Animation */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#A56CB4] to-[#C084CC] opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
        
        {/* Main Content */}
        <div className="relative z-10">
          {/* Icon and Status Row */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center justify-center w-16 h-16 rounded-2xl 
              ${hasPending 
                ? 'bg-[#A56CB4] text-white shadow-lg shadow-[#A56CB4]/25' 
                : 'bg-[#A56CB4]/20 text-[#A56CB4]'
              } transition-all duration-500 group-hover:scale-110`}>
              <Gift className="w-7 h-7" />
            </div>
            
            {/* Status Indicator */}
            <div className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border
              ${hasPending 
                ? 'bg-purple-500/10 text-purple-700 border-purple-200' 
                : 'bg-purple-500/5 text-purple-600 border-purple-100'
              } transition-colors duration-500`}>
              {hasPending ? 'Action Required' : 'Up to Date'}
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            {/* Title and Count */}
            <div className="flex items-end justify-between">
              <h3 className={`text-2xl font-bold transition-colors duration-500
                ${hasPending ? 'text-gray-900' : 'text-[#A56CB4]'}`}>
                Pending Donations
              </h3>
              <div className={`text-4xl font-bold transition-colors duration-500
                ${hasPending ? 'text-[#A56CB4]' : 'text-[#A56CB4]/60'}`}>
                {pendingCount}
              </div>
            </div>

            {/* Description */}
            <p className={`text-lg leading-relaxed transition-colors duration-500
              ${hasPending ? 'text-gray-600' : 'text-[#A56CB4]/70'}`}>
              {hasPending 
                ? `You have ${pendingCount} donation event${pendingCount !== 1 ? 's' : ''} waiting for your review and approval`
                : 'All donation events have been processed and approved'
              }
            </p>

            {/* Action Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
              <span className={`text-base font-semibold transition-colors duration-500
                ${hasPending ? 'text-[#A56CB4]' : 'text-[#A56CB4]'}`}>
                {hasPending ? 'Review Donations' : 'View Donations'}
              </span>
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-500 group-hover:scale-110
                ${hasPending 
                  ? 'bg-[#A56CB4] text-white shadow-lg shadow-[#A56CB4]/25' 
                  : 'bg-[#A56CB4]/20 text-[#A56CB4]'
                }`}>
                <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Corner Accent */}
        <div className={`absolute top-0 right-0 w-24 h-24 -translate-y-6 translate-x-6 rounded-full 
          bg-[#A56CB4] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700`} />
      </div>
    </Link>
  );
};

export default DonationReqCTA;