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

  // ✅ VALIDATION complète incluant prix > 0
  const formValide =
    form.nom.trim().length > 2 &&
    form.tel.length === 8 &&
    form.quartier !== '' &&
    prix > 0

  const handleQuartierChange = (valeur: string) => {
    const quartierData = QUARTIERS_OUAGA.find(q => q.nom === valeur)
    if (quartierData) {
      setForm(prev => ({ ...prev, quartier: valeur }))
      setPrix(calculerPrixSimulation(quartierData.distanceKm))
    }
  }

  // ✅ FIX : Passage au paiement via onClick direct (plus fiable que onSubmit)
  const allerAuPaiement = () => {
    if (formValide) {
      setEtape('paiement')
    }
  }

  const handleConfirmerPaiement = async () => {
    if (!paiement.operateur || paiement.telephone.length !== 8) {
      return alert("Infos de paiement incomplètes")
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false) // ✅ FIX : évite le spinner bloqué
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

  // ✅ FIX : Reset propre de l'état au lieu de window.location.reload()
  const nouvelleCommande = () => {
    setEtape('formulaire')
    setForm({ nom: '', tel: '', quartier: '', description: '' })
    setPaiement({ operateur: '', telephone: '' })
    setPrix(0)
    setCodes({ depart: '', livraison: '' })
  }

  if (etape === 'choix_methode') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-8">KODIA EXPRESS</h1>
        <Button
          onClick={() => setEtape('formulaire')}
          className="h-16 w-full max-w-sm bg-[#FF6B35] rounded-2xl text-lg font-bold shadow-lg"
        >
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
          <Button onClick={nouvelleCommande} className="w-full bg-[#FF6B35] h-12 rounded-xl">
            Nouvelle livraison
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-6">
      {/* ✅ FIX : Bouton retour adapté selon l'étape courante */}
      <div className="flex items-center gap-4 mb-6 max-w-md mx-auto">
        <Button
          variant="ghost"
          type="button"
          onClick={() => setEtape(etape === 'paiement' ? 'formulaire' : 'choix_methode')}
          className="p-0 hover:bg-transparent"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">Nouvelle livraison</h1>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5 border border-gray-100">

          {/* Nom du destinataire */}
          <div className="space-y-2">
            <Label>Nom du destinataire</Label>
            <Input
              placeholder="Ex : Koné Aïssatou"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white"
            />
          </div>

          {/* ✅ Téléphone avec +226 intégré et non supprimable */}
          <div className="space-y-2">
            <Label>Téléphone du destinataire</Label>
            <div className="flex h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF6B35]/30 transition-all">
              <div className="flex items-center px-4 bg-[#FF6B35]/10 border-r border-gray-200 shrink-0">
                <span className="text-[#FF6B35] font-bold text-sm">+226</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={8}
                placeholder="70 12 34 56"
                value={form.tel}
                onChange={(e) => setForm({ ...form, tel: e.target.value.replace(/\D/g, '') })}
                className="flex-1 px-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
              />
            </div>
            <p className="text-xs text-gray-400 pl-1">8 chiffres après le +226 — ex : 70 12 34 56</p>
          </div>

          {/* Quartier */}
          <div className="space-y-2">
            <Label>Quartier de livraison</Label>
            {/* ✅ FIX : value= ajouté pour contrôler le Select */}
            <Select value={form.quartier} onValueChange={handleQuartierChange}>
              <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-100">
                <SelectValue placeholder="Ex : Gounghin, Patte d'Oie…" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100] bg-white">
                {QUARTIERS_OUAGA.map(q => (
                  <SelectItem key={q.nom} value={q.nom}>{q.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400 pl-1">Choisissez le quartier où livrer le colis</p>
          </div>

          {/* Description optionnelle */}
          <div className="space-y-2">
            <Label>Description du colis <span className="text-gray-400 font-normal">(optionnel)</span></Label>
            <Input
              placeholder="Ex : Robe bleue dans un sachet blanc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white"
            />
            <p className="text-xs text-gray-400 pl-1">Décrivez brièvement ce qui est dans le colis</p>
          </div>

          {/* Prix calculé */}
          {prix > 0 && (
            <div className="p-4 bg-[#FFF4EF] text-[#FF6B35] font-bold text-center rounded-xl border border-[#FF6B35]/10 animate-in fade-in">
              Total : {prix.toLocaleString()} FCFA
            </div>
          )}

          {/* ✅ FIX : onClick direct au lieu de type="submit" */}
          <Button
            type="button"
            onClick={allerAuPaiement}
            disabled={!formValide}
            className={`w-full h-14 rounded-xl font-bold text-lg transition-all shadow-md ${
              formValide
                ? 'bg-[#FF6B35] text-white hover:bg-[#e55a25]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuer vers le paiement →
          </Button>
        </div>
      </div>

      {/* Modal paiement */}
      {etape === 'paiement' && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[110] p-0">
          <div className="bg-white w-full max-w-md p-8 rounded-t-[32px] space-y-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2" />

            <div className="text-center">
              <p className="text-gray-500 font-medium">Montant à payer</p>
              <p className="text-3xl font-black text-[#FF6B35]">{prix.toLocaleString()} FCFA</p>
            </div>

            {/* Choix opérateur */}
            <div className="grid grid-cols-2 gap-4">
              {OPERATEURS.map(op => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setPaiement({ ...paiement, operateur: op.value })}
                  className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                    paiement.operateur === op.value
                      ? 'border-[#FF6B35] bg-[#FFF4EF] text-[#FF6B35]'
                      : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {/* ✅ Numéro de retrait avec +226 intégré */}
            <div className="space-y-2">
              <Label>Numéro de retrait Mobile Money</Label>
              <div className="flex h-14 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF6B35]/30 transition-all">
                <div className="flex items-center px-4 bg-[#FF6B35]/10 border-r border-gray-200 shrink-0">
                  <span className="text-[#FF6B35] font-bold text-sm">+226</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="70 00 00 00"
                  value={paiement.telephone}
                  onChange={(e) => setPaiement({ ...paiement, telephone: e.target.value.replace(/\D/g, '') })}
                  className="flex-1 px-3 bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
              </div>
              <p className="text-xs text-gray-400 pl-1">Le numéro lié à votre compte Orange ou Moov Money</p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEtape('formulaire')}
                className="flex-1 h-14 font-bold"
              >
                Retour
              </Button>
              <Button
                type="button"
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