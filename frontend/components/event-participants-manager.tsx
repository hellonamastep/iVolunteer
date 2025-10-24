'use client'

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";

interface Participant {
  _id: string;
  name: string;
  email: string;
  contactNumber?: string;
  location?: string;
  userType?: string;
  joinedAt?: string;
  points?: number;
}

interface EventParticipantsManagerProps {
  eventId: string;
  isCreator: boolean;
}

const EventParticipantsManager: React.FC<EventParticipantsManagerProps> = ({
  eventId,
  isCreator,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  // Fetch participants data
  const fetchParticipants = async (showLoadingState = true) => {
    if (!eventId || !isCreator) return;

    try {
      if (showLoadingState) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await api.get(`/v1/event/${eventId}/participants`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });

      if (response.data.success) {
        setParticipants(response.data.participants || []);
      }
    } catch (err: any) {
      console.error("Error fetching participants:", err);
      const errorMessage = err.response?.data?.message || "Failed to fetch participants data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isCreator && eventId) {
      fetchParticipants(true);
    }
  }, [eventId, isCreator]);

  // Download participants data as CSV
  const handleDownloadCSV = () => {
    if (participants.length === 0) {
      toast.error("No participants data to download");
      return;
    }

    const csvHeaders = ["Name", "Email", "Contact Number", "Location", "User Type", "Joined At", "Points"];
    const csvRows = participants.map((participant) => [
      participant.name || "",
      participant.email || "",
      participant.contactNumber || "",
      participant.location || "",
      participant.userType || "",
      participant.joinedAt
        ? new Date(participant.joinedAt).toLocaleDateString()
        : "",
      participant.points?.toString() || "0",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `event_${eventId}_participants_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Participants data downloaded successfully!");
  };

  const handleRefresh = () => {
    fetchParticipants(false);
  };

  // Don't render if not creator
  if (!isCreator) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-[#D4E7B8] shadow-2xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7DD9A6]"></div>
          <span className="ml-4 text-gray-600 text-lg font-medium">Loading participants data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-[#D4E7B8] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Event Participants Management
              </h3>
              <p className="text-white/90 text-sm mt-1">
                View and manage all registered participants
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm">Refresh</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={participants.length === 0}
              className="bg-white text-[#7DD9A6] px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-5 flex items-start space-x-3 shadow-sm">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-bold text-base">Error</h4>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {participants.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-[#E8F5A5] to-[#D4E7B8] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-[#7DD9A6]" />
            </div>
            <h3 className="text-gray-800 text-xl font-bold mb-2">
              No Participants Yet
            </h3>
            <p className="text-gray-600 text-base">
              Participants will appear here once they join your event
            </p>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#E8F5A5] to-[#D4E7B8] rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center space-x-4">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <Users className="h-7 w-7 text-[#7DD9A6]" />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">
                      Total Participants
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {participants.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-md">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-semibold">
                      Active Members
                    </p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {participants.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-200 border-2 border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <FileText className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">
                      Data Records
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {participants.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#D4E7B8] pb-4">
                <h4 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-3 text-[#7DD9A6]" />
                  Participants List
                </h4>
                <span className="text-sm font-semibold text-gray-600 bg-[#E8F5A5] px-4 py-2 rounded-full">
                  {participants.length} {participants.length === 1 ? 'Person' : 'People'}
                </span>
              </div>

              <div className="space-y-4">
                {participants.map((participant, index) => (
                  <div
                    key={participant._id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-[#7DD9A6] transition-all duration-200 hover:shadow-lg bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-5 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
                            {participant.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <h5 className="text-gray-900 font-bold text-lg">
                              {participant.name || "Unknown User"}
                            </h5>
                            {participant.userType && (
                              <span className="px-3 py-1 bg-gradient-to-r from-[#E8F5A5] to-[#D4E7B8] text-gray-700 text-xs rounded-full font-semibold capitalize shadow-sm">
                                {participant.userType}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {participant.email && (
                              <div className="flex items-center space-x-2 text-gray-700">
                                <Mail className="h-4 w-4 text-[#7DD9A6] flex-shrink-0" />
                                <a
                                  href={`mailto:${participant.email}`}
                                  className="hover:text-[#7DD9A6] hover:underline truncate font-medium"
                                >
                                  {participant.email}
                                </a>
                              </div>
                            )}

                            {participant.contactNumber && (
                              <div className="flex items-center space-x-2 text-gray-700">
                                <Phone className="h-4 w-4 text-[#7DD9A6] flex-shrink-0" />
                                <a
                                  href={`tel:${participant.contactNumber}`}
                                  className="hover:text-[#7DD9A6] hover:underline font-medium"
                                >
                                  {participant.contactNumber}
                                </a>
                              </div>
                            )}

                            {participant.location && (
                              <div className="flex items-center space-x-2 text-gray-700">
                                <MapPin className="h-4 w-4 text-[#7DD9A6] flex-shrink-0" />
                                <span className="truncate font-medium">
                                  {participant.location}
                                </span>
                              </div>
                            )}

                            {participant.joinedAt && (
                              <div className="flex items-center space-x-2 text-gray-700">
                                <Calendar className="h-4 w-4 text-[#7DD9A6] flex-shrink-0" />
                                <span className="font-medium">
                                  Joined:{" "}
                                  {new Date(
                                    participant.joinedAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {participant.points !== undefined && (
                            <div className="mt-3 inline-flex items-center space-x-2 bg-gradient-to-r from-[#E8F5A5] to-[#D4E7B8] px-4 py-2 rounded-full shadow-sm">
                              <CheckCircle className="h-4 w-4 text-[#7DD9A6]" />
                              <span className="text-sm font-bold text-gray-800">
                                {participant.points} points
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-4">
                        <div className="bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventParticipantsManager;
