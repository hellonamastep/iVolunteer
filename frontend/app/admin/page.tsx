"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Clock, Users, Check, X, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEvents } from "@/contexts/events-context"
import { useGroups } from "@/contexts/groups-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function AdminPanel() {
  const { user } = useAuth()
  const { events, approveEvent, rejectEvent } = useEvents()
  const { groups, approveGroup, rejectGroup, getPendingGroups } = useGroups()
  const router = useRouter()
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showGroupRejectDialog, setShowGroupRejectDialog] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState<'events' | 'groups'>('events')

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/auth")
    } else {
      // Load pending groups when admin panel loads
      getPendingGroups().catch(console.error)
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  const pendingEvents = events.filter((event) => event.status === "pending")
  const approvedEvents = events.filter((event) => event.status === "approved")
  const rejectedEvents = events.filter((event) => event.status === "rejected")

  const pendingGroups = groups.filter((group) => group.status === "pending")
  const approvedGroups = groups.filter((group) => group.status === "approved")
  const rejectedGroups = groups.filter((group) => group.status === "rejected")

  const handleApprove = (eventId: string) => {
    approveEvent(eventId)
  }

  const handleReject = (eventId: string) => {
    setSelectedEventId(eventId)
    setRejectionReason("")
    setShowRejectDialog(true)
  }

  const handleApproveGroup = async (groupId: string) => {
    try {
      await approveGroup(groupId)
      await getPendingGroups() // Refresh list
    } catch (error) {
      console.error('Failed to approve group:', error)
      alert('Failed to approve group. Please try again.')
    }
  }

  const handleRejectGroup = (groupId: string) => {
    setSelectedGroupId(groupId)
    setRejectionReason("")
    setShowGroupRejectDialog(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedEventId) return
    
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }
    
    setIsSubmitting(true)
    const success = await rejectEvent(selectedEventId, rejectionReason.trim())
    setIsSubmitting(false)
    
    if (success) {
      setShowRejectDialog(false)
      setSelectedEventId(null)
      setRejectionReason("")
    } else {
      alert("Failed to reject event. Please try again.")
    }
  }

  const handleRejectCancel = () => {
    setShowRejectDialog(false)
    setSelectedEventId(null)
    setRejectionReason("")
  }

  const handleGroupRejectConfirm = async () => {
    if (!selectedGroupId) return
    
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }
    
    setIsSubmitting(true)
    try {
      await rejectGroup(selectedGroupId, rejectionReason.trim())
      await getPendingGroups() // Refresh list
      setShowGroupRejectDialog(false)
      setSelectedGroupId(null)
      setRejectionReason("")
    } catch (error) {
      console.error('Failed to reject group:', error)
      alert("Failed to reject group. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGroupRejectCancel = () => {
    setShowGroupRejectDialog(false)
    setSelectedGroupId(null)
    setRejectionReason("")
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

  const GroupCard = ({ group, showActions = false }: { group: any; showActions?: boolean }) => (
    <Card key={group._id} className="border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <CardDescription className="text-primary font-medium">
              Created by {group.creator?.name || 'Unknown'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {group.category}
            </Badge>
            <Badge className={getStatusColor(group.status)}>
              {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{group.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {group.city || 'Unknown'}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            Max {group.maxMembers} members
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {group.memberCount || 0} current members
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {group.isPrivate ? '🔒 Private' : '🌍 Public'}
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
              onClick={() => handleApproveGroup(group._id)}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
              onClick={() => handleRejectGroup(group._id)}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {group.rejectionReason && (
          <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
            <strong>Rejection Reason:</strong> {group.rejectionReason}
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground">
          Created: {new Date(group.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )

  const EventCard = ({ event, showActions = false }: { event: any; showActions?: boolean }) => (
    <Card key={event.id} className="border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription className="text-primary font-medium">{event.organization}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {event.category}
            </Badge>
            <Badge className={getStatusColor(event.status)}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
            Max {event.maxParticipants} participants
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-accent font-semibold">
            <span className="text-lg">🪙</span>
            {event.coins} coins reward
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                onClick={() => handleApprove(event.id)}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                onClick={() => handleReject(event.id)}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Created: {new Date(event.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 pb-20">
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground">Manage and approve volunteer events and groups</p>
            </div>
          </div>

          {/* Main Tabs for Events and Groups */}
          <Tabs value={activeMainTab} onValueChange={(value) => setActiveMainTab(value as 'events' | 'groups')} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="events" className="relative">
                Events
                {pendingEvents.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs p-0 flex items-center justify-center">
                    {pendingEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="groups" className="relative">
                Groups
                {pendingGroups.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs p-0 flex items-center justify-center">
                    {pendingGroups.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Events Tab Content */}
          {activeMainTab === 'events' && (
            <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingEvents.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs p-0 flex items-center justify-center">
                    {pendingEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedEvents.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingEvents.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Check className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Events</h3>
                    <p className="text-muted-foreground text-center">All events have been reviewed!</p>
                  </CardContent>
                </Card>
              ) : (
                pendingEvents.map((event) => <EventCard key={event.id} event={event} showActions={true} />)
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedEvents.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Check className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Approved Events</h3>
                    <p className="text-muted-foreground text-center">Approved events will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                approvedEvents.map((event) => <EventCard key={event.id} event={event} />)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-6">
              {rejectedEvents.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <X className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Rejected Events</h3>
                    <p className="text-muted-foreground text-center">Rejected events will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                rejectedEvents.map((event) => <EventCard key={event.id} event={event} />)
              )}
            </TabsContent>
          </Tabs>
          )}

          {/* Groups Tab Content */}
          {activeMainTab === 'groups' && (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {pendingGroups.length > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs p-0 flex items-center justify-center">
                      {pendingGroups.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedGroups.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedGroups.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-6">
                {pendingGroups.length === 0 ? (
                  <Card className="border-border">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Check className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Groups</h3>
                      <p className="text-muted-foreground text-center">All groups have been reviewed!</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingGroups.map((group) => <GroupCard key={group._id} group={group} showActions={true} />)
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4 mt-6">
                {approvedGroups.length === 0 ? (
                  <Card className="border-border">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Check className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Approved Groups</h3>
                      <p className="text-muted-foreground text-center">Approved groups will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  approvedGroups.map((group) => <GroupCard key={group._id} group={group} />)
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-6">
                {rejectedGroups.length === 0 ? (
                  <Card className="border-border">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <X className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Rejected Groups</h3>
                      <p className="text-muted-foreground text-center">Rejected groups will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  rejectedGroups.map((group) => <GroupCard key={group._id} group={group} />)
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Navigation />

      {/* Rejection Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this event. This will be visible to the event organizer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="e.g., Event does not meet community guidelines, Incomplete event details, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                {rejectionReason.length}/500 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleRejectCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? "Rejecting..." : "Reject Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Rejection Reason Dialog */}
      <Dialog open={showGroupRejectDialog} onOpenChange={setShowGroupRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Group</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this group. This will be visible to the group creator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="group-rejection-reason"
                placeholder="e.g., Group name violates community guidelines, Inappropriate content, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                {rejectionReason.length}/500 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleGroupRejectCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleGroupRejectConfirm}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? "Rejecting..." : "Reject Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
