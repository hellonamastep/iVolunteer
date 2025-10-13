"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";

import Coinsystem from "@/components/Coinsystem";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Gamified from "@/components/Gamified";
import { Header } from "@/components/header";
import Howitworks from "@/components/Howitworks";
import Hero from "@/components/ui/Hero";

import Adminstats from "@/components/Adminstats";
import Dailyquote from "@/components/Dailyquote";
import Eventbutton from "@/components/Eventbutton";
import Ngoanalytics from "@/components/Ngoanalytics";
import Ngoeventtable from "@/components/Ngoeventtable";
import Sponsorshipopp from "@/components/Sponsorshipopp";
import Useractivity from "@/components/Useractivity";
import Useranalytics from "@/components/Useranalytics";
import Userrewardstoredash from "@/components/Userrewardstoredash";
import Donationeventbutton from "@/components/Donationeventbutton";
import PointsDisplay from "@/components/PointsDisplay.";
import { motion } from "framer-motion";
import PendingRequestsCTA from "@/components/PendingRequestsCTA";
import Donationreqcta from "@/components/Donationreqcta";
import Eventcompltreqcta from "@/components/Eventcompltreqcta";
import Addblogcta from "@/components/Addblogcta";
import Manageblogscta from "@/components/Manageblogscta";
import Copeventdash from "@/components/Copeventdash";
import Managecopeventcta from "@/components/Managecopeventcta";

// Dashboard components
function AdminDashboard() {
  return (
    <section className=" h-full w-full min-w-[350px] bg-white">
      <Header />
      <Adminstats />

      <div className="flex justify-center  m-6 md:m-0">
        <div className="max-w-7xl w-full space-y-6">
          {/* Header Section */}
          <div className="text-center mb-2 mt-20">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              Quick Actions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Manage pending requests and review submissions that need your
              attention
            </p>
          </div>

          {/* CTA Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-3 mt-14">
            <Donationreqcta />
            <PendingRequestsCTA />
          </div>
        </div>
      </div>

      <Eventcompltreqcta />
      <Addblogcta />
      <Manageblogscta />
      <Managecopeventcta />
      <Footer />
    </section>
  );
}

function NGODashboard() {
  return (
    <section className="bg-[#f4f7fb] h-full min-w-[350px]">
      <Header />
      <Ngoanalytics />
      <div className="flex md:flex-row flex-col w-full md:justify-around justify-center items-center">
        <Eventbutton />
        <Donationeventbutton />
      </div>

      <Ngoeventtable />
      <Footer />
    </section>
  );
}

function VolunteerDashboard() {
  const { user } = useAuth();

  return (
    <section className="w-full h-full bg-gray-50 min-w-[350px]">
      <Header />
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-10 ml-8 mt-5"
      >
        Welcome back, {user?.name || "User"}
      </motion.h2>
      <PointsDisplay />
      <Useranalytics />
      <Dailyquote />
      <Useractivity />
      <Userrewardstoredash />
      <Footer />
    </section>
  );
}

function CorporateDashboard() {
  return (
    <section className="bg-gradient-to-br from-emerald-50 to-green-50">
      <Header />
      {/* <div className="p-8">
        <h1 className="text-5xl font-bold text-emerald-700 mb-4">
          Corporate Dashboard
        </h1>
        <p className="text-emerald-600 text-lg font-light">
          Welcome back. Here's what's happening.
        </p>
      </div> */}
      <Sponsorshipopp />
      <Copeventdash />
      {/* <CSRAnalytics /> */}
      <Footer />
    </section>
  );
}

// Main landing page
function LandingPage() {
  return (
    <div className="min-w-[350px]">
      <Header />
      <Hero />
      <Gamified />
      <Howitworks />
      <Coinsystem />
      <Faq />
      <Footer />
    </div>
  );
}

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p className="p-6">Loading...</p>;

  // Show dashboard if user is logged in
  if (user) {
    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "ngo":
        return <NGODashboard />;
      case "user": // volunteer
        return <VolunteerDashboard />;
      case "corporate":
        return <CorporateDashboard />;
      default:
        return <p className="p-6">Unknown role. Please contact support.</p>;
    }
  }

  // Show landing page if not logged in
  return <LandingPage />;
}
