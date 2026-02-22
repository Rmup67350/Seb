import type { Task } from "@/types/task";
import { isTaskOverdue, isTaskDueSoon, getDaysUntilDue } from "./task-service";

/**
 * Demande la permission pour les notifications push
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("Ce navigateur ne supporte pas les notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

/**
 * Vérifie si les notifications sont supportées et autorisées
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Vérifie le statut actuel des permissions
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/**
 * Envoie une notification via le Service Worker
 */
async function sendNotification(title: string, body: string, tag?: string) {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  if (registration.active) {
    registration.active.postMessage({
      type: "SHOW_NOTIFICATION",
      title,
      body,
      tag,
      data: { url: "/taches" },
    });
  }
}

/**
 * Vérifie les tâches et envoie des notifications pour celles en retard ou bientôt dues
 */
export function checkTasksAndNotify(tasks: Task[]) {
  if (Notification.permission !== "granted") return;

  const overdueTasks = tasks.filter((t) => isTaskOverdue(t));
  const dueSoonTasks = tasks.filter((t) => isTaskDueSoon(t) && !isTaskOverdue(t));

  // Notification pour les tâches en retard
  if (overdueTasks.length > 0) {
    const body =
      overdueTasks.length === 1
        ? `"${overdueTasks[0].titre}" est en retard !`
        : `${overdueTasks.length} tâches sont en retard !`;

    sendNotification("Tâches en retard", body, "ferme-overdue");
  }

  // Notification pour les tâches bientôt dues
  if (dueSoonTasks.length > 0) {
    const body =
      dueSoonTasks.length === 1
        ? `"${dueSoonTasks[0].titre}" arrive à échéance ${getDaysUntilDue(dueSoonTasks[0]) === 0 ? "aujourd'hui" : `dans ${getDaysUntilDue(dueSoonTasks[0])} jour(s)`}`
        : `${dueSoonTasks.length} tâches arrivent bientôt à échéance`;

    sendNotification("Tâches à venir", body, "ferme-due-soon");
  }
}

/**
 * Programme une vérification quotidienne des tâches (à 10h)
 * Retourne un cleanup function
 */
export function scheduleTaskNotifications(tasks: Task[]): () => void {
  // Vérification immédiate
  checkTasksAndNotify(tasks);

  // Calcul du prochain 10h
  const now = new Date();
  const next10am = new Date();
  next10am.setHours(10, 0, 0, 0);
  if (now >= next10am) {
    next10am.setDate(next10am.getDate() + 1);
  }
  const msUntil10am = next10am.getTime() - now.getTime();

  // Premier timer pour 10h, puis interval toutes les 24h
  let dailyInterval: ReturnType<typeof setInterval> | null = null;

  const initialTimeout = setTimeout(() => {
    checkTasksAndNotify(tasks);
    dailyInterval = setInterval(() => {
      checkTasksAndNotify(tasks);
    }, 24 * 60 * 60 * 1000);
  }, msUntil10am);

  return () => {
    clearTimeout(initialTimeout);
    if (dailyInterval) clearInterval(dailyInterval);
  };
}
