'use client'

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useDonationEvent } from "@/contexts/donationevents-context";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Target,
  ArrowLeft,
  Tag,
  Image as ImageIcon,
  Building,
  Globe,
  Phone,
  Mail,
  MapPinIcon,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  Heart,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DonationDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const donationId = params.donationId as string;
  
  const { handleRazorpayPayment } = useDonationEvent();
  const [donationEvent, setDonationEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donating, setDonating] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");

  const quickAmounts = [100, 250, 500, 1000, 2500, 5000];
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  // Fetch single donation event with NGO details
  const fetchDonationDetails = async () => {
    if (!donationId) return;
    
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching donation details for:', donationId);
      
      const response = await api.get(`/v1/donation-event/${donationId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });

      const responseData = response.data as any;
      if (responseData.success && responseData.event) {
        setDonationEvent(responseData.event);
      } else {
        throw new Error("Donation event not found");
      }
    } catch (err: any) {
      console.error('Error fetching donation event:', err);
      const errorMessage = err.response?.data?.message || "Failed to fetch donation event details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonationDetails();
  }, [donationId]);

  const handleQuickDonate = async (amount: number) => {
    if (!donationEvent?._id) return;
    
    setDonating(true);
    try {
      await handleRazorpayPayment(donationEvent._id, amount);
      // Refresh donation details to get updated amounts
      setTimeout(() => fetchDonationDetails(), 1000);
    } catch (err) {
      console.error("Donation failed:", err);
    } finally {
      setDonating(false);
    }
  };

  const handleCustomDonate = async () => {
    if (!donationEvent?._id || !customAmount) return;
    
    const amount = Number(customAmount);
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setDonating(true);
    try {
      await handleRazorpayPayment(donationEvent._id, amount);
      setCustomAmount("");
      // Refresh donation details to get updated amounts
      setTimeout(() => fetchDonationDetails(), 1000);
    } catch (err) {
      console.error("Donation failed:", err);
    } finally {
      setDonating(false);
    }
  };

  const getProgressPercentage = () => {
    if (!donationEvent) return 0;
    return Math.min(100, Math.round((donationEvent.collectedAmount / donationEvent.goalAmount) * 100));
  };

  const getRemainingAmount = () => {
    if (!donationEvent) return 0;
    return Math.max(0, donationEvent.goalAmount - donationEvent.collectedAmount);
  };

  const isDonationCompleted = () => {
    return donationEvent && donationEvent.collectedAmount >= donationEvent.goalAmount;
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
            <p className="text-gray-600 text-lg font-semibold">Loading donation details...</p>
            <p className="text-gray-400 text-sm mt-2">Finding ways to make a difference! 💝</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !donationEvent) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-white to-[#7DD9A6] flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white border border-red-200 rounded-xl shadow-md p-8 max-w-md">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h2 className="text-red-800 text-xl font-bold mb-2">
                {error ? "Error" : "Donation Event Not Found"}
              </h2>
              <p className="text-red-600 mb-4 text-sm">
                {error || "The donation event you're looking for could not be found."}
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
  const remainingAmount = getRemainingAmount();
  const isCompleted = isDonationCompleted();

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
                  <span>Back to Donations</span>
                </button>
              </div>
              <div className="text-center flex-1">
                <h1 className="text-xl font-semibold text-gray-700">Donation Campaign</h1>
                <p className="text-sm text-gray-600 mt-1">Support this cause and make an impact</p>
              </div>
              <div className="flex-1"></div>
            </div>
          </div>
        </div>

        {/* Cover Image - Full Width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          {donationEvent.coverImage ? (
            <div className="h-64 md:h-96 relative rounded-xl overflow-hidden shadow-lg">
              <img 
                src={donationEvent.coverImage} 
                alt={donationEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 md:p-8 text-white w-full">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{donationEvent.title}</h1>
                  <p className="text-white/90 flex items-center text-base md:text-lg">
                    <Building className="h-5 w-5 mr-2" />
                    {donationEvent.ngoId?.name || "NGO"}
                  </p>
                  {/* Completion Status */}
                  {isCompleted && (
                    <div className="mt-4 inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Goal Achieved! Thank you for your support.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#E8F5A5] to-[#7DD9A6] h-64 md:h-96 flex items-center justify-center rounded-xl shadow-lg">
              <div className="text-center text-gray-800">
                <Heart className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 opacity-80" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{donationEvent.title}</h1>
                <p className="text-gray-700 text-base md:text-lg">{donationEvent.ngoId?.name || "NGO"}</p>
                {/* Completion Status */}
                {isCompleted && (
                  <div className="mt-4 inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Goal Achieved! Thank you for your support.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Campaign Details */}
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Campaign Details</h2>
                <p className="text-sm text-gray-600 mt-1">Learn more about this fundraising campaign</p>
              </div>
              {/* Short Description */}
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">Campaign Tagline</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {donationEvent.shortDescription || donationEvent.description || "No description available for this donation campaign."}
                </p>
              </div>

              {/* Why We're Raising Funds */}
              {donationEvent.whyRaising && (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                      <span className="text-white text-lg">�</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Why We're Raising Funds</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                    {donationEvent.whyRaising}
                  </p>
                </div>
              )}

              {/* Who Will Benefit */}
              {donationEvent.whoBenefits && (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                      <span className="text-white text-lg">👥</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Who Will Benefit</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                    {donationEvent.whoBenefits}
                  </p>
                </div>
              )}

              {/* How Funds Will Be Used */}
              {donationEvent.howFundsUsed && (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                      <span className="text-white text-lg">💰</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">How Funds Will Be Used</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                    {donationEvent.howFundsUsed}
                  </p>
                </div>
              )}

              {/* Supporting Media */}
                            {/* Supporting Media Gallery */}
              {donationEvent.supportingMedia && donationEvent.supportingMedia.length > 0 && (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                      <span className="text-white text-lg">📸</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Supporting Media</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {donationEvent.supportingMedia.map((media: string, index: number) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-[#D4E7B8] hover:border-[#7DD9A6] transition-all">
                        <img
                          src={media}
                          alt={`Supporting media ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Score & Verification */}
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">Trust & Verification</h3>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Trust Score</span>
                  <span className="text-lg font-bold text-[#7DD9A6]">
                    {donationEvent.trustScore !== undefined && donationEvent.trustScore !== null 
                      ? `${donationEvent.trustScore}%` 
                      : 'N/A'}
                  </span>
                </div>
                {donationEvent.trustScore !== undefined && donationEvent.trustScore !== null && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-3">
                    <div
                      className={`h-2 transition-all duration-500 ${
                        donationEvent.trustScore >= 80 ? "bg-gradient-to-r from-[#7DD9A6] to-[#6BC794]" : 
                        donationEvent.trustScore >= 50 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : "bg-gradient-to-r from-red-400 to-red-500"
                      }`}
                      style={{ width: `${donationEvent.trustScore}%` }}
                    ></div>
                  </div>
                )}
                <div className="space-y-2">
                  {donationEvent.governmentId && (
                    <div className="flex items-center text-green-700 text-xs p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-3 w-3 mr-2" />
                      Government ID Verified
                    </div>
                  )}
                  {donationEvent.proofOfNeed && (
                    <div className="flex items-center text-green-700 text-xs p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-3 w-3 mr-2" />
                      Proof of Need Submitted
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Information */}
              {(donationEvent.location || donationEvent.category || donationEvent.minimumDonation) && (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Campaign Information</h3>
                  </div>
                  <div className="space-y-2">
                    {donationEvent.category && (
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                        <span className="text-xs text-gray-600 flex items-center">
                          <Tag className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                          Category
                        </span>
                        <span className="text-xs font-medium text-gray-900 capitalize">
                          {donationEvent.category}
                        </span>
                      </div>
                    )}
                    {donationEvent.location && (
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                        <span className="text-xs text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                          Location
                        </span>
                        <span className="text-xs font-medium text-gray-900">
                          {donationEvent.location}
                        </span>
                      </div>
                    )}
                    {donationEvent.minimumDonation && (
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-xs text-gray-600 flex items-center">
                          <IndianRupee className="h-3 w-3 mr-1.5 text-[#7DD9A6]" />
                          Minimum Donation
                        </span>
                        <span className="text-xs font-medium text-gray-900">
                          ₹{donationEvent.minimumDonation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Donation Actions & Info */}
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Support This Campaign</h2>
                <p className="text-sm text-gray-600 mt-1">Make a difference today</p>
              </div>

              {/* NGO Information */}
              {donationEvent.ngoId && typeof donationEvent.ngoId === 'object' && (
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
                          {donationEvent.ngoId.name}
                        </p>
                      </div>
                    </div>

                    {donationEvent.ngoId.organizationType && (
                      <div className="flex items-start space-x-2">
                        <Tag className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">Organization Type</p>
                          <p className="text-xs text-gray-600 capitalize">
                            {donationEvent.ngoId.organizationType.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {donationEvent.ngoId.yearEstablished && (
                      <div className="flex items-start space-x-2">
                        <Calendar className="h-4 w-4 text-[#7DD9A6] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">Established</p>
                          <p className="text-xs text-gray-600">
                            {donationEvent.ngoId.yearEstablished}
                          </p>
                        </div>
                      </div>
                    )}

                    {donationEvent.ngoId.focusAreas && donationEvent.ngoId.focusAreas.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-900 mb-2">Focus Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {donationEvent.ngoId.focusAreas.slice(0, 3).map((area: string, index: number) => (
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

              {/* Campaign Progress */}
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">Donation Progress</h3>
                </div>
                
                {/* Progress Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <IndianRupee className="h-3 w-3 text-[#7DD9A6] mr-1" />
                      <span className="text-xs font-semibold">
                        ₹{donationEvent.collectedAmount.toLocaleString()} of ₹{donationEvent.goalAmount.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#6BC794]">{progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-[#7DD9A6] to-[#6BC794]"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Remaining Amount */}
                  {!isCompleted && (
                    <div className="text-center bg-[#E8F5A5]/30 px-3 py-2 rounded-lg border border-[#D4E7B8]">
                      <p className="text-xs text-gray-700 font-semibold">
                        🎯 <span className="text-[#6BC794]">₹{remainingAmount.toLocaleString()}</span> more needed
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Donation Actions */}
              {!isCompleted ? (
                <div className="border-2 border-[#D4E7B8] rounded-lg p-5 space-y-4">
                  {/* Quick Amount Buttons */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center text-white text-sm">⚡</span>
                      Quick Donate
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {quickAmounts.slice(0, 4).map((amount) => (
                        <Button
                          key={amount}
                          onClick={() => handleQuickDonate(amount)}
                          disabled={donating}
                          variant="outline"
                          className="text-xs font-semibold py-2 px-2 border-2 border-[#D4E7B8] hover:border-[#7DD9A6] hover:bg-gradient-to-r hover:from-[#7DD9A6] hover:to-[#6BC794] hover:text-white transition-all duration-300 rounded-lg"
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center text-white text-sm">✨</span>
                        Custom Amount
                      </h4>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6BC794] font-semibold text-sm">₹</span>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-7 text-center font-semibold text-sm border-2 border-[#D4E7B8] focus:border-[#7DD9A6] rounded-lg h-10"
                        />
                      </div>
                      <Button
                        onClick={handleCustomDonate}
                        disabled={donating || !customAmount}
                        className="w-full bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] hover:from-[#6BC794] hover:to-[#5AB583] text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                      >
                        {donating ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Heart className="h-4 w-4 mr-2" />
                            Donate Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-green-900 mb-1 text-sm">🎉 Goal Achieved!</h4>
                      <p className="text-xs text-green-700">
                        Thank you for your support!
                      </p>
                    </div>
                  </div>
                )}

              {/* Campaign Timeline */}
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Campaign Timeline</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Start Date</span>
                    <span className="text-xs font-medium text-gray-900">
                      {new Date(donationEvent.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-xs text-gray-600">End Date</span>
                    <span className="text-xs font-medium text-gray-900">
                      {new Date(donationEvent.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-gray-600">Duration</span>
                    <span className="text-xs font-medium text-gray-900">
                      {Math.ceil((new Date(donationEvent.endDate).getTime() - new Date(donationEvent.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign Status */}
              <div className="border-2 border-[#D4E7B8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] flex items-center justify-center">
                    <span className="text-white text-sm">ℹ️</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Campaign Status</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      donationEvent.status === 'completed' ? 'bg-green-100 text-green-700' :
                      donationEvent.status === 'active' ? 'bg-[#E8F5A5] text-gray-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {donationEvent.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonationDetailsPage;