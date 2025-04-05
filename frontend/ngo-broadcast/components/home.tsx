"use client";
import { useState, Suspense } from "react";
import LipSyncCharacter from "@/components/lip-sync-character";
import AudioUploader from "@/components/audio-uploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Character() {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
    undefined,
  );
  const [customRequest, setCustomRequest] = useState<string>("");
  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // 🔥 new loading state

  const handleTopicChange = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true); // start loading
    if (topic) {
      try {
        const response = await fetch("/api/generate-podcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topic,
            language: "Hindi",
            voice: "coral",
            temperature: 0.7,
          }),
        });
        const data = await response.json();
        if (data.status === "success") {
          setGeneratedScript(data.script);
          setAudioUrl(data.audio_url);
        } else {
          setGeneratedScript("Error generating script.");
        }
      } catch (error) {
        console.error("Error sending request:", error);
        setGeneratedScript("Failed to connect to server.");
      } finally {
        setLoading(false); // stop loading
      }
    }
  };

  const handleSendRequest = async () => {
    if (!customRequest) return;
    setLoading(true); // start loading
    try {
      const response = await fetch("/api/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_topic: customRequest,
          language: "Hindi",
          voice: "coral",
          temperature: 0.7,
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setGeneratedScript(data.script);
        setAudioUrl(data.audio_url);
      } else {
        setGeneratedScript("Error generating script.");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      setGeneratedScript("Failed to connect to server.");
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className="p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardDescription>Your Friendly Teacher</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTopic} onValueChange={handleTopicChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CourageAndConsent">
                Courage and Consent
              </SelectItem>
              <SelectItem value="HealthAndHygiene">
                Health and Hygiene
              </SelectItem>
              <SelectItem value="KnowYourRights">Know Your Rights</SelectItem>
              <SelectItem value="MindMatters">Mind Matters</SelectItem>
              <SelectItem value="SafetyAndBoundaries">
                Safety and Boundaries
              </SelectItem>
            </SelectContent>
          </Select>
          <br />
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center">
                Loading...
              </div>
            }
          >
            <LipSyncCharacter />
          </Suspense>

          {/* Spinner while loading */}
          {loading && (
            <div className="flex justify-center items-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600">
                Generating script...
              </span>
            </div>
          )}

          {/* Render script only if not loading */}
          {!loading && generatedScript && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-black">
              {generatedScript}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4">
        <AudioUploader audioUrlFromServer={audioUrl} />
      </div>

      <div className="mt-4">
        <Input
          type="text"
          placeholder="Enter a custom request"
          value={customRequest}
          onChange={(e) => setCustomRequest(e.target.value)}
        />
        <Button onClick={handleSendRequest} className="m-2 mb-20">
          Send Request
        </Button>
      </div>
    </div>
  );
}
