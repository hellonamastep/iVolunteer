"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Archive,
  CheckCircle,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/header";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface ArchivedEvent {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  category: string;
  participants: any[];
  maxParticipants: number;
  image?: { url: string; caption?: string };
  eventType?: string;
  completionStatus: string;
  completionRequestedAt?: string;
  eventStatus: string;
}

export default function ArchivedEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ArchivedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArchivedEvents();
  }, []);

  const fetchArchivedEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await api.get("/v1/event/archived-events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents((res.data as any).events || []);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch archived events";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (eventId: string) => {
    router.push(`/volunteer/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E8F5F5" }}>
        <div className="text-center">
          <Image
            src="/mascots/video_mascots/mascot_walking_video.gif"
            alt="Loading..."
            width={200}
            height={200}
            unoptimized
          />
          <p className="text-gray-600 text-lg font-semibold mt-6">Loading archived events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E8F5F5" }}>
        <Header />
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md shadow-lg">
            <div className="text-red-600 text-4xl mb-2">⚠️</div>
            <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchArchivedEvents}
              className="mt-4 bg-gradient-to-r from-teal-400 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-teal-500 hover:to-cyan-600 transition-colors shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 relative overflow-hidden" style={{ backgroundColor: "#E8F5F5" }}>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-20">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Archived Events</h1>
                <p className="text-gray-600 text-sm">Events that have been completed and archived</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-10 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Archived Events</h3>
              <p className="text-gray-600 text-sm">
                You don't have any archived events yet. Events will appear here 30 minutes after completion.
              </p>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {events.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-800">{events.length}</span> archived event
                {events.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {events.map((event) => {
                const currentParticipants = Array.isArray(event.participants)
                  ? event.participants.length
                  : 0;
                const maxParticipants = event.maxParticipants || 0;
                const progress = maxParticipants
                  ? Math.min(100, Math.round((currentParticipants / maxParticipants) * 100))
                  : 0;

                return (
                  <div
                    key={event._id}
                    onClick={() => handleCardClick(event._id)}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border-2 border-gray-200"
                  >
                    {/* Event Image */}
                    <div className="relative h-40 w-full overflow-hidden">
                      {event.image?.url ? (
                        <>
                          <img
                            src={event.image.url}
                            alt={event.image.caption || event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-75"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        </>
                      ) : (
                        <>
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center opacity-75">
                            <div className="text-center">
                              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-1" />
                              <p className="text-gray-500 text-xs font-semibold">Archived Event</p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </>
                      )}

                      {/* Archived Badge */}
                      <div className="absolute top-3 left-3 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        Archived
                      </div>

                      {/* Event Type Badge */}
                      {event.eventType && (
                        <div className="absolute bottom-3 left-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${
                              event.eventType === "virtual"
                                ? "bg-cyan-500 text-white"
                                : event.eventType === "in-person"
                                ? "bg-emerald-500 text-white"
                                : "bg-purple-500 text-white"
                            }`}
                          >
                            {event.eventType === "virtual" && "💻 Virtual"}
                            {event.eventType === "in-person" && "📍 In-Person"}
                            {event.eventType === "community" && "🌍 Community"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-4">
                      {/* Event Title */}
                      <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {event.title}
                      </h3>

                      {/* Event Description */}
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{event.description}</p>

                      {/* Date */}
                      <div className="flex items-center text-gray-600 mb-2 text-xs">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                        <span>
                          {event.date
                            ? new Date(event.date).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Date TBD"}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-gray-600 mb-3 text-xs">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-pink-500" />
                        <span className="line-clamp-1">{event.location || "Virtual"}</span>
                      </div>

                      {/* Participants Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center text-xs text-gray-600">
                            <Users className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                            <span className="font-medium">
                              {currentParticipants}/{maxParticipants}
                            </span>
                          </div>
                          {maxParticipants > 0 && (
                            <span className="text-xs font-semibold text-gray-600">{progress}%</span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {maxParticipants > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500 bg-gray-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Completion Info */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="font-semibold">Completed</span>
                          </div>
                          {event.completionRequestedAt && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(event.completionRequestedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer Note */}
        {events.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              These events have been archived and are no longer accepting new participants
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
