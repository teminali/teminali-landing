import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui'

/* =============================================================================
   The player.

   YouTube hosts the file and nothing else: `controls=0` turns its own chrome
   off, a shield over the frame swallows every pointer event so its title bar,
   share sheet and end screen can never surface, and everything visible here
   (transport, scrubber, timecode, captions, volume, full screen) is ours.
   The IFrame API gives us the state and the clock the chrome reads.

   The chrome is the studio's own player, ported from
   studio/src/video/components/preview/PlaybackControls.tsx: timecode leading
   at full weight with the duration following at half, a centred transport
   cluster, and one bright 40px accent disc for play. That disc's colour is
   CONSTANT: the icon alone carries play against pause. Tinting it by state
   was tried in the studio and removed, because it was a second signal for
   something the icon already said.

   Captions are ours too, not YouTube's. The caption module is undocumented
   and cannot be styled, and this player exists precisely so that nothing of
   YouTube's is drawn over the video. The cues come from the project's own
   subtitle files, converted to `src/assets/subs/<lang>.json`, and only the
   language actually chosen is ever fetched.
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
  unloadModule?(name: string): void
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
    apiPromise = new Promise<YTApi>((resolve, reject) => {
      if (w.YT?.Player) {
        resolve(w.YT)
        return
      }
      const previous = w.onYouTubeIframeAPIReady
      // An ad blocker, a content blocker or a dead network all end the same
      // way: the callback never fires. Without this the player sits on its
      // poster for ever with nothing to say and no way out.
      const timer = window.setTimeout(() => reject(new Error('timeout')), 8000)
      w.onYouTubeIframeAPIReady = () => {
        previous?.()
        if (w.YT) {
          window.clearTimeout(timer)
          resolve(w.YT)
        }
      }
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      tag.onerror = () => {
        window.clearTimeout(timer)
        reject(new Error('blocked'))
      }
      document.head.appendChild(tag)
    })
    // Never cache a rejection, or the first failure makes every later mount
    // fail too, including one the visitor triggers after turning a blocker off.
    apiPromise.catch(() => {
      apiPromise = null
    })
  }
  return apiPromise
}

/**
 * Fetch and parse the IFrame API ahead of the click.
 *
 * The script is the slowest part of a cold start by a wide margin, and it is
 * the same script whatever video is played, so there is nothing to guess at.
 * Safe to call repeatedly: the promise is shared.
 */
export function warmPlayer(): void {
  void loadApi().catch(() => {
    /* Warming is best effort; the real mount reports the failure. */
  })
}

/* ------------------------------------------------------------------ captions
   Lazy on purpose. Six languages is about 76 KB of cue text, and a visitor
   who never opens the menu should pay for none of it. */

type Cue = [start: number, end: number, text: string]

const subModules = import.meta.glob<Cue[]>('../assets/subs/*.json', { import: 'default' })

const SUB_NAMES: Record<string, string> = {
  en: 'English',
  sw: 'Kiswahili',
  hi: 'हिन्दी',
  ja: '日本語',
  ru: 'Русский',
  zh: '中文',
}

/** English first because the audio is English; the rest alphabetical by code. */
const SUB_ORDER = ['en', 'sw', 'hi', 'ja', 'ru', 'zh']

const subLoaders = new Map<string, () => Promise<Cue[]>>()
for (const [path, load] of Object.entries(subModules)) {
  subLoaders.set(path.slice(path.lastIndexOf('/') + 1).replace(/\.json$/, ''), load)
}
const SUB_CODES = SUB_ORDER.filter((c) => subLoaders.has(c))

const SUB_PREF = 'teminali.captions'

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

/**
 * Turn YouTube's own captions off and keep them off.
 *
 * `cc_load_policy: 0` covers the initial load, but the captions module is
 * loaded lazily and a viewer whose YouTube account defaults subtitles on can
 * still end up with two sets drawn at once, theirs underneath ours. Unloading
 * the module is the only thing that reliably stops it, and it is safe to call
 * when no module is loaded.
 */
function silenceYouTubeCaptions(p: YTPlayer): void {
  for (const name of ['captions', 'cc']) {
    try {
      p.unloadModule?.(name)
    } catch {
      /* the module was never loaded, which is the outcome we wanted anyway */
    }
  }
}

export type PlayerVideo = { id: string; title: string; start?: number }
type Status = 'loading' | 'playing' | 'paused' | 'ended' | 'error'

