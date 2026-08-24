'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase'
import { isPasswordPwned } from '../../../lib/pwned'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mode, setMode] = useState<'profile' | 'password'>('profile') // เพิ่ม state สำหรับ mode
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('members')
          .select('name, username')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (data) {
          setName(data.name)
          setUsername(data.username)
        }
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  const handleSave = async () => {
    try {
      if (mode === 'password' && password !== confirmPassword) {
        throw new Error('โปรดป้อนยืนยันรหัสผ่านให้ตรงกัน')
      }

      if (mode === 'password') {
        if (!password) {
          throw new Error('โปรดกรอกรหัสผ่านใหม่')
        }
        if (password.length < 8) {
          throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
          throw new Error('รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ อย่างน้อย 1 ตัว')
        }
        
        const isPwned = await isPasswordPwned(password)
        if (isPwned) {
          throw new Error('รหัสผ่านนี้เคยหลุดสู่สาธารณะแล้ว กรุณาใช้รหัสผ่านอื่น')
        }
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')
      
      if (mode === 'profile') {
        const { error } = await supabase.from('members').update({
          name: name,
          username: username
        }).eq('id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
      }

      Swal.fire({
        title: 'Success',
        text: mode === 'profile' ? 'บันทึกข้อมูลแล้ว' : 'เปลี่ยนรหัสผ่านสำเร็จ',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
      })

      // รีเซ็ต password fields หลังบันทึกสำเร็จ
      if (mode === 'password') {
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  return (
    <div className="min-h-screen w-full px-2 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
      {/* Header */}
      <div className="mb-3 sm:mb-4 lg:mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white/90 drop-shadow-lg flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-[0_4px_16px_0_rgba(255,255,255,0.1)]">
            <i className="fa fa-user text-xs sm:text-sm lg:text-base text-white/90"></i>
          </div>
          <span className="leading-tight">Edit Profile</span>
        </h1>
      </div>

      {/* Profile Card */}
      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        
        <div className="relative p-3 sm:p-4 lg:p-6">
          {/* Profile Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6 pb-4 sm:pb-5 lg:pb-6 border-b border-white/10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white/15 backdrop-blur-xl flex items-center justify-center border-2 border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] group-hover:border-white/50 group-hover:scale-105 transition-all duration-300">
                <i className="fa fa-user text-2xl sm:text-3xl lg:text-4xl text-white/90"></i>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white/90 mb-0.5">
                {name || 'ไม่ระบุชื่อ'}
              </h2>
              <p className="text-white/60 text-xs sm:text-sm">
                @{username || 'username'}
              </p>
            </div>
          </div>

          {/* Mode Toggle Buttons */}
          <div className="flex gap-2 mb-4 sm:mb-5 lg:mb-6">
            <button
              onClick={() => setMode('profile')}
              className={`flex-1 py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                mode === 'profile'
                  ? 'bg-white/20 border-2 border-white/40 text-white shadow-lg'
                  : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              <i className="fa fa-user text-xs sm:text-sm"></i>
              <span>แก้ไขข้อมูล</span>
            </button>
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-2 sm:py-2.5 lg:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                mode === 'password'
                  ? 'bg-white/20 border-2 border-white/40 text-white shadow-lg'
                  : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              <i className="fa fa-lock text-xs sm:text-sm"></i>
              <span>เปลี่ยนรหัสผ่าน</span>
            </button>
          </div>

          {/* Conditional Form Content */}
          {mode === 'profile' ? (
            /* Profile Form */
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5 lg:mb-6">
              {/* Name Field */}
              <div className="group">
                <label className="block text-white/90 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0">
                    <i className="fa fa-id-card text-white/90 text-xs"></i>
                  </div>
                  <span>ชื่อ</span>
                </label>
                <div className="relative">
                  <input 
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white text-xs sm:text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/15 transition-all duration-300 group-hover:border-white/25"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="กรอกชื่อของคุณ"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                    <i className="fa fa-user text-xs sm:text-sm"></i>
                  </div>
                </div>
              </div>

              {/* Username Field */}
              <div className="group">
                <label className="block text-white/90 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0">
                    <i className="fa fa-at text-white/90 text-xs"></i>
                  </div>
                  <span>Username</span>
                </label>
                <div className="relative">
                  <input 
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white text-xs sm:text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/15 transition-all duration-300 group-hover:border-white/25"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="กรอก username"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                    <i className="fa fa-user-circle text-xs sm:text-sm"></i>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Password Form */
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5 lg:mb-6">
              {/* Password Field */}
              <div className="group">
                <label className="block text-white/90 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0">
                    <i className="fa fa-lock text-white/90 text-xs"></i>
                  </div>
                  <span>รหัสผ่านใหม่</span>
                </label>
                <div className="relative">
                  <input 
                    type="password"
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white text-xs sm:text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/15 transition-all duration-300 group-hover:border-white/25"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                    <i className="fa fa-key text-xs sm:text-sm"></i>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="group">
                <label className="block text-white/90 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0">
                    <i className="fa fa-shield-alt text-white/90 text-xs"></i>
                  </div>
                  <span>ยืนยันรหัสผ่าน</span>
                </label>
                <div className="relative">
                  <input 
                    type="password"
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white text-xs sm:text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 focus:bg-white/15 transition-all duration-300 group-hover:border-white/25"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ยืนยันรหัสผ่าน"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                    <i className="fa fa-lock text-xs sm:text-sm"></i>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-2 sm:p-2.5 lg:p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-white/60 text-xs flex items-start gap-1.5">
                  <i className="fa fa-info-circle text-white/50 mt-0.5 flex-shrink-0"></i>
                  <span>รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*)</span>
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button 
              onClick={handleSave}
              className="flex-1 group relative px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 rounded-xl sm:rounded-2xl bg-white/15 border-2 border-white/30 text-white font-bold text-xs sm:text-sm flex gap-2 items-center justify-center hover:bg-white/20 hover:border-white/40 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] transition-all duration-300 overflow-hidden backdrop-blur-xl active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                <i className="fa fa-save text-xs"></i>
              </div>
              <span className="relative z-10 tracking-wide">
                {mode === 'profile' ? 'บันทึกข้อมูล' : 'เปลี่ยนรหัสผ่าน'}
              </span>
            </button>
            
            <button 
              onClick={() => router.back()}
              className="flex-1 group relative px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 rounded-xl sm:rounded-2xl bg-white/10 border-2 border-white/20 text-white/90 font-semibold text-xs sm:text-sm flex gap-2 items-center justify-center hover:bg-white/15 hover:border-white/30 hover:text-white transition-all duration-300 overflow-hidden backdrop-blur-xl active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 flex items-center justify-center border border-white/20 group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                <i className="fa fa-arrow-left text-xs"></i>
              </div>
              <span className="relative z-10 tracking-wide">ยกเลิก</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}