"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

type CompletionStatus = "accepted" | "rejected";

interface EventRequest {
  _id: string;
  title: string;
  date: string;
  location: string;
  completionStatus: CompletionStatus;
  updatedAt: string;
  completionProof?: {
    url: string;
  };
}

const CompletionRequestsHistoryPage: React.FC = () => {
  const [events, setEvents] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | CompletionStatus>("all");

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api.get<{ success: boolean; events: EventRequest[] }>(
        "/v1/event/history/completion-requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Default to rejected if undefined
      const processedEvents = (res.data.events || []).map(event => ({
        ...event,
        completionStatus: event.completionStatus || "rejected",
      }));

      setEvents(processedEvents);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredEvents = events.filter(
    (event) => filter === "all" || event.completionStatus === filter
  );

  const stats = {
    total: events.length,
    accepted: events.filter((e) => e.completionStatus === "accepted").length,
    rejected: events.filter((e) => e.completionStatus === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Completion Requests History
              </h1>
              <p className="text-gray-600">
                Review past event completion submissions and their status
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === "all"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === "accepted"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Accepted ({stats.accepted})
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === "rejected"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No requests found
              </h3>
              <p className="text-gray-600">
                {filter === "all"
                  ? "No completion requests found in history."
                  : `No ${filter} completion requests found.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group"
              >
                {/* Proof Image */}
                {event.completionProof?.url && (
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={event.completionProof.url}
                      alt="Event proof"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={event.completionStatus} />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">{event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">
                        Updated:{" "}
                        {new Date(event.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status?: CompletionStatus }) => {
  const config = {
    accepted: {
      bg: "bg-green-100",
      text: "text-green-800",
      dot: "bg-green-500",
      label: "Accepted",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-800",
      dot: "bg-red-500",
      label: "Rejected",
    },
    unknown: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      dot: "bg-gray-500",
      label: "Unknown",
    },
  };

  const currentConfig = status && config[status] ? config[status] : config.unknown;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentConfig.bg} ${currentConfig.text}`}
    >
      <div className={`w-2 h-2 rounded-full mr-2 ${currentConfig.dot}`}></div>
      {currentConfig.label}
    </span>
  );
};

export default CompletionRequestsHistoryPage;
