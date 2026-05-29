// Client-side utility to get MAC address or generate a unique device ID
export async function getMacAddress(): Promise<string | null> {
  try {
    // Try to get MAC address via WebRTC if available
    const macAddress = await getMAViaWebRTC();
    if (macAddress) {
      return macAddress;
    }
  } catch (error) {
    console.log("WebRTC MAC address retrieval failed:", error);
  }

  return null;
}

// Attempt to get MAC address using WebRTC (works on some systems)
function getMAViaWebRTC(): Promise<string | null> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const WindowType = window as any;
    const rtcPeerConnection = new (
      WindowType.RTCPeerConnection ||
      WindowType.webkitRTCPeerConnection ||
      WindowType.mozRTCPeerConnection
    )({ iceServers: [] });

    rtcPeerConnection.createDataChannel("");

    rtcPeerConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
      rtcPeerConnection.setLocalDescription(offer);
    });

    rtcPeerConnection.onicecandidate = (
      event: RTCPeerConnectionIceEvent | null,
    ) => {
      if (!event || !event.candidate) return;
      const candidateString = event.candidate.candidate;

      if (!candidateString) return;

      const ipRegex =
        /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
      const ipAddress = ipRegex.exec(candidateString)?.[1];

      if (!ipAddress) return;

      // Try to extract MAC from candidate string
      const macRegex =
        /([a-f0-9]{2}:[a-f0-9]{2}:[a-f0-9]{2}:[a-f0-9]{2}:[a-f0-9]{2}:[a-f0-9]{2})/i;
      const mac = macRegex.exec(candidateString)?.[1];

      if (mac) {
        rtcPeerConnection.close();
        resolve(mac);
      }
    };

    setTimeout(() => {
      rtcPeerConnection.close();
      resolve(null);
    }, 1000);
  });
}

// Generate a fallback unique device ID based on browser fingerprint
export function generateFallbackDeviceId(): string {
  const navigator_ = typeof navigator !== "undefined" ? navigator : null;
  const userAgent = navigator_?.userAgent || "";
  const language = navigator_?.language || "";
  const timezone = new Date().getTimezoneOffset().toString();

  const fingerprint = `${userAgent}|${language}|${timezone}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return `device_${Math.abs(hash).toString(16)}`;
}
