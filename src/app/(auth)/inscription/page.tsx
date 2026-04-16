'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function InscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    nom: '', telephone: '', email: '', password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()

    // Étape 1 : Créer le compte auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Cet email est déjà utilisé. Connectez-vous plutôt.')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }

    // Étape 2 : Insérer le profil commercant
    if (data.user) {
      const { error: profileError } = await supabase
        .from('commercants')
        .insert({
          user_id: data.user.id,
          nom: form.nom,
          telephone: form.telephone,
        })

      if (profileError) {
        // Le compte auth est créé mais le profil a échoué
        // On signale l'erreur sans rediriger
        setError('Compte créé mais erreur lors de la sauvegarde du profil. Contactez le support.')
        setLoading(false)
        return
      }
    }

    // Étape 3 : Rediriger ou demander confirmation selon l'état de la session
    if (data.session) {
      // Email confirmation désactivée → session active → on redirige
      router.push('/dashboard')
    } else {
      // Email confirmation activée → pas de session → on informe l'utilisateur
      setSuccess(true)
      setLoading(false)
    }
  }

  // Écran affiché si confirmation d'email requise
  if (success) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] mb-2">Vérifiez votre email</h1>
          <p className="text-[#6B7280] text-sm">
            Un email de confirmation a été envoyé à <span className="font-medium text-[#0A0A0A]">{form.email}</span>.
            Cliquez sur le lien pour activer votre compte.
          </p>
          <Link
            href="/connexion"
            className="mt-6 inline-block text-[#FF6B35] font-medium hover:underline text-sm"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
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
              onChange={e => setForm({ ...form, nom: e.target.value })}
              className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              placeholder="Ex: Moussa Traoré"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A0A0A]">Téléphone</label>
            <input
              type="tel"
              required
              pattern="[\+0-9\s]{8,15}"
              title="Entrez un numéro de téléphone valide"
              value={form.telephone}
              onChange={e => setForm({ ...form, telephone: e.target.value })}
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
              onChange={e => setForm({ ...form, email: e.target.value })}
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
              onChange={e => setForm({ ...form, password: e.target.value })}
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