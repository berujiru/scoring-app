import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

/**
 * FunRunTimer
 * - Public component (no auth required)
 * - Shows a big circular Start button
 * - On press: 3 → 2 → 1 countdown, then the timer starts
 * - Simple fun-run style UI
 */
export default function FunRunTimer() {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const originStartRef = useRef<number | null>(null) // when running, elapsed = now - originStart
  const rafRef = useRef<number | null>(null)
  const lastMilestoneRef = useRef<number>(0) // number of 10-min milestones celebrated
  const runningRef = useRef<boolean>(false)

  // Start countdown from 3
  const handleStart = () => {
    if (running || countdown !== null) return
    setCountdown(3)
  }

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      // Briefly show "GO!" then start
      const goDelay = setTimeout(() => {
        setCountdown(null)
        setRunning(true)
        runningRef.current = true
        originStartRef.current = performance.now() - 0 // start fresh
        lastMilestoneRef.current = 0
        rafRef.current = requestAnimationFrame(tick)
      }, 600)
      return () => clearTimeout(goDelay)
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Timer tick
  const tick = (now: number) => {
    if (!runningRef.current) return
    if (originStartRef.current == null) originStartRef.current = now - elapsedMs
    const nextElapsed = Math.max(0, now - originStartRef.current)
    setElapsedMs(nextElapsed)

    // Celebrate every 1 minute
    const milestone = Math.floor(nextElapsed / 60000) // 60_000 ms
    if (milestone > lastMilestoneRef.current) {
      lastMilestoneRef.current = milestone
      try {
        confetti({ particleCount: 120, spread: 70, origin: { x: 0.2, y: 0.6 } })
        confetti({ particleCount: 120, spread: 70, origin: { x: 0.8, y: 0.6 } })
      } catch {}
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  // Pause timer
  const handlePause = () => {
    if (!running) return
    if (!window.confirm('Pause the timer?')) return
    setRunning(false)
    runningRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    originStartRef.current = null
  }

  // Resume timer
  const handleResume = () => {
    if (running || countdown !== null) return
    setRunning(true)
    runningRef.current = true
    // keep existing elapsed, shift origin so that elapsed = now - origin
    originStartRef.current = performance.now() - elapsedMs
    rafRef.current = requestAnimationFrame(tick)
  }

  // Reset timer
  const handleReset = () => {
    if (!window.confirm('Stop and reset the timer?')) return
    setRunning(false)
    runningRef.current = false
    setCountdown(null)
    setElapsedMs(0)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    originStartRef.current = null
    lastMilestoneRef.current = 0
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Keep runningRef in sync with state
  useEffect(() => {
    runningRef.current = running
  }, [running])

  const formatHMS = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad2 = (n: number) => n.toString().padStart(2, '0')
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
  }

  const formatCS = (ms: number) => {
    const centis = Math.floor((ms % 1000) / 10)
    return centis.toString().padStart(2, '0')
  }

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        {/* Display */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-500 p-6 shadow-xl border border-white/10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-white text-8xl font-black drop-shadow-md animate-pulse">
                  {countdown === 0 ? 'GO!' : countdown}
                </span>
              </div>
            )}

            {/* Time */}
            <div className="mb-6">
              <p className="text-white/80 text-sm tracking-widest">ELAPSED TIME</p>
              <p className="text-white text-5xl sm:text-6xl font-extrabold tabular-nums mt-2">
                {formatHMS(elapsedMs)}
                <span className="align-baseline ml-2 text-3xl sm:text-4xl font-bold opacity-90">:{formatCS(elapsedMs)}</span>
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!running && countdown === null ? (
                <button
                  onClick={handleStart}
                  className="h-28 w-28 rounded-full bg-white text-indigo-700 shadow-lg border-4 border-white/60 flex items-center justify-center text-xl font-extrabold hover:scale-105 active:scale-95 transition-transform select-none focus:outline-none focus:ring-4 focus:ring-white/40"
                  aria-label="Start"
                  title="Start"
                >
                  START
                </button>
              ) : (
                <>
                  {running ? (
                    <button
                      onClick={handlePause}
                      className="px-5 py-3 rounded-full bg-white text-rose-600 font-bold shadow hover:scale-105 active:scale-95 transition-transform"
                      aria-label="Pause"
                      title="Pause"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={handleResume}
                      className="px-5 py-3 rounded-full bg-white text-emerald-600 font-bold shadow hover:scale-105 active:scale-95 transition-transform"
                      aria-label="Resume"
                      title="Resume"
                    >
                      Resume
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="px-5 py-3 rounded-full bg-white/90 text-gray-800 font-semibold shadow hover:scale-105 active:scale-95 transition-transform"
                    aria-label="Reset"
                    title="Reset"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fun Run Flair */}
        <div className="mt-4 text-center text-xs text-gray-600">
          Ready, Set, Go! 🎉
        </div>
      </div>
    </div>
  )
}
