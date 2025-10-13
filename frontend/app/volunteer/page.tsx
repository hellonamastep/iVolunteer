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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8F5F5' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8F5F5' }}>
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md shadow-lg">
              <div className="text-red-600 text-4xl mb-2">⚠️</div>
              <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchAvailableEvents(showAllEvents)}
                className="mt-4 bg-gradient-to-r from-teal-400 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-teal-500 hover:to-cyan-600 transition-colors shadow-md hover:shadow-lg"
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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8F5F5' }}>
          <div className="text-center">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md shadow-lg">
              <div className="text-gray-400 text-5xl mb-4">📅</div>
              <h2 className="text-gray-600 text-xl font-semibold mb-2">
                No Events Available
              </h2>
              <p className="text-gray-500">
                There are currently no events available. Please check back later.
              </p>
              <Button
                onClick={handleRefresh}
                className="mt-4 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 shadow-md hover:shadow-lg"
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
      <div className="min-h-screen py-6 relative overflow-hidden" style={{ backgroundColor: '#E8F5F5' }}>
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
        
        {/* Mascot Images in Background - Dynamic based on active tab */}
        <div className="fixed top-32 left-10 opacity-20 z-0 pointer-events-none transition-all duration-500">
          <img 
            src={activeTab === 'virtual' ? "/mascots/mascot_camera.png" : 
                 activeTab === 'in-person' ? "/mascots/mascot_volunteer.png" : 
                 "/mascots/mascot_group.png"} 
            alt="" 
            className="w-28 h-28 animate-bounce" 
            style={{ animationDuration: "3s" }} 
          />
        </div>
        <div className="fixed bottom-20 right-10 opacity-20 z-0 pointer-events-none transition-all duration-500">
          <img 
            src={activeTab === 'virtual' ? "/mascots/mascot_reading.png" : 
                 activeTab === 'in-person' ? "/mascots/mascot_help.png" : 
                 "/mascots/mascot_party.png"} 
            alt="" 
            className="w-36 h-36 animate-pulse" 
            style={{ animationDuration: "4s" }} 
          />
        </div>
        <div className="fixed top-1/2 right-5 opacity-15 z-0 pointer-events-none transition-all duration-500">
          <img 
            src={activeTab === 'virtual' ? "/mascots/mascot_search.png" : 
                 activeTab === 'in-person' ? "/mascots/mascot_donate.png" : 
                 "/mascots/mascot_chear.png"} 
            alt="" 
            className="w-24 h-24 animate-bounce" 
            style={{ animationDuration: "5s" }} 
          />
        </div>
        <div className="fixed top-2/3 left-5 opacity-15 z-0 pointer-events-none transition-all duration-500">
          <img 
            src={activeTab === 'virtual' ? "/mascots/mascot_sketching.png" : 
                 activeTab === 'in-person' ? "/mascots/mascot_trashpick.png" : 
                 "/mascots/mascot_sing.png"} 
            alt="" 
            className="w-28 h-28 animate-pulse" 
            style={{ animationDuration: "6s" }} 
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    Volunteer Events
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  V
                </span>
                <span className="text-sm font-medium text-gray-600">Volunteer User</span>
                <button
                  className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Participation Request Banner */}
          <ParticipationRequestBanner />

          {/* Stats Section - Top Cards */}
          <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">OR</span>
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium mb-1">Virtual Events</p>
              <p className="text-4xl font-bold text-white">{eventCounts.virtual}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">IP</span>
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium mb-1">In-Person</p>
              <p className="text-4xl font-bold text-white">{eventCounts['in-person']}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">JO</span>
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium mb-1">Joined</p>
              <p className="text-4xl font-bold text-white">0</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">CO</span>
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium mb-1">Completed</p>
              <p className="text-4xl font-bold text-white">0</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">SP</span>
                </div>
              </div>
              <p className="text-sm text-white/90 font-medium mb-1">Youth Events</p>
              <p className="text-4xl font-bold text-white">6</p>
            </div>
          </section>

          {/* Tab Navigation - Volunteer Events / Donation Form */}
          <div className="mb-6 flex gap-2">
            <button className="px-6 py-2 bg-white text-gray-700 font-medium rounded-lg border-b-2 border-teal-500 shadow-sm">
              Volunteer Events
            </button>
            <button 
              onClick={() => router.push("/donate")}
              className="px-6 py-2 bg-white/70 text-gray-600 font-medium rounded-lg hover:bg-white transition-colors"
            >
              Donation Form
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events by title, keyword, or organizer..."
                className="w-full px-5 py-3 pl-12 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-gray-700"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-gray-600">☰</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-gray-600">▦</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm text-gray-700"
            >
              <CheckCircle className="w-4 h-4" />
              All Events (6)
            </button>
            
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm text-gray-700"
            >
              <UserPlus className="w-4 h-4" />
              Joined (0)
            </button>
            
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm text-gray-700"
            >
              ★ Shortlisted (0)
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm text-gray-700 ml-auto"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Empty State for Current Tab */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-10 max-w-md mx-auto">
                <div className="text-gray-400 text-6xl mb-4">
                  {activeTab === 'virtual' ? '💻' : activeTab === 'in-person' ? '🏢' : '🌍'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No {activeTab === 'virtual' ? 'Virtual' : activeTab === 'in-person' ? 'In-Person' : 'Community'} Events
                </h3>
                <p className="text-gray-600 text-sm">
                  There are currently no {activeTab} events available. Check back soon!
                </p>
              </div>
            </div>
          )}

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
                  className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 ${
                    userParticipating ? "ring-2 ring-teal-400" : ""
                  } ${
                    highlightedEventId === event._id 
                      ? 'ring-4 ring-teal-500 ring-offset-2 shadow-2xl scale-105' 
                      : ''
                  }`}
                >
                  {/* Event Image */}
                  {event.image?.url && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={event.image.url}
                        alt={event.image.caption || event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      
                      {/* Points Badge */}
                      <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        ⚡ 100
                      </div>
                      
                      {/* Bookmark Icon */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <span className="text-gray-600">☆</span>
                      </button>
                      
                      {/* Event Type Badge on Image */}
                      {event.eventType && (
                        <div className="absolute bottom-3 left-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${
                            event.eventType === 'virtual' 
                              ? 'bg-cyan-500 text-white' 
                              : event.eventType === 'in-person'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-purple-500 text-white'
                          }`}>
                            {event.eventType === 'virtual' && '� Virtual'}
                            {event.eventType === 'in-person' && '📍 In-Person'}
                            {event.eventType === 'community' && '🌍 Community'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Event Content */}
                  <div className="p-4">
                    {/* Event Title */}
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    {/* Event Description */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Date */}
                    <div className="flex items-center text-gray-600 mb-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                      <span>
                        {event.date ? (
                          new Date(event.date).toLocaleDateString('en-US', { 
                            day: 'numeric',
                            month: 'short'
                          })
                        ) : (
                          "Date TBD"
                        )}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-3 text-xs">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-pink-500" />
                      <span className="line-clamp-1">
                        {event.location || "Virtual"}
                      </span>
                    </div>

                    {/* Participants Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="h-3.5 w-3.5 mr-1.5 text-teal-500" />
                          <span className="font-medium">
                            {currentParticipants}/{maxParticipants === Infinity ? "∞" : maxParticipants}
                          </span>
                        </div>
                        {maxParticipants !== Infinity && (
                          <span className="text-xs font-semibold text-teal-600">
                            {progress}%
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {maxParticipants !== Infinity && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              eventFull
                                ? "bg-red-500"
                                : progress > 75
                                ? "bg-orange-500"
                                : "bg-teal-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-4 pb-4 relative">
                    <div className="flex items-center gap-2">
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
                              className="flex-1 bg-gray-200 text-gray-600 py-2.5 px-4 rounded-xl font-semibold text-xs cursor-not-allowed flex items-center justify-center"
                            >
                              Created by You
                            </button>
                          );
                        }
                        
                        if (userParticipating) {
                          return (
                            <button
                              disabled
                              className="flex-1 bg-green-500 text-white py-2.5 px-4 rounded-xl font-semibold text-xs cursor-not-allowed flex items-center justify-center"
                            >
                              ✓ Joined
                            </button>
                          );
                        }
                        
                        if (isRejected) {
                          return (
                            <button
                              disabled
                              className="flex-1 bg-gray-200 text-gray-600 py-2.5 px-4 rounded-xl font-semibold text-xs cursor-not-allowed flex items-center justify-center"
                            >
                              Not Eligible
                            </button>
                          );
                        }
                        
                        if (hasRequested && pendingRequest) {
                          return (
                            <button
                              disabled
                              className="flex-1 bg-yellow-400 text-yellow-900 py-2.5 px-4 rounded-xl font-semibold text-xs cursor-not-allowed flex items-center justify-center"
                            >
                              ⏳ Pending
                            </button>
                          );
                        }
                        
                        if (eventFull) {
                          return (
                            <button
                              disabled
                              className="flex-1 bg-red-500 text-white py-2.5 px-4 rounded-xl font-semibold text-xs cursor-not-allowed flex items-center justify-center"
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
                            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2.5 px-4 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-bold text-xs disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
                          >
                            {event._id && participating[event._id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Joining...
                              </>
                            ) : (
                              "Join"
                            )}
                          </button>
                        );
                      })()}
                      
                      {/* Info Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all flex-shrink-0"
                      >
                        <span className="text-gray-600 text-sm">ℹ️</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          {filteredEvents.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Showing {filteredEvents.length} {activeTab} events
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AvailableEventsPage;
