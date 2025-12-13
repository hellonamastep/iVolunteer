"use client";

import Image from "next/image";
import { TrendingUp, Leaf, BookOpen, Utensils } from "lucide-react";

interface ImpactStat {
  value: string;
  label: string;
  color: string;
}

interface ImpactStory {
  title: string;
  partners: string;
  description: string;
  metric: string;
  count: string;
  image: string;
  icon: typeof Leaf;
  accentColor: string;
  bgGradient: string;
}

const IMPACT_STATS: ImpactStat[] = [
  { value: "250+", label: "Active Projects", color: "#39c2ba" },
  { value: "50K+", label: "Total Volunteers", color: "#ffc857" },
  { value: "500+", label: "Partner Companies", color: "#8ce27a" },
  { value: "1000+", label: "Communities Served", color: "#39c2ba" },
];

const IMPACT_STORIES: ImpactStory[] = [
  {
    title: "Green Earth Initiative",
    partners: "TechCorp & Green Future NGO",
    description:
      "A corporate partnership that resulted in massive reforestation efforts across 5 states.",
    metric: "15,000 trees planted",
    count: "15K+",
    image: "/images/corporateImpactStories-1.png",
    icon: Leaf,
    accentColor: "#8ce27a",
    bgGradient: "from-[#8ce27a]/30 to-[#8ce27a]/10",
  },
  {
    title: "Education For All",
    partners: "Finance First & Learn Foundation",
    description:
      "Providing quality education and learning resources to underprivileged communities.",
    metric: "8,000 children educated",
    count: "8K+",
    image: "/images/corporateImpactStories-2.jpg",
    icon: BookOpen,
    accentColor: "#39c2ba",
    bgGradient: "from-[#39c2ba]/30 to-[#39c2ba]/10",
  },
  {
    title: "Community Food Security",
    partners: "Retail Giant & Food For All",
    description:
      "Monthly food distribution drives ensuring no family goes hungry.",
    metric: "50,000 meals served",
    count: "50K+",
    image: "/images/corporateImpactStories-3.jpg",
    icon: Utensils,
    accentColor: "#ffc857",
    bgGradient: "from-[#ffc857]/30 to-[#ffc857]/10",
  },
];

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
      <div className="text-4xl font-normal mb-2" style={{ color }}>{value}</div>
      <div className="text-[#173043]/70 text-base">{label}</div>
    </div>
  );
}

function ImpactStoryCard({ story }: { story: ImpactStory }) {
  const Icon = story.icon;
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="relative h-56 w-full overflow-hidden">
        <Image src={story.image} alt={story.title} fill className="object-cover" />
        <div
          className="absolute top-4 right-4 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: story.accentColor }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="p-6 space-y-3">
        <h3 className="text-[#173043] text-base font-medium">{story.title}</h3>
        <p className="text-[#173043]/70 text-sm">{story.partners}</p>
        <p className="text-[#173043]/80 text-base">{story.description}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: story.accentColor }}></div>
          <span className="text-sm" style={{ color: story.accentColor }}>{story.metric}</span>
        </div>
      </div>
    </div>
  );
}

export default function CorporateImpactStories() {
  return (
    <section id="impact" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f9a4] rounded-full">
            <TrendingUp className="w-4 h-4 text-[#173043]" />
            <span className="text-[#173043] text-base">Impact Stories</span>
          </div>
          <h2 className="text-[#173043] text-3xl sm:text-4xl lg:text-5xl font-normal">Real Change, Real Impact</h2>
          <p className="text-[#173043]/80 text-base sm:text-lg max-w-2xl mx-auto px-4">
            See how organizations are creating meaningful change through our CSR platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {IMPACT_STATS.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {IMPACT_STORIES.map((story, idx) => (
            <ImpactStoryCard key={idx} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}
