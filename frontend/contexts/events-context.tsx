"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface Event {
  id: string;
  title: string;
  organization: string;
  organizationId: string;
  location: string; // Required field, pre-filled from organization city but can be changed
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  coins: number;
  description: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  applications: string[];
  eventType?: string; // Event type field
  rejectionReason?: string; // Rejection reason from admin
}

export interface EventApplication {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  appliedAt: string;
  status: "pending" | "accepted" | "rejected";
}

interface EventsContextType {
  events: Event[];
  organizationEvents: Event[];
  applications: EventApplication[];
  loading: boolean;
  fetchEvents: () => void;
  fetchOrganizationEvents: () => void;
  fetchApplications: (userId?: string, eventId?: string) => void;
  createEvent: (
    eventData: Omit<
      Event,
      "id" | "createdAt" | "participants" | "status" | "applications"
    >
  ) => Promise<boolean>;
  applyToEvent: (
    eventId: string,
    userId: string,
    userName: string,
    userEmail: string
  ) => Promise<boolean>;
  approveEvent: (eventId: string) => Promise<boolean>;
  rejectEvent: (eventId: string, rejectionReason?: string) => Promise<boolean>;
  getEventsByOrganization: (organizationId: string) => Event[];
  getApplicationsByEvent: (eventId: string) => EventApplication[];
  getApplicationsByUser: (userId: string) => EventApplication[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [organizationEvents, setOrganizationEvents] = useState<Event[]>([]);
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all approved events for public display (filtered by user's city)
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch("http://localhost:5000/api/v1/event/all-event", {
        headers,
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        console.error("Failed to fetch events from backend");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch events for the logged-in organization
  const fetchOrganizationEvents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      // Add cache-busting parameter and headers
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:5000/api/v1/event/organization?_t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrganizationEvents(data.events || []);
      } else {
        console.error("Failed to fetch organization events");
      }
    } catch (err) {
      console.error("Error fetching organization events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(
    async (userId?: string, eventId?: string) => {
      try {
        let endpoint = "";
        if (userId) {
          endpoint = `http://localhost:5000/api/applications/user/${userId}`;
        } else if (eventId) {
          endpoint = `http://localhost:5000/api/applications/event/${eventId}`;
        }

        if (endpoint) {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            setApplications(data);
          } else {
            console.error("Failed to fetch applications");
          }
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    },
    []
  );

  useEffect(() => {
    fetchEvents();
    fetchOrganizationEvents();
  }, [fetchEvents, fetchOrganizationEvents]);

  const createEvent = async (
    eventData: Omit<
      Event,
      "id" | "createdAt" | "participants" | "status" | "applications"
    >
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch("http://localhost:5000/api/v1/event/add-event", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        fetchOrganizationEvents();
        return true;
      } else {
        const error = await response.json();
        console.error("Failed to create event:", error.message);
        return false;
      }
    } catch (err) {
      console.error("Error creating event:", err);
      return false;
    }
  };

  const applyToEvent = async (
    eventId: string,
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `http://localhost:5000/api/v1/event/participate/${eventId}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ userId, userName, userEmail }),
        }
      );

      if (response.ok) {
        fetchEvents();
        fetchApplications(userId);
        return true;
      } else {
        const error = await response.json();
        console.error("Failed to apply to event:", error.message);
        return false;
      }
    } catch (err) {
      console.error("Error applying to event:", err);
      return false;
    }
  };

  const approveEvent = async (eventId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `http://localhost:5000/api/v1/event/status/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: "approved" })
        }
      );
      if (response.ok) {
        fetchEvents();
        fetchOrganizationEvents();
        return true;
      } else {
        const error = await response.json();
        console.error("Failed to approve event:", error.message);
        return false;
      }
    } catch (err) {
      console.error("Error approving event:", err);
      return false;
    }
  };

  const rejectEvent = async (eventId: string, rejectionReason?: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `http://localhost:5000/api/v1/event/status/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            status: "rejected",
            rejectionReason: rejectionReason || ""
          })
        }
      );
      if (response.ok) {
        fetchEvents();
        fetchOrganizationEvents();
        return true;
      } else {
        const error = await response.json();
        console.error("Failed to reject event:", error.message);
        return false;
      }
    } catch (err) {
      console.error("Error rejecting event:", err);
      return false;
    }
  };

  const getEventsByOrganization = (organizationId: string) => {
    return organizationEvents.filter((event) => event.organizationId === organizationId);
  };

  const getApplicationsByEvent = (eventId: string) => {
    return applications.filter((app) => app.eventId === eventId);
  };

  const getApplicationsByUser = (userId: string) => {
    return applications.filter((app) => app.userId === userId);
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        organizationEvents,
        applications,
        loading,
        fetchEvents,
        fetchOrganizationEvents,
        fetchApplications,
        createEvent,
        applyToEvent,
        approveEvent,
        rejectEvent,
        getEventsByOrganization,
        getApplicationsByEvent,
        getApplicationsByUser,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
}
