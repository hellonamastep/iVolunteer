//OLD CODE:
// "use client"
// import { useState } from "react"
// import { Building2, Users, Target, TrendingUp, Award, CheckCircle, ArrowRight, Star } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { useAppState } from "@/hooks/use-app-state"

// export default function CorporatePage() {
//   const { addCoins } = useAppState()
//   const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
//   const [partnerships, setPartnerships] = useState([
//     { id: 1, company: "TechCorp", employees: 500, impact: "2,500 volunteer hours", status: "Active" },
//     { id: 2, company: "GreenEnergy Inc", employees: 200, impact: "1,200 trees planted", status: "Active" },
//     { id: 3, company: "HealthPlus", employees: 300, impact: "$50,000 donated", status: "Pending" },
//   ])

//   const plans = [
//     {
//       name: "Starter",
//       price: "$99/month",
//       employees: "Up to 50",
//       features: [
//         "Basic CSR dashboard",
//         "Employee engagement tracking",
//         "Monthly impact reports",
//         "Community challenges",
//       ],
//       popular: false,
//     },
//     {
//       name: "Growth",
//       price: "$299/month",
//       employees: "Up to 200",
//       features: [
//         "Advanced analytics",
//         "Custom volunteer programs",
//         "Branded campaigns",
//         "Quarterly strategy sessions",
//         "Priority support",
//       ],
//       popular: true,
//     },
//     {
//       name: "Enterprise",
//       price: "Custom",
//       employees: "Unlimited",
//       features: [
//         "Full white-label solution",
//         "Dedicated account manager",
//         "Custom integrations",
//         "Advanced reporting",
//         "24/7 support",
//       ],
//       popular: false,
//     },
//   ]

//   const handlePartnership = (planName: string) => {
//     setSelectedPlan(planName)
//     addCoins(100)
//     // Simulate partnership creation
//     setTimeout(() => {
//       setSelectedPlan(null)
//     }, 2000)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
//       {/* Header */}
//       <div className="bg-primary/5 border-b border-primary/10">
//         <div className="container mx-auto px-4 py-8">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-3 bg-primary/10 rounded-xl">
//               <Building2 className="w-8 h-8 text-primary" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-foreground">Corporate Partnerships</h1>
//               <p className="text-muted-foreground">Amplify your company's social impact</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-6 space-y-8">
//         {/* Impact Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <Card className="text-center">
//             <CardContent className="pt-6">
//               <Users className="w-8 h-8 text-primary mx-auto mb-2" />
//               <div className="text-2xl font-bold">50+</div>
//               <div className="text-sm text-muted-foreground">Partner Companies</div>
//             </CardContent>
//           </Card>
//           <Card className="text-center">
//             <CardContent className="pt-6">
//               <Target className="w-8 h-8 text-accent mx-auto mb-2" />
//               <div className="text-2xl font-bold">25K</div>
//               <div className="text-sm text-muted-foreground">Employees Engaged</div>
//             </CardContent>
//           </Card>
//           <Card className="text-center">
//             <CardContent className="pt-6">
//               <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
//               <div className="text-2xl font-bold">$2M</div>
//               <div className="text-sm text-muted-foreground">Impact Generated</div>
//             </CardContent>
//           </Card>
//           <Card className="text-center">
//             <CardContent className="pt-6">
//               <Award className="w-8 h-8 text-warning mx-auto mb-2" />
//               <div className="text-2xl font-bold">95%</div>
//               <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Partnership Plans */}
//         <div>
//           <h2 className="text-2xl font-bold mb-6">Partnership Plans</h2>
//           <div className="grid md:grid-cols-3 gap-6">
//             {plans.map((plan) => (
//               <Card key={plan.name} className={`relative ${plan.popular ? "ring-2 ring-primary" : ""}`}>
//                 {plan.popular && (
//                   <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
//                 )}
//                 <CardHeader>
//                   <CardTitle className="flex items-center justify-between">
//                     {plan.name}
//                     {plan.popular && <Star className="w-5 h-5 text-primary" />}
//                   </CardTitle>
//                   <CardDescription>{plan.employees}</CardDescription>
//                   <div className="text-3xl font-bold text-primary">{plan.price}</div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <ul className="space-y-2">
//                     {plan.features.map((feature, index) => (
//                       <li key={index} className="flex items-center gap-2">
//                         <CheckCircle className="w-4 h-4 text-success" />
//                         <span className="text-sm">{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                   <Button
//                     className="w-full"
//                     variant={plan.popular ? "default" : "outline"}
//                     onClick={() => handlePartnership(plan.name)}
//                     disabled={selectedPlan === plan.name}
//                   >
//                     {selectedPlan === plan.name ? (
//                       <div className="flex items-center gap-2">
//                         <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//                         Processing...
//                       </div>
//                     ) : (
//                       <>
//                         Get Started
//                         <ArrowRight className="w-4 h-4 ml-2" />
//                       </>
//                     )}
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>

