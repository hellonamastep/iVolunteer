'use client'

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useNGO } from "@/contexts/ngo-context";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  ArrowLeft,
  Award,
  Target,
  Tag,
  Image as ImageIcon,
  Building,
  Globe,
  Phone,
  Mail,
  MapPinIcon,
  Video,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/header";
import { useParticipationRequest } from "@/contexts/participation-request-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const EventDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.eventId as string;
  
  const { events, fetchAvailableEvents, loading: contextLoading, error: contextError } = useNGO();
  const { 
    createParticipationRequest, 
    hasRequestedParticipation, 
    getPendingRequestForEvent,
    getRejectedRequestForEvent,
    hasRejectedRequest,
    cancelRequest 
  } = useParticipationRequest();
  const [event, setEvent] = useState<any>(null);
  const [participating, setParticipating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [participated, setParticipated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  // Fetch single event with NGO details
  const fetchEventDetails = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching event details for:', eventId);
      
      // Try to fetch from the new single event endpoint first
      try {
        const response = await api.get(`/v1/event/${eventId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });

        const responseData = response.data as any;
        if (responseData.success && responseData.event) {
          console.log('Event fetched successfully:', responseData.event);
          console.log('Event image:', responseData.event.image);
          console.log('Event time:', responseData.event.time);
          console.log('NGO Details:', responseData.event.organizationId);
          setEvent(responseData.event);
          return;
        }
      } catch (singleEventError) {
        console.log('Single event endpoint failed, trying all events endpoint');
        
        // Fallback to fetching all events
        const allEventsResponse = await api.get("/v1/event/all-event", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });

        const allEventsData = allEventsResponse.data as any;
        const events = allEventsData.events || [];
        const foundEvent = events.find((e: any) => e._id === eventId);
        
        if (foundEvent) {
          console.log('Event found in all events:', foundEvent);
          console.log('Event image:', foundEvent.image);
          console.log('Event time:', foundEvent.time);
          setEvent(foundEvent);
        } else {
          throw new Error("Event not found");
        }
      }
    } catch (err: any) {
      console.error('Error fetching event:', err);
      const errorMessage = err.response?.data?.message || "Failed to fetch event details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (event && user) {
      // Check if user is already participating
      const currentUserId = user._id || "";
      setParticipated(
        Array.isArray(event.participants) && 
        event.participants.some((participant: any) => 
          participant._id === currentUserId || participant === currentUserId
        )
      );
    }
  }, [event, user]);

  const handleParticipate = async () => {
    if (!event?._id) return;
    
    setParticipating(true);
    try {
      const success = await createParticipationRequest(event._id);
      if (success) {
        // Don't set participated since it's a request, not direct participation
        // Refresh event details to get updated data
        setTimeout(() => fetchEventDetails(), 500);
      }
    } catch (err) {
      console.error("Participation request failed:", err);
    } finally {
      setParticipating(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!event?._id) return;
    
    const pendingRequest = getPendingRequestForEvent(event._id);
    if (!pendingRequest) return;
    
    setLeaving(true);
    try {
      const success = await cancelRequest(pendingRequest._id);
      if (success) {
        // Refresh event details to get updated data
        setTimeout(() => fetchEventDetails(), 500);
      }
    } catch (err) {
      console.error("Cancel request failed:", err);
    } finally {
      setLeaving(false);
    }
  };

  const getProgressPercentage = () => {
    if (!event) return 0;
    const currentParticipants = Array.isArray(event.participants) ? event.participants.length : 0;
    const maxParticipants = event.maxParticipants || Infinity;
    
    if (maxParticipants === Infinity) return 0;
    return Math.min(100, Math.round((currentParticipants / maxParticipants) * 100));
  };

  const isEventFull = () => {
    if (!event) return false;
    const currentParticipants = Array.isArray(event.participants) ? event.participants.length : 0;
    const maxParticipants = event.maxParticipants || Infinity;
    return currentParticipants >= maxParticipants;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading event details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white border border-red-200 rounded-xl shadow-md p-8 max-w-md">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h2 className="text-red-800 text-xl font-bold mb-2">
                {error ? "Error" : "Event Not Found"}
              </h2>
              <p className="text-red-600 mb-4 text-sm">
                {error || "The event you're looking for could not be found."}
              </p>
              <button
                onClick={() => router.back()}
                className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white px-6 py-2 rounded-lg transition-all shadow-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const progress = getProgressPercentage();
  const eventFull = isEventFull();
  const currentParticipants = Array.isArray(event.participants) ? event.participants.length : 0;
  const maxParticipants = event.maxParticipants || Infinity;

  // Check if current user is the event creator
  const isEventCreator = user && event.organizationId && (
    (typeof event.organizationId === 'object' ? event.organizationId._id : event.organizationId) === user._id
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 py-6 relative overflow-hidden">
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(148, 163, 184, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #2dd4bf, #06b6d4);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #14b8a6, #0891b2);
          }
        `}</style>
        
        {/* Mascot Images in Background */}
        <div className="fixed top-32 left-10 opacity-15 z-0 pointer-events-none">
          <img src="/mascots/mascot_volunteer.png" alt="" className="w-24 h-24 animate-bounce" style={{ animationDuration: "3s" }} />
        </div>
        <div className="fixed bottom-20 right-10 opacity-15 z-0 pointer-events-none">
          <img src="/mascots/mascot_help.png" alt="" className="w-28 h-28 animate-pulse" style={{ animationDuration: "4s" }} />
        </div>
        <div className="fixed top-1/2 right-5 opacity-10 z-0 pointer-events-none">
          <img src="/mascots/mascot_star.png" alt="" className="w-20 h-20 animate-bounce" style={{ animationDuration: "5s" }} />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-teal-600 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </button>

          {/* Event Header */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
            {/* Event Image */}
            {event.image?.url ? (
              <div className="h-64 md:h-80 relative">
                <img
                  src={event.image.url}
                  alt={event.image.caption || event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                  <p className="text-white/90">{event.organization || "Organization"}</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-64 md:h-80 flex items-center justify-center">
                <div className="text-center text-white">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                  <p className="text-white/90">{event.organization || "Organization"}</p>
                </div>
              </div>
            )}

            {/* Participation Status */}
            {participated && (
              <div className="bg-green-50 border-b border-green-200 px-6 py-3">
                <div className="flex items-center justify-center text-green-700 text-sm font-medium">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  You're participating in this event
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">About This Event</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-base">
                  {event.description || "No description available for this event."}
                </p>
              </div>

              {/* Event Details Grid */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-xl">ℹ️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
                </div>
                
                {/* Event Type */}
                {event.eventType && (
                  <div className="mb-6 pb-6 border-b-2 border-gray-100">
                    <div className="flex items-start space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        event.eventType === 'virtual' 
                          ? 'bg-gradient-to-br from-blue-400 to-indigo-500' 
                          : event.eventType === 'in-person'
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                          : 'bg-gradient-to-br from-purple-400 to-pink-500'
                      }`}>
                        {event.eventType === 'virtual' ? (
                          <Video className="h-5 w-5 text-white" />
                        ) : event.eventType === 'in-person' ? (
                          <Building className="h-5 w-5 text-white" />
                        ) : (
                          <Globe className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Event Type</p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md backdrop-blur-sm ${
                            event.eventType === 'virtual' 
                              ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' 
                              : event.eventType === 'in-person'
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                              : 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                          }`}>
                            {event.eventType === 'virtual' && <Video className="w-4 h-4 mr-1" />}
                            {event.eventType === 'in-person' && <Building className="w-4 h-4 mr-1" />}
                            {event.eventType === 'community' && <Globe className="w-4 h-4 mr-1" />}
                            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1).replace('-', ' ')} Event
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date & Time */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Date</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">
                          {event.date ? new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : "Date not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 bg-indigo-50 p-4 rounded-xl border-2 border-indigo-200">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Time</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">
                          {event.time ? (() => {
                            // Convert 24-hour format time string (e.g., "14:30") to 12-hour with AM/PM
                            const [hours, minutes] = event.time.split(':').map(Number);
                            const period = hours >= 12 ? 'PM' : 'AM';
                            const displayHours = hours % 12 || 12;
                            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                          })() : (event.date ? new Date(event.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : "Time not specified")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location & Category */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 bg-red-50 p-4 rounded-xl border-2 border-red-200">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center shadow-md">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Location</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">
                          {event.location || "Location not specified"}
                        </p>
                        {event.detailedAddress && (
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {event.detailedAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
                        <Tag className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Category</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">
                          {event.category || "General"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duration & Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t-2 border-gray-100">
                  {event.duration && (
                    <div className="flex items-start space-x-3 bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Duration</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">⏱️ {event.duration} hours</p>
                      </div>
                    </div>
                  )}

                  {event.pointsOffered && (
                    <div className="flex items-start space-x-3 bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Points Offered</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">🏆 {event.pointsOffered} points</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              {event.requirements && Array.isArray(event.requirements) && event.requirements.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-md">
                      <span className="text-white text-xl">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Requirements</h2>
                  </div>
                  <ul className="space-y-3">
                    {event.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3 bg-teal-50 p-3 rounded-xl border-2 border-teal-200">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <Target className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* NGO Information */}
              {event.organizationId && typeof event.organizationId === 'object' && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
                      <span className="text-white text-xl">🏢</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">About the Organization</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organization Basic Info */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Building className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Organization Name</p>
                          <p className="text-sm text-gray-600">
                            {event.organizationId.name || event.organization}
                          </p>
                        </div>
                      </div>

                      {event.organizationId.organizationType && (
                        <div className="flex items-start space-x-3">
                          <Tag className="h-5 w-5 text-purple-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Organization Type</p>
                            <p className="text-sm text-gray-600 capitalize">
                              {event.organizationId.organizationType.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                      )}

                      {event.organizationId.yearEstablished && (
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-green-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Established</p>
                            <p className="text-sm text-gray-600">
                              {event.organizationId.yearEstablished}
                            </p>
                          </div>
                        </div>
                      )}

                      {event.organizationId.organizationSize && (
                        <div className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-orange-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Organization Size</p>
                            <p className="text-sm text-gray-600">
                              {event.organizationId.organizationSize} employees
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      {event.organizationId.email && (
                        <div className="flex items-start space-x-3">
                          <Mail className="h-5 w-5 text-red-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email</p>
                            <a 
                              href={`mailto:${event.organizationId.email}`}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {event.organizationId.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {event.organizationId.contactNumber && (
                        <div className="flex items-start space-x-3">
                          <Phone className="h-5 w-5 text-green-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Phone</p>
                            <a 
                              href={`tel:${event.organizationId.contactNumber}`}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {event.organizationId.contactNumber}
                            </a>
                          </div>
                        </div>
                      )}

                      {event.organizationId.websiteUrl && (
                        <div className="flex items-start space-x-3">
                          <Globe className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Website</p>
                            <a 
                              href={event.organizationId.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        </div>
                      )}

                      {event.organizationId.address && (
                        <div className="flex items-start space-x-3">
                          <MapPinIcon className="h-5 w-5 text-purple-600 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Address</p>
                            <div className="text-sm text-gray-600">
                              {event.organizationId.address.street && (
                                <p>{event.organizationId.address.street}</p>
                              )}
                              <p>
                                {[
                                  event.organizationId.address.city,
                                  event.organizationId.address.state,
                                  event.organizationId.address.zip
                                ].filter(Boolean).join(', ')}
                              </p>
                              {event.organizationId.address.country && (
                                <p>{event.organizationId.address.country}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Organization Description */}
                  {event.organizationId.ngoDescription && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">About Us</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {event.organizationId.ngoDescription}
                      </p>
                    </div>
                  )}

                  {/* Focus Areas */}
                  {event.organizationId.focusAreas && event.organizationId.focusAreas.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Focus Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.organizationId.focusAreas.map((area: string, index: number) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize"
                          >
                            {area.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fallback for basic organization info when NGO details are not populated */}
              {(!event.organizationId || typeof event.organizationId !== 'object') && event.organization && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">About the Organization</h2>
                  
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Organization Name</p>
                      <p className="text-sm text-gray-600">{event.organization}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Detailed organization information is not available for this event. Only the organization name is provided.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participation Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Join This Event</h3>
                
                {/* Participants Progress */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm">
                        {currentParticipants} / {maxParticipants === Infinity ? "∞" : maxParticipants} participants
                      </span>
                    </div>
                    {maxParticipants !== Infinity && (
                      <span className="text-xs font-medium text-gray-500">{progress}%</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {maxParticipants !== Infinity && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          eventFull ? "bg-red-500" : progress > 75 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {isEventCreator ? (
                  <div className="space-y-3">
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-600 py-3 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      You Created This Event
                    </button>
                    <p className="text-xs text-center text-gray-500">
                      Event creators cannot participate in their own events
                    </p>
                  </div>
                ) : (() => {
                  const hasRequested = hasRequestedParticipation(event?._id || "");
                  const pendingRequest = getPendingRequestForEvent(event?._id || "");
                  const rejectedRequest = getRejectedRequestForEvent(event?._id || "");
                  const isRejected = hasRejectedRequest(event?._id || "");
                  
                  if (participated) {
                    return (
                      <div className="space-y-3">
                        <button
                          disabled
                          className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Already Participating
                        </button>
                      </div>
                    );
                  }
                  
                  if (isRejected && rejectedRequest) {
                    return (
                      <div className="space-y-3">
                        <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                          <DialogTrigger asChild>
                            <button
                              className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium text-sm hover:bg-red-200 transition-colors duration-200 flex items-center justify-center"
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Participation Rejected
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Participation Request Rejected</DialogTitle>
                              <DialogDescription>
                                Your participation request for this event was rejected.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Rejection Reason:</h4>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-gray-700 text-sm">
                                    {rejectedRequest.rejectionReason || "No specific reason provided."}
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <DialogClose asChild>
                                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                                    Close
                                  </button>
                                </DialogClose>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <button
                          disabled
                          className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Not Eligible for This Event
                        </button>
                      </div>
                    );
                  }
                  
                  if (hasRequested && pendingRequest) {
                    return (
                      <div className="space-y-3">
                        <button
                          disabled
                          className="w-full bg-yellow-100 text-yellow-700 py-3 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Requested Participation
                        </button>
                        <button
                          onClick={handleCancelRequest}
                          disabled={leaving}
                          className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium text-sm disabled:bg-red-200 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {leaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Request
                            </>
                          )}
                        </button>
                      </div>
                    );
                  }
                  
                  if (eventFull) {
                    return (
                      <button
                        disabled
                        className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium text-sm cursor-not-allowed"
                      >
                        Event Full
                      </button>
                    );
                  }
                  
                  return (
                    <button
                      onClick={handleParticipate}
                      disabled={participating}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {participating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Requesting...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Request Participation
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>

              {/* Event Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.eventStatus === 'active' ? 'bg-green-100 text-green-700' :
                      event.eventStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.eventStatus || 'Active'}
                    </span>
                  </div>
                  
                  {event.sponsorshipRequired && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sponsorship</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${event.sponsorshipAmount || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetailsPage;