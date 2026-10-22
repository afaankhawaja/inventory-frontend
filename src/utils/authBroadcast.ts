export const AUTH_CHANNEL_NAME = "auth_channel";

export type AuthBroadcastMessage =
  | { type: "LOGOUT" }
  | { type: "LOGIN" };

let authChannel: BroadcastChannel | null = null;

export const getAuthBroadcastChannel = (): BroadcastChannel | null => {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }
  if (!authChannel) {
    try {
      authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    } catch (e) {
      console.warn("BroadcastChannel failed to initialize:", e);
      return null;
    }
  }
  return authChannel;
};

// Broadcasts a logout event to all other tabs/windows.

export const broadcastLogout = (): void => {
  try {
    const channel = getAuthBroadcastChannel();
    if (channel) {
      channel.postMessage({ type: "LOGOUT" });
    }
  } catch (error) {
    console.error("Failed to broadcast logout message:", error);
  }
};

// Broadcasts a login event to all other tabs/windows

export const broadcastLogin = (): void => {
  try {
    const channel = getAuthBroadcastChannel();
    if (channel) {
      channel.postMessage({ type: "LOGIN" });
    }
  } catch (error) {
    console.error("Failed to broadcast login message:", error);
  }
};

// Subscribes to auth events sent across tabs.

export const subscribeToAuthBroadcast = (
  callback: (message: AuthBroadcastMessage) => void
): (() => void) => {
  const channel = getAuthBroadcastChannel();
  if (!channel) {
    return () => {};
  }

  const listener = (event: MessageEvent<AuthBroadcastMessage>) => {
    if (event?.data && typeof event.data === "object" && event.data.type) {
      callback(event.data);
    }
  };

  channel.addEventListener("message", listener);

  return () => {
    channel.removeEventListener("message", listener);
  };
};