//         {/* Current Partnerships */}
//         <div>
//           <h2 className="text-2xl font-bold mb-6">Current Partnerships</h2>
//           <div className="space-y-4">
//             {partnerships.map((partnership) => (
//               <Card key={partnership.id} className="hover:shadow-md transition-shadow">
//                 <CardContent className="flex items-center justify-between p-6">
//                   <div className="flex items-center gap-4">
//                     <div className="p-3 bg-primary/10 rounded-lg">
//                       <Building2 className="w-6 h-6 text-primary" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold">{partnership.company}</h3>
//                       <p className="text-sm text-muted-foreground">{partnership.employees} employees</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="font-medium">{partnership.impact}</div>
//                     <Badge variant={partnership.status === "Active" ? "default" : "secondary"}>
//                       {partnership.status}
//                     </Badge>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>

//         {/* Benefits Section */}
//         <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
//           <CardHeader>
//             <CardTitle>Why Partner With Impact Rewards?</CardTitle>
//             <CardDescription>Transform your corporate social responsibility program</CardDescription>
//           </CardHeader>
//           <CardContent className="grid md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div className="flex items-start gap-3">
//                 <CheckCircle className="w-5 h-5 text-success mt-1" />
//                 <div>
//                   <h4 className="font-medium">Boost Employee Engagement</h4>
//                   <p className="text-sm text-muted-foreground">
//                     Gamified social impact activities increase participation by 300%
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <CheckCircle className="w-5 h-5 text-success mt-1" />
//                 <div>
//                   <h4 className="font-medium">Measurable Impact</h4>
//                   <p className="text-sm text-muted-foreground">
//                     Real-time analytics and comprehensive impact reporting
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div className="flex items-start gap-3">
//                 <CheckCircle className="w-5 h-5 text-success mt-1" />
//                 <div>
//                   <h4 className="font-medium">Brand Enhancement</h4>
//                   <p className="text-sm text-muted-foreground">
//                     Strengthen your company's reputation and social responsibility
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <CheckCircle className="w-5 h-5 text-success mt-1" />
//                 <div>
//                   <h4 className="font-medium">Easy Integration</h4>
//                   <p className="text-sm text-muted-foreground">
//                     Seamless setup with existing HR and communication systems
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

"use client";

