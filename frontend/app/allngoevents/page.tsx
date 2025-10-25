"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Users, AlertCircle, XCircle, Heart } from "lucide-react";
import api from "@/lib/api";
import Pagination from "@/components/Pagination";
import StatusBanner from "@/components/StatusBanner";
import EventAttendanceVerification from "@/components/event-attendance-verification";

interface EventItem {
  _id: string;
  title: string;
  date: string;
  location: string;
  maxParticipants: number;
  filled: number;
  status: "Open" | "Ongoing" | "Full" | "pending" | "approved" | "rejected" | "ended";
  progress: number;
  eventStatus?: string;
  participants?: any[];
  rejectionReason?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  pointsOffered?: number;
}

const Allngopublisheventcta = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Banner dismissal state
  const [dismissedBanners, setDismissedBanners] = useState<{
    rejectedBanner: boolean;
    approvedBanner: boolean;
  }>({
    rejectedBanner: false,
    approvedBanner: false,
  });

  // Load dismissed banners from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dismissedVolunteerEventBanners');
    if (stored) {
      try {
        setDismissedBanners(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing dismissed banners:', e);
      }
    }
  }, []);

  // Function to dismiss a banner
  const dismissBanner = (bannerType: 'rejectedBanner' | 'approvedBanner') => {
    const newDismissedState = {
      ...dismissedBanners,
      [bannerType]: true,
    };
    setDismissedBanners(newDismissedState);
    localStorage.setItem('dismissedVolunteerEventBanners', JSON.stringify(newDismissedState));
  };

  // Scroll to events section
  const scrollToEvents = () => {
    if (eventsRef.current) {
      const eventsTop = eventsRef.current.getBoundingClientRect().top + window.pageYOffset;
      const screenHeight = window.innerHeight;
      const scrollOffset = screenHeight * 0.3;
      
      window.scrollTo({ 
        top: eventsTop - scrollOffset, 
        behavior: "smooth" 
      });
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api.get<{ success: boolean; events: any[] }>(
        `/v1/event/organization`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mappedEvents = res.data.events.map((e) => {
          const participantCount = e.participants?.length || 0;
          const progress = e.maxParticipants
            ? Math.round((participantCount / e.maxParticipants) * 100)
            : 0;

          let displayStatus: EventItem["status"] = e.status;
          
          // Only compute display status for approved events
          if (e.status === "approved") {
            if (participantCount >= e.maxParticipants) displayStatus = "Full";
            else if (new Date(e.date) < new Date()) displayStatus = "Ongoing";
            else displayStatus = "Open";
          } else if (e.status === "ended") {
            displayStatus = "ended";
          }

          return {
            _id: e._id,
            title: e.title,
            date: new Date(e.date).toLocaleDateString(),
            location: e.location,
            filled: participantCount,
            maxParticipants: e.maxParticipants,
            status: displayStatus,
            progress,
            eventStatus: e.eventStatus,
            participants: e.participants,
            rejectionReason: e.rejectionReason,
            approvalStatus: e.status,
            pointsOffered: e.pointsOffered || 0,
          };
        });

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Failed to fetch published events", err);
    } finally {
      setLoading(false);
    }
  };

  const openEndEventModal = (event: EventItem) => {
    setSelectedEvent(event);
    setShowAttendanceModal(true);
  };

  const handleCloseAttendanceModal = () => {
    setShowAttendanceModal(false);
    setSelectedEvent(null);
  };

  const handleAttendanceSubmitSuccess = () => {
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Calculate banner stats
  const pendingEvents = events.filter(e => e.approvalStatus === "pending");
  const rejectedEvents = events.filter(e => e.approvalStatus === "rejected");
  const approvedEvents = events.filter(e => e.approvalStatus === "approved");
  const openCount = approvedEvents.filter(e => e.status === "Open").length;
  const ongoingCount = approvedEvents.filter(e => e.status === "Ongoing").length;
  const fullCount = approvedEvents.filter(e => e.status === "Full").length;

  // Filter events for display (only show approved/ended in the grid)
  const displayEvents = events.filter(e => e.approvalStatus === "approved" || e.status === "ended");

  // Calculate pagination
  const totalPages = Math.ceil(displayEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = displayEvents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToEvents();
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading published events...</div>;

  return (
    <section className="px-4 py-6 md:px-6 md:py-8 rounded-2xl border border-gray-200 md:m-10 bg-white">
      
      {/* Status Banners */}
      {pendingEvents.length > 0 && (
        <StatusBanner
          type="pending"
          icon={AlertCircle}
          count={pendingEvents.length}
          title={`${pendingEvents.length} Volunteer Event${pendingEvents.length > 1 ? 's' : ''} Awaiting Approval`}
          message={
            <>
              You have {pendingEvents.length} volunteer event{pendingEvents.length > 1 ? 's' : ''} pending admin approval. 
              {pendingEvents.length > 1 ? ' They' : ' It'} will appear here once approved.
              <span className="font-semibold ml-1 underline">Click for more details.</span>
            </>
          }
          onClick={scrollToEvents}
        />
      )}

      {rejectedEvents.length > 0 && (
        <StatusBanner
          type="rejected"
          icon={XCircle}
          count={rejectedEvents.length}
          title={`${rejectedEvents.length} Volunteer Event${rejectedEvents.length > 1 ? 's' : ''} Rejected`}
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
              <p className="font-semibold mt-3 underline">Review your rejected events.</p>
            </div>
          }
          onClick={scrollToEvents}
          onDismiss={() => dismissBanner('rejectedBanner')}
          isDismissed={dismissedBanners.rejectedBanner}
        />
      )}

      {approvedEvents.length > 0 && (
        <StatusBanner
          type="approved-volunteer"
          icon={CheckCircle}
          count={approvedEvents.length}
          title={`${approvedEvents.length} Volunteer Event${approvedEvents.length > 1 ? 's' : ''} Active`}
          message={
            <>
              Your volunteer events status: 
              {openCount > 0 && (
                <span className="font-semibold ml-1">{openCount} Open</span>
              )}
              {ongoingCount > 0 && (
                <span className="font-semibold ml-1">
                  {openCount > 0 && ', '}{ongoingCount} Ongoing
                </span>
              )}
              {fullCount > 0 && (
                <span className="font-semibold ml-1">
                  {(openCount > 0 || ongoingCount > 0) && ', '}{fullCount} Full
                </span>
              )}
              <span className="font-semibold ml-1 underline">. Click to view.</span>
            </>
          }
          onClick={scrollToEvents}
          onDismiss={() => dismissBanner('approvedBanner')}
          isDismissed={dismissedBanners.approvedBanner}
        />
      )}
      
      {/* Header */}
      <div ref={eventsRef} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">All Published Events</h2>
          <p className="text-gray-500">Manage and track all your approved/published events</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-50 text-left text-sm text-gray-700">
              {["Title", "Date", "Location", "Volunteers", "Status", "Action"].map((col) => (
                <th key={col} className="p-4 font-semibold">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {currentEvents.map((event) => (
                <motion.tr
                  key={event._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-100 bg-white hover:bg-gray-50 transition-all"
                >
                  <td className="p-4 font-medium text-gray-900">{event.title}</td>
                  <td className="p-4 text-gray-600">{event.date}</td>
                  <td className="p-4 text-gray-600">{event.location}</td>
                  <td className="p-4">
                    <div className="text-gray-800 font-semibold">
                      {event.filled}/{event.maxParticipants}
                    </div>
                  </td>
                  <td className="p-4">
                    {event.status === "Full" ? (
                      <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Full
                      </span>
                    ) : event.status === "Ongoing" ? (
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Ongoing
                      </span>
                    ) : event.status === "ended" ? (
                      <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1">
                        Ended
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Open
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition shadow-sm ${
                        event.status === "ended"
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] text-white hover:from-[#6BC794] hover:to-[#5AB583]"
                      }`}
                      disabled={event.status === "ended"}
                      onClick={() => openEndEventModal(event)}
                    >
                      {event.status === "ended" ? "Event Ended" : "End Event"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {events.length === 0 && (
          <div className="p-8 text-center text-gray-500">No published events found</div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={events.length}
      />

      {/* Event Attendance Verification Modal */}
      {showAttendanceModal && selectedEvent && (
        <EventAttendanceVerification
          eventId={selectedEvent._id}
          eventTitle={selectedEvent.title}
          pointsOffered={selectedEvent.pointsOffered || 0}
          onClose={handleCloseAttendanceModal}
          onSubmitSuccess={handleAttendanceSubmitSuccess}
        />
      )}
    </section>
  );
};

export default Allngopublisheventcta;
