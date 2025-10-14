"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, MapPin, Calendar, Clock, Users, Eye, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEvents } from "@/contexts/events-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingParticipationRequests } from "@/components/PendingParticipationRequests"
import { ParticipationRequestDebug } from "@/components/ParticipationRequestDebug"

export default function NGODashboard() {
  const { user } = useAuth()
  const { createEvent, organizationEvents, getApplicationsByEvent, fetchOrganizationEvents } = useEvents()
  const router = useRouter()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    maxParticipants: "",
    coins: "",
    description: "",
    category: "",
  })

  useEffect(() => {
    if (!user || user.role !== "ngo") {
      router.push("/auth")
    } else {
      fetchOrganizationEvents()
    }
  }, [user, router, fetchOrganizationEvents])

  if (!user || user.role !== "ngo") {
    return null
  }

  const myEvents = organizationEvents
  const pendingEvents = myEvents.filter((event) => event.status === "pending")
  const approvedEvents = myEvents.filter((event) => event.status === "approved")
  const rejectedEvents = myEvents.filter((event) => event.status === "rejected")

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()

    createEvent({
      title: formData.title,
      organization: user.name,
      organizationId: user.id,
      location: formData.location,
      date: formData.date,
      time: formData.time,
      maxParticipants: Number.parseInt(formData.maxParticipants),
      coins: Number.parseInt(formData.coins),
      description: formData.description,
      category: formData.category,
    }).then(() => {
      // Refresh organization events after creating
      fetchOrganizationEvents()
    })

    setFormData({
      title: "",
      location: "",
      date: "",
      time: "",
      maxParticipants: "",
      coins: "",
      description: "",
      category: "",
    })
    setIsCreateDialogOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 pb-20">
        <div className="mt-6">
          {pendingEvents.length > 0 && (
            <div 
              onClick={() => setActiveTab("pending")}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 cursor-pointer hover:bg-yellow-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-1">
                    {pendingEvents.length} Event{pendingEvents.length > 1 ? 's' : ''} Pending Approval
                  </h4>
                  <p className="text-sm text-yellow-800">
                    You have {pendingEvents.length} event{pendingEvents.length > 1 ? 's' : ''} waiting for admin approval. 
                    {pendingEvents.length > 1 ? ' They' : ' It'} will be visible to volunteers once approved.
                    <span className="font-semibold ml-1">Click to view details.</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {rejectedEvents.length > 0 && (
            <div 
              onClick={() => setActiveTab("rejected")}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 cursor-pointer hover:bg-red-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">
                    {rejectedEvents.length} Event{rejectedEvents.length > 1 ? 's' : ''} Rejected
                  </h4>
                  <div className="text-sm text-red-800 space-y-2">
                    {rejectedEvents.map((event, index) => (
                      <div key={event.id} className={index > 0 ? "mt-2 pt-2 border-t border-red-200" : ""}>
                        <p className="font-medium">
                          "{event.title}" was rejected by admin
                          {event.rejectionReason && (
                            <span className="font-normal"> for: <span className="italic">"{event.rejectionReason}"</span></span>
                          )}
                        </p>
                      </div>
                    ))}
                    <p className="font-semibold mt-2">Click to view and manage rejected events.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">NGO Dashboard</h1>
              <p className="text-muted-foreground">Manage your volunteer events</p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>Create a volunteer event for your organization</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Community Service">Community Service</SelectItem>
                        <SelectItem value="Environment">Environment</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Animal Welfare">Animal Welfare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        placeholder="e.g. 9:00 AM - 1:00 PM"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coins">Reward Coins</Label>
                      <Input
                        id="coins"
                        type="number"
                        value={formData.coins}
                        onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Create Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">
                All Events ({myEvents.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedEvents.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {myEvents.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Events Created</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Create your first volunteer event to get started
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>Create Event</Button>
                  </CardContent>
                </Card>
              ) : (
                myEvents.map((event) => renderEventCard(event))
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingEvents.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Events</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      All your events have been reviewed by the admin
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">Awaiting Admin Approval</h4>
                        <p className="text-sm text-yellow-800">
                          These events are pending admin review. They will be visible to volunteers once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                  {pendingEvents.map((event) => renderEventCard(event))}
                </>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedEvents.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Approved Events</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Your approved events will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                approvedEvents.map((event) => renderEventCard(event))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedEvents.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Rejected Events</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      You have no rejected events
                    </p>
                  </CardContent>
                </Card>
              ) : (
                rejectedEvents.map((event) => renderEventCard(event))
              )}
            </TabsContent>
          </Tabs>

          {/* Participation Requests Section */}
          <div className="mt-8">
            <ParticipationRequestDebug />
            <PendingParticipationRequests />
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  )

  function renderEventCard(event: any) {
    const applications = getApplicationsByEvent(event.id)
    return (
      <Card key={event.id} className="border-border">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription>{event.category}</CardDescription>
            </div>
            <Badge className={getStatusColor(event.status)}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {event.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                This event is awaiting admin approval. It will be visible to volunteers once approved.
              </p>
            </div>
          )}
          
          <p className="text-muted-foreground mb-4">{event.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {event.date}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {event.time}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {applications.length}/{event.maxParticipants} applied
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-accent font-semibold">
              <span className="text-lg">🪙</span>
              {event.coins} coins reward
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/event-applications/${event.id}`)}
              disabled={event.status === "pending"}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Applications ({applications.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
}
