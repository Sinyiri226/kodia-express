'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, TrendingUp, Clock, CheckCircle, Plus } from "lucide-react"

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

export default function Dashboard() {
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

  const total = commandes.reduce((sum, c) => sum + c.prix, 0)
  const enAttente = commandes.filter(c => c.statut === 'en_attente').length
  const livrees = commandes.filter(c => c.statut === 'livre').length

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]" />
    </div>
  )

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0A0A0A]">Vue d'ensemble</h1>
        <Link href="/dashboard/nouvelle-livraison">
          <Button className="bg-[#FF6B35] hover:bg-orange-600 text-white rounded-xl flex items-center gap-2">
            <Plus size={16} /> Nouvelle livraison
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total livraisons', value: commandes.length, icon: Package, color: 'text-[#FF6B35]' },
          { label: 'Chiffre total', value: `${total.toLocaleString()} F`, icon: TrendingUp, color: 'text-green-600' },
          { label: 'En attente', value: enAttente, icon: Clock, color: 'text-yellow-600' },
          { label: 'Livrées', value: livrees, icon: CheckCircle, color: 'text-blue-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gray-100 ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-bold text-[#0A0A0A]">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}