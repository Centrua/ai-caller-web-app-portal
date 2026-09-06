import { NylasRepository } from '../repositories/http/nylas.repository'

export async function isFromConnectedAccount(nylasRepo: NylasRepository, grantId: string | null, fromAddresses: string[]): Promise<boolean> {
  if (!grantId || !fromAddresses || fromAddresses.length === 0) return false

  try {
    const account = await nylasRepo.getGrantAccount(grantId)
    // The Nylas v3 response may be wrapped as { request_id, data: { ...grant... } }
    const grant = (account && (account.data || account)) || account
    console.log('Fetched account for grant:', grantId)
    const accountEmails: string[] = []

    const pushNormalized = (s?: string | null) => {
      if (!s) return
      const v = String(s).trim().toLowerCase()
      if (v) accountEmails.push(v)
    }

    if (grant) {
      pushNormalized(grant.email)
      pushNormalized(grant.email_address)

      // Some providers return aliases under different fields: `email_aliases`, `email_addresses`, `emails`.
      if (Array.isArray(grant.email_aliases)) {
        grant.email_aliases.forEach((e: any) => { if (typeof e === 'string') pushNormalized(e) })
      }

      if (Array.isArray(grant.email_addresses)) {
        grant.email_addresses.forEach((e: any) => { if (e && e.email) pushNormalized(String(e.email)) })
      }

      if (Array.isArray(grant.emails)) {
        grant.emails.forEach((e: any) => { if (typeof e === 'string') pushNormalized(e) })
      }
    }

    if (accountEmails.length === 0) return false

    const accountSet = new Set(accountEmails)
    return fromAddresses.some((a) => {
      if (!a) return false
      return accountSet.has(String(a).trim().toLowerCase())
    })
  } catch (err: any) {
    // If we can't determine account emails, fail-open (do not drop)
    console.warn('isFromConnectedAccount: failed to fetch account for grant', grantId, err?.message || err)
    return false
  }
}

export default {
  isFromConnectedAccount,
}
