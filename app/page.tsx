"use client";

import { useState } from "react";
import AuthFlow from "@/components/AuthFlow";
import WateringCounter from "@/components/WateringCounter";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [roommateeName, setRoommateeName] = useState("");

  const handleAuth = (deviceId: string, roommateeName: string) => {
    setDeviceId(deviceId);
    setRoommateeName(roommateeName);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthFlow onAuth={handleAuth} />;
  }

  return <WateringCounter deviceId={deviceId} roommateeName={roommateeName} />;
}
