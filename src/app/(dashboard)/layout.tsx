"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Package,
  LogOut,
  Plus,
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // ✅ NOUVEAU : cacher bouton flottant sur page création livraison
  const cacherBoutonFlottant = pathname.includes('/nouvelle-livraison')

  const navItems = [
    { name: "Accueil", href: "/dashboard", icon: LayoutDashboard },
    { name: "Livraisons", href: "/mes-livraisons", icon: Package },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 bg-[#0A0A0A] text-white flex-col">
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
                  ${
                    isActive
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

        {/* Logout desktop */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>

      {/* ================= FLOATING ACTION BUTTON (MOBILE) ================= */}
      {/* ✅ MODIFIÉ : caché sur /dashboard/nouvelle-livraison */}
      {!cacherBoutonFlottant && (
        <Link
          href="/dashboard/nouvelle-livraison"
          className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
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
                <Icon
                  size={22}
                  className={
                    isActive ? "text-[#FF6B35]" : "text-gray-400"
                  }
                />
                <span
                  className={
                    isActive
                      ? "text-[#FF6B35] mt-1"
                      : "text-gray-400 mt-1"
                  }
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}