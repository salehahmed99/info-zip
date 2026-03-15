import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Archive,
  X,
  ScanSearch,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { events, extensions, filesystem, os } from "@neutralinojs/lib";

const BRAND_SPRING = { type: "spring" as const, duration: 0.4, bounce: 0.1 };

interface IFolder {
  name: string;
  path: string;
  size: string;
  fileCount: number;
}

interface IToast {
  type: "success" | "error";
  msg: string;
}

const App: React.FC = () => {
  const [isFolderLoaded, setIsFolderLoaded] = useState(false);
  const [folderData, setFolderData] = useState<IFolder | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
  const [toast, setToast] = useState<IToast | null>(null);

  useEffect(() => {
    const onProgress = (event: any) => {
      setZipProgress(event.detail.percentage);
    };

    const onComplete = () => {
      setZipProgress(100);
      setIsZipping(false);
      setToast({
        type: "success",
        msg: "Project zipped successfully!",
      });
      setTimeout(() => setToast(null), 4000);
    };

    const onError = () => {
      setIsZipping(false);
      setToast({
        type: "error",
        msg: "Failed to zip project!",
      });
      setTimeout(() => setToast(null), 4000);
    };

    events.on("zipProgress", onProgress);
    events.on("zipComplete", onComplete);
    events.on("zipError", onError);

    return () => {
      events.off("zipProgress", onProgress);
      events.off("zipComplete", onComplete);
      events.off("zipError", onError);
    };
  }, []);

  const handleZip = async () => {
    if (!folderData || isZipping) return;

    setIsZipping(true);
    setZipProgress(0);

    try {
      await extensions.dispatch("js.neutralino.zipper", "zipFolder", {
        path: folderData.path,
        fileCount: folderData.fileCount,
      });
    } catch (err) {
      setIsZipping(false);
      console.error("Extension dispatch failed", err);
    }
  };

  const handleCancelZip = async () => {
    try {
      await extensions.dispatch("js.neutralino.zipper", "cancelZip", {});
    } catch (err) {
      console.error("Cancel dispatch failed", err);
    }
    setIsZipping(false);
    setZipProgress(0);
  };

  const handleBrowseFolder = async () => {
    try {
      const folderPath = await os.showFolderDialog("Select a project folder");
      if (folderPath) {
        processFolder(folderPath);
      }
    } catch (err) {
      console.error("Dialog error:", err);
    }
  };

  const formatSize = (size: number): string => {
    if (size > Math.pow(1024, 4)) {
      return (size / Math.pow(1024, 4)).toFixed(2) + " TB";
    }
    if (size > Math.pow(1024, 3)) {
      return (size / Math.pow(1024, 3)).toFixed(2) + " GB";
    }
    if (size > Math.pow(1024, 2)) {
      return (size / Math.pow(1024, 2)).toFixed(2) + " MB";
    }
    return (size / 1024).toFixed(2) + " KB";
  };

  const getFolderInfo = async (
    folderPath: string,
  ): Promise<{ fileCount: number; totalSize: number }> => {
    try {
      const entries = await filesystem.readDirectory(folderPath);
      if (entries.length === 0) return { fileCount: 0, totalSize: 0 };

      const results = await Promise.all(
        entries.map(async (entry) => {
          if (entry.type === "DIRECTORY") {
            return getFolderInfo(entry.path);
          } else {
            const stats = await filesystem.getStats(entry.path);
            return { fileCount: 1, totalSize: stats.size };
          }
        }),
      );

      return results.reduce(
        (acc, r) => ({
          fileCount: acc.fileCount + r.fileCount,
          totalSize: acc.totalSize + r.totalSize,
        }),
        { fileCount: 0, totalSize: 0 },
      );
    } catch (error) {
      console.log(error);
      return { fileCount: 0, totalSize: 0 };
    }
  };

  const processFolder = async (folderPath: string) => {
    try {
      const stats = await filesystem.getStats(folderPath);

      if (stats.isDirectory) {
        const folderName = folderPath.split(/[\\/]/).pop() || "Root";
        setIsScanning(true);
        const { fileCount, totalSize } = await getFolderInfo(folderPath);
        setIsScanning(false);

        setFolderData({
          name: folderName,
          path: folderPath,
          size: formatSize(totalSize),
          fileCount,
        });
        setIsFolderLoaded(true);
      }
    } catch (err) {
      console.error("Native FS Error:", err);
    }
  };

  const handleRemoveFolder = () => {
    setIsFolderLoaded(false);
    if (isZipping) {
      handleCancelZip();
    }
  };

  return (
    <>
      <div className="min-h-svh bg-background text-foreground selection:bg-primary/30 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={BRAND_SPRING}
          className="w-full max-w-[480px] surface-inset rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <header className="px-6 py-4 border-b border-border/50 flex items-center justify-between surface-raised">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-accent">
                <Archive className="w-5 h-5 text-primary-foreground stroke-[2.5]" />
              </div>
              <h1 className="text-card-foreground font-bold tracking-[-0.04em]">
                Neu-Pack
              </h1>
              <span className="text-[10px] font-mono surface-raised px-1.5 py-0.5 rounded text-muted-foreground mt-0.5">
                v1.0.0
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                System Ready
              </span>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={BRAND_SPRING}
                  className="flex flex-col items-center justify-center gap-5 py-8"
                >
                  <div className="relative">
                    <div className="p-5 rounded-full surface-raised border border-primary/20">
                      <ScanSearch className="w-10 h-10 text-primary" />
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-card-foreground font-semibold tracking-[-0.02em]">
                      Scanning Project
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Analyzing files and directory structure…
                    </p>
                  </div>
                </motion.div>
              ) : !isFolderLoaded ? (
                <motion.div
                  key="folder-select"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={BRAND_SPRING}
                  className="flex flex-col items-center justify-center gap-6 py-8"
                >
                  <div className="p-5 rounded-full surface-raised border border-border">
                    <Folder className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-card-foreground font-semibold tracking-[-0.02em]">
                      No Project Selected
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Select a project folder to get started
                    </p>
                  </div>
                  <button
                    onClick={handleBrowseFolder}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium tracking-[-0.02em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] glow-accent flex items-center gap-2"
                  >
                    <Folder className="w-5 h-5" />
                    Select Project Folder
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="active-folder"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={BRAND_SPRING}
                  className="surface-inset rounded-xl p-4 relative group"
                >
                  <button
                    onClick={handleRemoveFolder}
                    className="absolute top-3 right-3 p-1 hover:bg-secondary rounded-md transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <Folder className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1 pr-8 min-w-0">
                      <h3 className="text-card-foreground font-semibold leading-none truncate tracking-[-0.02em]">
                        {folderData?.name}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {folderData?.path}
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-[10px] font-mono surface-raised text-foreground px-2 py-0.5 rounded-full tabular-nums">
                          {folderData?.fileCount.toLocaleString()} Files
                        </span>
                        <span className="text-[10px] font-mono surface-raised text-foreground px-2 py-0.5 rounded-full">
                          {folderData?.size}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer Action */}
          <footer className="p-6 pt-0">
            <button
              disabled={!isFolderLoaded || isZipping}
              onClick={handleZip}
              className={`
              w-full relative h-12 rounded-xl font-bold tracking-[-0.02em] transition-all duration-200
              flex items-center justify-center gap-2 overflow-hidden
              ${
                !isFolderLoaded
                  ? "bg-secondary text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] glow-accent"
              }
            `}
            >
              {isZipping ? (
                <>
                  <div
                    className="absolute inset-0 bg-primary/20 transition-all duration-100 ease-linear"
                    style={{ width: `${zipProgress}%` }}
                  />
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10 font-mono tabular-nums">
                    Processing {zipProgress}%
                  </span>
                </>
              ) : (
                <>
                  <Archive className="w-5 h-5" />
                  <span>Pack & Zip Project</span>
                </>
              )}
            </button>
          </footer>
          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={BRAND_SPRING}
                className="absolute bottom-20 left-6 right-6 z-50"
              >
                <div
                  className={`
                  px-4 py-3 rounded-lg border shadow-2xl flex items-center gap-3
                  ${
                    toast.type === "success"
                      ? "bg-success/10 border-success/20 text-success"
                      : "bg-destructive/10 border-destructive/20 text-destructive"
                  }
                `}
                >
                  {toast.type === "success" ? (
                    <Check className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{toast.msg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default App;
