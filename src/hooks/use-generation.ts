"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface GenerationState {
  id: string | null;
  status: "idle" | "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  outputUrl: string | null;
  outputType: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  creditsCost: number | null;
  creditsRemaining: number | null;
}

const initialState: GenerationState = {
  id: null,
  status: "idle",
  outputUrl: null,
  outputType: null,
  errorCode: null,
  errorMessage: null,
  creditsCost: null,
  creditsRemaining: null,
};

export function useGeneration() {
  const [state, setState] = useState<GenerationState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      attemptRef.current = 0;
      setIsPolling(true);

      intervalRef.current = setInterval(async () => {
        attemptRef.current++;
        // Stop after 200 attempts (~6.7 minutes at 2s intervals)
        if (attemptRef.current > 200) {
          stopPolling();
          setState((prev) => ({ ...prev, status: "FAILED", errorMessage: "Generation timed out" }));
          return;
        }

        try {
          const res = await fetch(`/api/generate/${id}`);
          if (!res.ok) throw new Error("Poll failed");

          const data = await res.json();
          setState((prev) => ({
            ...prev,
            status: data.status,
            outputUrl: data.outputUrl,
            outputType: data.outputType,
            errorCode: data.errorCode,
            errorMessage: data.errorMessage,
            completedAt: data.completedAt,
          }));

          if (data.status === "SUCCEEDED" || data.status === "FAILED" || data.status === "CANCELLED") {
            stopPolling();
          }
        } catch {
          // Network error — keep polling
        }
      }, 2000);
    },
    [stopPolling]
  );

  const submit = useCallback(
    async (params: {
      type: string;
      model: string;
      prompt?: string;
      negativePrompt?: string;
      imageUrl?: string;
      params?: Record<string, unknown>;
    }) => {
      setSubmitting(true);
      setState({ ...initialState, status: "PENDING" });

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const data = await res.json();

        if (!res.ok) {
          setState({
            ...initialState,
            status: "FAILED",
            errorCode: String(res.status),
            errorMessage: data.error || "Generation failed",
          });
          return null;
        }

        setState((prev) => ({
          ...prev,
          id: data.id,
          status: data.status,
          creditsCost: data.creditsCost,
          creditsRemaining: data.creditsRemaining,
        }));

        startPolling(data.id);
        return data;
      } catch (error) {
        setState({
          ...initialState,
          status: "FAILED",
          errorCode: "NETWORK_ERROR",
          errorMessage: error instanceof Error ? error.message : "Network error",
        });
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [startPolling]
  );

  const reset = useCallback(() => {
    stopPolling();
    setState(initialState);
    setSubmitting(false);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    ...state,
    submitting,
    submit,
    reset,
    isPolling,
  };
}
