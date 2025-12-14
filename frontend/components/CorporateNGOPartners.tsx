"use client";

import {
  Leaf,
  BookOpen,
  Utensils,
  Activity,
  Droplet,
  Users as UsersIcon,
  Baby,
  Dog,
  User,
  Home,
  Smartphone,
  Palette,
} from "lucide-react";

interface NGOPartner {
  letter: string;
  name: string;
  cause: string;
  color: string;
  icon: typeof Leaf;
}

const NGO_PARTNERS: NGOPartner[] = [
  { letter: "G", name: "Green Earth Foundation", cause: "Environment", color: "#39c2ba", icon: Leaf },
  { letter: "L", name: "Learn & Grow", cause: "Education", color: "#ffc857", icon: BookOpen },
  { letter: "F", name: "Food For All", cause: "Hunger Relief", color: "#8ce27a", icon: Utensils },
  { letter: "H", name: "Health First Initiative", cause: "Healthcare", color: "#39c2ba", icon: Activity },
  { letter: "C", name: "Clean Water Project", cause: "Water & Sanitation", color: "#ffc857", icon: Droplet },
  { letter: "W", name: "Women Empowerment Trust", cause: "Women's Rights", color: "#8ce27a", icon: UsersIcon },
  { letter: "Y", name: "Youth Development Corp", cause: "Youth & Skills", color: "#39c2ba", icon: Baby },
  { letter: "A", name: "Animal Welfare Society", cause: "Animal Rights", color: "#ffc857", icon: Dog },
  { letter: "E", name: "Elderly Care Foundation", cause: "Senior Care", color: "#8ce27a", icon: User },
  { letter: "R", name: "Rural Development Trust", cause: "Rural Growth", color: "#39c2ba", icon: Home },
  { letter: "D", name: "Digital Literacy Initiative", cause: "Technology", color: "#ffc857", icon: Smartphone },
  { letter: "A", name: "Arts & Culture Society", cause: "Arts & Culture", color: "#8ce27a", icon: Palette },
];

function NGOPartnerCard({ ngo }: { ngo: NGOPartner }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg text-center space-y-3">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
        style={{ backgroundColor: ngo.color }}
      >
        <span className="text-white text-2xl font-normal">{ngo.letter}</span>
      </div>
      <div>
        <h4 className="text-[#173043] text-base mb-1">{ngo.name}</h4>
        <p className="text-[#173043]/70 text-sm">{ngo.cause}</p>
      </div>
      <div className="w-0 h-1 rounded-full mx-auto" style={{ backgroundColor: ngo.color }}></div>
    </div>
  );
}

export default function CorporateNGOPartners() {
  return (
    <section id="partners" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-4 py-2 bg-[#f5f9a4] rounded-full">
            <span className="text-[#173043] text-base">Our Network</span>
          </div>
          <h2 className="text-[#173043] text-3xl sm:text-4xl lg:text-5xl font-normal">Trusted NGO Partners</h2>
          <p className="text-[#173043]/80 text-base sm:text-lg max-w-2xl mx-auto px-4">
            We've partnered with verified NGOs across diverse causes to maximize your social impact.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {NGO_PARTNERS.map((ngo, idx) => (
            <NGOPartnerCard key={idx} ngo={ngo} />
          ))}
        </div>

        <p className="text-[#173043]/80 text-base text-center mb-6">
          Join our growing network of 200+ verified NGO partners
        </p>

        <div className="flex items-center justify-center gap-3">
          <button className="px-6 py-3 bg-white border-2 border-[#e6eef2] rounded-full text-[#173043] text-base hover:bg-gray-50 hover:border-[#39c2ba] hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            View All Partners
          </button>
          <button className="px-6 py-3 bg-[#39c2ba] rounded-full text-white text-base hover:bg-[#2da59e] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            Become A Partner
          </button>
        </div>
      </div>
    </section>
  );
}
