import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocuments, getMetrics, generateDocument } from '../api/documents'
import type { Document, Metrics } from '../api/documents'


export default function Dashboard() {
  const [docs, setDocs]         = useState<Document[]>([])
  const [metrics, setMetrics]   = useState<Metrics | null>(null)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  const fetchData = async (p: number) => {
    setLoading(true)
    try {
      const [docsData, metricsData] = await Promise.all([
        getDocuments(p, 5),
        getMetrics(),
      ])
      setDocs(docsData.docs)
      setTotalPages(docsData.totalPages)
      setMetrics(metricsData)
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(page) }, [page])

  const handleDownload = async (doc: Document) => {
    const blob = await generateDocument(doc.title, doc.content)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.title}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const circuitColor = (state: string) => {
    if (state === 'CLOSED')    return 'text-green-600 bg-green-50'
    if (state === 'OPEN')      return 'text-red-600 bg-red-50'
    if (state === 'HALF_OPEN') return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard</h1>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm">
            ← Générer un doc
          </button>
        </div>

        {/* Métriques */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Documents', value: metrics.totalDocs },
              { label: 'Erreurs', value: metrics.totalErrors },
              { label: 'Uptime', value: `${metrics.uptime}s` },
              { label: 'DB', value: metrics.dbStatus },
              { label: 'Moy. génération', value: `${metrics.avgGenerationMs}ms` },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{m.label}</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{m.value}</p>
              </div>
            ))}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Circuit Breaker</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-sm font-semibold ${circuitColor(metrics.circuitBreaker)}`}>
                {metrics.circuitBreaker}
              </span>
            </div>
          </div>
        )}

        {/* Liste documents */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Documents générés</h2>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-10">Chargement...</p>
          ) : docs.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Aucun document</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Titre</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docs.map(doc => (
                  <tr key={doc._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-800">{doc.title}</td>
                    <td className="px-6 py-3 text-gray-400">
                      {new Date(doc.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        ⬇ Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
              >
                ←
              </button>
              <span className="px-3 py-1 text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}