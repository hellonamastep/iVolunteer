"use client";

import { usePoints } from "@/contexts/points-context";
import React from "react";
import type { OwnedBadge, AvailableBadge } from "@/contexts/points-context";

const BadgesPage: React.FC = () => {
  const { badges, allBadges, loading } = usePoints();

  if (loading) return (
    <div className="min-h-screen bg-[#E8F8F7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="text-teal-800 font-medium">Loading your badges...</p>
      </div>
    </div>
  );

  const ownedIds: string[] = badges.map((b: OwnedBadge) => b.badgeId);
  const completionRate = Math.round((badges.length / allBadges.length) * 100);

  // Vibrant but readable color schemes
  const getBadgeColorScheme = (badgeId: string) => {
    const colorSchemes = [
      // Coral & Peach
      {
        bg: 'bg-gradient-to-br from-orange-50 to-rose-50',
        border: 'border-orange-200',
        accent: 'bg-gradient-to-r from-orange-400 to-rose-400',
        iconBg: 'bg-gradient-to-br from-orange-400 to-rose-400',
        text: 'text-orange-900',
        status: 'from-orange-500 to-rose-500',
        glow: 'hover:shadow-orange-200'
      },
      // Mint & Teal
      {
        bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        border: 'border-emerald-200',
        accent: 'bg-gradient-to-r from-emerald-400 to-teal-400',
        iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-400',
        text: 'text-emerald-900',
        status: 'from-emerald-500 to-teal-500',
        glow: 'hover:shadow-emerald-200'
      },
      // Lavender & Purple
      {
        bg: 'bg-gradient-to-br from-violet-50 to-purple-50',
        border: 'border-violet-200',
        accent: 'bg-gradient-to-r from-violet-400 to-purple-400',
        iconBg: 'bg-gradient-to-br from-violet-400 to-purple-400',
        text: 'text-violet-900',
        status: 'from-violet-500 to-purple-500',
        glow: 'hover:shadow-violet-200'
      },
      // Sky & Blue
      {
        bg: 'bg-gradient-to-br from-sky-50 to-blue-50',
        border: 'border-sky-200',
        accent: 'bg-gradient-to-r from-sky-400 to-blue-400',
        iconBg: 'bg-gradient-to-br from-sky-400 to-blue-400',
        text: 'text-sky-900',
        status: 'from-sky-500 to-blue-500',
        glow: 'hover:shadow-sky-200'
      },
      // Rose & Pink
      {
        bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
        border: 'border-rose-200',
        accent: 'bg-gradient-to-r from-rose-400 to-pink-400',
        iconBg: 'bg-gradient-to-br from-rose-400 to-pink-400',
        text: 'text-rose-900',
        status: 'from-rose-500 to-pink-500',
        glow: 'hover:shadow-rose-200'
      },
      // Amber & Yellow
      {
        bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
        border: 'border-amber-200',
        accent: 'bg-gradient-to-r from-amber-400 to-yellow-400',
        iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-400',
        text: 'text-amber-900',
        status: 'from-amber-500 to-yellow-500',
        glow: 'hover:shadow-amber-200'
      },
      // Lilac & Fuchsia
      {
        bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50',
        border: 'border-purple-200',
        accent: 'bg-gradient-to-r from-purple-400 to-fuchsia-400',
        iconBg: 'bg-gradient-to-br from-purple-400 to-fuchsia-400',
        text: 'text-purple-900',
        status: 'from-purple-500 to-fuchsia-500',
        glow: 'hover:shadow-purple-200'
      },
      // Seafoam & Green
      {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-200',
        accent: 'bg-gradient-to-r from-green-400 to-emerald-400',
        iconBg: 'bg-gradient-to-br from-green-400 to-emerald-400',
        text: 'text-green-900',
        status: 'from-green-500 to-emerald-500',
        glow: 'hover:shadow-green-200'
      },
      // Peach & Orange
      {
        bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
        border: 'border-orange-200',
        accent: 'bg-gradient-to-r from-orange-400 to-amber-400',
        iconBg: 'bg-gradient-to-br from-orange-400 to-amber-400',
        text: 'text-orange-900',
        status: 'from-orange-500 to-amber-500',
        glow: 'hover:shadow-orange-200'
      },
      // Ice & Blue
      {
        bg: 'bg-gradient-to-br from-cyan-50 to-blue-50',
        border: 'border-cyan-200',
        accent: 'bg-gradient-to-r from-cyan-400 to-blue-400',
        iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-400',
        text: 'text-cyan-900',
        status: 'from-cyan-500 to-blue-500',
        glow: 'hover:shadow-cyan-200'
      },
      // Blush & Rose
      {
        bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
        border: 'border-pink-200',
        accent: 'bg-gradient-to-r from-pink-400 to-rose-400',
        iconBg: 'bg-gradient-to-br from-pink-400 to-rose-400',
        text: 'text-pink-900',
        status: 'from-pink-500 to-rose-500',
        glow: 'hover:shadow-pink-200'
      },
      // Lavender & Indigo
      {
        bg: 'bg-gradient-to-br from-indigo-50 to-violet-50',
        border: 'border-indigo-200',
        accent: 'bg-gradient-to-r from-indigo-400 to-violet-400',
        iconBg: 'bg-gradient-to-br from-indigo-400 to-violet-400',
        text: 'text-indigo-900',
        status: 'from-indigo-500 to-violet-500',
        glow: 'hover:shadow-indigo-200'
      }
    ];

    const hash = badgeId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const schemeIndex = Math.abs(hash) % colorSchemes.length;
    return colorSchemes[schemeIndex];
  };

  const getTierColor = (tier: string, colorScheme: any) => {
    const tierLower = tier.toLowerCase();
    const tierColors = {
      common: `bg-gray-100 text-gray-700 border-gray-300`,
      rare: `bg-blue-100 text-blue-700 border-blue-300`,
      epic: `bg-purple-100 text-purple-700 border-purple-300`,
      legendary: `bg-amber-100 text-amber-700 border-amber-300`
    };
    return tierColors[tierLower as keyof typeof tierColors] || tierColors.common;
  };

  const BadgeCard = ({ badge, owned, isOwnedSection = false }: { badge: any, owned: boolean, isOwnedSection?: boolean }) => {
    const colorScheme = getBadgeColorScheme(badge.id || badge.badgeId);
    
    return (
      <div className={`relative group cursor-pointer transform hover:scale-105 transition-all duration-300 ${colorScheme.glow}`}>
        {/* Main Card */}
        <div className={`relative ${colorScheme.bg} rounded-2xl shadow-sm border ${colorScheme.border} p-6 overflow-hidden transform group-hover:shadow-lg transition-all duration-300 h-full flex flex-col`}>
          
          {/* Top Accent Bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${colorScheme.accent}`}></div>

          {/* Collection Status */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`bg-gradient-to-r ${colorScheme.status} text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-sm`}>
              {owned ? '✓ Collected' : '🔒 Locked'}
            </span>
          </div>
          
          {/* Badge Icon */}
          <div className="relative mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
            <div className={`w-16 h-16 ${colorScheme.iconBg} rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden`}>
              <span className={`text-2xl text-white ${owned ? '' : 'grayscale opacity-90'}`}>
                {badge.icon}
              </span>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
            </div>
            
            {/* Outer Ring */}
            <div className={`absolute -inset-2 border-2 ${colorScheme.border} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>

          {/* Badge Name */}
          <h3 className={`font-semibold text-lg text-center mb-2 ${colorScheme.text} leading-tight`}>
            {badge.name}
          </h3>

          {/* Tier Badge */}
          <div className="text-center mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(badge.tier, colorScheme)} shadow-sm`}>
              {badge.tier}
            </span>
          </div>

          {/* Badge Description */}
          <p className={`text-sm text-center mb-4 flex-grow text-gray-700 leading-tight font-medium`}>
            {badge.description}
          </p>

          {/* Unlock Date */}
          <div className="text-center">
            {owned && badge.unlockedAt ? (
              <div className={`text-xs ${colorScheme.text} opacity-80 bg-white/60 rounded-lg py-2 px-3 border ${colorScheme.border}`}>
                🗓️ Unlocked {new Date(badge.unlockedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            ) : !owned ? (
              <div className={`text-xs ${colorScheme.text} opacity-70 italic`}>
                ⏳ Complete challenges
              </div>
            ) : null}
          </div>

          {/* Corner Accents */}
          <div className={`absolute top-2 left-2 w-2 h-2 ${colorScheme.border} rounded-full opacity-60`}></div>
          <div className={`absolute top-2 right-2 w-2 h-2 ${colorScheme.border} rounded-full opacity-60`}></div>
          <div className={`absolute bottom-2 left-2 w-2 h-2 ${colorScheme.border} rounded-full opacity-60`}></div>
          <div className={`absolute bottom-2 right-2 w-2 h-2 ${colorScheme.border} rounded-full opacity-60`}></div>
        </div>

        {/* Hover Glow */}
        <div className={`absolute inset-0 rounded-2xl ${colorScheme.accent} opacity-0 group-hover:opacity-10 blur-md transition-opacity duration-300 -z-10`}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-sm border border-teal-200 mb-6">
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Achievement Badges
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Collect colorful badges and showcase your amazing accomplishments
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl shadow-sm border border-orange-200 p-4 text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-2xl font-bold text-orange-600 mb-1">{badges.length}</div>
              <div className="text-sm font-medium text-orange-800">Badges Earned</div>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl shadow-sm border border-sky-200 p-4 text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-2xl font-bold text-sky-600 mb-1">{allBadges.length}</div>
              <div className="text-sm font-medium text-sky-800">Total Available</div>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl shadow-sm border border-violet-200 p-4 text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-2xl font-bold text-violet-600 mb-1">{completionRate}%</div>
              <div className="text-sm font-medium text-violet-800">Completion</div>
            </div>
          </div>
        </div>

        {/* Owned Badges Section */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-sm border border-emerald-200">
            <div>
              <h2 className="text-2xl font-semibold text-emerald-900">Your Collected Badges</h2>
              <p className="text-emerald-700 mt-1">Badges you've earned through your achievements</p>
            </div>
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-medium mt-3 sm:mt-0 shadow-sm">
              {badges.length} collected
            </span>
          </div>

          {badges.length === 0 ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-200 p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">No badges yet!</h3>
              <p className="text-amber-800 max-w-md mx-auto">
                Start completing challenges and activities to earn your first achievement badge.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {badges.map((badge: OwnedBadge) => (
                <BadgeCard 
                  key={`owned-${badge.badgeId}`}
                  badge={badge}
                  owned={true}
                  isOwnedSection={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* All Available Badges Section */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-200">
            <div>
              <h2 className="text-2xl font-semibold text-blue-900">All Available Badges</h2>
              <p className="text-blue-700 mt-1">Complete challenges to unlock these badges</p>
            </div>
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium mt-3 sm:mt-0 shadow-sm">
              {allBadges.length} total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allBadges.map((badge: AvailableBadge) => (
              <BadgeCard 
                key={`all-${badge.id}`}
                badge={badge}
                owned={ownedIds.includes(badge.id)}
                isOwnedSection={false}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BadgesPage;