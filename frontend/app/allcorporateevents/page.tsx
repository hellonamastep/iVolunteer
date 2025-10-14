"use client";
import React, { useState } from "react";
import { useCorporateEvent, Bid } from "@/contexts/corporateEvent-context";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Clock, 
  Building2, 
  Users, 
  Tag, 
  Filter,
  Award,
  Mail,
  Phone,
  Plus,
  X,
  Leaf,
  Sprout
} from "lucide-react";

const CorporateEventsPage = () => {
  const { events, loading, error, fetchEvents, placeBid } = useCorporateEvent();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  // Modal state
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidEventId, setBidEventId] = useState<string | null>(null);

  const [bidForm, setBidForm] = useState<Bid>({
    corporateName: "",
    offer: "",
    contactEmail: "",
    contactNumber: "",
  });

  // Extract unique categories for filter
  const categories = ["All", ...new Set(events.map((event) => event.category))];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  // Filter events based on selected filters
  const filteredEvents = events.filter((event) => {
    const categoryMatch =
      selectedCategory === "All" || event.category === selectedCategory;
    const difficultyMatch =
      selectedDifficulty === "All" || event.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "medium": return "bg-green-100 text-green-800 border-green-200";
      case "hard": return "bg-teal-100 text-teal-800 border-teal-200";
      default: return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

 const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    conference: "bg-emerald-100 text-emerald-800 border-emerald-200",
    workshop: "bg-green-100 text-green-800 border-green-200",
    seminar: "bg-teal-100 text-teal-800 border-teal-200",
    networking: "bg-lime-100 text-lime-800 border-lime-200",
    training: "bg-cyan-100 text-cyan-800 border-cyan-200",
    default: "bg-emerald-100 text-emerald-800 border-emerald-200"
  };

  const key = category?.toLowerCase();
  // Check if key exists in colors
  if (key && key in colors) {
    return colors[key];
  }

  return colors.default;
};

  // Open bid modal
  const openBidModal = (eventId: string) => {
    setBidEventId(eventId);
    setBidModalOpen(true);
  };

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBidForm({ ...bidForm, [e.target.name]: e.target.value });
  };

  const handleBidSubmit = async () => {
    if (!bidEventId) return;

    try {
      await placeBid({ ...bidForm, eventId: bidEventId });
      setBidModalOpen(false);
      setBidForm({
        corporateName: "",
        offer: "",
        contactEmail: "",
        contactNumber: "",
      });
      fetchEvents(); 
      toast.success("Bid placed successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to place bid");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">
            Error Loading Events
          </h2>
          <p className="text-emerald-700 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all duration-300 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-emerald-600 rounded-xl p-3 mr-4">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">Corporate Events</h1>
              <p className="text-emerald-700 mt-1">
                Discover and bid on exclusive corporate events
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center">
              <div className="bg-emerald-100 rounded-xl p-3 mr-4">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">Total Events</p>
                <p className="text-2xl font-bold text-emerald-900">{events.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-xl p-3 mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">Active Events</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {events.filter(e => new Date(e.date) >= new Date()).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center">
              <div className="bg-teal-100 rounded-xl p-3 mr-4">
                <Tag className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">Categories</p>
                <p className="text-2xl font-bold text-emerald-900">{categories.length - 1}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center">
              <div className="bg-lime-100 rounded-xl p-3 mr-4">
                <Calendar className="h-6 w-6 text-lime-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">This Month</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {events.filter(e => {
                    const eventDate = new Date(e.date);
                    const now = new Date();
                    return eventDate.getMonth() === now.getMonth() && 
                           eventDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search events by title or category..."
                value={selectedCategory === "All" ? "" : selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value || "All")}
                className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-16 text-center">
            <Sprout className="h-20 w-20 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-emerald-600 mb-3">No Events Found</h3>
            <p className="text-emerald-500 mb-8 text-lg">
              {events.length === 0
                ? "No events have been created yet. Check back later for new opportunities!"
                : "No events match your current filters. Try adjusting your selection."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-lg border border-emerald-100 hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-105"
              >
                {/* Event Image */}
                <div className="h-48 bg-gradient-to-br from-emerald-500 to-green-600 relative overflow-hidden">
                  {event.image ? (
                    <img
                      src={`http://localhost:5000/${event.image}`}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-white opacity-90" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium border ${getCategoryColor(event.category)}`}>
                      <Tag className="h-3 w-3 mr-1" />
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-emerald-800/90 text-white px-3 py-1 rounded-lg text-sm font-medium">
                    {formatDate(event.date)}
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-emerald-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-emerald-700">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                      {event.time} • {event.duration}h
                    </div>
                    <div className="flex items-center text-sm text-emerald-700">
                      <Building2 className="h-4 w-4 mr-2 text-emerald-500" />
                      {event.organizedBy}
                    </div>
                    {event.bids && event.bids.length > 0 && (
                      <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <Users className="h-4 w-4 mr-2" />
                        {event.bids.length} bid{event.bids.length !== 1 ? 's' : ''} received
                      </div>
                    )}
                  </div>

                  <p className="text-emerald-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {event.desc}
                  </p>

                  {/* Selected Bid Info */}
                  {event.selectedBid && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        Selected Bid
                      </h4>
                      <p className="text-green-700 text-sm">
                        <strong>{event.selectedBid.corporateName}</strong> -{" "}
                        {event.selectedBid.offer}
                      </p>
                      <p className="text-green-600 text-xs mt-1">
                        {event.selectedBid.contactEmail} |{" "}
                        {event.selectedBid.contactNumber}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-emerald-100">
                    <button
                      onClick={() => openBidModal(event._id)}
                      className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl hover:bg-emerald-700 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl"
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {filteredEvents.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-900">{events.length}</div>
                <div className="text-sm text-emerald-600">Total Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {events.filter(e => new Date(e.date) >= new Date()).length}
                </div>
                <div className="text-sm text-emerald-600">Upcoming</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {events.filter(e => new Date(e.date) < new Date()).length}
                </div>
                <div className="text-sm text-emerald-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {events.reduce((acc, event) => acc + (event.bids?.length || 0), 0)}
                </div>
                <div className="text-sm text-emerald-600">Total Bids</div>
              </div>
            </div>
          </div>
        )}

        {/* Bid Modal */}
        {bidModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-emerald-100">
              <button
                onClick={() => setBidModalOpen(false)}
                className="absolute top-4 right-4 text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Plus className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Place Your Bid</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Corporate Name
                  </label>
                  <input
                    type="text"
                    name="corporateName"
                    placeholder="Enter your company name"
                    value={bidForm.corporateName}
                    onChange={handleBidChange}
                    className="w-full border-2 border-emerald-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition bg-emerald-50/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Your Offer
                  </label>
                  <textarea
                    name="offer"
                    placeholder="Describe your proposal or offer..."
                    value={bidForm.offer}
                    onChange={handleBidChange}
                    rows={3}
                    className="w-full border-2 border-emerald-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition bg-emerald-50/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="your@company.com"
                    value={bidForm.contactEmail}
                    onChange={handleBidChange}
                    className="w-full border-2 border-emerald-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition bg-emerald-50/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    placeholder="+1 (555) 123-4567"
                    value={bidForm.contactNumber}
                    onChange={handleBidChange}
                    className="w-full border-2 border-emerald-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition bg-emerald-50/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-emerald-100">
                <button
                  onClick={() => setBidModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBidSubmit}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Submit Bid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorporateEventsPage; 