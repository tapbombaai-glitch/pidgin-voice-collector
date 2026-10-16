'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [recording, setRecording] = useState(false)
  const [voices, setVoices] = useState<any[]>([])
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const startRec = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    chunks.current = []
    mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data)
    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      const fileName = `pidgin-${Date.now()}.webm`

      const { error } = await supabase.storage.from('voices').upload(fileName, blob)
      if (error) { alert(error.message); return }

      const { data: { publicUrl } } = supabase.storage.from('voices').getPublicUrl(fileName)
      await supabase.from('voices').insert([{ file_url: publicUrl, file_name: fileName }])

      alert('✅ Saved!')
      loadVoices()
    }
    mediaRecorder.current.start()
    setRecording(true)
  }

  const stopRec = () => {
    mediaRecorder.current?.stop()
    setRecording(false)
  }

  const loadVoices = async () => {
    const { data } = await supabase.from('voices').select('*').order('created_at', { ascending: false })
    if (data) setVoices(data)
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold">🔥 PIDGIN VOICE COLLECTOR 🔥</h1>
      <h2 className="text-yellow-400 mt-2 mb-6">PART 1: Voice To File</h2>

      {!recording?
        <button onClick={startRec} className="bg-red-600 px-8 py-4 rounded-full font-bold text-lg">🎙️ Start Recording</button> :
        <button onClick={stopRec} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg">⏹️ Stop & Save</button>
      }
      <button onClick={loadVoices} className="ml-3 bg-zinc-800 px-5 py-4 rounded-full">Load</button>

      <div className="mt-8">
        {voices.map((v: any) => (
          <div key={v.id} className="mb-3 bg-zinc-900 p-3 rounded-xl">
            <audio controls src={v.file_url} />
            <p className="text-sm text-zinc-400 mt-1">{v.file_name}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t border-zinc-800 pt-6">
        <h2 className="text-xl font-bold">PART 2: Live Call</h2>
        <a href="/live/myparty" className="inline-block mt-3 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold">📞 Go to Live Call</a>
      </div>
    </main>
  )
}