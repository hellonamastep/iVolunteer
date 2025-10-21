import React from 'react';
import { EventCard } from './EventCard';
import {
  Share2,
  IndianRupee,
  Target,
  CheckCircle,
  TrendingUp,
  Heart,
  Users,
} from 'lucide-react';
import { DonationEvent } from '@/contexts/donationevents-context';

interface DonationEventCardProps {
  event: DonationEvent;
  onCardClick: (id: string) => void;
  onShare: (event: DonationEvent, e: React.MouseEvent) => void;
  isHighlighted?: boolean;
  animationIndex?: number;
  searchQuery?: string;
  HighlightText?: React.FC<{ text: string; highlight: string }>;
}

export const DonationEventCard: React.FC<DonationEventCardProps> = ({
  event,
  onCardClick,
  onShare,
  isHighlighted = false,
  animationIndex = 0,
  searchQuery = '',
  HighlightText,
}) => {
  const progressPercentage = Math.min(
    (event.collectedAmount / event.goalAmount) * 100,
    100
  );
  const isCompleted = event.collectedAmount >= event.goalAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderText = (text: string) => {
    if (HighlightText && searchQuery) {
      return <HighlightText text={text} highlight={searchQuery} />;
    }
    return <>{text}</>;
  };

  return (
    <EventCard
      id={event._id}
      onClick={() => onCardClick(event._id)}
      isHighlighted={isHighlighted}
      animationDelay={animationIndex * 0.1}
      image={{
        url: typeof event.coverImage === 'string' ? event.coverImage : event.coverImage?.url,
        alt: event.title,
        placeholderIcon: <Heart className="w-16 h-16 text-teal-300 mx-auto" />,
        placeholderText: 'Donation Campaign',
        placeholderGradient: 'bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100',
      }}
      imageBadges={{
        bottomLeft: (
          <span className="text-xs font-semibold text-white bg-white/20 px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-md shadow-lg">
            {renderText(event.ngo?.name || "Community NGO")}
          </span>
        ),
        topRight: isCompleted ? (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <CheckCircle className="w-3 h-3 fill-current" />
            Goal Achieved
          </div>
        ) : undefined,
      }}
      title={renderText(event.title)}
      description={renderText(event.description || "")}
      stats={[
        {
          icon: <Target className="w-4 h-4 text-teal-600" />,
          label: 'Goal',
          value: formatCurrency(event.goalAmount),
          bgColor: 'bg-teal-50/80',
          iconBgColor: 'bg-teal-100',
          iconColor: 'text-teal-600',
        },
        {
          icon: <IndianRupee className="w-4 h-4 text-cyan-600" />,
          label: 'Collected',
          value: formatCurrency(event.collectedAmount),
          bgColor: 'bg-cyan-50/80',
          iconBgColor: 'bg-cyan-100',
          iconColor: 'text-cyan-600',
        },
        {
          icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
          label: 'Progress',
          value: `${progressPercentage.toFixed(1)}%`,
          bgColor: 'bg-emerald-50/80',
          iconBgColor: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
        },
        {
          icon: <Users className="w-4 h-4 text-orange-600" />,
          label: 'Status',
          value: isCompleted ? "Completed" : event.status || "Active",
          bgColor: 'bg-orange-50/80',
          iconBgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
        },
      ]}
      actions={[
        {
          label: 'View & Donate',
          icon: <Heart className="w-3.5 h-3.5" />,
          onClick: (e) => {
            e.stopPropagation();
            onCardClick(event._id);
          },
          variant: 'primary',
        },
        {
          label: 'Share',
          icon: <Share2 className="w-3.5 h-3.5" />,
          onClick: (e) => onShare(event, e),
          variant: 'secondary',
        },
      ]}
    />
  );
};
