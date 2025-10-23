import React from 'react';
import { Calendar, MapPin, Users, CheckCircle, UserPlus, Info } from 'lucide-react';

 interface VolunteerEvent {
  _id?: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  // allow string to accept values from API without strict union
  eventType?: string;
  participants?: any[];
  maxParticipants?: number;
  image?: {
    url: string;
    caption?: string;
    publicId?: string;
  };
  [key: string]: any;
}

interface VolunteerEventCardProps {
  event: VolunteerEvent;
  onCardClick: (id: string) => void;
  isHighlighted?: boolean;
  isUserParticipating?: boolean;
  isEventFull?: boolean;
  animationIndex?: number;
  searchQuery?: string;
  HighlightText?: React.FC<{ text: string; highlight: string }>;
  onParticipate?: (id: string) => void;
  onShare?: (event: any, e: React.MouseEvent) => void;
}

export const VolunteerEventCard: React.FC<VolunteerEventCardProps> = ({
  event,
  onCardClick,
  isHighlighted = false,
  isUserParticipating = false,
  isEventFull = false,
  animationIndex = 0,
  searchQuery = '',
  HighlightText,
  onParticipate,
  onShare,
}) => {
  const currentParticipants = Array.isArray(event.participants)
    ? event.participants.length
    : 0;
  const maxParticipants = event.maxParticipants || Infinity;

  const renderText = (text: string) => {
    if (HighlightText && searchQuery) {
      return <HighlightText text={text} highlight={searchQuery} />;
    }
    return <>{text}</>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Date TBD';
    }
  };

  return (
    <div
      onClick={() => onCardClick(event._id!)}
      className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 ${
        isUserParticipating ? "ring-2 ring-teal-400" : ""
      } ${
        isHighlighted 
          ? 'ring-4 ring-teal-500 ring-offset-2 shadow-2xl scale-105' 
          : ''
      }`}
      style={{
        animationDelay: `${animationIndex * 0.1}s`,
      }}
    >
      {/* Event Image */}
      <div className="relative h-40 w-full overflow-hidden">
        {event.image?.url ? (
          <>
            <img
              src={event.image.url}
              alt={event.image.caption || event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        ) : (
          <>
            {/* Placeholder with gradient background */}
            <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 text-purple-300 mx-auto mb-1" />
                <p className="text-purple-600 text-xs font-semibold">Volunteer Event</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        )}
        
        {/* Points Badge */}
        <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10">
          ⚡ 100
        </div>
        
        {/* Bookmark Icon */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
        >
          <span className="text-gray-600">☆</span>
        </button>
        
        {/* Event Type Badge on Image */}
        {event.eventType && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${
              event.eventType === 'virtual' 
                ? 'bg-cyan-500 text-white' 
                : event.eventType === 'in-person'
                ? 'bg-emerald-500 text-white'
                : event.eventType === 'special'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : 'bg-purple-500 text-white'
            }`}>
              {event.eventType === 'virtual' && '💻 Virtual'}
              {event.eventType === 'in-person' && '📍 In-Person'}
              {event.eventType === 'community' && '🌍 Community'}
              {event.eventType === 'special' && '✨ Special'}
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-4">
        {/* Event Title with Info Icon */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="flex-1 text-base font-bold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
            {renderText(event.title)}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(event._id!);
            }}
            className="flex-shrink-0 bg-teal-50 hover:bg-teal-100 text-teal-600 p-1.5 rounded-full transition-all hover:scale-110"
            title="View Event Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        
        {/* Event Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {renderText(event.description)}
        </p>

        {/* Date */}
        <div className="flex items-center text-gray-600 mb-2 text-xs">
          <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
          <span>{formatDate(event.date)}</span>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3 text-xs">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-green-500" />
          <span className="line-clamp-1">{event.location || 'Location TBD'}</span>
        </div>

        {/* Participants Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-gray-600 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-teal-500" />
              Participants
            </span>
            <span className={`font-semibold ${isEventFull ? 'text-red-500' : 'text-teal-600'}`}>
              {currentParticipants}/{maxParticipants === Infinity ? '∞' : maxParticipants}
            </span>
          </div>
          
        </div>

        {/* Join/Status Button */}
        <div className="mt-3">
          {isUserParticipating ? (
            <div className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-100 text-teal-700 border border-teal-200">
              <CheckCircle className="h-3.5 w-3.5" />
              Joined
            </div>
          ) : isEventFull ? (
            <div className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-red-100 text-red-700 border border-red-200">
              <UserPlus className="h-3.5 w-3.5" />
              Event Full
            </div>
          ) : onParticipate ? (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onParticipate(event._id!); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Join
              </button>
              {onShare && (
                <button
                  onClick={(e) => { e.stopPropagation(); onShare(event, e); }}
                  className="p-2 rounded-lg bg-teal-50 text-teal-600"
                  title="Share event"
                >
                  {/* lightweight share icon */}
                  <span>🔗</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onCardClick(event._id!); }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
            >
              <UserPlus className="h-3.5 w-3.5" />
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