export function VideoPlayer({
  video,
  variant,
  poster,
  autoPlay = true,
  onClose,
  onExpand,
}: {
  video: PlayerVideo
  variant: 'inline' | 'theatre'
  poster?: string
  /**
   * False mounts the player without starting it, so the iframe exists and the
   * video is cued before the visitor asks for it. Flipping it to true plays
   * immediately, with no script fetch and no player construction in the way.
   */
  autoPlay?: boolean
  /** Stop and unmount. The inline player returns to its poster, the dialog closes. */
  onClose: () => void
  /** Inline only: hand the video to the dialog. The dialog gets real full screen instead. */
  onExpand?: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLSpanElement>(null)
  const cueRef = useRef<HTMLParagraphElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const dragging = useRef(false)

  const [status, setStatus] = useState<Status>(autoPlay ? 'loading' : 'paused')
  const [buffering, setBuffering] = useState(false)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [full, setFull] = useState(false)

  const [subLang, setSubLang] = useState<string | null>(null)
  const [subMenu, setSubMenu] = useState(false)
  const cues = useRef<Cue[] | null>(null)
  const cueAt = useRef(0)

  // `autoPlay` must not be a dependency of the effect that builds the player,
  // or flipping it would tear the iframe down and rebuild it, which is the
  // entire cost this prop exists to avoid.
  const wantsPlay = useRef(autoPlay)
  wantsPlay.current = autoPlay

  // YouTube paints its own title, channel, logo and a centre button over the
  // video for about four seconds after every play and every seek, whatever
  // `controls` says. We know exactly when that is, so the same moments arm a
  // guard: two bands over the strips it titles and a disc over the button.
  const [guard, setGuard] = useState(0)
  // The centre disc belongs to a starting video, not to a scrub. Every arrow
  // key used to raise a spinner over the picture for five seconds, so holding
  // one to seek blanketed the thing you were trying to look at.
  const [guardDisc, setGuardDisc] = useState(false)
  const guardTimer = useRef<number | undefined>(undefined)

  const arm = useCallback((withDisc: boolean) => {
    window.clearTimeout(guardTimer.current)
    setGuard((n) => n + 1)
    setGuardDisc(withDisc)
    guardTimer.current = window.setTimeout(() => setGuard(0), 5000)
  }, [])

  useEffect(() => () => window.clearTimeout(guardTimer.current), [])

  /** The cue covering `t`, found from the last hit rather than from the top. */
  const cueAtTime = useCallback((t: number): string => {
    const list = cues.current
    if (!list || list.length === 0) return ''
    let i = cueAt.current
    if (i >= list.length || list[i][0] > t) i = 0
    while (i < list.length && list[i][1] < t) i += 1
    cueAt.current = i
    const c = list[i]
    return c && c[0] <= t && t <= c[1] ? c[2] : ''
  }, [])

  /** Paint the scrubber, the clock and the caption straight into the DOM.
      Playback would otherwise re-render this tree sixty times a second. */
  const paint = useCallback(
    (time: number, total: number, loaded: number) => {
      const track = trackRef.current
      if (track) {
        track.style.setProperty('--played', String(total > 0 ? Math.min(1, time / total) : 0))
        track.style.setProperty('--loaded', String(Math.min(1, Math.max(0, loaded))))
        track.setAttribute('aria-valuenow', String(Math.round(time)))
        track.setAttribute('aria-valuetext', `${clock(time)} of ${clock(total)}`)
      }
      if (timeRef.current) timeRef.current.textContent = clock(time)
      const cue = cueRef.current
      if (cue) {
        const text = cues.current ? cueAtTime(time) : ''
        if (cue.textContent !== text) cue.textContent = text
      }
    },
    [cueAtTime],
  )

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let dead = false
    let player: YTPlayer | null = null
    let nudge: number | undefined

    const mount = document.createElement('div')
    host.appendChild(mount)

    loadApi()
      .then((YT) => {
        if (dead) return
        player = new YT.Player(mount, {
          videoId: video.id,
          host: 'https://www.youtube-nocookie.com',
          // Where the demo actually begins; the cold open is not the product.
          startSeconds: video.start ?? 0,
          playerVars: {
            autoplay: wantsPlay.current ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            // 0 leaves YouTube's own captions off. A viewer whose YouTube
            // account defaults them on would otherwise get two sets of
            // subtitles at once, theirs under ours.
            cc_load_policy: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            start: video.start ?? 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (e: { target: YTPlayer }) => {
              if (dead) return
              playerRef.current = e.target
              silenceYouTubeCaptions(e.target)
              setDuration(e.target.getDuration() || 0)
              setVolume(Math.round(e.target.getVolume?.() ?? 100))
              if (!wantsPlay.current) {
                // Primed, not playing. The iframe and the first bytes are
                // here; the click has nothing left to wait for.
                return
              }
              e.target.playVideo()
              // The API hands focus to the iframe, and a focused YouTube player
              // draws its title and centre button over the video. Take it back.
              const active = document.activeElement
              if (active instanceof HTMLIFrameElement) active.blur()
              rootRef.current?.focus({ preventScroll: true })
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
            onError: () => {
              if (!dead) setStatus('error')
            },
            onStateChange: (e: { data: number; target: YTPlayer }) => {
              if (dead) return
              const S = YT.PlayerState
              setBuffering(e.data === S.BUFFERING)
              if (e.data === S.PLAYING) {
                // The captions module can load late, after playback starts, so
                // once is not enough.
                silenceYouTubeCaptions(e.target)
                setStatus('playing')
                setDuration(e.target.getDuration() || 0)
                arm(true)
              } else if (e.data === S.PAUSED) {
                setStatus('paused')
              } else if (e.data === S.ENDED) {
                // Rewind and hold on the first frame, so YouTube never gets to
                // draw its end screen of other people's videos. Back to the
                // start offset, not to zero: replay should skip what the first
                // play skipped.
                const from = video.start ?? 0
                e.target.seekTo(from, true)
                e.target.pauseVideo()
                setStatus('ended')
                paint(from, e.target.getDuration() || 0, 0)
              }
            },
          },
        })
      })
      .catch(() => {
        if (!dead) setStatus('error')
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
  }, [video.id, video.start, paint, arm])

  /** A primed player told to start. Nothing to build, so this is immediate. */
  useEffect(() => {
    if (!autoPlay) return
    const p = playerRef.current
    if (!p) return
    if (status === 'playing') return
    p.playVideo()
    rootRef.current?.focus({ preventScroll: true })
  }, [autoPlay, status])

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

  /* --------------------------------------------------------------- captions */

  /** Restore the visitor's last choice, but never fetch until it is wanted. */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SUB_PREF)
      if (saved && SUB_CODES.includes(saved)) setSubLang(saved)
    } catch {
      /* storage can be unavailable; captions simply start off */
    }
  }, [])

  useEffect(() => {
    let dead = false
    if (subLang === null) {
      cues.current = null
      cueAt.current = 0
      if (cueRef.current) cueRef.current.textContent = ''
      return
    }
    const load = subLoaders.get(subLang)
    if (!load) return
    void load()
      .then((list) => {
        if (dead) return
        cues.current = list
        cueAt.current = 0
      })
      .catch(() => {
        if (!dead) cues.current = null
      })
    return () => {
      dead = true
    }
  }, [subLang])

  const chooseSub = useCallback((code: string | null) => {
    setSubLang(code)
    setSubMenu(false)
    try {
      if (code === null) localStorage.removeItem(SUB_PREF)
      else localStorage.setItem(SUB_PREF, code)
    } catch {
      /* a preference that cannot be stored is still honoured for this visit */
    }
  }, [])

  /** The menu closes on a click elsewhere and on Escape, like any other popup. */
  useEffect(() => {
    if (!subMenu) return
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el?.closest('.player_subs')) setSubMenu(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setSubMenu(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [subMenu])

  /* -------------------------------------------------------------- transport */

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
      arm(false)
    },
    [duration, paint, arm],
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

  const jumpTo = useCallback(
    (seconds: number) => {
      const p = playerRef.current
      if (!p) return
      const total = p.getDuration() || duration
      if (total <= 0) return
      seekTo(seconds / total, true)
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
      const keys = [' ', 'k', 'j', 'l', 'm', 'f', 'c', 'ArrowLeft', 'ArrowRight']
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
      else if (ev.key === 'c') chooseSub(subLang === null ? SUB_CODES[0] ?? null : null)
      else if (ev.key === 'f' && variant === 'theatre') toggleFull()
    }
    target.addEventListener('keydown', onKey)
    return () => target.removeEventListener('keydown', onKey)
  }, [variant, toggle, nudgeBy, toggleMute, toggleFull, chooseSub, subLang])

  const fractionAt = (clientX: number) => {
    const el = trackRef.current
    if (!el) return 0
    const box = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - box.left) / box.width))
  }

  const playing = status === 'playing'
  const startAt = video.start ?? 0

  return (
    <div ref={rootRef} tabIndex={-1} className={`player is-${variant}${full ? ' is-full' : ''}`}>
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
        {/* The frame is covered until the video is running, then the two
            bands hold over the strip YouTube titles until it fades. */}
        {(status === 'loading' || status === 'error' || (playing && guard > 0)) && (
          <span
            className={`player_veil${playing ? ' is-fading' : ''}`}
            style={poster ? { backgroundImage: `url(${poster})` } : undefined}
            aria-hidden="true"
          />
        )}
        {guard > 0 && (
          <span key={guard} className="player_guard" aria-hidden="true">
            <span className="player_band is-top" />
            <span className="player_band is-bottom" />
            {guardDisc && <span className="player_wait" />}
          </span>
        )}
        {buffering && guard === 0 && (
          <span className="player_guard is-still" aria-hidden="true">
            <span className="player_wait" />
          </span>
        )}
        {!playing && !buffering && status !== 'loading' && status !== 'error' && (
          <span className="player_resume" aria-hidden="true">
            <Icon name={status === 'ended' ? 'replay' : 'play'} className="h-6 w-6" />
          </span>
        )}
        {/* Captions sit above the bands so a cue is never half covered. */}
        <p ref={cueRef} className="player_cue" aria-live="off" />
        {status === 'error' && (
          <div className="player_error" role="alert">
            <p className="player_error-head">This player could not load</p>
            <p className="player_error-body">
              A content blocker or the network stopped YouTube from answering. The demo is still
              there, on YouTube itself.
            </p>
            <a
              className="player_btn"
              href={`https://www.youtube.com/watch?v=${video.id}${startAt ? `&t=${startAt}s` : ''}`}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="play" className="h-3.5 w-3.5" />
              Watch on YouTube
            </a>
          </div>
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
            const at = fractionAt(e.clientX)
            e.currentTarget.style.setProperty('--hint', String(at))
            if (hintRef.current) {
              const total = playerRef.current?.getDuration() || duration
              hintRef.current.textContent = clock(at * total)
            }
            if (dragging.current) seekTo(at, false)
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
          <span ref={hintRef} className="player_hint" aria-hidden="true">
            0:00
          </span>
        </div>

        <div className="player_row">
          {/* Position leads at full weight, duration follows at half. */}
          <p className="player_time">
            <span ref={timeRef}>{clock(startAt)}</span>
            <span className="player_time-total"> / {clock(duration)}</span>
          </p>

          <div className="player_transport">
            <button
              type="button"
              className="player_icon"
              onClick={() => jumpTo(startAt)}
              aria-label="Back to the start"
              title="Back to the start"
            >
              <Icon name="skip-back" className="h-[15px] w-[15px]" />
            </button>
            <button
              type="button"
              className="player_icon"
              onClick={() => nudgeBy(-10)}
              aria-label="Back ten seconds"
              title="Back ten seconds (J)"
            >
              <Icon name="chevron-left" className="h-[17px] w-[17px]" />
            </button>
            {/* The one bright control, and the only place the brand green is
                an action rather than a state. Constant colour by design. */}
            <button
              type="button"
              className="player_play"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              title="Play / pause (Space)"
            >
              <Icon
                name={playing ? 'pause' : 'play'}
                className={playing ? 'h-[15px] w-[15px]' : 'h-[15px] w-[15px] ml-[2px]'}
              />
            </button>
            <button
              type="button"
              className="player_icon"
              onClick={() => nudgeBy(10)}
              aria-label="Forward ten seconds"
              title="Forward ten seconds (L)"
            >
              <Icon name="chevron-right" className="h-[17px] w-[17px]" />
            </button>
            <button
              type="button"
              className="player_icon"
              onClick={() => jumpTo(Math.max(startAt, duration - 1))}
              aria-label="Jump to the end"
              title="Jump to the end"
            >
              <Icon name="skip-fwd" className="h-[15px] w-[15px]" />
            </button>
          </div>

          <div className="player_actions">
            {SUB_CODES.length > 0 && (
              <div className="player_subs">
                <button
                  type="button"
                  className={`player_icon${subLang ? ' is-on' : ''}`}
                  onClick={() => setSubMenu((v) => !v)}
                  aria-label="Subtitles"
                  title="Subtitles (C)"
                  aria-haspopup="menu"
                  aria-expanded={subMenu}
                >
                  <Icon name="cc" className="h-4 w-4" />
                </button>
                {subMenu && (
                  <div className="player_menu" role="menu">
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={subLang === null}
                      className={`player_menu-item${subLang === null ? ' is-on' : ''}`}
                      onClick={() => chooseSub(null)}
                    >
                      Off
                    </button>
                    {SUB_CODES.map((code) => (
                      <button
                        key={code}
                        type="button"
                        role="menuitemradio"
                        aria-checked={subLang === code}
                        className={`player_menu-item${subLang === code ? ' is-on' : ''}`}
                        onClick={() => chooseSub(code)}
                      >
                        {SUB_NAMES[code] ?? code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
              <button type="button" className="player_icon" onClick={onExpand} aria-label="Full screen" title="Full screen">
                <Icon name="expand" className="h-4 w-4" />
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
    </div>
  )
}
