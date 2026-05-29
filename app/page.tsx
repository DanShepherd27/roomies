"use client";

import { useState } from "react";
import AuthFlow from "@/components/AuthFlow";
import WateringCounter from "@/components/WateringCounter";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [roommateName, setRoommateName] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const handleAuth = (deviceId: string, roommateName: string, accessCode: string) => {
    setDeviceId(deviceId);
    setRoommateName(roommateName);
    setAccessCode(accessCode);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthFlow onAuth={handleAuth} />;
  }

  return (
    <WateringCounter 
      deviceId={deviceId} 
      initialRoommateName={roommateName} 
      accessCode={accessCode} 
    />
  );
}
