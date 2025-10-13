import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-600">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Copyright */}
        <p className="text-sm">
          © {new Date().getFullYear()} iVolunteer. All rights reserved.
        </p>

        {/* Right: Links + Social */}
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
