"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Calendar,
  MapPin,
  Check,
  X,
  Clock,
  Eye,
  Briefcase,
  Users,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Building,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface CorporateInterest {
  _id: string;
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
    city?: string;
    category?: string;
    image?: string | { url?: string; caption?: string; publicId?: string };
  };
  corporateUser: {
    _id: string;
    name: string;
    email: string;
    companyType?: string;
    industrySector?: string;
    companySize?: string;
    contactNumber?: string;
    avatar?: string;
  };
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export default function CorporateInterestsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [interests, setInterests] = useState<CorporateInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInterest, setExpandedInterest] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchInterests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/v1/corporate-interest/ngo-interests");
      const data = response.data as { interests?: CorporateInterest[] };
      setInterests(data.interests || []);
    } catch (err: any) {
      console.error("Error fetching corporate interests:", err);
      setError(err.response?.data?.message || "Failed to load interests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "ngo") {
        toast.error("Only NGO users can access this page");
        router.push("/");
        return;
      }
      fetchInterests();
    }
  }, [authLoading, user, router, fetchInterests]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInterests();
    setRefreshing(false);
    toast.success("Refreshed successfully");
  };

  const handleRespond = async (interestId: string, status: "accepted" | "rejected") => {
    setRespondingTo(interestId);
    try {
      await api.put(`/v1/corporate-interest/respond/${interestId}`, { status });
      
      setInterests(prev =>
        prev.map(interest =>
          interest._id === interestId ? { ...interest, status } : interest
        )
      );
      
      toast.success(`Interest ${status === "accepted" ? "accepted" : "rejected"} successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${status} interest`);
    } finally {
      setRespondingTo(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredInterests = interests.filter(interest => {
    const matchesFilter = filter === "all" || interest.status === filter;
    const matchesSearch = searchQuery === "" || 
      interest.corporateUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interest.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interest.corporateUser.email && interest.corporateUser.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = interests.filter(i => i.status === "pending").length;
  const acceptedCount = interests.filter(i => i.status === "accepted").length;
  const rejectedCount = interests.filter(i => i.status === "rejected").length;

  const getStatusBadge = (status: string, size: "sm" | "md" = "sm") => {
    const sizeClasses = size === "md" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs";
    switch (status) {
      case "pending":
        return (
          <span className={`${sizeClasses} bg-yellow-100 text-yellow-700 rounded-full font-medium flex items-center gap-1`}>
            <Clock className={size === "md" ? "w-4 h-4" : "w-3 h-3"} />
            Pending
          </span>
        );
      case "accepted":
        return (
          <span className={`${sizeClasses} bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1`}>
            <Check className={size === "md" ? "w-4 h-4" : "w-3 h-3"} />
            Accepted
          </span>
        );
      case "rejected":
        return (
          <span className={`${sizeClasses} bg-red-100 text-red-700 rounded-full font-medium flex items-center gap-1`}>
            <X className={size === "md" ? "w-4 h-4" : "w-3 h-3"} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getImageUrl = (image: CorporateInterest["event"]["image"]) => {
    if (!image) return null;
    if (typeof image === "string") return image;
    return image.url || null;
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#39c2ba] mx-auto mb-4" />
          <p className="text-[#173043]/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#173043] to-[#1e3a4f] text-white">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#39c2ba] rounded-xl p-3">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold">Corporate Interests</h1>
              </div>
              <p className="text-white/70 max-w-xl">
                Manage interest requests from corporate organizations for your events. Review, accept, or decline partnership opportunities.
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors self-start"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/60 text-sm">Total Interests</p>
              <p className="text-3xl font-bold mt-1">{interests.length}</p>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/60 text-sm">Pending</p>
              <p className="text-3xl font-bold mt-1">{pendingCount}</p>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/60 text-sm">Accepted</p>
              <p className="text-3xl font-bold mt-1">{acceptedCount}</p>
            </div>
            <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/60 text-sm">Rejected</p>
              <p className="text-3xl font-bold mt-1">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by organization name, email, or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#39c2ba] focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "All", count: interests.length },
                { key: "pending", label: "Pending", count: pendingCount },
                { key: "accepted", label: "Accepted", count: acceptedCount },
                { key: "rejected", label: "Rejected", count: rejectedCount },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? "bg-[#39c2ba] text-white"
                      : "bg-gray-100 text-[#173043]/70 hover:bg-gray-200"
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#39c2ba] mx-auto mb-4" />
            <p className="text-[#173043]/60">Loading interests...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#173043] mb-2">Failed to Load</h3>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchInterests}
              className="px-6 py-2 bg-[#39c2ba] text-white rounded-lg hover:bg-[#2da59e] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredInterests.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-[#f0f9f8] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-[#39c2ba]" />
            </div>
            <h3 className="text-xl font-semibold text-[#173043] mb-2">
              {filter === "all" && searchQuery === "" ? "No Interests Yet" : "No Matching Interests"}
            </h3>
            <p className="text-[#173043]/60 max-w-md mx-auto">
              {filter === "all" && searchQuery === ""
                ? "When corporate organizations express interest in your events, they will appear here."
                : `No interests found matching your ${searchQuery ? "search" : "filter"} criteria.`}
            </p>
            {(filter !== "all" || searchQuery !== "") && (
              <button
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 text-[#39c2ba] hover:bg-[#f0f9f8] rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Interests List */}
        {!loading && !error && filteredInterests.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredInterests.map((interest, index) => (
                <motion.div
                  key={interest._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedInterest(
                        expandedInterest === interest._id ? null : interest._id
                      )
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Corporate Avatar */}
                        <div className="w-14 h-14 bg-gradient-to-br from-[#39c2ba] to-[#2da59e] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          {interest.corporateUser.avatar ? (
                            <img
                              src={interest.corporateUser.avatar}
                              alt={interest.corporateUser.name}
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                          ) : (
                            <Building className="w-7 h-7 text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h4 className="font-semibold text-lg text-[#173043]">
                              {interest.corporateUser.name}
                            </h4>
                            {getStatusBadge(interest.status, "md")}
                          </div>
                          
                          <p className="text-sm text-[#173043]/60 mb-2">
                            Interested in: <span className="font-medium text-[#39c2ba]">{interest.event.title}</span>
                          </p>
                          
                          <div className="flex items-center gap-4 flex-wrap text-sm text-[#173043]/50">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {interest.corporateUser.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDateTime(interest.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {interest.status === "pending" && (
                          <span className="hidden md:flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            Awaiting Response
                          </span>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          {expandedInterest === interest._id ? (
                            <ChevronUp className="w-5 h-5 text-[#173043]/50" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#173043]/50" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedInterest === interest._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100"
                      >
                        <div className="p-5 bg-gradient-to-br from-[#f0f9f8]/50 to-white">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Corporate Details */}
                            <div>
                              <h5 className="text-sm font-semibold text-[#173043] mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#39c2ba]" />
                                Organization Details
                              </h5>
                              <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-[#f0f9f8] rounded-lg flex items-center justify-center">
                                    <Building className="w-4 h-4 text-[#39c2ba]" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#173043]/50">Company Name</p>
                                    <p className="text-sm font-medium text-[#173043]">{interest.corporateUser.name}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-[#f0f9f8] rounded-lg flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-[#39c2ba]" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#173043]/50">Email</p>
                                    <a href={`mailto:${interest.corporateUser.email}`} className="text-sm font-medium text-[#39c2ba] hover:underline">
                                      {interest.corporateUser.email}
                                    </a>
                                  </div>
                                </div>

                                {interest.corporateUser.contactNumber && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#f0f9f8] rounded-lg flex items-center justify-center">
                                      <Phone className="w-4 h-4 text-[#39c2ba]" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#173043]/50">Phone</p>
                                      <p className="text-sm font-medium text-[#173043]">{interest.corporateUser.contactNumber}</p>
                                    </div>
                                  </div>
                                )}

                                {interest.corporateUser.companyType && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#f0f9f8] rounded-lg flex items-center justify-center">
                                      <Briefcase className="w-4 h-4 text-[#39c2ba]" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#173043]/50">Company Type</p>
                                      <p className="text-sm font-medium text-[#173043] capitalize">{interest.corporateUser.companyType.replace(/-/g, ' ')}</p>
                                    </div>
                                  </div>
                                )}

                                {interest.corporateUser.industrySector && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#f0f9f8] rounded-lg flex items-center justify-center">
                                      <Users className="w-4 h-4 text-[#39c2ba]" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#173043]/50">Industry Sector</p>
                                      <p className="text-sm font-medium text-[#173043] capitalize">{interest.corporateUser.industrySector.replace(/-/g, ' ')}</p>
                                    </div>
                                  </div>
                                )}

                                {interest.corporateUser.companySize && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#f0f9f8] rounded-lg flex items-center justify-center">
                                      <Users className="w-4 h-4 text-[#39c2ba]" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#173043]/50">Company Size</p>
                                      <p className="text-sm font-medium text-[#173043]">{interest.corporateUser.companySize}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Event Details */}
                            <div>
                              <h5 className="text-sm font-semibold text-[#173043] mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#39c2ba]" />
                                Event Details
                              </h5>
                              <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                                {getImageUrl(interest.event.image) && (
                                  <div className="h-32 overflow-hidden">
                                    <img
                                      src={getImageUrl(interest.event.image)!}
                                      alt={interest.event.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="p-4 space-y-3">
                                  <h6 className="font-semibold text-[#173043]">{interest.event.title}</h6>
                                  <div className="flex items-center gap-4 flex-wrap text-sm text-[#173043]/60">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4 text-[#39c2ba]" />
                                      {formatDate(interest.event.date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4 text-[#39c2ba]" />
                                      {interest.event.city || interest.event.location}
                                    </span>
                                  </div>
                                  {interest.event.category && (
                                    <span className="inline-block px-2 py-1 bg-[#f5f8c3] rounded-full text-xs font-medium">
                                      {interest.event.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Message */}
                          {interest.message && (
                            <div className="mt-6">
                              <h5 className="text-sm font-semibold text-[#173043] mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#39c2ba]" />
                                Message from Organization
                              </h5>
                              <div className="bg-white rounded-lg border border-gray-100 p-4">
                                <p className="text-sm text-[#173043]/70 leading-relaxed">
                                  {interest.message}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                            {interest.status === "pending" ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRespond(interest._id, "accepted");
                                  }}
                                  disabled={respondingTo === interest._id}
                                  className="flex-1 min-w-[140px] py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                                >
                                  {respondingTo === interest._id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Check className="w-5 h-5" />
                                  )}
                                  Accept Interest
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRespond(interest._id, "rejected");
                                  }}
                                  disabled={respondingTo === interest._id}
                                  className="flex-1 min-w-[140px] py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                                >
                                  {respondingTo === interest._id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <X className="w-5 h-5" />
                                  )}
                                  Reject Interest
                                </button>
                              </>
                            ) : (
                              <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
                                <span className={`text-sm font-medium ${
                                  interest.status === "accepted" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {interest.status === "accepted"
                                    ? "✓ You accepted this interest request"
                                    : "✗ You rejected this interest request"}
                                </span>
                              </div>
                            )}
                            <a
                              href={`/volunteer/${interest.event._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="py-3 px-6 bg-[#173043] text-white rounded-lg hover:bg-[#173043]/90 transition-colors font-medium flex items-center gap-2 shadow-sm"
                            >
                              <Eye className="w-5 h-5" />
                              View Event
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
