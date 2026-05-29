"use client";

import { useState } from "react";
import AuthFlow from "@/components/AuthFlow";
import WateringCounter from "@/components/WateringCounter";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [roommateName, setRoommateName] = useState("");

  const handleAuth = (deviceId: string, roommateName: string) => {
    setDeviceId(deviceId);
    setRoommateName(roommateName);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthFlow onAuth={handleAuth} />;
  }

  return <WateringCounter deviceId={deviceId} roommateName={roommateName} />;
}
