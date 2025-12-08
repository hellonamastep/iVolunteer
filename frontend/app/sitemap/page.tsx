"use client"
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const SitemapPage = () => {
  const [openSection, setOpenSection] = useState<string | null>("public");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sitemapSections = [
    {
      title: "Public Pages",
      key: "public",
      icon: "🌐",
      description: "Main pages accessible to all visitors",
      links: [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/aboutus" },
        { name: "Activities", href: "/activities" },
        { name: "Volunteer", href: "/volunteer" },
        { name: "Donate", href: "/donate" },
        { name: "Blogs", href: "/blogs" },
        { name: "Contact Us", href: "/contactus" },
        { name: "Privacy Policy", href: "/privacypolicy" },
        { name: "Terms of Service", href: "/termsofservice" }
      ]
    },
    {
      title: "Authentication",
      key: "auth",
      icon: "🔐",
      description: "User authentication and account management",
      links: [
        { name: "Login", href: "/login" },
        { name: "Sign Up", href: "/signup" },
        { name: "Corporate Sign Up", href: "/corporatesignup" },
        { name: "Forgot Password", href: "/forgot-password" }
      ]
    },
    {
      title: "User Dashboard",
      key: "user",
      icon: "👤",
      description: "Volunteer user account sections",
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
      icon: "🤝",
      description: "NGO organization management",
      links: [
        { name: "NGO Dashboard", href: "/ngo-dashboard" },
        { name: "Add Event", href: "/add-event" },
        { name: "Donation Event Form", href: "/donationevent-form" }
      ]
    },
    {
      title: "Corporate Dashboard",
      key: "corporate",
      icon: "🏢",
      description: "Corporate partner sections",
      links: [
        { name: "Corporate Dashboard", href: "/corporate" },
        { name: "Corporate Events", href: "/corporate/events" }
      ]
    },
    {
      title: "Admin Dashboard",
      key: "admin",
      icon: "⚙️",
      description: "Administrative controls and management",
      links: [
        { name: "Admin Dashboard", href: "/admin" },
        { name: "Donation Pending Requests", href: "/donationpendingreq" },
        { name: "Event Archive", href: "/endeventarchive" },
        { name: "Manage Blogs", href: "/manageblogs" },
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

  const SitemapLink = ({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) => (
    <Link 
      href={getSafeHref(href)} 
      className={`block transition-all duration-200 hover:text-blue-600 ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <span className="text-3xl">🗺️</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Site Map
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Navigate through our complete website structure. Find every page, feature, and section organized for your convenience.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-16">
          {sitemapSections.map((section) => (
            <div 
              key={section.key}
              className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200 cursor-pointer"
              onClick={() => toggleSection(section.key)}
            >
              <div className="text-2xl mb-3">{section.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{section.links.length}</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{section.title}</div>
            </div>
          ))}
        </div>

        {/* Main Sitemap Sections */}
        <div className="space-y-8">
          {sitemapSections.map((section) => (
            <section 
              key={section.key} 
              className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.key)}
                className={`w-full px-8 py-6 text-left flex justify-between items-center transition-all duration-300 ${
                  openSection === section.key 
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-5">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                    <span className="text-xl">{section.icon}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 text-xl mb-2">{section.title}</h3>
                    <p className="text-gray-600 text-sm">{section.description}</p>
                  </div>
                </div>
                <div className={`transition-transform duration-300 ${openSection === section.key ? 'transform rotate-180' : ''}`}>
                  <ChevronDownIcon className="h-6 w-6 text-blue-600" />
                </div>
              </button>
              
              {/* Section Content */}
              {openSection === section.key && (
                <div className="animate-in fade-in-50 slide-in-from-top-5 duration-500">
                  <div className="p-8 bg-gradient-to-br from-white to-blue-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {section.links.map((link, index) => (
                        <div 
                          key={index} 
                          className="group relative"
                        >
                          <div className="absolute -left-3 top-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150"></div>
                          
                          <SitemapLink 
                            href={link.href}
                            className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all duration-300 group-hover:translate-x-2"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 mb-2">
                                  {link.name}
                                </h4>
                                <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-lg inline-block">
                                  {getSafeHref(link.href)}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </SitemapLink>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Quick Navigation Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-lg">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">Get Started</h3>
            <p className="text-blue-100 mb-6">New to Namastep? Begin your journey here.</p>
            <SitemapLink href="/" className="inline-flex items-center px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-200">
              Explore Homepage
            </SitemapLink>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
            <div className="text-3xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-3">Join Events</h3>
            <p className="text-purple-100 mb-6">Find volunteering opportunities that match your interests.</p>
            <SitemapLink href="/activities" className="inline-flex items-center px-5 py-2.5 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors duration-200">
              Browse Activities
            </SitemapLink>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 text-white shadow-lg">
            <div className="text-3xl mb-4">💼</div>
            <h3 className="text-xl font-bold mb-3">For Organizations</h3>
            <p className="text-green-100 mb-6">NGOs and Corporates - Start making an impact.</p>
            <SitemapLink href="/corporatesignup" className="inline-flex items-center px-5 py-2.5 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-colors duration-200">
              Register Organization
            </SitemapLink>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-white">💬</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Need Help Navigating?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
              Our support team is ready to assist you in finding exactly what you need and answering any questions about our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SitemapLink 
                href="/contactus"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </SitemapLink>
              <SitemapLink 
                href="/"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Return to Homepage
              </SitemapLink>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-medium">
            © {new Date().getFullYear()} Namastep. Empowering communities for a better tomorrow. | 
            Site map updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;