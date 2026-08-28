"use client";

import { useSearchParams } from "next/navigation";
import { CategoryForm } from "@/features/admin/category-form";

export default function AdminCreateCategoryPage() {
  const searchParams = useSearchParams();
  const defaultParentId = searchParams.get("parentId") ?? undefined;

  return <CategoryForm defaultParentId={defaultParentId} />;
}
