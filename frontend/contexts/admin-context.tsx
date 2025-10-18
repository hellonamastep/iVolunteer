"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import api from "@/lib/api";

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: "admin" | "corporate" | "ngo" | "volunteer";
}

export interface EventItem {
  _id: string;
  title: string;
  organization: string;
  date: string;
  time: string;
  status: "pending" | "approved" | "rejected";
  [key: string]: any;
}

export interface DonationEventItem {
  _id: string;
  title: string;
  organization: string;
  date: string;
  time: string;
  status: "pending" | "approved" | "rejected";
  [key: string]: any;
}

export interface AdminContextType {
  isAdmin: boolean;
  adminInfo: AdminInfo | null;
  loginAdmin: (info: AdminInfo) => void;
  logoutAdmin: () => void;

  pendingEvents: EventItem[];
  fetchPendingEvents: () => Promise<void>;
  handleApprove: (
    id: string,
    scoring: {
      baseCategoryOrPoints: keyof typeof basePointsMap | number;
      difficultyKeyOrMultiplier: keyof typeof difficultyMap | number;
      hoursWorked: number;
    }
  ) => Promise<void>;
  handleDeny: (id: string, reason: string) => Promise<void>;

  pendingDonationEvents: DonationEventItem[];
  fetchPendingDonationEvents: () => Promise<void>;
  handleUpdateDonationEventStatus: (
    id: string,
    status: "approved" | "rejected"
  ) => Promise<void>;
}

export const basePointsMap = {
  small: 50,
  medium: 100,
  highImpact: 150,
  longTerm: 200,
};

export const difficultyMap = {
  easy: 1.0,
  moderate: 1.3,
  challenging: 1.7,
  extreme: 2.0,
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingEvents, setPendingEvents] = useState<EventItem[]>([]);
  const [pendingDonationEvents, setPendingDonationEvents] = useState<
    DonationEventItem[]
  >([]);

  const loginAdmin = (info: AdminInfo) => {
    setAdminInfo(info);
    setIsAdmin(info.role === "admin");
  };

  const logoutAdmin = () => {
    setAdminInfo(null);
    setIsAdmin(false);
    setPendingEvents([]);
    setPendingDonationEvents([]);
    localStorage.removeItem("auth-user");
  };

  // Normal events
  const fetchPendingEvents = async () => {
    if (!isAdmin) return;
    const token = localStorage.getItem("auth-token");
    if (!token) return console.warn("No auth token found");

    try {
      const res = await api.get<{ success: boolean; events: EventItem[] }>(
        "/v1/event/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingEvents(res.data.events);
    } catch (err) {
      console.error("Failed to fetch pending events", err);
    }
  };

  const handleApprove = async (
    id: string,
    scoring: {
      baseCategoryOrPoints: keyof typeof basePointsMap | number;
      difficultyKeyOrMultiplier: keyof typeof difficultyMap | number;
      hoursWorked: number;
    }
  ) => {
    if (!isAdmin) return;
    const token = localStorage.getItem("auth-token");

    try {
      await api.put(
        `/v1/event/admin/approve-with-scoring/${id}`,
        {
          baseCategory: scoring.baseCategoryOrPoints, // string key or number
          difficulty: scoring.difficultyKeyOrMultiplier, // string key or number
          hoursWorked: scoring.hoursWorked || 0, // ensure numeric
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Failed to approve event", err);
    }
  };
  const handleDeny = async (id: string, reason: string) => {
    if (!isAdmin) return;
    const token = localStorage.getItem("auth-token");
    try {
      await api.put(
        `/v1/event/status/${id}`,
        {
          status: "rejected",
          rejectionReason: reason || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Failed to reject event", err);
    }
  };

  // Donation events
  const fetchPendingDonationEvents = async () => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem("auth-token");
      const res = await api.get<{
        success: boolean;
        events: DonationEventItem[];
      }>("/v1/donation-event/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingDonationEvents(res.data.events);
    } catch (err) {
      console.error("Failed to fetch pending donation events", err);
    }
  };

  const handleUpdateDonationEventStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem("auth-token");
      await api.patch(
        `/v1/donation-event/status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingDonationEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error(`Failed to ${status} donation event`, err);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("auth-user");
    if (userStr) loginAdmin(JSON.parse(userStr));
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingEvents();
      fetchPendingDonationEvents();
    }
  }, [isAdmin]);

  const value: AdminContextType = {
    isAdmin,
    adminInfo,
    loginAdmin,
    logoutAdmin,
    pendingEvents,
    fetchPendingEvents,
    handleApprove,
    handleDeny,
    pendingDonationEvents,
    fetchPendingDonationEvents,
    handleUpdateDonationEventStatus, // 🔹 added here
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdmin must be used within an AdminProvider");
  return context;
};
