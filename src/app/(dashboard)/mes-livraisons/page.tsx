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

  // ✅ Validation dynamique (nom, 8 chiffres pour le tel, et quartier)
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
    if (paiement.telephone.length !== 8) return alert("Entrez un numéro de 8 chiffres")

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
      telephone_paiement: `+226${paiement.telephone}`,
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
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">KODIA EXPRESS</h1>
        <p className="text-[#6B7280] mt-1">Comment souhaitez-vous commander ?</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-sm mt-8">
          <button onClick={() => setEtape('formulaire')} className="flex flex-col items-center gap-3 bg-[#FF6B35] text-white rounded-2xl p-5 shadow-sm hover:scale-105 transition">
            <Smartphone size={32} />
            <span className="text-sm font-semibold">Automatique</span>
          </button>

          <button onClick={ouvrirWhatsApp} className="flex flex-col items-center gap-3 bg-green-500 text-white rounded-2xl p-5 shadow-sm hover:scale-105 transition">
            <MessageCircle size={32} />
            <span className="text-sm font-semibold">WhatsApp</span>
          </button>

          <button onClick={appeler} className="flex flex-col items-center gap-3 bg-blue-500 text-white rounded-2xl p-5 shadow-sm hover:scale-105 transition">
            <Phone size={32} />
            <span className="text-sm font-semibold">Appel direct</span>
          </button>
        </div>
      </div>
    )
  }

  // ================= CONFIRMATION =================
  if (etape === 'confirmation') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm text-center space-y-6">
          <CheckCircle2 className="text-green-500 mx-auto" size={64} />
          <h2 className="text-2xl font-bold">Livraison confirmée !</h2>
          <p className="text-gray-600">{prix.toLocaleString()} FCFA payé avec succès.</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FFF4EF] rounded-2xl p-4 border border-[#FF6B35]/20">
              <p className="text-[10px] uppercase tracking-wider text-[#FF6B35] font-bold">Code départ</p>
              <p className="text-3xl font-bold text-[#FF6B35]">{codes.depart}</p>
            </div>
            <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-green-200">
              <p className="text-[10px] uppercase tracking-wider text-green-600 font-bold">Code livraison</p>
              <p className="text-3xl font-bold text-green-600">{codes.livraison}</p>
            </div>
          </div>

          <Button onClick={()=>setEtape('choix_methode')} className="w-full h-12 bg-[#FF6B35] text-white rounded-xl font-bold">
            Nouvelle livraison
          </Button>
        </div>
      </div>
    )
  }

  // ================= FORMULAIRE =================
  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Détails de livraison</h1>
        <Button variant="ghost" onClick={() => setEtape('choix_methode')} className="rounded-full">
          <ArrowLeft size={20} />
        </Button>
      </div>

      <form onSubmit={handleSoumettreFormulaire} className="space-y-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          
          <div className="space-y-2">
            <Label>Nom du destinataire</Label>
            <Input 
              placeholder="Ex: Abdoul Rahim" 
              value={form.nom} 
              onChange={(e)=>setForm({...form, nom: e.target.value})}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Téléphone</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+226</span>
              <Input 
                maxLength={8} 
                placeholder="53 00 00 00"
                value={form.tel} 
                onChange={(e)=>setForm({...form, tel: e.target.value.replace(/\D/g,'')})}
                className="h-12 pl-16 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quartier de livraison</Label>
            <Select onValueChange={handleQuartierChange}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Où livrer le colis ?" />
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
              placeholder="Ex: Sac de riz, chaussures..." 
              value={form.description} 
              onChange={(e)=>setForm({...form, description: e.target.value})}
              className="h-12 rounded-xl"
            />
          </div>

          {prix > 0 && (
            <div className="bg-[#FFF4EF] p-4 rounded-xl text-center font-bold text-[#FF6B35] text-lg border border-[#FF6B35]/10">
              Tarif : {prix.toLocaleString()} FCFA
            </div>
          )}

          <Button
            type="submit"
            disabled={!formValide}
            className={`w-full h-14 rounded-xl font-bold text-lg transition-all ${
              formValide 
                ? 'bg-[#FF6B35] hover:bg-[#e55a25] text-white shadow-md' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuer vers le paiement →
          </Button>
        </div>
      </form>

      {/* SECTION PAIEMENT (MODAL) */}
      {etape === 'paiement' && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md p-8 rounded-t-[32px] space-y-6 animate-in slide-in-from-bottom duration-300">
            
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />

            <div className="text-center">
              <p className="text-gray-500 text-sm">Montant à régler</p>
              <p className="text-3xl font-black text-[#FF6B35]">{prix.toLocaleString()} FCFA</p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold uppercase tracking-wider text-gray-400">Choisir un opérateur</Label>
              <div className="grid grid-cols-2 gap-4">
                {OPERATEURS.map(op => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setPaiement({ ...paiement, operateur: op.value })}
                    className={`h-14 rounded-2xl border-2 font-bold transition-all flex items-center justify-center ${
                      paiement.operateur === op.value
                        ? 'border-[#FF6B35] bg-[#FFF4EF] text-[#FF6B35]'
                        : 'border-gray-100 bg-[#F9FAFB] text-gray-500'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase tracking-wider text-gray-400">Numéro de retrait</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+226</span>
                <Input
                  maxLength={8}
                  placeholder="70 00 00 00"
                  value={paiement.telephone}
                  onChange={(e)=>setPaiement({...paiement, telephone: e.target.value.replace(/\D/g,'')})}
                  className="h-14 pl-16 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={()=>setEtape('formulaire')} className="flex-1 h-14 rounded-2xl font-bold">
                Annuler
              </Button>
              <Button
                onClick={handleConfirmerPaiement}
                disabled={loading || !paiement.operateur || paiement.telephone.length !== 8}
                className="flex-1 h-14 bg-[#FF6B35] hover:bg-[#e55a25] text-white rounded-2xl font-bold shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Confirmer le paiement"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}