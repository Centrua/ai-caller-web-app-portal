import { GeminiRepository, GeminiRequestDto } from '../repositories/http/gemini.repository'

const gemini = new GeminiRepository()

export interface NextActionOpts {
  latestMessageBody?: string | null
  originalMessage?: string | null
  assistantReplyHtml?: string | null
}

// Returns a short next_action string (or null) based on the conversation context.
export async function determineNextAction(opts: NextActionOpts): Promise<string | null> {
  const { latestMessageBody, originalMessage, assistantReplyHtml } = opts

  try {
    const contextParts: string[] = []
    if (latestMessageBody) contextParts.push(`Latest message: ${String(latestMessageBody).slice(0, 2000)}`)
    if (originalMessage) contextParts.push(`Original message: ${String(originalMessage).slice(0, 2000)}`)
    if (assistantReplyHtml) contextParts.push(`Assistant reply (HTML): ${String(assistantReplyHtml).slice(0, 2000)}`)

    const nextActionSystem = {
      parts: [
        {
          text:
            'You are an assistant that reads the conversation context and determines the single most specific, actionable next step the internal team must perform. If no team action is required, set next_action to null. Output only a single JSON object with the key "next_action" whose value is either a short action string (max 120 characters) or null.'
        },
      ],
    }

    const nextActionUserParts = [] as Array<{ text: string }>
    nextActionUserParts.push({ text: contextParts.join('\n\n') })
    nextActionUserParts.push({ text: 'Analyze the provided context and return the single, most specific action the internal team should take. Prefer precise, prescriptive actions starting with a verb, for example: "Collect missing fields: lead_name, lead_phone" or "Assign to Sales: follow up with lead via email" or "Schedule call: propose 3 times". If the only requirement is review/follow-up, use "Review and follow up with sender". If no team action is required, return null. Output only one JSON object with key "next_action".' })

    const nextPayload: GeminiRequestDto = {
      system_instruction: nextActionSystem,
      contents: [{ role: 'user', parts: nextActionUserParts.map(p => ({ text: p.text })) }],
      generationConfig: { temperature: 0.0 },
    }

    const nextResp = await gemini.generateContent(nextPayload)
    const nextCandidate = nextResp.candidates && nextResp.candidates[0]
    const nextText = (nextCandidate?.content?.parts && nextCandidate.content.parts.map((p: any) => p.text).join('\n\n')) || ''

    try {
      const jsonStart = nextText.indexOf('{')
      const jsonText = jsonStart >= 0 ? nextText.slice(jsonStart) : nextText
      const parsed = JSON.parse(jsonText)
      const nextActionValue = parsed && typeof parsed.next_action === 'string' && parsed.next_action.trim() !== '' ? parsed.next_action.trim() : null
      return nextActionValue
    } catch (e) {
      // parsing failed — attempt to heuristically extract a short action
      const lower = (nextText || '').toLowerCase()
      if (lower.includes('collect') || lower.includes('missing')) return nextText.trim().slice(0, 120)
      if (lower.includes('review') || lower.includes('follow up') || lower.includes('follow-up')) return nextText.trim().slice(0, 120)
      return null
    }
  } catch (e) {
    console.warn('determineNextAction failed:', (e as any)?.message || e)
    return null
  }
}

export default { determineNextAction }
