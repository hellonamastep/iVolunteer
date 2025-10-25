"use client"
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const Footer = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  const sitemapSections = [
    {
      title: "Public Pages",
      key: "public",
      links: [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/aboutus" },
        { 
          name: "Activities", 
          href: "/activities",
          sublinks: [
            { name: "All NGO Events", href: "/allngoevents" },
            { name: "All Corporate Events", href: "/allcorporateevents" },
            { name: "All Sponsorship Events", href: "/allsponsorshipevents" }
          ]
        },
        { 
          name: "Volunteer", 
          href: "/volunteer",
          sublinks: [
            { name: "Event Detail", href: "/volunteer" }
          ]
        },
        { 
          name: "Donate", 
          href: "/donate",
          sublinks: [
            { name: "Donation Detail", href: "/donate" }
          ]
        },
        { 
          name: "Blogs", 
          href: "/blogs",
          sublinks: [
            { name: "Blog Post", href: "/blogs" }
          ]
        },
        { name: "Contact Us", href: "/contactus" },
        { name: "Privacy Policy", href: "/privacypolicy" },
        { name: "Terms of Service", href: "/termsofservice" }
      ]
    },
    {
      title: "Authentication",
      key: "auth",
      links: [
        { name: "Login", href: "/login" },
        { name: "Sign Up", href: "/signup" },
        { name: "Corporate Sign Up", href: "/corporatesignup" },
        // { name: "Admin Sign Up", href: "/adminsignup" },
        { 
          name: "Forgot Password", 
          href: "/forgot-password",
          sublinks: [
            { name: "Reset Password", href: "/forgot-password" }
          ]
        },
        // { name: "Verify Email", href: "/verify-email" },
        // { name: "Callback", href: "/callback" }
      ]
    },
    {
      title: "User Dashboard",
      key: "user",
      links: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Profile", href: "/profile" },
        { name: "Badges", href: "/badges" },
        { name: "Rewards", href: "/rewards" },
        { name: "Posts", href: "/posts" },
        { name: "My Events", href: "/volunteer/my-events" }
      ]
    },
    {
      title: "NGO Dashboard",
      key: "ngo",
      links: [
        { name: "NGO Dashboard", href: "/ngo-dashboard" },
        { name: "Add Event", href: "/add-event" },
        { name: "Donation Event Form", href: "/donationevent-form" }
      ]
    },
    {
      title: "Corporate Dashboard",
      key: "corporate",
      links: [
        { name: "Corporate", href: "/corporate" },
        { name: "Corporate Signup", href: "/corporatesignup" }
      ]
    },
    {
      title: "Admin Dashboard",
      key: "admin",
      links: [
        { name: "Admin Dashboard", href: "/admin" },
        { name: "Donation Pending Requests", href: "/donationpendingreq" },
        { name: "Event Archive", href: "/endeventarchive" },
        { name: "Event Ending Requests", href: "/eventendingreq" },
        { name: "Manage Blogs", href: "/manageblogs" },
        { 
          name: "Manage Corporate Events", 
          href: "/managecopertaeevent",
          sublinks: [
            { name: "Manage Corporate Event", href: "/managecopertaeevent" }
          ]
        },
        { name: "Pending Group Requests", href: "/pendinggrouprequest" },
        { name: "Pending Requests", href: "/pendingrequest" }
      ]
    }
  ];

  // Helper function to ensure hrefs are safe
  const getSafeHref = (href: string) => {
    if (href.includes('[') || href.includes(']')) {
      return href.split('/[')[0].split('/[id]')[0].split('/[eventId]')[0].split('/[donationId]')[0].split('/[token]')[0];
    }
    return href;
  };

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-t border-blue-200/60 text-gray-700 mt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Sitemap Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-8 text-center lg:text-left">
          🌐 Site Map
        </h2>

        {/* Dropdown Sitemap */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {sitemapSections.map((section) => (
            <div 
              key={section.key} 
              className="border border-gray-200/80 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.key)}
                className={`w-full px-5 py-4 text-left rounded-xl flex justify-between items-center transition-all duration-300 ${
                  openSection === section.key 
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50/30 border-b border-blue-100/50" 
                    : "bg-white hover:bg-gray-50/80"
                }`}
              >
                <span className="font-semibold text-gray-900 text-base">{section.title}</span>
                <div className={`transition-transform duration-300 ${openSection === section.key ? 'transform scale-110' : ''}`}>
                  {openSection === section.key ? (
                    <ChevronUpIcon className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {openSection === section.key && (
                <div className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
                  <div className="px-5 py-4 bg-gradient-to-b from-white/80 to-blue-50/20">
                    <ul className="space-y-3">
                      {section.links.map((link, index) => (
                        <li key={index} className="group">
                          <Link 
                            href={getSafeHref(link.href)} 
                            className="block py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200/60 transition-all duration-200 text-gray-700 hover:text-[#4FC3DC] font-medium"
                          >
                            <div className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              {link.name}
                            </div>
                          </Link>
                          {link.sublinks && (
                            <ul className="ml-6 mt-2 space-y-2 border-l-2 border-blue-100/50 pl-4">
                              {link.sublinks.map((sublink, subIndex) => (
                                <li key={subIndex} className="group">
                                  <Link 
                                    href={getSafeHref(sublink.href)} 
                                    className="block py-1.5 px-3 rounded-md text-sm hover:bg-blue-50/50 border border-transparent hover:border-blue-100 transition-all duration-200 text-gray-600 hover:text-[#4FC3DC]"
                                  >
                                    <div className="flex items-center">
                                      <div className="w-1 h-1 bg-blue-300 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                      {sublink.name}
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Quick Links */}
          <div className="bg-white/40 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/60">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-[#4FC3DC] rounded-full mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {["Home", "Activities", "Volunteer", "Donate", "Blogs"].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item === 'Home' ? '' : item.toLowerCase()}`} 
                    className="block py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200/60 transition-all duration-200 text-gray-700 hover:text-[#4FC3DC] font-medium"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="bg-white/40 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/60">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-[#4FC3DC] rounded-full mr-3"></span>
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Terms of Service", href: "/termsofservice" },
                { name: "Privacy Policy", href: "/privacypolicy" },
                { name: "Contact Us", href: "/contactus" }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="block py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200/60 transition-all duration-200 text-gray-700 hover:text-[#4FC3DC] font-medium"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="bg-white/40 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/60">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-[#4FC3DC] rounded-full mr-3"></span>
              Connect
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="mailto:hello.namastep@gmail.com" 
                  className="block py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200/60 transition-all duration-200 text-gray-700 hover:text-[#4FC3DC] font-medium"
                >
                  contact@namastep.com
                </Link>
              </li>
              {[
                { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61582529759140" },
                { name: "Instagram", href: "https://www.instagram.com/namastep1/" },
                { name: "LinkedIn", href: "https://www.linkedin.com/company/namastep/" }
              ].map((social) => (
                <li key={social.name}>
                  <Link 
                    href={social.href} 
                    target="_blank"
                    className="block py-2 px-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200/60 transition-all duration-200 text-gray-700 hover:text-[#4FC3DC] font-medium"
                  >
                    {social.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-200/40 pt-8 mt-6 text-center">
          <p className="text-sm text-gray-600 font-medium">© {new Date().getFullYear()} Namastep. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Empowering communities for a better tomorrow 🌱</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;