"use client";

import { useState, useEffect } from "react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from "@/services/notification-service";

export default function TaskNotificationBanner() {
  const [permissionState, setPermissionState] = useState<"loading" | "unsupported" | "granted" | "denied" | "default">("loading");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) {
      setPermissionState("unsupported");
      return;
    }
    setPermissionState(getNotificationPermission());

    // Vérifier si déjà dismissé dans cette session
    const wasDismissed = sessionStorage.getItem("notif-banner-dismissed");
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    setPermissionState(granted ? "granted" : "denied");
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("notif-banner-dismissed", "true");
  };

  // Ne rien afficher si : chargement, déjà accordé, pas supporté, ou dismissé
  if (permissionState === "loading" || permissionState === "granted" || permissionState === "unsupported" || dismissed) {
    return null;
  }

  if (permissionState === "denied") {
    return null; // L'utilisateur a refusé, on ne re-demande pas
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-4 flex-wrap">
      <span className="text-2xl">🔔</span>
      <div className="flex-1 min-w-[200px]">
        <p className="text-sm text-blue-800 font-medium m-0">
          Activez les notifications pour recevoir des rappels quotidiens de vos tâches en retard ou à venir.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleEnable}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Activer
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
