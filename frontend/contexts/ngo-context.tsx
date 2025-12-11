import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";
import { toast } from "react-toastify";

export type EventData = {
  _id?: string;
  title: string;
  description: string;
  location: string; // Required field, pre-filled from organization city but can be changed
  date: string;
  time: string;
  duration: number;
  category: string;
  participants: string[]; // Array of user IDs
  maxParticipants: number;
  pointsOffered: number;
  requirements: string[];
  sponsorshipRequired: boolean;
  sponsorshipAmount: number;
  sponsorshipContactEmail?: string; // 🆕 Added
  sponsorshipContactNumber?: string; // 🆕 Added
  image?: { url: string; caption: string; publicId?: string };
  eventStatus: string;
  eventType?: string; // Event type field
  organization?: string; // Organization name
  organizationId?: {
    _id?: string;
    name: string;
    email: string;
    organizationType?: string;
    websiteUrl?: string;
    yearEstablished?: number;
    contactNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
    ngoDescription?: string;
    focusAreas?: string[];
    organizationSize?: string;
  };
  shouldHide?: boolean;
  completionRequestedAt?: string;
  completionStatus?: string;
  isEventOver?: boolean;
};

export type NGOContextType = {
  events: EventData[];
  organizationEvents: EventData[];
  loading: boolean;
  error: string | null;
  createEvent: (data: EventData) => Promise<void>;
  fetchAvailableEvents: (showAll?: boolean) => Promise<void>;
  fetchOrganizationEvents: () => Promise<void>;
  participateInEvent: (eventId: string) => Promise<boolean>;
  leaveEvent: (eventId: string) => Promise<boolean>;
  getUserParticipatedEvents: () => Promise<void>;
  onUserStatsUpdate?: () => Promise<void>; // Optional callback for stats refresh
};

const NGOContext = createContext<NGOContextType | undefined>(undefined);

export const NGOProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [organizationEvents, setOrganizationEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
  const currentUserId = user?._id || "";

  // --- Create Event ---
  const createEvent = async (eventData: EventData) => {
    try {
      setLoading(true);
      setError(null);
      if (!token) throw new Error("No auth token found");

      const res = await api.post<{ success: boolean; event: EventData }>(
        "/v1/event/add-event",
        eventData,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      setEvents((prev) => [...prev, (res.data as any).event]);
      // Toast is handled by the calling component to avoid duplicates
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create event";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch All Published Events ---
  const fetchAvailableEvents = async (showAll = false) => {
    try {
      setLoading(true);
      setError(null);

      const showAllParam = showAll ? '?showAll=true' : '';
      // console.log('[NGO Context] Fetching events from:', api.defaults.baseURL);
      // console.log('[NGO Context] Full URL:', `${api.defaults.baseURL}/v1/event/all-event${showAllParam}`);
      
      const res = await api.get<{ success: boolean; events: EventData[] }>(
        `/v1/event/all-event${showAllParam}`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      // console.log('[NGO Context] Events fetched:', res.data);
      // console.log('[NGO Context] Number of events:', (res.data as any).events?.length || 0);
      
      setEvents((res.data as any).events || []);
    } catch (err: any) {
      console.error('[NGO Context] Error fetching events:', err);
      console.error('[NGO Context] Error response:', err.response);
      setError(err.response?.data?.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Organization Events ---
  const fetchOrganizationEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) throw new Error("No auth token found");

      // Add cache-busting parameter to prevent 304 responses
      const timestamp = new Date().getTime();
      const res = await api.get<{ success: boolean; events: EventData[] }>(
        `/v1/event/organization?_t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          withCredentials: true,
        }
      );

      setOrganizationEvents((res.data as any).events || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch organization events"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Participate in Event ---
  const participateInEvent = async (eventId: string) => {
    try {
      if (!token) throw new Error("No auth token found");

      const res = await api.post<{ success: boolean; message: string }>(
        `/v1/event/participate/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      // Update local state - add current user to participants
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
                ...e,
                participants: [...(e.participants || []), currentUserId],
              }
            : e
        )
      );

      toast.success(res.data.message || "Participation successful!");
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Participation failed";
      toast.error(errorMessage);
      return false;
    }
  };

  // Add leave event functionality
  const leaveEvent = async (eventId: string) => {
    try {
      if (!token) throw new Error("No auth token found");

      await api.delete(`/v1/event/leave/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      // Update local state - remove current user from participants
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId
            ? {
                ...e,
                participants: (e.participants || []).filter(
                  (id) => id !== currentUserId
                ),
              }
            : e
        )
      );

      toast.success("Successfully left the event!");
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to leave event";
      toast.error(errorMessage);
      return false;
    }
  };

  // Get user's participated events
  const getUserParticipatedEvents = async () => {
    try {
      if (!token) throw new Error("No auth token found");

      const res = await api.get("/v1/event/my-events", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      return (res.data as any).events || [];
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to fetch participated events"
      );
      return [];
    }
  };

  return (
    <NGOContext.Provider
      value={{
        events,
        organizationEvents,
        loading,
        error,
        createEvent,
        fetchAvailableEvents,
        fetchOrganizationEvents,
        participateInEvent,
        leaveEvent,
        getUserParticipatedEvents,
      }}
    >
      {children}
    </NGOContext.Provider>
  );
};

export const useNGO = () => {
  const context = useContext(NGOContext);
  if (!context) throw new Error("useNGO must be used within NGOProvider");
  return context;
};
