'use client'
import { useState } from 'react'

export default function ScriptToPidgin() {
  const [english, setEnglish] = useState('')
  const [pidgin, setPidgin] = useState('')
  const [loading, setLoading] = useState(false)

  const convertToPidgin = async () => {
    if (!english.trim()) {
      alert('Please paste your English script first')
      return
    }

    setLoading(true)
    setPidgin('')

    try {
      // This is where we call the AI
      const response = await fetch('/api/convert-to-pidgin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: english }),
      })

      const data = await response.json()

      if (data.pidgin) {
        setPidgin(data.pidgin)
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch (error) {
      alert('Error converting text')
    }

    setLoading(false)
  }

  const copyPidgin = () => {
    navigator.clipboard.writeText(pidgin)
    alert('Pidgin text copied!')
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">📝 Script → Pidgin Converter</h1>
      <p className="text-zinc-400 mb-8">Paste your English advert script below</p>

      {/* English Input */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">English Script</label>
        <textarea
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          placeholder="Paste your English advert script here..."
          className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white resize-none"
        />
      </div>

      {/* Convert Button */}
      <button
        onClick={convertToPidgin}
        disabled={loading}
        className="bg-yellow-400 text-black px-8 py-3 rounded-full font-bold text-lg disabled:opacity-50"
      >
        {loading ? 'Converting...' : 'Convert to Pidgin'}
      </button>

      {/* Pidgin Output */}
      {pidgin && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Pidgin Version</label>
            <button
              onClick={copyPidgin}
              className="bg-zinc-800 px-4 py-2 rounded-lg text-sm"
            >
              Copy Pidgin
            </button>
          </div>
          <textarea
            value={pidgin}
            readOnly
            className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white resize-none"
          />
        </div>
      )}
    </main>
  )
}