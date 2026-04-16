'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from "@/components/ui/card"
import { Package, MapPin, Phone, User, Clock, ShieldCheck, FileText } from "lucide-react"

type Commande = {
  id: string
  nom_client: string
  telephone_client: string
  quartier: string
  prix: number
  statut: string
  created_at: string
  description_colis: string
  code_depart?: string
  code_livraison?: string
}

const STATUT_STYLES: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  livre: { label: 'Livré', color: 'bg-green-100 text-green-700' },
  annule: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
}

export default function MesLivraisons() {
  const supabase = createClient()
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCommandes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .eq('commercant_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) setCommandes(data)
      setLoading(false)
    }

    fetchCommandes()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A0A0A]">
            Livraisons
          </h1>
          <p className="text-sm text-gray-500">
            Suivi de vos commandes
          </p>
        </div>

        <div className="bg-[#FF6B35]/10 text-[#FF6B35] px-4 py-2 rounded-xl text-sm font-semibold">
          {commandes.length} total
        </div>
      </div>

      {/* EMPTY STATE */}
      {commandes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <Package size={40} strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-lg">Aucune livraison</p>
          <p className="text-sm">Clique sur le bouton + pour créer une livraison</p>
        </div>
      ) : (
        <div className="space-y-4">
          {commandes.map((cmd) => {
            const statut = STATUT_STYLES[cmd.statut] ?? { label: cmd.statut, color: 'bg-gray-100 text-gray-700' }

            return (
              <Card key={cmd.id} className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-5 space-y-4">

                  {/* TOP */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 font-semibold text-[#0A0A0A]">
                      <User size={16} className="text-[#FF6B35]" />
                      {cmd.nom_client}
                    </div>

                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statut.color}`}>
                      {statut.label}
                    </span>
                  </div>

                  {/* INFOS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      {cmd.telephone_client}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {cmd.quartier}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(cmd.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* DESCRIPTION COLIS */}
                  <div className="flex items-start gap-2 text-sm text-gray-500 bg-[#F9FAFB] rounded-xl px-3 py-2">
                    <FileText size={14} className="mt-0.5 shrink-0 text-[#FF6B35]" />
                    <span>{cmd.description_colis}</span>
                  </div>

                  {/* CODES DE SÉCURITÉ */}
                  {cmd.code_depart && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 bg-[#FFF4EF] px-3 py-1.5 rounded-lg">
                        <ShieldCheck size={14} className="text-[#FF6B35]" />
                        <span className="text-[10px] uppercase font-bold text-gray-500">Départ:</span>
                        <span className="text-sm font-black text-[#FF6B35] tracking-widest">{cmd.code_depart}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-[#F0FDF4] px-3 py-1.5 rounded-lg">
                        <ShieldCheck size={14} className="text-green-600" />
                        <span className="text-[10px] uppercase font-bold text-gray-500">Fin:</span>
                        <span className="text-sm font-black text-green-600 tracking-widest">{cmd.code_livraison}</span>
                      </div>
                    </div>
                  )}

                  {/* PRICE */}
                  <div className="flex justify-end pt-1">
                    <span className="text-xl font-bold text-[#0A0A0A]">
                      {cmd.prix.toLocaleString()} FCFA
                    </span>
                  </div>

                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}