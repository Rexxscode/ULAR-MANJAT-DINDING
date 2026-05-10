import { useCallback, useRef, useEffect } from 'react'

const SOUNDS = {
  dice: { type: 'noise', duration: 0.1 },
  move: { type: 'blip', duration: 0.15 },
  ladder: { type: 'ascend', duration: 0.4 },
  snake: { type: 'descend', duration: 0.4 },
  win: { type: 'fanfare', duration: 1 },
  click: { type: 'blip', duration: 0.08 },
}

class SoundManager {
  constructor() {
    this.audioContext = null
    this.enabled = true
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.initialized = true
    } catch (e) {
      console.warn('Web Audio API not supported')
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled
  }

  play(soundName) {
    if (!this.enabled || !this.initialized) return

    const sound = SOUNDS[soundName]
    if (!sound) return

    try {
      const ctx = this.audioContext
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      switch (soundName) {
        case 'dice':
          oscillator.frequency.setValueAtTime(200, ctx.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1)
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
          break
        case 'move':
          oscillator.frequency.setValueAtTime(440, ctx.currentTime)
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
          break
        case 'ladder':
          oscillator.frequency.setValueAtTime(300, ctx.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4)
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
          break
        case 'snake':
          oscillator.frequency.setValueAtTime(400, ctx.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4)
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
          break
        case 'win':
          const frequencies = [523, 659, 784, 1047]
          frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
            gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15)
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3)
            osc.start(ctx.currentTime + i * 0.15)
            osc.stop(ctx.currentTime + i * 0.15 + 0.3)
          })
          break
        case 'click':
          oscillator.frequency.setValueAtTime(800, ctx.currentTime)
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
          break
        default:
          oscillator.frequency.setValueAtTime(440, ctx.currentTime)
      }

      if (soundName !== 'win') {
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + sound.duration)
      }
    } catch (e) {
      console.warn('Error playing sound:', e)
    }
  }
}

const soundManager = new SoundManager()

export function useSound() {
  const initialized = useRef(false)

  useEffect(() => {
    const handleInteraction = () => {
      if (!initialized.current) {
        soundManager.init()
        initialized.current = true
      }
    }

    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('keydown', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [])

  const play = useCallback((soundName) => {
    if (!initialized.current) {
      soundManager.init()
      initialized.current = true
    }
    soundManager.play(soundName)
  }, [])

  const setEnabled = useCallback((enabled) => {
    soundManager.setEnabled(enabled)
  }, [])

  return { play, setEnabled }
}