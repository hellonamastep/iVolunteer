import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200/40 bg-transparent text-gray-600 mt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-8">
        
        {/* Left: Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 bg-[#4FC3DC] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-normal text-base">V</span>
          </div>
          <div className="flex flex-col">
            <p className="text-sm sm:text-base font-normal text-[#2C3E50]">
              © {new Date().getFullYear()} Namastep. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
              Building a better tomorrow, together 🌍
            </p>
          </div>
        </div>

        {/* Right: Links */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Legal Links */}
          <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-1">
            <Link 
              href="/aboutus" 
              className="text-xs sm:text-sm hover:text-gray-900 transition whitespace-nowrap"
            >
              About Us
            </Link>
            <Link 
              href="/termsofservice" 
              className="text-xs sm:text-sm hover:text-gray-900 transition whitespace-nowrap"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacypolicy" 
              className="text-xs sm:text-sm hover:text-gray-900 transition whitespace-nowrap"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Social Media */}
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <a href="#" className="hover:text-blue-600 transition p-1" aria-label="Facebook">
              <FaFacebookF size={14} className="sm:w-4 sm:h-4" />
            </a>
            <a href="#" className="hover:text-sky-500 transition p-1" aria-label="Twitter">
              <FaTwitter size={14} className="sm:w-4 sm:h-4" />
            </a>
            <a href="#" className="hover:text-pink-500 transition p-1" aria-label="Instagram">
              <FaInstagram size={14} className="sm:w-4 sm:h-4" />
            </a>
            <a href="#" className="hover:text-blue-700 transition p-1" aria-label="LinkedIn">
              <FaLinkedinIn size={14} className="sm:w-4 sm:h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;