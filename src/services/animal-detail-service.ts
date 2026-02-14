import firebaseService from "@/lib/firebase-service";
import { uploadFile, deleteFile } from "@/lib/firebase-storage";

// ============ Interfaces ============

export interface WeightEntry {
  id: string;
  animalId: string;
  poids: number;
  date: string;
  note?: string;
  dateCreation?: string;
  derniereMAJ?: string;
}

export interface AnimalPhoto {
  id: string;
  animalId: string;
  url: string;
  storagePath: string;
  nom: string;
  description?: string;
  dateCreation?: string;
  derniereMAJ?: string;
}

export interface AnimalDocument {
  id: string;
  animalId: string;
  url: string;
  storagePath: string;
  nom: string;
  type: string;
  taille: number;
  description?: string;
  dateCreation?: string;
  derniereMAJ?: string;
}

export interface HistoryEntry {
  id: string;
  animalId: string;
  date: string;
  sujet: string;
  description?: string;
  dateCreation?: string;
  derniereMAJ?: string;
}

// ============ Poids ============

const WEIGHTS_PATH = (animalId: string) => `animaux-poids/${animalId}`;

export async function addWeight(animalId: string, data: { poids: number; date: string; note?: string }) {
  const payload: Record<string, unknown> = { poids: data.poids, date: data.date, animalId };
  if (data.note) payload.note = data.note;
  const result = await firebaseService.create(WEIGHTS_PATH(animalId), payload);
  if (result.success) {
    await firebaseService.update("animaux", animalId, { poids: data.poids });
  }
  return result;
}

export async function updateWeight(animalId: string, weightId: string, data: Record<string, unknown>) {
  return firebaseService.update(WEIGHTS_PATH(animalId), weightId, data);
}

export async function deleteWeight(animalId: string, weightId: string) {
  return firebaseService.delete(WEIGHTS_PATH(animalId), weightId);
}

export function listenWeights(animalId: string, callback: (data: WeightEntry[]) => void) {
  return firebaseService.listen<WeightEntry>(WEIGHTS_PATH(animalId), callback);
}

// ============ Photos ============

const PHOTOS_PATH = (animalId: string) => `animaux-photos/${animalId}`;

export async function addPhoto(animalId: string, file: File, description?: string) {
  const storagePath = `animaux/${animalId}/photos/${Date.now()}_${file.name}`;
  const uploadResult = await uploadFile(storagePath, file);
  if (!uploadResult.success) return uploadResult;

  const payload: Record<string, unknown> = {
    animalId,
    url: uploadResult.url!,
    storagePath,
    nom: file.name,
  };
  if (description) payload.description = description;
  return firebaseService.create(PHOTOS_PATH(animalId), payload);
}

export async function deletePhoto(animalId: string, photoId: string, storagePath: string) {
  await deleteFile(storagePath);
  return firebaseService.delete(PHOTOS_PATH(animalId), photoId);
}

export function listenPhotos(animalId: string, callback: (data: AnimalPhoto[]) => void) {
  return firebaseService.listen<AnimalPhoto>(PHOTOS_PATH(animalId), callback);
}

// ============ Documents ============

const DOCUMENTS_PATH = (animalId: string) => `animaux-documents/${animalId}`;

export async function addDocument(animalId: string, file: File, description?: string) {
  const storagePath = `animaux/${animalId}/documents/${Date.now()}_${file.name}`;
  const uploadResult = await uploadFile(storagePath, file);
  if (!uploadResult.success) return uploadResult;

  const payload: Record<string, unknown> = {
    animalId,
    url: uploadResult.url!,
    storagePath,
    nom: file.name,
    type: file.type,
    taille: file.size,
  };
  if (description) payload.description = description;
  return firebaseService.create(DOCUMENTS_PATH(animalId), payload);
}

export async function deleteDocument(animalId: string, docId: string, storagePath: string) {
  await deleteFile(storagePath);
  return firebaseService.delete(DOCUMENTS_PATH(animalId), docId);
}

export function listenDocuments(animalId: string, callback: (data: AnimalDocument[]) => void) {
  return firebaseService.listen<AnimalDocument>(DOCUMENTS_PATH(animalId), callback);
}

// ============ Historique ============

const HISTORY_PATH = (animalId: string) => `animaux-historique/${animalId}`;

export async function addHistoryEntry(animalId: string, data: { date: string; sujet: string; description?: string }) {
  const payload: Record<string, unknown> = { date: data.date, sujet: data.sujet, animalId };
  if (data.description) payload.description = data.description;
  return firebaseService.create(HISTORY_PATH(animalId), payload);
}

export async function updateHistoryEntry(animalId: string, entryId: string, data: Record<string, unknown>) {
  return firebaseService.update(HISTORY_PATH(animalId), entryId, data);
}

export async function deleteHistoryEntry(animalId: string, entryId: string) {
  return firebaseService.delete(HISTORY_PATH(animalId), entryId);
}

export function listenHistory(animalId: string, callback: (data: HistoryEntry[]) => void) {
  return firebaseService.listen<HistoryEntry>(HISTORY_PATH(animalId), callback);
}
