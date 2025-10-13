"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2,
  Heart,
  ArrowRight,
  Calendar,
  Users,
  Target,
  BarChart3,
  Sparkles,
  Leaf
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCorporateEvent } from '@/contexts/corporateEvent-context';

const Copeventdash = () => {
  const { events, loading, error } = useCorporateEvent();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-emerald-200 rounded w-64 mb-4"></div>
            <div className="h-6 bg-emerald-100 rounded w-96 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                <div className="h-8 bg-emerald-200 rounded w-32 mb-4"></div>
                <div className="h-6 bg-emerald-100 rounded w-24 mb-2"></div>
                <div className="h-4 bg-emerald-100 rounded w-full mb-4"></div>
                <div className="h-12 bg-emerald-200 rounded-xl"></div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                <div className="h-8 bg-emerald-200 rounded w-32 mb-4"></div>
                <div className="h-6 bg-emerald-100 rounded w-24 mb-2"></div>
                <div className="h-4 bg-emerald-100 rounded w-full mb-4"></div>
                <div className="h-12 bg-emerald-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-emerald-100 rounded-xl p-3">
                <Building2 className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Failed to Load Data</h3>
            <p className="text-emerald-600 mb-6">Please try refreshing the page</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate real metrics from available data
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).length;
  const totalCategories = new Set(events.map(event => event.category)).size;
  const totalBids = events.reduce((acc, event) => acc + (event.bids?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-900 to-green-800 bg-clip-text text-transparent">
                Corporate Events
              </h1>
              <p className="text-emerald-700 mt-2 text-lg">
                Discover meaningful partnership opportunities
              </p>
            </div>
          </div>
        </motion.div>

        {/* Real Data Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-1">{totalEvents}</h3>
            <p className="text-emerald-600 text-sm">Available Events</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-1">{upcomingEvents}</h3>
            <p className="text-emerald-600 text-sm">Upcoming Events</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-100 p-3 rounded-xl">
                <Target className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-1">{totalCategories}</h3>
            <p className="text-emerald-600 text-sm">Categories</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-cyan-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-1">{totalBids}</h3>
            <p className="text-emerald-600 text-sm">Total Bids</p>
          </motion.div>
        </div>

       

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-[#5D8A6E] to-[#7AA981] rounded-2xl p-8 text-center shadow-2xl"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Leaf className="h-8 w-8 text-white" />
              <h2 className="text-2xl font-bold text-white">
                Ready to Make an Impact?
              </h2>
            </div>
            <p className="text-emerald-100 text-lg mb-6">
              Join {totalEvents} corporate events and create meaningful partnerships through strategic sponsorships
            </p>
            <button
              onClick={() => router.push("/allcorporateevents")}
              className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl text-emerald-700 bg-white hover:bg-emerald-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              <Heart className="h-5 w-5" />
              Start Sponsoring Events
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Copeventdash;