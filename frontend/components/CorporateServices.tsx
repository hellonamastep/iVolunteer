"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface ServiceCardType {
  image: string;
  title: string;
  description: string;
  features: string[];
  accentColor: string;
  bgGradient: string;
}

const SERVICES: ServiceCardType[] = [
  {
    image: "/images/corporateOurServices-1.jpg",
    title: "CSR Documentation & Reports",
    description:
      "Comprehensive documentation and impact reporting for transparency and accountability.",
    features: [
      "Impact Analytics",
      "Compliance Reports",
      "Stakeholder Updates",
      "Visual Dashboards",
    ],
    accentColor: "#39c2ba",
    bgGradient: "from-[#39c2ba]/30 to-[#39c2ba]/10",
  },
  {
    image: "/images/corporateOurServices-2.jpg",
    title: "Event Planning",
    description:
      "End-to-end event management for impactful volunteer activities and CSR campaigns.",
    features: [
      "Event Strategy",
      "Logistics Management",
      "Volunteer Coordination",
      "Post-Event Reports",
    ],
    accentColor: "#ffc857",
    bgGradient: "from-[#ffc857]/30 to-[#ffc857]/10",
  },
  {
    image: "/images/corporateOurServices-3.jpg",
    title: "NGO Connections",
    description:
      "Connect with verified, mission aligned NGOs over various causes for your CSR initiatives.",
    features: [
      "Verified NGO Network",
      "Cause Matching",
      "Partnership Support",
      "Impact Tracking",
    ],
    accentColor: "#8ce27a",
    bgGradient: "from-[#8ce27a]/30 to-[#8ce27a]/10",
  },
];

function ServiceCard({ service }: { service: ServiceCardType }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-56 w-full">
        <Image src={service.image} alt={service.title} fill className="object-cover" />
      </div>
      <div className="p-6 space-y-4">
        <h3 className="text-[#173043] text-base font-medium">{service.title}</h3>
        <p className="text-[#173043]/80 text-base leading-relaxed">{service.description}</p>
        <ul className="space-y-2">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-[#173043]/80 text-sm">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: service.accentColor }}></div>
              {feature}
            </li>
          ))}
        </ul>
        <button
          className="text-sm font-normal flex items-center gap-2 hover:gap-3 transition-all duration-300 cursor-pointer group"
          style={{ color: service.accentColor }}
        >
          Learn More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}

export default function CorporateServices() {
  return (
    <section id="services" className="bg-[#f0f9f8] relative">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="absolute top-4 left-4 lg:top-20 lg:left-40 z-10">
          <Image src="/mascots/mascot_standing.png" alt="iVolunteer Mascot" width={80} height={80} className="object-contain lg:w-32 lg:h-32" />
        </div>

        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-6 py-2 bg-[#f5f8c3] rounded-lg">
            <span className="text-center text-base font-medium">Our Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-center">
            Everything You Need For Impactful CSR
          </h2>
          <p className="text-base sm:text-lg font-medium text-center max-w-2xl mx-auto px-4">
            We provide comprehensive support to help organizations maximize their social impact and achieve CSR goals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {SERVICES.map((service, idx) => (
            <ServiceCard key={idx} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
