"use client";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Users, 
  Target,
  Eye,
  Briefcase,
  ArrowLeft,
  Search,
  Heart,
  X,
  Check,
  Loader2
} from "lucide-react";

interface CorporateEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  city: string;
  category: string;
  volunteersNeeded: number;
  image?: string | { url?: string; caption?: string; publicId?: string };
  corporatePartner?: string;
  csrObjectives?: string[];
  status: string;
  organizationId?: {
    _id: string;
    name: string;
    organizationType?: string;
    email?: string;
  };
}

const CorporateEventsPage = () => {
  const router = useRouter();
  const eventsRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<CorporateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [interestStates, setInterestStates] = useState<Record<string, 'none' | 'loading' | 'sent'>>({});
  const [selectedEvent, setSelectedEvent] = useState<CorporateEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCorporateEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get("/v1/event/approved-corporate");
        const corporateEvents = (response.data as { events?: CorporateEvent[] })?.events || [];
        setEvents(corporateEvents);
        
        // Check interest status for each event
        const interestPromises = corporateEvents.map(async (event) => {
          try {
            const res = await api.get(`/v1/corporate-interest/check/${event._id}`);
            const data = res.data as { hasInterest?: boolean };
            return { eventId: event._id, hasInterest: data.hasInterest };
          } catch {
            return { eventId: event._id, hasInterest: false };
          }
        });
        
        const interestResults = await Promise.all(interestPromises);
        const newInterestStates: Record<string, 'none' | 'loading' | 'sent'> = {};
        interestResults.forEach(({ eventId, hasInterest }) => {
          newInterestStates[eventId] = hasInterest ? 'sent' : 'none';
        });
        setInterestStates(newInterestStates);
      } catch (err: any) {
        console.error("Error fetching corporate events:", err);
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchCorporateEvents();
  }, []);

  // Auto-scroll to top of page after data loads
  useEffect(() => {
    if (!loading) {
      // Use window.scrollTo to scroll to the top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  const categories = ["All", ...new Set(events.map((event) => event.category).filter(Boolean))];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleExpressInterest = async (eventId: string) => {
    if (interestStates[eventId] === 'sent') {
      toast.info("You have already expressed interest in this event");
      return;
    }
    
    setInterestStates(prev => ({ ...prev, [eventId]: 'loading' }));
    
    try {
      await api.post(`/v1/corporate-interest/express-interest/${eventId}`);
      setInterestStates(prev => ({ ...prev, [eventId]: 'sent' }));
      toast.success("Interest sent successfully! The NGO will be notified.");
    } catch (err: any) {
      setInterestStates(prev => ({ ...prev, [eventId]: 'none' }));
      toast.error(err.response?.data?.message || "Failed to express interest");
    }
  };

  const handleViewDetails = (event: CorporateEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const getImageUrl = (image: string | { url?: string; caption?: string; publicId?: string } | undefined) => {
    if (!image) return null;
    // Handle object format with url property
    if (typeof image === 'object' && image.url) {
      return image.url;
    }
    // Handle string format
    if (typeof image === 'string') {
      if (image.startsWith("http")) return image;
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
      return `${baseUrl}/${image}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f9f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#39c2ba] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#173043] text-lg">Loading corporate events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f9f8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg max-w-md">
          <Building2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#173043] mb-2">Unable to Load Events</h2>
          <p className="text-[#173043]/70 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#39c2ba] text-white rounded-lg hover:bg-[#2da59e] transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={eventsRef} className="min-h-screen bg-[#f0f9f8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#173043] hover:text-[#39c2ba] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#39c2ba] rounded-xl p-3 shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#173043]">Corporate Events</h1>
                <p className="text-[#173043]/70 text-sm">
                  Explore CSR opportunities
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg px-4 py-2 shadow-md">
              <div className="text-xl font-bold text-[#39c2ba]">{events.length}</div>
              <div className="text-xs text-[#173043]/60">Events</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#173043]/40" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#39c2ba]/20 rounded-lg focus:ring-2 focus:ring-[#39c2ba] focus:border-[#39c2ba] bg-[#f0f9f8]/50 text-[#173043] text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-[#39c2ba]/20 rounded-lg focus:ring-2 focus:ring-[#39c2ba] bg-[#f0f9f8]/50 text-[#173043] text-sm min-w-[120px]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="px-3 py-2 bg-[#173043]/5 hover:bg-[#173043]/10 text-[#173043] rounded-lg transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Building2 className="w-16 h-16 text-[#39c2ba]/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#173043] mb-2">No Events Found</h3>
            <p className="text-[#173043]/70 mb-4 max-w-md mx-auto text-sm">
              {events.length === 0
                ? "No corporate events are currently available."
                : "No events match your filters."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-4 py-2 bg-[#39c2ba] text-white rounded-lg hover:bg-[#2da59e] transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleViewDetails(event)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                {/* Event Image - Smaller */}
                <div className="relative h-32 w-full bg-gradient-to-br from-[#39c2ba]/20 to-[#8ce27a]/20">
                  {getImageUrl(event.image) ? (
                    <img
                      src={getImageUrl(event.image)!}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`${getImageUrl(event.image) ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
                    <Building2 className="w-10 h-10 text-[#39c2ba]/40" />
                  </div>
                  {event.category && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#f5f8c3] rounded-full text-[10px] font-medium text-[#173043]">
                      {event.category}
                    </div>
                  )}
                </div>

                {/* Event Details - Compact */}
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-semibold text-[#173043] line-clamp-1">{event.title}</h3>
                  
                  {event.organizationId && (
                    <div className="flex items-center gap-1.5 text-xs text-[#173043]/70">
                      <Building2 className="w-3 h-3 text-[#39c2ba]" />
                      <span className="line-clamp-1">{event.organizationId.name}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 text-[10px] text-[#173043]/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[80px]">{event.city || event.location}</span>
                    </div>
                  </div>

                  {/* Two Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleExpressInterest(event._id); }}
                      disabled={interestStates[event._id] === 'loading' || interestStates[event._id] === 'sent'}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                        interestStates[event._id] === 'sent'
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : interestStates[event._id] === 'loading'
                          ? 'bg-gray-100 text-gray-500 cursor-wait'
                          : 'bg-[#f5f8c3] text-[#173043] hover:bg-[#e8eb8a]'
                      }`}
                    >
                      {interestStates[event._id] === 'loading' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : interestStates[event._id] === 'sent' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Heart className="w-3 h-3" />
                      )}
                      <span>
                        {interestStates[event._id] === 'sent' ? 'Interested' : 'Interested'}
                      </span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleViewDetails(event); }}
                      className="flex-1 py-2 bg-[#39c2ba] text-white rounded-lg hover:bg-[#2da59e] transition-colors text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header with Image */}
            <div className="relative h-48 bg-gradient-to-br from-[#39c2ba]/20 to-[#8ce27a]/20">
              {getImageUrl(selectedEvent.image) ? (
                <img
                  src={getImageUrl(selectedEvent.image)!}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building2 className="w-20 h-20 text-[#39c2ba]/40" />
                </div>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-[#173043]" />
              </button>
              {selectedEvent.category && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#f5f8c3] rounded-full text-xs font-medium text-[#173043]">
                  {selectedEvent.category}
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
              <h2 className="text-2xl font-bold text-[#173043] mb-2">{selectedEvent.title}</h2>
              
              {selectedEvent.organizationId && (
                <div className="flex items-center gap-2 text-sm text-[#173043]/70 mb-4">
                  <Building2 className="w-4 h-4 text-[#39c2ba]" />
                  <span>Organized by {selectedEvent.organizationId.name}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-[#173043]/70">
                  <Calendar className="w-4 h-4 text-[#39c2ba]" />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#173043]/70">
                  <MapPin className="w-4 h-4 text-[#39c2ba]" />
                  <span>{selectedEvent.city || selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#173043]/70">
                  <Users className="w-4 h-4 text-[#39c2ba]" />
                  <span>{selectedEvent.volunteersNeeded} volunteers needed</span>
                </div>
                {selectedEvent.corporatePartner && (
                  <div className="flex items-center gap-2 text-sm text-[#173043]/70">
                    <Target className="w-4 h-4 text-[#39c2ba]" />
                    <span>{selectedEvent.corporatePartner}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#173043] mb-2">Description</h3>
                <p className="text-sm text-[#173043]/70 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {selectedEvent.csrObjectives && selectedEvent.csrObjectives.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#173043] mb-2">CSR Objectives</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.csrObjectives.map((objective, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#f0f9f8] text-[#39c2ba] text-xs rounded-full"
                      >
                        {objective}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleExpressInterest(selectedEvent._id)}
                  disabled={interestStates[selectedEvent._id] === 'loading' || interestStates[selectedEvent._id] === 'sent'}
                  className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    interestStates[selectedEvent._id] === 'sent'
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : interestStates[selectedEvent._id] === 'loading'
                      ? 'bg-gray-100 text-gray-500 cursor-wait'
                      : 'bg-[#f5f8c3] text-[#173043] hover:bg-[#e8eb8a]'
                  }`}
                >
                  {interestStates[selectedEvent._id] === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : interestStates[selectedEvent._id] === 'sent' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  <span>
                    {interestStates[selectedEvent._id] === 'sent' ? 'Interest Sent' : 'Express Interest'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    router.push(`/volunteer/${selectedEvent._id}`);
                  }}
                  className="flex-1 py-3 bg-[#39c2ba] text-white rounded-lg hover:bg-[#2da59e] transition-colors font-medium"
                >
                  View Full Page
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CorporateEventsPage;
