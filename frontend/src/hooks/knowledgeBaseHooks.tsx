import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useKnowledgeBase = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')

  const getKnowledgeBaseText = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found. Please log in.')
      }

      const response = await fetch(`${API_BASE_URL}/api/knowledge-base`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const rawText = await response.text()
      let json: any

      try {
        json = JSON.parse(rawText)
      } catch {
        if (response.ok) {
          setContent(rawText)
          return rawText
        }
        throw new Error(rawText || 'Failed to retrieve knowledge base document')
      }

      if (!response.ok) {
        throw new Error(json.error || json.message || 'Failed to retrieve knowledge base document')
      }

      // Matches your Postman response: { text: "..." }
      const textData = json.text !== undefined ? json.text : (json.data || (typeof json === 'string' ? json : ''))
      setContent(textData)
      return textData
    } 
    catch (err: any) {
      console.error('[KnowledgeBase Error]', err)
      if (err.message?.includes('not found') || err.message?.includes('Failed to retrieve')) {
        setContent('')
        return ''
      }
      setError(err.message || 'Failed to retrieve knowledge base document')
      return ''
    } 
    finally {
      setLoading(false)
    }
  }, [])

  const saveKnowledgeBaseText = useCallback(async (name: string, text: string, agentId?: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found. Please log in.')
      }

      const response = await fetch(`${API_BASE_URL}/api/knowledge-base`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, text, agentId }),
      })

      const rawText = await response.text()
      let json: any

      try {
        json = JSON.parse(rawText)
      } catch {
        if (response.ok) return rawText
        throw new Error(rawText || 'Failed to save knowledge base document')
      }

      if (!response.ok) {
        throw new Error(json.error || json.message || 'Failed to save knowledge base document')
      }

      if (text) {
        setContent(text)
      }

      return json.text !== undefined ? json.text : (json.data || json)
    } 
    catch (err: any) {
      console.error('[KnowledgeBase Save Error]', err)
      setError(err.message || 'Failed to save knowledge base document')
      throw err
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return {
    content,
    loading,
    error,
    getKnowledgeBaseText,
    saveKnowledgeBaseText,
  }
}