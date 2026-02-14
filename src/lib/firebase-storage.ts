import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

export interface StorageResult {
  success: boolean;
  url?: string;
  storagePath?: string;
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function uploadFile(
  path: string,
  file: File
): Promise<StorageResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "Le fichier dépasse la taille maximale de 10 MB" };
  }
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { success: true, url, storagePath: path };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteFile(path: string): Promise<StorageResult> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
