"use client";
import { useAdmin } from "@/contexts/admin-context";
import {
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Target,
  Settings,
  Award,
} from "lucide-react";
import { useState } from "react";

interface EventItem {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  category: string;
  imageUrl: string;
  organizationId?: {
    _id: string;
    organizationName: string;
  };
  corporatePartner?: string;
  csrObjectives?: string[];
  eventType?: string;
  maxParticipants?: number;
  budget?: string;
}

// Point calculation maps
const basePointsMap = {
  "Community Cleanup": 10,
  "Teaching & Education": 15,
  "Food Distribution": 12,
  "Healthcare Awareness": 18,
  "Animal Welfare": 14,
  "Environmental Conservation": 16,
  "Senior Citizen Care": 13,
  "Skill Development": 17,
  "Disaster Relief": 20,
  "Blood Donation": 15,
  "Tree Plantation": 11,
  "Sports & Recreation": 12,
  "Arts & Culture": 13,
  "Fundraising": 14,
  "Technology for Good": 16,
  "CSR Partnership": 18,
  "Employee Engagement": 15,
  "Community Outreach": 13,
  Other: 10,
};

const difficultyMap = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
};

const PendingCorporateEventsPage = () => {
  const { pendingCorporateEvents, handleApproveCorporateEvent, handleDenyCorporateEvent } = useAdmin();
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [denialReasons, setDenialReasons] = useState<{ [key: string]: string }>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const onApprove = async (eventId: string) => {
    setLoadingAction(eventId);
    
    try {
      // Approve with default values: basePoints=15, difficulty=1.5, hours=0
      await handleApproveCorporateEvent(eventId, 15, 1.5, 0);
    } catch (error) {
      console.error("Failed to approve event:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const onDeny = async (eventId: string) => {
    const reason = denialReasons[eventId]?.trim() || "Rejected by admin";

    setLoadingAction(eventId);
    try {
      await handleDenyCorporateEvent(eventId, reason);
      setShowRejectInput(null);
      setDenialReasons((prev) => {
        const newReasons = { ...prev };
        delete newReasons[eventId];
        return newReasons;
      });
    } catch (error) {
      console.error("Failed to deny event:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const cancelRejectProcess = (eventId: string) => {
    setShowRejectInput(null);
    setDenialReasons((prev) => {
      const newReasons = { ...prev };
      delete newReasons[eventId];
      return newReasons;
    });
  };

  const getEventById = (eventId: string): EventItem | undefined => {
    return pendingCorporateEvents?.find((event: EventItem) => event._id === eventId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Pending Corporate Events
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Review and approve corporate partnership event requests
          </p>
          <div className="ml-14 mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
            <Briefcase className="w-4 h-4" />
            {pendingCorporateEvents?.length || 0} pending corporate event{pendingCorporateEvents?.length !== 1 ? "s" : ""}
          </div>
        </div>

        {!pendingCorporateEvents || pendingCorporateEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-purple-100 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                <CheckCircle className="w-16 h-16 text-purple-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">All caught up!</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              No corporate event requests pending at the moment. New submissions will appear here for review.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom duration-700">
            {pendingCorporateEvents.map((event: EventItem, index: number) => {
              const isLoading = loadingAction === event._id;
              return (
                <div
                  key={event._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-purple-100 hover:border-purple-300 animate-in fade-in slide-in-from-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="md:flex">
                    {/* Event Image */}
                    <div className="md:w-72 h-64 md:h-auto relative overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Briefcase className="w-16 h-16 text-purple-300" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                          {event.category || "Corporate"}
                        </span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                        {event.title}
                      </h2>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                      {/* Corporate-specific Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {event.organizationId && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                            <Users className="w-4 h-4 text-orange-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">
                              {event.organizationId.organizationName}
                            </span>
                          </div>
                        )}

                        {event.corporatePartner && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                            <Briefcase className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">
                              {event.corporatePartner}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                          <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>

                        {event.time && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{event.time}</span>
                          </div>
                        )}

                        {event.duration && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
                            <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{event.duration}</span>
                          </div>
                        )}

                        {event.budget && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                            <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{event.budget}</span>
                          </div>
                        )}

                        {event.maxParticipants && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-lg border border-rose-200">
                            <Users className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              Max: {event.maxParticipants} participants
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CSR Objectives */}
                      {event.csrObjectives && event.csrObjectives.length > 0 && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-semibold text-purple-900">CSR Objectives:</span>
                          </div>
                          <ul className="space-y-1 ml-6">
                            {event.csrObjectives.slice(0, 3).map((objective, idx) => (
                              <li key={idx} className="text-sm text-gray-700 list-disc">
                                {objective}
                              </li>
                            ))}
                            {event.csrObjectives.length > 3 && (
                              <li className="text-sm text-purple-600 font-medium">
                                +{event.csrObjectives.length - 3} more objectives
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => onApprove(event._id)}
                          disabled={isLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-5 h-5" />
                          {isLoading ? "Approving..." : "Approve Event"}
                        </button>
                        <button
                          onClick={() => setShowRejectInput(event._id)}
                          disabled={isLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject Event
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  placeholder="Optionally provide a reason for rejection..."
                  className="block w-full px-3 py-3 text-sm border-2 border-red-200 rounded-xl placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 resize-none bg-white"
                  rows={4}
                  value={denialReasons[showRejectInput] || ""}
                  onChange={(e) =>
                    setDenialReasons((prev) => ({ ...prev, [showRejectInput]: e.target.value }))
                  }
                  autoFocus
                />
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
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-300"
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

export default PendingCorporateEventsPage;
