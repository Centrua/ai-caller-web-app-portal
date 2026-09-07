import { useState, useCallback } from 'react'

const EMAIL_SERIVCE_API_BASE_URL = import.meta.env.VITE_EMAIL_SERVICE_API_BASE_URL || 'http://localhost:3002'

export interface EditDraftBodyPayload {
  body: string
}

export const useEditDraftBody = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const editBody = useCallback(async (draftId: number, body: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!EMAIL_SERIVCE_API_BASE_URL) {
        throw new Error('VITE_EMAIL_SERVICE_API_BASE_URL is not defined')
      }

      const response = await fetch(`${EMAIL_SERIVCE_API_BASE_URL}/outgoing/${draftId}/body`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || json.message || 'Failed to update draft body')
      }

      return json
    } 
    catch (err: any) {
      console.error('[EditDraftBody Error]', err)
      const msg = err.message || 'An error occurred while updating the draft body'
      setError(msg)
      throw new Error(msg)
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return { editBody, loading, error }
}