'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  Smartphone,
  CheckCircle2,
  MessageCircle,
  Phone,
  ArrowLeft
} from "lucide-react"
import { QUARTIERS_OUAGA, calculerPrixSimulation } from "@/lib/simulation-maps"

type Etape = 'choix_methode' | 'formulaire' | 'paiement' | 'confirmation'

const OPERATEURS = [
  { value: 'orange', label: '🟠 Orange Money' },
  { value: 'moov', label: '🔵 Moov Money' },
]

export default function NouvelleLivraison() {
  const router = useRouter()
  const supabase = createClient()

  const [etape, setEtape] = useState<Etape>('choix_methode')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nom: '', tel: '', quartier: '', description: '' })
  const [paiement, setPaiement] = useState({ operateur: '', telephone: '' })
  const [prix, setPrix] = useState(0)
  const [codes, setCodes] = useState({ depart: '', livraison: '' })

  // ✅ validation dynamique
  const formValide =
    form.nom.trim() !== '' &&
    form.tel.length === 8 &&
    form.quartier.trim() !== ''

  const lienWhatsApp = "https://wa.me/message/TIFE3SLLZICKK1"
  const numeroAppel = "+22653008298"

  const handleQuartierChange = (valeur: string) => {
    const quartierData = QUARTIERS_OUAGA.find(q => q.nom === valeur)
    if (quartierData) {
      setForm({ ...form, quartier: valeur })
      setPrix(calculerPrixSimulation(quartierData.distanceKm))
    }
  }

  const ouvrirWhatsApp = () => window.open(lienWhatsApp, '_blank')
  const appeler = () => window.location.href = `tel:${numeroAppel}`

  const handleSoumettreFormulaire = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formValide) return
    setEtape('paiement')
  }

  const handleConfirmerPaiement = async () => {
    if (!paiement.operateur) return alert("Choisissez un opérateur")
    if (!paiement.telephone) return alert("Entrez votre numéro")

    setLoading(true)
    await new Promise(res => setTimeout(res, 2000))

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      router.push('/connexion')
      return
    }

    const codeDepart = Math.floor(1000 + Math.random() * 9000).toString()
    const codeLivraison = Math.floor(1000 + Math.random() * 9000).toString()

    const { error } = await supabase.from('commandes').insert({
      nom_client: form.nom,
      telephone_client: `+226${form.tel}`,
      quartier: form.quartier,
      description_colis: form.description,
      prix,
      commercant_id: user.id,
      statut: 'en_attente',
      operateur: paiement.operateur,
      telephone_paiement: paiement.telephone,
      paiement_statut: 'paye',
      code_depart: codeDepart,
      code_livraison: codeLivraison
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      setEtape('formulaire')
    } else {
      setCodes({ depart: codeDepart, livraison: codeLivraison })
      setEtape('confirmation')
    }
  }

  // ================= CHOIX METHODE =================
  if (etape === 'choix_methode') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">KODIA EXPRESS</h1>
        <p className="text-[#6B7280] mt-1">Comment souhaitez-vous commander ?</p>

        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-6">
          <button onClick={() => setEtape('formulaire')} className="flex flex-col items-center gap-2 bg-[#FF6B35] text-white rounded-2xl p-4">
            <Smartphone size={28} />
            <span className="text-xs font-semibold text-center">Commande automatique</span>
          </button>

          <button onClick={ouvrirWhatsApp} className="flex flex-col items-center gap-2 bg-green-500 text-white rounded-2xl p-4">
            <MessageCircle size={28} />
            <span className="text-xs font-semibold text-center">Commander par message</span>
          </button>

          <button onClick={appeler} className="flex flex-col items-center gap-2 bg-blue-500 text-white rounded-2xl p-4">
            <Phone size={28} />
            <span className="text-xs font-semibold text-center">Commander par appel</span>
          </button>
        </div>
      </div>
    )
  }

  // ================= CONFIRMATION =================
  if (etape === 'confirmation') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm text-center space-y-6">
          <CheckCircle2 className="text-green-500 mx-auto" size={56} />

          <h2 className="text-xl font-bold">Livraison confirmée !</h2>
          <p>{prix.toLocaleString()} FCFA payé</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFF4EF] rounded-2xl p-4">
              <p className="text-xs">Code départ</p>
              <p className="text-3xl font-bold text-[#FF6B35]">{codes.depart}</p>
            </div>
            <div className="bg-[#F0FDF4] rounded-2xl p-4">
              <p className="text-xs">Code livraison</p>
              <p className="text-3xl font-bold text-green-600">{codes.livraison}</p>
            </div>
          </div>

          <Button onClick={()=>setEtape('choix_methode')} className="w-full bg-[#FF6B35] text-white">
            Nouvelle livraison
          </Button>
        </div>
      </div>
    )
  }

  // ================= FORMULAIRE =================
  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Nouvelle livraison</h1>
        <Button variant="outline" onClick={() => setEtape('choix_methode')}>
          <ArrowLeft size={16} />
        </Button>
      </div>

      <form onSubmit={handleSoumettreFormulaire} className="space-y-4">

        <div className="bg-white rounded-2xl p-5 space-y-4">
          <Label>Nom complet</Label>
          <Input value={form.nom} onChange={(e)=>setForm({...form,nom:e.target.value})} />

          <Label>Téléphone</Label>
          <Input maxLength={8} value={form.tel} onChange={(e)=>setForm({...form,tel:e.target.value.replace(/\D/g,'')})} />

          <Label>Quartier</Label>
          <Select onValueChange={handleQuartierChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choisir un quartier..." />
            </SelectTrigger>

            {/* FIX Z INDEX */}
            <SelectContent position="popper" className="z-[100]">
              {QUARTIERS_OUAGA.map(q => (
                <SelectItem key={q.nom} value={q.nom}>{q.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {prix > 0 && (
            <div className="bg-[#FFF4EF] p-3 rounded-xl text-center font-bold">
              {prix.toLocaleString()} FCFA
            </div>
          )}

          <Button
            type="submit"
            disabled={!formValide}
            className="w-full h-12 rounded-xl font-semibold disabled:bg-gray-300 disabled:text-gray-500 enabled:bg-[#FF6B35] enabled:hover:bg-[#e55a25] enabled:text-white"
          >
            Continuer vers le paiement →
          </Button>
        </div>

      </form>
    </div>
  )
}