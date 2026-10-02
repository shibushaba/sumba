import { useCallback, useEffect, useRef, useState } from 'react'

interface VoiceRecorderState {
  supported: boolean
  recording: boolean
  seconds: number
  blob: Blob | null
  mimeType: string
  error: string | null
  start: () => Promise<void>
  stop: () => void
  reset: () => void
}

export function useVoiceRecorder(): VoiceRecorderState {
  const [supported] = useState(
    () => typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined',
  )
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [mimeType, setMimeType] = useState('audio/webm')
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const reset = useCallback(() => {
    setBlob(null)
    setSeconds(0)
    setError(null)
    chunksRef.current = []
  }, [])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(async () => {
    if (!supported) {
      setError("Voice recording isn't supported on this browser.")
      return
    }
    setError(null)
    reset()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType: mime })
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm'
        setMimeType(type)
        setBlob(new Blob(chunksRef.current, { type }))
        cleanupStream()
      }
      recorder.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    } catch {
      setError('Microphone permission was denied or unavailable.')
      cleanupStream()
    }
  }, [cleanupStream, reset, supported])

  useEffect(() => {
    return () => {
      stop()
      cleanupStream()
    }
  }, [cleanupStream, stop])

  return {
    supported,
    recording,
    seconds,
    blob,
    mimeType,
    error,
    start,
    stop,
    reset,
  }
}
