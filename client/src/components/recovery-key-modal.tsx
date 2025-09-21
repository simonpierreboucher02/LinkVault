import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Download, QrCode, Key, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

interface RecoveryKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recoveryKey: string;
  isPasswordReset?: boolean;
  userToLogin?: any;
}

export default function RecoveryKeyModal({ 
  isOpen, 
  onClose, 
  recoveryKey, 
  isPasswordReset = false,
  userToLogin
}: RecoveryKeyModalProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showQR, setShowQR] = useState(false);

  const copyRecoveryKey = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      toast({
        title: "Copied!",
        description: "Recovery key copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the key manually",
        variant: "destructive",
      });
    }
  };

  const downloadRecoveryKey = () => {
    const blob = new Blob([recoveryKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-key.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Recovery key saved as file",
    });
  };

  const handleConfirm = () => {
    if (userToLogin && !isPasswordReset) {
      // Set user data now that modal is dismissed
      queryClient.setQueryData(["/api/user"], userToLogin);
    }
    onClose();
    if (!isPasswordReset) {
      setLocation("/dashboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" data-testid="modal-recovery-key">
        <DialogHeader className="text-center">
          <div className="bg-amber-100 dark:bg-amber-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="text-amber-600 h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl">
            {isPasswordReset ? "New Recovery Key Generated" : "Save Your Recovery Key"}
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            This key is your only way to recover your account if you forget your password.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Recovery Key:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRecoveryKey}
                data-testid="button-copy-key"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <code 
              className="block text-sm bg-background p-3 rounded border break-all font-mono"
              data-testid="text-recovery-key"
            >
              {recoveryKey}
            </code>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Download className="text-primary mt-1 h-5 w-5" />
              <div className="flex-1">
                <h4 className="font-medium">Download as file</h4>
                <Button
                  variant="link"
                  className="text-sm p-0 h-auto"
                  onClick={downloadRecoveryKey}
                  data-testid="button-download-key"
                >
                  Save recovery-key.txt
                </Button>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <QrCode className="text-primary mt-1 h-5 w-5" />
              <div className="flex-1">
                <h4 className="font-medium">QR Code</h4>
                <Button
                  variant="link"
                  className="text-sm p-0 h-auto"
                  onClick={() => setShowQR(!showQR)}
                  data-testid="button-show-qr"
                >
                  {showQR ? "Hide QR code" : "Generate QR code"}
                </Button>
                {showQR && (
                  <div className="mt-2 p-4 bg-white rounded border flex items-center justify-center">
                    <div className="text-xs text-gray-500 text-center">
                      QR Code would be generated here
                      <br />
                      (Implementation with qrcode library)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Important!</strong> This key will only be shown once. Store it safely - we cannot recover it for you.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleConfirm}
            className="w-full"
            data-testid="button-confirm-saved"
          >
            I've Saved My Recovery Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
