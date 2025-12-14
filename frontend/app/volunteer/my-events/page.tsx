"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNGO } from "@/contexts/ngo-context";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  ArrowLeft,
  Award,
  Tag,
} from "lucide-react";
import { Header } from "@/components/header";

const MyEventsPage: React.FC = () => {
  const router = useRouter();
  const { getUserParticipatedEvents } = useNGO();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        const participatedEvents = await getUserParticipatedEvents();
        setEvents(participatedEvents);
      } catch (err) {
        setError("Failed to fetch your events");
        console.error("Error fetching participated events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const handleEventClick = (eventId: string) => {
    if (eventId) {
      router.push(`/volunteer/${eventId}`);
    }
  };

  const getEventStatusColor = (event: any) => {
    const eventDate = new Date(event.date);
    const now = new Date();

    if (eventDate < now) {
      return "bg-green-100 text-green-700"; // Completed
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return "bg-yellow-100 text-yellow-700"; // Upcoming (within 24h)
    } else {
      return "bg-blue-100 text-blue-700"; // Future
    }
  };

  const getEventStatusText = (event: any) => {
    const eventDate = new Date(event.date);
    const now = new Date();

    if (eventDate < now) {
      return "Completed";
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return "Upcoming";
    } else {
      return "Registered";
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your events...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 text-4xl mb-2">⚠️</div>
                <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.push("/volunteer")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Events
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              My Events
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track all the events you've joined and your volunteer journey.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-gray-400 text-5xl mb-4">📅</div>
                <h2 className="text-gray-600 text-xl font-semibold mb-2">
                  No Events Yet
                </h2>
                <p className="text-gray-500 mb-4">
                  You haven't joined any events yet. Start making a difference today!
                </p>
                <button
                  onClick={() => router.push("/volunteer")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Events
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  onClick={() => handleEventClick(event._id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:scale-[1.02]"
                >
                  {/* Status Badge */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getEventStatusColor(event)}`}
                      >
                        {getEventStatusText(event)}
                      </span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="p-4 space-y-3">
                    {/* Date and Time */}
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-3 text-blue-600" />
                      <span className="text-sm">
                        {event.date ? (
                          <>
                            {new Date(event.date).toLocaleDateString()}
                            <span className="mx-1">•</span>
                            {new Date(event.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        ) : (
                          "Date not specified"
                        )}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-3 text-red-600" />
                      <span className="text-sm">
                        {typeof event.location === 'object' 
                          ? (event.location?.city && event.location?.state 
                            ? `${event.location.city}, ${event.location.state}` 
                            : 'Location not specified')
                          : (event.location || "Location not specified")}
                      </span>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-3 text-green-600" />
                      <span className="text-sm">
                        {Array.isArray(event.participants) ? event.participants.length : 0} /{" "}
                        {event.maxParticipants === Infinity ? "∞" : event.maxParticipants} participants
                      </span>
                    </div>

                    {/* Category and Points */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center text-gray-600">
                        <Tag className="h-4 w-4 mr-2 text-purple-600" />
                        <span className="text-xs">{event.category || "General"}</span>
                      </div>
                      {event.pointsOffered && (
                        <div className="flex items-center text-yellow-600">
                          <Award className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">{event.pointsOffered} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistics */}
          {events.length > 0 && (
            <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{events.length}</div>
                  <div className="text-sm text-gray-600">Events Joined</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {events.filter(e => new Date(e.date) < new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Events Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {events.reduce((total, e) => total + (e.pointsOffered || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Points Available</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyEventsPage;