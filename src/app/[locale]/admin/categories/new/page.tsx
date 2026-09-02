"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryForm } from "@/features/admin/category-form";

function AdminCreateCategoryContent() {
  const searchParams = useSearchParams();
  const defaultParentId = searchParams.get("parentId") ?? undefined;

  return <CategoryForm defaultParentId={defaultParentId} />;
}

export default function AdminCreateCategoryPage() {
  return (
    <Suspense fallback={null}>
      <AdminCreateCategoryContent />
    </Suspense>
  );
}
