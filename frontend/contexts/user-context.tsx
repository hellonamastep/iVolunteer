"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";
import api from "@/lib/api";

type UserContextType = {
  activeCoins: number;
  totalCoinsEarned: number;
  totalSpend: number;
  badges: number;
  streak: string;
  streakCount: number;
  isLoading: boolean;
  dailyRewardClaimed: boolean;
  setActiveCoins: (value: number) => void;
  setTotalCoinsEarned: (value: number) => void;
  setTotalSpend: (value: number) => void;
  setBadges: (value: number) => void;
  setStreak: (value: string) => void;
  refreshUserStats: () => Promise<void>;
  claimDailyReward: (type?: string) => Promise<boolean>;
};

// default values
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [activeCoins, setActiveCoins] = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [badges, setBadges] = useState(0);
  const [streak, setStreak] = useState("0 days");
  const [streakCount, setStreakCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  
  const { user } = useAuth();

  // Function to fetch user reward statistics
  const refreshUserStats = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth-token");
      
      const response = await api.get("/v1/rewards/stats", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      const responseData = response.data as any;
      if (responseData.success !== false) {
        const data = responseData.data;
        setActiveCoins(data.activeCoins || 0);
        setTotalCoinsEarned(data.totalCoinsEarned || 0);
        setTotalSpend(data.totalSpent || 0);
        setBadges(data.badges || 0);
        setStreak(data.streak || "0 days");
        setStreakCount(data.streakCount || 0);
        setDailyRewardClaimed(data.todaysClaimed?.daily_quote || false);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to claim daily reward
  const claimDailyReward = async (type: string = "daily_quote"): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const token = localStorage.getItem("auth-token");
      
      const response = await api.post(
        "/v1/rewards/daily-claim",
        { type },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      const responseData = response.data as any;
      if (responseData.success !== false) {
        // Refresh stats after claiming reward
        await refreshUserStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to claim daily reward:", error);
      return false;
    }
  };

  // Fetch stats when user changes
  useEffect(() => {
    if (user) {
      refreshUserStats();
    } else {
      // Reset to default values when no user
      setActiveCoins(0);
      setTotalCoinsEarned(0);
      setTotalSpend(0);
      setBadges(0);
      setStreak("0 days");
      setStreakCount(0);
      setDailyRewardClaimed(false);
      setIsLoading(false);
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        activeCoins,
        totalCoinsEarned,
        totalSpend,
        badges,
        streak,
        streakCount,
        isLoading,
        dailyRewardClaimed,
        setActiveCoins,
        setTotalCoinsEarned,
        setTotalSpend,
        setBadges,
        setStreak,
        refreshUserStats,
        claimDailyReward,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside a UserProvider");
  }
  return context;
};
