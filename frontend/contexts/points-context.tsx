  "use client";

  import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
  } from "react";
  import api from "@/lib/api";

  // Types
  export interface OwnedBadge {
    badgeId: string;
    name: string;
    icon: string;
    tier: string;
    unlockedAt?: string; // only owned badges have unlock date
  }

  export interface AvailableBadge {
    id: string;
    name: string;
    icon: string;
    tier: string;
    description: string;
  }

  export interface PointsContextType {
    points: number;
    badges: OwnedBadge[];
    allBadges: AvailableBadge[];
    loading: boolean;
    refreshPoints: () => Promise<void>;
    earnPoints: (actionType: string, referenceId?: string) => Promise<void>;
  }

  // Create context
  const PointsContext = createContext<PointsContextType | undefined>(undefined);

  // Provider
  export const PointsProvider: React.FC<{ children: ReactNode }> = ({
    children,
  }) => {
    const [points, setPoints] = useState(0);
    const [badges, setBadges] = useState<OwnedBadge[]>([]);
    const [allBadges, setAllBadges] = useState<AvailableBadge[]>([]);
    const [loading, setLoading] = useState(true);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

    const fetchPointsAndBadges = async () => {
      if (!token) {
        setPoints(0);
        setBadges([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [myRes, allRes] = await Promise.all([
          api.get<{ success: boolean; points: number; badges: OwnedBadge[] }>(
            "/v1/points-badge/my-points",
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          ),
          api.get<{ success: boolean; badges: AvailableBadge[] }>(
            "/v1/points-badge/allbadges"
          ),
        ]);

        setPoints(myRes.data.points);
        setBadges(myRes.data.badges);
        setAllBadges(allRes.data.badges);
      } catch (err) {
        console.error("Error fetching points or badges:", err);
        setPoints(0);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    // Earn points and unlock badges
   // Earn points and unlock badges
const earnPoints = async (actionType?: string, referenceId?: string) => {
  if (!token) return;

  if (!actionType) {
    console.warn("⚠️ earnPoints called without actionType");
    return;
  }

  try {
    interface EarnPointsResponse {
      success: boolean;
      totalPoints: number;
      newBadges: OwnedBadge[];
      allBadges: OwnedBadge[];
    }

    const body: any = { actionType };
    if (referenceId) body.referenceId = referenceId;

    const res = await api.post<EarnPointsResponse>(
      "/v1/points-badge/earn-points",
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    const data = res.data;

    if (data.success) {
      await fetchPointsAndBadges();
      if (data.newBadges?.length) {
        data.newBadges.forEach((badge: any) =>
          console.log(`🏅 New badge unlocked: ${badge.name}`)
        );
      }
    }
  } catch (err) {
    console.error("❌ Error earning points:", err);
  }
};


    useEffect(() => {
      fetchPointsAndBadges();
    }, []);

    return (
      <PointsContext.Provider
        value={{
          points,
          badges,
          allBadges,
          loading,
          refreshPoints: fetchPointsAndBadges,
          earnPoints,
        }}
      >
        {children}
      </PointsContext.Provider>
    );
  };

  // Hook
  export const usePoints = (): PointsContextType => {
    const context = useContext(PointsContext);
    if (!context) throw new Error("usePoints must be used within PointsProvider");
    return context;
  };
