"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
import { Share2 } from "lucide-react";
import { toast } from "react-toastify";
import { toast as shadToast } from "@/hooks/use-toast";
import { useDonationEvent, DonationEvent } from "@/contexts/donationevents-context";

export default function DonatePage() {
  const searchParams = useSearchParams();
  const { events, fetchEvents, loading, handleRazorpayPayment } = useDonationEvent();
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [highlightedDonationId, setHighlightedDonationId] = useState<string | null>(null);
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

  // Filter events based on selected filter
  const filteredEvents = events.filter((event: DonationEvent) => {
    const isCompleted = event.collectedAmount >= event.goalAmount;
    switch (filter) {
      case "active":
        return !isCompleted;
      case "completed":
        return isCompleted;
      default:
        return true;
    }
  });

  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 relative overflow-hidden">
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
      
      <Header />
      <main className="container mx-auto px-4 pb-24 max-w-7xl relative z-10">
        <div className="pt-6 pb-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-2xl">💝</span>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">
                  Support Meaningful Causes
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Your contribution can make a real difference
                </p>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-200">
              <div className="flex gap-1">
                {[
                  { value: "all", label: "All Campaigns", gradient: "from-teal-400 to-cyan-500" },
                  { value: "active", label: "Active", gradient: "from-blue-500 to-indigo-500" },
                  { value: "completed", label: "Completed", gradient: "from-green-500 to-emerald-500" }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={filter === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(option.value as any)}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                      filter === option.value
                        ? `bg-gradient-to-r ${option.gradient} text-white shadow-md`
                        : "text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2 w-full">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event: DonationEvent) => {
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
                          ? 'ring-4 ring-pink-500 ring-offset-2 rounded-2xl shadow-2xl' 
                          : ''
                      }`}
                    >
                      <Card className="border-2 border-pink-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white rounded-2xl shadow-lg transform hover:-translate-y-1">
                        <CardHeader className="pb-4 relative bg-gradient-to-br from-pink-50 via-purple-50 to-white">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                            <div className="flex-1 pr-8">
                              <CardTitle className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors duration-300">
                                💝 {event.title}
                              </CardTitle>
                            <CardDescription className="text-slate-600 font-medium">
                              {event.ngo?.name || "Community NGO"} • {event.ngo?.email || "Supporting local causes"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={isCompleted ? "default" : "secondary"} 
                              className={`px-3 py-1.5 text-xs font-bold backdrop-blur-sm shadow-md ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300' 
                                  : 'bg-gradient-to-r from-pink-400 to-purple-500 text-white border-purple-300'
                              }`}
                            >
                              {isCompleted ? '✓ Goal Achieved' : `🎯 ${event.status}`}
                            </Badge>
                            <button
                              onClick={(e) => handleShare(event, e)}
                              className="p-2 hover:bg-pink-100 rounded-full transition-all duration-200 hover:scale-110"
                              title="Share donation event"
                            >
                              <Share2 className="w-4 h-4 text-pink-600" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-slate-700 text-sm leading-relaxed mt-2">
                          {event.description}
                        </p>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Progress Section */}
                        <div className="mb-6 bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl border-2 border-pink-200">
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-slate-700 font-bold flex items-center gap-2">
                              <span className="text-lg">💰</span> Funding Progress
                            </span>
                            <span className="font-bold text-pink-600">
                              {formatCurrency(event.collectedAmount)} / {formatCurrency(event.goalAmount)}
                            </span>
                          </div>
                          <div className={`w-full h-4 rounded-full ${isCompleted ? 'bg-green-200' : 'bg-pink-200'} overflow-hidden shadow-inner border border-pink-300`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-500 shadow-md ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                  : 'bg-gradient-to-r from-pink-500 to-purple-600'
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-pink-700 mt-2">
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
                              className="w-full h-12 font-bold text-pink-600 border-2 border-pink-300 hover:border-purple-400 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:text-purple-700 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transform"
                              onClick={() => window.location.href = `/donate/${event._id}`}
                            >
                              📋 View Full Details & Organization Info
                            </Button>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg">⚡</span>
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
                                      : 'border-pink-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-pink-400 hover:to-purple-500 hover:text-white hover:shadow-lg hover:scale-105 transform'
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
                              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-lg">✨</span>
                              Custom Amount
                            </h4>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-600 font-bold text-lg">₹</span>
                                <Input
                                  type="number"
                                  placeholder="Enter custom amount"
                                  value={customAmounts[event._id] || ""}
                                  onChange={(e) =>
                                    setCustomAmounts({ ...customAmounts, [event._id]: e.target.value })
                                  }
                                  className="pl-8 h-12 bg-white border-2 border-pink-300 focus:border-purple-400 rounded-xl shadow-inner font-semibold"
                                  disabled={isCompleted}
                                />
                              </div>
                              <Button
                                className="h-12 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform rounded-xl"
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
                })
              ) : (
                // No Events Available Message
                <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-10 max-w-md">
                    <div className="text-gray-400 text-6xl mb-4">
                      💝
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {events.length === 0 ? "No Campaigns Available" : "No Campaigns Match Your Filter"}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {events.length === 0 
                        ? "There are currently no donation campaigns available. Check back soon for new opportunities!"
                        : "No campaigns match your current filter selection. Try changing the filter to see more options."
                      }
                    </p>
                    {events.length > 0 && filter !== "all" && (
                      <Button
                        onClick={() => setFilter("all")}
                        className="mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                      >
                        View All Campaigns
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}