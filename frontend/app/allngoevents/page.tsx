"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Users } from "lucide-react";
import api from "@/lib/api";

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
}

const Allngopublisheventcta = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false); // new state

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api.get<{ success: boolean; events: any[] }>(
        `http://localhost:5000/api/v1/event/organization`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mappedEvents = res.data.events
        .filter((e) => e.status === "approved" || e.status === "ended")
        .map((e) => {
          const participantCount = e.participants?.length || 0;
          const progress = e.maxParticipants
            ? Math.round((participantCount / e.maxParticipants) * 100)
            : 0;

          let displayStatus: EventItem["status"] = e.status;
          if (e.status !== "ended") {
            if (participantCount >= e.maxParticipants) displayStatus = "Full";
            else if (new Date(e.date) < new Date()) displayStatus = "Ongoing";
            else displayStatus = "Open";
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
          };
        });

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Failed to fetch published events", err);
    } finally {
      setLoading(false);
    }
  };

  const openEndEventModal = (eventId: string) => {
    setSelectedEventId(eventId);
    setProofFile(null);
    setShowModal(true);
  };

  const submitEndEvent = async () => {
    if (!proofFile) {
      alert("Please upload a proof image before ending the event");
      return;
    }

    try {
      setSubmitting(true); // disable button
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const formData = new FormData();
      formData.append("completionProof", proofFile);

      await api.post(
        `http://localhost:5000/api/v1/event/end/${selectedEventId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Event ended successfully ✅");
      setShowModal(false);
      fetchEvents();
    } catch (err: any) {
      console.error("Failed to end event", err);
      alert(err.response?.data?.message || "Failed to end event ❌");
    } finally {
      setSubmitting(false); // enable button again
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading published events...</div>;

  return (
    <section className="px-4 py-6 md:px-6 md:py-8 rounded-2xl border border-gray-200 md:m-10 bg-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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
              {events.map((event) => (
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
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                      disabled={event.status === "ended"}
                      onClick={() => openEndEventModal(event._id)}
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

      {/* Proof Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">End Event Confirmation</h3>
            <p className="text-gray-600 mb-3">Upload a proof image before ending this event.</p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="w-full border rounded-lg p-2 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={submitEndEvent}
                disabled={submitting}
                className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "Submitting..." : "Request event completion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Allngopublisheventcta;
