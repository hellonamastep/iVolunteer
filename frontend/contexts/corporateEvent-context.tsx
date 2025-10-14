"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api"; // your axios instance

export interface Bid {
  _id?: string;
  corporateName: string;
  offer: string;
  contactEmail: string;
  contactNumber: string;
}

export interface EventData {
  _id: string;
  image: string;
  category: string;
  organizedBy: string;
  date: string;
  time: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  title: string;
  desc: string;
  selectedBid?: Bid | null;
  bids?: Bid[];
}

interface CreateEventResponse {
  success: boolean;
  message: string;
  event?: EventData;
}

interface FetchEventsResponse {
  success: boolean;
  events: EventData[];
}

interface CorporateEventContextType {
  events: EventData[];
  createEvent: (data: FormData) => Promise<boolean>;
  loading: boolean;
  message: string | null;
  error: string | null;
  fetchEvents: () => Promise<void>;
  placeBid: (bidData: Bid & { eventId: string }) => Promise<boolean>;
  allCorporateEvents: () => Promise<EventData[]>;
  deleteEvent: (eventId: string) => Promise<boolean>;  // ✅ Add this
  getEventById: (eventId: string) => Promise<EventData | null>; // ✅ Add this
}

interface PlaceBidResponse {
  success: boolean;
  bid: EventData; // Make sure this matches your EventData type
}

const CorporateEventContext = createContext<CorporateEventContextType | null>(null);

interface CorporateEventProviderProps {
  children: ReactNode;
}

export const CorporateEventProvider: React.FC<CorporateEventProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create event
  const createEvent = async (data: FormData): Promise<boolean> => {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);

      const res = await api.post<CreateEventResponse>("/v1/corporate-events/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "Event added successfully!");

      if (res.data.event) {
        setEvents((prev) => [...prev, res.data.event as EventData]);
      }

      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || "Failed to create event";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get<FetchEventsResponse>("/v1/corporate-events/allevents");
      setEvents(res.data.events || []);
    } catch (err: any) {
      console.error("Failed to fetch events", err);
      setError(err?.response?.data?.message || err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // Place a bid
const placeBid = async (bidData: Bid & { eventId: string }) => {
  try {
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await api.post<PlaceBidResponse>("/v1/corporate-bids/bid", bidData);

    // ✅ Make sure data exists
    if (res.data?.bid) {
      // Update event in state
      setEvents((prev) =>
        prev.map((e) => (e._id === res.data.bid._id ? res.data.bid : e))
      );
    }

    setMessage("Bid placed successfully!");
    return true;
  } catch (err: any) {
    console.error(err?.response?.data || err);
    setError(err?.response?.data?.message || err.message || "Failed to place bid");
    return false;
  } finally {
    setLoading(false);
  }
};


  // Fetch all corporate events without setting state
  const allCorporateEvents = async (): Promise<EventData[]> => {
    try {
      const res = await api.get<FetchEventsResponse>("/v1/corporate-events/allevents");
      return res.data.events || [];
    } catch (err: any) {
      console.error("Failed to fetch all corporate events", err);
      return [];
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await api.delete<{ success: boolean; message: string }>(
      `/v1/corporate-events/delete/${eventId}`
    );

    if (res.data.success) {
      // Remove from state
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      setMessage("Event deleted successfully!");
      return true;
    } else {
      setError(res.data.message || "Failed to delete event");
      return false;
    }
  } catch (err: any) {
    console.error(err);
    setError(err?.response?.data?.message || err.message || "Failed to delete event");
    return false;
  } finally {
    setLoading(false);
  }
};

// Get single event by ID (for details view)
const getEventById = async (eventId: string): Promise<EventData | null> => {
  try {
    const res = await api.get<{ success: boolean; event: EventData }>(
      `/v1/corporate-events/${eventId}`
    );
    return res.data.event || null;
  } catch (err: any) {
    console.error("Failed to get event details", err);
    return null;
  }
};

  return (
    <CorporateEventContext.Provider
      value={{ events, createEvent, loading, message, error, fetchEvents, placeBid, allCorporateEvents,deleteEvent,getEventById }}
    >
      {children}
    </CorporateEventContext.Provider>
  );
};

export const useCorporateEvent = (): CorporateEventContextType => {
  const context = useContext(CorporateEventContext);
  if (!context) throw new Error("useCorporateEvent must be used within CorporateEventProvider");
  return context;
};
