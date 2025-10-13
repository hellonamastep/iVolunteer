"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";

// Define the Opportunity type
export interface Opportunity {
  id?: string;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
  participants: string;
  goal: string;
  category: string;
  featured: boolean;
}

// Context type
interface CorporateContextType {
  opportunities: Opportunity[];
  fetchOpportunities: () => Promise<void>;
}

// Create context
const CorporateContext = createContext<CorporateContextType | undefined>(undefined);

// Provider component
export const CorporateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  // Fetch opportunities from API
  const fetchOpportunities = async () => {
    try {
      const res = await api.get<{ availableSponsorEvent: any[] }>("/v1/event/sponsorship");
      const data = res.data;

      const mapped: Opportunity[] = (data.availableSponsorEvent || []).map((item: any) => ({
        title: item.title || "",
        description: item.description || "",
        image: item.images?.[0] || "/images/default-event.avif",
        date: item.date ? new Date(item.date).toLocaleDateString() : "",
        location: item.location || "",
        participants: `${item.participants?.length || 0} / ${item.participantsNeeded || 0}`,
        goal: item.goal || `${item.sponsorshipAmount || 0} USD`,
        category: item.category || "",
        featured: false,
        sponsorshipContactEmail: item.sponsorshipContactEmail || "", // ✅ add this
  sponsorshipContactNumber: item.sponsorshipContactNumber || ""
      }));

      setOpportunities(mapped);
      console.log(opportunities)
    } catch (err) {
      console.error("Failed to fetch opportunities", err);
    }
  };

  // Fetch once on mount
  useEffect(() => {
    fetchOpportunities();
  }, []);

  return (
    <CorporateContext.Provider value={{ opportunities, fetchOpportunities }}>
      {children}
    </CorporateContext.Provider>
  );
};

// Custom hook
export const useCorporate = (): CorporateContextType => {
  const context = useContext(CorporateContext);
  if (!context) {
    throw new Error("useCorporate must be used within a CorporateProvider");
  }
  return context;
};
