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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="container mx-auto px-4 pb-24 max-w-8xl">
        <div className="pt-8 pb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Support Meaningful Causes
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Your contribution can make a real difference. Choose a cause and make an impact today.
            </p>
          </div>

          {/* Filter Section */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <div className="flex space-x-1">
                {[
                  { value: "all", label: "All Campaigns" },
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Completed" }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={filter === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(option.value as any)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      filter === option.value
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 w-full md:gap-8">
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
                      className={`transition-all duration-300 ${
                        highlightedDonationId === event._id 
                          ? 'ring-4 ring-blue-500 ring-offset-2 rounded-xl shadow-2xl' 
                          : ''
                      }`}
                    >
                      <Card className="border-0 hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                        <div className={`absolute top-0 left-0 w-1 h-full ${
                          isCompleted ? 'bg-green-500' : 'bg-gradient-to-b from-blue-500 to-purple-500'
                        }`} />
                        
                        <CardHeader className="pb-4 relative">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                            <div className="flex-1 pr-8">
                              <CardTitle className="text-xl font-semibold text-slate-800 mb-2 line-clamp-2">
                                {event.title}
                              </CardTitle>
                            <CardDescription className="text-slate-600">
                              {event.ngo?.name || "Community NGO"} • {event.ngo?.email || "Supporting local causes"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={isCompleted ? "default" : "secondary"} 
                              className={`px-3 py-1 text-sm ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}
                            >
                              {isCompleted ? 'Goal Achieved' : event.status}
                            </Badge>
                            <button
                              onClick={(e) => handleShare(event, e)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Share donation event"
                            >
                              <Share2 className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-slate-700 text-sm leading-relaxed mt-2">
                          {event.description}
                        </p>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Progress Section */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-slate-600 font-medium">Funding Progress</span>
                            <span className="font-semibold text-slate-800">
                              {formatCurrency(event.collectedAmount)} / {formatCurrency(event.goalAmount)}
                            </span>
                          </div>
                          <div className={`w-full h-3 rounded-full ${isCompleted ? 'bg-green-200' : 'bg-slate-200'} overflow-hidden`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted 
                                  ? 'bg-green-500' 
                                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>{progressPercentage.toFixed(1)}% funded</span>
                            <span>{Math.max(0, (100 - progressPercentage)).toFixed(1)}% to go</span>
                          </div>
                        </div>

                        {/* Donation Actions */}
                        <div className="space-y-4">
                          {/* View Details Button */}
                          <div className="flex justify-center mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-10 font-medium text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                              onClick={() => window.location.href = `/donate/${event._id}`}
                            >
                              📋 View Full Details & Organization Info
                            </Button>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Donate</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {quickAmounts.map((amount) => (
                                <Button
                                  key={amount}
                                  variant="outline"
                                  size="sm"
                                  className={`h-12 font-medium transition-all duration-200 ${
                                    isCompleted 
                                      ? 'cursor-not-allowed opacity-50' 
                                      : 'hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
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
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Custom Amount</h4>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">₹</span>
                                <Input
                                  type="number"
                                  placeholder="Enter custom amount"
                                  value={customAmounts[event._id] || ""}
                                  onChange={(e) =>
                                    setCustomAmounts({ ...customAmounts, [event._id]: e.target.value })
                                  }
                                  className="pl-8 h-12 bg-white border-slate-300 focus:border-blue-400"
                                  disabled={isCompleted}
                                />
                              </div>
                              <Button
                                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-md transition-all duration-200"
                                disabled={!customAmounts[event._id] || Number(customAmounts[event._id]) <= 0 || isCompleted}
                                onClick={() => handleCustomDonate(event._id)}
                              >
                                Donate Now
                              </Button>
                            </div>
                          </div>
                        </div>

                        {isCompleted && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm text-center font-medium">
                              🎉 Thank you! This campaign has reached its funding goal.
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
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg 
                      className="w-12 h-12 text-slate-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    {events.length === 0 ? "No Campaigns Available" : "No Campaigns Match Your Filter"}
                  </h3>
                  <p className="text-slate-500 max-w-md">
                    {events.length === 0 
                      ? "There are currently no donation campaigns available. Please check back later for new opportunities to make a difference."
                      : "No campaigns match your current filter selection. Try changing the filter to see more options."
                    }
                  </p>
                  {events.length > 0 && filter !== "all" && (
                    <Button
                      onClick={() => setFilter("all")}
                      className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      View All Campaigns
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}