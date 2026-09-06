import { GeminiRepository } from '../repositories/http/gemini.repository'

export interface ClassificationResult {
  is_wedding_inquiry: boolean
  confidence: number
  category: string
  reasoning: string
}

const DEFAULT_THRESHOLD = parseFloat(process.env.CLASSIFIER_CONFIDENCE_THRESHOLD || '0.8')

const gemini = new GeminiRepository()

function buildPrompt(subject: string, snippet: string) {
  const system = `You are a wedding venue inquiry classifier. Analyze the email subject and snippet and determine if it's a wedding-related inquiry. Respond ONLY with valid JSON exactly matching the schema: {"is_wedding_inquiry": boolean, "confidence": number, "category": string ("wedding"|"catering"|"corporate_event"|"other"), "reasoning": string }`

  const examples = [
    {
      subject: 'Wedding on June 15th - Question about availability',
      snippet: "Hi, we're looking to host our wedding reception for 150 guests on June 15, 2025. Do you have that date available? We're interested in learning about your catering packages.",
      out: { is_wedding_inquiry: true, confidence: 0.99, category: 'wedding', reasoning: 'Mentions wedding reception, guest count and date.' },
    },
    {
      subject: 'Q3 Team Building Event',
      snippet: 'We need to book your venue for a company off-site with 60 employees. Looking for a date in July that works for a 2-day event with breakout rooms.',
      out: { is_wedding_inquiry: false, confidence: 0.98, category: 'corporate_event', reasoning: 'Company event language (employees, team building).' },
    },
  ]

  let prompt = system + '\n\n'
  examples.forEach((ex) => {
    prompt += `Subject: ${ex.subject}\nSnippet: ${ex.snippet}\nResponse: ${JSON.stringify(ex.out)}\n\n`
  })

  prompt += `Subject: ${subject}\nSnippet: ${snippet}\nResponse:`

  return { system, prompt }
}

export async function classifyWeddingInquiry(input: { subject?: string; snippet?: string }): Promise<ClassificationResult> {
  const subject = (input.subject || '').trim()
  const snippet = (input.snippet || '').trim()

  // Build prompt payload for Gemini
  const { system, prompt } = buildPrompt(subject, snippet)

  const payload = {
    system_instruction: { parts: [{ text: system }] },
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: { maxOutputTokens: 1024 },
  }

  try {
    const resp = await gemini.generateContent(payload as any)
    const text = resp.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
    const firstText = text.trim()

    // Attempt to extract JSON object from the response
    const jsonStart = firstText.indexOf('{')
    const jsonEnd = firstText.lastIndexOf('}')
    let parsed: any = null
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonStr = firstText.substring(jsonStart, jsonEnd + 1)
      try {
        parsed = JSON.parse(jsonStr)
      } catch (e) {
        // ignore parse error
      }
    }

    if (!parsed) {
      // fallback: try raw parse
      try { parsed = JSON.parse(firstText) } catch (e) { parsed = null }
    }

    const result: ClassificationResult = {
      is_wedding_inquiry: !!(parsed && parsed.is_wedding_inquiry),
      confidence: parsed && typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      category: parsed && parsed.category ? parsed.category : 'other',
      reasoning: parsed && parsed.reasoning ? parsed.reasoning : firstText.slice(0, 200),
    }

    return result
  } catch (err: any) {
    console.error('Classifier error:', err?.message || err)
    return { is_wedding_inquiry: false, confidence: 0, category: 'other', reasoning: 'classifier_error' }
  }
}

export async function shouldStoreAsWedding(input: { subject?: string; snippet?: string }): Promise<boolean> {
  const res = await classifyWeddingInquiry(input)
  const threshold = DEFAULT_THRESHOLD || 0.8
  console.log('Classification result:', res, 'Threshold:', threshold)
  return res.is_wedding_inquiry && res.confidence >= threshold
}

export default { classifyWeddingInquiry, shouldStoreAsWedding }
