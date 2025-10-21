"use client";
import React, { useState } from "react";
import { LucideIcon, X as CloseIcon } from "lucide-react";

interface StatusBannerProps {
  type: "pending" | "rejected" | "approved-volunteer" | "approved-donation";
  title: string;
  message: string | React.ReactNode;
  icon: LucideIcon;
  count: number;
  onClick: () => void;
  onDismiss?: () => void;
  isDismissed?: boolean;
}

const StatusBanner: React.FC<StatusBannerProps> = ({
  type,
  title,
  message,
  icon: Icon,
  count,
  onClick,
  onDismiss,
  isDismissed = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isDismissed) return null;

  // Define colors based on type
  const colors = {
    pending: {
      gradient: "from-yellow-50 to-amber-50",
      border: "border-yellow-200/60",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-900",
      textColor: "text-yellow-800",
      closeHoverBg: "hover:bg-yellow-100",
      closeIconColor: "text-yellow-400 group-hover:text-yellow-600",
    },
    rejected: {
      gradient: "from-red-50 to-rose-50",
      border: "border-red-200/60",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      textColor: "text-red-800",
      closeHoverBg: "hover:bg-red-100",
      closeIconColor: "text-red-400 group-hover:text-red-600",
    },
    "approved-volunteer": {
      gradient: "from-green-50 to-emerald-50",
      border: "border-green-200/60",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      textColor: "text-green-800",
      closeHoverBg: "hover:bg-green-100",
      closeIconColor: "text-green-400 group-hover:text-green-600",
    },
    "approved-donation": {
      gradient: "from-purple-50 to-pink-50",
      border: "border-purple-200/60",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      titleColor: "text-purple-900",
      textColor: "text-purple-800",
      closeHoverBg: "hover:bg-purple-100",
      closeIconColor: "text-purple-400 group-hover:text-purple-600",
    },
  };

  const color = colors[type];
  const showDismissButton = type !== "pending";

  return (
    <>
      {/* Mobile view: Icon only */}
      <div
        onClick={() => setIsExpanded(true)}
        className={`md:hidden mb-6 bg-gradient-to-r ${color.gradient} border ${color.border} rounded-2xl p-4 hover:shadow-lg transition-all duration-300 backdrop-blur-sm cursor-pointer flex items-center gap-3`}
      >
        <div className={`p-2 ${color.iconBg} rounded-xl relative`}>
          <Icon className={`w-6 h-6 ${color.iconColor}`} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
        <span className={`font-semibold ${color.titleColor} text-sm`}>
          Tap to view details
        </span>
      </div>

      {/* Mobile expanded view (modal-like) */}
      {isExpanded && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`bg-gradient-to-r ${color.gradient} border ${color.border} rounded-2xl p-5 shadow-2xl max-w-md w-full relative`}
          >
            {/* Close button for expanded mobile view */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className={`absolute top-4 right-4 p-1.5 ${color.closeHoverBg} rounded-lg transition-colors group z-10`}
              aria-label="Close"
            >
              <CloseIcon className={`w-5 h-5 ${color.closeIconColor}`} />
            </button>

            {/* Dismiss button - only for non-pending banners */}
            {showDismissButton && onDismiss && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                  setIsExpanded(false);
                }}
                className={`text-sm ${color.textColor} underline mt-4 hover:opacity-80`}
              >
                Don't show this again
              </button>
            )}

            <div
              onClick={() => {
                onClick();
                setIsExpanded(false);
              }}
              className="cursor-pointer"
            >
              <div className="flex items-start gap-4 pr-8">
                <div className={`p-2 ${color.iconBg} rounded-xl`}>
                  <Icon className={`w-6 h-6 ${color.iconColor} flex-shrink-0`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${color.titleColor} mb-2 text-lg`}>
                    {title}
                  </h4>
                  <div className={`text-sm ${color.textColor} leading-relaxed`}>
                    {message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop view: Full banner */}
      <div
        className={`hidden md:block mb-6 bg-gradient-to-r ${color.gradient} border ${color.border} rounded-2xl p-5 hover:shadow-lg transition-all duration-300 backdrop-blur-sm relative`}
      >
        {/* Close button - only for non-pending banners */}
        {showDismissButton && onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className={`absolute top-4 right-4 p-1.5 ${color.closeHoverBg} rounded-lg transition-colors group`}
            aria-label="Dismiss banner"
          >
            <CloseIcon className={`w-5 h-5 ${color.closeIconColor}`} />
          </button>
        )}

        <div
          onClick={onClick}
          className={`flex items-start gap-4 cursor-pointer ${showDismissButton ? "pr-8" : ""}`}
        >
          <div className={`p-2 ${color.iconBg} rounded-xl`}>
            <Icon className={`w-6 h-6 ${color.iconColor} flex-shrink-0`} />
          </div>
          <div className="flex-1">
            <h4 className={`font-bold ${color.titleColor} mb-2 text-lg`}>
              {title}
            </h4>
            <div className={`text-sm ${color.textColor} leading-relaxed`}>
              {message}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusBanner;
