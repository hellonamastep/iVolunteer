"use client";

import { ReactNode } from "react";
import { NGOProvider } from "@/contexts/ngo-context";
import { AuthProvider } from "@/contexts/auth-context";
// import { EventsProvider } from "@/contexts/events-context";
import { AdminProvider } from "@/contexts/admin-context";
import { UserProvider } from "@/contexts/user-context";
import { PostProvider } from "@/contexts/post-context";
import { ToastContainer } from "react-toastify";
import { CorporateProvider } from "@/contexts/corporate-context";
import { DonationEventProvider } from "@/contexts/donationevents-context";
import { PointsProvider } from "@/contexts/points-context";
import { GroupsProvider } from "@/contexts/groups-context";
import { BlogProvider } from "@/contexts/blog-context";
import { CorporateEventProvider } from "@/contexts/corporateEvent-context";

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
                    <DonationEventProvider>
                      <BlogProvider>
                        <CorporateEventProvider>
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
                        </CorporateEventProvider>
                      </BlogProvider>
                    </DonationEventProvider>
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
