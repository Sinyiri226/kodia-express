'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function InscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nom: '', telephone: '', email: '', password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('commercants')
        .insert({
          user_id: data.user.id,
          nom: form.nom,
          telephone: form.telephone,
        })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Créer un compte</h1>
          <p className="text-[#6B7280] mt-1">Rejoignez KODIA EXPRESS</p>
        </div>

        {error && (
          <div className="bg-red-50 text-[#EF4444] text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#0A0A0A]">Nom complet</label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={e => setForm({...form, nom: e.target.value})}
              className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              placeholder="Ex: Moussa Traoré"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A0A0A]">Téléphone</label>
            <input
              type="tel"
              required
              value={form.telephone}
              onChange={e => setForm({...form, telephone: e.target.value})}
              className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              placeholder="Ex: +226 70 00 00 00"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A0A0A]">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A0A0A]">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6B35] text-white font-semibold py-3 rounded-xl hover:bg-[#e55a25] transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-[#FF6B35] font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}