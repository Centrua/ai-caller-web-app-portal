import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface KnowledgeBaseFileItem {
  id: string
  name: string
  type: string
  access_level?: string
  [key: string]: any
}

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

  const uploadKnowledgeBaseFile = useCallback(async (file: File) => {
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

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/api/knowledge-base/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || json.message || 'Failed to upload knowledge base file')
      }

      return json
    }
    catch (err: any) {
      console.error('[KnowledgeBase File Upload Error]', err)
      setError(err.message || 'Failed to upload file')
      throw err
    }
    finally {
      setLoading(false)
    }
  }, [])

  const getKnowledgeBaseFiles = useCallback(async (pageSize: number = 100): Promise<KnowledgeBaseFileItem[]> => {
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

      const response = await fetch(`${API_BASE_URL}/api/knowledge-base/files?pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || json.message || 'Failed to fetch knowledge base files')
      }

      return json.documents || []
    }
    catch (err: any) {
      console.error('[KnowledgeBase Files Error]', err)
      setError(err.message || 'Failed to fetch files')
      return []
    }
    finally {
      setLoading(false)
    }
  }, [])

  const getKnowledgeBaseFileById = useCallback(async (id: string) => {
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

      const response = await fetch(`${API_BASE_URL}/api/knowledge-base/files/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const rawText = await response.text()

      if (!response.ok) {
        let json: any = {}
        try { json = JSON.parse(rawText) } catch {}
        throw new Error(json.error || json.message || rawText || 'Failed to fetch knowledge base file details')
      }

      try {
        return JSON.parse(rawText)
      } catch {
        return rawText
      }
    }
    catch (err: any) {
      console.error('[KnowledgeBase File Details Error]', err)
      setError(err.message || 'Failed to fetch file details')
      throw err
    }
    finally {
      setLoading(false)
    }
  }, [])

  const deleteKnowledgeBaseFile = useCallback(async (id: string) => {
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

      const response = await fetch(`${API_BASE_URL}/api/knowledge-base/files/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const rawText = await response.text()
      let json: any = {}
      try {
        json = JSON.parse(rawText)
      } catch {
        json = { message: rawText }
      }

      if (!response.ok) {
        throw new Error(json.error || json.message || 'Failed to delete knowledge base file')
      }

      return json
    }
    catch (err: any) {
      console.error('[KnowledgeBase File Delete Error]', err)
      setError(err.message || 'Failed to delete file')
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
    uploadKnowledgeBaseFile,
    getKnowledgeBaseFiles,
    getKnowledgeBaseFileById,
    deleteKnowledgeBaseFile
  }
}