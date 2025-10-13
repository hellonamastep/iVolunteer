"use client";
import React, { useState } from "react";
import { Plus, Calendar } from "lucide-react";
import Link from "next/link";

const Eventbutton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full flex-1">
      <div className="h-full bg-white rounded-2xl p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] relative overflow-hidden">
        
        <div className="flex flex-col relative z-10">
          {/* Icon and Text Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#4FC3DC]" />
              <h3 className="text-base font-normal text-[#2C3E50]">
                Manage Your Volunteer Events
              </h3>
            </div>
            <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
              Create and organize volunteer events to maximize your impact and engage your community effectively
            </p>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 bg-[#7FD47F] rounded-full"></div>
              <span className="text-sm font-normal text-[#6B7280]">Ready to create</span>
            </div>
          </div>

          {/* Button Section */}
          <div className="w-full">
            <Link 
              href="/add-event" 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button
                className="w-full flex items-center justify-center gap-2 bg-[#4FC3DC] hover:bg-[#3BA5BB] text-white font-medium py-2 px-4 rounded-full transition-all duration-300"
              >
                <Plus size={16} />
                <span className="text-sm">Add Volunteer Event</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eventbutton;