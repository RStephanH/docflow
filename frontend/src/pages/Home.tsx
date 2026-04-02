import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login, generateDocument } from '../api/documents'

interface FormData {
  title: string
  content: string
}

export default function Home() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem('token'))
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      await login('admin@docflow.fr', 'admin123')
      setIsLogged(true)
    } catch {
      alert('Erreur de connexion')
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setStatus('idle')
      const blob = await generateDocument(data.title, data.content)
      // Téléchargement automatique du PDF
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.title}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">DocFlow</h1>
          <p className="text-gray-500 mb-6">Digitalisation de documents administratifs</p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Connexion admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📄 DocFlow</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:underline text-sm"
            >
              Dashboard →
            </button>
            <button
              onClick={() => { localStorage.removeItem('token'); setIsLogged(false) }}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Générer un document</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Titre</label>
              <input
                {...register('title', { required: 'Le titre est requis' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Convention de stage, CERFA..."
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contenu</label>
              <textarea
                {...register('content', { required: 'Le contenu est requis' })}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Saisissez le contenu du document..."
              />
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Génération en cours...' : '⬇ Générer le PDF'}
            </button>

            {status === 'success' && (
              <p className="text-green-600 text-sm text-center">✅ PDF généré et téléchargé !</p>
            )}
            {status === 'error' && (
              <p className="text-red-500 text-sm text-center">❌ Erreur lors de la génération</p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}