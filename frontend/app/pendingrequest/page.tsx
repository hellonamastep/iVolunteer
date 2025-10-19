"use client";

import React, { useState } from "react";
import {
  useAdmin,
  EventItem,
  basePointsMap,
  difficultyMap,
} from "@/contexts/admin-context";
import { Calendar, MapPin, Clock, Users, Award, CheckCircle, XCircle, Settings } from "lucide-react";

const PendingEventsPage = () => {
  const { pendingEvents, handleApprove, handleDeny } = useAdmin();
  const [denialReasons, setDenialReasons] = useState<{ [key: string]: string }>({});
  const [showApproveConfirm, setShowApproveConfirm] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [selectedBase, setSelectedBase] = useState<{
    [id: string]: keyof typeof basePointsMap;
  }>({});
  const [selectedDifficulty, setSelectedDifficulty] = useState<{
    [id: string]: keyof typeof difficultyMap;
  }>({});
  const [hoursWorked, setHoursWorked] = useState<{ [id: string]: number }>({});

  const calculatePoints = (eventId: string) => {
    const base = selectedBase[eventId] || "small";
    const diff = selectedDifficulty[eventId] || "easy";
    const hours = hoursWorked[eventId] || 0;

    const basePoints = basePointsMap[base];
    const difficultyMultiplier = difficultyMap[diff];
    const durationFactor = 1 + hours / 10;
    const totalPoints = Math.round(
      basePoints * difficultyMultiplier * durationFactor
    );
    return { totalPoints, basePoints, difficultyMultiplier, durationFactor };
  };

  const onApprove = async (eventId: string) => {
    if (!selectedBase[eventId] || !selectedDifficulty[eventId]) {
      alert("Please select category and difficulty");
      return;
    }

    setLoadingAction(eventId);

    try {
      await handleApprove(eventId, {
        baseCategoryOrPoints: selectedBase[eventId],
        difficultyKeyOrMultiplier: selectedDifficulty[eventId],
        hoursWorked: hoursWorked[eventId] || 0,
      });

      setShowApproveConfirm(null);
    } finally {
      setLoadingAction(null);
    }
  };

  const onDeny = async (id: string) => {
    const reason = denialReasons[id];
    if (!reason?.trim()) return alert("Please enter a denial reason");
    setLoadingAction(id);
    try {
      await handleDeny(id, reason);
      setDenialReasons((prev) => ({ ...prev, [id]: "" }));
      setShowRejectInput(null);
    } finally {
      setLoadingAction(null);
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
    return pendingEvents.find(event => event._id === id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-2 h-12 bg-gradient-to-b from-[#5D8A6E] to-[#7AA981] rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-[#5D8A6E] bg-clip-text text-transparent">
              Pending Events
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Review and manage event submissions awaiting approval
          </p>
          
          {/* Stats Card */}
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#5D8A6E] rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-gray-700">
                {pendingEvents.length} pending event{pendingEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-2 text-green-600">
              <Users className="w-5 h-5" />
              <span className="text-lg font-medium">Requires review</span>
            </div>
          </div>
        </div>

        {pendingEvents.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 text-center border border-green-100 shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">All caught up!</h3>
              <p className="text-gray-600 text-lg mb-6">
                No pending events to review
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="grid  grid-cols-2 gap-6">
            {pendingEvents.map((event: EventItem) => {
              const { totalPoints } = calculatePoints(event._id);
              return (
                <div key={event._id} className="group relative bg-white rounded-2xl p-6 border-2 border-green-100 hover:border-green-200 hover:shadow-xl transition-all duration-300">
                  
                  <div className="space-y-6">
                    {/* Event Header */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#5D8A6E] transition-colors duration-300">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {event.description || "No description provided"}
                      </p>
                    </div>

                    {/* Organization and Location Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Organization */}
                      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100">
                          <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Organization</p>
                          <p className="text-base font-semibold text-gray-900">
                            {event.organization}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      {event.location && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                            <MapPin className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Location</p>
                            <p className="text-base font-semibold text-gray-900">
                              {event.location}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-green-100">
                      {/* Approve Button */}
                      <button
                        onClick={() => setShowApproveConfirm(event._id)}
                        disabled={loadingAction === event._id}
                        className="group flex-1 flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Event
                      </button>

                      {/* Reject Button */}
                      <button
                        onClick={() => startRejectProcess(event._id)}
                        disabled={loadingAction === event._id}
                        className="group flex-1 flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Event
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Approve Confirmation Modal with Points Configuration */}
        {showApproveConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-green-200 animate-in zoom-in duration-300">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-2xl mb-4">
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Configure Points</h3>
              <p className="text-gray-600 text-center mb-2">
                Set points for:
              </p>
              <p className="text-lg font-semibold text-green-600 text-center mb-6">
                "{getEventById(showApproveConfirm)?.title}"
              </p>
              
              {/* Points Configuration */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(basePointsMap).map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedBase((prev) => ({
                          ...prev,
                          [showApproveConfirm]: key as keyof typeof basePointsMap,
                        }))}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                          selectedBase[showApproveConfirm] === key
                            ? "bg-[#5D8A6E] text-white border-[#5D8A6E] shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(difficultyMap).map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedDifficulty((prev) => ({
                          ...prev,
                          [showApproveConfirm]: key as keyof typeof difficultyMap,
                        }))}
                        className={`px-2 py-2 text-xs rounded-lg border transition-all ${
                          selectedDifficulty[showApproveConfirm] === key
                            ? "bg-purple-500 text-white border-purple-500 shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={hoursWorked[showApproveConfirm] || 0}
                    onChange={(e) =>
                      setHoursWorked((prev) => ({
                        ...prev,
                        [showApproveConfirm]: Number(e.target.value),
                      }))
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D8A6E] focus:border-[#5D8A6E] bg-white"
                  />
                </div>

                {/* Points Display */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-700">Final Points:</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {calculatePoints(showApproveConfirm).totalPoints}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onApprove(showApproveConfirm)}
                  disabled={loadingAction === showApproveConfirm || !selectedBase[showApproveConfirm] || !selectedDifficulty[showApproveConfirm]}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg disabled:opacity-50 transition-all duration-300"
                >
                  {loadingAction === showApproveConfirm ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Approving...
                    </span>
                  ) : (
                    "Confirm Approve"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Input Modal */}
        {showRejectInput && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-200 animate-in zoom-in duration-300">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-2xl mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Reject Event?</h3>
              <p className="text-gray-600 text-center mb-2">
                You are about to reject:
              </p>
              <p className="text-lg font-semibold text-red-600 text-center mb-6">
                "{getEventById(showRejectInput)?.title}"
              </p>
              
              <div className="relative mb-6">
                <textarea
                  placeholder="Please provide a reason for rejection (minimum 10 characters)..."
                  className="block w-full px-3 py-3 text-sm border-2 border-red-200 rounded-xl placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 resize-none bg-white"
                  rows={4}
                  value={denialReasons[showRejectInput] || ""}
                  onChange={(e) =>
                    setDenialReasons((prev) => ({ ...prev, [showRejectInput]: e.target.value }))
                  }
                  autoFocus
                />
                <div className="absolute bottom-2 right-2">
                  <span className={`text-xs ${denialReasons[showRejectInput]?.length >= 10 ? 'text-green-500' : 'text-red-400'}`}>
                    {denialReasons[showRejectInput]?.length || 0}/10
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mb-6">
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => cancelRejectProcess(showRejectInput)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDeny(showRejectInput)}
                  disabled={!denialReasons[showRejectInput]?.trim() || denialReasons[showRejectInput]?.trim().length < 10}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg disabled:opacity-50 transition-all duration-300"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingEventsPage;