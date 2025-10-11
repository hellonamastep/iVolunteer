"use client";

import { ReactNode } from "react";
import { NGOProvider } from "@/contexts/ngo-context";
import { AuthProvider } from "@/contexts/auth-context";
// import { EventsProvider } from "@/contexts/events-context";
import { AdminProvider } from "@/contexts/admin-context";
import { UserProvider } from "@/contexts/user-context";
import { PostProvider } from "@/contexts/post-context";
import { ToastContainer } from "react-toastify";
import { Toaster } from "@/components/ui/toaster";
import { CorporateProvider } from "@/contexts/corporate-context";
import { DonationEventProvider } from "@/contexts/donationevents-context";
import { PointsProvider } from "@/contexts/points-context";
import { GroupsProvider } from "@/contexts/groups-context";
import { ParticipationRequestProvider } from "@/contexts/participation-request-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
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
                        {children}
                        <ToastContainer
                          position="top-right"
                          autoClose={3000}
                          hideProgressBar
                          closeOnClick
                          pauseOnHover
                          draggable
                          theme="light"
                        />
                        <Toaster />
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
  );
}
