import { useEffect } from 'react'
import { initSmoothScroll, ScrollTrigger } from '@/lib/motion'
import { initReveals } from '@/lib/reveal'
import { Nav, GridOverlay } from '@/components/ui'
import { HeroRail } from '@/components/HeroRail'
import { Platform, Studio, DemoCta, Process } from '@/sections/upper'
import { Compare, MidCta, About, Mission, RoadmapCta, Stats, Contact } from '@/sections/lower'
import { Downloads } from '@/sections/downloads'
import { useRoute } from '@/lib/route'

export default function App() {
  const route = useRoute()

  // Re-runs on navigation: the new page's reveals have to be registered and
  // every trigger re-measured against a document of a different height.
  useEffect(() => {
    const stop = initSmoothScroll()
    initReveals()
    // Fonts land after first paint and change every measurement on the page.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      stop()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [route])

  return (
    <>
      <GridOverlay />
      <Nav />
      <main>
        {route === '/downloads' ? (
          <Downloads />
        ) : (
          <>
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
          </>
        )}
        {/* The site's footer lives in Contact, so both pages carry it. */}
        <Contact />
      </main>
    </>
  )
}
