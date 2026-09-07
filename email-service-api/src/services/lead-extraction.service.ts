import { GeminiRepository, GeminiRequestDto } from '../repositories/http/gemini.repository'
import leadRepo from '../repositories/lead-inquiry.repository'

const gemini = new GeminiRepository()

export interface LeadPrepOpts {
  systemParts: Array<{ text: string }>
  body?: string
  originalMessage?: any
  threadId?: string | null
  grantId?: string | null
}

export async function extractLeadInfo(systemParts: Array<{ text: string }>, bodyText: string) {
  const extractSystem = { parts: systemParts }
  const extractUserParts = [] as Array<{ text: string }>
  if (bodyText) extractUserParts.push({ text: `Message body: ${bodyText}` })
  extractUserParts.push({ text: 'You will ONLY output JSON. DO NOT HALLUCINATE OR GUESS. Determine whether the sender is a potential event lead (true/false).' })
  extractUserParts.push({ text: 'If they are a potential lead, extract ONLY explicitly-provided fields from the thread into a JSON object with these keys: lead_name, lead_phone, wedding_date, guest_count, tour_requested. Use null or omit keys that are not explicitly present. Also include a boolean `is_potential_lead` and an array `missing_fields` listing which of the above fields are missing and would be useful to collect. Return a single valid JSON object and nothing else.' })

  const extractPayload: GeminiRequestDto = {
    system_instruction: extractSystem,
    contents: [{ role: 'user', parts: extractUserParts.map(p => ({ text: p.text })) }],
    generationConfig: { temperature: 0.0 },
  }

  try {
    const extractResp = await gemini.generateContent(extractPayload)
    const candidate = extractResp.candidates && extractResp.candidates[0]
    const text = (candidate?.content?.parts && candidate.content.parts.map((p: any) => p.text).join('\n\n')) || ''
    const jsonStart = text.indexOf('{')
    const jsonText = jsonStart >= 0 ? text.slice(jsonStart) : text
    try {
      const parsed = JSON.parse(jsonText)
      return { parsed, raw: text, resp: extractResp }
    } catch (e) {
      console.warn('Failed to parse lead extraction JSON', e)
      return { parsed: null, raw: text, resp: extractResp }
    }
  } catch (e) {
    console.warn('Lead extraction failed:', (e as any)?.message || e)
    return { parsed: null, raw: null, resp: null }
  }
}

export async function prepareLeadForReply(opts: LeadPrepOpts) {
  const { systemParts, body, originalMessage, threadId, grantId } = opts
  const extraction = await extractLeadInfo(systemParts, body || '')
  const extracted = extraction.parsed

  const result: { leadExtractionResult: any; userPrompts: string[] } = { leadExtractionResult: null, userPrompts: [] }
  if (!(extracted && typeof extracted === 'object' && extracted.is_potential_lead)) return result

  result.leadExtractionResult = extracted

  // Consult DB for existing lead info
  let existingLead: any = null
  try {
    existingLead = await leadRepo.findLeadInquiryByThreadAndGrant(threadId || null, grantId || null)
  } catch (e) {
    console.warn('Failed to fetch existing lead inquiry:', (e as any)?.message || e)
  }

  const requiredFields = ['lead_name', 'lead_phone', 'wedding_date', 'guest_count', 'tour_requested']
  const existingInfo = (existingLead && existingLead.lead_info) ? existingLead.lead_info : {}

  const present = new Set<string>()
  for (const f of requiredFields) {
    const valInDb = existingInfo && existingInfo[f]
    const valInExtract = extracted && (extracted[f] !== undefined && extracted[f] !== null && String(extracted[f]).trim() !== '')
    if (valInDb !== undefined && valInDb !== null && String(valInDb).trim() !== '') present.add(f)
    if (valInExtract) present.add(f)
  }

  const missing = requiredFields.filter(f => !present.has(f))
  if (missing.length > 0) {
    result.userPrompts.push(`The sender appears to be a potential event lead. Collect only the missing information naturally and politely: ${missing.join(', ')}. Do NOT ask for information already provided in the thread or already stored in the system. Do NOT repeat a clarifying question that already appears earlier in the conversation if the sender did not answer; instead, offer next steps or state you'll notify the team.`)
  } else {
    result.userPrompts.push('All required lead fields are present in the thread or in system records. Do not ask any follow-up questions. If no additional information is present beyond what is in the message body, conclude the reply and state next steps.')
  }

  // Instruction to include machine-readable block if contact details are present
  result.userPrompts.push('If you include any lead contact details in the reply, also include a JSON object containing only the explicitly-provided lead fields wrapped between <!--LEAD_JSON--> and <!--LEAD_JSON-->. The JSON should use keys: lead_name, lead_phone, wedding_date, guest_count, tour_requested. Do not fabricate values.')

  return result
}

export function mergeEmbeddedLead(leadExtractionResult: any, html: string) {
  try {
    const leadJsonStart = html.indexOf('<!--LEAD_JSON-->')
    const leadJsonEnd = html.indexOf('<!--LEAD_JSON-->', leadJsonStart + 1)
    let embeddedLead = null
    if (leadJsonStart >= 0 && leadJsonEnd > leadJsonStart) {
      const jsonText = html.slice(leadJsonStart + '<!--LEAD_JSON-->'.length, leadJsonEnd).trim()
      try {
        embeddedLead = JSON.parse(jsonText)
      } catch (e) {
        console.warn('Failed to parse embedded lead JSON from reply:', e)
      }
    }

    const merged = Object.assign({}, leadExtractionResult)
    if (!merged.lead_info) merged.lead_info = {}
    if (embeddedLead && typeof embeddedLead === 'object') {
      for (const k of Object.keys(embeddedLead)) {
        if (k === 'lead_email' || k === 'interested_in' || k === 'event_type') continue
        if (embeddedLead[k] !== null && embeddedLead[k] !== undefined && String(embeddedLead[k]).trim() !== '') {
          merged.lead_info[k] = embeddedLead[k]
        }
      }
    }

    return merged
  } catch (e) {
    console.warn('mergeEmbeddedLead failed:', (e as any)?.message || e)
    return leadExtractionResult
  }
}

export async function persistLeadExtraction(leadExtraction: any, originalMessage: any, threadId?: string | null, grantId?: string | null) {
  try {
    const leadInfo = leadExtraction.lead_info || leadExtraction.parsed || leadExtraction
    if (leadInfo && typeof leadInfo === 'object') {
      delete leadInfo.lead_email
      delete leadInfo.interested_in
      delete leadInfo.event_type
    }

    return await leadRepo.upsertLeadInquiryByThreadAndGrant({
      grant_id: grantId || null,
      thread_id: threadId || null,
      original_message_id: originalMessage?.id || null,
      lead_info: leadInfo,
      status: 'open',
    })
  } catch (e) {
    console.warn('Failed to persist lead inquiry:', (e as any)?.message || e)
    return null
  }
}

export default {
  extractLeadInfo,
  prepareLeadForReply,
  mergeEmbeddedLead,
  persistLeadExtraction,
}
