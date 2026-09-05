import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui'

/* =============================================================================
   The player.

   YouTube hosts the file and nothing else: `controls=0` turns its own chrome
   off, a shield over the frame swallows every pointer event so its title bar,
   share sheet and end screen can never surface, and everything visible here
   (transport, scrubber, time, volume, full screen) is ours, in the site's own
   surfaces. The IFrame API gives us the state and the clock the chrome reads.
   ========================================================================== */

type YTPlayer = {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  mute(): void
  unMute(): void
  setVolume(volume: number): void
  getVolume(): number
  getCurrentTime(): number
  getDuration(): number
  getVideoLoadedFraction(): number
  getPlayerState(): number
  destroy(): void
}

type YTApi = {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer
  PlayerState: { UNSTARTED: number; ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number }
}

type YTWindow = Window & {
  YT?: YTApi
  onYouTubeIframeAPIReady?: () => void
}

/** One script tag and one promise for the whole page, however many players
    mount and unmount over a session. */
let apiPromise: Promise<YTApi> | null = null

function loadApi(): Promise<YTApi> {
  const w = window as YTWindow
  if (!apiPromise) {
    apiPromise = new Promise<YTApi>((resolve) => {
      if (w.YT?.Player) {
        resolve(w.YT)
        return
      }
      const previous = w.onYouTubeIframeAPIReady
      w.onYouTubeIframeAPIReady = () => {
        previous?.()
        if (w.YT) resolve(w.YT)
      }
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      document.head.appendChild(tag)
    })
  }
  return apiPromise
}

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export type PlayerVideo = { id: string; title: string }
type Status = 'loading' | 'playing' | 'paused' | 'ended'

