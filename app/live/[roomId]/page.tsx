'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LiveRoom({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId
  const localAudio = useRef<HTMLAudioElement>(null)
  const remoteAudio = useRef<HTMLAudioElement>(null)
  const pc = useRef<RTCPeerConnection | null>(null)
  const channelRef = useRef<any>(null)

  const [status, setStatus] = useState('Connecting...')
  const [isMuted, setIsMuted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let localStream: MediaStream

    const start = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (localAudio.current) localAudio.current.srcObject = localStream

        pc.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        })

        localStream.getTracks().forEach(track => {
          pc.current?.addTrack(track, localStream)
        })

        pc.current.ontrack = (event) => {
          if (remoteAudio.current) {
            remoteAudio.current.srcObject = event.streams[0]
            setStatus('🔴 LIVE — Una dey connected!')
          }
        }

        pc.current.onconnectionstatechange = () => {
          if (pc.current?.connectionState === 'connected') {
            setStatus('🔴 LIVE — Una dey talk!')
          }
          if (pc.current?.connectionState === 'disconnected') {
            setStatus('Person comot — waiting...')
          }
        }

        const channel = supabase.channel(`live:${roomId}`, {
          config: { broadcast: { self: false } }
        })
        channelRef.current = channel

        channel.on('broadcast', { event: 'signal' }, async ({ payload }) => {
          if (!pc.current) return
          if (payload.type === 'offer') {
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload))
            const answer = await pc.current.createAnswer()
            await pc.current.setLocalDescription(answer)
            channel.send({ type: 'broadcast', event: 'signal', payload: pc.current.localDescription })
          } else if (payload.type === 'answer') {
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload))
          } else if (payload.candidate) {
            try { await pc.current.addIceCandidate(new RTCIceCandidate(payload)) } catch {}
          }
        })

        await channel.subscribe(async (s) => {
          if (s === 'SUBSCRIBED') {
            setTimeout(async () => {
              if (pc.current?.signalingState === 'stable') {
                const offer = await pc.current.createOffer()
                await pc.current.setLocalDescription(offer)
                channel.send({ type: 'broadcast', event: 'signal', payload: offer })
                setStatus('Waiting for other person... Share link!')
              }
            }, 1000)
          }
        })

        pc.current.onicecandidate = (e) => {
          if (e.candidate) channel.send({ type: 'broadcast', event: 'signal', payload: e.candidate })
        }

      } catch (err) {
        setStatus('Mic error — Abeg allow microphone')
        console.error(err)
      }
    }

    start()
    return () => {
      localStream?.getTracks().forEach(t => t.stop())
      pc.current?.close()
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [roomId])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleMute = () => {
    if (localAudio.current?.srcObject) {
      const stream = localAudio.current.srcObject as MediaStream
      const newMuted =!isMuted
      stream.getAudioTracks().forEach(t => t.enabled =!newMuted)
      setIsMuted(newMuted)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-2">🔥 Pidgin Live Call</h1>
      <p className="text-yellow-400 mb-6">Room: {roomId}</p>
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md text-center border border-zinc-800">
        <p className="mb-4 text-lg">{status}</p>
        <audio ref={localAudio} autoPlay muted playsInline />
        <audio ref={remoteAudio} autoPlay playsInline />
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={toggleMute} className="bg-zinc-800 px-5 py-3 rounded-full font-bold">
            {isMuted? '🔇 Unmute' : '🎙️ Mute'}
          </button>
          <button onClick={copyLink} className="bg-white text-black px-5 py-3 rounded-full font-bold">
            {copied? '✅ Copied!' : '📋 Copy Link'}
          </button>
        </div>
        <p className="text-zinc-500 text-sm mt-6">Share link make your guy join. Una go hear each other live.</p>
        <a href="/" className="block mt-6 text-zinc-400 underline text-sm">← Back to Voice Collector</a>
      </div>
    </div>
  )
}