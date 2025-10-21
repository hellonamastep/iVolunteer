'use client'

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Image as ImageIcon,
  Building,
} from "lucide-react";
import { Header } from "@/components/header";

interface DetailPageLayoutProps {
  // Loading state
  loading: boolean;
  loadingMessage?: string;
  loadingSubtext?: string;
  
  // Error state
  error: string | null;
  errorTitle?: string;
  
  // Header
  backButtonText: string;
  pageTitle: string;
  pageSubtitle: string;
  
  // Cover section
  coverImage?: string;
  coverImageAlt?: string;
  title: string;
  organizationName?: string;
  statusBadge?: React.ReactNode;
  coverIcon?: React.ReactNode; // Used when no cover image
  
  // Main content sections
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  
  // Styling
  leftColumnMaxHeight?: string;
  rightColumnMaxHeight?: string;
}

export const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  loading,
  loadingMessage = "Loading details...",
  loadingSubtext = "Please wait while we fetch the details!",
  error,
  errorTitle = "Error",
  backButtonText,
  pageTitle,
  pageSubtitle,
  coverImage,
  coverImageAlt,
  title,
  organizationName,
  statusBadge,
  coverIcon,
  leftColumn,
  rightColumn,
  leftColumnMaxHeight = 'calc(100vh - 200px)',
  rightColumnMaxHeight = 'calc(100vh - 200px)',
}) => {
  const router = useRouter();

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
            <p className="text-gray-600 text-lg font-semibold">{loadingMessage}</p>
            <p className="text-gray-400 text-sm mt-2">{loadingSubtext}</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-white to-[#7DD9A6] flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white border border-red-200 rounded-xl shadow-md p-8 max-w-md">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h2 className="text-red-800 text-xl font-bold mb-2">{errorTitle}</h2>
              <p className="text-red-600 mb-4 text-sm">{error}</p>
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
        <div className="bg-transparent py-4 sm:py-6 md:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            {/* Mobile Layout (< md) */}
            <div className="md:hidden">
              <button
                onClick={() => router.back()}
                className="px-3 py-1.5 text-gray-600 font-medium rounded-lg hover:bg-white/50 transition-all text-xs sm:text-sm flex items-center space-x-1.5 backdrop-blur-sm mb-3"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{backButtonText}</span>
              </button>
              <div className="text-center">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-700">{pageTitle}</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{pageSubtitle}</p>
              </div>
            </div>
            
            {/* Desktop Layout (>= md) */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex-1">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-white/50 transition-all text-sm flex items-center space-x-2 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{backButtonText}</span>
                </button>
              </div>
              <div className="text-center flex-1">
                <h1 className="text-xl font-semibold text-gray-700">{pageTitle}</h1>
                <p className="text-sm text-gray-600 mt-1">{pageSubtitle}</p>
              </div>
              <div className="flex-1"></div>
            </div>
          </div>
        </div>

        {/* Cover Image - Full Width */}
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 mb-4 sm:mb-6">
          {coverImage ? (
            <div className="h-48 sm:h-56 md:h-64 lg:h-96 relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
              <img 
                src={coverImage} 
                alt={coverImageAlt || title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-white w-full">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2 line-clamp-2">{title}</h1>
                  {organizationName && (
                    <p className="text-white/90 flex items-center text-sm sm:text-base md:text-lg">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">{organizationName}</span>
                    </p>
                  )}
                  {statusBadge && (
                    <div className="mt-2 sm:mt-3 md:mt-4">
                      {statusBadge}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#E8F5A5] to-[#7DD9A6] h-48 sm:h-56 md:h-64 lg:h-96 flex items-center justify-center rounded-lg sm:rounded-xl shadow-lg px-4">
              <div className="text-center text-gray-800">
                {coverIcon || <ImageIcon className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 mx-auto mb-3 sm:mb-4 opacity-80" />}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2 line-clamp-2 px-2">{title}</h1>
                {organizationName && (
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg truncate px-2">{organizationName}</p>
                )}
                {statusBadge && (
                  <div className="mt-2 sm:mt-3 md:mt-4">
                    {statusBadge}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Container */}
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column */}
            <div 
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 custom-scrollbar overflow-y-auto" 
              style={{ maxHeight: leftColumnMaxHeight }}
            >
              {leftColumn}
            </div>

            {/* Right Column */}
            <div 
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 custom-scrollbar overflow-y-auto" 
              style={{ maxHeight: rightColumnMaxHeight }}
            >
              {rightColumn}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
