"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCorporateEvent, EventData } from "@/contexts/corporateEvent-context";
import { 
  Calendar, 
  Clock, 
  Users, 
  Tag, 
  Building2, 
  MapPin,
  Award,
  FileText,
  ArrowLeft,
  Star
} from "lucide-react";
import Link from "next/link";

const CorporateEventDetailsPage = () => {
  const { id } = useParams();
  const { getEventById } = useCorporateEvent();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (id) {
        try {
          setLoading(true);
          const eventData = await getEventById(id as string);
          setEvent(eventData);
        } catch (error) {
          console.error("Error fetching event:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEvent();
  }, [id, getEventById]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-orange-100 text-orange-800 border-orange-200"
    ];
    const index = category?.length % colors.length || 0;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
          <Link
            href="/managecorporateevents"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Navigation */}
        <div className="mb-8">
          <Link
            href="/managecorporateevents"
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50 border border-gray-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </div>

        {/* Main Event Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 mb-8">
          <div className="md:flex">
            {/* Event Image Section */}
            <div className="md:w-2/5 bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <Building2 className="h-16 w-16 mx-auto mb-4 opacity-90" />
                <h2 className="text-2xl font-bold mb-2">Corporate Event</h2>
                <p className="opacity-90">{event.category}</p>
              </div>
            </div>
            
            {/* Event Details Section */}
            <div className="md:w-3/5 p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{event.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(event.difficulty)}`}>
                      <Award className="mr-1 h-3 w-3" />
                      {event.difficulty}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(event.category)}`}>
                      <Tag className="mr-1 h-3 w-3" />
                      {event.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Building2 className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Organized By</div>
                    <div className="font-medium text-gray-900">{event.organizedBy}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 text-orange-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Time & Duration</div>
                    <div className="font-medium text-gray-900">
                      {event.time} • {event.duration} hours
                    </div>
                  </div>
                </div>
                
                
              </div>

              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Event Description</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{event.desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bids Section */}
        {event.bids && event.bids.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="mr-3 h-6 w-6 text-blue-600" />
                  Received Bids
                </h2>
                <p className="text-gray-600 mt-2">
                  {event.bids.length} bid{event.bids.length !== 1 ? 's' : ''} received from corporate partners
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{event.bids.length}</div>
                <div className="text-sm text-gray-500">Total Proposals</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.bids.map((bid, index) => (
                <div
                  key={bid._id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white group"
                >
                  {/* Bid Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-lg p-2 mr-3">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {bid.corporateName}
                        </h3>
                        {/* <p className="text-sm text-gray-500">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </p> */}
                      </div>
                    </div>
                    <div className="bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Offer */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Star className="mr-1 h-3 w-3 text-yellow-500" />
                      Proposal Offer
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">{bid.offer}</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="truncate">{bid.contactEmail}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>{bid.contactNumber}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Bids State */}
        {(!event.bids || event.bids.length === 0) && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No Bids Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              This event hasn't received any bids from corporate partners yet.
              Check back later for updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorporateEventDetailsPage;