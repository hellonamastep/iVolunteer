"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Share2, 
  DollarSign, 
  Target, 
  CheckCircle, 
  RefreshCcw,
  TrendingUp,
  Heart,
  Users
} from "lucide-react";
import { toast } from "react-toastify";
import { toast as shadToast } from "@/hooks/use-toast";
import { useDonationEvent, DonationEvent } from "@/contexts/donationevents-context";

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

// Create a client component that uses useSearchParams
function DonatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { events, fetchEvents, loading, handleRazorpayPayment } = useDonationEvent();
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [highlightedDonationId, setHighlightedDonationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const quickAmounts = [100, 250, 500, 1000]; // Converted to Rupees
  
  // Refs for scrolling to specific donation events
  const donationRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle donationId from URL parameter
  useEffect(() => {
    const donationId = searchParams.get('donationId');
    
    if (donationId && events.length > 0) {
      // Set highlighted donation
      setHighlightedDonationId(donationId);
      
      // Wait for the donation card to render and then scroll to it
      setTimeout(() => {
        const donationElement = donationRefs.current.get(donationId);
        if (donationElement) {
          donationElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedDonationId(null);
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams, events.length]);
  

  const handleCustomDonate = (eventId: string) => {
    const amount = Number(customAmounts[eventId]);
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    handleRazorpayPayment(eventId, amount);
    setCustomAmounts({ ...customAmounts, [eventId]: "" });
  };

  const handleDonateClick = (eventId: string, amount: number) => {
    handleRazorpayPayment(eventId, amount);
  };

  const handleShare = async (event: DonationEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent click handlers
    
    const donationUrl = `${window.location.origin}/donate?donationId=${event._id}`;
    console.log('Sharing donation URL:', donationUrl);
    
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: event.title,
          text: event.description || 'Support this donation cause',
          url: donationUrl,
        });
        console.log('Donation shared successfully via native share');
        
        shadToast({
          title: 'Success',
          description: 'Donation event shared successfully',
        });
      } else {
        // Fallback to copying link to clipboard
        if (!navigator.clipboard) {
          throw new Error('Clipboard API not available');
        }
        
        await navigator.clipboard.writeText(donationUrl);
        console.log('Donation URL copied to clipboard');
        
        shadToast({
          title: 'Link copied!',
          description: 'Donation event link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      
      // Only show error if it's not a user cancellation
      if (error instanceof Error && error.name !== 'AbortError') {
        shadToast({
          title: 'Failed to share',
          description: error instanceof Error ? error.message : 'Please try again',
          variant: 'destructive'
        });
      }
    }
  };

  // Filter events based on selected filter and search query
  const filteredEvents = useMemo(() => {
    return events.filter((event: DonationEvent) => {
      const isCompleted = event.collectedAmount >= event.goalAmount;
      
      // Filter by status
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
      
      // Filter by search query
      const matchesSearch = searchQuery.trim() === '' || 
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.ngo?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [events, filter, searchQuery]);

  // Count events by status
  const eventCounts = useMemo(() => {
    const completed = events.filter(e => e.collectedAmount >= e.goalAmount).length;
    const active = events.length - completed;
    const totalCollected = events.reduce((sum, e) => sum + e.collectedAmount, 0);
    const totalGoal = events.reduce((sum, e) => sum + e.goalAmount, 0);
    
    return {
      all: events.length,
      active,
      completed,
      totalCollected,
      totalGoal,
    };
  }, [events]);

  // Auto-switch filter when searching for campaigns in different status
  useEffect(() => {
    if (searchQuery.trim() === '') {
      return;
    }

    const matchingEvents = events.filter(event => 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ngo?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchingEvents.length === 0) {
      return;
    }

    // Check if current filter has any matching events
    const currentFilterHasMatches = matchingEvents.some(event => {
      const isCompleted = event.collectedAmount >= event.goalAmount;
      if (filter === 'active') return !isCompleted;
      if (filter === 'completed') return isCompleted;
      return true;
    });

    if (!currentFilterHasMatches) {
      // Find which filter has the most matching events
      const activeCount = matchingEvents.filter(e => e.collectedAmount < e.goalAmount).length;
      const completedCount = matchingEvents.filter(e => e.collectedAmount >= e.goalAmount).length;

      if (activeCount > completedCount && activeCount > 0) {
        setFilter('active');
      } else if (completedCount > 0) {
        setFilter('completed');
      } else {
        setFilter('all');
      }
    }
  }, [searchQuery, events, filter]);

  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format large numbers (for displaying in K/L/Cr format)
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
      
      {/* Mascot Images in Background - Dynamic based on filter */}
      <div className="fixed top-32 left-10 opacity-20 z-0 pointer-events-none transition-all duration-500">
        <img 
          src={filter === 'all' ? "/mascots/mascot_donate.png" : 
               filter === 'active' ? "/mascots/mascot_money.png" : 
               "/mascots/mascot_thumbsup.png"} 
          alt="" 
          className="w-28 h-28 animate-bounce" 
          style={{ animationDuration: "3s" }} 
        />
      </div>
      <div className="fixed bottom-20 right-10 opacity-20 z-0 pointer-events-none transition-all duration-500">
        <img 
          src={filter === 'all' ? "/mascots/mascot_gift.png" : 
               filter === 'active' ? "/mascots/mascot_happiness.png" : 
               "/mascots/mascot_star.png"} 
          alt="" 
          className="w-36 h-36 animate-pulse" 
          style={{ animationDuration: "4s" }} 
        />
      </div>
      <div className="fixed top-1/2 right-5 opacity-15 z-0 pointer-events-none transition-all duration-500">
        <img 
          src={filter === 'all' ? "/mascots/mascot_love.png" : 
               filter === 'active' ? "/mascots/mascot_volunteer.png" : 
               "/mascots/mascot_party.png"} 
          alt="" 
          className="w-24 h-24 animate-bounce" 
          style={{ animationDuration: "5s" }} 
        />
      </div>
      <div className="fixed top-2/3 left-5 opacity-15 z-0 pointer-events-none transition-all duration-500">
        <img 
          src={filter === 'all' ? "/mascots/mascot_help.png" : 
               filter === 'active' ? "/mascots/mascot_happy.png" : 
               "/mascots/mascot_chear.png"} 
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
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Donation Campaigns
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Top Cards */}
        <section className="mb-6 grid grid-cols-5 gap-3">
          <div 
            onClick={() => setFilter('all')}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
              filter === 'all' ? 'ring-4 ring-teal-600 scale-105' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">ALL</span>
              </div>
            </div>
            <p className="text-xs text-white/90 font-medium mb-1">All Campaigns</p>
            <p className="text-3xl font-bold text-white">{eventCounts.all}</p>
          </div>

          <div 
            onClick={() => setFilter('active')}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
              filter === 'active' ? 'ring-4 ring-cyan-600 scale-105' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">ACT</span>
              </div>
            </div>
            <p className="text-xs text-white/90 font-medium mb-1">Active</p>
            <p className="text-3xl font-bold text-white">{eventCounts.active}</p>
          </div>

          <div 
            onClick={() => setFilter('completed')}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
              filter === 'completed' ? 'ring-4 ring-emerald-600 scale-105' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">DONE</span>
              </div>
            </div>
            <p className="text-xs text-white/90 font-medium mb-1">Completed</p>
            <p className="text-3xl font-bold text-white">{eventCounts.completed}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">COL</span>
              </div>
            </div>
            <p className="text-xs text-white/90 font-medium mb-1">Collected</p>
            <p className="text-2xl font-bold text-white">{formatLargeNumber(eventCounts.totalCollected)}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">GOAL</span>
              </div>
            </div>
            <p className="text-xs text-white/90 font-medium mb-1">Total Goal</p>
            <p className="text-2xl font-bold text-white">{formatLargeNumber(eventCounts.totalGoal)}</p>
          </div>
        </section>

        {/* Tab Navigation - Donation Events / Volunteer Events */}
        <div className="mb-6 flex gap-2">
          <button className="px-6 py-2 bg-white text-gray-700 font-medium rounded-lg border-b-2 border-teal-500 shadow-sm">
            Donation Campaigns
          </button>
          <button 
            onClick={() => router.push("/volunteer")}
            className="px-6 py-2 bg-white/70 text-gray-600 font-medium rounded-lg hover:bg-white transition-colors"
          >
            Volunteer Events
          </button>
        </div>

        {/* Search Bar */}
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
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
              filter === 'all' 
                ? 'bg-teal-500 text-white border-teal-500' 
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            All Campaigns ({eventCounts.all})
          </button>
          
          <button
            onClick={() => setFilter('active')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
              filter === 'active' 
                ? 'bg-teal-500 text-white border-teal-500' 
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Active ({eventCounts.active})
          </button>
          
          <button
            onClick={() => setFilter('completed')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm ${
              filter === 'completed' 
                ? 'bg-teal-500 text-white border-teal-500' 
                : 'bg-white text-gray-700 border-gray-200'
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
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading campaigns...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-10 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">
                {filter === 'active' ? '📈' : filter === 'completed' ? '✅' : '💝'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {events.length === 0 ? 'No Campaigns Available' : 
                 filter === 'active' ? 'No Active Campaigns' : 
                 filter === 'completed' ? 'No Completed Campaigns' : 
                 'No Matching Campaigns'}
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
          /* Events Grid */
          <div>
            <div className="grid gap-5 lg:grid-cols-2 w-full">
              {filteredEvents.map((event: DonationEvent) => {
                  const progressPercentage = Math.min((event.collectedAmount / event.goalAmount) * 100, 100);
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
                      className={`group transition-all duration-300 ${
                        highlightedDonationId === event._id 
                          ? 'ring-4 ring-teal-500 ring-offset-2 rounded-2xl shadow-2xl' 
                          : ''
                      }`}
                    >
                      <Card className="border-2 border-teal-100 hover:border-cyan-300 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white rounded-2xl shadow-lg transform hover:-translate-y-1">
                        <CardHeader className="pb-4 relative bg-gradient-to-br from-teal-50 via-cyan-50 to-white">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                            <div className="flex-1 pr-8">
                              <CardTitle className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors duration-300">
                                💝 <HighlightText text={event.title} highlight={searchQuery} />
                              </CardTitle>
                            <CardDescription className="text-slate-600 font-medium">
                              <HighlightText text={event.ngo?.name || "Community NGO"} highlight={searchQuery} /> • {event.ngo?.email || "Supporting local causes"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={isCompleted ? "default" : "secondary"} 
                              className={`px-3 py-1.5 text-xs font-bold backdrop-blur-sm shadow-md ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300' 
                                  : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-teal-300'
                              }`}
                            >
                              {isCompleted ? '✓ Goal Achieved' : `🎯 ${event.status}`}
                            </Badge>
                            <button
                              onClick={(e) => handleShare(event, e)}
                              className="p-2 hover:bg-teal-100 rounded-full transition-all duration-200 hover:scale-110"
                              title="Share donation event"
                            >
                              <Share2 className="w-4 h-4 text-teal-600" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-slate-700 text-sm leading-relaxed mt-2">
                          <HighlightText text={event.description || ''} highlight={searchQuery} />
                        </p>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Progress Section */}
                        <div className="mb-6 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border-2 border-teal-200">
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-slate-700 font-bold flex items-center gap-2">
                              <span className="text-lg">💰</span> Funding Progress
                            </span>
                            <span className="font-bold text-teal-600">
                              {formatCurrency(event.collectedAmount)} / {formatCurrency(event.goalAmount)}
                            </span>
                          </div>
                          <div className={`w-full h-4 rounded-full ${isCompleted ? 'bg-green-200' : 'bg-teal-200'} overflow-hidden shadow-inner border border-teal-300`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-500 shadow-md ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                  : 'bg-gradient-to-r from-teal-500 to-cyan-600'
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-teal-700 mt-2">
                            <span>✓ {progressPercentage.toFixed(1)}% funded</span>
                            <span>🎯 {Math.max(0, (100 - progressPercentage)).toFixed(1)}% to go</span>
                          </div>
                        </div>

                        {/* Donation Actions */}
                        <div className="space-y-4">
                          {/* View Details Button */}
                          <div className="flex justify-center mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-12 font-bold text-teal-600 border-2 border-teal-300 hover:border-cyan-400 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-cyan-700 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transform"
                              onClick={() => window.location.href = `/donate/${event._id}`}
                            >
                              📋 View Full Details & Organization Info
                            </Button>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-lg">⚡</span>
                              Quick Donate
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {quickAmounts.map((amount) => (
                                <Button
                                  key={amount}
                                  variant="outline"
                                  size="sm"
                                  className={`h-12 font-bold transition-all duration-300 border-2 rounded-xl shadow-md ${
                                    isCompleted 
                                      ? 'cursor-not-allowed opacity-50 border-gray-200' 
                                      : 'border-teal-200 hover:border-cyan-300 hover:bg-gradient-to-r hover:from-teal-400 hover:to-cyan-500 hover:text-white hover:shadow-lg hover:scale-105 transform'
                                  }`}
                                  onClick={() => handleDonateClick(event._id, amount)}
                                  disabled={isCompleted}
                                >
                                  {formatCurrency(amount)}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-lg">✨</span>
                              Custom Amount
                            </h4>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-600 font-bold text-lg">₹</span>
                                <Input
                                  type="number"
                                  placeholder="Enter custom amount"
                                  value={customAmounts[event._id] || ""}
                                  onChange={(e) =>
                                    setCustomAmounts({ ...customAmounts, [event._id]: e.target.value })
                                  }
                                  className="pl-8 h-12 bg-white border-2 border-teal-300 focus:border-cyan-400 rounded-xl shadow-inner font-semibold"
                                  disabled={isCompleted}
                                />
                              </div>
                              <Button
                                className="h-12 px-6 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform rounded-xl"
                                disabled={!customAmounts[event._id] || Number(customAmounts[event._id]) <= 0 || isCompleted}
                                onClick={() => handleCustomDonate(event._id)}
                              >
                                💝 Donate Now
                              </Button>
                            </div>
                          </div>
                        </div>

                        {isCompleted && (
                          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                            <p className="text-green-700 text-sm text-center font-semibold">
                              🎉 Amazing! This campaign has reached its funding goal!
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    </div>
                  );
                })}
            </div>

            {/* Footer Note */}
            {filteredEvents.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  {filter === 'active' 
                    ? `Showing ${filteredEvents.length} active campaign${filteredEvents.length !== 1 ? 's' : ''}`
                    : filter === 'completed'
                    ? `Showing ${filteredEvents.length} completed campaign${filteredEvents.length !== 1 ? 's' : ''}`
                    : `Showing ${filteredEvents.length} campaign${filteredEvents.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function DonatePageLoading() {
  return (
    <>
      <Header />
      <div className="min-h-screen py-6" style={{ backgroundColor: '#E8F5F5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading donation campaigns...</p>
          </div>
        </div>
      </div>
    </>
  );
}

// Main component with Suspense boundary
export default function DonatePage() {
  return (
    <Suspense fallback={<DonatePageLoading />}>
      <DonatePageContent />
    </Suspense>
  );
}