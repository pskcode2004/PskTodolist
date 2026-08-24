'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <div className="flex gap-4 p-3 🟦 bg-blue-600 ⬜ text-white">
      <div><Link href='/'>Home</Link></div>
      <div><Link href='/about'>About</Link></div>
      <div><Link href='/backoffice/dashboard'>Dashboard</Link></div>
    </div>
  )
}