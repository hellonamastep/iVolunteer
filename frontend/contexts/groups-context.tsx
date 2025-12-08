"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import api from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.namastep.com/api';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  messageType: "text" | "image" | "announcement";
  imageUrl?: string;
  createdAt: string;
}

interface GroupMember {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  joinedAt: string;
  role: "admin" | "member";
}

interface Group {
  _id: string;
  name: string;
  description: string;
  creator: {
    _id: string;
    name: string;
    email: string;
    city?: string;
  };
  members: GroupMember[];
  category: string;
  imageUrl?: string;
  isPrivate: boolean;
  maxMembers: number;
  messages: Message[];
  settings: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
  };
  tags: string[];
  city?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  userRole?: "creator" | "admin" | "member" | null;
  isMember?: boolean;
}

interface GroupsContextType {
  groups: Group[];
  userGroups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
  createGroup: (groupData: FormData) => Promise<Group>;
  getGroups: (filters?: any) => Promise<any>;
  getUserGroups: (type?: "all" | "created" | "joined") => Promise<Group[]>;
  getGroup: (groupId: string) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<Group>;
  leaveGroup: (groupId: string) => Promise<void>;
  sendMessage: (
    groupId: string,
    content: string,
    messageType?: string,
    file?: File
  ) => Promise<Message>;
  getMessages: (groupId: string, page?: number) => Promise<any>;
  deleteGroup: (groupId: string) => Promise<void>;
  updateGroup: (
    groupId: string,
    updates: {
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
    }
  ) => Promise<void>;
  promoteMemberToAdmin: (groupId: string, memberId: string) => Promise<void>;
  demoteMemberFromAdmin: (groupId: string, memberId: string) => Promise<void>;
  removeMemberFromGroup: (groupId: string, memberId: string) => Promise<void>;
  approveGroup: (groupId: string) => Promise<void>;
  rejectGroup: (groupId: string, rejectionReason: string) => Promise<void>;
  getPendingGroups: () => Promise<Group[]>;
  setCurrentGroup: (group: Group | null) => void;
  clearError: () => void;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error("useGroups must be used within a GroupsProvider");
  }
  return context;
};

