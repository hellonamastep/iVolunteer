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
import Approvalqueueadmin from "@/components/Approvalqueueadmin";
import CSRAnalytics from "@/components/Csranalytics";
import Dailyquote from "@/components/Dailyquote";
import Eventbutton from "@/components/Eventbutton";
import Ngoanalytics from "@/components/Ngoanalytics";
import Ngoeventtable from "@/components/Ngoeventtable";
import Sponsorshipopp from "@/components/Sponsorshipopp";
import Useractivity from "@/components/Useractivity";
import Useranalytics from "@/components/Useranalytics";
import Usermanagementtable from "@/components/Usermanagementtable";
import Userrewardstoredash from "@/components/Userrewardstoredash";
import Donationeventbutton from "@/components/Donationeventbutton";
import PointsDisplay from "@/components/PointsDisplay.";
import { motion } from "framer-motion";
import PendingRequestsCTA from "@/components/PendingRequestsCTA";
import PendingGroupsCTA from "@/components/PendingGroupsCTA";
import Donationreqcta from "@/components/Donationreqcta";
import { PendingParticipationRequests } from "@/components/PendingParticipationRequests";

// Dashboard components
function AdminDashboard() {
  return (
    <section className="bg-[#f4f7fb] h-full w-full min-w-[350px]">
      <Header />
      <div className="p-6 mt-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 text-xl mt-1">
          A powerful yet effortless way to manage the iVolunteer platform.
        </p>
      </div>

      <Adminstats />

      <Donationreqcta />
      <PendingRequestsCTA />
      <PendingGroupsCTA />

      <div className="mt-16">
      <Footer />
      </div>
    </section>
  );
}

function NGODashboard() {
  return (
    <section className="bg-[#f4f7fb] h-full min-w-[350px]">
      <Header />
      <Ngoanalytics />
      <PendingParticipationRequests />
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
    <section>
      <Header />
      <Sponsorshipopp />
      <CSRAnalytics />
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
