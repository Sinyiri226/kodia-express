"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Package,
  LogOut,
  Plus,
  User,
  X,
  Mail,
  UserCircle,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserProfile {
  email: string | null
  full_name: string | null
  phone: string | null
  created_at: string | null
}

// ─── Bottom Sheet Compte ──────────────────────────────────────────────────────
function CompteBottomSheet({
  open,
  onClose,
  onLogout,
  profile,
}: {
  open: boolean
  onClose: () => void
  onLogout: () => void
  profile: UserProfile | null
}) {
  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  // Bloquer le scroll quand ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? "?"

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 md:hidden animate-fadeIn"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slideUp">
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
            <span className="font-semibold text-[#0A0A0A] text-base">Mon Compte</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Avatar + Nom */}
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-20 h-20 rounded-full bg-[#FF6B35] flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
            {profile?.full_name && (
              <p className="text-[#0A0A0A] font-semibold text-lg leading-tight text-center px-4">
                {profile.full_name}
              </p>
            )}
          </div>

          {/* Infos */}
          <div className="mx-4 mb-4 bg-gray-50 rounded-2xl divide-y divide-gray-100 overflow-hidden">
            {profile?.email && (
              <InfoRow icon={<Mail size={16} className="text-[#FF6B35]" />} label="Email" value={profile.email} />
            )}
            {profile?.full_name && (
              <InfoRow icon={<UserCircle size={16} className="text-[#FF6B35]" />} label="Nom complet" value={profile.full_name} />
            )}
            {profile?.phone && (
              <InfoRow icon={<User size={16} className="text-[#FF6B35]" />} label="Téléphone" value={profile.phone} />
            )}
            {profile?.created_at && (
              <InfoRow
                icon={<User size={16} className="text-[#FF6B35]" />}
                label="Membre depuis"
                value={new Date(profile.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              />
            )}
          </div>

          {/* Bouton déconnexion */}
          <div className="px-4 pb-8">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 font-semibold rounded-2xl hover:bg-red-100 active:scale-95 transition-all"
            >
              <LogOut size={18} />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-[#0A0A0A] font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

// ─── Desktop : Sidebar Compte Panel ──────────────────────────────────────────
function SidebarComptePanel({
  open,
  onClose,
  onLogout,
  profile,
}: {
  open: boolean
  onClose: () => void
  onLogout: () => void
  profile: UserProfile | null
}) {
  if (!open) return null

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? "?"

  return (
    <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100 animate-fadeIn">
      {/* Avatar */}
      <div className="flex flex-col items-center pt-6 pb-4 bg-gradient-to-b from-orange-50 to-white gap-2">
        <div className="w-16 h-16 rounded-full bg-[#FF6B35] flex items-center justify-center shadow-md">
          <span className="text-white text-xl font-bold">{initials}</span>
        </div>
        {profile?.full_name && (
          <p className="text-sm font-semibold text-[#0A0A0A]">{profile.full_name}</p>
        )}
        {profile?.email && (
          <p className="text-xs text-gray-400 truncate px-4 max-w-full">{profile.email}</p>
        )}
      </div>

      {/* Infos supplémentaires */}
      <div className="px-4 pb-3 space-y-1">
        {profile?.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
            <User size={13} className="text-[#FF6B35]" />
            <span>{profile.phone}</span>
          </div>
        )}
        {profile?.created_at && (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
            <UserCircle size={13} className="text-[#FF6B35]" />
            <span>Membre depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm bg-red-50 text-red-500 font-medium rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut size={15} />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

// ─── Layout Principal ─────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [compteOuvert, setCompteOuvert] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Cacher bouton flottant sur page création livraison
  const cacherBoutonFlottant = pathname.includes('/nouvelle-livraison')

  const navItems = [
    { name: "Accueil", href: "/dashboard", icon: LayoutDashboard },
    { name: "Livraisons", href: "/mes-livraisons", icon: Package },
  ]

  // Charger les infos utilisateur depuis Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Données de base depuis auth
      const baseProfile: UserProfile = {
        email: user.email ?? null,
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        phone: user.phone ?? user.user_metadata?.phone ?? null,
        created_at: user.created_at ?? null,
      }

      // Optionnel : enrichir depuis une table `profiles` si elle existe
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single()

      if (profileData) {
        baseProfile.full_name = profileData.full_name ?? baseProfile.full_name
        baseProfile.phone = profileData.phone ?? baseProfile.phone
      }

      setProfile(baseProfile)
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 bg-[#0A0A0A] text-white flex-col relative">
        <Link href="/dashboard" className="p-6 block">
          <h1 className="text-xl font-bold tracking-tight text-[#FF6B35]">
            KODIA EXPRESS
          </h1>
        </Link>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive
                    ? "bg-[#FF6B35] text-white shadow-lg"
                    : "text-[#687280] hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Compte desktop */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setCompteOuvert((v) => !v)}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors ${
              compteOuvert
                ? "bg-white/15 text-white"
                : "text-[#687280] hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? <User size={14} />}
            </div>
            <span className="flex-1 text-left truncate text-sm">
              {profile?.full_name ?? profile?.email ?? "Compte"}
            </span>
          </button>
        </div>

        {/* Panel Compte Desktop */}
        <SidebarComptePanel
          open={compteOuvert}
          onClose={() => setCompteOuvert(false)}
          onLogout={handleLogout}
          profile={profile}
        />
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>

      {/* ================= FLOATING ACTION BUTTON (MOBILE) ================= */}
      {!cacherBoutonFlottant && (
        <Link
          href="/dashboard/nouvelle-livraison"
          className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition">
            <Plus size={28} color="white" />
          </div>
        </Link>
      )}

      {/* ================= BOTTOM NAVIGATION (MOBILE) ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center text-xs"
              >
                <Icon size={22} className={isActive ? "text-[#FF6B35]" : "text-gray-400"} />
                <span className={isActive ? "text-[#FF6B35] mt-1" : "text-gray-400 mt-1"}>
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* Bouton Compte mobile */}
          <button
            onClick={() => setCompteOuvert(true)}
            className="flex flex-col items-center justify-center text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-[10px] font-bold">
              {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-gray-400 mt-1">Compte</span>
          </button>
        </div>
      </div>

      {/* ================= BOTTOM SHEET COMPTE (MOBILE) ================= */}
      <CompteBottomSheet
        open={compteOuvert}
        onClose={() => setCompteOuvert(false)}
        onLogout={handleLogout}
        profile={profile}
      />

      {/* ================= STYLES ANIMATIONS ================= */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
      `}</style>

    </div>
  )
}