import Image from "next/image";
import {
  ArrowRight,
  TrendingUp,
  Target,
  Heart,
  Users,
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
import { Header } from "@/components/header";
import Footer from "@/components/Footer";

// Type definitions
interface StatItem {
  value: string;
  label: string;
}
interface MissionItem {
  icon: typeof Target;
  title: string;
  description: string;
  bgColor: string;
}
interface ServiceCard {
  image: string;
  title: string;
  description: string;
  features: string[];
  accentColor: string;
  bgGradient: string;
}
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
interface NGOPartner {
  letter: string;
  name: string;
  cause: string;
  color: string;
  icon: typeof Leaf;
}
// Constants
const HERO_STATS: StatItem[] = [
  { value: "50K+", label: "Volunteers" },
  { value: "200+", label: "NGO Partners" },
  { value: "1M+", label: "Lives Impacted" },
];

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

const SERVICES: ServiceCard[] = [
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

const NGO_PARTNERS: NGOPartner[] = [
  {
    letter: "G",
    name: "Green Earth Foundation",
    cause: "Environment",
    color: "#39c2ba",
    icon: Leaf,
  },
  {
    letter: "L",
    name: "Learn & Grow",
    cause: "Education",
    color: "#ffc857",
    icon: BookOpen,
  },
  {
    letter: "F",
    name: "Food For All",
    cause: "Hunger Relief",
    color: "#8ce27a",
    icon: Utensils,
  },
  {
    letter: "H",
    name: "Health First Initiative",
    cause: "Healthcare",
    color: "#39c2ba",
    icon: Activity,
  },
  {
    letter: "C",
    name: "Clean Water Project",
    cause: "Water & Sanitation",
    color: "#ffc857",
    icon: Droplet,
  },
  {
    letter: "W",
    name: "Women Empowerment Trust",
    cause: "Women's Rights",
    color: "#8ce27a",
    icon: UsersIcon,
  },
  {
    letter: "Y",
    name: "Youth Development Corp",
    cause: "Youth & Skills",
    color: "#39c2ba",
    icon: Baby,
  },
  {
    letter: "A",
    name: "Animal Welfare Society",
    cause: "Animal Rights",
    color: "#ffc857",
    icon: Dog,
  },
  {
    letter: "E",
    name: "Elderly Care Foundation",
    cause: "Senior Care",
    color: "#8ce27a",
    icon: User,
  },
  {
    letter: "R",
    name: "Rural Development Trust",
    cause: "Rural Growth",
    color: "#39c2ba",
    icon: Home,
  },
  {
    letter: "D",
    name: "Digital Literacy Initiative",
    cause: "Technology",
    color: "#ffc857",
    icon: Smartphone,
  },
  {
    letter: "A",
    name: "Arts & Culture Society",
    cause: "Arts & Culture",
    color: "#8ce27a",
    icon: Palette,
  },
];

// Reusable Components
function StatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
      <div className="text-4xl font-normal mb-2" style={{ color }}>
        {value}
      </div>
      <div className="text-[#173043]/70 text-base">{label}</div>
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceCard }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-56 w-full">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6 space-y-4">
        <h3 className="text-[#173043] text-base font-medium">
          {service.title}
        </h3>
        <p className="text-[#173043]/80 text-base leading-relaxed">
          {service.description}
        </p>
        <ul className="space-y-2">
          {service.features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 text-[#173043]/80 text-sm"
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: service.accentColor }}
              ></div>
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

function ImpactStoryCard({ story }: { story: ImpactStory }) {
  const Icon = story.icon;
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={story.image}
          alt={story.title}
          fill
          className="object-cover"
        />
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
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: story.accentColor }}
          ></div>
          <span className="text-sm" style={{ color: story.accentColor }}>
            {story.metric}
          </span>
        </div>
      </div>
    </div>
  );
}

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
        <h3 className="text-[#173043] text-base font-medium mb-1">
          {item.title}
        </h3>
        <p className="text-[#173043]/80 text-base">{item.description}</p>
      </div>
    </div>
  );
}

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
      <div
        className="w-0 h-1 rounded-full mx-auto"
        style={{ backgroundColor: ngo.color }}
      ></div>
    </div>
  );
}

