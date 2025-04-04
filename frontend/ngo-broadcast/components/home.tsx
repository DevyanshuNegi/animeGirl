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
  const [generatedScript, setGeneratedScript] = useState<string>(""); // State for script
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  
  const handleTopicChange = async (topic: string) => {
    setSelectedTopic(topic);
    if (topic) {
      try {
        const response = await fetch("http://localhost:5000/generate-podcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: topic, language: "Hindi", voice: "coral", temperature: 0.7 }),
        });
        const data = await response.json();
        if (data.status === "success") {
          console.log("Server Response:", data);
          setGeneratedScript(data.script);
          setAudioUrl(data.audio_url); // Set the audio URL from the server response
        } else {
          console.error("Error generating podcast:", data.message);
          setGeneratedScript("Error generating script.");
        }
      } catch (error) {
        console.error("Error sending request:", error);
        setGeneratedScript("Failed to connect to server.");
      }
    }
  };

  const handleSendRequest = async () => {
    if (!customRequest) return;
    try {
      const response = await fetch("http://localhost:5000/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_topic: customRequest, language: "Hindi", voice: "coral", temperature: 0.7}),
      });
      const data = await response.json();
      if (data.status === "success") {
        setGeneratedScript(data.script);
        setAudioUrl(data.audio_url); 
      } else {
        console.error("Error generating podcast:", data.message);
        setGeneratedScript("Error generating script.");
      }
      console.log("Server Response:", data);
    } catch (error) {
      console.error("Error sending request:", error);
      setGeneratedScript("Failed to connect to server.");
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
          {generatedScript && (
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