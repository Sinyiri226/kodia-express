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

  // ✅ VALIDATION : Vérifie strictement le remplissage pour activer le bouton
  const formValide =
    form.nom.trim().length > 2 && 
    form.tel.length === 8 &&
    form.quartier !== ''

  const handleQuartierChange = (valeur: string) => {
    const quartierData = QUARTIERS_OUAGA.find(q => q.nom === valeur)
    if (quartierData) {
      setForm(prev => ({ ...prev, quartier: valeur }))
      setPrix(calculerPrixSimulation(quartierData.distanceKm))
    }
  }

  // ✅ FONCTION DE PASSAGE AU PAIEMENT
  const allerAuPaiement = (e: React.FormEvent) => {
    e.preventDefault() // Empêche le rechargement de la page
    if (formValide) {
      setEtape('paiement')
    }
  }

  const handleConfirmerPaiement = async () => {
    if (!paiement.operateur || paiement.telephone.length !== 8) return alert("Infos de paiement incomplètes")
    
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
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
      telephone_paiement: `+226${paiement.telephone}`,
      paiement_statut: 'paye',
      code_depart: codeDepart,
      code_livraison: codeLivraison
    })

    setLoading(false)
    if (!error) {
      setCodes({ depart: codeDepart, livraison: codeLivraison })
      setEtape('confirmation')
    } else {
      alert("Erreur lors de l'enregistrement : " + error.message)
    }
  }

  if (etape === 'choix_methode') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-8">KODIA EXPRESS</h1>
        <Button onClick={() => setEtape('formulaire')} className="h-16 w-full max-w-sm bg-[#FF6B35] rounded-2xl text-lg font-bold shadow-lg">
          <Smartphone className="mr-2" /> Commande Automatique
        </Button>
      </div>
    )
  }

  if (etape === 'confirmation') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center space-y-6 shadow-xl border border-gray-100">
          <CheckCircle2 className="text-green-500 mx-auto" size={60} />
          <h2 className="text-2xl font-bold">Commande validée !</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FFF4EF] p-4 rounded-2xl border border-[#FF6B35]/20">
              <p className="text-xs text-[#FF6B35] font-bold">CODE DÉPART</p>
              <p className="text-2xl font-bold">{codes.depart}</p>
            </div>
            <div className="bg-[#F0FDF4] p-4 rounded-2xl border border-green-100">
              <p className="text-xs text-green-600 font-bold">CODE ARRIVÉE</p>
              <p className="text-2xl font-bold">{codes.livraison}</p>
            </div>
          </div>
          <Button onClick={() => window.location.reload()} className="w-full bg-[#FF6B35] h-12 rounded-xl">Nouvelle livraison</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-6">
      <div className="flex items-center gap-4 mb-6 max-w-md mx-auto">
        <Button variant="ghost" onClick={() => setEtape('choix_methode')} className="p-0 hover:bg-transparent">
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">Nouvelle livraison</h1>
      </div>

      <form onSubmit={allerAuPaiement} className="space-y-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5 border border-gray-100">
          
          <div className="space-y-2">
            <Label>Nom du destinataire</Label>
            <Input 
              placeholder="Ex: Abdoul Rahim" 
              required
              value={form.nom} 
              onChange={(e) => setForm({...form, nom: e.target.value})}
              className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Téléphone</Label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-gray-400">+226</span>
              <Input 
                type="tel"
                maxLength={8} 
                placeholder="53 00 00 00"
                required
                value={form.tel} 
                onChange={(e) => setForm({...form, tel: e.target.value.replace(/\D/g,'')})}
                className="h-12 pl-16 rounded-xl bg-gray-50 border-gray-100 w-full focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quartier de livraison</Label>
            <Select onValueChange={handleQuartierChange}>
              <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-100">
                <SelectValue placeholder="Choisir le lieu..." />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100] bg-white">
                {QUARTIERS_OUAGA.map(q => (
                  <SelectItem key={q.nom} value={q.nom}>{q.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description (Optionnel)</Label>
            <Input 
              placeholder="Ex: Un colis de vêtements" 
              value={form.description} 
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="h-12 rounded-xl bg-gray-50 border-gray-100"
            />
          </div>

          {prix > 0 && (
            <div className="p-4 bg-[#FFF4EF] text-[#FF6B35] font-bold text-center rounded-xl border border-[#FF6B35]/10 animate-in fade-in">
              Total : {prix.toLocaleString()} FCFA
            </div>
          )}

          <Button
            type="submit"
            disabled={!formValide}
            className={`w-full h-14 rounded-xl font-bold text-lg transition-all shadow-md ${
              formValide ? 'bg-[#FF6B35] text-white hover:bg-[#e55a25]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuer vers le paiement →
          </Button>
        </div>
      </form>

      {etape === 'paiement' && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[110] p-0">
          <div className="bg-white w-full max-w-md p-8 rounded-t-[32px] space-y-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
            <div className="text-center">
              <p className="text-gray-500 font-medium">Montant à payer</p>
              <p className="text-3xl font-black text-[#FF6B35]">{prix.toLocaleString()} FCFA</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {OPERATEURS.map(op => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setPaiement({ ...paiement, operateur: op.value })}
                  className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                    paiement.operateur === op.value ? 'border-[#FF6B35] bg-[#FFF4EF] text-[#FF6B35]' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Numéro de retrait</Label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-gray-400">+226</span>
                <Input
                  type="tel"
                  maxLength={8}
                  placeholder="70 00 00 00"
                  value={paiement.telephone}
                  onChange={(e) => setPaiement({...paiement, telephone: e.target.value.replace(/\D/g,'')})}
                  className="h-14 pl-16 rounded-2xl bg-gray-50 border-none focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setEtape('formulaire')} className="flex-1 h-14 font-bold">Retour</Button>
              <Button 
                onClick={handleConfirmerPaiement} 
                disabled={loading || !paiement.operateur || paiement.telephone.length !== 8}
                className="flex-1 h-14 bg-[#FF6B35] text-white font-bold rounded-2xl shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Payer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}