import Link from "next/link";
import React from "react";
import { CheckCircle, ArrowRight } from "lucide-react";

const EventCompleteReqCTA = () => {
  return (
    <div className="w-full max-w-7xl mx-auto mb-6 md:p-0 p-6">
      <Link href="/eventendingreq" passHref>
        <div className="group relative bg-gradient-to-br from-white to-gray-50/80 rounded-2xl p-6 cursor-pointer overflow-hidden border border-gray-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm">
          
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(74,139,186,0.02)_25%,rgba(74,139,186,0.02)_50%,transparent_50%,transparent_75%,rgba(74,139,186,0.02)_75%)] bg-[length:6px_6px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Accent Border Animation */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#4A8BBA] to-[#63B3ED] opacity-0 group-hover:opacity-3 transition-opacity duration-300" />
          
          {/* Main Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#4A8BBA] text-white shadow-md transition-all duration-300 group-hover:scale-105">
                  <CheckCircle className="w-6 h-6" />
                </div>
                
                {/* Text Content */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#4A8BBA] transition-colors duration-300">
                    Event Completion Requests
                  </h3>
                  <p className="text-sm text-gray-600">
                    Review pending submissions and manage event completion approvals
                  </p>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#4A8BBA] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Manage Requests
                </span>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4A8BBA] text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Corner Accent */}
          <div className="absolute top-0 right-0 w-16 h-16 -translate-y-4 translate-x-4 rounded-full bg-[#4A8BBA] opacity-[0.02] group-hover:opacity-[0.03] transition-opacity duration-500" />
        </div>
      </Link>
    </div>
  );
};

export default EventCompleteReqCTA;