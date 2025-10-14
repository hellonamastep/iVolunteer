import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200/40 bg-transparent text-gray-600 mt-16">
      <div className="max-w-[1200px] mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Copyright */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4FC3DC] rounded-full flex items-center justify-center">
            <span className="text-white font-normal text-base">V</span>
          </div>
          <div className="flex flex-col">
            <p className="text-base font-normal text-[#2C3E50]">
              © {new Date().getFullYear()} Volunteer. All rights reserved.
            </p>
            <p className="text-sm text-[#6B7280]">Building a better tomorrow, together 🌍</p>
          </div>
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-6">
          <Link href="/termsofservice" className="text-sm hover:text-gray-900 transition">
            Terms of Service
          </Link>
          <Link href="/privacypolicy" className="text-sm hover:text-gray-900 transition">
            Privacy Policy
          </Link>

          {/* Social Media */}
          <div className="flex items-center gap-4 ml-4">
            <a href="#" className="hover:text-blue-600 transition">
              <FaFacebookF size={16} />
            </a>
            <a href="#" className="hover:text-sky-500 transition">
              <FaTwitter size={16} />
            </a>
            <a href="#" className="hover:text-pink-500 transition">
              <FaInstagram size={16} />
            </a>
            <a href="#" className="hover:text-blue-700 transition">
              <FaLinkedinIn size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
