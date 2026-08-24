'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase'
import Swal from 'sweetalert2'

export default function Dashboard() {
  const [countWait, setCountWait] = useState(0)
  const [countDoing, setCountDoing] = useState(0)
  const [countSuccess, setCountSuccess] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const [waitRes, doingRes, successRes] = await Promise.all([
        supabase.from('todos').select('id', { count: 'exact' }).eq('status', 'use'),
        supabase.from('todos').select('id', { count: 'exact' }).eq('status', 'doing'),
        supabase.from('todos').select('id', { count: 'exact' }).eq('status', 'success'),
      ])

      if (waitRes.error) throw waitRes.error
      if (doingRes.error) throw doingRes.error
      if (successRes.error) throw successRes.error

      setCountWait(waitRes.count || 0)
      setCountDoing(doingRes.count || 0)
      setCountSuccess(successRes.count || 0)
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/90 drop-shadow-lg flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[18px] bg-white/15 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-[0_4px_16px_0_rgba(255,255,255,0.1)]">
            <i className="fa fa-chart-line text-lg sm:text-xl text-white/90"></i>
          </div>
          Dashboard
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {/* Count Wait */}
        <div className="group relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden hover:shadow-amber-500/20 hover:border-amber-400/30 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="relative p-4 sm:p-5 md:p-6">
            <div className="flex items-start justify-between mb-4 sm:mb-5 md:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-[16px] sm:rounded-[18px] md:rounded-[20px] bg-gradient-to-br from-amber-500/30 to-yellow-500/30 backdrop-blur-xl flex items-center justify-center border border-amber-400/30 shadow-lg">
                <i className="fa fa-clock text-2xl sm:text-2xl md:text-3xl text-amber-300"></i>
              </div>
              <div className="text-right">
                <div className="text-amber-300/80 text-xs sm:text-sm font-medium mb-1">Status</div>
                <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30 font-medium">
                  Pending
                </div>
              </div>
            </div>
            
            <div className="text-white/70 text-sm sm:text-base font-medium mb-2">รอทำ</div>
            <div className="text-4xl sm:text-5xl md:text-5xl font-bold text-white/95 drop-shadow-lg mb-3 sm:mb-4">
              {countWait}
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
              <div className="text-amber-300/70 text-xs sm:text-sm flex items-center gap-2">
                <i className="fa fa-tasks"></i>
                <span>งานที่รอดำเนินการ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Count Doing */}
        <div className="group relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden hover:shadow-blue-500/20 hover:border-blue-400/30 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="relative p-4 sm:p-5 md:p-6">
            <div className="flex items-start justify-between mb-4 sm:mb-5 md:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-[16px] sm:rounded-[18px] md:rounded-[20px] bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-xl flex items-center justify-center border border-blue-400/30 shadow-lg">
                <i className="fa fa-spinner fa-spin text-2xl sm:text-2xl md:text-3xl text-blue-300"></i>
              </div>
              <div className="text-right">
                <div className="text-blue-300/80 text-xs sm:text-sm font-medium mb-1">Status</div>
                <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 font-medium">
                  In Progress
                </div>
              </div>
            </div>
            
            <div className="text-white/70 text-sm sm:text-base font-medium mb-2">กำลังทำ</div>
            <div className="text-4xl sm:text-5xl md:text-5xl font-bold text-white/95 drop-shadow-lg mb-3 sm:mb-4">
              {countDoing}
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
              <div className="text-blue-300/70 text-xs sm:text-sm flex items-center gap-2">
                <i className="fa fa-cog fa-spin"></i>
                <span>งานที่กำลังดำเนินการ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Count Success */}
        <div className="group relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden hover:shadow-emerald-500/20 hover:border-emerald-400/30 transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="relative p-4 sm:p-5 md:p-6">
            <div className="flex items-start justify-between mb-4 sm:mb-5 md:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-[16px] sm:rounded-[18px] md:rounded-[20px] bg-gradient-to-br from-emerald-500/30 to-green-500/30 backdrop-blur-xl flex items-center justify-center border border-emerald-400/30 shadow-lg">
                <i className="fa fa-check-circle text-2xl sm:text-2xl md:text-3xl text-emerald-300"></i>
              </div>
              <div className="text-right">
                <div className="text-emerald-300/80 text-xs sm:text-sm font-medium mb-1">Status</div>
                <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-medium">
                  Completed
                </div>
              </div>
            </div>
            
            <div className="text-white/70 text-sm sm:text-base font-medium mb-2">ทำเสร็จแล้ว</div>
            <div className="text-4xl sm:text-5xl md:text-5xl font-bold text-white/95 drop-shadow-lg mb-3 sm:mb-4">
              {countSuccess}
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
              <div className="text-emerald-300/70 text-xs sm:text-sm flex items-center gap-2">
                <i className="fa fa-check-double"></i>
                <span>งานที่เสร็จสมบูรณ์</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mt-4 sm:mt-5 md:mt-6 relative bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        
        <div className="relative p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] sm:rounded-[18px] bg-white/15 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-[0_4px_16px_0_rgba(255,255,255,0.1)]">
                <i className="fa fa-chart-pie text-xl sm:text-2xl text-white/90"></i>
              </div>
              <div>
                <h3 className="text-white/90 font-semibold text-base sm:text-lg">สรุปงานทั้งหมด</h3>
                <p className="text-white/60 text-xs sm:text-sm">Total Tasks Overview</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-xs sm:text-sm">งานทั้งหมด</div>
              <div className="text-2xl sm:text-3xl font-bold text-white/90">
                {countWait + countDoing + countSuccess}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 sm:mt-5 md:mt-6">
            <div className="flex justify-between text-xs sm:text-sm text-white/70 mb-2">
              <span>ความคืบหน้า</span>
              <span>
                {countWait + countDoing + countSuccess > 0 
                  ? Math.round((countSuccess / (countWait + countDoing + countSuccess)) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="w-full h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl border border-white/20">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-teal-200 rounded-full transition-all duration-1000 shadow-lg"
                style={{ 
                  width: `${countWait + countDoing + countSuccess > 0 
                    ? (countSuccess / (countWait + countDoing + countSuccess)) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Detail Stats */}
          <div className="mt-4 sm:mt-5 md:mt-6 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <div className="text-center p-2 sm:p-3 rounded-[12px] sm:rounded-[16px] bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-amber-300 text-xl sm:text-2xl font-bold">{countWait}</div>
              <div className="text-white/60 text-xs mt-1">รอทำ</div>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-[12px] sm:rounded-[16px] bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-blue-300 text-xl sm:text-2xl font-bold">{countDoing}</div>
              <div className="text-white/60 text-xs mt-1">กำลังทำ</div>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-[12px] sm:rounded-[16px] bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-emerald-300 text-xl sm:text-2xl font-bold">{countSuccess}</div>
              <div className="text-white/60 text-xs mt-1">เสร็จแล้ว</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}