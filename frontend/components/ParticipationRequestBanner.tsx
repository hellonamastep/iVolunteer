"use client";

import React, { useState, useEffect } from "react";
import { useParticipationRequest } from "@/contexts/participation-request-context";
import { Clock, CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export const ParticipationRequestBanner: React.FC = () => {
  const { userRequests } = useParticipationRequest();
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());

  // Load dismissed banners from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('dismissedParticipationBanners');
    if (stored) {
      try {
        const dismissedIds = JSON.parse(stored);
        setDismissedBanners(new Set(dismissedIds));
      } catch (error) {
        console.error('Error loading dismissed banners:', error);
      }
    }
  }, []);

  const pendingRequests = userRequests.filter(req => req.status === "pending");
  const recentStatusUpdates = userRequests.filter(req => 
    req.status !== "pending" && 
    new Date(req.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && // Last 24 hours
    !dismissedBanners.has(req._id) // Not dismissed
  );

  const dismissBanner = (requestId: string) => {
    const newDismissed = new Set([...dismissedBanners, requestId]);
    setDismissedBanners(newDismissed);
    
    // Save to localStorage
    try {
      localStorage.setItem('dismissedParticipationBanners', JSON.stringify(Array.from(newDismissed)));
    } catch (error) {
      console.error('Error saving dismissed banners:', error);
    }
  };

  if (pendingRequests.length === 0 && recentStatusUpdates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Pending Requests Banner */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-1">
                {pendingRequests.length} Participation Request{pendingRequests.length > 1 ? 's' : ''} Pending
              </h4>
              <div className="text-sm text-yellow-800 space-y-1">
                {pendingRequests.slice(0, 3).map((request) => (
                  <p key={request._id}>
                    <span className="font-medium">"{request.eventId.title}"</span> - 
                    Requested participation for {new Date(request.eventId.date).toLocaleDateString()}
                  </p>
                ))}
                {pendingRequests.length > 3 && (
                  <p className="text-yellow-700 font-medium">
                    + {pendingRequests.length - 3} more pending request{pendingRequests.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Status Updates */}
      {recentStatusUpdates.map((request) => (
        <div
          key={request._id}
          className={`border rounded-lg p-4 ${
            request.status === "accepted"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {request.status === "accepted" ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${
                request.status === "accepted" ? "text-green-900" : "text-red-900"
              }`}>
                Participation Request {request.status === "accepted" ? "Accepted" : "Rejected"}
              </h4>
              <div className={`text-sm ${
                request.status === "accepted" ? "text-green-800" : "text-red-800"
              }`}>
                <p className="mb-1">
                  <span className="font-medium">"{request.eventId.title}"</span> - 
                  Your participation request has been {request.status === "accepted" ? "accepted" : "rejected"}.
                </p>
                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-100 rounded border">
                    <p className="text-red-900 font-medium text-xs mb-1">Rejection Reason:</p>
                    <p className="text-red-800 text-sm italic">"{request.rejectionReason}"</p>
                  </div>
                )}
                {request.status === "accepted" && (
                  <p className="text-green-700 font-medium mt-1">
                    You are now confirmed as a participant for this event!
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissBanner(request._id)}
              className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                request.status === "accepted" 
                  ? "text-green-600 hover:bg-green-600" 
                  : "text-red-600 hover:bg-red-600"
              }`}
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};