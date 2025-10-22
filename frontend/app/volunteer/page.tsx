"use client";

import React, { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useNGO } from "@/contexts/ngo-context";
import { useParticipationRequest } from "@/contexts/participation-request-context";
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  CheckCircle,
  UserPlus,
  Video,
  Building,
  Globe,
  RefreshCcw,
  XCircle,
  Share2,
  AlertCircle,
  Heart,
} from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ParticipationRequestBanner } from "@/components/ParticipationRequestBanner";
import { SpecialEventsSection } from "@/components/SpecialEventsSection";
import { toast } from "@/hooks/use-toast";
import Pagination from "@/components/Pagination";
import StatusBanner from "@/components/StatusBanner";
import api from "@/lib/api";

// Helper component to highlight matching text
const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-300 text-gray-900 font-semibold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

// Extract the main content into a separate component
const AvailableEventsContent: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState<'virtual' | 'in-person' | 'community' | 'special'>('virtual');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // TEMPORARY FIX: Always show all events regardless of user's city
  const [showAllEvents, setShowAllEvents] = useState(true); // Changed from: !user
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'joined' | 'shortlisted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSpecialEvents, setShowSpecialEvents] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Set to 2 for testing
  
  // Refs for scrolling to specific events
  const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // NGO Status Banner states
  const [myVolunteerEvents, setMyVolunteerEvents] = useState<any[]>([]);
  const [loadingMyEvents, setLoadingMyEvents] = useState(false);
  const [dismissedBanners, setDismissedBanners] = useState<{
    rejectedBanner: boolean;
    approvedBanner: boolean;
  }>({
    rejectedBanner: false,
    approvedBanner: false,
  });

  // Load dismissed banners from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dismissedVolunteerBrowseBanners');
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
    localStorage.setItem('dismissedVolunteerBrowseBanners', JSON.stringify(newDismissedState));
  };

  // Navigate to home page Ngoeventtable section
  const navigateToNgoTable = () => {
    router.push('/?scrollTo=ngoeventtable');
  };

  // Fetch NGO's own volunteer events
  const fetchMyVolunteerEvents = async () => {
    if (!user || user.role !== 'ngo') return;
    
    setLoadingMyEvents(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api.get<{ success: boolean; events: any[] }>(
        `/v1/event/organization`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMyVolunteerEvents(res.data.events || []);
    } catch (err) {
      console.error("Failed to fetch NGO's volunteer events", err);
    } finally {
      setLoadingMyEvents(false);
    }
  };

  // Fetch NGO's events when user is authenticated
  useEffect(() => {
    if (user?.role === 'ngo') {
      fetchMyVolunteerEvents();
    }
  }, [user]);

  // Update showAllEvents when user authentication status changes
  useEffect(() => {
    // For non-logged-in users, always show all events
    if (!user) {
      setShowAllEvents(true);
    }
  }, [user]);

  useEffect(() => {
    console.log('[Volunteer Page] showAllEvents:', showAllEvents);
    console.log('[Volunteer Page] user:', user ? { role: user.role, city: user.city } : 'Not logged in');
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

  // Filter events based on active tab, filter type, and search query
  const filteredEvents = useMemo(() => {
    console.log('[FRONTEND FILTER] Total events:', events.length);
    
    // Log events with completion status
    const completionEvents = events.filter(e => (e as any).completionStatus === 'pending' || (e as any).completionStatus === 'accepted');
    if (completionEvents.length > 0) {
      console.log('[FRONTEND FILTER] Events with completion status:', completionEvents.map(e => ({
        title: e.title,
        completionStatus: (e as any).completionStatus,
        completionRequestedAt: (e as any).completionRequestedAt,
        isEventOver: (e as any).isEventOver,
        shouldHide: (e as any).shouldHide
      })));
    }
    
    return events.filter(event => {
      // Hide events that are marked for hiding (30 minutes after completion request)
      if ((event as any).shouldHide) {
        console.log(`[FRONTEND FILTER] ✓ Hiding event: "${event.title}" (shouldHide: true)`);
        return false;
      }
      
      const eventType = event.eventType?.toLowerCase() || 'community';
      
      // For joined filter, show all joined events regardless of tab
      // For other filters, respect the active tab
      const matchesTab = filterType === 'joined' ? true : eventType === activeTab;
      
      // Filter by type (all, joined, shortlisted)
      let matchesFilter = true;
      if (filterType === 'joined') {
        const currentUserId = user?._id || "";
        matchesFilter = (event._id && participated[event._id]) || 
          (Array.isArray(event.participants) && 
           event.participants.some((participant: any) => 
             participant._id === currentUserId || participant === currentUserId
           ));
      } else if (filterType === 'shortlisted') {
        // TODO: Implement shortlisted logic when shortlist feature is available
        matchesFilter = false;
      }
      
      // Filter by search query
      const matchesSearch = searchQuery.trim() === '' || 
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesTab && matchesFilter && matchesSearch;
    });
  }, [events, activeTab, filterType, searchQuery, user, participated]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterType, searchQuery]);

  // Auto-switch tab when searching for events in different sections
  useEffect(() => {
    if (searchQuery.trim() === '' || filterType === 'joined' || filterType === 'shortlisted') {
      return; // Don't auto-switch for empty search or special filters
    }

    // Find all events matching the search query
    const matchingEvents = events.filter(event => 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchingEvents.length === 0) {
      return; // No matches, don't switch
    }

    // Check if current tab has any matching events
    const currentTabHasMatches = matchingEvents.some(event => 
      (event.eventType?.toLowerCase() || 'community') === activeTab
    );

    if (!currentTabHasMatches) {
      // Find which tab has the most matching events
      const tabCounts = {
        virtual: 0,
        'in-person': 0,
        community: 0
      };

      matchingEvents.forEach(event => {
        const eventType = (event.eventType?.toLowerCase() || 'community') as keyof typeof tabCounts;
        tabCounts[eventType]++;
      });

      // Switch to the tab with the most matches
      const bestTab = Object.entries(tabCounts).reduce((a, b) => 
        b[1] > a[1] ? b : a
      )[0] as 'virtual' | 'in-person' | 'community';

      if (tabCounts[bestTab] > 0) {
        setActiveTab(bestTab);
      }
    }
  }, [searchQuery, events, activeTab, filterType]);

  // Calculate NGO's event stats for banners
  const myEventStats = useMemo(() => {
    const pending = myVolunteerEvents.filter(e => e.status === "pending");
    const rejected = myVolunteerEvents.filter(e => e.status === "rejected");
    const approved = myVolunteerEvents.filter(e => e.status === "approved");
    
    // Count approved events by their display status
    const openCount = approved.filter(e => {
      const participantCount = e.participants?.length || 0;
      return participantCount < e.maxParticipants && new Date(e.date) >= new Date();
    }).length;
    
    const ongoingCount = approved.filter(e => {
      const participantCount = e.participants?.length || 0;
      return participantCount < e.maxParticipants && new Date(e.date) < new Date();
    }).length;
    
    const fullCount = approved.filter(e => {
      const participantCount = e.participants?.length || 0;
      return participantCount >= e.maxParticipants;
    }).length;
    
    return {
      pending,
      rejected,
      approved,
      openCount,
      ongoingCount,
      fullCount
    };
  }, [myVolunteerEvents]);

  // Count events by type
  const eventCounts = useMemo(() => {
    const currentUserId = user?._id || "";
    const joinedCount = events.filter(e => 
      (e._id && participated[e._id]) || 
      (Array.isArray(e.participants) && 
       e.participants.some((participant: any) => 
         participant._id === currentUserId || participant === currentUserId
       ))
    ).length;
    
    return {
      virtual: events.filter(e => (e.eventType?.toLowerCase() || 'community') === 'virtual').length,
      'in-person': events.filter(e => (e.eventType?.toLowerCase() || 'community') === 'in-person').length,
      community: events.filter(e => (e.eventType?.toLowerCase() || 'community') === 'community').length,
      special: events.filter(e => (e.eventType?.toLowerCase() || 'community') === 'special').length,
      joined: joinedCount,
      completed: 0, // TODO: Implement when completed events tracking is available
      youth: 6, // Static for now
    };
  }, [events, user, participated]);

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
        event.participants.some(
          (participant: any) =>
            participant._id === currentUserId || participant === currentUserId
        ))
    );
  };

  // Log to check if any event has shouldHide: true
  useEffect(() => {
    if (events && events.length > 0) {
      const hiddenEvents = events.filter((e: any) => e.shouldHide);
      if (hiddenEvents.length > 0) {
        console.log('Events with shouldHide:', hiddenEvents.map(e => ({ id: e._id, title: e.title, shouldHide: e.shouldHide, completionRequestedAt: e.completionRequestedAt })));
      }
    }
  }, [events]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8F5F5' }}>
        <div className="text-center">
          <Image
            src="/mascots/video_mascots/mascot_walking_video.gif"
            alt="Loading..."
            width={200}
            height={200}
            unoptimized
          />
          <p className="text-gray-600 text-lg font-semibold mt-6">Loading events...</p>
          <p className="text-gray-400 text-sm mt-2">Finding amazing opportunities! 🌟</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
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
      
      {/* Video Mascots with Proper Spacing - Full opacity, no overlay */}
      <div className="fixed top-24 left-8 z-0 pointer-events-none hidden md:block">
        <img 
          src="/mascots/video_mascots/mascot_joyDance_video.gif"
          alt="" 
          className="w-32 h-32"
        />
      </div>
      <div className="fixed bottom-16 right-8 z-0 pointer-events-none hidden md:block">
        <img 
          src="/mascots/video_mascots/mascot_watering_video.gif"
          alt="" 
          className="w-36 h-36"
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
          </div>
        </div>

        {/* Participation Request Banner */}
        <ParticipationRequestBanner />

        {/* NGO Status Banners */}
        {user?.role === 'ngo' && !loadingMyEvents && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            {myEventStats.pending.length > 0 && (
              <StatusBanner
                type="pending"
                icon={AlertCircle}
                count={myEventStats.pending.length}
                title={`${myEventStats.pending.length} Volunteer Event${myEventStats.pending.length > 1 ? 's' : ''} Awaiting Approval`}
                message={
                  <>
                    You have {myEventStats.pending.length} volunteer event{myEventStats.pending.length > 1 ? 's' : ''} pending admin approval. 
                    {myEventStats.pending.length > 1 ? ' They' : ' It'} will appear here once approved.
                    <span className="font-semibold ml-1 underline">Click for more details.</span>
                  </>
                }
                onClick={navigateToNgoTable}
              />
            )}

            {myEventStats.rejected.length > 0 && (
              <StatusBanner
                type="rejected"
                icon={XCircle}
                count={myEventStats.rejected.length}
                title={`${myEventStats.rejected.length} Volunteer Event${myEventStats.rejected.length > 1 ? 's' : ''} Rejected`}
                message={
                  <div className="space-y-2">
                    {myEventStats.rejected.map((event: any, index: number) => (
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
                onClick={navigateToNgoTable}
                onDismiss={() => dismissBanner('rejectedBanner')}
                isDismissed={dismissedBanners.rejectedBanner}
              />
            )}

            {myEventStats.approved.length > 0 && (
              <StatusBanner
                type="approved-volunteer"
                icon={CheckCircle}
                count={myEventStats.approved.length}
                title={`${myEventStats.approved.length} Volunteer Event${myEventStats.approved.length > 1 ? 's' : ''} Active`}
                message={
                  <>
                    Your volunteer events status: 
                    {myEventStats.openCount > 0 && (
                      <span className="font-semibold ml-1">{myEventStats.openCount} Open</span>
                    )}
                    {myEventStats.ongoingCount > 0 && (
                      <span className="font-semibold ml-1">
                        {myEventStats.openCount > 0 && ', '}{myEventStats.ongoingCount} Ongoing
                      </span>
                    )}
                    {myEventStats.fullCount > 0 && (
                      <span className="font-semibold ml-1">
                        {(myEventStats.openCount > 0 || myEventStats.ongoingCount > 0) && ', '}{myEventStats.fullCount} Full
                      </span>
                    )}
                    <span className="font-semibold ml-1 underline">. Click to view.</span>
                  </>
                }
                onClick={navigateToNgoTable}
                onDismiss={() => dismissBanner('approvedBanner')}
                isDismissed={dismissedBanners.approvedBanner}
              />
            )}
          </div>
        )}

          {/* Old Stats Section - Removed to avoid duplication */}
          <div className="hidden">
          <section className="mb-6 grid grid-cols-5 gap-3">
            <div 
              onClick={() => {
                setActiveTab('virtual');
                setFilterType('all');
              }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                activeTab === 'virtual' && filterType === 'all' ? 'ring-4 ring-cyan-600 scale-105' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">OR</span>
                </div>
              </div>
              <p className="text-xs text-white/90 font-medium mb-1">Virtual Events</p>
              <p className="text-3xl font-bold text-white">{eventCounts.virtual}</p>
            </div>

          <div 
            onClick={() => {
              setActiveTab('in-person');
              setFilterType('all');
            }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
              activeTab === 'in-person' && filterType === 'all' ? 'ring-4 ring-emerald-600 scale-105' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">IP</span>
              </div>
            </div>
            <p className="text-xs text-white/90 font-medium mb-1">In-Person</p>
            <p className="text-3xl font-bold text-white">{eventCounts['in-person']}</p>
          </div>

          <div 
            onClick={() => {
              setFilterType('joined');
            }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
              filterType === 'joined' ? 'ring-4 ring-blue-700 scale-105' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">JO</span>
              </div>
            </div>
            <p className="text-xs text-white/90 font-medium mb-1">Joined</p>
            <p className="text-3xl font-bold text-white">{eventCounts.joined}</p>
          </div>

          <div 
            onClick={() => {
              toast({
                title: 'Coming Soon',
                description: 'Completed events tracking will be available soon!',
              });
            }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer opacity-75"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">CO</span>
              </div>
            </div>
            <p className="text-xs text-white/90 font-medium mb-1">Completed</p>
            <p className="text-3xl font-bold text-white">{eventCounts.completed}</p>
          </div>

            <div 
              onClick={() => {
                setActiveTab('community');
                setFilterType('all');
              }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                activeTab === 'community' && filterType === 'all' ? 'ring-4 ring-yellow-600 scale-105' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">YE</span>
                </div>
              </div>
              <p className="text-xs text-white/90 font-medium mb-1">Youth Events</p>
              <p className="text-3xl font-bold text-white">{eventCounts.community}</p>
            </div>
          </section>
          </div>

          {/* Event Type Navigation - Compact Row Design */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {/* Virtual Events */}
            <button
              onClick={() => {
                setActiveTab('virtual');
                setFilterType('all');
              }}
              className={`px-6 py-2 font-medium rounded-lg border-b-2 shadow-sm transition-all ${
                activeTab === 'virtual' && filterType === 'all'
                  ? 'bg-white text-teal-600 border-teal-500' 
                  : 'bg-white/70 text-gray-600 border-transparent hover:bg-white'
              }`}
            >
              💻 Virtual ({eventCounts.virtual})
            </button>

            {/* In-Person Events */}
            <button
              onClick={() => {
                setActiveTab('in-person');
                setFilterType('all');
              }}
              className={`px-6 py-2 font-medium rounded-lg border-b-2 shadow-sm transition-all ${
                activeTab === 'in-person' && filterType === 'all'
                  ? 'bg-white text-emerald-600 border-emerald-500' 
                  : 'bg-white/70 text-gray-600 border-transparent hover:bg-white'
              }`}
            >
              📍 In-Person ({eventCounts['in-person']})
            </button>

            {/* Community Events */}
            <button
              onClick={() => {
                setActiveTab('community');
                setFilterType('all');
              }}
              className={`px-6 py-2 font-medium rounded-lg border-b-2 shadow-sm transition-all ${
                activeTab === 'community' && filterType === 'all'
                  ? 'bg-white text-purple-600 border-purple-500' 
                  : 'bg-white/70 text-gray-600 border-transparent hover:bg-white'
              }`}
            >
              🌍 Community ({eventCounts.community})
            </button>

            {/* Special Events */}
            <button
              onClick={() => {
                setActiveTab('special');
                setFilterType('all');
              }}
              className={`px-6 py-2 font-medium rounded-lg border-b-2 shadow-sm transition-all ${
                activeTab === 'special' && filterType === 'all'
                  ? 'bg-white text-amber-600 border-amber-500' 
                  : 'bg-white/70 text-gray-600 border-transparent hover:bg-white'
              }`}
            >
              ✨ Special ({eventCounts.special})
            </button>
          </div>

          {/* Special Events Section */}
          <SpecialEventsSection 
            isVisible={showSpecialEvents} 
            onClose={() => setShowSpecialEvents(false)} 
          />

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events by title, keyword, or organizer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 pr-32 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-gray-700"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <>
                  <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {filteredEvents.length} match{filteredEvents.length !== 1 ? 'es' : ''}
                  </div>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                    title="Clear search"
                  >
                    ✕
                  </button>
                </>
              )}
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
              onClick={() => setFilterType('all')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
                filterType === 'all' 
                  ? 'bg-teal-500 text-white border-teal-500' 
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              All Events ({events.length})
            </button>
            
            <button
              onClick={() => setFilterType('joined')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
                filterType === 'joined' 
                  ? 'bg-teal-500 text-white border-teal-500' 
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Joined ({eventCounts.joined})
            </button>
            
            <button
              onClick={() => setFilterType('shortlisted')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
                filterType === 'shortlisted' 
                  ? 'bg-teal-500 text-white border-teal-500' 
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              ★ Shortlisted (0)
            </button>

            <button
              onClick={() => setShowSpecialEvents(!showSpecialEvents)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
                showSpecialEvents 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-teal-500' 
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              ✨ Special Event
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm text-gray-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
                {!events || events.length === 0 ? '📅' :
                 filterType === 'joined' ? '👥' : 
                 filterType === 'shortlisted' ? '⭐' : 
                 activeTab === 'virtual' ? '💻' : 
                 activeTab === 'in-person' ? '🏢' : '🌍'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {!events || events.length === 0 ? 'No Events Available' :
                 filterType === 'joined' ? 'No Joined Events' : 
                 filterType === 'shortlisted' ? 'No Shortlisted Events' : 
                 `No ${activeTab === 'virtual' ? 'Virtual' : activeTab === 'in-person' ? 'In-Person' : 'Community'} Events`}
              </h3>
              <p className="text-gray-600 text-sm">
                {!events || events.length === 0
                  ? "There are currently no events available. Please check back later."
                  : filterType === 'joined' 
                  ? "You haven't joined any events yet. Browse available events and join one to get started!" 
                  : filterType === 'shortlisted'
                  ? "You haven't shortlisted any events yet."
                  : `There are currently no ${activeTab} events available. Check back soon!`}
              </p>
              {(!events || events.length === 0) && (
                <Button
                  onClick={handleRefresh}
                  className="mt-4 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 shadow-md hover:shadow-lg"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {currentEvents.map((event) => {
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
                <div className="relative h-40 w-full overflow-hidden">
                  {event.image?.url ? (
                    <>
                      <img
                        src={event.image.url}
                        alt={event.image.caption || event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </>
                  ) : (
                    <>
                      {/* Placeholder with gradient background */}
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center">
                        <div className="text-center">
                          <Users className="w-12 h-12 text-purple-300 mx-auto mb-1" />
                          <p className="text-purple-600 text-xs font-semibold">Volunteer Event</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </>
                  )}
                  
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
                        {event.eventType === 'virtual' && '💻 Virtual'}
                        {event.eventType === 'in-person' && '📍 In-Person'}
                        {event.eventType === 'community' && '🌍 Community'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Content */}
                <div className="p-4">
                  {/* Event Title */}
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    <HighlightText text={event.title} highlight={searchQuery} />
                  </h3>
                  
                  {/* Event Description */}
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    <HighlightText text={event.description} highlight={searchQuery} />
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
                      <HighlightText text={event.location || "Virtual"} highlight={searchQuery} />
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

                    {/* Points Awarded */}
                    {event.pointsOffered && (
                      <div className="flex items-center text-gray-600 mt-2">
                        <IndianRupee className="h-4 w-4 mr-3 text-yellow-600" />
                        <span className="text-sm">
                          Points: {event.pointsOffered}
                        </span>
                      </div>
                    )}

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
                      // Check if event is over (completion request sent)
                      const isEventOver = (event as any).isEventOver;
                      
                      if (isEventOver) {
                        return (
                          <button
                            disabled
                            className="flex-1 bg-orange-500 text-white py-2.5 px-4 rounded-xl font-semibold text-xs cursor-not-allowed flex items-center justify-center"
                          >
                            🏁 Event Over
                          </button>
                        );
                      }
                      
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
                    
                    {/* Share Button */}
                    <button
                      onClick={(e) => handleShare(event, e)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-xl text-teal-600 bg-teal-50 hover:bg-teal-100 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                      title="Share event"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

        {/* Footer Note */}
        {filteredEvents.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {filterType === 'joined' 
                ? `Total ${filteredEvents.length} joined event${filteredEvents.length !== 1 ? 's' : ''}`
                : filterType === 'shortlisted'
                ? `Total ${filteredEvents.length} shortlisted event${filteredEvents.length !== 1 ? 's' : ''}`
                : `Total ${filteredEvents.length} ${activeTab} event${filteredEvents.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component with Suspense wrapper
const AvailableEventsPage: React.FC = () => {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8F5F5' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading events...</p>
          </div>
        </div>
      }>
        <AvailableEventsContent />
      </Suspense>
    </>
  );
};

export default AvailableEventsPage