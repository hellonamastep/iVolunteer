"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useAppState } from "@/hooks/use-app-state"
import { Badge } from "@/components/ui/badge"
import { Heart, IndianRupee, Users, Trophy, Flame, Star, Award, Sparkles } from "lucide-react"

export default function ActivitiesPage() {
  const { user } = useAuth()
  const { checkDailyReset, userCoins, badges, streakCount } = useAppState()

  useEffect(() => {
    if (user && user.role === "user") checkDailyReset()
  }, [checkDailyReset, user])

  const activities = [
    { id: "volunteer", title: "Volunteer", description: "Find local NGOs and volunteer opportunities", icon: Heart, color: "from-blue-400 to-indigo-600", coins: 50 },
    { id: "donate", title: "Donate", description: "Make a donation and earn rewards", icon: IndianRupee, color: "from-emerald-400 to-teal-600", coins: 75 },
    { id: "community", title: "Community Events", description: "Join local community activities", icon: Users, color: "from-rose-400 to-pink-600", coins: 40 },
  ]

  const achievements = [
    { icon: Trophy, label: "Top Contributor", color: "text-yellow-500", bgColor: "from-yellow-200 to-yellow-300" },
    { icon: Flame, label: `${streakCount} Day Streak`, color: "text-orange-500", bgColor: "from-orange-200 to-orange-300" },
    { icon: Star, label: "Community Leader", color: "text-blue-500", bgColor: "from-blue-200 to-blue-300" },
    { icon: Award, label: "Impact Pioneer", color: "text-emerald-500", bgColor: "from-emerald-200 to-emerald-300" },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-gradient-to-tr from-pink-300/30 via-yellow-200/30 to-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-40 right-[-80px] w-80 h-80 bg-gradient-to-br from-blue-300/20 via-purple-200/20 to-pink-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: "7s" }}></div>
      <div className="absolute bottom-[-80px] left-20 w-96 h-96 bg-gradient-to-tr from-orange-200/20 via-rose-100/20 to-yellow-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }}></div>

      <Header />
      <main className="relative px-4 sm:px-6 md:px-8 pb-24 max-w-4xl mx-auto">

        {/* Top Stats */}
        <section className="mt-12 mb-16 flex gap-4">
          {/* Coins */}
          <div className="flex-1 flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-lg hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-6 h-6 mb-2 animate-spin" />
            <span className="text-xl font-bold">{userCoins}</span>
            <span className="text-sm uppercase">Coins</span>
          </div>

          {/* Day Streak with internal circus ripple */}
          <div className="flex-1 flex flex-col items-center p-4 rounded-xl relative overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
            {/* Gradient Ripple Background */}
            <div className="absolute inset-0 animate-ripple bg-gradient-to-r from-orange-700 via-yellow-400 to-orange-700"></div>

            <div className="relative z-10 flex flex-col items-center text-white">
              <Flame className="w-6 h-6 mb-2" />
              <span className="text-xl font-bold">{streakCount}</span>
              <span className="text-sm uppercase">Day Streak</span>
            </div>

            <style jsx>{`
              @keyframes rippleAnim {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .animate-ripple {
                background-size: 200% 200%;
                animation: rippleAnim 2s linear infinite;
              }
            `}</style>
          </div>

          {/* Badges */}
          <div className="flex-1 flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 transition-transform duration-300">
            <Star className="w-6 h-6 mb-2 animate-pulse" />
            <span className="text-xl font-bold">{badges.length}</span>
            <span className="text-sm uppercase">Badges</span>
          </div>
        </section>

        {/* Available Activities */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 font-serif">Available Activities</h2>
            <p className="text-slate-600 text-base sm:text-lg">Choose from various opportunities to create positive impact</p>
          </div>

          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${activity.color} text-white shadow-lg hover:scale-105 transition-transform duration-300`}>
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20">
                  <activity.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{activity.title}</h3>
                  <p className="text-sm sm:text-base">{activity.description}</p>
                </div>
                <Badge className="bg-white text-black font-bold px-4 py-1">+{activity.coins} coins</Badge>
              </li>
            ))}
          </ul>
        </section>

        {/* Achievements */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 font-serif">Your Achievements</h2>
            <p className="text-slate-600 text-base sm:text-lg">Your latest milestones and accomplishments</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {achievements.map((ach, idx) => (
              <div key={idx} className={`flex flex-col items-center p-4 rounded-xl bg-gradient-to-br ${ach.bgColor} text-slate-900 shadow-lg hover:scale-105 transition-transform duration-300`}>
                <ach.icon className={`w-8 h-8 mb-2 ${ach.color}`} />
                <span className="font-bold text-center">{ach.label}</span>
              </div>
            ))}
          </div>
        </section>


      </main>

      <Navigation />
    </div>
  )
}
