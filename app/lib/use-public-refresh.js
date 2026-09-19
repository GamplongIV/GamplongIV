import { useEffect, useState } from "react";
import { subscribeToWebsiteDataChanges } from "./data-change";
import { invalidatePublicDataCache } from "./public-data";

export function usePublicDataVersion() {
  const [version, setVersion] = useState(0);

  useEffect(() => subscribeToWebsiteDataChanges(() => {
    invalidatePublicDataCache();
    setVersion((value) => value + 1);
  }), []);

  return version;
}