export default function IVolunteerLanding() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />
      {/* Hero Section */}
      <section className="bg-[#f0f9f8]">
        <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 border border-[#39c2ba]/20 rounded-full">
              {/*  Sparkle svg */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clip-path="url(#clip0_595_634)">
                  <path
                    d="M7.34496 1.87605C7.37353 1.72312 7.45468 1.58499 7.57436 1.4856C7.69404 1.3862 7.84472 1.33179 8.00029 1.33179C8.15587 1.33179 8.30655 1.3862 8.42623 1.4856C8.54591 1.58499 8.62706 1.72312 8.65563 1.87605L9.35629 5.58138C9.40606 5.84482 9.53408 6.08713 9.72365 6.2767C9.91322 6.46627 10.1555 6.59429 10.419 6.64405L14.1243 7.34472C14.2772 7.37328 14.4154 7.45443 14.5147 7.57412C14.6141 7.6938 14.6686 7.84447 14.6686 8.00005C14.6686 8.15563 14.6141 8.3063 14.5147 8.42599C14.4154 8.54567 14.2772 8.62682 14.1243 8.65538L10.419 9.35605C10.1555 9.40581 9.91322 9.53383 9.72365 9.7234C9.53408 9.91297 9.40606 10.1553 9.35629 10.4187L8.65563 14.1241C8.62706 14.277 8.54591 14.4151 8.42623 14.5145C8.30655 14.6139 8.15587 14.6683 8.00029 14.6683C7.84472 14.6683 7.69404 14.6139 7.57436 14.5145C7.45468 14.4151 7.37353 14.277 7.34496 14.1241L6.64429 10.4187C6.59453 10.1553 6.46651 9.91297 6.27694 9.7234C6.08737 9.53383 5.84506 9.40581 5.58163 9.35605L1.87629 8.65538C1.72336 8.62682 1.58524 8.54567 1.48584 8.42599C1.38644 8.3063 1.33203 8.15563 1.33203 8.00005C1.33203 7.84447 1.38644 7.6938 1.48584 7.57412C1.58524 7.45443 1.72336 7.37328 1.87629 7.34472L5.58163 6.64405C5.84506 6.59429 6.08737 6.46627 6.27694 6.2767C6.46651 6.08713 6.59453 5.84482 6.64429 5.58138L7.34496 1.87605Z"
                    stroke="#FFC857"
                    stroke-width="1.33333"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.333 1.33337V4.00004"
                    stroke="#FFC857"
                    stroke-width="1.33333"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14.6667 2.66663H12"
                    stroke="#FFC857"
                    stroke-width="1.33333"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2.66634 14.6667C3.40272 14.6667 3.99967 14.0697 3.99967 13.3333C3.99967 12.597 3.40272 12 2.66634 12C1.92996 12 1.33301 12.597 1.33301 13.3333C1.33301 14.0697 1.92996 14.6667 2.66634 14.6667Z"
                    stroke="#FFC857"
                    stroke-width="1.33333"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_595_634">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="text-[#173043] text-sm">
                Trusted by 500+ Organizations
              </span>
            </div>

            <h1 className="text-[#173043] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight">
              Together, We Create Change
            </h1>

            <p className="text-[#173043]/80 text-lg font-normal leading-relaxed">
              Connect corporations, NGOs, and volunteers to build meaningful CSR
              projects that drive sustainable social impact across communities.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button className="px-6 py-3 bg-[#39c2ba] rounded-lg text-white text-sm font-medium hover:bg-[#2da59e] hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2 cursor-pointer">
                Get Involved
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-6 py-3 bg-white border border-[#e6eef2] rounded-lg text-[#173043] text-sm font-medium hover:bg-gray-50 hover:border-[#39c2ba] hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                Start A CSR Project
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-4">
              {HERO_STATS.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-[#39c2ba] text-2xl sm:text-3xl font-normal">
                    {stat.value}
                  </div>
                  <div className="text-[#173043]/70 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full">
            <Image
              src="/images/CorporatePage.png"
              alt="Hero Image"
              fill
              className="rounded-3xl shadow-2xl object-cover"
              priority
            />

            <div className="absolute -bottom-5 left-0 sm:transform sm:-translate-x-12 bg-white rounded-2xl shadow-xl p-3 sm:p-4 w-40 sm:w-48 z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#8ce27a] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-lg sm:text-xl">🌱</span>
                </div>
                <div>
                  <div className="text-[#173043] text-xs sm:text-sm font-semibold">
                    15K Trees Planted
                  </div>
                  <div className="text-[#173043]/70 text-[10px] sm:text-xs">
                    This month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="about" className="bg-white relative">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Image Gallery with 2 columns */}
          <div className="grid items-center grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {/* Left Column - Single image */}
            <div className="relative w-full h-64 sm:h-80">
              <Image
                src="/images/corporateAboutUs-1.jpg"
                alt="Helping hands"
                fill
                className="rounded-2xl object-cover shadow-lg"
              />
            </div>

            {/* Right Column - Two stacked images */}
            <div className="space-y-4 sm:space-y-6">
              <div className="relative w-full h-48 sm:h-72">
                <Image
                  src="/images/corporateAboutUs-2.png"
                  alt="Team collaboration"
                  fill
                  className="rounded-xl object-cover shadow-lg"
                />
              </div>
              <div className="relative w-full h-48 sm:h-72">
                <Image
                  src="/images/corporateAboutUs-3.png"
                  alt="Community gardening"
                  fill
                  className="rounded-2xl object-cover shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Right side - Content and Mission Items */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-[#f5f8c3] rounded-full">
                <span className="text-[#173043] text-base">About Us</span>
              </div>

              <h2 className="text-[#173043] text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                Building Bridges Between Purpose and Impact
              </h2>

              <p className="text-[#173043]/80 text-base leading-relaxed">
                We're on a mission to make corporate social responsibility more
                meaningful, measurable, and sustainable. By connecting
                corporations with verified NGOs and passionate volunteers, we
                create lasting positive change in communities worldwide.
              </p>
            </div>

            <div className="space-y-6">
              {MISSION_ITEMS.map((item, idx) => (
                <MissionCard key={idx} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Mascot - Positioned at bottom right of entire section */}
        <div className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 z-10">
          <Image
            src="/placeholder-logo.png"
            alt="iVolunteer Mascot"
            width={80}
            height={80}
            className="object-contain lg:w-32 lg:h-32"
          />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-[#f0f9f8] relative">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Mascot - Top left */}
          <div className="absolute top-4 left-4 lg:top-20 lg:left-40 z-10">
            <Image
              src="/mascots/mascot_standing.png"
              alt="iVolunteer Mascot"
              width={80}
              height={80}
              className="object-contain lg:w-32 lg:h-32"
            />
          </div>

          <div className="text-center mb-12 space-y-4">
            <div className="inline-block px-6 py-2 bg-[#f5f8c3] rounded-lg">
              <span className=" text-center text-base  font-medium">
                Our Services
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-center">
              Everything You Need For Impactful CSR
            </h2>

            <p className="text-base sm:text-lg font-medium text-center max-w-2xl mx-auto px-4">
              We provide comprehensive support to help organizations maximize
              their social impact and achieve CSR goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {SERVICES.map((service, idx) => (
              <ServiceCard key={idx} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stories */}
      <section id="impact" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f9a4] rounded-full">
              <TrendingUp className="w-4 h-4 text-[#173043]" />
              <span className="text-[#173043] text-base">Impact Stories</span>
            </div>

            <h2 className="text-[#173043] text-3xl sm:text-4xl lg:text-5xl font-normal">
              Real Change, Real Impact
            </h2>

            <p className="text-[#173043]/80 text-base sm:text-lg max-w-2xl mx-auto px-4">
              See how organizations are creating meaningful change through our
              CSR platform.
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

      {/* NGO Partners */}
      <section id="partners" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-block px-4 py-2 bg-[#f5f9a4] rounded-full">
              <span className="text-[#173043] text-base">Our Network</span>
            </div>

            <h2 className="text-[#173043] text-3xl sm:text-4xl lg:text-5xl font-normal">
              Trusted NGO Partners
            </h2>

            <p className="text-[#173043]/80 text-base sm:text-lg max-w-2xl mx-auto px-4">
              We've partnered with verified NGOs across diverse causes to
              maximize your social impact.
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

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#59b4c3] to-[#eff396] py-20 relative">
        {/* Mascot - Top left */}
        <div className="absolute top-4 left-4 lg:top-8 lg:left-16 z-10">
          <Image
            src="/placeholder-logo.png"
            alt="iVolunteer Mascot"
            width={100}
            height={100}
            className="object-contain lg:w-[210px] lg:h-[210px]"
          />
        </div>

        {/* Mascot - Bottom right */}
        <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-16 z-10">
          <Image
            src="/mascots/video_mascots/mascot_planting_video.gif"
            alt="iVolunteer Mascot"
            width={120}
            height={120}
            className="object-contain lg:w-[300px] lg:h-[300px]"
            unoptimized
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-normal">
            Join Us In Creating Sustainable Change
          </h2>

          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Whether you're a corporate looking to make an impact, an NGO seeking
            partnerships, or a volunteer ready to contribute—start your journey
            today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button className="px-6 py-3 bg-white rounded-2xl text-[#173043] text-sm font-normal hover:bg-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-2 cursor-pointer group">
              Get Started Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="px-6 py-3 bg-white border-2 border-white rounded-2xl text-[#000] text-sm font-normal hover:bg-white/90 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              Contact Us
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-white/90">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-base">Free To Get Started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-base">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-base">Verified Partners</span>
            </div>
          </div>
        </div>
      </section>
      <div className="-mt-16">
        <Footer />
      </div>
    </div>
  );
}