export const GroupsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth-token");
    }
    return null;
  };

  const handleApiCall = async (apiCall: () => Promise<any>) => {
    try {
      setError(null);
      const result = await apiCall();
      return result;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      setError(errorMessage);
      console.error("API call failed:", error);
      throw error;
    }
  };

  const createGroup = async (groupData: FormData): Promise<Group> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/v1/groups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: groupData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create group");
      }

      const result = await response.json();
      const newGroup = result.data;

      setGroups((prev) => [newGroup, ...prev]);
      setUserGroups((prev) => [newGroup, ...prev]);
      setLoading(false);

      return newGroup;
    });
  };

  const getGroups = async (filters: any = {}): Promise<any> => {
    return handleApiCall(async () => {
      setLoading(true);
      const token = getToken();

      // Debug logging
      console.log("getGroups - Auth Debug:", {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : "none",
      });

      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== "") {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/v1/groups?${queryParams}`;

      const response = await fetch(url, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            }
          : {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const result = await response.json();

      // Debug logging for response
      console.log("getGroups - Response Debug:", {
        totalGroups: result.data?.length,
        firstGroupHasIsMember: result.data?.[0]?.isMember !== undefined,
        sampleGroup: result.data?.[0]
          ? {
              name: result.data[0].name,
              isMember: result.data[0].isMember,
              userRole: result.data[0].userRole,
            }
          : "no groups",
      });

      setGroups(result.data);
      setLoading(false);

      return result;
    });
  };

  const getUserGroups = async (
    type: "all" | "created" | "joined" = "all"
  ): Promise<Group[]> => {
    // If no user is authenticated, reset groups and return early
    if (!user) {
      setUserGroups([]);
      return [];
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) {
        // Silently return if no token - user might be logging out
        setUserGroups([]);
        return [];
      }

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/user/my-groups?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Handle 401 gracefully
        if (response.status === 401) {
          setUserGroups([]);
          return [];
        }
        throw new Error("Failed to fetch user groups");
      }

      const result = await response.json();
      setUserGroups(result.data);

      return result.data;
    });
  };

  const getGroup = async (groupId: string): Promise<Group> => {
    return handleApiCall(async () => {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/v1/groups/${groupId}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            }
          : {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch group");
      }

      const result = await response.json();
      setCurrentGroup(result.data);

      return result.data;
    });
  };

  const joinGroup = async (groupId: string): Promise<Group> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/${groupId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join group");
      }

      const result = await response.json();
      const updatedGroup = result.data;

      // Update groups list
      setGroups((prev) =>
        prev.map((group) =>
          group._id === groupId ? { ...group, ...updatedGroup } : group
        )
      );

      // Update user groups
      setUserGroups((prev) => {
        const existingIndex = prev.findIndex((g) => g._id === groupId);
        if (existingIndex >= 0) {
          return prev.map((group) =>
            group._id === groupId ? { ...group, ...updatedGroup } : group
          );
        } else {
          return [updatedGroup, ...prev];
        }
      });

      // Update current group if it's the same
      if (currentGroup?._id === groupId) {
        setCurrentGroup({ ...currentGroup, ...updatedGroup });
      }

      return updatedGroup;
    });
  };

  const leaveGroup = async (groupId: string): Promise<void> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/${groupId}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to leave group");
      }

      const result = await response.json();
      const updatedGroup = result.data;

      // Update groups list to reflect membership change
      setGroups((prev) =>
        prev.map((group) =>
          group._id === groupId
            ? {
                ...group,
                isMember: false,
                userRole: null,
                memberCount: updatedGroup.memberCount || group.memberCount - 1,
              }
            : group
        )
      );

      // Remove from user groups
      setUserGroups((prev) => prev.filter((group) => group._id !== groupId));

      // Clear current group if it's the same
      if (currentGroup?._id === groupId) {
        setCurrentGroup(null);
      }
    });
  };

  const sendMessage = async (
    groupId: string,
    content: string,
    messageType = "text",
    file?: File
  ): Promise<Message> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const formData = new FormData();
      formData.append("content", content);
      formData.append("messageType", messageType);

      if (file) {
        formData.append("image", file);
      }

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/${groupId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const result = await response.json();
      const newMessage = result.data;

      // Update current group messages if it's the same group
      if (currentGroup?._id === groupId) {
        setCurrentGroup((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, newMessage],
              }
            : null
        );
      }

      return newMessage;
    });
  };

  const getMessages = async (groupId: string, page = 1): Promise<any> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/${groupId}/messages?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const result = await response.json();
      return result;
    });
  };

  const deleteGroup = async (groupId: string): Promise<void> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/v1/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete group");
      }

      // Remove from all lists
      setGroups((prev) => prev.filter((group) => group._id !== groupId));
      setUserGroups((prev) => prev.filter((group) => group._id !== groupId));

      // Clear current group if it's the same
      if (currentGroup?._id === groupId) {
        setCurrentGroup(null);
      }
    });
  };

  const updateGroup = async (
    groupId: string,
    updates: {
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<void> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/v1/groups/${groupId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update group");
      }

      const result = await response.json();

      // Update current group with new data
      if (currentGroup?._id === groupId) {
        setCurrentGroup(result.data);
      }

      // Update in groups list
      setGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
      setUserGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
    });
  };

  const promoteMemberToAdmin = async (
    groupId: string,
    memberId: string
  ): Promise<void> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/${groupId}/members/${memberId}/promote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to promote member");
      }

      const result = await response.json();

      // Update current group with new data
      if (currentGroup?._id === groupId) {
        setCurrentGroup(result.data);
      }

      // Update in groups list
      setGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
      setUserGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
    });
  };

  const demoteMemberFromAdmin = async (
    groupId: string,
    memberId: string
  ): Promise<void> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/${groupId}/members/${memberId}/demote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to demote admin");
      }

      const result = await response.json();

      // Update current group with new data
      if (currentGroup?._id === groupId) {
        setCurrentGroup(result.data);
      }

      // Update in groups list
      setGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
      setUserGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
    });
  };

  const removeMemberFromGroup = async (
    groupId: string,
    memberId: string
  ): Promise<void> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/${groupId}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove member");
      }

      const result = await response.json();

      // Update current group with new data
      if (currentGroup?._id === groupId) {
        setCurrentGroup(result.data);
      }

      // Update in groups list
      setGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
      setUserGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
    });
  };

  const approveGroup = async (groupId: string): Promise<void> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/admin/${groupId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "approved" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve group");
      }

      const result = await response.json();

      // Update in groups list
      setGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
    });
  };

  const rejectGroup = async (
    groupId: string,
    rejectionReason: string
  ): Promise<void> => {
    if (!user) {
      throw new Error("Authentication required");
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        `${API_BASE_URL}/v1/groups/admin/${groupId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rejected",
            rejectionReason,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject group");
      }

      const result = await response.json();

      // Update in groups list
      setGroups((prev) =>
        prev.map((group) => (group._id === groupId ? result.data : group))
      );
    });
  };

  const getPendingGroups = async (): Promise<Group[]> => {
    if (!user) {
      return [];
    }

    return handleApiCall(async () => {
      const token = getToken();
      if (!token) {
        return [];
      }

      interface PendingGroupsResponse {
        data: Group[];
        message?: string;
      }

      const response = await api.get<PendingGroupsResponse>(
        "/v1/groups/admin/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data || [];
    });
  };

  const clearError = () => {
    setError(null);
  };

  // Load user groups on mount if authenticated
  useEffect(() => {
    if (user) {
      getUserGroups().catch((err) => {
        // Silently handle errors during initialization
        console.error("Failed to load user groups:", err);
      });
    } else {
      // Reset state when user logs out
      setUserGroups([]);
      setCurrentGroup(null);
      setError(null);
    }
  }, [user]);

  const value: GroupsContextType = {
    groups,
    userGroups,
    currentGroup,
    loading,
    error,
    createGroup,
    getGroups,
    getUserGroups,
    getGroup,
    joinGroup,
    leaveGroup,
    sendMessage,
    getMessages,
    deleteGroup,
    updateGroup,
    promoteMemberToAdmin,
    demoteMemberFromAdmin,
    removeMemberFromGroup,
    approveGroup,
    rejectGroup,
    getPendingGroups,
    setCurrentGroup,
    clearError,
  };

  return (
    <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>
  );
};