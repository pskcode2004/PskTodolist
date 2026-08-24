'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'
import Swal from 'sweetalert2'
import { useRouter, usePathname } from 'next/navigation'
import myImage from '../components/assets/logo.svg'

export default function Sidebar() {
  const [name, setName] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('members')
          .select('name')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (data) {
          setName(data.name)
        }
      }
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const signOut = async () => {
    const confirmButton = await Swal.fire({
      title: 'Signout',
      text: 'คุณต้องการออกจากระบบใช่ไหม',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      customClass: {
        popup: 'backdrop-blur-xl bg-gray-900/90 border border-white/20 rounded-3xl',
        confirmButton: 'bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl',
        cancelButton: 'bg-white/20 rounded-2xl'
      }
    })

    if (confirmButton.isConfirmed) {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/backoffice/signin')
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 sm:top-4 left-3 sm:left-4 z-50 w-12 sm:w-14 h-12 sm:h-14 rounded-[16px] sm:rounded-[20px] bg-white/10 backdrop-blur-3xl border border-white/30 text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
      >
        <i className={`fa ${isOpen ? 'fa-times' : 'fa-bars'} text-base sm:text-lg`}></i>
      </button>

      {/* Overlay for mobile - Full Screen */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-full lg:w-[300px] h-screen lg:h-auto
          transform transition-all duration-500 ease-out
          overflow-x-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full lg:h-[calc(100vh-2rem)] lg:m-4 m-0 rounded-none lg:rounded-[32px] bg-gradient-to-b from-white/[0.08] via-white/[0.05] to-white/[0.08] backdrop-blur-xl border-r lg:border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-y-auto lg:overflow-hidden flex flex-col relative">
          {/* Glass effect overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Ambient light effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-blue-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

          {/* Header */}
          <div className="relative p-4 sm:p-6 lg:p-8 border-b border-white/10 flex-shrink-0">
            <div className="flex flex-col items-center">
              {/* Logo */}
              <div className="relative mb-3 sm:mb-4 lg:mb-6 group">
                <div className="absolute inset-0 bg-white/20 rounded-[20px] sm:rounded-[24px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative w-16 sm:w-18 lg:w-20 h-16 sm:h-18 lg:h-20 rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] group-hover:border-white/40 group-hover:bg-white/15 transition-all duration-300">
                  <Image 
                    src={myImage} 
                    alt="Hero Logo" 
                    className="w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16" 
                  />
                </div>
              </div>

              {/* Title */}
              <div className="text-center w-full mb-3 sm:mb-4 lg:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white/95 mb-2 sm:mb-3 tracking-wide">
                  Psk Todo list
                </h2>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
                  <span className="text-white/60 text-xs sm:text-xs font-bold">{name || 'User'}</span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="w-full px-2 sm:px-0">
                <button
                  onClick={() => {
                    router.push('/backoffice/home/profile')
                    setIsOpen(false)
                  }}
                  className="w-full group relative px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-[16px] sm:rounded-[20px] bg-white/10 border border-white/30 text-white/90 font-medium flex gap-2 sm:gap-3 items-center justify-center hover:bg-white/15 hover:border-white/40 transition-all duration-300 overflow-hidden backdrop-blur-xl shadow-[0_4px_16px_0_rgba(255,255,255,0.1)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <i className="fa fa-edit relative z-10 text-sm sm:text-base"></i>
                  <span className="relative z-10 text-xs sm:text-sm">Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Menu Links */}
          <div className="relative flex-1 p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 overflow-y-auto lg:overflow-hidden">
            <Link
              href='/backoffice/home/dashboard'
              onClick={() => setIsOpen(false)}
              className={`group relative flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-[16px] sm:rounded-[20px] transition-all duration-300 ${
                pathname === '/backoffice/home/dashboard'
                  ? 'bg-white/15 shadow-[0_4px_24px_0_rgba(255,255,255,0.15)] border border-white/30'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
              }`}
            >
              {/* Glow effect on active */}
              {pathname === '/backoffice/home/dashboard' && (
                <>
                  <div className="absolute inset-0 bg-white/10 rounded-[16px] sm:rounded-[20px] blur-xl"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 sm:w-1.5 h-8 sm:h-10 bg-gradient-to-b from-white/80 to-white/40 rounded-r-full shadow-[0_0_16px_2px_rgba(255,255,255,0.5)]"></div>
                </>
              )}
              
              <div className={`relative z-10 w-10 sm:w-12 h-10 sm:h-12 rounded-[12px] sm:rounded-[16px] flex items-center justify-center transition-all duration-300 backdrop-blur-xl flex-shrink-0 ${
                pathname === '/backoffice/home/dashboard'
                  ? 'bg-white/20 shadow-[0_4px_16px_0_rgba(255,255,255,0.2)] border border-white/30'
                  : 'bg-white/10 group-hover:bg-white/15 border border-white/20'
              }`}>
                <i className={`fa fa-chart-line text-sm sm:text-lg transition-colors duration-300 ${
                  pathname === '/backoffice/home/dashboard'
                    ? 'text-white'
                    : 'text-white/70 group-hover:text-white/90'
                }`}></i>
              </div>
              
              <span className={`relative z-10 font-medium text-sm sm:text-base transition-colors duration-300 truncate ${
                pathname === '/backoffice/home/dashboard'
                  ? 'text-white'
                  : 'text-white/70 group-hover:text-white/90'
              }`}>
                Dashboard
              </span>
              
              {pathname === '/backoffice/home/dashboard' && (
                <div className="ml-auto w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.6)] flex-shrink-0"></div>
              )}
            </Link>

            <Link
              href='/backoffice/home/todo'
              onClick={() => setIsOpen(false)}
              className={`group relative flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-[16px] sm:rounded-[20px] transition-all duration-300 ${
                pathname === '/backoffice/home/todo'
                  ? 'bg-white/15 shadow-[0_4px_24px_0_rgba(255,255,255,0.15)] border border-white/30'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
              }`}
            >
              {/* Glow effect on active */}
              {pathname === '/backoffice/home/todo' && (
                <>
                  <div className="absolute inset-0 bg-white/10 rounded-[16px] sm:rounded-[20px] blur-xl"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 sm:w-1.5 h-8 sm:h-10 bg-gradient-to-b from-white/80 to-white/40 rounded-r-full shadow-[0_0_16px_2px_rgba(255,255,255,0.5)]"></div>
                </>
              )}
              
              <div className={`relative z-10 w-10 sm:w-12 h-10 sm:h-12 rounded-[12px] sm:rounded-[16px] flex items-center justify-center transition-all duration-300 backdrop-blur-xl flex-shrink-0 ${
                pathname === '/backoffice/home/todo'
                  ? 'bg-white/20 shadow-[0_4px_16px_0_rgba(255,255,255,0.2)] border border-white/30'
                  : 'bg-white/10 group-hover:bg-white/15 border border-white/20'
              }`}>
                <i className={`fa fa-tasks text-sm sm:text-lg transition-colors duration-300 ${
                  pathname === '/backoffice/home/todo'
                    ? 'text-white'
                    : 'text-white/70 group-hover:text-white/90'
                }`}></i>
              </div>
              
              <span className={`relative z-10 font-medium text-sm sm:text-base transition-colors duration-300 truncate ${
                pathname === '/backoffice/home/todo'
                  ? 'text-white'
                  : 'text-white/70 group-hover:text-white/90'
              }`}>
                Psk Todo list
              </span>
              
              {pathname === '/backoffice/home/todo' && (
                <div className="ml-auto w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.6)] flex-shrink-0"></div>
              )}
            </Link>
          </div>

          {/* Footer */}
          <div className="relative p-3 sm:p-4 lg:p-6 border-t border-white/10 flex-shrink-0 space-y-2 sm:space-y-3">
            {/* User Info */}
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-white/10 rounded-[16px] sm:rounded-[20px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/30 rounded-[16px] sm:rounded-[20px] p-2.5 sm:p-4 group-hover:bg-white/15 group-hover:border-white/40 transition-all duration-300 shadow-[0_4px_16px_0_rgba(255,255,255,0.1)]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-[12px] sm:rounded-[16px] bg-white/15 backdrop-blur-xl flex items-center justify-center border border-white/30 flex-shrink-0 shadow-[0_4px_16px_0_rgba(255,255,255,0.1)]">
                      <i className="fa fa-user text-white/90 text-xs sm:text-base"></i>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-emerald-400 border-2 border-gray-950 shadow-[0_0_12px_2px_rgba(52,211,153,0.6)]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/95 font-medium text-xs sm:text-base truncate">{name || 'User'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={signOut}
              className="w-full group relative px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-[16px] sm:rounded-[20px] bg-white/10 border border-white/30 text-white/90 font-medium flex gap-2 sm:gap-3 items-center justify-center hover:bg-red-500/20 hover:border-red-400/40 transition-all duration-300 overflow-hidden backdrop-blur-xl shadow-[0_4px_16px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_24px_0_rgba(239,68,68,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <i className="fa fa-power-off relative z-10 text-sm sm:text-base group-hover:text-red-300 transition-colors duration-300"></i>
              <span className="relative z-10 text-xs sm:text-sm group-hover:text-red-200 transition-colors duration-300">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}