"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import { addDocument, deleteDocument, type AnimalDocument } from "@/services/animal-detail-service";
import { formatDate } from "@/lib/utils";

interface VetDocumentsProps {
  animalId: string;
  documents: AnimalDocument[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string): string {
  if (type.startsWith("image/")) return "🖼️";
  if (type === "application/pdf") return "📄";
  return "📎";
}

export default function VetDocuments({ animalId, documents }: VetDocumentsProps) {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AnimalDocument | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await addDocument(animalId, file);
        if (!result.success) {
          showToast({ type: "error", title: "Erreur", message: result.error || "Erreur lors de l'upload" });
        }
      }
      showToast({ type: "success", title: "Succès", message: `${files.length} document(s) ajouté(s)` });
    } catch {
      showToast({ type: "error", title: "Erreur", message: "Erreur lors de l'upload" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteDocument(animalId, deleteTarget.id, deleteTarget.storagePath);
    if (result.success) {
      showToast({ type: "success", title: "Succès", message: "Document supprimé" });
    } else {
      showToast({ type: "error", title: "Erreur", message: result.error || "Erreur" });
    }
    setDeleteTarget(null);
  };

  const sortedDocs = [...documents].sort(
    (a, b) => new Date(b.dateCreation || "").getTime() - new Date(a.dateCreation || "").getTime()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Documents vétérinaires</h2>
        <label className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-primary to-secondary rounded-lg hover:from-primary-dark hover:to-secondary-dark cursor-pointer">
          {uploading ? "Upload..." : "+ Ajouter"}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {sortedDocs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>Aucun document</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {sortedDocs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 py-3">
              <span className="text-2xl">{getFileIcon(doc.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{doc.nom}</div>
                <div className="text-xs text-gray-400">
                  {formatFileSize(doc.taille)} · {formatDate(doc.dateCreation)}
                </div>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                Ouvrir
              </a>
              <button
                onClick={() => setDeleteTarget(doc)}
                className="px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 cursor-pointer bg-transparent border-none"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Supprimer le document" size="small">
        <p className="text-gray-700">Voulez-vous vraiment supprimer <strong>{deleteTarget?.nom}</strong> ?</p>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 cursor-pointer">
            Annuler
          </button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 cursor-pointer">
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}
