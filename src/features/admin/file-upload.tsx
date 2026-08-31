"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, Upload } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { adminFieldClass } from "@/features/admin/form-ui";
import { uploadFile } from "@/lib/api";
import { isImageMedia, uploadAssetSrc } from "@/lib/utils";

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
  const localPreviewRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);
  const [imgKey, setImgKey] = useState(0);
  const showImagePreview = accept.includes("image") && (Boolean(localPreview) || isImageMedia(value));
  const serverPreviewSrc = isImageMedia(value) ? uploadAssetSrc(value) : "";
  const previewSrc = localPreview || serverPreviewSrc;

  useEffect(() => {
    setPreviewBroken(false);
    setImgKey(0);
  }, [value]);

  useEffect(() => {
    localPreviewRef.current = localPreview;
  }, [localPreview]);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    };
  }, []);

  const setBlobPreview = (file: File) => {
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    const blobUrl = URL.createObjectURL(file);
    localPreviewRef.current = blobUrl;
    setLocalPreview(blobUrl);
    setPreviewBroken(false);
  };

  const clearBlobPreview = () => {
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    localPreviewRef.current = null;
    setLocalPreview(null);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBlobPreview(file);
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFile(file);
      onChange(uploaded.url, { name: uploaded.name, size: uploaded.size });
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleImgError = () => {
    if (localPreview) return;
    if (imgKey < 3) {
      window.setTimeout(() => setImgKey((key) => key + 1), 400);
      return;
    }
    setPreviewBroken(true);
  };

  const handleImgLoad = () => {
    setPreviewBroken(false);
    if (localPreview && serverPreviewSrc) clearBlobPreview();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Input
          value={value}
          onChange={(e) => {
            clearBlobPreview();
            setPreviewBroken(false);
            setImgKey(0);
            onChange(e.target.value);
          }}
          className={adminFieldClass}
          placeholder="/uploads/file.jpg"
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
          className="shrink-0 rounded-[5px]"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "…" : label}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {showImagePreview && (
        <div className="relative h-36 w-full max-w-xs overflow-hidden rounded-[5px] border border-border bg-muted">
          {!previewBroken && previewSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={`${previewSrc}-${imgKey}`}
              src={
                imgKey > 0 && serverPreviewSrc && !localPreview
                  ? `${serverPreviewSrc}${serverPreviewSrc.includes("?") ? "&" : "?"}t=${imgKey}`
                  : previewSrc
              }
              alt=""
              className="h-full w-full object-cover"
              onLoad={handleImgLoad}
              onError={handleImgError}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-5 w-5" />
              <span className="px-3 text-center text-xs">{value}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
