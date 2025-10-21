"use client";

import React from "react";

export default function RecentActivities() {
  return (
    <div className="bg-white rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] p-6 lg:h-fit lg:sticky lg:top-6">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-[#4FC3DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-base font-normal text-[#2C3E50]">Recent Activities</h3>
      </div>
      
      <div className="space-y-4 mb-6">
        {/* Activity 1 */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#7FD47F]/[0.125] rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#7FD47F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#2C3E50]">vol2 joined event "mumbai event"</p>
            <p className="text-xs text-[#6B7280] mt-1">2 hours ago</p>
          </div>
        </div>

        {/* Activity 2 */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#4FC3DC]/[0.125] rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#4FC3DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#2C3E50]">Event "example" approved by admin</p>
            <p className="text-xs text-[#6B7280] mt-1">5 hours ago</p>
          </div>
        </div>

        {/* Activity 3 */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#EC4899]/[0.125] rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#2C3E50]">Received $500 donation</p>
            <p className="text-xs text-[#6B7280] mt-1">1 day ago</p>
          </div>
        </div>

        {/* Activity 4 */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#F9D71C]/[0.125] rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#F9D71C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#2C3E50]">New participation request from vol3</p>
            <p className="text-xs text-[#6B7280] mt-1">2 days ago</p>
          </div>
        </div>
      </div>

      <button className="w-full border border-[#4FC3DC] text-[#4FC3DC] text-sm font-medium py-2 px-4 rounded-full hover:bg-[#4FC3DC] hover:text-white transition-colors">
        View All Activities
      </button>
    </div>
  );
}
