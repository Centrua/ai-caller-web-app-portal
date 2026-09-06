import { useState, useEffect, useRef } from 'react'
import { useKnowledgeBase, type KnowledgeBaseFileItem } from '../../../hooks/knowledgeBaseHooks'

export default function FileKnowledgeBaseTab() {
  const { 
    uploadKnowledgeBaseFile, 
    getKnowledgeBaseFiles, 
    getKnowledgeBaseFileById, 
    deleteKnowledgeBaseFile, 
    loading, 
    error 
  } = useKnowledgeBase()

  const [files, setFiles] = useState<KnowledgeBaseFileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadFiles = async () => {
    try {
      const docs = await getKnowledgeBaseFiles()
      const filteredDocs = docs.filter(doc => doc.name !== "Knowledge Base Document")
      setFiles(filteredDocs)
    } finally {
      setIsInitialLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setSuccessMessage(null)
      await uploadKnowledgeBaseFile(selectedFile)
      setSuccessMessage(`File "${selectedFile.name}" uploaded successfully!`)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadFiles()
      setTimeout(() => setSuccessMessage(null), 2500)
    } catch {
      // Error handled by hook
    }
  }

  const handleDownload = async (fileItem: KnowledgeBaseFileItem) => {
    try {
      setDownloadingId(fileItem.id)
      const data = await getKnowledgeBaseFileById(fileItem.id)
      
      const contentString = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)
      const blob = new Blob([contentString], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileItem.name || `${fileItem.id}.txt`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } 
    catch {
      // Error handled by hook
    } 
    finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName || fileId}"?`)) {
      return
    }

    try {
      setDeletingId(fileId)
      setSuccessMessage(null)
      await deleteKnowledgeBaseFile(fileId)
      setSuccessMessage(`File "${fileName || fileId}" deleted successfully!`)
      await loadFiles()
      setTimeout(() => setSuccessMessage(null), 2500)
    } 
    catch {
      // Error handled by hook
    } 
    finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-6 left-[calc(50%+128px)] -translate-x-1/2 z-50">
          <div className="bg-slate-900 text-white px-5 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Upload Knowledge Document</h2>
        <p className="text-xs text-slate-500 mb-4">
          Upload PDF, TXT, DOCX, EPUB, HTML, or MD files to train your AI agent with structured document content.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.txt,.docx,.epub,.html,.md"
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
          />

          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2B3528] hover:bg-[#444B38] disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
          >
            {loading && !downloadingId && !deletingId ? (
              <svg className="animate-spin h-4 w-4 text-white" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
            {loading && !downloadingId && !deletingId ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[220px]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Uploaded Files</h2>
            <p className="text-xs text-slate-500 mt-0.5">Documents attached to your ElevenLabs Knowledge Base.</p>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {files.length} {files.length === 1 ? 'File' : 'Files'}
          </span>
        </div>

        {isInitialLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px] z-10">
            <svg className="animate-spin h-8 w-8 text-[#2B3528]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-slate-500 font-medium mt-2">Loading files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-slate-600 text-sm font-medium">No knowledge base files found</p>
            <p className="text-slate-400 text-xs mt-1">Upload a PDF or TXT file above to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {files.map((file) => (
              <div key={file.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{file.name || 'Untitled Document'}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {file.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider mr-2">
                    {file.type || 'file'}
                  </span>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={downloadingId === file.id || deletingId === file.id}
                    title="Download File Content"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {downloadingId === file.id ? (
                      <svg className="animate-spin h-3.5 w-3.5 text-slate-600" width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    )}
                    Download
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(file.id, file.name)}
                    disabled={downloadingId === file.id || deletingId === file.id}
                    title="Delete File"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-100/70 border border-red-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {deletingId === file.id ? (
                      <svg className="animate-spin h-3.5 w-3.5 text-red-600" width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}