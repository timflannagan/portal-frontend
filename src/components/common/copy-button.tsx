import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const markCopied = () => {
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const showManualCopyPrompt = (text: string) => {
    window.prompt("Clipboard access is unavailable here. Copy manually:", text);
    toast.info("Copied value opened in prompt for manual copy.");
  };

  const tryLegacyCopy = (text: string) => {
    let copiedByHandler = false;
    const onCopy = (event: ClipboardEvent) => {
      event.preventDefault();
      event.clipboardData?.setData("text/plain", text);
      copiedByHandler = true;
    };

    document.addEventListener("copy", onCopy);
    const commandResult = document.execCommand("copy");
    document.removeEventListener("copy", onCopy);

    if (!commandResult && !copiedByHandler) {
      throw new Error("Legacy copy failed");
    }
  };

  const handleCopy = async () => {
    if (!value) {
      toast.error("Nothing to copy.");
      return;
    }

    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        markCopied();
      } else {
        tryLegacyCopy(value);
        markCopied();
      }
    } catch {
      try {
        tryLegacyCopy(value);
        markCopied();
      } catch {
        showManualCopyPrompt(value);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
