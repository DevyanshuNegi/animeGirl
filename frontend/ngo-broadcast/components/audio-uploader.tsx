"use client";
import { JSX, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AudioUploader({
  audioUrlFromServer,
}: {
  audioUrlFromServer: string | null;
}): JSX.Element {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (audioUrlFromServer) {
      setAudioUrl(audioUrlFromServer);
      window.dispatchEvent(
        new CustomEvent("audioLoaded", { detail: { url: audioUrlFromServer } }),
      );
      toast({
        title: "Audio loaded from server",
        description: "Audio is ready for lip-sync",
      });
    }
  }, [audioUrlFromServer, toast]);

  const togglePlayback = (): void => {
    const newPlayingState = !isPlaying;

    window.dispatchEvent(
      new CustomEvent("audioPlaybackToggle", {
        detail: { playing: newPlayingState },
      }),
    );

    setIsPlaying(newPlayingState);
  };

  return (
    <div className="space-y-4 mt-4">
      {audioUrl && (
        <div className="space-y-2">
          <Button onClick={togglePlayback} variant="outline" className="w-full">
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Play
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
