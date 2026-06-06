import { Volume2, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/lib/speech";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ListenButtonProps {
  text: string;
  id: string;
  lang?: string;
  size?: "sm" | "default";
  variant?: "ghost" | "outline" | "default";
  label?: string;
  className?: string;
}

export function ListenButton({
  text, id, lang, size = "sm", variant = "ghost", label = "Listen", className,
}: ListenButtonProps) {
  const { supported, speak, stop, speakingId, speaking } = useSpeech();
  const active = speakingId === id && speaking;

  const onClick = () => {
    if (!supported) {
      toast.error("Your browser does not support voice playback");
      return;
    }
    if (active) stop();
    else speak(text, id, { lang });
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={onClick}
      disabled={!text?.trim()}
      className={`h-7 text-xs gap-1.5 ${className ?? ""}`}
      aria-label={active ? "Stop voice" : "Listen"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <motion.span key="stop" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-1.5">
            <SpeakingIcon />
            <Square className="w-3 h-3" />
            <span>Stop</span>
          </motion.span>
        ) : (
          <motion.span key="play" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            <span>{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}

function SpeakingIcon() {
  return (
    <span className="inline-flex items-end gap-[2px] h-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[2px] bg-accent rounded-full"
          animate={{ height: ["30%", "100%", "30%"] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export function VoiceUnsupportedNotice() {
  const { supported } = useSpeech();
  if (supported) return null;
  return (
    <div className="text-xs text-yellow-300/80 bg-yellow-500/10 border border-yellow-500/30 rounded-md px-3 py-2">
      Your browser does not support voice playback.
    </div>
  );
}

// Loader spinner (re-export for convenience)
export { Loader2 };
