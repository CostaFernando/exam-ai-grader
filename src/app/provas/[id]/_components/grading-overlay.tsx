"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function GradingOverlay() {
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const totalTime = 120;
    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        const randomFactor = Math.random() * 0.5 + 0.75;
        const calculatedProgress = Math.min(
          100,
          (newTime / totalTime) * 100 * randomFactor
        );
        setProgress((prevProg) => Math.max(prevProg, calculatedProgress));
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBeforeNavigate = (e: PopStateEvent) => {
      e.preventDefault();
      setShowDialog(true);
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBeforeNavigate);
    return () => window.removeEventListener("popstate", handleBeforeNavigate);
  }, []);

  const formatTimeRemaining = () => {
    const remaining = Math.max(0, 120 - timeElapsed);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStatusMessage = () => {
    if (progress < 25) {
      return "Analyzing answer sheets...";
    } else if (progress < 50) {
      return "Comparing with answer key...";
    } else if (progress < 75) {
      return "Evaluating responses...";
    } else {
      return "Finalizing grades...";
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg border">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                {progress < 100 ? (
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                ) : (
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                )}
              </div>
              <svg className="h-24 w-24" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="4"
                  fill="transparent"
                  r="38"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-primary stroke-current"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="transparent"
                  r="38"
                  cx="50"
                  cy="50"
                  style={{
                    strokeDasharray: "239.56",
                    strokeDashoffset: `${239.56 - (239.56 * progress) / 100}`,
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                  }}
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold">Grading in Progress</h3>
              <p className="text-muted-foreground">{getStatusMessage()}</p>
            </div>

            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{Math.round(progress)}%</span>
                <span>Time remaining: {formatTimeRemaining()}</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md w-full">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">
                  Grading can take up to 2 minutes. Please don't close this
                  window or navigate away during the process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <h3 className="text-lg font-semibold">Grading in Progress</h3>
            </div>
            <p>
              Grading is still in progress. Leaving this page will cancel the
              grading process and your progress will be lost.
            </p>
            <p className="font-medium">Are you sure you want to leave?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                onClick={() => setShowDialog(false)}
              >
                Stay on Page
              </button>
              <button
                className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                onClick={() => (window.location.href = "/provas")}
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
