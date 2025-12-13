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
  Award,
  Target,
  Tag,
  Building,
  Globe,
  Phone,
  Mail,
  MapPinIcon,
  Video,
  AlertCircle,
  Heart,
  Check,
  Loader2,
} from "lucide-react";
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
import { DetailPageLayout } from "@/components/DetailPageLayout";
import { DetailSection, DetailInfoRow, DetailColumnHeader, DetailDescription } from "@/components/DetailSection";
import EventParticipantsManager from "@/components/event-participants-manager";

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
  const [interestState, setInterestState] = useState<'none' | 'loading' | 'sent'>('none');

  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  // Check if this is a corporate event
  const isCorporateEvent = event?.eventType && ['corporate-partnership', 'corporate-csr', 'employee-engagement', 'community-outreach'].includes(event.eventType);

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

  // Check if user has already expressed interest in corporate events
  const checkCorporateInterest = async () => {
    if (!eventId) return;
    try {
      const res = await api.get(`/v1/corporate-interest/check/${eventId}`);
      const data = res.data as { hasInterest?: boolean };
      if (data.hasInterest) {
        setInterestState('sent');
      }
    } catch {
      // Ignore errors - user might not be logged in or not a corporate user
    }
  };

  // Handle expressing interest for corporate events
  const handleExpressInterest = async () => {
    if (interestState === 'sent') {
      toast.info("You have already expressed interest in this event");
      return;
    }
    
    setInterestState('loading');
    
    try {
      await api.post(`/v1/corporate-interest/express-interest/${eventId}`);
      setInterestState('sent');
      toast.success("Interest sent successfully! The NGO will be notified.");
    } catch (err: any) {
      setInterestState('none');
      toast.error(err.response?.data?.message || "Failed to express interest");
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  // Check corporate interest status when event is loaded
  useEffect(() => {
    if (event && ['corporate-partnership', 'corporate-csr', 'employee-engagement', 'community-outreach'].includes(event.eventType)) {
      checkCorporateInterest();
    }
  }, [event]);

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
        {/* <Header /> */}
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
        {/* <Header /> */}
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

  // Status badge component
  const statusBadge = isEventCreator ? (
    <div className="inline-flex items-center bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm md:text-base font-semibold shadow-md">
      <Building className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-1.5 md:mr-2 flex-shrink-0" />
      <span className="truncate">Event Creator</span>
    </div>
  ) : participated ? (
    <div className="inline-flex items-center bg-green-500 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm md:text-base font-semibold">
      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-1.5 md:mr-2 flex-shrink-0" />
      <span className="truncate">You're participating in this event</span>
    </div>
  ) : null;

  // Left column content
  const leftColumnContent = (
    <>
      <DetailColumnHeader 
        title="Event Details"
        subtitle="Learn more about this volunteer opportunity"
      />
      
      {/* Description */}
      <DetailSection title="About This Event" icon="📋">
        <DetailDescription 
          text={event.description || "No description available for this event."}
        />
      </DetailSection>

      {/* Event Information */}
      <DetailSection title="Event Information" icon="ℹ️">
        <div className="space-y-2">
          {/* Event Type */}
          {event.eventType && (
            <DetailInfoRow
              icon={event.eventType === 'virtual' ? (
                <Video className="h-3 w-3" />
              ) : event.eventType === 'in-person' ? (
                <Building className="h-3 w-3" />
              ) : (
                <Globe className="h-3 w-3" />
              )}
              label="Event Type"
              value={<span className="capitalize">{event.eventType.replace('-', ' ')}</span>}
            />
          )}
          
          {/* Date */}
          <DetailInfoRow
            icon={<Calendar className="h-3 w-3" />}
            label="Date"
            value={event.date ? new Date(event.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : "Not specified"}
          />
          
          {/* Time */}
          <DetailInfoRow
            icon={<Clock className="h-3 w-3" />}
            label="Time"
            value={event.time ? (() => {
              const [hours, minutes] = event.time.split(':').map(Number);
              const period = hours >= 12 ? 'PM' : 'AM';
              const displayHours = hours % 12 || 12;
              return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
            })() : "Not specified"}
          />
          
          {/* Location */}
          <DetailInfoRow
            icon={<MapPin className="h-3 w-3" />}
            label="Location"
            value={event.location || "Not specified"}
          />
          
          {/* Category */}
          <DetailInfoRow
            icon={<Tag className="h-3 w-3" />}
            label="Category"
            value={<span className="capitalize">{event.category || "General"}</span>}
          />
          
          {/* Duration */}
          {event.duration && (
            <DetailInfoRow
              icon={<Clock className="h-3 w-3" />}
              label="Duration"
              value={`${event.duration} hours`}
            />
          )}
          
          {/* Points Offered */}
          {event.pointsOffered && (
            <DetailInfoRow
              icon={<Award className="h-3 w-3" />}
              label="Points Offered"
              value={`${event.pointsOffered} points`}
              isLast
            />
          )}
        </div>
      </DetailSection>
      
      {/* Detailed Address */}
      {event.detailedAddress && (
        <DetailSection title="Detailed Address" icon={<MapPinIcon className="h-4 w-4 text-white" />}>
          <DetailDescription text={event.detailedAddress} />
        </DetailSection>
      )}

      {/* Requirements */}
      {event.requirements && Array.isArray(event.requirements) && event.requirements.length > 0 && (
        <DetailSection title="Requirements" icon="✓">
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
        </DetailSection>
      )}
    </>
  );

  // Right column content
  const rightColumnContent = (
    <>
      <DetailColumnHeader 
        title="Join This Event"
        subtitle="Become a volunteer and make a difference"
      />

      {/* NGO Information */}
      {event.organizationId && typeof event.organizationId === 'object' && (
        <DetailSection title="About the Organization" icon="🏢">
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
        </DetailSection>
      )}

      {/* Fallback for basic organization info */}
      {(!event.organizationId || typeof event.organizationId !== 'object') && event.organization && (
        <DetailSection title="About the Organization" icon="🏢">
          <div className="flex items-start space-x-2">
            <Building className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-900">Organization Name</p>
              <p className="text-xs text-gray-600">{event.organization}</p>
            </div>
          </div>
        </DetailSection>
      )}

      {/* Participation Progress */}
      <DetailSection title="Participation" icon="👥">
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
      </DetailSection>

      {/* Participation Actions */}
      <div className="border-2 border-[#D4E7B8] rounded-lg p-5 space-y-3">
        {isEventCreator ? (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-white">
                <Building className="h-5 w-5" />
                <span className="font-bold text-base">You Created This Event</span>
              </div>
            </div>
            <div className="bg-[#E8F5A5]/30 border border-[#D4E7B8] rounded-lg p-3">
              <p className="text-xs text-center text-gray-700 font-medium">
                ℹ️ As the event creator, you can manage participants below
              </p>
            </div>
          </div>
        ) : isCorporateEvent ? (
          // Corporate event - show Interested button
          <button
            onClick={handleExpressInterest}
            disabled={interestState === 'loading' || interestState === 'sent'}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center transition-all duration-200 shadow-md ${
              interestState === 'sent'
                ? 'bg-green-100 text-green-700 cursor-default'
                : interestState === 'loading'
                ? 'bg-gray-100 text-gray-500 cursor-wait'
                : 'bg-gradient-to-r from-[#f5f8c3] to-[#e8eb8a] text-[#173043] hover:from-[#e8eb8a] hover:to-[#dbe07a] hover:shadow-lg'
            }`}
          >
            {interestState === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Interest...
              </>
            ) : interestState === 'sent' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Interest Sent Successfully
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Express Interest
              </>
            )}
          </button>
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
      <DetailSection title="Event Status" icon="ℹ️">
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
      </DetailSection>
    </>
  );

  return (
    <>
      <DetailPageLayout
        loading={loading}
        loadingMessage="Loading event details..."
        loadingSubtext="Please wait while we fetch the details! 🎉"
        error={error}
        errorTitle={error ? "Error" : "Event Not Found"}
        backButtonText="Back to Events"
        pageTitle="Volunteer Event"
        pageSubtitle="Join us and make a difference"
        coverImage={event.image?.url}
        coverImageAlt={event.image?.caption || event.title}
        title={event.title}
        organizationName={event.organizationId?.name || event.organization || "Organization"}
        statusBadge={statusBadge}
        leftColumn={leftColumnContent}
        rightColumn={rightColumnContent}
      />
      
      {/* Event Participants Manager - Only visible to creator */}
      {!loading && !error && event && isEventCreator && (
        <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-white to-[#7DD9A6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EventParticipantsManager 
              eventId={eventId} 
              isCreator={isEventCreator}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EventDetailsPage;