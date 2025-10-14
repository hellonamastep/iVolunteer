import Image from "next/image";
import React from "react";

const Bloghero = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between gap-8 px-6 py-10 max-w-6xl mx-auto">
      {/* Left Side — Image */}
      <div className="w-full md:w-1/2">
        <Image
          src="/images/blogheroimg.png" // from /public/images/
          alt="Reforest Challenge"
          width={600}
          height={400}
          className="rounded-2xl object-cover w-full h-auto sh"
          priority
        />
      </div>

      {/* Right Side — Text Content */}
      <div className="w-full md:w-1/2 text-center md:text-left space-y-4">
        <p className="text-green-600 font-medium text-sm md:text-base">
          Featured Opportunity
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
          Reforest Your City: Tree Planting Challenge
        </h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
          Help us combat climate change one tree at a time. Join our weekend tree
          planting event, earn points for every tree planted, and climb the
          leaderboard to become a Reforestation Champion.
        </p>
        <button className="mt-4 inline-flex items-center gap-2 text-green-600 font-semibold hover:underline transition">
          Sign Up Now
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Bloghero;
