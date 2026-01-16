import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Share2, ExternalLink, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useProfile } from "@/contexts/ProfileContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const WEBSITE_URL = "https://relaxmensparlor.lovable.app";

const SharePage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(WEBSITE_URL);
    setCopied(true);
    toast({ title: "Link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWebsite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.businessName,
          text: `Check out ${profile.businessName}!`,
          url: WEBSITE_URL,
        });
      } catch {
        // User cancelled
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-full bg-primary/10 hover:bg-primary/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-app">Share Website</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* QR Code Card */}
        <div className="bg-card rounded-2xl border p-6 flex flex-col items-center gap-4">
          <h2 className="font-app text-lg">{profile.businessName}</h2>
          <div className="bg-white p-4 rounded-xl shadow-lg border">
            <QRCodeSVG value={WEBSITE_URL} size={180} />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code to visit the website
          </p>
        </div>

        {/* URL Display */}
        <div className="bg-card rounded-xl border p-4">
          <p className="text-xs text-muted-foreground mb-2">Website URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-muted/50 px-3 py-2 rounded-lg overflow-x-auto">
              {WEBSITE_URL}
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 gap-2"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 gap-2"
            onClick={shareWebsite}
          >
            <Share2 className="w-5 h-5" />
            Share
          </Button>

          <Button
            className="w-full h-12 gap-2"
            onClick={() => window.open(WEBSITE_URL, "_blank")}
          >
            <ExternalLink className="w-5 h-5" />
            Open Website
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
