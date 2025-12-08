"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCorporateEvent } from "@/contexts/corporateEvent-context";
import Link from "next/link";
import { 
  Plus, 
  Eye, 
  Trash2, 
  Calendar, 
  Tag, 
  Users,
  Building2,
  Search,
  Filter,
  MoreVertical,
  ArrowUpDown,
  Leaf,
  Sprout
} from "lucide-react";

const AdminCorporateEventsPage = () => {
  const router = useRouter();
  const { events, fetchEvents, deleteEvent } = useCorporateEvent();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      await fetchEvents();
      setLoading(false);
    };
    loadEvents();
  }, []);

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      await deleteEvent(eventId);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      conference: "bg-emerald-100 text-emerald-800 border-emerald-200",
      workshop: "bg-green-100 text-green-800 border-green-200",
      seminar: "bg-teal-100 text-teal-800 border-teal-200",
      networking: "bg-lime-100 text-lime-800 border-lime-200",
      training: "bg-cyan-100 text-cyan-800 border-cyan-200",
      default: "bg-emerald-100 text-emerald-800 border-emerald-200"
    };
      
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUniqueCategories = () => {
    const categories = events.map(event => event.category);
    return [...new Set(categories)];
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-emerald-600 rounded-xl p-3 mr-4">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-emerald-900">Corporate Events</h1>
                <p className="text-emerald-700 mt-1">
                  Manage all corporate events and track bids from partners
                </p>
              </div>
            </div>
            <Link
              href="/addcorporateevent"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Event
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
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
                <p className="text-2xl font-bold text-emerald-900">{getUniqueCategories().length}</p>
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

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search events by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
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
              {searchTerm || filterCategory !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first corporate event."
              }
            </p>
            {(searchTerm || filterCategory !== "all") ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                }}
                className="inline-flex items-center px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/create-corporate-event"
                className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Event
              </Link>
            )}
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
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.namastep.com'}/${event.image}`}
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

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-emerald-100">
                    <Link
                      href={`/managecopertaeevent/${event._id}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id, event.title)}
                      className="inline-flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 border border-red-200 hover:border-red-300"
                      title="Delete Event"
                    >
                      <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
};

export default AdminCorporateEventsPage;