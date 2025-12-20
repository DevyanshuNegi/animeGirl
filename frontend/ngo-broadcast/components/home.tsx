"use client";
import { useState, Suspense, useEffect, useRef } from "react";
import LipSyncCharacter from "@/components/lip-sync-character";
import AudioUploader from "@/components/audio-uploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Sparkles, Heart, Shield, Brain, BookOpen, Send, Loader2 } from "lucide-react";

const topics = [
  { value: "CourageAndConsent", label: "Courage and Consent", icon: Heart, color: "from-pink-500 to-rose-500" },
  { value: "HealthAndHygiene", label: "Health and Hygiene", icon: Sparkles, color: "from-emerald-500 to-teal-500" },
  { value: "KnowYourRights", label: "Know Your Rights", icon: BookOpen, color: "from-blue-500 to-indigo-500" },
  { value: "MindMatters", label: "Mind Matters", icon: Brain, color: "from-purple-500 to-violet-500" },
  { value: "SafetyAndBoundaries", label: "Safety and Boundaries", icon: Shield, color: "from-amber-500 to-orange-500" },
];

const languages = [
  { value: "English", label: "English", flag: "🇬🇧" },
  { value: "Hindi", label: "हिंदी", flag: "🇮🇳" },
  { value: "Japanese", label: "日本語", flag: "🇯🇵" },
  { value: "Punjabi", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { value: "Marathi", label: "मराठी", flag: "🇮🇳" },
  { value: "Bangali", label: "বাংলা", flag: "🇮🇳" },
  { value: "Telugu", label: "తెలుగు", flag: "🇮🇳" },
  { value: "Tamil", label: "தமிழ்", flag: "🇮🇳" },
  { value: "Gujarati", label: "ગુજરાતી", flag: "🇮🇳" },
];

export default function Character() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  const [customRequest, setCustomRequest] = useState<string>("");
  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  // Split script into lines for display
  const scriptLines = generatedScript
    ? generatedScript.split(/[।\.\?\!]+/).filter(line => line.trim().length > 0).map(line => line.trim())
    : [];

  // Listen for audio playback
  useEffect(() => {
    const handlePlaybackToggle = (e: Event) => {
      const event = e as CustomEvent<{ playing: boolean }>;
      setIsPlaying(event.detail.playing);
      if (event.detail.playing) {
        setCurrentLineIndex(0);
      }
    };
    window.addEventListener("audioPlaybackToggle", handlePlaybackToggle);
    return () => window.removeEventListener("audioPlaybackToggle", handlePlaybackToggle);
  }, []);

  // Auto-advance lyrics
  useEffect(() => {
    if (!isPlaying || scriptLines.length === 0) return;
    const interval = setInterval(() => {
      setCurrentLineIndex(prev => (prev < scriptLines.length - 1 ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(interval);
  }, [isPlaying, scriptLines.length]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (lyricsContainerRef.current && scriptLines.length > 0 && isPlaying) {
      const container = lyricsContainerRef.current;
      const lineHeight = container.scrollHeight / scriptLines.length;
      container.scrollTo({
        top: Math.max(0, currentLineIndex * lineHeight - container.clientHeight / 3),
        behavior: 'smooth'
      });
    }
  }, [currentLineIndex, scriptLines.length, isPlaying]);

  useEffect(() => {
    const generateContent = async () => {
      if (selectedTopic && selectedLanguage) {
        setLoading(true);
        setGeneratedScript("");
        setAudioUrl(null);
        setCurrentLineIndex(0);
        try {
          const response = await fetch("/api/generate-podcast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: selectedTopic,
              language: selectedLanguage,
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
          setLoading(false);
        }
      }
    };
    generateContent();
  }, [selectedTopic, selectedLanguage]);

  const handleSendRequest = async () => {
    if (!customRequest) return;
    setLoading(true);
    setCurrentLineIndex(0);
    try {
      const response = await fetch("/api/generate-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_topic: customRequest,
          language: selectedLanguage || "English",
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-1">
            Do Sakhi ✨
          </h1>
          <p className="text-muted-foreground text-sm">
            Your friendly guide to learning important life lessons
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* Left Column - Character & Audio Controls */}
          <div className="lg:col-span-1">
            <Card className="glass border-2 border-pink-200/50 dark:border-pink-800/30 shadow-xl lg:sticky lg:top-20">
              <CardHeader className="pb-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  Meet Sakhi
                </CardTitle>
                <CardDescription>Your friendly animated teacher</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {/* Character */}
                <div className="relative mb-4">
                  <Suspense
                    fallback={
                      <div className="h-48 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                      </div>
                    }
                  >
                    <LipSyncCharacter />
                  </Suspense>
                </div>

                {/* Audio Player - ALWAYS VISIBLE */}
                <div className="border-t border-pink-200/30 dark:border-pink-800/30 pt-4">
                  <AudioUploader audioUrlFromServer={audioUrl} />
                </div>

                {/* Status Indicator */}
                {isPlaying && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-pink-500">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                    </span>
                    Now Playing...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Controls & Content */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Controls Card */}
            <Card className="glass border-2 border-purple-200/50 dark:border-purple-800/30 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">🎯 Choose Your Lesson</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Language Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">🌐 Language</label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="h-11 border-2 border-purple-200 dark:border-purple-800">
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">📚 Topic</label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger className="h-11 border-2 border-blue-200 dark:border-blue-800">
                        <SelectValue placeholder="Select topic..." />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => {
                          const Icon = topic.icon;
                          return (
                            <SelectItem key={topic.value} value={topic.value}>
                              <span className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span>{topic.label}</span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Question */}
                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">✏️ Or ask your own question</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type your question here..."
                      value={customRequest}
                      onChange={(e) => setCustomRequest(e.target.value)}
                      className="flex-1 h-11 border-2 border-amber-200 dark:border-amber-800"
                      onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                    />
                    <Button
                      onClick={handleSendRequest}
                      disabled={loading || !customRequest.trim()}
                      className="h-11 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Script Display - Lyrical Captions Style */}
            {(loading || generatedScript) && (
              <Card className="glass border-2 border-pink-200/50 dark:border-pink-800/30 shadow-xl overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                        Sakhi is preparing your story...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-pink-500" />
                        Sakhi says...
                        {isPlaying && <span className="text-sm font-normal text-muted-foreground ml-2">(Click any line to jump)</span>}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-pink-200 dark:border-pink-800 rounded-full" />
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-muted-foreground animate-pulse">Creating a special story just for you...</p>
                    </div>
                  ) : (
                    <div 
                      ref={lyricsContainerRef}
                      className="max-h-[50vh] overflow-y-auto p-6 scrollbar-hide"
                    >
                      <div className="space-y-3">
                        {scriptLines.map((line, index) => {
                          const isCurrentLine = index === currentLineIndex && isPlaying;
                          const isPastLine = index < currentLineIndex && isPlaying;
                          
                          return (
                            <p
                              key={index}
                              onClick={() => setCurrentLineIndex(index)}
                              className={`transition-all duration-500 cursor-pointer rounded-xl px-4 py-3 leading-relaxed ${
                                isCurrentLine
                                  ? 'text-xl font-bold text-foreground bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 shadow-lg border-l-4 border-pink-500'
                                  : isPastLine
                                  ? 'text-base text-muted-foreground/50'
                                  : 'text-base text-foreground/80 hover:bg-accent/50'
                              }`}
                            >
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Welcome State - Quick Start */}
            {!loading && !generatedScript && (
              <Card className="glass border-2 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
                <CardContent className="py-10 text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-pink-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Ready to Learn?</h3>
                  <p className="text-muted-foreground mb-6">
                    Select a language and topic above, or click a quick topic below!
                  </p>
                  
                  {/* Quick Topic Buttons */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {topics.map((topic) => {
                      const Icon = topic.icon;
                      return (
                        <button
                          key={topic.value}
                          onClick={() => {
                            if (!selectedLanguage) setSelectedLanguage("English");
                            setSelectedTopic(topic.value);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${topic.color} text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all`}
                        >
                          <Icon className="w-4 h-4" />
                          {topic.label}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
