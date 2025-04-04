// Theme definitions
export interface ThemeDefinitions {
    [key: string]: string;
  }
  
  // Request body for the generate-podcast endpoint
  export interface GeneratePodcastRequest {
    topic: string;
    custom_topic: string;
    language: string;
    voice: string;
    temperature: number;
  }
  
  // Response for generate-podcast endpoint
  export interface GeneratePodcastResponse {
    status: string;
    script?: string;
    audio_url?: string;
    message?: string;
  }
  
  // Response for themes endpoint
  export interface ThemesResponse {
    themes: string[];
  }
  
  // Response for test endpoint
  export interface TestResponse {
    status: string;
    message: string;
    gemini_key_set: boolean;
    openai_key_set: boolean;
  }