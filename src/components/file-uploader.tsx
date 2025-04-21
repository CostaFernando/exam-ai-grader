"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  accept: string;
  maxSize: number;
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  file?: File | null;
}

export function FileUploader({
  accept,
  maxSize,
  onFileSelect,
  multiple = false,
  file = null,
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (
    selectedFiles: File[]
  ): { validFiles: File[]; errorMsg: string | null } => {
    let errorMsg: string | null = null;
    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      const fileType = file.type;
      if (!accept.includes(fileType.split("/")[1])) {
        errorMsg = `Invalid file type. Please upload a ${accept} file.`;
        continue;
      }

      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSize) {
        errorMsg = `File ${file.name} is too large. Maximum size is ${maxSize}MB.`;
        continue;
      }

      validFiles.push(file);
    }

    return { validFiles, errorMsg };
  };

  const handleFilesChange = (selectedFiles: FileList | null) => {
    setError(null);

    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesToProcess = Array.from(selectedFiles);
    const { validFiles, errorMsg } = validateFiles(filesToProcess);

    if (errorMsg) {
      setError(errorMsg);
    }

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesChange(e.dataTransfer.files);
    }
  };

  const removeFile = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileSelect([]);
  };

  return (
    <div className="space-y-2">
      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-gray-300",
            error && "border-red-500"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-sm font-medium">
              Drag and drop {multiple ? "files" : "a file"} here or click to
              browse
            </p>
            <p className="text-xs text-gray-500">
              Supports {accept} files up to {maxSize}MB
            </p>
          </div>
          <input
            type="file"
            ref={inputRef}
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFilesChange(e.target.files)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
