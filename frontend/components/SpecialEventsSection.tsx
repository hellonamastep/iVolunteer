"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, X } from "lucide-react";

interface SpecialEventsSectionProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SpecialEventsSection: React.FC<SpecialEventsSectionProps> = ({ isVisible, onClose }) => {
  const router = useRouter();

  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-teal-200/50 animate-in slide-in-from-top-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">
              Special Events
            </h2>
            <p className="text-white/95 text-sm font-medium">
              Create unique and impactful volunteer opportunities
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/add-event?source=special")}
            className="bg-white text-teal-600 hover:bg-teal-50 font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 px-6 rounded-xl text-base group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
            Create Event
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 text-white p-2 h-auto rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
