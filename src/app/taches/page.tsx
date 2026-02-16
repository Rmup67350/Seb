import { Suspense } from "react";
import TachesPageContent from "@/components/TachesPageContent";

export default function TachesPage() {
  return (
    <Suspense fallback={<div className="fade-in text-center py-16">Chargement...</div>}>
      <TachesPageContent />
    </Suspense>
  );
}
