"use client";

import { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import {
  Share2,
  DollarSign,
  Target,
  CheckCircle,
  RefreshCcw,
  TrendingUp,
  Heart,
  Users,
} from "lucide-react";
import { toast as shadToast } from "@/hooks/use-toast";
import {
  useDonationEvent,
  DonationEvent,
} from "@/contexts/donationevents-context";
import { FundraiserSection } from "@/components/FundraiserSection";
import Footer from "@/components/Footer";

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
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [highlightedDonationId, setHighlightedDonationId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFundraiser, setShowFundraiser] = useState(false);
  const [activeSection, setActiveSection] = useState<'campaigns' | 'fundraiser'>('campaigns');

  const donationRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
        <div className="fixed top-24 right-4 lg:right-8 z-[5] pointer-events-none">
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
          <div className="mb-6">
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
                  <DollarSign className="w-4 h-4 text-white" />
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
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3 w-full">
                {filteredEvents.map((event: DonationEvent, index) => {
                  const progressPercentage = Math.min(
                    (event.collectedAmount / event.goalAmount) * 100,
                    100
                  );
                  const isCompleted = event.collectedAmount >= event.goalAmount;

                  return (
                    <div
                      key={event._id}
                      ref={(el) => {
                        if (el && event._id) {
                          donationRefs.current.set(event._id, el);
                        } else if (event._id) {
                          donationRefs.current.delete(event._id);
                        }
                      }}
                      className={`group relative bg-white rounded-3xl border-2 border-teal-100 hover:border-cyan-300 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm overflow-hidden p-5 cursor-pointer ${
                        highlightedDonationId === event._id
                          ? "ring-4 ring-teal-500 ring-offset-2 shadow-2xl"
                          : ""
                      }`}
                      onClick={() => router.push(`/donate/${event._id}`)}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      {/* Background Glow Effect */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Status Ribbon */}
                      {isCompleted && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 fill-current" />
                          Goal Achieved
                        </div>
                      )}

                      {/* Content Layout */}
                      <div className="relative z-10">
                        {/* Category/NGO Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full shadow-md"></div>
                          <span className="text-xs font-semibold text-teal-600 bg-teal-50/80 px-3 py-1.5 rounded-2xl border border-teal-200/60 backdrop-blur-sm">
                            <HighlightText
                              text={event.ngo?.name || "Community NGO"}
                              highlight={searchQuery}
                            />
                          </span>
                        </div>

                        {/* Title and Description */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-500 leading-tight mb-2">
                            <HighlightText
                              text={event.title}
                              highlight={searchQuery}
                            />
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-sm line-clamp-2">
                            <HighlightText
                              text={event.description || ""}
                              highlight={searchQuery}
                            />
                          </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-2.5 mb-4 grid-cols-2">
                          <div className="flex items-center gap-2.5 p-3 bg-teal-50/80 rounded-xl border border-teal-100/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-100 shadow-sm">
                              <Target className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                Goal
                              </p>
                              <p className="text-xs font-semibold text-gray-900">
                                {formatCurrency(event.goalAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-3 bg-cyan-50/80 rounded-xl border border-cyan-100/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-100 shadow-sm">
                              <DollarSign className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                Collected
                              </p>
                              <p className="text-xs font-semibold text-gray-900">
                                {formatCurrency(event.collectedAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-3 bg-emerald-50/80 rounded-xl border border-emerald-100/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 shadow-sm">
                              <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                Progress
                              </p>
                              <p className="text-xs font-semibold text-gray-900">
                                {progressPercentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-3 bg-orange-50/80 rounded-xl border border-orange-100/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 shadow-sm">
                              <Users className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                Status
                              </p>
                              <p className="text-xs font-semibold text-gray-900">
                                {isCompleted ? "Completed" : event.status || "Active"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-teal-100/80 flex gap-2.5">
                          {/* View Details Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/donate/${event._id}`);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <Heart className="w-4 h-4" />
                            View & Donate
                          </button>
                          
                          {/* Share Button */}
                          <button
                            onClick={(e) => handleShare(event, e)}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl text-teal-600 bg-teal-50 hover:bg-teal-100 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                            title="Share donation event"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Hover Effect Border */}
                      <div className="absolute inset-0 rounded-3xl border-3 border-transparent bg-gradient-to-br from-teal-200/50 to-cyan-200/30 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
                    </div>
                  );
                })}
              </div>

              {filteredEvents.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    {filter === "active"
                      ? `Showing ${filteredEvents.length} active campaign${
                          filteredEvents.length !== 1 ? "s" : ""
                        }`
                      : filter === "completed"
                      ? `Showing ${filteredEvents.length} completed campaign${
                          filteredEvents.length !== 1 ? "s" : ""
                        }`
                      : `Showing ${filteredEvents.length} campaign${
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
         <Footer/>
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