export function VideoPlayer({
  video,
  variant,
  poster,
  onClose,
  onExpand,
}: {
  video: PlayerVideo
  variant: 'inline' | 'theatre'
  poster?: string
  /** Stop and unmount. The inline player returns to its poster, the dialog closes. */
  onClose: () => void
  /** Inline only: hand the video to the dialog. The dialog gets real full screen instead. */
  onExpand?: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const dragging = useRef(false)

  const [status, setStatus] = useState<Status>('loading')
  const [buffering, setBuffering] = useState(false)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [full, setFull] = useState(false)

  /** Paint the scrubber and the clock straight into the DOM. Playback would
      otherwise re-render this tree sixty times a second for a moving bar. */
  const paint = useCallback((time: number, total: number, loaded: number) => {
    const track = trackRef.current
    if (track) {
      track.style.setProperty('--played', String(total > 0 ? Math.min(1, time / total) : 0))
      track.style.setProperty('--loaded', String(Math.min(1, Math.max(0, loaded))))
      track.setAttribute('aria-valuenow', String(Math.round(time)))
      track.setAttribute('aria-valuetext', `${clock(time)} of ${clock(total)}`)
    }
    if (timeRef.current) timeRef.current.textContent = clock(time)
  }, [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let dead = false
    let player: YTPlayer | null = null
    let nudge: number | undefined

    const mount = document.createElement('div')
    host.appendChild(mount)

    loadApi().then((YT) => {
      if (dead) return
      player = new YT.Player(mount, {
        videoId: video.id,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            if (dead) return
            playerRef.current = e.target
            setDuration(e.target.getDuration() || 0)
            setVolume(Math.round(e.target.getVolume?.() ?? 100))
            e.target.playVideo()
            // Safari and iOS refuse to start with sound even after a click.
            // Muted playback is always allowed, so fall back to it once and
            // let the volume control say so.
            nudge = window.setTimeout(() => {
              const p = playerRef.current
              if (!p || dead) return
              const state = p.getPlayerState()
              if (state === YT.PlayerState.UNSTARTED || state === YT.PlayerState.CUED) {
                p.mute()
                setMuted(true)
                p.playVideo()
              }
            }, 1800)
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            if (dead) return
            const S = YT.PlayerState
            setBuffering(e.data === S.BUFFERING)
            if (e.data === S.PLAYING) {
              setStatus('playing')
              setDuration(e.target.getDuration() || 0)
            } else if (e.data === S.PAUSED) {
              setStatus('paused')
            } else if (e.data === S.ENDED) {
              // Rewind and hold on the first frame, so YouTube never gets to
              // draw its end screen of other people's videos.
              e.target.seekTo(0, true)
              e.target.pauseVideo()
              setStatus('ended')
              paint(0, e.target.getDuration() || 0, 0)
            }
          },
        },
      })
    })

    return () => {
      dead = true
      window.clearTimeout(nudge)
      playerRef.current = null
      try {
        player?.destroy()
      } catch {
        /* the iframe is already gone */
      }
      mount.remove()
    }
  }, [video.id, paint])

  /** One animation frame loop, alive only while the video is. */
  useEffect(() => {
    if (status !== 'playing') return
    let raf = 0
    const tick = () => {
      const p = playerRef.current
      if (p && !dragging.current) paint(p.getCurrentTime(), p.getDuration(), p.getVideoLoadedFraction())
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [status, paint])

  const toggle = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (status === 'playing') p.pauseVideo()
    else p.playVideo()
  }, [status])

  const seekTo = useCallback(
    (fraction: number, commit: boolean) => {
      const p = playerRef.current
      if (!p) return
      const total = p.getDuration() || duration
      const time = Math.max(0, Math.min(total, fraction * total))
      p.seekTo(time, commit)
      paint(time, total, p.getVideoLoadedFraction())
    },
    [duration, paint],
  )

  const nudgeBy = useCallback(
    (delta: number) => {
      const p = playerRef.current
      if (!p) return
      const total = p.getDuration() || duration
      if (total <= 0) return
      seekTo((p.getCurrentTime() + delta) / total, true)
    },
    [duration, seekTo],
  )

  const toggleMute = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (muted) {
      p.unMute()
      if (volume === 0) {
        p.setVolume(60)
        setVolume(60)
      }
      setMuted(false)
    } else {
      p.mute()
      setMuted(true)
    }
  }, [muted, volume])

  const onVolume = useCallback((next: number) => {
    const p = playerRef.current
    setVolume(next)
    if (!p) return
    p.setVolume(next)
    if (next === 0) {
      p.mute()
      setMuted(true)
    } else {
      p.unMute()
      setMuted(false)
    }
  }, [])

  const toggleFull = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.().catch(() => {})
  }, [])

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  /** Player keys, and only while this player owns the page: the dialog is
      modal, the inline one listens on its own subtree. */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const target: HTMLElement | Document = variant === 'theatre' ? document : root
    const onKey = (e: Event) => {
      const ev = e as KeyboardEvent
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return
      const keys = [' ', 'k', 'j', 'l', 'm', 'f', 'ArrowLeft', 'ArrowRight']
      if (!keys.includes(ev.key)) return
      const from = ev.target as HTMLElement | null
      if (from?.tagName === 'INPUT' && ev.key !== 'm' && ev.key !== 'f') return
      ev.preventDefault()
      if (ev.key === ' ' || ev.key === 'k') toggle()
      else if (ev.key === 'ArrowLeft') nudgeBy(-5)
      else if (ev.key === 'ArrowRight') nudgeBy(5)
      else if (ev.key === 'j') nudgeBy(-10)
      else if (ev.key === 'l') nudgeBy(10)
      else if (ev.key === 'm') toggleMute()
      else if (ev.key === 'f' && variant === 'theatre') toggleFull()
    }
    target.addEventListener('keydown', onKey)
    return () => target.removeEventListener('keydown', onKey)
  }, [variant, toggle, nudgeBy, toggleMute, toggleFull])

  const fractionAt = (clientX: number) => {
    const el = trackRef.current
    if (!el) return 0
    const box = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - box.left) / box.width))
  }

  const playing = status === 'playing'

  return (
    <div ref={rootRef} className={`player is-${variant}${full ? ' is-full' : ''}`}>
      <div className="player_stage">
        <div ref={hostRef} className="player_frame" />
        {/* Nothing reaches YouTube. A click here is ours: play or pause. */}
        <button
          type="button"
          className="player_shield"
          onClick={toggle}
          onDoubleClick={variant === 'theatre' ? toggleFull : onExpand}
          aria-label={playing ? `Pause ${video.title}` : `Play ${video.title}`}
        />
        {poster && status === 'loading' && <img className="player_poster" src={poster} alt="" aria-hidden="true" />}
        {buffering && <span className="player_spinner" aria-hidden="true" />}
        {!playing && !buffering && status !== 'loading' && (
          <span className="player_resume" aria-hidden="true">
            <Icon name={status === 'ended' ? 'replay' : 'play'} className="h-6 w-6" />
          </span>
        )}
      </div>

      <div className="player_bar">
        <div
          ref={trackRef}
          className="player_track"
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={0}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            dragging.current = true
            seekTo(fractionAt(e.clientX), false)
          }}
          onPointerMove={(e) => {
            if (dragging.current) seekTo(fractionAt(e.clientX), false)
          }}
          onPointerUp={(e) => {
            if (!dragging.current) return
            dragging.current = false
            seekTo(fractionAt(e.clientX), true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') nudgeBy(-5)
            else if (e.key === 'ArrowRight') nudgeBy(5)
            else return
            e.preventDefault()
          }}
        >
          <span className="player_loaded" />
          <span className="player_played" />
          <span className="player_knob" />
        </div>

        <div className="player_row">
          <button type="button" className="player_key" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            <Icon name={playing ? 'pause' : 'play'} className="h-4 w-4" />
          </button>

          <p className="player_time">
            <span ref={timeRef}>0:00</span>
            <span className="player_time-total"> / {clock(duration)}</span>
          </p>

          <p className="player_title">{video.title}</p>

          <div className="player_volume">
            <button
              type="button"
              className="player_icon"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              aria-pressed={muted}
            >
              <Icon name={muted ? 'mute' : 'volume'} className="h-4 w-4" />
            </button>
            <input
              className="player_range"
              type="range"
              min={0}
              max={100}
              step={1}
              value={muted ? 0 : volume}
              onChange={(e) => onVolume(Number(e.target.value))}
              aria-label="Volume"
              style={{ ['--fill' as string]: `${muted ? 0 : volume}%` }}
            />
          </div>

          {variant === 'inline' && onExpand && (
            <button type="button" className="player_btn" onClick={onExpand}>
              <Icon name="expand" className="h-3.5 w-3.5" />
              Full screen
            </button>
          )}
          {variant === 'theatre' && (
            <button
              type="button"
              className="player_icon"
              onClick={toggleFull}
              aria-label={full ? 'Leave full screen' : 'Full screen'}
            >
              <Icon name={full ? 'collapse' : 'expand'} className="h-4 w-4" />
            </button>
          )}

          <button type="button" className="player_icon" onClick={onClose} aria-label="Stop the video">
            <Icon name="cross" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
