// Service Worker pour les notifications de tâches
const CACHE_NAME = "ferme-v1";

// Installation
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

// Activation
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Réception de messages depuis l'app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, tag, data } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: tag || "ferme-task",
      data: data || {},
      requireInteraction: true,
      actions: [
        { action: "open", title: "Voir les tâches" },
        { action: "dismiss", title: "Fermer" },
      ],
    });
  }
});

// Clic sur la notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Si une fenêtre est déjà ouverte, on la focus
      for (const client of clients) {
        if (client.url.includes("/taches") && "focus" in client) {
          return client.focus();
        }
      }
      // Sinon on ouvre la page des tâches
      if (self.clients.openWindow) {
        return self.clients.openWindow("/taches");
      }
    })
  );
});
