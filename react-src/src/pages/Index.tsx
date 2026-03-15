import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  HardDrive,
  Archive,
  Check,
  Loader2,
  X,
  AlertCircle,
} from 'lucide-react';

const BRAND_SPRING = { type: "spring" as const, duration: 0.4, bounce: 0.1 };

const folderData = {
  name: "production-api-v2",
  path: "/users/dev/projects/neu-pack/src",
  fileCount: 1248,
  size: "1.2 GB",
};

const NeuPack: React.FC = () => {
  const [isFolderLoaded, setIsFolderLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePack = () => {
    if (!isFolderLoaded || isProcessing) return;
    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    setTimeout(() => {
      // NEUTRALINO_BRIDGE_HERE: Call native zip utility
      clearInterval(interval);
      setIsProcessing(false);
      setProgress(0);
      setToast({ type: 'success', msg: 'Project zipped successfully' });
      setTimeout(() => setToast(null), 4000);
    }, 3000);
  };

  return (
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
            <h1 className="text-card-foreground font-bold tracking-[-0.04em]">Neu-Pack</h1>
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

        {/* Status Bar */}
        <div className="px-6 py-3 bg-card/30 border-b border-border/50 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                <HardDrive className="w-3 h-3" /> Disk Space
              </span>
              <span className="text-[10px] font-mono text-foreground tabular-nums">72% Used</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-muted-foreground/60 rounded-full"
              />
            </div>
          </div>
          <button className="text-[10px] font-mono uppercase px-3 py-1.5 surface-raised text-secondary-foreground rounded-md transition-all duration-200 hover:brightness-125 active:scale-[0.98]">
            Check Space
          </button>
        </div>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {!isFolderLoaded ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={BRAND_SPRING}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); setIsFolderLoaded(true); }}
                onClick={() => {
                  // NEUTRALINO_BRIDGE_HERE: Open native folder picker
                  setIsFolderLoaded(true);
                }}
                className={`
                  relative group cursor-pointer
                  aspect-video rounded-xl border-2 border-dashed transition-all duration-300
                  flex flex-col items-center justify-center gap-4
                  ${isDragging
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30 bg-card/20'}
                `}
              >
                <div
                  className={`
                    p-4 rounded-full border transition-all duration-300
                    ${isDragging
                      ? 'bg-primary/10 border-primary/20 scale-110'
                      : 'surface-raised group-hover:border-muted-foreground/30'}
                  `}
                >
                  <Folder className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                  <p className="text-card-foreground font-medium tracking-[-0.02em]">
                    Drag & Drop Project Folder
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">or click to browse local files</p>
                </div>
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
                  onClick={() => { if (!isProcessing) setIsFolderLoaded(false); }}
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
                      {folderData.name}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      {folderData.path}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[10px] font-mono surface-raised text-foreground px-2 py-0.5 rounded-full tabular-nums">
                        {folderData.fileCount.toLocaleString()} Files
                      </span>
                      <span className="text-[10px] font-mono surface-raised text-foreground px-2 py-0.5 rounded-full">
                        {folderData.size}
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
            disabled={!isFolderLoaded || isProcessing}
            onClick={handlePack}
            className={`
              w-full relative h-12 rounded-xl font-bold tracking-[-0.02em] transition-all duration-200
              flex items-center justify-center gap-2 overflow-hidden
              ${!isFolderLoaded
                ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] glow-accent'}
            `}
          >
            {isProcessing ? (
              <>
                <div
                  className="absolute inset-0 bg-primary/20 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                <span className="relative z-10 font-mono tabular-nums">Processing {progress}%</span>
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
                  ${toast.type === 'success'
                    ? 'bg-success/10 border-success/20 text-success'
                    : 'bg-destructive/10 border-destructive/20 text-destructive'}
                `}
              >
                {toast.type === 'success' ? (
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
  );
};

export default NeuPack;
