"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { usePoints } from "./points-context";

// -------------------- Types --------------------
interface NGO {
  _id: string;
  name: string;
  email: string;
}

export interface DonationEvent {
  _id: string;
  ngo: NGO;
  title: string;
  description: string;
  goalAmount: number;
  collectedAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  paymentMethod?: "UPI" | "Bank" | "PayPal" | "Razorpay";
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  eventId: string;
}

// -------------------- Context Type --------------------
interface DonationEventContextType {
  events: DonationEvent[];
  loading: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (
    eventData: Omit<
      DonationEvent,
      "_id" | "collectedAmount" | "status" | "createdAt" | "updatedAt" | "ngo"
    >
  ) => Promise<DonationEvent | null>;
  createRazorpayOrder: (
    eventId: string,
    amount: number
  ) => Promise<RazorpayOrderResponse | null>;
  handleRazorpayPayment: (eventId: string, amount: number) => Promise<void>;
}

const DonationEventContext = createContext<
  DonationEventContextType | undefined
>(undefined);

// -------------------- Provider --------------------
interface Props {
  children: ReactNode;
}

export const DonationEventProvider = ({ children }: Props) => {
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const { earnPoints } = usePoints();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  // -------------------- Load Razorpay Script --------------------
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // -------------------- Fetch Events --------------------
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ events: DonationEvent[] }>(
        "/v1/donation-event/getallevent"
      );
      setEvents(res.data.events);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Add Event --------------------
  const addEvent = async (
    eventData: Omit<
      DonationEvent,
      "_id" | "collectedAmount" | "status" | "createdAt" | "updatedAt" | "ngo"
    > | FormData
  ) => {
    setLoading(true);
    try {
      const headers: any = { Authorization: `Bearer ${token}` };
      
      // If FormData, let browser set Content-Type with boundary
      if (!(eventData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const res = await api.post<{ event: DonationEvent }>(
        "/v1/donation-event/create-event",
        eventData,
        { 
          headers,
          withCredentials: true 
        }
      );
      setEvents((prev) => [res.data.event, ...prev]);
      toast.success("Event created successfully! Pending admin approval.");
      return res.data.event;
    } catch (err: any) {
      console.error("Failed to add event:", err);
      toast.error(err.response?.data?.message || "Failed to add event");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Create Razorpay Order --------------------
  const createRazorpayOrder = async (
    eventId: string,
    amount: number
  ): Promise<RazorpayOrderResponse | null> => {
    try {
      const res = await api.post<{
        success: boolean;
        order: RazorpayOrderResponse;
      }>("/v1/payment/create-order", { eventId, amount });
      return res.data.order;
    } catch (err: any) {
      console.error("Razorpay order creation failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to create payment order"
      );
      return null;
    }
  };

  // -------------------- Handle Razorpay Payment --------------------
  const handleRazorpayPayment = async (eventId: string, amount: number) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load. Check your connection.");
      return;
    }

    const order = await createRazorpayOrder(eventId, amount);
    if (!order) return;

    if (typeof window === "undefined" || !(window as any).Razorpay) {
      toast.error("Razorpay SDK not available.");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      amount: order.amount, // in paise
      currency: order.currency,
      name: "iVolunteer",
      description: "Donation",
      order_id: order.orderId,
      handler: async (response: any) => {
        try {
          // Define the API response type
          interface DonationResponse {
            success: boolean;
            donation: {
              _id: string;
              amount: number;
              eventId: string;
            };
          }

          // Tell TypeScript the response type
          const res = await api.post<DonationResponse>("/v1/donation/donate", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            eventId,
            amount,
          });

          toast.success("Donation successful!");

          // Safely call earnPoints if donation ID exists
          if (res.data.donation?._id) {
            earnPoints("everyDonation", res.data.donation._id);
            toast.success("10+ points");
          }

          // Refresh events once
          fetchEvents();
        } catch (err) {
          console.error("Payment verification failed:", err);
          toast.error("Payment verification failed");
        }
      },
      prefill: {
        name: "Donor",
        email: "donor@example.com",
      },
      theme: { color: "#0ea5e9" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <DonationEventContext.Provider
      value={{
        events,
        loading,
        fetchEvents,
        addEvent,
        createRazorpayOrder,
        handleRazorpayPayment,
      }}
    >
      {children}
    </DonationEventContext.Provider>
  );
};

// -------------------- Hook --------------------
export const useDonationEvent = (): DonationEventContextType => {
  const context = useContext(DonationEventContext);
  if (!context)
    throw new Error(
      "useDonationEvent must be used within a DonationEventProvider"
    );
  return context;
};