"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { adminFieldClass } from "@/features/admin/form-ui";
import { uploadFile } from "@/lib/api";

export function FileUploadField({
  value,
  onChange,
  accept = "image/*,.pdf,.doc,.docx,.zip,.dwg",
  label = "Upload",
}: {
  value: string;
  onChange: (url: string, file?: { name: string; size: number }) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFile(file);
      onChange(uploaded.url, { name: uploaded.name, size: uploaded.size });
    } catch (err) {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={adminFieldClass}
          placeholder="/uploads/file.pdf"
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-xl"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "…" : label}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {value &&
        (/\.(png|jpe?g|webp|gif|svg)$/i.test(value.split("?")[0]) ||
          /^https?:\/\//i.test(value) ||
          value.startsWith("/uploads/")) && (
        <div className="relative h-24 w-36 overflow-hidden rounded-xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
