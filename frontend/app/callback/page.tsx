"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallback() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const base = process.env.NEXT_PUBLIC_OAUTH_BASE_URL; // e.g. http://localhost:5000/api
    if (!base) {
      router.replace("/dashboard");
      return;
    }

    (async () => {
      try {
        const r = await fetch(`${base}/v1/auth/user`, { credentials: "include" });
        if (r.ok) {
          const json = await r.json();
          const u = json?.user ?? json?.data?.user;
          if (u) {
            const mapped = {
              _id: u.userId,
              id: u.userId,
              email: u.email,
              name: u.name,
              role: u.role,
              points: u.points ?? 0,
              coins: u.coins ?? 0,
              volunteeredHours: 0,
              totalRewards: 0,
              completedEvents: [],
              createdAt: new Date().toISOString(),
              profilePicture: u.profilePicture ?? undefined,
              cloudinaryPublicId: u.cloudinaryPublicId ?? undefined,
              city: u.city ?? undefined,
            };
            localStorage.setItem("auth-user", JSON.stringify(mapped));
          }
        }
      } finally {
        router.replace("/dashboard");
      }
    })();
  }, [router]);

  return null;
}
