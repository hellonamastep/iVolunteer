import React, { ReactNode } from 'react';

interface ImageConfig {
  url?: string;
  alt: string;
  placeholderIcon: ReactNode;
  placeholderText: string;
  placeholderGradient: string;
}

interface BadgeConfig {
  topLeft?: ReactNode;
  topRight?: ReactNode;
  bottomLeft?: ReactNode;
  bottomRight?: ReactNode;
}

interface StatConfig {
  icon: ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
}

interface ActionButton {
  label: string;
  icon: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  variant: 'primary' | 'secondary';
  className?: string;
}

export interface EventCardProps {
  id: string;
  onClick: () => void;
  isHighlighted?: boolean;
  animationDelay?: number;
  
  // Image configuration
  image: ImageConfig;
  
  // Badges on image
  imageBadges?: BadgeConfig;
  
  // Content
  title: ReactNode;
  description: ReactNode;
  
  // Stats grid
  stats: StatConfig[];
  
  // Action buttons
  actions: ActionButton[];
  
  // Additional content
  headerBadge?: ReactNode;
  titleIcon?: ReactNode;
  
  // Custom className
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  onClick,
  isHighlighted = false,
  animationDelay = 0,
  image,
  imageBadges,
  title,
  description,
  stats,
  actions,
  headerBadge,
  titleIcon,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-3xl border-2 border-teal-100 hover:border-cyan-300 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm overflow-hidden p-3 cursor-pointer ${
        isHighlighted
          ? "ring-4 ring-teal-500 ring-offset-2 shadow-2xl"
          : ""
      } ${className}`}
      style={{
        animationDelay: `${animationDelay}s`,
      }}
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Cover Image */}
      <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-3">
        {image.url ? (
          <>
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <>
            {/* Placeholder with gradient background */}
            <div className={`w-full h-full ${image.placeholderGradient} flex items-center justify-center`}>
              <div className="text-center">
                {image.placeholderIcon}
                <p className="text-sm font-semibold mt-2">{image.placeholderText}</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        )}
        
        {/* Image Badges */}
        {imageBadges?.topLeft && (
          <div className="absolute top-3 left-3 z-10">
            {imageBadges.topLeft}
          </div>
        )}
        {imageBadges?.topRight && (
          <div className="absolute top-3 right-3 z-10">
            {imageBadges.topRight}
          </div>
        )}
        {imageBadges?.bottomLeft && (
          <div className="absolute bottom-3 left-3 z-10">
            {imageBadges.bottomLeft}
          </div>
        )}
        {imageBadges?.bottomRight && (
          <div className="absolute bottom-3 right-3 z-10">
            {imageBadges.bottomRight}
          </div>
        )}
      </div>

      {/* Content Layout */}
      <div className="relative z-10">
        {/* Header Badge (if provided) */}
        {headerBadge && (
          <div className="mb-3">
            {headerBadge}
          </div>
        )}

        {/* Title and Description */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="flex-1 text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-500 leading-tight mb-1.5">
              {title}
            </h3>
            {titleIcon && (
              <div className="flex-shrink-0 mt-0.5">
                {titleIcon}
              </div>
            )}
          </div>
          <div className="text-gray-600 leading-snug text-xs line-clamp-2">
            {description}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-2 mb-3 grid-cols-2">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`flex items-center gap-2 p-2 ${stat.bgColor} rounded-lg border border-teal-100/80 backdrop-blur-sm hover:shadow-md transition-all duration-300`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${stat.iconBgColor} shadow-sm`}>
                <div className={stat.iconColor}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-xs font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-teal-100/80 flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={
                action.variant === 'primary'
                  ? "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105"
                  : "flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-xl text-teal-600 bg-teal-50 hover:bg-teal-100 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              }
              title={typeof action.label === 'string' ? action.label : ''}
            >
              {action.icon}
              <span className={action.variant === 'secondary' ? 'sr-only' : ''}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-3xl border-3 border-transparent bg-gradient-to-br from-teal-200/50 to-cyan-200/30 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
};
