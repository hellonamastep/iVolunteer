import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaHeart, FaGlobeAmericas } from "react-icons/fa";
import Link from "next/link";
import { Logo } from "@/components/logo";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-t border-blue-200/60 text-gray-700 mt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8 lg:gap-6 mb-6">
          
          {/* Brand Section */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-sm">
            <Logo/>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              Creating sustainable solutions and empowering communities through innovation and collaboration.
            </p>
          </div>

          {/* Links and Social Section */}
          <div className="flex flex-col items-center lg:items-end gap-6 w-full lg:w-auto">
            
            {/* Navigation Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:flex gap-4 lg:gap-8 justify-center">
              <div className="flex flex-col items-center lg:items-start gap-3">
                <Link 
                  href="/aboutus" 
                  className="text-sm font-medium text-gray-700 hover:text-[#4FC3DC] transition-all duration-300 hover:translate-x-1 flex items-center gap-1 group"
                >
                  <div className="w-1 h-1 bg-[#4FC3DC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  About Us
                </Link>
                <Link 
                  href="/corporate" 
                  className="text-sm font-medium text-gray-700 hover:text-[#4FC3DC] transition-all duration-300 hover:translate-x-1 flex items-center gap-1 group"
                >
                  <div className="w-1 h-1 bg-[#4FC3DC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Corporate
                </Link>
              </div>
              
              <div className="flex flex-col items-center lg:items-start gap-3">
                <Link 
                  href="/contactus" 
                  className="text-sm font-medium text-gray-700 hover:text-[#4FC3DC] transition-all duration-300 hover:translate-x-1 flex items-center gap-1 group"
                >
                  <div className="w-1 h-1 bg-[#4FC3DC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Contact Us
                </Link>
                <Link 
                  href="/termsofservice" 
                  className="text-sm font-medium text-gray-700 hover:text-[#4FC3DC] transition-all duration-300 hover:translate-x-1 flex items-center gap-1 group"
                >
                  <div className="w-1 h-1 bg-[#4FC3DC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Terms
                </Link>
              </div>
              
              <div className="flex flex-col items-center lg:items-start gap-3">
                <Link 
                  href="/privacypolicy" 
                  className="text-sm font-medium text-gray-700 hover:text-[#4FC3DC] transition-all duration-300 hover:translate-x-1 flex items-center gap-1 group"
                >
                  <div className="w-1 h-1 bg-[#4FC3DC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Privacy
                </Link>
                <Link 
                  href="/sitemap" 
                  className="text-sm font-medium text-gray-700 hover:text-[#4FC3DC] transition-all duration-300 hover:translate-x-1 flex items-center gap-1 group"
                >
                  <div className="w-1 h-1 bg-[#4FC3DC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Site Map
                </Link>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex flex-col items-center lg:items-end gap-4">
              <div className="flex items-center gap-4">
                <Link 
                  href="https://www.facebook.com/profile.php?id=61582529759140" 
                  className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  aria-label="Facebook"
                >
                  <FaFacebookF size={16} />
                </Link>
                <Link 
                  href="https://www.instagram.com/namastep1/" 
                  className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  aria-label="Instagram"
                >
                  <FaInstagram size={16} />
                </Link>
                <Link 
                  href="https://www.linkedin.com/company/namastep/" 
                  className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn size={16} />
                </Link>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FaGlobeAmericas className="text-[#4FC3DC]" size={12} />
                <span>Join our global community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-blue-200/40">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-gray-600 order-2 sm:order-1">
            <span>© {new Date().getFullYear()} Namastep. All rights reserved.</span>
            <span className="hidden sm:block">•</span>
            <span className="flex items-center gap-1">
              <FaHeart className="text-red-400 w-3 h-3" />
              Building a better tomorrow, together
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-500 order-1 sm:order-2 mb-2 sm:mb-0">
            <span className="px-2 py-1 bg-blue-100/50 text-blue-700 rounded-full font-medium">
              Committed to excellence
            </span>
            <span className="px-2 py-1 bg-green-100/50 text-green-700 rounded-full font-medium">
              Sustainable innovation
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;