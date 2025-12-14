"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, Trophy, Coffee, ShoppingBag, Utensils } from "lucide-react"
import { useAppState } from "@/hooks/use-app-state"
import { Navigation } from "@/components/navigation"

export default function RewardsPage() {
  const { coins, badges, spendCoins } = useAppState()
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([])

  const coupons = [
    {
      id: "coffee-10",
      title: "10% Off Coffee",
      description: "Get 10% off your next coffee purchase at participating cafes",
      icon: Coffee,
      cost: 50,
      category: "Food & Drink",
      validUntil: "Dec 31, 2024",
    },
    {
      id: "shopping-15",
      title: "15% Off Shopping",
      description: "Save 15% on your next online shopping order",
      icon: ShoppingBag,
      cost: 100,
      category: "Shopping",
      validUntil: "Jan 15, 2025",
    },
    {
      id: "restaurant-20",
      title: "20% Off Dining",
      description: "Enjoy 20% off at selected restaurants in your area",
      icon: Utensils,
      cost: 150,
      category: "Food & Drink",
      validUntil: "Dec 25, 2024",
    },
    {
      id: "gift-card-25",
      title: "₹25 Gift Card",
      description: "Redeem for a ₹25 gift card to popular retailers",
      icon: Gift,
      cost: 500,
      category: "Gift Cards",
      validUntil: "No expiry",
    },
  ]

  const achievements = [
    {
      id: "first-volunteer",
      name: "First Steps",
      description: "Completed your first volunteer activity",
      icon: "🌟",
      rarity: "Common",
      points: 10,
    },
    {
      id: "generous-donor",
      name: "Generous Heart",
      description: "Made your first donation",
      icon: "💝",
      rarity: "Common",
      points: 15,
    },
    {
      id: "spiritual-reader",
      name: "Spiritual Seeker",
      description: "Completed a religious reading session",
      icon: "📖",
      rarity: "Common",
      points: 12,
    },
    {
      id: "streak-master",
      name: "Streak Master",
      description: "Maintained a 7-day activity streak",
      icon: "🔥",
      rarity: "Rare",
      points: 50,
    },
    {
      id: "community-hero",
      name: "Community Hero",
      description: "Completed 10 volunteer activities",
      icon: "🦸",
      rarity: "Epic",
      points: 100,
    },
  ]

  const handleRedeemCoupon = (couponId: string, cost: number) => {
    if (coins >= cost && !redeemedRewards.includes(couponId)) {
      spendCoins(cost)
      setRedeemedRewards([...redeemedRewards, couponId])
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-100 text-gray-800"
      case "Rare":
        return "bg-blue-100 text-blue-800"
      case "Epic":
        return "bg-purple-100 text-purple-800"
      case "Legendary":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 pb-20">
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Rewards Center</h1>
          <p className="text-muted-foreground mb-6">Redeem your coins and view your achievements</p>

          <Tabs defaultValue="coupons" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>

            <TabsContent value="coupons" className="space-y-4 mt-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg mb-6">
                <div className="text-2xl font-bold text-primary mb-1">🪙 {coins}</div>
                <div className="text-sm text-muted-foreground">Available Coins</div>
              </div>

              {coupons.map((coupon) => {
                const Icon = coupon.icon
                const canAfford = coins >= coupon.cost
                const isRedeemed = redeemedRewards.includes(coupon.id)

                return (
                  <Card key={coupon.id} className="border-border">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Icon className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-lg">{coupon.title}</CardTitle>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {coupon.category}
                            </Badge>
                          </div>
                          <CardDescription>{coupon.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-accent font-semibold">
                            <span className="text-lg">🪙</span>
                            {coupon.cost} coins
                          </div>
                          <div className="text-xs text-muted-foreground">Valid until {coupon.validUntil}</div>
                        </div>
                        <Button
                          onClick={() => handleRedeemCoupon(coupon.id, coupon.cost)}
                          disabled={!canAfford || isRedeemed}
                          className="bg-accent hover:bg-accent/90"
                        >
                          {isRedeemed ? "Redeemed" : canAfford ? "Redeem" : "Not enough coins"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="badges" className="space-y-4 mt-6">
              <div className="text-center p-4 bg-accent/5 rounded-lg mb-6">
                <div className="text-2xl font-bold text-accent mb-1">{badges.length}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>

              <div className="grid gap-4">
                {achievements.map((achievement) => {
                  const isEarned = badges.some((badge) => badge.id.includes(achievement.id))

                  return (
                    <Card key={achievement.id} className={`border-border ${isEarned ? "bg-accent/5" : "opacity-60"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold">{achievement.name}</h3>
                              <Badge className={getRarityColor(achievement.rarity)}>{achievement.rarity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-accent" />
                              <span className="text-sm font-medium text-accent">{achievement.points} points</span>
                              {isEarned && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 ml-auto">
                                  Earned
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Navigation />
    </div>
  )
}
