"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useNGO } from "@/contexts/ngo-context";
import { useParticipationRequest } from "@/contexts/participation-request-context";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  UserPlus,
  Video,
  Building,
  Globe,
  RefreshCcw,
  XCircle,
  Share2,
} from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ParticipationRequestBanner } from "@/components/ParticipationRequestBanner";
import { toast } from "@/hooks/use-toast";

const AvailableEventsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { events, fetchAvailableEvents, loading, error } = useNGO();
  const { 
    createParticipationRequest, 
    hasRequestedParticipation, 
    getPendingRequestForEvent,
    hasRejectedRequest,
    userRequests 
  } = useParticipationRequest();
  const [participating, setParticipating] = useState<{
    [key: string]: boolean;
  }>({});
  const [participated, setParticipated] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [activeTab, setActiveTab] = useState<'virtual' | 'in-person' | 'community'>('virtual');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  
  // Refs for scrolling to specific events
  const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchAvailableEvents(showAllEvents);
  }, [showAllEvents]);

  // Handle eventId from URL parameter
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    
    if (eventId && events.length > 0) {
      // Set highlighted event
      setHighlightedEventId(eventId);
      
      // Find the event to determine which tab it belongs to
      const targetEvent = events.find(e => e._id === eventId);
      if (targetEvent) {
        const eventType = (targetEvent.eventType?.toLowerCase() || 'community') as 'virtual' | 'in-person' | 'community';
        if (activeTab !== eventType) {
          setActiveTab(eventType);
        }
      }
      
      // Wait for the event to render and then scroll to it
      setTimeout(() => {
        const eventElement = eventRefs.current.get(eventId);
        if (eventElement) {
          eventElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedEventId(null);
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams, events.length]);

  // Filter events based on active tab
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventType = event.eventType?.toLowerCase() || 'community';
      return eventType === activeTab;
    });
  }, [events, activeTab]);

  // Count events by type
  const eventCounts = useMemo(() => {
    return {
      virtual: events.filter(e => (e.eventType?.toLowerCase() || 'community') === 'virtual').length,
      'in-person': events.filter(e => (e.eventType?.toLowerCase() || 'community') === 'in-person').length,
      community: events.filter(e => (e.eventType?.toLowerCase() || 'community') === 'community').length,
    };
  }, [events]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAvailableEvents(showAllEvents);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleShowAll = () => {
    setShowAllEvents(!showAllEvents);
  };

  const handleParticipate = async (eventId: string) => {
    setParticipating((prev) => ({ ...prev, [eventId]: true }));

    try {
      const success = await createParticipationRequest(eventId);
      if (success) {
        // Remove from participating state but don't add to participated
        // since it's now a request, not direct participation
      }
    } catch (err) {
      console.error("Participation request failed:", err);
    } finally {
      setParticipating((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleCardClick = (eventId: string) => {
    if (eventId) {
      router.push(`/volunteer/${eventId}`);
    }
  };

  const handleShare = async (event: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    const eventUrl = `${window.location.origin}/volunteer?eventId=${event._id}`;
    console.log('Sharing event URL:', eventUrl);
    
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: event.title,
          text: event.description || 'Check out this volunteer event',
          url: eventUrl,
        });
        console.log('Event shared successfully via native share');
        
        toast({
          title: 'Success',
          description: 'Event shared successfully',
        });
      } else {
        // Fallback to copying link to clipboard
        if (!navigator.clipboard) {
          throw new Error('Clipboard API not available');
        }
        
        await navigator.clipboard.writeText(eventUrl);
        console.log('Event URL copied to clipboard');
        
        toast({
          title: 'Link copied!',
          description: 'Event link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      
      // Only show error if it's not a user cancellation
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: 'Failed to share',
          description: error instanceof Error ? error.message : 'Please try again',
          variant: 'destructive'
        });
      }
    }
  };

  const getProgressPercentage = (event: any) => {
    const currentParticipants = Array.isArray(event.participants)
      ? event.participants.length
      : 0;
    const maxParticipants = event.maxParticipants || Infinity;

    if (maxParticipants === Infinity) return 0;
    return Math.min(
      100,
      Math.round((currentParticipants / maxParticipants) * 100)
    );
  };

  const isEventFull = (event: any) => {
    const currentParticipants = Array.isArray(event.participants)
      ? event.participants.length
      : 0;
    const maxParticipants = event.maxParticipants || Infinity;
    return currentParticipants >= maxParticipants;
  };

  const isUserParticipating = (event: any) => {
    // Check if current user ID is in the event participants array
    const currentUserId = user?._id || "";
    return (
      participated[event._id] ||
      (Array.isArray(event.participants) && 
       event.participants.some((participant: any) => 
         participant._id === currentUserId || participant === currentUserId
       ))
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading events...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <div className="text-red-600 text-4xl mb-2">⚠️</div>
              <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchAvailableEvents(showAllEvents)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!events || events.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 max-w-md shadow-lg">
              <div className="text-gray-400 text-5xl mb-4">📅</div>
              <h2 className="text-gray-600 text-xl font-semibold mb-2">
                No Events Available
              </h2>
              <p className="text-gray-500">
                There are currently no events available. Please check back later.
              </p>
              <Button
                onClick={handleRefresh}
                className="mt-4 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                Available Events
              </h1>
              <button
                onClick={() => router.push("/volunteer/my-events")}
                className="ml-6 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
              >
                My Events
              </button>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover meaningful opportunities to support our community through
              various events and activities.
            </p>
          </div>

          {/* Participation Request Banner */}
          <ParticipationRequestBanner />

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-primary/10">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('virtual')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'virtual'
                      ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Video className="w-4 h-4 inline mr-2" />
                  Virtual
                </button>
                <button
                  onClick={() => setActiveTab('in-person')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'in-person'
                      ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Building className="w-4 h-4 inline mr-2" />
                  In-Person
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'community'
                      ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  Community
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <section className="mb-12 flex gap-4 justify-center flex-wrap">
            <div className="flex-1 max-w-xs flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:scale-105 transition-transform duration-300">
              <Video className="w-6 h-6 mb-2" />
              <span className="text-xl font-bold">{eventCounts.virtual}</span>
              <span className="text-sm uppercase">Virtual Events</span>
            </div>
            <div className="flex-1 max-w-xs flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:scale-105 transition-transform duration-300">
              <Building className="w-6 h-6 mb-2" />
              <span className="text-xl font-bold">{eventCounts['in-person']}</span>
              <span className="text-sm uppercase">In-Person Events</span>
            </div>
            <div className="flex-1 max-w-xs flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg hover:scale-105 transition-transform duration-300">
              <Globe className="w-6 h-6 mb-2" />
              <span className="text-xl font-bold">{eventCounts.community}</span>
              <span className="text-sm uppercase">Community Events</span>
            </div>
          </section>

          {/* Refresh Button */}
          <div className="flex justify-center gap-3 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Events
            </Button>
            
            {/* Show All Toggle - Only for non-admin users */}
            {user && user.role !== 'admin' && (
              <Button
                variant={showAllEvents ? "default" : "outline"}
                size="sm"
                onClick={toggleShowAll}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  showAllEvents 
                    ? 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary/90 hover:to-emerald-600/90' 
                    : 'bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-primary/5'
                }`}
              >
                <Globe className="w-4 h-4" />
                {showAllEvents ? 'Showing All Events' : 'Show All Events'}
              </Button>
            )}
          </div>

          {/* Empty State for Current Tab */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                <div className="text-gray-400 text-5xl mb-4">
                  {activeTab === 'virtual' ? '💻' : activeTab === 'in-person' ? '🏢' : '🌍'}
                </div>
                <h2 className="text-gray-600 text-xl font-semibold mb-2">
                  No {activeTab === 'virtual' ? 'Virtual' : activeTab === 'in-person' ? 'In-Person' : 'Community'} Events
                </h2>
                <p className="text-gray-500">
                  There are currently no {activeTab} events available. Check other tabs or come back later.
                </p>
              </div>
            </div>
          )}

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const progress = getProgressPercentage(event);
              const eventFull = isEventFull(event);
              const userParticipating = isUserParticipating(event);
              const currentParticipants = Array.isArray(event.participants)
                ? event.participants.length
                : 0;
              const maxParticipants = event.maxParticipants || Infinity;

              return (
                <div
                  key={event._id}
                  ref={(el) => {
                    if (el && event._id) {
                      eventRefs.current.set(event._id, el);
                    } else if (event._id) {
                      eventRefs.current.delete(event._id);
                    }
                  }}
                  onClick={() => event._id && handleCardClick(event._id)}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border overflow-hidden cursor-pointer transform hover:scale-[1.02] ${
                    eventFull ? "border-red-200" : "border-gray-100"
                  } ${userParticipating ? "ring-2 ring-green-200" : ""} ${
                    highlightedEventId === event._id 
                      ? 'ring-4 ring-blue-500 ring-offset-2 shadow-2xl' 
                      : ''
                  }`}
                >
                  {/* Event Image */}
                  {event.image?.url && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={event.image.url}
                        alt={event.image.caption || event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      {/* Event Type Badge on Image */}
                      {event.eventType && (
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                            event.eventType === 'virtual' 
                              ? 'bg-blue-500 text-white' 
                              : event.eventType === 'in-person'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-purple-500 text-white'
                          }`}>
                            {event.eventType === 'virtual' && '💻'}
                            {event.eventType === 'in-person' && '🏢'}
                            {event.eventType === 'community' && '🌍'}
                            {' '}
                            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Participation Badge */}
                  {userParticipating && (
                    <div className="bg-green-50 border-b border-green-200 px-4 py-2">
                      <div className="flex items-center justify-center text-green-700 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        You're participating in this event
                      </div>
                    </div>
                  )}

                  {/* Event Header */}
                  <div className="p-6 border-b border-gray-100 relative">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 pr-16">
                      {event.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {event.description}
                    </p>
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        onClick={(e) => handleShare(event, e)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Share event"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6 space-y-4">
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
                        {event.location || "Location not specified"}
                      </span>
                    </div>

                    {/* Participants Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-3 text-green-600" />
                          <span className="text-sm">
                            {currentParticipants} /{" "}
                            {maxParticipants === Infinity
                              ? "∞"
                              : maxParticipants}{" "}
                            participants
                          </span>
                        </div>
                        {maxParticipants !== Infinity && (
                          <span className="text-xs font-medium text-gray-500">
                            {progress}%
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {maxParticipants !== Infinity && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              eventFull
                                ? "bg-red-500"
                                : progress > 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Sponsorship */}
                    {/* {event.sponsorshipRequired && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-3 text-yellow-600" />
                        <span className="text-sm">
                          Sponsorship: ${event.sponsorshipAmount}
                        </span>
                      </div>
                    )} */}
                  </div>

                  {/* Action Button */}
                  <div className="px-6 pb-6">
                    {(() => {
                      const hasRequested = hasRequestedParticipation(event._id || "");
                      const pendingRequest = getPendingRequestForEvent(event._id || "");
                      const isRejected = hasRejectedRequest(event._id || "");
                      
                      // Check if current user is the event creator
                      const isEventCreator = user && event.organizationId && (
                        (typeof event.organizationId === 'object' ? event.organizationId._id : event.organizationId) === user._id
                      );
                      
                      if (isEventCreator) {
                        return (
                          <button
                            disabled
                            className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                          >
                            <Building className="h-4 w-4 mr-2" />
                            You Created This Event
                          </button>
                        );
                      }
                      
                      if (userParticipating) {
                        return (
                          <button
                            disabled
                            className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Already Participating
                          </button>
                        );
                      }
                      
                      if (isRejected) {
                        return (
                          <button
                            disabled
                            className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Not Eligible for This Event
                          </button>
                        );
                      }
                      
                      if (hasRequested && pendingRequest) {
                        return (
                          <button
                            disabled
                            className="w-full bg-yellow-100 text-yellow-700 py-2 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Requested Participation
                          </button>
                        );
                      }
                      
                      if (eventFull) {
                        return (
                          <button
                            disabled
                            className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg font-medium text-sm cursor-not-allowed"
                          >
                            Event Full
                          </button>
                        );
                      }
                      
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            event._id && handleParticipate(event._id);
                          }}
                          disabled={!event._id || participating[event._id]}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {event._id && participating[event._id] ? (
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
                </div>
              );
            })}
          </div>

          {/* Footer Stats */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-sm p-6 inline-block">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>
                    Available: {events.filter((e) => !isEventFull(e)).length}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>
                    Full: {events.filter((e) => isEventFull(e)).length}
                  </span>
                </div>
                <div>
                  <span>Total: {events.length} events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvailableEventsPage;
