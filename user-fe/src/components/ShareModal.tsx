import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Twitter, Facebook } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  title: string;
  text?: string;
  url: string;
  trigger?: React.ReactNode;
}

const ShareModal: React.FC<ShareModalProps> = ({ title, text, url, trigger }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setCanShare(true);
    }
  }, []);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text: text || title,
        url,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback to dialog if native share fails for some reason
        setOpen(true);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text || title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canShare) {
      handleNativeShare();
    } else {
      setOpen(true);
    }
  };

  const triggerElement = trigger ? (
    <div onClick={handleTriggerClick}>{trigger}</div>
  ) : (
    <Button variant="outline" size="sm" onClick={handleTriggerClick} className="gap-2">
      <Share2 className="w-4 h-4" /> Share
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-mukta">Share this news</DialogTitle>
          <DialogDescription className="font-mukta">
            Choose how you'd like to share this article.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2 p-3 rounded-lg border border-zinc-100 bg-zinc-50 overflow-hidden">
            <p className="text-sm text-zinc-600 truncate flex-1">{url}</p>
            <Button size="sm" variant="ghost" onClick={handleCopyLink} className="shrink-0 h-8 gap-2">
              {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={shareOnTwitter} className="gap-2 border-zinc-200 hover:bg-zinc-50 hover:text-sky-500">
              <Twitter className="w-4 h-4" /> Twitter
            </Button>
            <Button variant="outline" onClick={shareOnFacebook} className="gap-2 border-zinc-200 hover:bg-zinc-50 hover:text-blue-600">
              <Facebook className="w-4 h-4" /> Facebook
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
