"use client";

import React, { useState } from "react";
import { useParticipationRequest } from "@/contexts/participation-request-context";
import { useAuth } from "@/contexts/auth-context";
import { Users, Clock, CheckCircle, XCircle, User, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const PendingParticipationRequests: React.FC = () => {
  const { user } = useAuth();
  const { 
    incomingRequests, 
    loadingIncoming, 
    acceptRequest, 
    rejectRequest,
    stats 
  } = useParticipationRequest();

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return early if user is not NGO
  if (!user || user.role !== "ngo") {
    return null;
  }

  const pendingRequests = incomingRequests.filter(req => req.status === "pending");

  const handleAccept = async (requestId: string) => {
    setIsSubmitting(true);
    try {
      await acceptRequest(requestId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequestId) return;
    
    setIsSubmitting(true);
    try {
      const success = await rejectRequest(selectedRequestId, rejectionReason.trim() || undefined);
      if (success) {
        setShowRejectDialog(false);
        setSelectedRequestId(null);
        setRejectionReason("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectCancel = () => {
    setShowRejectDialog(false);
    setSelectedRequestId(null);
    setRejectionReason("");
  };

  if (loadingIncoming) {
    return (
      <div className="bg-white rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] p-6 h-[250px] flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-[#4FC3DC]" />
          <h3 className="text-base font-normal text-[#2C3E50]">Participation Requests</h3>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4FC3DC]"></div>
          <span className="ml-2 text-gray-500 text-sm">Loading requests...</span>
        </div>
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] p-6 h-[250px] flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-[#4FC3DC]" />
          <h3 className="text-base font-normal text-[#2C3E50]">Participation Requests</h3>
          {stats && stats.pending > 0 && (
            <span className="bg-[#4FC3DC] text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {stats.pending} pending
            </span>
          )}
        </div>
        <div className="text-center flex-1 flex flex-col items-center justify-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No pending participation requests</p>
          <p className="text-xs mt-1">New requests will appear here automatically</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] p-6 h-[250px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4FC3DC]" />
            <h3 className="text-base font-normal text-[#2C3E50]">Participation Requests</h3>
            <span className="bg-[#4FC3DC] text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingRequests.length} pending
            </span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#4FC3DC] scrollbar-track-gray-100">
          {pendingRequests.map((request) => (
            <div 
              key={request._id} 
              className="bg-[#E8F8F7] rounded-[14px] p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{request.userId.name}</span>
                    <span className="text-gray-500 text-sm">({request.userId.email})</span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                     <span className="font-medium">{request.eventId?.title || "No title"}</span>  
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                    <span>{request.eventId?.location || "No location"}</span>

                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Requested {new Date(request.createdAt).toLocaleDateString()} at{" "}
                        {new Date(request.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Message:</span> "{request.message}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(request._id)}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectClick(request._id)}
                    disabled={isSubmitting}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Participation Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this participation request. This will be visible to the user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., This event requires specific skills that weren't mentioned in your profile..."
              rows={4}
              maxLength={500}
            />
            
            <div className="text-xs text-gray-500 text-right">
              {rejectionReason.length}/500 characters
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleRejectCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectConfirm}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? "Rejecting..." : "Reject Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};