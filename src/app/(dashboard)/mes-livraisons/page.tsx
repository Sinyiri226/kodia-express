'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"

type Commande = {
  id: string
  nom_client: string
  quartier: string
  prix: number
  statut: string
  created_at: string
  code_depart?: string
  code_livraison?: string
}

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  en_cours:   'bg-blue-100 text-blue-700',
  livre:      'bg-green-100 text-green-700',
  annule:     'bg-red-100 text-red-700',
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  en_cours:   'En cours',
  livre:      'Livré',
  annule:     'Annulé',
}

export default function MesLivraisons() {
  const supabase = createClient()
  const router = useRouter()
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }

      const { data } = await supabase
        .from('commandes')
        .select('*')
        .eq('commercant_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setCommandes(data)
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]" />
    </div>
  )

  return (
    <div className="p-8 space-y-6 bg-[#F9FAFB] min-h-screen">

      {/* Header */}
      <h1 className="text-3xl font-bold text-[#0A0A0A]">Mes livraisons</h1>

      {/* Liste complète */}
      <div className="space-y-3">
        {commandes.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune livraison pour l'instant.</p>
        ) : (
          commandes.map(cmd => (
            <Card key={cmd.id} className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-[#0A0A0A]">{cmd.nom_client}</p>
                  <p className="text-xs text-gray-500">
                    {cmd.quartier} · {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                  </p>

                  {cmd.code_depart && (
                    <div className="flex gap-2 mt-1">
                      <div className="flex items-center gap-1 bg-[#FFF4EF] px-2 py-0.5 rounded text-[10px] font-bold text-[#FF6B35]">
                        <ShieldCheck size={10} /> D: {cmd.code_depart}
                      </div>
                      <div className="flex items-center gap-1 bg-[#F0FDF4] px-2 py-0.5 rounded text-[10px] font-bold text-green-600">
                        <ShieldCheck size={10} /> L: {cmd.code_livraison}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-[#FF6B35]">{cmd.prix.toLocaleString()} F</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUT_COLORS[cmd.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUT_LABELS[cmd.statut] ?? cmd.statut}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  )
}