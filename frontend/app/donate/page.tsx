"use client";

import { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import {
  Share2,
  IndianRupee,
  Target,
  CheckCircle,
  RefreshCcw,
  TrendingUp,
  Heart,
  Users,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast as shadToast } from "@/hooks/use-toast";
import {
  useDonationEvent,
  DonationEvent,
} from "@/contexts/donationevents-context";
import { FundraiserSection } from "@/components/FundraiserSection";
import Pagination from "@/components/Pagination";
import { DonationEventCard } from "@/components/DonationEventCard";
import StatusBanner from "@/components/StatusBanner";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";

// Helper component to highlight matching text
const HighlightText: React.FC<{ text: string; highlight: string }> = ({
  text,
  highlight,
}) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-yellow-300 text-gray-900 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

// Separate component that uses useSearchParams
function DonatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { events, fetchEvents, loading } = useDonationEvent();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [highlightedDonationId, setHighlightedDonationId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFundraiser, setShowFundraiser] = useState(false);
  const [activeSection, setActiveSection] = useState<'campaigns' | 'fundraiser'>('campaigns');
  const [myDonationEvents, setMyDonationEvents] = useState<any[]>([]);
  const [loadingMyEvents, setLoadingMyEvents] = useState(false);
  const campaignsRef = useRef<HTMLDivElement>(null);

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
    const stored = localStorage.getItem('dismissedDonationEventBanners');
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
    localStorage.setItem('dismissedDonationEventBanners', JSON.stringify(newDismissedState));
  };

  // Navigate to home page Ngoeventtable section
  const navigateToNgoTable = () => {
    router.push('/?scrollTo=ngoeventtable');
  };

  // Fetch NGO's own donation events
  const fetchMyDonationEvents = async () => {
    if (user?.role !== 'ngo') return;
    
    setLoadingMyEvents(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api.get("/v1/donation-event/organization/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMyDonationEvents(res.data.events || []);
    } catch (err) {
      console.error("Failed to fetch my donation events:", err);
    } finally {
      setLoadingMyEvents(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ngo') {
      fetchMyDonationEvents();
    }
  }, [user]);  const donationRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const donationId = searchParams.get("donationId");

    if (donationId && events.length > 0) {
      setHighlightedDonationId(donationId);

      setTimeout(() => {
        const donationElement = donationRefs.current.get(donationId);
        if (donationElement) {
          donationElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          setTimeout(() => {
            setHighlightedDonationId(null);
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams, events.length]);

  const handleShare = async (event: DonationEvent, e: React.MouseEvent) => {
    e.stopPropagation();

    const donationUrl = `${window.location.origin}/donate?donationId=${event._id}`;
    console.log("Sharing donation URL:", donationUrl);

    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description || "Support this donation cause",
          url: donationUrl,
        });
        console.log("Donation shared successfully via native share");

        shadToast({
          title: "Success",
          description: "Donation event shared successfully",
        });
      } else {
        if (!navigator.clipboard) {
          throw new Error("Clipboard API not available");
        }

        await navigator.clipboard.writeText(donationUrl);
        console.log("Donation URL copied to clipboard");

        shadToast({
          title: "Link copied!",
          description: "Donation event link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Share failed:", error);

      if (error instanceof Error && error.name !== "AbortError") {
        shadToast({
          title: "Failed to share",
          description:
            error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event: DonationEvent) => {
      const isCompleted = event.collectedAmount >= event.goalAmount;

      let matchesFilter = true;
      switch (filter) {
        case "active":
          matchesFilter = !isCompleted;
          break;
        case "completed":
          matchesFilter = isCompleted;
          break;
        default:
          matchesFilter = true;
      }

      const matchesSearch =
        searchQuery.trim() === "" ||
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.ngo?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [events, filter, searchQuery]);

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
  }, [filter, searchQuery]);

  // Calculate banner stats for NGO's own events
  const myEventStats = useMemo(() => {
    if (user?.role !== 'ngo' || !myDonationEvents.length) {
      return { pending: [], rejected: [], approved: [], openCount: 0, ongoingCount: 0, fullCount: 0 };
    }

    const pending = myDonationEvents.filter((e: any) => e.approvalStatus === "pending");
    const rejected = myDonationEvents.filter((e: any) => e.approvalStatus === "rejected");
    const approved = myDonationEvents.filter((e: any) => e.approvalStatus === "approved");
    
    const openCount = approved.filter((e: any) => {
      const isGoalAchieved = e.collectedAmount >= e.goalAmount;
      const isPastEndDate = new Date(e.endDate) < new Date();
      return !isGoalAchieved && !isPastEndDate;
    }).length;

    const ongoingCount = approved.filter((e: any) => {
      const isGoalAchieved = e.collectedAmount >= e.goalAmount;
      const isPastEndDate = new Date(e.endDate) < new Date();
      return !isGoalAchieved && isPastEndDate;
    }).length;

    const fullCount = approved.filter((e: any) => e.collectedAmount >= e.goalAmount).length;

    return { pending, rejected, approved, openCount, ongoingCount, fullCount };
  }, [myDonationEvents, user]);

  const eventCounts = useMemo(() => {
    const completed = events.filter(
      (e) => e.collectedAmount >= e.goalAmount
    ).length;
    const active = events.length - completed;
    const totalCollected = events.reduce(
      (sum, e) => sum + e.collectedAmount,
      0
    );
    const totalGoal = events.reduce((sum, e) => sum + e.goalAmount, 0);

    return {
      all: events.length,
      active,
      completed,
      totalCollected,
      totalGoal,
    };
  }, [events]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      return;
    }

    const matchingEvents = events.filter(
      (event) =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.ngo?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchingEvents.length === 0) {
      return;
    }

    const currentFilterHasMatches = matchingEvents.some((event) => {
      const isCompleted = event.collectedAmount >= event.goalAmount;
      if (filter === "active") return !isCompleted;
      if (filter === "completed") return isCompleted;
      return true;
    });

    if (!currentFilterHasMatches) {
      const activeCount = matchingEvents.filter(
        (e) => e.collectedAmount < e.goalAmount
      ).length;
      const completedCount = matchingEvents.filter(
        (e) => e.collectedAmount >= e.goalAmount
      ).length;

      if (activeCount > completedCount && activeCount > 0) {
        setFilter("active");
      } else if (completedCount > 0) {
        setFilter("completed");
      } else {
        setFilter("all");
      }
    }
  }, [searchQuery, events, filter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEvents();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <>
      <Header />
      <div
        className="min-h-screen py-6 relative overflow-hidden"
        style={{ backgroundColor: "#E8F5F5" }}
      >
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

        {/* Animated Video Mascots - Positioned at edges to avoid content overlap */}
        <div className="fixed top-24 right-4 lg:right-8 z-[5] pointer-events-none hidden md:block">
          <img
            src="/mascots/video_mascots/mascot_holdingmoney_video.gif"
            alt="holding money mascot"
            className="w-24 h-24 md:w-32 md:h-32"
          />
        </div>
        <div className="fixed bottom-32 right-4 lg:right-12 z-[5] pointer-events-none hidden md:block">
          <img
            src="/mascots/video_mascots/mascot_joyDance_video.gif"
            alt="joy dance mascot"
            className="w-24 h-24 md:w-32 md:h-32"
          />
        </div>
        <div className="fixed bottom-40 left-4 lg:left-10 z-[5] pointer-events-none hidden lg:block">
          <img
            src="/mascots/video_mascots/mascot_watering_video.gif"
            alt="watering mascot"
            className="w-24 h-24 md:w-32 md:h-32"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div ref={campaignsRef} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Donation Campaigns
                </h1>
              </div>
            </div>
          </div>

          {/* Status Banners for NGOs */}
          {user?.role === 'ngo' && !loadingMyEvents && (
            <>
              {myEventStats.pending.length > 0 && (
                <StatusBanner
                  type="pending"
                  icon={AlertCircle}
                  count={myEventStats.pending.length}
                  title={`${myEventStats.pending.length} Donation Campaign${myEventStats.pending.length > 1 ? 's' : ''} Awaiting Approval`}
                  message={
                    <>
                      You have {myEventStats.pending.length} donation campaign{myEventStats.pending.length > 1 ? 's' : ''} pending admin approval. 
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
                  title={`${myEventStats.rejected.length} Donation Campaign${myEventStats.rejected.length > 1 ? 's' : ''} Rejected`}
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
                      <p className="font-semibold mt-3 underline">Review your rejected campaigns.</p>
                    </div>
                  }
                  onClick={navigateToNgoTable}
                  onDismiss={() => dismissBanner('rejectedBanner')}
                  isDismissed={dismissedBanners.rejectedBanner}
                />
              )}

              {myEventStats.approved.length > 0 && (
                <StatusBanner
                  type="approved-donation"
                  icon={Heart}
                  count={myEventStats.approved.length}
                  title={`${myEventStats.approved.length} Donation Campaign${myEventStats.approved.length > 1 ? 's' : ''} Active`}
                  message={
                    <>
                      Your donation campaigns status: 
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
                          {(myEventStats.openCount > 0 || myEventStats.ongoingCount > 0) && ', '}{myEventStats.fullCount} Goal Achieved
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
            </>
          )}

          {/* Stats Section */}
          <div className="hidden">
        <section className="mb-6 grid grid-cols-5 gap-3">
            <div
              onClick={() => setFilter("all")}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                filter === "all" ? "ring-4 ring-teal-600 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">ALL</span>
                </div>
              </div>
              <p className="text-xs text-white/90 font-medium mb-1">
                All Campaigns
              </p>
              <p className="text-3xl font-bold text-white">{eventCounts.all}</p>
            </div>

            <div
              onClick={() => setFilter("active")}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                filter === "active" ? "ring-4 ring-cyan-600 scale-105" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">ACT</span>
                </div>
              </div>
              <p className="text-xs text-white/90 font-medium mb-1">Active</p>
              <p className="text-3xl font-bold text-white">
                {eventCounts.active}
              </p>
            </div>

            <div
              onClick={() => setFilter("completed")}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                filter === "completed"
                  ? "ring-4 ring-emerald-600 scale-105"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">DONE</span>
                </div>
              </div>
              <p className="text-xs text-white/90 font-medium mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-white">
                {eventCounts.completed}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">COL</span>
                </div>
              </div>
              <p className="text-xs text-white/90 font-medium mb-1">
                Collected
              </p>
              <p className="text-2xl font-bold text-white">
                {formatLargeNumber(eventCounts.totalCollected)}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">GOAL</span>
                </div>
              </div>
              <p className="text-xs text-white/90 font-medium mb-1">
                Total Goal
              </p>
              <p className="text-2xl font-bold text-white">
                {formatLargeNumber(eventCounts.totalGoal)}
              </p>
            </div>
          </section>
        </div>

          {/* Tab Navigation */}
          <div className="mb-6 flex gap-2">
            <button 
              onClick={() => {
                setActiveSection('campaigns');
                setShowFundraiser(false);
              }}
              className={`px-6 py-2 font-medium rounded-lg border-b-2 shadow-sm transition-all ${
                activeSection === 'campaigns'
                  ? 'bg-white text-teal-600 border-teal-500'
                  : 'bg-white/70 text-gray-600 border-transparent hover:bg-white'
              }`}
            >
              💝 Donation Campaigns
            </button>
            <button
              onClick={() => {
                setActiveSection('fundraiser');
                setShowFundraiser(true);
              }}
              className={`px-6 py-2 font-medium rounded-lg border-b-2 shadow-sm transition-all ${
                activeSection === 'fundraiser'
                  ? 'bg-white text-teal-600 border-teal-500'
                  : 'bg-white/70 text-gray-600 border-transparent hover:bg-white'
              }`}
            >
              🚀 Start a Fundraiser
            </button>
          </div>
          
          {/* Search Bar - Available for both sections */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns by title, description, or NGO name..."
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
                      {filteredEvents.length} match
                      {filteredEvents.length !== 1 ? "es" : ""}
                    </div>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Filters - Available for both sections */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
                filter === "all"
                  ? "bg-teal-500 text-white border-teal-500"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              <Heart className="w-4 h-4" />
              All Campaigns ({eventCounts.all})
            </button>

            <button
              onClick={() => setFilter("active")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
                filter === "active"
                  ? "bg-teal-500 text-white border-teal-500"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Active ({eventCounts.active})
            </button>

            <button
              onClick={() => setFilter("completed")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
                filter === "completed"
                  ? "bg-teal-500 text-white border-teal-500"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Completed ({eventCounts.completed})
            </button>

            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm text-gray-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

        {/* Fundraiser Section */}
        {activeSection === 'fundraiser' && (
          <FundraiserSection 
            isVisible={showFundraiser} 
            onClose={() => {
              setShowFundraiser(false);
              setActiveSection('campaigns');
            }} 
          />
        )}

        {/* Campaign List Section */}
        {activeSection === 'campaigns' && (
          <>
          {/* Loading/Empty/Events Grid */}
          {loading ? (
            <div className="text-center py-16">
              <img
                src="/mascots/video_mascots/mascot_walking_video.gif"
                alt="Loading..."
                width={200}
                height={200}
                className="mx-auto mb-6"
              />
              <p className="text-gray-600 text-lg font-semibold">Loading campaigns...</p>
              <p className="text-gray-400 text-sm mt-2">Finding ways to make a difference! 💝</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-10 max-w-md mx-auto">
                <div className="text-gray-400 text-6xl mb-4">
                  {filter === "active"
                    ? "📈"
                    : filter === "completed"
                    ? "✅"
                    : "💝"}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {events.length === 0
                    ? "No Campaigns Available"
                    : filter === "active"
                    ? "No Active Campaigns"
                    : filter === "completed"
                    ? "No Completed Campaigns"
                    : "No Matching Campaigns"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {events.length === 0
                    ? "There are currently no donation campaigns available. Check back soon!"
                    : searchQuery
                    ? "No campaigns match your search. Try different keywords."
                    : `There are currently no ${filter} campaigns.`}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 w-full">
                {currentEvents.map((event: DonationEvent, index) => (
                  <div
                    key={event._id}
                    className="max-w-sm mx-auto w-full"
                    ref={(el) => {
                      if (el && event._id) {
                        donationRefs.current.set(event._id, el);
                      } else if (event._id) {
                        donationRefs.current.delete(event._id);
                      }
                    }}
                  >
                    <DonationEventCard
                      event={event}
                      onCardClick={(id) => router.push(`/donate/${id}`)}
                      onShare={handleShare}
                      isHighlighted={highlightedDonationId === event._id}
                      animationIndex={index}
                      searchQuery={searchQuery}
                      HighlightText={HighlightText}
                    />
                  </div>
                ))}
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

              {filteredEvents.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    {filter === "active"
                      ? `Total ${filteredEvents.length} active campaign${
                          filteredEvents.length !== 1 ? "s" : ""
                        }`
                      : filter === "completed"
                      ? `Total ${filteredEvents.length} completed campaign${
                          filteredEvents.length !== 1 ? "s" : ""
                        }`
                      : `Total ${filteredEvents.length} campaign${
                          filteredEvents.length !== 1 ? "s" : ""
                        }`}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
        )}
        </div>
      </div>
    </>
  );
}

// Main component with Suspense wrapper
export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#E8F5F5" }}
        >
          <div className="text-center">
            <img
              src="/mascots/video_mascots/mascot_joyDance_video.gif"
              alt="Loading..."
              width={200}
              height={200}
              className="mx-auto"
            />
            <p className="text-gray-600 text-lg font-semibold mt-6">Loading page...</p>
          </div>
        </div>
      }
    >
      <DonatePageContent />
    </Suspense>
  );
}
