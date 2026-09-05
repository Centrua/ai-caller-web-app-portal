export interface GeminiRequestDto {
  contents: Array<{
    role?: string;
    parts: Array<{ text?: string; [key: string]: any }>;
  }>;
  system_instruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: Record<string, any>;
}

export interface GeminiResponseDto {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export class GeminiRepository {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!this.apiKey) {
      console.warn('[GeminiRepository] Warning: GEMINI_API_KEY environment variable is not set.');
    }
  }

  async generateContent(payload: GeminiRequestDto): Promise<GeminiResponseDto> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Please configure it in your environment variables.');
    }

    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API HTTP ${response.status}: ${errorText}`);
    }

    const rawData = await response.json();

    const geminiResponse: GeminiResponseDto = {
      candidates: (rawData.candidates || []).map((candidate: any) => ({
        content: {
          parts: (candidate.content?.parts || []).map((part: any) => ({
            text: part.text || ''
          }))
        },
        finishReason: candidate.finishReason || 'STOP'
      })),
      usageMetadata: rawData.usageMetadata ? {
        promptTokenCount: rawData.usageMetadata.promptTokenCount || 0,
        candidatesTokenCount: rawData.usageMetadata.candidatesTokenCount || 0,
        totalTokenCount: rawData.usageMetadata.totalTokenCount || 0
      } : undefined
    };

    return geminiResponse;
  }
}
