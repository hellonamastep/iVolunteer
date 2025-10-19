"use client";

import React, { useState, useEffect } from "react";
import { useAdmin, DonationEventItem } from "@/contexts/admin-context";
import { Gift, Building, Calendar, Target, CheckCircle, XCircle, ArrowRight, Sparkles, Users, DollarSign } from "lucide-react";

const PendingDonationEventsPage = () => {
  const { 
    pendingDonationEvents, 
    fetchPendingDonationEvents, 
    handleUpdateDonationEventStatus 
  } = useAdmin();
  
  const [denialReasons, setDenialReasons] = useState<{ [key: string]: string }>({});
  const [showApproveConfirm, setShowApproveConfirm] = useState<string | null>(null);
  const [showDenyConfirm, setShowDenyConfirm] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingDonationEvents();
  }, []);

  const onApprove = async (id: string) => {
    setLoadingAction(id);
    try {
      await handleUpdateDonationEventStatus(id, "approved");
    } finally {
      setLoadingAction(null);
      setShowApproveConfirm(null);
    }
  };

  const onDeny = async (id: string) => {
    const reason = denialReasons[id];
    if (!reason?.trim()) {
      alert("Please enter a denial reason");
      return;
    }
    
    setLoadingAction(id);
    try {
      await handleUpdateDonationEventStatus(id, "rejected");
      setDenialReasons((prev) => ({ ...prev, [id]: "" }));
      setShowRejectInput(null);
    } finally {
      setLoadingAction(null);
      setShowDenyConfirm(null);
    }
  };

  const startRejectProcess = (id: string) => {
    setShowRejectInput(id);
    setDenialReasons((prev) => ({ ...prev, [id]: "" }));
  };

  const cancelRejectProcess = (id: string) => {
    setShowRejectInput(null);
    setDenialReasons((prev) => ({ ...prev, [id]: "" }));
  };

  const getEventById = (id: string) => {
    return pendingDonationEvents.find(event => event._id === id);
  };

  // Format date if it exists
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-2 h-12 bg-gradient-to-b from-[#A56CB4] to-[#C084CC] rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-[#A56CB4] bg-clip-text text-transparent">
              Pending Donations
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Review and manage donation event submissions awaiting approval
          </p>
          
          {/* Stats Card */}
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#A56CB4] rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-gray-700">
                {pendingDonationEvents.length} pending donation{pendingDonationEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg font-medium">Requires review</span>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {pendingDonationEvents.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 text-center border border-purple-100 shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">All caught up!</h3>
              <p className="text-gray-600 text-lg mb-6">
                No pending donation events to review
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingDonationEvents.map((event: DonationEventItem) => (
              <div key={event._id} className="group relative bg-white rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Event Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      {/* <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#A56CB4] to-[#C084CC] text-white shadow-lg">
                        <Gift className="w-8 h-8" />
                      </div> */}
                      
                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#A56CB4] transition-colors duration-300">
                            {event.title}
                          </h3>
                          <p className="text-gray-600 mt-2 leading-relaxed">
                            {event.description || "No description provided"}
                          </p>
                        </div>
                        
                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Organization */}
                          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                              <Building className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Organization</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {event.ngoId?.name || "Not provided"}
                              </p>
                            </div>
                          </div>

                          {/* Start Date */}
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Start Date</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatDate(event.startDate)}
                              </p>
                            </div>
                          </div>

                          {/* End Date */}
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                              <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">End Date</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatDate(event.endDate)}
                              </p>
                            </div>
                          </div>

                          {/* Target Amount */}
                          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100">
                              <DollarSign className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Goal Amount</p>
                              <p className="text-sm font-semibold text-emerald-600">
                                ${formatCurrency(event.goalAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions - Better Alignment */}
                  <div className="lg:w-72 space-y-3 flex flex-col mt-10 ">
                    {/* Approve Button */}
                    <button
                      onClick={() => setShowApproveConfirm(event._id)}
                      disabled={loadingAction === event._id}
                      className="group relative w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {loadingAction === event._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve Donation
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>

                    {/* Reject Section */}
                    {showRejectInput === event._id ? (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <div className="relative">
                          <textarea
                            placeholder="Reason for rejection (min. 10 chars)..."
                            className="block w-full px-3 py-3 text-sm border-2 border-red-200 rounded-xl placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 resize-none bg-white"
                            rows={3}
                            value={denialReasons[event._id] || ""}
                            onChange={(e) =>
                              setDenialReasons((prev) => ({ ...prev, [event._id]: e.target.value }))
                            }
                            autoFocus
                          />
                          <div className="absolute bottom-2 right-2">
                            <span className={`text-xs ${denialReasons[event._id]?.length >= 10 ? 'text-green-500' : 'text-red-400'}`}>
                              {denialReasons[event._id]?.length || 0}/10
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => cancelRejectProcess(event._id)}
                            className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setShowDenyConfirm(event._id)}
                            disabled={!denialReasons[event._id]?.trim() || denialReasons[event._id]?.trim().length < 10}
                            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-300"
                          >
                            Submit Rejection
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startRejectProcess(event._id)}
                        disabled={loadingAction === event._id}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Donation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showApproveConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-green-200 animate-in zoom-in duration-300">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-2xl mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Approve Donation Event?</h3>
              <p className="text-gray-600 text-center mb-2">
                You are about to approve:
              </p>
              <p className="text-lg font-semibold text-green-600 text-center mb-4">
                "{getEventById(showApproveConfirm)?.title}"
              </p>
              <p className="text-sm text-gray-500 text-center mb-4">
                This donation event will be published and visible to all users.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onApprove(showApproveConfirm)}
                  disabled={loadingAction === showApproveConfirm}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg disabled:opacity-50 transition-all duration-300"
                >
                  {loadingAction === showApproveConfirm ? "Approving..." : "Yes, Approve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDenyConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-200 animate-in zoom-in duration-300">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-2xl mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Reject Donation Event?</h3>
              <p className="text-gray-600 text-center mb-2">
                You are about to reject:
              </p>
              <p className="text-lg font-semibold text-red-600 text-center mb-4">
                "{getEventById(showDenyConfirm)?.title}"
              </p>
              
              <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
                <p className="text-red-700 text-sm">{denialReasons[showDenyConfirm]}</p>
              </div>

              <p className="text-sm text-gray-500 text-center mb-4">
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDenyConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDeny(showDenyConfirm)}
                  disabled={loadingAction === showDenyConfirm}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg disabled:opacity-50 transition-all duration-300"
                >
                  {loadingAction === showDenyConfirm ? "Rejecting..." : "Yes, Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingDonationEventsPage;