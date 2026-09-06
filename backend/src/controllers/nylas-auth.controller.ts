import { Request, Response } from 'express'
import nylasService from '../services/nylas.service'
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
const nylas = nylasService

export class NylasAuthController {
  async startAuth(req: Request, res: Response): Promise<void> {
    try {
      const provider = (req.query.provider as string) || 'google'
      const url = nylas.getAuthUrl(provider, req.query.email as string | undefined)
      res.redirect(url)
    } catch (err: any) {
      console.error('[NylasAuthController startAuth] ', err)
      res.status(500).json({ error: err.message || 'Failed to start Nylas auth' })
    }
  }

  async callback(req: Request, res: Response): Promise<void> {
    try {
      const code = req.query.code as string
      if (!code) {
        res.status(400).send('Missing code')
        return
      }

      let response: any
      try {
        response = await nylas.exchangeCode(code)
      } catch (exchangeErr: any) {
        console.error('[NylasAuth] Token exchange failed:', exchangeErr)
        res.status(500).send(`Failed to exchange code for token: ${exchangeErr?.message || String(exchangeErr)}`)
        return
      }

      const grantId = (response as any).grantId || (response as any).grant_id || (response as any).grantId
      const email = (response as any).email || (response as any).email_address || ''

      // Redirect back to frontend register page with grant id and email (if provided)
      const redirectTo = new URL(`${frontendUrl}/register-venue`)
      if (grantId) redirectTo.searchParams.set('nylas_grant_id', grantId)
      if (email) redirectTo.searchParams.set('nylas_email', email)

      res.redirect(redirectTo.toString())
    } catch (err: any) {
      console.error('[NylasAuthController callback] ', err)
      res.status(500).send('Failed to exchange code for token')
    }
  }
}

export default new NylasAuthController()
