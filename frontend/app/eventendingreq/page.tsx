"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import Endeventarchivebutton from "@/components/Endeventarchivebutton";

type EventStatus = "pending" | "approved" | "rejected";

interface EventRequest {
  _id: string;
  title: string;
  date: string;
  location: string;
  status: EventStatus;
  requestedAt: string;
  proofUrl?: string;
}

const EndEventRequestsPage = () => {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api.get<{ success: boolean; requests: any[] }>(
        "/v1/event/review-completion",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formatted: EventRequest[] = (res.data.requests || []).map((req) => ({
        _id: req._id,
        title: req.title,
        date: req.date,
        location: req.location,
        status: req.completionStatus as EventStatus,
        requestedAt: req.updatedAt,
        proofUrl: req.completionProof?.url || req.images?.[0] || "",
      }));

      setRequests(formatted);
    } catch (err) {
      console.error("Failed to fetch event completion requests", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve or reject
  const handleRequestAction = async (eventId: string, action: EventStatus) => {
    if (actionLoading) return;

    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      setActionLoading(eventId);

      // Send the correct decision to backend
      await api.put(
        `/v1/event/review-completion/${eventId}`,
        { decision: action === "approved" ? "accepted" : "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req._id === eventId ? { ...req, status: action } : req
        )
      );
    } catch (err: any) {
      console.error(`Failed to ${action} event`, err);
      alert(err.response?.data?.message || `Failed to ${action} event`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => 
    filter === "all" || req.status === filter
  );

  const stats = {
    total: requests.length,
    pending: requests.filter(req => req.status === "pending").length,
    approved: requests.filter(req => req.status === "approved").length,
    rejected: requests.filter(req => req.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Loading requests...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">End Event Requests</h1>
              <p className="text-gray-600">Manage and review all event completion submissions</p>
            </div>
            <Endeventarchivebutton />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                filter === "all" 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              All Requests ({stats.total})
            </button>
            {/* <button
              onClick={() => setFilter("pending")}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                filter === "pending" 
                  ? "bg-amber-500 text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                filter === "approved" 
                  ? "bg-green-600 text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                filter === "rejected" 
                  ? "bg-red-600 text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Rejected ({stats.rejected})
            </button> */}
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === "all" ? "No requests found" : `No ${filter} requests`}
              </h3>
              <p className="text-gray-600">
                {filter === "all" 
                  ? "There are no event completion requests at this time." 
                  : `There are no ${filter} event completion requests to display.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group"
              >
                {/* Proof Image */}
                {req.proofUrl && (
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={req.proofUrl}
                      alt="Event proof"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {req.title}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">{req.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">
                        {new Date(req.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">
                        Requested: {new Date(req.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Only show for pending requests */}
                  <div className="pt-4 border-t border-gray-100">
                    {req.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          disabled={actionLoading === req._id}
                          onClick={() => handleRequestAction(req._id, "approved")}
                          className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${
                            actionLoading === req._id
                              ? "bg-green-100 text-green-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md"
                          }`}
                        >
                          {actionLoading === req._id ? (
                            <span className="flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processing...
                            </span>
                          ) : (
                            "Approve"
                          )}
                        </button>
                        <button
                          disabled={actionLoading === req._id}
                          onClick={() => handleRequestAction(req._id, "rejected")}
                          className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${
                            actionLoading === req._id
                              ? "bg-red-100 text-red-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md"
                          }`}
                        >
                          {actionLoading === req._id ? "..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <span className={`text-sm font-medium ${
                          req.status === "approved" ? "text-green-600" : "text-red-600"
                        }`}>
                          {req.status === "approved" ? "✓ Approved" : "✗ Rejected"} • No actions available
                        </span>
                      </div>
                    )}
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
const StatusBadge = ({ status }: { status: EventStatus }) => {
  const statusConfig = {
    pending: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      dot: "bg-amber-500"
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-800",
      dot: "bg-green-500"
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-800",
      dot: "bg-red-500"
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${config.dot}`}></div>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default EndEventRequestsPage;