"use client";

import { usePoints } from "@/contexts/points-context";
import React from "react";
import type { OwnedBadge, AvailableBadge } from "@/contexts/points-context";

const BadgesPage: React.FC = () => {
  const { badges, allBadges, loading } = usePoints();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading your badges...</p>
      </div>
    </div>
  );

  const ownedIds: string[] = badges.map((b: OwnedBadge) => b.badgeId);
  const completionRate = Math.round((badges.length / allBadges.length) * 100);

  const getTierColor = (tier: string) => {
    const tierLower = tier.toLowerCase();
    switch (tierLower) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🎖️ Achievement Badges
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your progress and showcase your accomplishments with our exclusive badge collection
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{badges.length}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Badges Earned</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{allBadges.length}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Available</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{completionRate}%</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Owned Badges Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Collected Badges</h2>
              <p className="text-gray-600 mt-1">Badges you've earned through your achievements</p>
            </div>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              {badges.length} collected
            </span>
          </div>

          {badges.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No badges yet!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Start completing challenges and activities to earn your first achievement badge.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {badges.map((badge: OwnedBadge) => (
                <div
                  key={`owned-${badge.badgeId}`}
                  className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-sm border-2 border-green-300 p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      ✓ Collected
                    </span>
                  </div>
                  
                  <div className="text-5xl text-center mb-4">{badge.icon}</div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{badge.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(badge.tier)}`}>
                      {badge.tier}
                    </span>
                    
                    {badge.unlockedAt && (
                      <div className="mt-4 text-xs text-gray-500">
                        Unlocked on {new Date(badge.unlockedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* All Available Badges Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Available Badges</h2>
              <p className="text-gray-600 mt-1">Complete challenges to unlock these badges</p>
            </div>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              {allBadges.length} total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allBadges.map((badge: AvailableBadge) => {
              const owned = ownedIds.includes(badge.id);
              
              return (
                <div
                  key={`all-${badge.id}`}
                  className={`rounded-2xl shadow-sm border-2 p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                    owned 
                      ? 'bg-gradient-to-br from-green-50 to-white border-green-300' 
                      : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 opacity-75'
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      owned 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {owned ? '✓ Collected' : '🔒 Locked'}
                    </span>
                  </div>
                  
                  <div className={`text-5xl text-center mb-4 ${owned ? '' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  
                  <div className="text-center">
                    <h3 className={`font-semibold text-lg mb-2 ${owned ? 'text-gray-900' : 'text-gray-600'}`}>
                      {badge.name}
                    </h3>
                    
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(badge.tier)}`}>
                      {badge.tier}
                    </span>
                    
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BadgesPage;