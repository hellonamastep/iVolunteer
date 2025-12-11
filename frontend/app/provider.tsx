"use client";

import { ReactNode } from "react";
import { NGOProvider } from "@/contexts/ngo-context";
import { AuthProvider } from "@/contexts/auth-context";
import { EventsProvider } from "@/contexts/events-context"; // ✅ uncommented
import { AdminProvider } from "@/contexts/admin-context";
import { UserProvider } from "@/contexts/user-context";
import { PostProvider } from "@/contexts/post-context";
import { ToastContainer } from "react-toastify";
import { Toaster } from "@/components/ui/toaster";
import { CorporateProvider } from "@/contexts/corporate-context";
import { DonationEventProvider } from "@/contexts/donationevents-context";
import { PointsProvider } from "@/contexts/points-context";
import { GroupsProvider } from "@/contexts/groups-context";
import { BlogProvider } from "@/contexts/blog-context";
import { CorporateEventProvider } from "@/contexts/corporateEvent-context";
import { ParticipationRequestProvider } from "@/contexts/participation-request-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PostDeletionAlert } from "@/components/post-deletion-alert";


export function Providers({ children }: { children: ReactNode }) {
  return (
     <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
    <PointsProvider>
      <AuthProvider>
        <UserProvider>
          <AdminProvider>
            <NGOProvider>
              <CorporateProvider>
                <PostProvider>
                  <GroupsProvider>
                    <ParticipationRequestProvider>
                      <DonationEventProvider>
                        <BlogProvider>
                          <CorporateEventProvider>
                            <EventsProvider> {/* ✅ wrap it here */}
                              {children}
                              <PostDeletionAlert />
                              <ToastContainer
                                position="top-right"
                                autoClose={3000}
                                hideProgressBar
                                closeOnClick
                                pauseOnHover
                                draggable
                                theme="light"
                                limit={3}
                                newestOnTop
                              />
                              <Toaster />
                            </EventsProvider>
                          </CorporateEventProvider>
                        </BlogProvider>
                      </DonationEventProvider>
                    </ParticipationRequestProvider>
                  </GroupsProvider>
                </PostProvider>
              </CorporateProvider>
            </NGOProvider>
          </AdminProvider>
        </UserProvider>
      </AuthProvider>
    </PointsProvider>
    </GoogleOAuthProvider>
  );
}
