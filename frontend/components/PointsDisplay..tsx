"use client";

import React from "react";
import { usePoints } from "@/contexts/points-context";
import { Award, TrendingUp, Sparkles, Target } from "lucide-react";

const PointsDisplay: React.FC = () => {
  const { points, loading } = usePoints();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600" />
          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
        </div>
      </div>
    );
  }

  const currentLevel = Math.floor(points / 500) + 1;
  const progressToNextLevel = (points % 500) / 5;
  const pointsToNextLevel = 500 - (points % 500);

  return (
    <div className="w-full flex md:flex-row flex-col justify-between mx-auto px-4 md:px-8 py-6">
      {/* Main Points Card */}
      <div className="bg-white rounded-2xl md:w-[73%] w-full overflow-hidden shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] relative">
        <div className="relative z-10 p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <Award className="w-5 h-5 text-[#4FC3DC]" />
                <span className="text-[#2C3E50] text-base font-normal">
                  Achievement Points
                </span>
              </div>
              
              <div className="flex items-baseline justify-center lg:justify-start gap-2 mb-2">
                <span className="text-4xl lg:text-5xl font-medium text-[#2C3E50]">
                  {points.toLocaleString()}
                </span>
                <span className="text-[#6B7280] text-base font-normal">pts</span>
              </div>
              
              <p className="text-[#6B7280] text-sm">
                Halfway to next level!
              </p>
            </div>

            {/* Right Content - Progress */}
            <div className="flex flex-col items-center lg:items-end space-y-4">
              {/* Progress Circle */}
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-[#4FC3DC]/20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progressToNextLevel) / 100}
                    className="text-[#4FC3DC] transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-medium text-[#2C3E50] text-xl">{Math.round(progressToNextLevel)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex justify-between text-sm text-[#6B7280] mb-2">
              <span className="font-normal flex items-center gap-1">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F9D71C]/20 text-[#F9D71C] text-xs font-medium">
                  {currentLevel}
                </span>
                Beginner
              </span>
              <span className="font-normal">{points % 500}/500 points</span>
            </div>
            <div className="w-full bg-[#E8F8F7] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#4FC3DC] h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:w-[25%] w-full md:mt-0 mt-4">
        <div className="bg-[#4FC3DC] rounded-2xl p-5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-sm font-normal">Impact Stats</span>
              <Target className="w-5 h-5 text-white" />
            </div>
            <p className="text-4xl font-medium text-white">{500}</p>
            <p className="text-white/80 text-xs">Total Volunteers</p>
          </div>
        </div>

        <div className="bg-[#7FD47F] rounded-2xl p-5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-lg transition-all">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-white/90 text-sm font-normal">Total Vouchers</span>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <p className="text-4xl font-medium text-white">{500}</p>
            <p className="text-white/80 text-xs">Available to redeem</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsDisplay;