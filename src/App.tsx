import { useEffect } from 'react'
import { initSmoothScroll, ScrollTrigger } from '@/lib/motion'
import { initReveals } from '@/lib/reveal'
import { Nav, GridOverlay } from '@/components/ui'
import { HeroRail } from '@/components/HeroRail'
import { Platform, Studio, DemoCta, Process } from '@/sections/upper'
import { Compare, MidCta, About, Mission, RoadmapCta, Stats, Contact } from '@/sections/lower'

export default function App() {
  useEffect(() => {
    const stop = initSmoothScroll()
    initReveals()
    // Fonts land after first paint and change every measurement on the page.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      stop()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <>
      <GridOverlay />
      <Nav />
      <main>
        <HeroRail />
        <Platform />
        <Studio />
        <DemoCta />
        <Process />
        <Compare />
        <MidCta />
        <About />
        <Mission />
        <RoadmapCta />
        <Stats />
        <Contact />
      </main>
    </>
  )
}
