"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Users, ChevronDown, Search, Filter, Calendar, AlertCircle, XCircle, Edit2, Trash2, X as CloseIcon } from "lucide-react";
import api from "@/lib/api"; // your axios instance
import { toast } from "react-toastify";
import Link from "next/link";
import Pagination from "@/components/Pagination";

interface EventItem {
  _id: string;
  title: string;
  date: string;
  location: string;
  maxParticipants: number;
  filled: number;
  status: "pending" | "approved" | "rejected";
  displayStatus: "Open" | "Ongoing" | "Full";
  progress: number;
  eventStatus?: string;
  participants?: any[];
  description?: string;
  time?: string;
  duration?: number;
  category?: string;
  pointsOffered?: number;
  requirements?: string[];
  sponsorshipRequired?: boolean;
  sponsorshipAmount?: number;
  detailedAddress?: string;
  eventType?: string;
  rejectionReason?: string;
}

const Ngoeventtable = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "ascending",
  });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedEvent, setEditedEvent] = useState<EventItem | null>(null);
  const tableRef = useRef<HTMLElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth-token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      // Add cache-busting parameter to prevent 304 responses
      const timestamp = new Date().getTime();
      const res = await api.get<{ success: boolean; events: any[] }>(
        `/v1/event/organization?_t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      console.log("Fetched events:", res.data); // Debug log

      // Map backend fields to frontend display fields
      const mappedEvents = res.data.events.map((e) => {
        const participantCount = e.participants?.length || 0;
        const progress = e.maxParticipants ? Math.round((participantCount / e.maxParticipants) * 100) : 0;
        
        // Determine display status for approved events based on capacity and date
        let displayStatus: "Open" | "Ongoing" | "Full" = "Open";
        if (e.status === "approved") {
          if (participantCount >= e.maxParticipants) {
            displayStatus = "Full";
          } else if (new Date(e.date) < new Date()) {
            displayStatus = "Ongoing";
          } else {
            displayStatus = "Open";
          }
        }
        
        // Debug log for rejected events
        if (e.status === "rejected") {
          console.log(`Rejected event: ${e.title}, rejectionReason:`, e.rejectionReason);
        }
        
        return {
          _id: e._id,
          title: e.title,
          date: e.date, // Keep raw date for editing
          location: e.location,
          filled: participantCount,
          maxParticipants: e.maxParticipants,
          status: e.status, // pending, approved, or rejected
          displayStatus: displayStatus, // Open, Ongoing, or Full (for approved events)
          progress: progress,
          eventStatus: e.eventStatus,
          participants: e.participants,
          // Include all additional fields needed for the modal
          description: e.description,
          time: e.time,
          duration: e.duration,
          category: e.category,
          pointsOffered: e.pointsOffered,
          requirements: e.requirements,
          sponsorshipRequired: e.sponsorshipRequired,
          sponsorshipAmount: e.sponsorshipAmount,
          detailedAddress: e.detailedAddress,
          eventType: e.eventType,
          rejectionReason: e.rejectionReason
        };
      });
      setEvents(mappedEvents);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Sorting
  const sortedEvents = [...events].sort((a, b) => {
    let aValue: any = (a as any)[sortConfig.key];
    let bValue: any = (b as any)[sortConfig.key];

    if (sortConfig.key === "date") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  // Filtering
  const filteredEvents = sortedEvents
    .filter((event) =>
      filter === "all"
        ? true
        : event.status.toLowerCase() === filter.toLowerCase()
    )
    .filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, sortConfig]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const requestSort = (key: keyof EventItem) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  const handleManageClick = (event: EventItem) => {
    console.log("Selected event:", event); // Debug log
    console.log("Rejection reason:", event.rejectionReason); // Debug log
    setSelectedEvent(event);
    setEditedEvent({ ...event });
    setIsEditMode(false);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setEditedEvent({ ...selectedEvent! });
    }
  };

  const handleSaveEdit = async () => {
    if (!editedEvent) return;
    
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Prepare event data for update
      const updateData = {
        title: editedEvent.title,
        description: editedEvent.description,
        location: editedEvent.location,
        detailedAddress: editedEvent.detailedAddress,
        date: editedEvent.date,
        time: editedEvent.time,
        duration: editedEvent.duration,
        category: editedEvent.category,
        maxParticipants: editedEvent.maxParticipants,
        pointsOffered: editedEvent.pointsOffered,
        sponsorshipRequired: editedEvent.sponsorshipRequired,
        sponsorshipAmount: editedEvent.sponsorshipAmount,
        eventType: editedEvent.eventType,
      };

      await api.put(`/v1/event/${editedEvent._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Event updated successfully!");
      setIsEditMode(false);
      setSelectedEvent(editedEvent);
      fetchEvents(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update event");
    }
  };

  const handleWithdrawRequest = async () => {
    if (!selectedEvent) return;
    
    if (!confirm("Are you sure you want to withdraw this event request? It will be removed from pending review.")) {
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");
      await api.delete(`/v1/event/${selectedEvent._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Event request withdrawn successfully");
      setSelectedEvent(null);
      fetchEvents(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to withdraw event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");
      await api.delete(`/v1/event/${selectedEvent._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Event deleted successfully");
      setSelectedEvent(null);
      fetchEvents(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete event");
    }
  };

  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading events...</div>;

  const pendingCount = events.filter(e => e.status === "pending").length;
  const rejectedEvents = events.filter(e => e.status === "rejected");

  const handleBannerClick = () => {
    setFilter("pending");
    scrollToTable();
  };

  const handleRejectedBannerClick = () => {
    setFilter("rejected");
    scrollToTable();
  };

  return (
    <section ref={tableRef} className="px-4 py-6 md:px-8 md:py-10 max-w-[1200px] mx-auto">
      {/* Pending Events Alert */}
      {pendingCount > 0 && (
        <div 
          onClick={handleBannerClick}
          className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/60 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-yellow-900 mb-2 text-lg">
                {pendingCount} Event{pendingCount > 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-sm text-yellow-800 leading-relaxed">
                You have {pendingCount} event{pendingCount > 1 ? 's' : ''} pending admin approval. 
                {pendingCount > 1 ? ' They' : ' It'} will be visible to volunteers once approved.
                <span className="font-semibold ml-1 underline">Click to view details.</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Events Alert */}
      {rejectedEvents.length > 0 && (
        <div 
          onClick={handleRejectedBannerClick}
          className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-2 text-lg">
                {rejectedEvents.length} Event{rejectedEvents.length > 1 ? 's' : ''} Rejected
              </h4>
              <div className="text-sm text-red-800 space-y-2">
                {rejectedEvents.map((event, index) => (
                  <div key={event._id} className={index > 0 ? "mt-2 pt-2 border-t border-red-200/50" : ""}>
                    <p className="font-medium leading-relaxed">
                      "{event.title}" was rejected by admin
                      {event.rejectionReason && (
                        <span className="font-normal"> for: <span className="italic">"{event.rejectionReason}"</span></span>
                      )}
                    </p>
                  </div>
                ))}
                <p className="font-semibold mt-3 underline">Click to view and manage rejected events.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Your Events
          </h2>
          <p className="text-gray-600 mt-2 text-base">Manage and track your upcoming volunteer events</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:scale-105">
          <Calendar className="w-4 h-4" />
          <Link href="/allngoevents">View All Events</Link>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events by title or location..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none bg-white shadow-sm hover:shadow-md transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "open", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                filter === status
                  ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-teal-300"
              }`}
              onClick={() => setFilter(status)}
            >
              <Filter className="w-4 h-4" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-teal-100 shadow-lg bg-white/80 backdrop-blur-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-teal-50 to-cyan-50 text-left text-sm text-gray-700 border-b-2 border-teal-200">
              {["title", "date", "location", "volunteers", "status", "action"].map((col) => (
                <th
                  key={col}
                  className="p-4 font-bold cursor-pointer hover:bg-teal-100/50 transition-all uppercase tracking-wide"
                  onClick={() => col !== "volunteers" && col !== "action" && requestSort(col as keyof EventItem)}
                >
                  <div className="flex items-center gap-2">
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    {col !== "volunteers" && col !== "action" && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          sortConfig.key === col && sortConfig.direction === "descending" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {currentEvents.map((event, index) => (
                <motion.tr
                  key={event._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-t border-teal-50 bg-white hover:bg-gradient-to-r hover:from-teal-50/30 hover:to-cyan-50/30 transition-all duration-200"
                >
                  <td className="p-4 font-semibold text-gray-900">{event.title}</td>
                  <td className="p-4 text-gray-600 font-medium">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">{event.location}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-gray-800 font-bold text-sm">
                        {event.filled}/{event.maxParticipants}
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            event.progress === 100
                              ? "bg-gradient-to-r from-green-400 to-green-500"
                              : event.progress >= 70
                              ? "bg-gradient-to-r from-teal-400 to-cyan-500"
                              : "bg-gradient-to-r from-amber-400 to-orange-500"
                          }`}
                          style={{ width: `${event.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {event.status === "pending" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 text-xs font-bold shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    ) : event.status === "rejected" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-100 to-rose-100 text-red-700 text-xs font-bold shadow-sm">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    ) : event.displayStatus === "Full" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" /> Full
                      </span>
                    ) : event.displayStatus === "Ongoing" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-bold shadow-sm">
                        <Clock className="w-3.5 h-3.5" /> Ongoing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-bold shadow-sm">
                        <Users className="w-3.5 h-3.5" /> Open
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleManageClick(event)}
                      className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-teal-400 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-600 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      Manage
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredEvents.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No events found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredEvents.length}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">Event Details</h2>
                {selectedEvent.status === "pending" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> Pending
                  </span>
                ) : selectedEvent.status === "rejected" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Approved
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  setSelectedEvent(null);
                  setIsEditMode(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6">
              {selectedEvent.status === "pending" && !isEditMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">Pending Admin Approval</h4>
                      <p className="text-sm text-yellow-800">
                        This event is awaiting admin review. You can edit or withdraw your request.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.status === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">Event Rejected</h4>
                      <p className="text-sm text-red-800 mb-2">
                        This event was rejected by the admin.
                      </p>
                      {/* Debug info */}
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                        <strong>Debug:</strong> rejectionReason = {JSON.stringify(selectedEvent.rejectionReason)}
                      </div>
                      {selectedEvent.rejectionReason && selectedEvent.rejectionReason.trim() !== "" ? (
                        <div className="mt-2 p-3 bg-red-100 rounded-md">
                          <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-800">{selectedEvent.rejectionReason}</p>
                        </div>
                      ) : (
                        <div className="mt-2 p-2 bg-gray-100 rounded-md">
                          <p className="text-xs text-gray-600 italic">No rejection reason provided by admin</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedEvent?.title || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{selectedEvent.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  {isEditMode ? (
                    <textarea
                      value={editedEvent?.description || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{selectedEvent.description || "No description provided"}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  {isEditMode ? (
                    <select
                      value={editedEvent?.category || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="environmental">Environmental</option>
                      <option value="education">Education</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="community">Community</option>
                      <option value="animal-welfare">Animal Welfare</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-700 capitalize">{selectedEvent.category || "N/A"}</p>
                  )}
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
                  {isEditMode ? (
                    <select
                      value={editedEvent?.eventType || "community"}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, eventType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="community">Community Event</option>
                      <option value="virtual">Virtual Event</option>
                      <option value="in-person">In-Person Event</option>
                    </select>
                  ) : (
                    <p className="text-gray-700 capitalize">{selectedEvent.eventType?.replace('-', ' ') || "N/A"}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedEvent?.location || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{selectedEvent.location}</p>
                  )}
                </div>

                {/* Detailed Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Address</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedEvent?.detailedAddress || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, detailedAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{selectedEvent.detailedAddress || "N/A"}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  {isEditMode ? (
                    <input
                      type="date"
                      value={editedEvent?.date ? new Date(editedEvent.date).toISOString().split('T')[0] : ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  {isEditMode ? (
                    <input
                      type="time"
                      value={editedEvent?.time || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{selectedEvent.time || "N/A"}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (hours)</label>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editedEvent?.duration || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, duration: Number(e.target.value) })}
                      min="1"
                      max="12"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{selectedEvent.duration || "N/A"} hours</p>
                  )}
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Participants</label>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editedEvent?.maxParticipants || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, maxParticipants: Number(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{selectedEvent.maxParticipants}</p>
                  )}
                </div>

                {/* Current Participants */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Participants</label>
                  <p className="text-gray-700">{selectedEvent.filled} / {selectedEvent.maxParticipants}</p>
                </div>

                {/* Points Offered */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Points Offered</label>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editedEvent?.pointsOffered || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, pointsOffered: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{selectedEvent.pointsOffered || 0} points</p>
                  )}
                </div>

                {/* Sponsorship Required */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sponsorship Required</label>
                  {isEditMode ? (
                    <select
                      value={editedEvent?.sponsorshipRequired ? "yes" : "no"}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, sponsorshipRequired: e.target.value === "yes" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <p className="text-gray-700">{selectedEvent.sponsorshipRequired ? "Yes" : "No"}</p>
                  )}
                </div>

                {/* Sponsorship Amount */}
                {(isEditMode ? editedEvent?.sponsorshipRequired : selectedEvent.sponsorshipRequired) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sponsorship Amount</label>
                    {isEditMode ? (
                      <input
                        type="number"
                        value={editedEvent?.sponsorshipAmount || ""}
                        onChange={(e) => setEditedEvent({ ...editedEvent!, sponsorshipAmount: Number(e.target.value) })}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-700">${selectedEvent.sponsorshipAmount || 0}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3 justify-end border-t border-gray-200 pt-6">
                {selectedEvent.status === "pending" && (
                  <>
                    {!isEditMode ? (
                      <>
                        <button
                          onClick={handleEditToggle}
                          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Event
                        </button>
                        <button
                          onClick={handleWithdrawRequest}
                          className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Withdraw Request
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsEditMode(false);
                            setEditedEvent({ ...selectedEvent });
                          }}
                          className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          Save Changes
                        </button>
                      </>
                    )}
                  </>
                )}
                
                <button
                  onClick={handleDeleteEvent}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Ngoeventtable;
