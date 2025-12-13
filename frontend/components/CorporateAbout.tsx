"use client";

import Image from "next/image";
import { Target, Heart, Users } from "lucide-react";

interface MissionItem {
  icon: typeof Target;
  title: string;
  description: string;
  bgColor: string;
}

const MISSION_ITEMS: MissionItem[] = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "Empower organizations to create measurable social impact through strategic CSR initiatives.",
    bgColor: "#59b4c3",
  },
  {
    icon: Heart,
    title: "Our Vision",
    description:
      "A world where every organization contributes to sustainable social development.",
    bgColor: "#eff396",
  },
  {
    icon: Users,
    title: "Our Values",
    description:
      "Transparency, collaboration, and genuine commitment to social change.",
    bgColor: "#74e291",
  },
];

function MissionCard({ item }: { item: MissionItem }) {
  const Icon = item.icon;
  return (
    <div className="flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: item.bgColor }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-[#173043] text-base font-medium mb-1">{item.title}</h3>
        <p className="text-[#173043]/80 text-base">{item.description}</p>
      </div>
    </div>
  );
}

export default function CorporateAbout() {
  return (
    <section id="about" className="bg-white relative">
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div className="grid items-center grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          <div className="relative w-full h-64 sm:h-80">
            <Image src="/images/corporateAboutUs-1.jpg" alt="Helping hands" fill className="rounded-2xl object-cover shadow-lg" />
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div className="relative w-full h-48 sm:h-72">
              <Image src="/images/corporateAboutUs-2.png" alt="Team collaboration" fill className="rounded-xl object-cover shadow-lg" />
            </div>
            <div className="relative w-full h-48 sm:h-72">
              <Image src="/images/corporateAboutUs-3.png" alt="Community gardening" fill className="rounded-2xl object-cover shadow-lg" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-[#f5f8c3] rounded-full">
              <span className="text-[#173043] text-base">About Us</span>
            </div>
            <h2 className="text-[#173043] text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
              Building Bridges Between Purpose and Impact
            </h2>
            <p className="text-[#173043]/80 text-base leading-relaxed">
              We're on a mission to make corporate social responsibility more meaningful, measurable, and sustainable. By connecting corporations with verified NGOs and passionate volunteers, we create lasting positive change in communities worldwide.
            </p>
          </div>
          <div className="space-y-6">
            {MISSION_ITEMS.map((item, idx) => (
              <MissionCard key={idx} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 z-10">
        <Image src="/placeholder-logo.png" alt="iVolunteer Mascot" width={80} height={80} className="object-contain lg:w-32 lg:h-32" />
      </div>
    </section>
  );
}
