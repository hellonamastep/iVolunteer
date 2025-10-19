"use client";

import React from "react";
import { useParticipationRequest } from "@/contexts/participation-request-context";
import { useAuth } from "@/contexts/auth-context";

export const ParticipationRequestDebug: React.FC = () => {
  const { user } = useAuth();
  const { 
    incomingRequests, 
    loadingIncoming, 
    stats 
  } = useParticipationRequest();

  console.log("ParticipationRequestDebug - User:", user);
  console.log("ParticipationRequestDebug - Incoming Requests:", incomingRequests);
  console.log("ParticipationRequestDebug - Loading:", loadingIncoming);
  console.log("ParticipationRequestDebug - Stats:", stats);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-yellow-900 mb-2">Debug: Participation Requests</h3>
      <div className="text-sm text-yellow-800 space-y-1">
        <p><strong>User Role:</strong> {user?.role || 'Not logged in'}</p>
        <p><strong>User ID:</strong> {user?._id || 'N/A'}</p>
        <p><strong>Loading:</strong> {loadingIncoming ? 'Yes' : 'No'}</p>
        <p><strong>Incoming Requests Count:</strong> {incomingRequests?.length || 0}</p>
        <p><strong>Stats:</strong> {stats ? JSON.stringify(stats) : 'None'}</p>
        <p><strong>Context Available:</strong> {incomingRequests !== undefined ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};