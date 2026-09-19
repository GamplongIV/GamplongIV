const DATA_CHANGE_KEY = "gamplong:data-changed";
const DATA_CHANGE_CHANNEL = "gamplong-data-changed";

function signalId(payload) {
  if (!payload) return "";
  return String(payload.version || payload.at || "");
}

export function notifyWebsiteDataChanged(version = null) {
  if (typeof window === "undefined") return;

  const payload = {
    at: Date.now(),
    version: version == null ? null : String(version),
  };

  try {
    window.localStorage.setItem(DATA_CHANGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Tidak dapat mengirim sinyal perubahan data melalui localStorage:", error);
  }

  try {
    if ("BroadcastChannel" in window) {
      const channel = new window.BroadcastChannel(DATA_CHANGE_CHANNEL);
      channel.postMessage(payload);
      channel.close();
    }
  } catch (error) {
    console.warn("Tidak dapat mengirim sinyal perubahan data melalui BroadcastChannel:", error);
  }
}

export function subscribeToWebsiteDataChanges(onChange) {
  if (typeof window === "undefined") return () => {};

  let broadcastChannel = null;
  let lastSignal = "";

  const handle = (payload) => {
    const id = signalId(payload);
    if (!id || id === lastSignal) return;
    lastSignal = id;
    onChange?.(payload);
  };

  const handleStorage = (event) => {
    if (event.key !== DATA_CHANGE_KEY || !event.newValue) return;
    try {
      handle(JSON.parse(event.newValue));
    } catch {
      handle({ at: Date.now() });
    }
  };

  const handleBroadcast = (event) => handle(event?.data);

  window.addEventListener("storage", handleStorage);

  try {
    if ("BroadcastChannel" in window) {
      broadcastChannel = new window.BroadcastChannel(DATA_CHANGE_CHANNEL);
      broadcastChannel.addEventListener("message", handleBroadcast);
    }
  } catch (error) {
    console.warn("Tidak dapat berlangganan BroadcastChannel:", error);
  }

  return () => {
    window.removeEventListener("storage", handleStorage);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", handleBroadcast);
      broadcastChannel.close();
    }
  };
}