"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, ChevronRight } from "lucide-react";
import api from "@/lib/api";

export default function ArchivedEventsCTA() {
  const router = useRouter();
  const [archivedCount, setArchivedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedCount();
  }, []);

  const fetchArchivedCount = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api.get("/v1/event/archived-events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setArchivedCount((res.data as any).events?.length || 0);
    } catch (error) {
      console.error("Failed to fetch archived events count:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    router.push("/archived-events");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-gray-300 group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Archive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
                Archived Events
              </h3>
              <p className="text-sm text-gray-600">Past completed events</p>
            </div>
          </div>
          <div className="bg-gray-200 group-hover:bg-gray-300 px-3 py-1 rounded-full transition-colors duration-300">
            <span className="text-lg font-bold text-gray-700">
              {archivedCount}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {archivedCount === 0
              ? "No archived events yet"
              : `View your ${archivedCount} archived event${archivedCount !== 1 ? "s" : ""}`}
          </p>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {archivedCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Events that ended more than 30 minutes ago</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
