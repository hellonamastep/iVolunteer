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
        <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-white to-[#7DD9A6] flex items-center justify-center">
          <div className="text-center">
            <img
              src="/mascots/video_mascots/mascot_walking_video.gif"
              alt="Loading..."
              width={200}
              height={200}
              className="mx-auto mb-6"
            />
            <p className="text-gray-600 text-lg font-semibold">Loading event details...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the details! 🎉</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-white to-[#7DD9A6] flex items-center justify-center">
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
                className="bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] hover:from-[#6BC794] hover:to-[#5AB583] text-white px-6 py-2 rounded-lg transition-all shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-[#FFFFFF] to-[#7DD9A6]">
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(148, 163, 184, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #7DD9A6, #6BC794);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #6BC794, #5AB583);
          }
        `}</style>
        
        {/* Header with Back Button */}
        <div className="bg-transparent py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-white/50 transition-all text-sm flex items-center space-x-2 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Events</span>
                </button>
              </div>
              <div className="text-center flex-1">
                <h1 className="text-xl font-semibold text-gray-700">Volunteer Event</h1>
                <p className="text-sm text-gray-600 mt-1">Join us and make a difference</p>
              </div>
              <div className="flex-1"></div>
            </div>
          </div>
        </div>

        {/* Cover Image - Full Width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          {event.image?.url ? (
            <div className="h-64 md:h-96 relative rounded-xl overflow-hidden shadow-lg">
              <img 
                src={event.image.url} 
                alt={event.image.caption || event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 md:p-8 text-white w-full">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{event.title}</h1>
                  <p className="text-white/90 flex items-center text-base md:text-lg">
                    <Building className="h-5 w-5 mr-2" />
                    {event.organizationId?.name || event.organization || "Organization"}
                  </p>
                  {/* Participation Status */}
                  {participated && (
                    <div className="mt-4 inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      You're participating in this event
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#E8F5A5] to-[#7DD9A6] h-64 md:h-96 flex items-center justify-center rounded-xl shadow-lg">
              <div className="text-center text-gray-800">
                <ImageIcon className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 opacity-80" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{event.title}</h1>
                <p className="text-gray-700 text-base md:text-lg">{event.organizationId?.name || event.organization || "Organization"}</p>
                {/* Participation Status */}
                {participated && (
                  <div className="mt-4 inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    You're participating in this event
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Event Details */}
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Event Details</h2>
                <p className="text-sm text-gray-600 mt-1">Learn more about this volunteer opportunity</p>
              </div>
              
              {/* Description */}
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                    <span className="text-white text-lg">📋</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">About This Event</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {event.description || "No description available for this event."}
                </p>
              </div>

              {/* Event Information */}
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                    <span className="text-white text-lg">ℹ️</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">Event Information</h3>
                </div>
                
                <div className="space-y-2">
                  {/* Event Type */}
                  {event.eventType && (
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-xs text-gray-600 flex items-center">
                        {event.eventType === 'virtual' ? (
                          <Video className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                        ) : event.eventType === 'in-person' ? (
                          <Building className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                        ) : (
                          <Globe className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                        )}
                        Event Type
                      </span>
                      <span className="text-xs font-medium text-gray-900 capitalize">
                        {event.eventType.replace('-', ' ')}
                      </span>
                    </div>
                  )}
                  
                  {/* Date */}
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-600 flex items-center">
                      <Calendar className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                      Date
                    </span>
                    <span className="text-xs font-medium text-gray-900">
                      {event.date ? new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : "Not specified"}
                    </span>
                  </div>
                  
                  {/* Time */}
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                      Time
                    </span>
                    <span className="text-xs font-medium text-gray-900">
                      {event.time ? (() => {
                        const [hours, minutes] = event.time.split(':').map(Number);
                        const period = hours >= 12 ? 'PM' : 'AM';
                        const displayHours = hours % 12 || 12;
                        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                      })() : "Not specified"}
                    </span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                      Location
                    </span>
                    <span className="text-xs font-medium text-gray-900">
                      {event.location || "Not specified"}
                    </span>
                  </div>
                  
                  {/* Category */}
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-600 flex items-center">
                      <Tag className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                      Category
                    </span>
                    <span className="text-xs font-medium text-gray-900 capitalize">
                      {event.category || "General"}
                    </span>
                  </div>
                  
                  {/* Duration */}
                  {event.duration && (
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-xs text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                        Duration
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        {event.duration} hours
                      </span>
                    </div>
                  )}
                  
                  {/* Points Offered */}
                  {event.pointsOffered && (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-gray-600 flex items-center">
                        <Award className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                        Points Offered
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        {event.pointsOffered} points
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Detailed Address */}
              {event.detailedAddress && (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                      <MapPinIcon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Detailed Address</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {event.detailedAddress}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {event.requirements && Array.isArray(event.requirements) && event.requirements.length > 0 && (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Requirements</h3>
                  </div>
                  <ul className="space-y-2">
                    {event.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-700 text-sm">
                        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Target className="h-3 w-3 text-white" />
                        </div>
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Right Column - Organization & Participation */}
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Join This Event</h2>
                <p className="text-sm text-gray-600 mt-1">Become a volunteer and make a difference</p>
              </div>

              {/* NGO Information */}
              {event.organizationId && typeof event.organizationId === 'object' && (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                      <span className="text-white text-lg">🏢</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">About the Organization</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Building className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-900">Organization Name</p>
                        <p className="text-xs text-gray-600">
                          {event.organizationId.name || event.organization}
                        </p>
                      </div>
                    </div>

                    {event.organizationId.organizationType && (
                      <div className="flex items-start space-x-2">
                        <Tag className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">Organization Type</p>
                          <p className="text-xs text-gray-600 capitalize">
                            {event.organizationId.organizationType.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.organizationId.yearEstablished && (
                      <div className="flex items-start space-x-2">
                        <Calendar className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">Established</p>
                          <p className="text-xs text-gray-600">
                            {event.organizationId.yearEstablished}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.organizationId.email && (
                      <div className="flex items-start space-x-2">
                        <Mail className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">Email</p>
                          <a 
                            href={`mailto:${event.organizationId.email}`}
                            className="text-xs text-[#7DD9A6] hover:text-[#6BC794] hover:underline break-all"
                          >
                            {event.organizationId.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {event.organizationId.contactNumber && (
                      <div className="flex items-start space-x-2">
                        <Phone className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">Phone</p>
                          <a 
                            href={`tel:${event.organizationId.contactNumber}`}
                            className="text-xs text-[#7DD9A6] hover:text-[#6BC794] hover:underline"
                          >
                            {event.organizationId.contactNumber}
                          </a>
                        </div>
                      </div>
                    )}

                    {event.organizationId.websiteUrl && (
                      <div className="flex items-start space-x-2">
                        <Globe className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">Website</p>
                          <a 
                            href={event.organizationId.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#7DD9A6] hover:text-[#6BC794] hover:underline break-all"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}

                    {event.organizationId.focusAreas && event.organizationId.focusAreas.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-900 mb-2">Focus Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {event.organizationId.focusAreas.slice(0, 3).map((area: string, index: number) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E8F5A5]/50 text-gray-700 capitalize"
                            >
                              {area.replace('-', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fallback for basic organization info */}
              {(!event.organizationId || typeof event.organizationId !== 'object') && event.organization && (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                      <span className="text-white text-lg">🏢</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">About the Organization</h3>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Building className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Organization Name</p>
                      <p className="text-xs text-gray-600">{event.organization}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Participation Progress */}
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">Participation</h3>
                </div>
                
                {/* Participants Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 text-[#7DD9A6] mr-1" />
                      <span className="text-xs font-semibold">
                        {currentParticipants} / {maxParticipants === Infinity ? "∞" : maxParticipants} participants
                      </span>
                    </div>
                    {maxParticipants !== Infinity && (
                      <span className="text-xs font-bold text-[#6BC794]">{progress}%</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {maxParticipants !== Infinity && (
                    <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          eventFull ? "bg-gradient-to-r from-red-400 to-red-500" : 
                          progress > 75 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : 
                          "bg-gradient-to-r from-[#7DD9A6] to-[#6BC794]"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* Spots Remaining */}
                  {maxParticipants !== Infinity && !eventFull && (
                    <div className="text-center bg-[#E8F5A5]/30 px-3 py-2 rounded-lg border border-[#D4E7B8]">
                      <p className="text-xs text-gray-700 font-semibold">
                        🎯 <span className="text-[#6BC794]">{maxParticipants - currentParticipants}</span> spots remaining
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Participation Actions */}
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5 space-y-3">
                {isEventCreator ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-600 py-2.5 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      You Created This Event
                    </button>
                    <p className="text-xs text-center text-gray-500">
                      Event creators cannot participate
                    </p>
                  </div>
                ) : (() => {
                  const hasRequested = hasRequestedParticipation(event?._id || "");
                  const pendingRequest = getPendingRequestForEvent(event?._id || "");
                  const rejectedRequest = getRejectedRequestForEvent(event?._id || "");
                  const isRejected = hasRejectedRequest(event?._id || "");
                  
                  if (participated) {
                    return (
                      <button
                        disabled
                        className="w-full bg-green-100 text-green-700 py-2.5 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Already Participating
                      </button>
                    );
                  }
                  
                  if (isRejected && rejectedRequest) {
                    return (
                      <div className="space-y-2">
                        <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                          <DialogTrigger asChild>
                            <button
                              className="w-full bg-red-100 text-red-700 py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-red-200 transition-colors duration-200 flex items-center justify-center"
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
                          Not Eligible
                        </button>
                      </div>
                    );
                  }
                  
                  if (hasRequested && pendingRequest) {
                    return (
                      <div className="space-y-2">
                        <button
                          disabled
                          className="w-full bg-yellow-100 text-yellow-700 py-2.5 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Request Pending
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
                        className="w-full bg-red-100 text-red-700 py-2.5 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                      >
                        Event Full
                      </button>
                    );
                  }
                  
                  return (
                    <button
                      onClick={handleParticipate}
                      disabled={participating}
                      className="w-full bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] text-white py-2.5 px-4 rounded-lg hover:from-[#6BC794] hover:to-[#5AB583] transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
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
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                    <span className="text-white text-sm">ℹ️</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Event Status</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      event.eventStatus === 'active' ? 'bg-[#E8F5A5] text-gray-700' :
                      event.eventStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.eventStatus || 'Active'}
                    </span>
                  </div>
                  
                  {event.sponsorshipRequired && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Sponsorship</span>
                      <span className="text-xs font-medium text-gray-900">
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