"use client";

import { useState, useCallback } from "react";

interface UploadState {
  uploading: boolean;
  progress: number;
  key: string | null;
  url: string | null;
  error: string | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    key: null,
    url: null,
    error: null,
  });

  const upload = useCallback(async (file: File) => {
    setState({ uploading: true, progress: 0, key: null, url: null, error: null });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setState({ uploading: false, progress: 0, key: null, url: null, error: data.error || "Upload failed" });
        return null;
      }

      setState({
        uploading: false,
        progress: 100,
        key: data.key,
        url: data.url,
        error: null,
      });

      return data;
    } catch (error) {
      setState({
        uploading: false,
        progress: 0,
        key: null,
        url: null,
        error: error instanceof Error ? error.message : "Upload failed",
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, key: null, url: null, error: null });
  }, []);

  return { ...state, upload, reset };
}
