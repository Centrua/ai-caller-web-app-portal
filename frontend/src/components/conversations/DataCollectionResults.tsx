
function displayableValue(raw: any): string | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'boolean') return raw ? 'Yes' : 'No'
  if (typeof raw === 'object') {
    if ('value' in raw) {
      const v = (raw as any).value
      if (v === null || v === undefined || v === '') return null
      if (typeof v === 'boolean') return v ? 'Yes' : 'No'
      if (typeof v === 'string') return v.charAt(0).toUpperCase() + v.slice(1)
      return String(v)
    }
    return null
  }
  if (raw === '') return null
  if (typeof raw === 'string') return raw.charAt(0).toUpperCase() + raw.slice(1)
  return String(raw)
}

export default function DataCollectionResults({ conv }: { conv: any }) {
  const analysisDCR = conv.analysis?.data_collection_results ?? conv.analysis?.dataCollectionResults
  const normalizedDCR = conv.dataCollectionResults ?? conv.data_collection_results
  const dcr = analysisDCR ?? normalizedDCR
  if (!dcr) return null

  if (Array.isArray(dcr)) {
    const items = (dcr as any[])
      .map((item: any) => {
        const id = item.data_collection_id ?? item.id ?? JSON.stringify(item)
        const raw = item.value ?? item?.value ?? null
        const disp = displayableValue(raw)
        if (!disp) return null
        return { id, label: id, value: disp }
      })
      .filter(Boolean)

    if (items.length === 0) return null

    return (
      <div className="mt-3">
        <div className="text-xs text-slate-500 mb-1">Data collection</div>
        <ul className="list-none space-y-1">
          {items.map((it: any) => (
            <li key={it.id} className="text-slate-700"><strong>{it.label}:</strong> {it.value}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (typeof dcr === 'object' && dcr !== null) {
    const entries = Object.entries(dcr)
      .map(([k, v]: any) => {
        const raw = (v as any)?.value ?? v
        const disp = displayableValue(raw)
        if (!disp) return null
        return { k, v: disp }
      })
      .filter(Boolean)

    if (entries.length === 0) return null

    return (
      <div className="mt-3">
        <div className="text-xs text-slate-500 mb-1">Data collection</div>
        <ul className="list-none space-y-1">
          {entries.map((it: any) => (
            <li key={it.k} className="text-slate-700"><strong>{it.k}:</strong> {it.v}</li>
          ))}
        </ul>
      </div>
    )
  }

  const prim = displayableValue(dcr)
  if (!prim) return null
  return <p className="text-slate-700 mt-3"><strong>Data Collection:</strong> {prim}</p>
}
