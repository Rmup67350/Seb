import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = "animaux";

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
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) return { success: false, error: error.message };

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { success: true, url: urlData.publicUrl, storagePath: path };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteFile(path: string): Promise<StorageResult> {
  try {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
