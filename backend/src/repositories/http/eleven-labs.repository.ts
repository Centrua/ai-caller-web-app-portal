export class ElevenLabsRepository {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    if (process.env.ELEVENLABS_API_KEY) {
      this.apiKey = process.env.ELEVENLABS_API_KEY
    } 
    else {
      throw new Error('Missing ElevenLabs credentials')
    }
  }

  async getConversations(agentId?: string): Promise<any[]> {
    const url = new URL(`${this.baseUrl}/convai/conversations`)
    if (agentId) {
      url.searchParams.append('agent_id', agentId)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`ElevenLabs API error (${response.status}): ${errorBody || response.statusText}`)
    }

    const data = await response.json()
    return data.conversations || []
  }
}