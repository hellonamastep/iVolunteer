import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { Mail, Send } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#1a3a4a] to-[#0d2633] text-white">
      {/* Newsletter Section */}
      <div className="bg-[#4FC3DC] py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-semibold mb-2">
                Stay Updated
              </h3>
              <p className="text-white/80 text-sm sm:text-base">
                Get the latest opportunities and updates
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 text-sm"
              />
              <button className="px-6 py-3 bg-[#8CE27A] text-[#1a3a4a] font-medium rounded-lg hover:bg-[#7dd369] transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#4FC3DC] rounded-full flex items-center justify-center">
                <span className="text-white text-lg">♥</span>
              </div>
              <span className="text-xl font-semibold">NAMASTEP</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Creating sustainable solutions and empowering communities
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <Link
                href="https://www.facebook.com/profile.php?id=61582529759140"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#4FC3DC] transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={14} />
              </Link>
              <Link
                href="https://twitter.com"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#4FC3DC] transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={14} />
              </Link>
              <Link
                href="https://www.instagram.com/namastep1/"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#4FC3DC] transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={14} />
              </Link>
              <Link
                href="https://www.linkedin.com/company/namastep/"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#4FC3DC] transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={14} />
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/volunteer" className="text-gray-400 hover:text-[#4FC3DC] text-sm transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/volunteer" className="text-gray-400 hover:text-[#4FC3DC] text-sm transition-colors">
                  Find NGOs
                </Link>
              </li>
              <li>
                <Link href="/add-corporate-event" className="text-gray-400 hover:text-[#4FC3DC] text-sm transition-colors">
                  CSR Programs
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/aboutus" className="text-gray-400 hover:text-[#4FC3DC] text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/aboutus" className="text-gray-400 hover:text-[#4FC3DC] text-sm transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacypolicy" className="text-gray-400 hover:text-[#4FC3DC] text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/termsofservice" className="text-gray-400 hover:text-[#4FC3DC] text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} NAMASTEP. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Mail className="w-4 h-4" />
            <a href="mailto:hello@namastep.org" className="hover:text-[#4FC3DC] transition-colors">
              hello@namastep.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;