import React from "react";
import Link from "next/link";
import { Plus, PenTool, Sparkles } from "lucide-react";

const Addblogcta = () => {
  return (
    <div className="max-w-7xl mx-auto mb-5">
      <div className="relative bg-white rounded-2xl overflow-hidden border border-green-500/30">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />
        </div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />

        <div className="relative px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Text Content */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold  mb-3">
                Ready to Share Your Story?
              </h3>
              <p className="text-green-600 text-lg max-w-2xl">
                Join our community of writers and inspire others with your
                unique perspective and experiences.
              </p>
            </div>

            {/* CTA Button */}
            <Link href="/addblog">
              <button className="group relative flex items-center gap-3 bg-green-600   px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 min-w-[200px] justify-center">
                {/* Hover background */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icons */}
                <div className="relative flex items-center gap-3 z-10">
                  <div className="relative">
                    <Plus
                      size={24}
                      className="transform group-hover:rotate-90 transition-transform duration-500"
                    />
                    <PenTool
                      size={16}
                      className="absolute -top-2 -right-2 text-white opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-500 delay-200"
                    />
                  </div>
                  <span className="text-lg font-bold bg-white bg-clip-text text-transparent hover:bg-black duration-300">
                    Write Story
                  </span>
                </div>

                {/* Sparkle effect */}
                <Sparkles
                  size={16}
                  className="absolute -top-1 -right-1 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300"
                />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addblogcta;
