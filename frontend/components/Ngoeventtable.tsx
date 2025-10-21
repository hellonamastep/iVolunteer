"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Users, ChevronDown, Search, Filter, Calendar, AlertCircle, XCircle, Edit2, Trash2, X as CloseIcon, Heart } from "lucide-react";
import api from "@/lib/api"; // your axios instance
import { toast } from "react-toastify";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import StatusBanner from "@/components/StatusBanner";

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
  isDonationEvent?: boolean; // New field to distinguish donation events
  goalAmount?: number; // For donation events
  collectedAmount?: number; // For donation events
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // State for dismissed banners
  const [dismissedBanners, setDismissedBanners] = useState<{
    rejectedBanner: boolean;
    volunteerStatusBanner: boolean;
    donationStatusBanner: boolean;
  }>({
    rejectedBanner: false,
    volunteerStatusBanner: false,
    donationStatusBanner: false,
  });

  // Load dismissed banners from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dismissedEventBanners');
    if (stored) {
      try {
        setDismissedBanners(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing dismissed banners:', e);
      }
    }
  }, []);

  // Function to dismiss a banner
  const dismissBanner = (bannerType: 'rejectedBanner' | 'volunteerStatusBanner' | 'donationStatusBanner') => {
    const newDismissedState = {
      ...dismissedBanners,
      [bannerType]: true,
    };
    setDismissedBanners(newDismissedState);
    localStorage.setItem('dismissedEventBanners', JSON.stringify(newDismissedState));
  };

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
      
      // Fetch both volunteer events and donation events
      const [volunteerRes, donationRes] = await Promise.all([
        api.get<{ success: boolean; events: any[] }>(
          `/v1/event/organization?_t=${timestamp}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        ),
        api.get<{ success: boolean; events: any[] }>(
          `/v1/donation-event/organization/events?_t=${timestamp}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        ).catch((err) => {
          console.log("Donation events fetch error:", err);
          return { data: { events: [] } };
        }) // Gracefully handle if endpoint doesn't exist
      ]);

      // Map volunteer events
      const mappedVolunteerEvents = volunteerRes.data.events.map((e) => {
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
          rejectionReason: e.rejectionReason,
          isDonationEvent: false
        };
      });

      // Map donation events
      const mappedDonationEvents = donationRes.data.events?.map((e: any) => {
        const collectedAmount = e.collectedAmount || 0;
        const goalAmount = e.goalAmount || 0;
        const progress = goalAmount ? Math.round((collectedAmount / goalAmount) * 100) : 0;
        
        // Use approvalStatus for donation events (not status)
        const approvalStatus = e.approvalStatus || "pending";
        
        // Determine display status for donation events
        let displayStatus: "Open" | "Ongoing" | "Full" = "Open";
        if (approvalStatus === "approved") {
          if (collectedAmount >= goalAmount) {
            displayStatus = "Full"; // Goal achieved
          } else if (new Date(e.endDate) < new Date()) {
            displayStatus = "Ongoing"; // Past end date but not fully funded
          } else {
            displayStatus = "Open";
          }
        }
        
        return {
          _id: e._id,
          title: e.title,
          date: e.startDate, // Use start date for donation events
          location: e.location || "N/A",
          filled: collectedAmount,
          maxParticipants: goalAmount,
          status: approvalStatus, // Use approvalStatus for donation events
          displayStatus: displayStatus,
          progress: progress,
          eventStatus: approvalStatus, // Use approvalStatus
          description: e.description || e.shortDescription,
          category: e.category,
          rejectionReason: e.rejectionReason,
          isDonationEvent: true,
          goalAmount: goalAmount,
          collectedAmount: collectedAmount
        };
      }) || [];

      // Combine both event types
      const allEvents = [...mappedVolunteerEvents, ...mappedDonationEvents];
      setEvents(allEvents);
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

  // const scrollToTable = () => {
  //   if (tableRef.current) {
  //     const tableTop = tableRef.current.getBoundingClientRect().top + window.pageYOffset;
  //     const screenHeight = window.innerHeight;
  //     const scrollOffset = screenHeight * 0.3; // 30% of screen height
      
  //     // Scroll to position that keeps table 30% from top of screen
  //     window.scrollTo({ 
  //       top: tableTop - scrollOffset, 
  //       behavior: "smooth" 
  //     });
  //   }
  // };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to table when page changes
    // scrollToTable();
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading events...</div>;

  const pendingCount = events.filter(e => e.status === "pending").length;
  const rejectedEvents = events.filter(e => e.status === "rejected");
  const pendingVolunteerEvents = events.filter(e => e.status === "pending" && !e.isDonationEvent).length;
  const pendingDonationEvents = events.filter(e => e.status === "pending" && e.isDonationEvent).length;

  // Approved events stats
  const approvedVolunteerEvents = events.filter(e => e.status === "approved" && !e.isDonationEvent);
  const approvedDonationEvents = events.filter(e => e.status === "approved" && e.isDonationEvent);
  
  const volunteerOpenCount = approvedVolunteerEvents.filter(e => e.displayStatus === "Open").length;
  const volunteerOngoingCount = approvedVolunteerEvents.filter(e => e.displayStatus === "Ongoing").length;
  const volunteerFullCount = approvedVolunteerEvents.filter(e => e.displayStatus === "Full").length;

  const donationOpenCount = approvedDonationEvents.filter(e => e.displayStatus === "Open").length;
  const donationOngoingCount = approvedDonationEvents.filter(e => e.displayStatus === "Ongoing").length;
  const donationFullCount = approvedDonationEvents.filter(e => e.displayStatus === "Full").length;

  // Scroll to table function
  const scrollToTable = () => {
  if (tableRef.current) {
    const tableTop = tableRef.current.getBoundingClientRect().top + window.pageYOffset;
    const tableHeight = tableRef.current.offsetHeight;
    const screenHeight = window.innerHeight;
    const scrollOffset = screenHeight * 0.2; // 20% above bottom

    // Scroll so that the table bottom sits 20% above the bottom of the screen
    const scrollPosition = tableTop + tableHeight - (screenHeight - scrollOffset);

    window.scrollTo({
      top: scrollPosition,
      behavior: "smooth"
    });
  }
};


  const handleBannerClick = (filterType: string) => {
    setFilter(filterType);
    scrollToTable();
  };

  // Helper function to highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 text-gray-900 font-semibold">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <section ref={tableRef} className="px-4 py-6 md:px-8 md:py-10 max-w-[1200px] mx-auto">
      {/* Pending Events Alert */}
      {pendingCount > 0 && (
        <StatusBanner
          type="pending"
          icon={AlertCircle}
          count={pendingCount}
          title={`${pendingCount} Event${pendingCount > 1 ? 's' : ''} Awaiting Approval`}
          message={
            <>
              You have {pendingCount} event{pendingCount > 1 ? 's' : ''} pending admin approval
              {pendingVolunteerEvents > 0 && pendingDonationEvents > 0 && (
                <span> ({pendingVolunteerEvents} volunteer event{pendingVolunteerEvents > 1 ? 's' : ''}, {pendingDonationEvents} donation event{pendingDonationEvents > 1 ? 's' : ''})</span>
              )}
              {pendingVolunteerEvents > 0 && pendingDonationEvents === 0 && (
                <span> (volunteer event{pendingVolunteerEvents > 1 ? 's' : ''})</span>
              )}
              {pendingVolunteerEvents === 0 && pendingDonationEvents > 0 && (
                <span> (donation event{pendingDonationEvents > 1 ? 's' : ''})</span>
              )}
              . {pendingCount > 1 ? ' They' : ' It'} will be visible once approved.
              <span className="font-semibold ml-1 underline">Click to view details.</span>
            </>
          }
          onClick={() => handleBannerClick("pending")}
        />
      )}

      {/* Rejected Events Alert */}
      {rejectedEvents.length > 0 && (
        <StatusBanner
          type="rejected"
          icon={XCircle}
          count={rejectedEvents.length}
          title={`${rejectedEvents.length} Event${rejectedEvents.length > 1 ? 's' : ''} Rejected`}
          message={
            <div className="space-y-2">
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
          }
          onClick={() => handleBannerClick("rejected")}
          onDismiss={() => dismissBanner('rejectedBanner')}
          isDismissed={dismissedBanners.rejectedBanner}
        />
      )}

      {/* Volunteer Events Status Banner */}
      {approvedVolunteerEvents.length > 0 && (
        <StatusBanner
          type="approved-volunteer"
          icon={CheckCircle}
          count={approvedVolunteerEvents.length}
          title={`${approvedVolunteerEvents.length} Volunteer Event${approvedVolunteerEvents.length > 1 ? 's' : ''} Active`}
          message={
            <>
              Your volunteer events status: 
              {volunteerOpenCount > 0 && (
                <span className="font-semibold ml-1">
                  {volunteerOpenCount} Open
                </span>
              )}
              {volunteerOngoingCount > 0 && (
                <span className="font-semibold ml-1">
                  {volunteerOpenCount > 0 && ', '}{volunteerOngoingCount} Ongoing
                </span>
              )}
              {volunteerFullCount > 0 && (
                <span className="font-semibold ml-1">
                  {(volunteerOpenCount > 0 || volunteerOngoingCount > 0) && ', '}{volunteerFullCount} Full
                </span>
              )}
              <span className="font-semibold ml-1 underline">. Click to view details.</span>
            </>
          }
          onClick={() => handleBannerClick("approved")}
          onDismiss={() => dismissBanner('volunteerStatusBanner')}
          isDismissed={dismissedBanners.volunteerStatusBanner}
        />
      )}

      {/* Donation Events Status Banner */}
      {approvedDonationEvents.length > 0 && (
        <StatusBanner
          type="approved-donation"
          icon={Heart}
          count={approvedDonationEvents.length}
          title={`${approvedDonationEvents.length} Donation Campaign${approvedDonationEvents.length > 1 ? 's' : ''} Active`}
          message={
            <>
              Your donation campaigns status: 
              {donationOpenCount > 0 && (
                <span className="font-semibold ml-1">
                  {donationOpenCount} Open
                </span>
              )}
              {donationOngoingCount > 0 && (
                <span className="font-semibold ml-1">
                  {donationOpenCount > 0 && ', '}{donationOngoingCount} Ongoing
                </span>
              )}
              {donationFullCount > 0 && (
                <span className="font-semibold ml-1">
                  {(donationOpenCount > 0 || donationOngoingCount > 0) && ', '}{donationFullCount} Goal Achieved
                </span>
              )}
              <span className="font-semibold ml-1 underline">. Click to view details.</span>
            </>
          }
          onClick={() => handleBannerClick("approved")}
          onDismiss={() => dismissBanner('donationStatusBanner')}
          isDismissed={dismissedBanners.donationStatusBanner}
        />
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
        
        {/* Desktop Filters - Hidden on mobile */}
        <div className="hidden lg:flex gap-2 flex-wrap">
          {["all", "pending", "approved", "rejected"].map((status) => (
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

        {/* Mobile Filter Button */}
        <div className="lg:hidden relative">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              showMobileFilters
                ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                showMobileFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 p-2 space-y-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                    filter === status
                      ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setFilter(status);
                    setShowMobileFilters(false);
                  }}
                >
                  <Filter className="w-4 h-4" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table - Responsive with horizontal scroll on mobile */}
      <div className="overflow-x-auto rounded-2xl border border-teal-100 shadow-lg bg-white/80 backdrop-blur-sm">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-gradient-to-r from-teal-50 to-cyan-50 text-left text-xs md:text-sm text-gray-700 border-b-2 border-teal-200">
              {["title", "date", "location", "volunteers", "status", "action"].map((col) => (
                <th
                  key={col}
                  className="p-2 md:p-4 font-bold cursor-pointer hover:bg-teal-100/50 transition-all uppercase tracking-wide whitespace-nowrap"
                  onClick={() => col !== "volunteers" && col !== "action" && requestSort(col as keyof EventItem)}
                >
                  <div className="flex items-center gap-1 md:gap-2">
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    {col !== "volunteers" && col !== "action" && (
                      <ChevronDown
                        className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 ${
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
                  <td className="p-2 md:p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900 text-xs md:text-base">
                        {highlightText(event.title, searchQuery)}
                      </span>
                      {event.isDonationEvent && (
                        <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-medium bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] text-white w-fit">
                          💝 Donation
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 md:p-4 text-gray-600 font-medium text-xs md:text-base whitespace-nowrap">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="p-2 md:p-4 text-gray-600 text-xs md:text-base">
                    {highlightText(event.location, searchQuery)}
                  </td>
                  <td className="p-2 md:p-4">
                    <div className="flex flex-col gap-1 md:gap-2 min-w-[100px]">
                      <div className="text-gray-800 font-bold text-xs md:text-sm">
                        {event.isDonationEvent ? (
                          <>₹{event.filled?.toLocaleString()}/₹{event.maxParticipants?.toLocaleString()}</>
                        ) : (
                          <>{event.filled}/{event.maxParticipants}</>
                        )}
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 md:h-2 shadow-inner">
                        <div
                          className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${
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
                  <td className="p-2 md:p-4">
                    {event.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 text-[10px] md:text-xs font-bold shadow-sm whitespace-nowrap">
                        <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Pending
                      </span>
                    ) : event.status === "rejected" ? (
                      <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-red-100 to-rose-100 text-red-700 text-[10px] md:text-xs font-bold shadow-sm whitespace-nowrap">
                        <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Rejected
                      </span>
                    ) : event.displayStatus === "Full" ? (
                      <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-[10px] md:text-xs font-bold shadow-sm whitespace-nowrap">
                        <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Full
                      </span>
                    ) : event.displayStatus === "Ongoing" ? (
                      <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-[10px] md:text-xs font-bold shadow-sm whitespace-nowrap">
                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> Ongoing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-[10px] md:text-xs font-bold shadow-sm whitespace-nowrap">
                        <Users className="w-3 h-3 md:w-3.5 md:h-3.5" /> Open
                      </span>
                    )}
                  </td>
                  <td className="p-2 md:p-4 text-right">
                    <button 
                      onClick={() => handleManageClick(event)}
                      className="px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-teal-400 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-600 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
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
          <div className="p-8 md:p-12 text-center">
            <div className="inline-block p-3 md:p-4 bg-gray-100 rounded-full mb-2 md:mb-3">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm md:text-lg font-medium">No events found matching your criteria</p>
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
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <h2 className="text-lg md:text-2xl font-bold text-gray-800">Event Details</h2>
                {selectedEvent.status === "pending" ? (
                  <span className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] md:text-xs font-semibold">
                    <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Pending
                  </span>
                ) : selectedEvent.status === "rejected" ? (
                  <span className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full bg-red-100 text-red-700 text-[10px] md:text-xs font-semibold">
                    <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full bg-green-100 text-green-700 text-[10px] md:text-xs font-semibold">
                    <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Approved
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  setSelectedEvent(null);
                  setIsEditMode(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <CloseIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 md:px-6 py-4 md:py-6">
              {selectedEvent.status === "pending" && !isEditMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1 text-sm md:text-base">Pending Admin Approval</h4>
                      <p className="text-xs md:text-sm text-yellow-800">
                        This event is awaiting admin review. You can edit or withdraw your request.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.status === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1 text-sm md:text-base">Event Rejected</h4>
                      <p className="text-xs md:text-sm text-red-800 mb-2">
                        This event was rejected by the admin.
                      </p>
                      {selectedEvent.rejectionReason && selectedEvent.rejectionReason.trim() !== "" ? (
                        <div className="mt-2 p-2 md:p-3 bg-red-100 rounded-md">
                          <p className="text-xs md:text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
                          <p className="text-xs md:text-sm text-red-800">{selectedEvent.rejectionReason}</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Event Title</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedEvent?.title || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, title: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  ) : (
                    <p className="text-gray-900 text-sm md:text-lg">{selectedEvent.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Description</label>
                  {isEditMode ? (
                    <textarea
                      value={editedEvent?.description || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base">{selectedEvent.description || "No description provided"}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Category</label>
                  {isEditMode ? (
                    <select
                      value={editedEvent?.category || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, category: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    >
                      <option value="environmental">Environmental</option>
                      <option value="education">Education</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="community">Community</option>
                      <option value="animal-welfare">Animal Welfare</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-700 capitalize text-sm md:text-base">{selectedEvent.category || "N/A"}</p>
                  )}
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Event Type</label>
                  {isEditMode ? (
                    <select
                      value={editedEvent?.eventType || "community"}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, eventType: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    >
                      <option value="community">Community Event</option>
                      <option value="virtual">Virtual Event</option>
                      <option value="in-person">In-Person Event</option>
                    </select>
                  ) : (
                    <p className="text-gray-700 capitalize text-sm md:text-base">{selectedEvent.eventType?.replace('-', ' ') || "N/A"}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Location</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedEvent?.location || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, location: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base">{selectedEvent.location}</p>
                  )}
                </div>

                {/* Detailed Address - Hidden on mobile when not in edit mode */}
                <div className={!isEditMode ? "hidden md:block" : ""}>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Detailed Address</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedEvent?.detailedAddress || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, detailedAddress: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base">{selectedEvent.detailedAddress || "N/A"}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Date</label>
                  {isEditMode ? (
                    <input
                      type="date"
                      value={editedEvent?.date ? new Date(editedEvent.date).toISOString().split('T')[0] : ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, date: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Time</label>
                  {isEditMode ? (
                    <input
                      type="time"
                      value={editedEvent?.time || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, time: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base">{selectedEvent.time || "N/A"}</p>
                  )}
                </div>

                {/* Duration - Hidden on mobile when not in edit mode */}
                <div className={!isEditMode ? "hidden md:block" : ""}>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Duration (hours)</label>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editedEvent?.duration || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, duration: Number(e.target.value) })}
                      min="1"
                      max="12"
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base">{selectedEvent.duration || "N/A"} hours</p>
                  )}
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Max Participants</label>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editedEvent?.maxParticipants || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, maxParticipants: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base">{selectedEvent.maxParticipants}</p>
                  )}
                </div>

                {/* Current Participants */}
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Current Participants</label>
                  <p className="text-gray-700 text-sm md:text-base">{selectedEvent.filled} / {selectedEvent.maxParticipants}</p>
                </div>

                {/* Points Offered - Hidden on mobile when not in edit mode */}
                <div className={!isEditMode ? "hidden md:block" : ""}>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Points Offered</label>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editedEvent?.pointsOffered || ""}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, pointsOffered: Number(e.target.value) })}
                      min="0"
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base">{selectedEvent.pointsOffered || 0} points</p>
                  )}
                </div>

                {/* Sponsorship Required - Hidden on mobile when not in edit mode */}
                <div className={!isEditMode ? "hidden md:block" : ""}>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Sponsorship Required</label>
                  {isEditMode ? (
                    <select
                      value={editedEvent?.sponsorshipRequired ? "yes" : "no"}
                      onChange={(e) => setEditedEvent({ ...editedEvent!, sponsorshipRequired: e.target.value === "yes" })}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base">{selectedEvent.sponsorshipRequired ? "Yes" : "No"}</p>
                  )}
                </div>

                {/* Sponsorship Amount */}
                {(isEditMode ? editedEvent?.sponsorshipRequired : selectedEvent.sponsorshipRequired) && (
                  <div className={!isEditMode ? "hidden md:block" : ""}>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Sponsorship Amount</label>
                    {isEditMode ? (
                      <input
                        type="number"
                        value={editedEvent?.sponsorshipAmount || ""}
                        onChange={(e) => setEditedEvent({ ...editedEvent!, sponsorshipAmount: Number(e.target.value) })}
                        min="0"
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                      />
                    ) : (
                      <p className="text-gray-700 text-sm md:text-base">${selectedEvent.sponsorshipAmount || 0}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 md:mt-8 flex flex-wrap gap-2 md:gap-3 justify-end border-t border-gray-200 pt-4 md:pt-6">
                {selectedEvent.status === "pending" && (
                  <>
                    {!isEditMode ? (
                      <>
                        <button
                          onClick={handleEditToggle}
                          className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm md:text-base"
                        >
                          <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Edit
                        </button>
                        <button
                          onClick={handleWithdrawRequest}
                          className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium text-sm md:text-base"
                        >
                          <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Withdraw
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsEditMode(false);
                            setEditedEvent({ ...selectedEvent });
                          }}
                          className="px-4 md:px-6 py-2 md:py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm md:text-base"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 md:px-6 py-2 md:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm md:text-base"
                        >
                          Save
                        </button>
                      </>
                    )}
                  </>
                )}
                
                <button
                  onClick={handleDeleteEvent}
                  className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm md:text-base"
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Delete
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
