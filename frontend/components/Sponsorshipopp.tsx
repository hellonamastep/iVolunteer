"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Users, TrendingUp, Award, Heart, ArrowRight, Star, Building2, Shield, Sparkles } from "lucide-react";
import { useCorporate } from "../contexts/corporate-context";
import Link from "next/link";

export default function Sponsorshipopp() {
  const { opportunities } = useCorporate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Calculate sponsorship metrics
  const totalOpportunities = opportunities.length;
  const featuredOpportunities = opportunities.filter(opp => opp.featured).length;
  const totalParticipants = opportunities.reduce((sum, opp) => {
    const participants = parseInt(opp.participants.replace(/[^0-9]/g, '')) || 0;
    return sum + participants;
  }, 0);
  const totalFundingGoal = opportunities.reduce((sum, opp) => {
    const goal = parseInt(opp.goal.replace(/[^0-9]/g, '')) || 0;
    return sum + goal;
  }, 0);

  const sponsorshipBenefits = [
    {
      icon: Target,
      title: "Targeted Impact",
      description: "Reach specific audiences and communities that align with your CSR goals"
    },
    {
      icon: Users,
      title: "Community Engagement",
      description: "Build meaningful relationships with communities and stakeholders"
    },
    {
      icon: TrendingUp,
      title: "Brand Visibility",
      description: "Enhance your corporate reputation through meaningful partnerships"
    },
    {
      icon: Award,
      title: "Recognition",
      description: "Gain industry recognition for your social responsibility efforts"
    }
  ];

  const impactStats = [
    { value: `${totalOpportunities}+`, label: "Active Opportunities" },
    { value: `${featuredOpportunities}`, label: "Featured Programs" },
    { value: `${totalParticipants.toLocaleString()}+`, label: "Total Reach" },
    { value: `₹${(totalFundingGoal / 100000).toFixed(1)}L+`, label: "Funding Goal" }
  ];

  return (
    <section className="bg-gradient-to-br from-blue-50 to-sky-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-12 bg-gradient-to-b from-[#2563eb] to-[#3b82f6] rounded-full"></div>
              <div className="w-3 h-8 bg-gradient-to-b from-[#3b82f6] to-[#60a5fa] rounded-full"></div>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-[#2563eb] to-[#3b82f6] bg-clip-text text-transparent">
              Corporate Sponsorship
            </h2>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-xl leading-relaxed">
            Create lasting impact through strategic corporate partnerships and drive positive change 
            in communities while achieving your social responsibility objectives
          </p>
        </motion.div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {impactStats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 text-center shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-3xl font-bold text-[#2563eb] mb-2">{stat.value}</div>
              <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Partner With Us?</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover the benefits of corporate sponsorship and how it can transform your social impact strategy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorshipBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2563eb] transition-colors duration-300">
                  <benefit.icon className="w-6 h-6 text-[#2563eb] group-hover:text-white transition-colors duration-300" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-3xl p-12 text-center text-white shadow-2xl"
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>
            
            <h3 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h3>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Join our network of corporate partners and create meaningful impact through strategic sponsorship opportunities. 
              Let's work together to drive positive change in communities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group bg-white text-[#2563eb] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3">
                <Heart className="w-5 h-5" />
                <Link href="/allsponsorshipevents">
                Explore Opportunities
                </Link>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center gap-3">
                <Shield className="w-5 h-5" />
                Learn More
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 text-sm mb-8">Trusted by leading corporations</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <Building2 className="w-8 h-8 text-[#2563eb]" />
            <Target className="w-8 h-8 text-[#2563eb]" />
            <Award className="w-8 h-8 text-[#2563eb]" />
            <Users className="w-8 h-8 text-[#2563eb]" />
            <Star className="w-8 h-8 text-[#2563eb]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}