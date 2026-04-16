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

// ✅ AJOUT : Types des opérateurs disponibles
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
  // ✅ CORRIGÉ : operateur initialisé à '' pour forcer le choix
  const [paiement, setPaiement] = useState({ operateur: '', telephone: '' })
  const [prix, setPrix] = useState(0)
  const [codes, setCodes] = useState({ depart: '', livraison: '' })

  const lienWhatsApp = "https://wa.me/message/TIFE3SLLZICKK1"
  const numeroAppel = "+22653008298"

  const handleQuartierChange = (valeur: string) => {
    const quartierData = QUARTIERS_OUAGA.find(q => q.nom === valeur)
    if (quartierData) {
      setForm({ ...form, quartier: valeur })
      setPrix(calculerPrixSimulation(quartierData.distanceKm))
    }
  }

  const ouvrirWhatsApp = () => {
    window.open(lienWhatsApp, '_blank')
  }

  const appeler = () => {
    window.location.href = `tel:${numeroAppel}`
  }

  const handleSoumettreFormulaire = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom || !form.tel || !form.quartier) {
      alert("Remplissez tous les champs obligatoires")
      return
    }
    setEtape('paiement')
  }

  const handleConfirmerPaiement = async () => {
    // ✅ CORRIGÉ : Validation de l'opérateur et du numéro
    if (!paiement.operateur) return alert("Choisissez un opérateur de paiement")
    if (!paiement.telephone) return alert("Entrez votre numéro de paiement")

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
      // ✅ CORRIGÉ : L'opérateur choisi par l'utilisateur est bien sauvegardé
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

  // ✅ Écran choix méthode
  if (etape === 'choix_methode') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#0A0A0A]">KODIA EXPRESS</h1>
          <p className="text-[#6B7280] mt-1">Comment souhaitez-vous commander ?</p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          <button
            onClick={() => setEtape('formulaire')}
            className="flex flex-col items-center justify-center gap-2 bg-[#FF6B35] text-white rounded-2xl p-4 shadow-md hover:bg-[#e55a25] transition-all active:scale-95"
          >
            <Smartphone size={28} />
            <span className="text-xs font-semibold text-center leading-tight">
              Commande automatique
            </span>
          </button>

          <button
            onClick={ouvrirWhatsApp}
            className="flex flex-col items-center justify-center gap-2 bg-green-500 text-white rounded-2xl p-4 shadow-md hover:bg-green-600 transition-all active:scale-95"
          >
            <MessageCircle size={28} />
            <span className="text-xs font-semibold text-center leading-tight">
              Commander par message
            </span>
          </button>

          <button
            onClick={appeler}
            className="flex flex-col items-center justify-center gap-2 bg-blue-500 text-white rounded-2xl p-4 shadow-md hover:bg-blue-600 transition-all active:scale-95"
          >
            <Phone size={28} />
            <span className="text-xs font-semibold text-center leading-tight">
              Commander par appel
            </span>
          </button>
        </div>

        <p className="text-xs text-[#6B7280] mt-6">
          Service disponible de 08h à 20h
        </p>
      </div>
    )
  }

  // ✅ Confirmation avec les codes de sécurité
  if (etape === 'confirmation') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm text-center space-y-6">
          
          <CheckCircle2 className="text-green-500 mx-auto" size={56} />
          <div>
            <h2 className="text-xl font-bold text-[#0A0A0A]">Livraison confirmée !</h2>
            <p className="text-[#6B7280] text-sm mt-1">{prix.toLocaleString()} FCFA payé</p>
          </div>

          <p className="text-sm text-[#6B7280]">
            Transmettez ces codes à votre livreur
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFF4EF] rounded-2xl p-4">
              <p className="text-xs text-[#6B7280] mb-1">Code départ</p>
              <p className="text-3xl font-bold tracking-widest text-[#FF6B35]">
                {codes.depart}
              </p>
            </div>
            <div className="bg-[#F0FDF4] rounded-2xl p-4">
              <p className="text-xs text-[#6B7280] mb-1">Code livraison</p>
              <p className="text-3xl font-bold tracking-widest text-green-600">
                {codes.livraison}
              </p>
            </div>
          </div>

          <p className="text-xs text-[#6B7280]">
            ⚠️ Gardez ces codes jusqu'à la livraison
          </p>

          <Button 
            onClick={() => {
              setEtape('choix_methode')
              setForm({ nom: '', tel: '', quartier: '', description: '' })
              // ✅ CORRIGÉ : On réinitialise aussi l'opérateur
              setPaiement({ operateur: '', telephone: '' })
              setPrix(0)
            }} 
            className="w-full bg-[#FF6B35] hover:bg-[#e55a25] text-white rounded-xl h-12"
          >
            Nouvelle livraison
          </Button>
        </div>
      </div>
    )
  }

  // ✅ Formulaire
  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Nouvelle livraison</h1>
        <Button variant="outline" onClick={() => setEtape('choix_methode')}>
          <ArrowLeft size={16} />
        </Button>
      </div>

      <form onSubmit={handleSoumettreFormulaire} className="space-y-4">

        {/* Bloc infos client */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Informations client</p>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#0A0A0A]">Nom complet</Label>
            <Input
              placeholder="Ex: Seydou Kaboré"
              value={form.nom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, nom: e.target.value })
              }
              className="h-12 rounded-xl border-gray-200 bg-[#F9FAFB] focus:bg-white focus:border-[#FF6B35] focus:ring-[#FF6B35]/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#0A0A0A]">Téléphone</Label>
            <div className="flex h-12 rounded-xl border border-gray-200 bg-[#F9FAFB] overflow-hidden focus-within:border-[#FF6B35] focus-within:bg-white transition-all">
              <div className="flex items-center px-3 bg-[#F0F0F0] border-r border-gray-200 shrink-0">
                <span className="text-sm font-semibold text-[#0A0A0A]">🇧🇫 +226</span>
              </div>
              <input
                type="tel"
                placeholder="XX XX XX XX"
                maxLength={8}
                value={form.tel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 8)
                  setForm({ ...form, tel: val })
                }}
                className="flex-1 px-3 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <div className="flex items-center pr-3">
                <span className={`text-xs font-medium ${form.tel.length === 8 ? 'text-green-500' : 'text-gray-400'}`}>
                  {form.tel.length}/8
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc colis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Détails du colis</p>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#0A0A0A]">Description du colis</Label>
            <textarea
              placeholder="Ex: Vêtements, 2kg, fragile..."
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-[#FF6B35] focus:bg-white resize-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#0A0A0A]">Quartier de livraison</Label>
            <Select onValueChange={handleQuartierChange}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-[#F9FAFB] focus:border-[#FF6B35]">
                <SelectValue placeholder="Choisir un quartier..." />
              </SelectTrigger>
              <SelectContent>
                {QUARTIERS_OUAGA.map(q => (
                  <SelectItem key={q.nom} value={q.nom}>
                    {q.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {prix > 0 && (
            <div className="flex items-center justify-between bg-[#FFF4EF] rounded-xl px-4 py-3">
              <span className="text-sm text-[#6B7280]">Prix estimé</span>
              <span className="text-lg font-bold text-[#FF6B35]">{prix.toLocaleString()} FCFA</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#FF6B35] hover:bg-[#e55a25] text-white rounded-xl h-12 font-semibold shadow-sm transition-all active:scale-95"
          >
            Continuer vers le paiement →
          </Button>
        </div>
      </form>

      {/* MODAL PAIEMENT */}
      {etape === 'paiement' && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-t-3xl space-y-5 animate-in slide-in-from-bottom">
            <p className="text-center text-xl font-bold text-[#FF6B35]">{prix.toLocaleString()} FCFA</p>

            {/* ✅ AJOUT : Sélecteur d'opérateur */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#0A0A0A]">Opérateur de paiement</Label>
              <div className="grid grid-cols-2 gap-3">
                {OPERATEURS.map(op => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setPaiement({ ...paiement, operateur: op.value })}
                    className={`
                      h-12 rounded-xl border-2 text-sm font-semibold transition-all
                      ${paiement.operateur === op.value
                        ? 'border-[#FF6B35] bg-[#FFF4EF] text-[#FF6B35]'
                        : 'border-gray-200 bg-[#F9FAFB] text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#0A0A0A]">Numéro de paiement</Label>
              <Input
                placeholder="Ex: 53 00 00 00"
                value={paiement.telephone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPaiement({ ...paiement, telephone: e.target.value })
                }
                className="h-12 rounded-xl border-gray-200"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEtape('formulaire')} className="flex-1">
                Retour
              </Button>
              <Button onClick={handleConfirmerPaiement} className="flex-1 bg-[#FF6B35] hover:bg-[#e55a25] text-white">
                {loading ? <Loader2 className="animate-spin" /> : "Payer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}