"use client";

import { useEffect, useState } from "react";

export default function Logo() {
  const [showStep, setShowStep] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowStep(prev => !prev);
    }, 3000); // toggle every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="h-5 flex gap-1 justify-center items-center relative">
        <img src="/images/NAMAS.png" alt="NAMAS" className="h-4" />

        <div className="relative w-4 h-6">
          {/* STEP.png */}
          <img
            src="/images/STEP.png"
            alt="STEP"
            className={`h-8 absolute transition-opacity duration-1000 ${
              showStep ? "opacity-100" : "opacity-0"
            }`}
            style={{ bottom: "0.2px", left: "50%", transform: "translateX(-50%)" }}
          />

          {/* T.png */}
          <img
            src="/images/T.png"
            alt="T"
            className={`h-4 absolute transition-opacity duration-1000 ${
              showStep ? "opacity-0" : "opacity-100"
            }`}
            style={{ bottom: "4px", left: "50%", transform: "translateX(-50%)" }}
          />
        </div>
        <img src="/images/EP.png" alt="EP" className="h-3.5" />
      </div>

      <img src="/images/WAVE.png" alt="WAVE" className="h-4" />
    </div>
  );
}
