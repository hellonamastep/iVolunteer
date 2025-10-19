"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";

import Coinsystem from "@/components/Coinsystem";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Gamified from "@/components/Gamified";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
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

// Dashboard components
function AdminDashboard() {
  return (
    <section className="bg-[#f4f7fb] h-full w-full min-w-[350px]">
      <Header />
      <div className="p-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 text-xl mt-1">
          A powerful yet effortless way to manage the iVolunteer platform.
        </p>
      </div>
      <Adminstats />
      <h2 className="text-3xl font-semibold mb-4 text-start ml-8 mt-3">
        User Management
      </h2>
      <Usermanagementtable />
      <Approvalqueueadmin />
      <Footer />
    </section>
  );
}

function NGODashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 min-w-[350px] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-200/20 to-teal-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      <div className="relative z-10">
        <Header />
        <div className="pb-8">
          <Ngoanalytics />
          <div className="flex justify-center mt-8">
            <Eventbutton />
          </div>
          <Ngoeventtable />
        </div>
        <Footer />
      </div>
    </div>
  );
}

function VolunteerDashboard() {
  return (
    <div className="w-full min-h-screen bg-gray-50 min-w-[350px]">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <div className="pt-32 pb-8">
        <Useranalytics />
        <Dailyquote />
        <Useractivity />
        <Userrewardstoredash />
      </div>
      <Navigation />
      <Footer />
    </div>
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

// Main landing page for non-logged-in users
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

  // If user is not logged in, show the landing page
  return <LandingPage />;
}
