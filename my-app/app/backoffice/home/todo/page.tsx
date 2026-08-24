'use client'

import { createClient } from '../../../lib/supabase'
import { useEffect, useState, useRef } from 'react'
import Swal from 'sweetalert2'

export default function Todo() {
  const [name, setName] = useState('')
  const [remark, setRemark] = useState('')
  const [id, setId] = useState(0)
  const [todos, setTodos] = useState([])
  const [status, setStatus] = useState('all')
  const [countWait, setCountWait] = useState(0)
  const [countDoing, setCountDoing] = useState(0)
  const [countSuccess, setCountSuccess] = useState(0)
  const [draggedItem, setDraggedItem] = useState<{ id: number, name: string, remark: string, status: string } | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
    fetchDashboard()
  }, [])

  useEffect(() => {
    filterData()
  }, [status])

  const fetchDashboard = async () => {
    try {
      const supabase = createClient()
      const [waitRes, doingRes, successRes] = await Promise.all([
        supabase.from('todos').select('id', { count: 'exact' }).eq('status', 'use'),
        supabase.from('todos').select('id', { count: 'exact' }).eq('status', 'doing'),
        supabase.from('todos').select('id', { count: 'exact' }).eq('status', 'success'),
      ])

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

  const filterData = async () => {
    try {
      const supabase = createClient()
      let query = supabase.from('todos').select('*').order('id', { ascending: false })
      
      if (status !== 'all') {
        const dbStatus = status === 'wait' ? 'use' : status
        query = query.eq('status', dbStatus)
      }

      const { data, error } = await query
      if (error) throw error
      
      setTodos((data as any) || [])
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: false })
      
      if (error) throw error
      setTodos((data as any) || [])
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Swal.fire({
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกชื่องาน',
        icon: 'warning'
      })
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        name: name.trim(),
        remark: remark.trim(),
        member_id: user.id
      }
      
      if (id === 0) {
        const { error } = await supabase.from('todos').insert(payload)
        if (error) throw error
      } else {
        const { error } = await supabase.from('todos').update(payload).eq('id', id)
        if (error) throw error
      }

      Swal.fire({
        title: 'สำเร็จ',
        text: id === 0 ? 'สร้างงานใหม่สำเร็จ' : 'อัปเดตงานสำเร็จ',
        icon: 'success',
        timer: 1500
      })
      fetchData()
      fetchDashboard()
      handleClear()
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (todo: { id: number, name: string, remark: string }) => {
    setId(todo.id)
    setName(todo.name)
    setRemark(todo.remark)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleClear = () => {
    setId(0)
    setName('')
    setRemark('')
  }

  const handleRemove = async (id: number) => {
    const confirmButton = await Swal.fire({
      title: 'ลบรายการ',
      text: 'คุณต้องการลบรายการใช่หรือไม่ ?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    })

    if (confirmButton.isConfirmed) {
      const supabase = createClient()
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
      
      fetchData()
      fetchDashboard()
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('todos').update({ status }).eq('id', id)
      if (error) throw error

      fetchData()
      fetchDashboard()
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  const getFilteredTodos = () => {
    if (status === 'all') return todos
    return todos.filter((t: any) => t.status === status)
  }

  const getTodosByStatus = (filterStatus: string) => {
    return getFilteredTodos().filter((t: any) =>
      filterStatus === 'wait' ? (t.status === 'wait' || t.status === 'use') : t.status === filterStatus
    )
  }

  const handleDragStart = (e: React.DragEvent, item: any) => {
    if (window.innerWidth < 640) return
    setDraggedItem(item)
    e.currentTarget.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
    setDragStartX(e.clientX)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (window.innerWidth < 640) return
    const draggingElement = e.currentTarget as HTMLElement

    draggingElement.classList.remove('dragging')
    draggingElement.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    draggingElement.style.transform = 'rotate(0deg) scale(1)'

    setTimeout(() => {
      draggingElement.style.transition = ''
      draggingElement.style.transform = ''
    }, 200)

    setDraggedItem(null)
    setDraggedOverColumn(null)
    setDragStartX(0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (window.innerWidth < 640) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedItem) {
      const draggingElement = document.querySelector('.dragging') as HTMLElement
      if (draggingElement) {
        const horizontalDiff = e.clientX - dragStartX
        const tiltAngle = Math.max(-15, Math.min(15, horizontalDiff * 0.1))

        draggingElement.style.transform = `rotate(${tiltAngle}deg) scale(1.05)`
      }
    }
  }

  const handleDragEnter = (e: React.DragEvent, columnStatus: string) => {
    if (window.innerWidth < 640) return
    e.preventDefault()
    setDraggedOverColumn(columnStatus)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (window.innerWidth < 640) return
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOverColumn(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    if (window.innerWidth < 640) return
    e.preventDefault()
    setDraggedOverColumn(null)

    if (draggedItem && draggedItem.status !== targetStatus) {
      let apiStatus = targetStatus
      if (targetStatus === 'wait') {
        apiStatus = 'use'
      }

      await updateStatus(draggedItem.id, apiStatus)
    }

    setDraggedItem(null)
    setDragStartX(0)
  }

  return (
    <>
      <style>{`
        @keyframes glow-amber {
          0%, 100% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.4), 0 0 60px rgba(251, 191, 36, 0.25); }
          50% { box-shadow: 0 0 50px rgba(251, 191, 36, 0.6), 0 0 80px rgba(251, 191, 36, 0.4); }
        }
        
        @keyframes glow-blue {
          0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.25); }
          50% { box-shadow: 0 0 50px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.4); }
        }
        
        @keyframes glow-emerald {
          0%, 100% { box-shadow: 0 0 30px rgba(52, 211, 153, 0.4), 0 0 60px rgba(52, 211, 153, 0.25); }
          50% { box-shadow: 0 0 50px rgba(52, 211, 153, 0.6), 0 0 80px rgba(52, 211, 153, 0.4); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .drag-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .drag-item:hover {
          transform: scale(1.03);
        }
        
        .drag-item.dragging {
          opacity: 0.6 !important;
          cursor: grabbing !important;
          z-index: 50;
          position: relative;
          transition: transform 0.1s ease-out !important;
        }
        
        .drop-zone {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .drop-zone-content {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .drop-zone.drag-over-wait .drop-zone-content {
          transform: scale(1.02);
          animation: glow-amber 1.5s ease-in-out infinite;
          border-color: rgba(251, 191, 36, 0.8) !important;
          background-color: rgba(251, 165, 0, 0.05) !important;
        }
        
        .drop-zone.drag-over-doing .drop-zone-content {
          transform: scale(1.02);
          animation: glow-blue 1.5s ease-in-out infinite;
          border-color: rgba(59, 130, 246, 0.8) !important;
          background-color: rgba(59, 130, 246, 0.05) !important;
        }
        
        .drop-zone.drag-over-success .drop-zone-content {
          transform: scale(1.02);
          animation: glow-emerald 1.5s ease-in-out infinite;
          border-color: rgba(52, 211, 153, 0.8) !important;
          background-color: rgba(52, 211, 153, 0.05) !important;
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @media (max-width: 639px) {
          .drag-item.dragging {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 w-full">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/90 drop-shadow-lg flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[16px] sm:rounded-[18px] bg-white/15 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]">
              <i className="fa fa-tasks text-lg sm:text-xl text-white/90"></i>
            </div>
            Psk Todo list
          </h1>
        </div>

        {/* Form Card */}
        <div ref={formRef} className="relative bg-white/[0.08] backdrop-blur-xl border border-white/15 sm:border-white/20 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden">
          {/* Header */}
          <div className="relative bg-white/[0.08] backdrop-blur-xl p-4 sm:p-6 border-b border-white/10">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] sm:rounded-[20px] bg-white/15 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]">
                  <i className={`fa text-xl sm:text-2xl text-white/90 ${id === 0 ? 'fa-plus' : 'fa-edit'}`}></i>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white/95">{id === 0 ? 'เพิ่มงานใหม่' : 'แก้ไขงาน'}</h2>
                  <p className="text-white/60 text-xs sm:text-sm">{id === 0 ? 'สร้างรายการงานใหม่' : 'อัปเดตรายการงาน'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="relative p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
            {/* Name Input */}
            <div className="group/input">
              <label className="text-white/90 font-semibold mb-2.5 text-xs sm:text-sm flex items-center gap-2 uppercase tracking-wide">
                <i className="fa fa-tasks text-white/70"></i>
                ชื่องาน
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-[14px] sm:rounded-[18px] text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 group-hover/input:bg-white/[0.12]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="กรอกชื่องานที่ต้องทำ..."
                  disabled={saving}
                />
                {name.trim() && (
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-green-400">
                    <i className="fa fa-check-circle text-sm sm:text-base"></i>
                  </div>
                )}
              </div>
              <p className="text-white/40 text-xs mt-1.5">ป้อนชื่องานที่ต้องทำ (จำเป็น)</p>
            </div>

            {/* Remark Input */}
            <div className="group/input">
              <label className="text-white/90 font-semibold mb-2.5 text-xs sm:text-sm flex items-center gap-2 uppercase tracking-wide">
                <i className="fa fa-comment text-white/70"></i>
                หมายเหตุ
              </label>
              <div className="relative">
                <textarea
                  className="w-full min-h-[92px] sm:min-h-[110px] px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-[14px] sm:rounded-[18px] text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 group-hover/input:bg-white/[0.12] resize-none"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="เพิ่มหมายเหตุ (ไม่จำเป็น)..."
                  disabled={saving}
                />
              </div>
              <p className="text-white/40 text-xs mt-1.5">รายละเอียดเพิ่มเติมเกี่ยวกับงาน</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="relative flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white/15 backdrop-blur-xl border border-white/30 rounded-[14px] sm:rounded-[18px] text-white font-semibold text-sm sm:text-base hover:bg-white/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] transition-all duration-300 group overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <i className="fa fa-spinner fa-spin text-sm"></i>
                      {id === 0 ? 'กำลังสร้าง...' : 'กำลังอัปเดต...'}
                    </>
                  ) : (
                    <>
                      <i className={`fa ${id === 0 ? 'fa-plus' : 'fa-save'}`}></i>
                      {id === 0 ? 'สร้างงาน' : 'บันทึกการแก้ไข'}
                    </>
                  )}
                </span>
              </button>

              {id !== 0 && (
                <button
                  onClick={handleClear}
                  disabled={saving}
                  className="relative px-4 sm:px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[14px] sm:rounded-[18px] text-white/80 font-semibold text-sm sm:text-base hover:bg-white/15 hover:border-white/30 hover:text-white hover:shadow-[0_8px_24px_rgba(255,255,255,0.1)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa fa-times"></i>
                    <span className="hidden sm:inline">ยกเลิก</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Columns Grid */}
        <div className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">

          {/* === Wait Column === */}
          <div
            className={`
              drop-zone flex flex-col gap-3 sm:gap-4 rounded-[24px] relative overflow-visible
              ${draggedOverColumn === 'wait' ? 'drag-over-wait' : ''}
            `}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'wait')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'wait')}
          >
            <div className="relative z-10 drop-zone-content bg-white/[0.08] backdrop-blur-xl border border-white/15 sm:border-white/20 rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"></div>
                  <h3 className="text-white/90 font-bold text-sm sm:text-base">รอทำ</h3>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm text-white/70 font-medium">
                  {countWait}
                </span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-1 sm:gap-3 min-h-[120px] px-1 sm:px-2 pb-2">
              {getTodosByStatus('wait').map((item: { id: number, name: string, remark: string, status: string }) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className="drag-item relative bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_12px_40px_rgba(251,191,36,0.4),0_0_30px_rgba(251,191,36,0.3)] hover:border-amber-400/50 hover:bg-white/[0.12] group cursor-grab active:cursor-grabbing sm:hover:scale-[1.03]"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                    <i className="fa fa-grip-vertical text-amber-400/60 text-xs sm:text-sm"></i>
                  </div>
                  <div className="absolute inset-0 rounded-[16px] sm:rounded-[20px] bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:via-amber-500/5 group-hover:to-amber-500/0 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

                  <div className="flex flex-col gap-2 sm:gap-3 relative z-10">
                    <div>
                      <h4 className="text-white/90 font-semibold mb-1 text-sm sm:text-base group-hover:text-amber-100/90 transition-colors duration-300 break-words">{item.name}</h4>
                      <p className="text-white/60 text-xs sm:text-sm group-hover:text-white/75 transition-colors duration-300 break-words whitespace-pre-wrap">{item.remark}</p>
                    </div>

                    {/* Desktop buttons */}
                    <div className="hidden sm:flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(item.id, 'doing')}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-[8px] sm:rounded-[10px] hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
                      >
                        → กำลังทำ
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-white/10 border border-white/20 text-white rounded-[8px] sm:rounded-[10px] hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300"
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-red-500/20 border border-red-400/30 text-red-300 rounded-[8px] sm:rounded-[10px] hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>

                    {/* Mobile buttons */}
                    <div className="flex sm:hidden gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(item.id, 'doing')}
                        className="flex-1 px-2 py-2 text-xs bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-[8px] hover:bg-blue-500/30 transition-all duration-300"
                      >
                        → กำลังทำ
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-2 text-xs bg-white/10 border border-white/20 text-white rounded-[8px] hover:bg-white/20 transition-all duration-300"
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="px-2 py-2 text-xs bg-red-500/20 border border-red-400/30 text-red-300 rounded-[8px] hover:bg-red-500/30 transition-all duration-300"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {getTodosByStatus('wait').length === 0 && (
                <div className="relative bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-[16px] sm:rounded-[20px] p-6 sm:p-8 text-center">
                  <i className="fa fa-inbox text-2xl sm:text-3xl text-white/30 mb-2"></i>
                  <p className="text-white/50 text-xs sm:text-sm">ไม่มีงาน</p>
                </div>
              )}
            </div>
          </div>

          {/* === Doing Column === */}
          <div
            className={`
              drop-zone flex flex-col gap-3 sm:gap-4 rounded-[24px] relative overflow-visible
              ${draggedOverColumn === 'doing' ? 'drag-over-doing' : ''}
            `}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'doing')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'doing')}
          >
            <div className="relative z-10 drop-zone-content bg-white/[0.08] backdrop-blur-xl border border-white/15 sm:border-white/20 rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.6)]"></div>
                  <h3 className="text-white/90 font-bold text-sm sm:text-base">กำลังทำ</h3>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm text-white/70 font-medium">
                  {countDoing}
                </span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-1 sm:gap-3 min-h-[120px] px-1 sm:px-2 pb-2">
              {getTodosByStatus('doing').map((item: { id: number, name: string, remark: string, status: string }) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className="drag-item relative bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.4),0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-400/50 hover:bg-white/[0.12] group cursor-grab active:cursor-grabbing sm:hover:scale-[1.03]"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                    <i className="fa fa-grip-vertical text-blue-400/60 text-xs sm:text-sm"></i>
                  </div>
                  <div className="absolute inset-0 rounded-[16px] sm:rounded-[20px] bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/5 group-hover:to-blue-500/0 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

                  <div className="flex flex-col gap-2 sm:gap-3 relative z-10">
                    <div>
                      <h4 className="text-white/90 font-semibold mb-1 text-sm sm:text-base group-hover:text-blue-100/90 transition-colors duration-300 break-words">{item.name}</h4>
                      <p className="text-white/60 text-xs sm:text-sm group-hover:text-white/75 transition-colors duration-300 break-words whitespace-pre-wrap">{item.remark}</p>
                    </div>

                    {/* Desktop buttons */}
                    <div className="hidden sm:flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(item.id, 'use')}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-[8px] sm:rounded-[10px] hover:bg-amber-500/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300"
                      >
                        ← รอทำ
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, 'success')}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-[8px] sm:rounded-[10px] hover:bg-emerald-500/30 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all duration-300"
                      >
                        → เสร็จ
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-white/10 border border-white/20 text-white rounded-[8px] sm:rounded-[10px] hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300"
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-red-500/20 border border-red-400/30 text-red-300 rounded-[8px] sm:rounded-[10px] hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>

                    {/* Mobile buttons */}
                    <div className="flex sm:hidden gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(item.id, 'use')}
                        className="flex-1 px-2 py-2 text-xs bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-[8px] hover:bg-amber-500/30 transition-all duration-300"
                      >
                        ← รอทำ
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, 'success')}
                        className="flex-1 px-2 py-2 text-xs bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-[8px] hover:bg-emerald-500/30 transition-all duration-300"
                      >
                        → เสร็จ
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-2 text-xs bg-white/10 border border-white/20 text-white rounded-[8px] hover:bg-white/20 transition-all duration-300"
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="px-2 py-2 text-xs bg-red-500/20 border border-red-400/30 text-red-300 rounded-[8px] hover:bg-red-500/30 transition-all duration-300"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {getTodosByStatus('doing').length === 0 && (
                <div className="relative bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-[16px] sm:rounded-[20px] p-6 sm:p-8 text-center">
                  <i className="fa fa-inbox text-2xl sm:text-3xl text-white/30 mb-2"></i>
                  <p className="text-white/50 text-xs sm:text-sm">ไม่มีงาน</p>
                </div>
              )}
            </div>
          </div>

          {/* === Success Column === */}
          <div
            className={`
              drop-zone flex flex-col gap-3 sm:gap-4 rounded-[24px] relative overflow-visible
              ${draggedOverColumn === 'success' ? 'drag-over-success' : ''}
            `}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'success')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'success')}
          >
            <div className="relative z-10 drop-zone-content bg-white/[0.08] backdrop-blur-xl border border-white/15 sm:border-white/20 rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"></div>
                  <h3 className="text-white/90 font-bold text-sm sm:text-base">เสร็จแล้ว</h3>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm text-white/70 font-medium">
                  {countSuccess}
                </span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-1 sm:gap-3 min-h-[120px] px-1 sm:px-2 pb-2">
              {getTodosByStatus('success').map((item: { id: number, name: string, remark: string, status: string }) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className="drag-item relative bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_12px_40px_rgba(52,211,153,0.4),0_0_30px_rgba(52,211,153,0.3)] hover:border-emerald-400/50 hover:bg-white/[0.12] group cursor-grab active:cursor-grabbing sm:hover:scale-[1.03]"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                    <i className="fa fa-grip-vertical text-emerald-400/60 text-xs sm:text-sm"></i>
                  </div>
                  <div className="absolute inset-0 rounded-[16px] sm:rounded-[20px] bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-emerald-500/5 group-hover:to-emerald-500/0 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

                  <div className="flex flex-col gap-2 sm:gap-3 relative z-10">
                    <div>
                      <h4 className="text-white/90 font-semibold mb-1 text-sm sm:text-base group-hover:text-emerald-100/90 transition-colors duration-300 break-words">{item.name}</h4>
                      <p className="text-white/60 text-xs sm:text-sm group-hover:text-white/75 transition-colors duration-300 break-words whitespace-pre-wrap">{item.remark}</p>
                    </div>

                    {/* Desktop buttons */}
                    <div className="hidden sm:flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(item.id, 'doing')}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-[8px] sm:rounded-[10px] hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
                      >
                        ← กำลังทำ
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-white/10 border border-white/20 text-white rounded-[8px] sm:rounded-[10px] hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300"
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-red-500/20 border border-red-400/30 text-red-300 rounded-[8px] sm:rounded-[10px] hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>

                    {/* Mobile buttons */}
                    <div className="flex sm:hidden gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus(item.id, 'doing')}
                        className="flex-1 px-2 py-2 text-xs bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-[8px] hover:bg-blue-500/30 transition-all duration-300"
                      >
                        ← กำลังทำ
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-2 py-2 text-xs bg-white/10 border border-white/20 text-white rounded-[8px] hover:bg-white/20 transition-all duration-300"
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="px-2 py-2 text-xs bg-red-500/20 border border-red-400/30 text-red-300 rounded-[8px] hover:bg-red-500/30 transition-all duration-300"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {getTodosByStatus('success').length === 0 && (
                <div className="relative bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-[16px] sm:rounded-[20px] p-6 sm:p-8 text-center">
                  <i className="fa fa-inbox text-2xl sm:text-3xl text-white/30 mb-2"></i>
                  <p className="text-white/50 text-xs sm:text-sm">ไม่มีงาน</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}