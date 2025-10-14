"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:5000/api/v1";

interface ParticipationRequest {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    location: string;
    organization?: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  eventCreatorId: string;
  status: "pending" | "accepted" | "rejected";
  rejectionReason?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

interface ParticipationRequestStats {
  pending: number;
  accepted: number;
  rejected: number;
  total: number;
}

interface ParticipationRequestContextType {
  // Requests for event creators (NGOs)
  incomingRequests: ParticipationRequest[];
  loadingIncoming: boolean;
  
  // Requests made by users
  userRequests: ParticipationRequest[];
  loadingUserRequests: boolean;
  
  // Statistics
  stats: ParticipationRequestStats | null;
  
  // Actions
  createParticipationRequest: (eventId: string, message?: string) => Promise<boolean>;
  acceptRequest: (requestId: string) => Promise<boolean>;
  rejectRequest: (requestId: string, rejectionReason?: string) => Promise<boolean>;
  cancelRequest: (requestId: string) => Promise<boolean>;
  fetchIncomingRequests: (status?: string) => Promise<void>;
  fetchUserRequests: (status?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  
  // Helper functions
  hasRequestedParticipation: (eventId: string) => boolean;
  getPendingRequestForEvent: (eventId: string) => ParticipationRequest | null;
  getRejectedRequestForEvent: (eventId: string) => ParticipationRequest | null;
  hasRejectedRequest: (eventId: string) => boolean;
}

const ParticipationRequestContext = createContext<ParticipationRequestContextType | undefined>(undefined);

export const useParticipationRequest = () => {
  const context = useContext(ParticipationRequestContext);
  if (context === undefined) {
    throw new Error("useParticipationRequest must be used within a ParticipationRequestProvider");
  }
  return context;
};

export const ParticipationRequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<ParticipationRequest[]>([]);
  const [userRequests, setUserRequests] = useState<ParticipationRequest[]>([]);
  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [loadingUserRequests, setLoadingUserRequests] = useState(false);
  const [stats, setStats] = useState<ParticipationRequestStats | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth-token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Create a participation request
  const createParticipationRequest = async (eventId: string, message?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/participation-requests/event/${eventId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your participation request has been submitted.",
        });
        
        // Refresh user requests
        await fetchUserRequests();
        return true;
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit participation request",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error creating participation request:", error);
      toast({
        title: "Error",
        description: "Failed to submit participation request",
        variant: "destructive",
      });
      return false;
    }
  };

  // Accept a participation request
  const acceptRequest = async (requestId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/participation-requests/${requestId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: "accepted" }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Participation request accepted successfully.",
        });
        
        // Update local state
        setIncomingRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: "accepted" as const }
              : req
          )
        );
        
        await fetchStats();
        return true;
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to accept request",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
      return false;
    }
  };

  // Reject a participation request
  const rejectRequest = async (requestId: string, rejectionReason?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/participation-requests/${requestId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status: "rejected",
          rejectionReason 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Participation request rejected.",
        });
        
        // Update local state
        setIncomingRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: "rejected" as const, rejectionReason }
              : req
          )
        );
        
        await fetchStats();
        return true;
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reject request",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
      return false;
    }
  };

  // Cancel a participation request (by user)
  const cancelRequest = async (requestId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/participation-requests/${requestId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Participation request cancelled.",
        });
        
        // Remove from local state
        setUserRequests(prev => prev.filter(req => req._id !== requestId));
        return true;
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to cancel request",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive",
      });
      return false;
    }
  };

  // Fetch incoming requests for event creators
  const fetchIncomingRequests = async (status: string = "pending") => {
    if (!user || user.role !== "ngo") return;
    
    setLoadingIncoming(true);
    try {
      const response = await fetch(`${API_BASE_URL}/participation-requests/my-requests?status=${status}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setIncomingRequests(data.data || []);
      } else {
        console.error("Failed to fetch incoming requests:", data.message);
      }
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
    } finally {
      setLoadingIncoming(false);
    }
  };

  // Fetch user's participation requests
  const fetchUserRequests = async (status?: string) => {
    if (!user) return;
    
    setLoadingUserRequests(true);
    try {
      const url = status 
        ? `${API_BASE_URL}/participation-requests/user-requests?status=${status}`
        : `${API_BASE_URL}/participation-requests/user-requests`;
        
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setUserRequests(data.data || []);
      } else {
        console.error("Failed to fetch user requests:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user requests:", error);
    } finally {
      setLoadingUserRequests(false);
    }
  };

  // Fetch participation request statistics
  const fetchStats = async () => {
    if (!user || user.role !== "ngo") return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/participation-requests/stats`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.data);
      } else {
        console.error("Failed to fetch stats:", data.message);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Helper function to check if user has requested participation for an event
  const hasRequestedParticipation = (eventId: string): boolean => {
    return userRequests.some(req => 
      req.eventId._id === eventId && req.status === "pending"
    );
  };

  // Helper function to get pending request for an event
  const getPendingRequestForEvent = (eventId: string): ParticipationRequest | null => {
    return userRequests.find(req => 
      req.eventId._id === eventId && req.status === "pending"
    ) || null;
  };

  // Helper function to get rejected request for an event
  const getRejectedRequestForEvent = (eventId: string): ParticipationRequest | null => {
    return userRequests.find(req => 
      req.eventId._id === eventId && req.status === "rejected"
    ) || null;
  };

  // Helper function to check if user has a rejected request for an event
  const hasRejectedRequest = (eventId: string): boolean => {
    return userRequests.some(req => 
      req.eventId._id === eventId && req.status === "rejected"
    );
  };

  // Auto-fetch data when user changes
  useEffect(() => {
    if (user) {
      if (user.role === "ngo") {
        fetchIncomingRequests();
        fetchStats();
      } else {
        fetchUserRequests();
      }
    }
  }, [user]);

  const value: ParticipationRequestContextType = {
    incomingRequests,
    loadingIncoming,
    userRequests,
    loadingUserRequests,
    stats,
    createParticipationRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    fetchIncomingRequests,
    fetchUserRequests,
    fetchStats,
    hasRequestedParticipation,
    getPendingRequestForEvent,
    getRejectedRequestForEvent,
    hasRejectedRequest,
  };

  return (
    <ParticipationRequestContext.Provider value={value}>
      {children}
    </ParticipationRequestContext.Provider>
  );
};