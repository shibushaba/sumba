import { forwardRef } from 'react'
import { ArtworkStage, type ArtworkHandle } from './ArtworkStage'
import { Figure, type FigureStyle, type HairStyle, type HeadShape, type Outfit, type ArmPose } from './parts/Figure'
import { Particles } from './Particles'
import { GAME_ART_COLORS } from './types'

const C = GAME_ART_COLORS.imposter

const PLAYER: FigureStyle = {
  body: '#20242A',
  bodyHighlight: '#3A4554',
  head: '#2A3038',
  hair: '#15181D',
  legs: '#1A1E24',
  edge: '#4A5564',
}

const IMPOSTER: FigureStyle = {
  body: '#101820',
  bodyHighlight: '#1A2A3A',
  head: '#0E1620',
  hair: '#0A1017',
  legs: '#0C131B',
  edge: C.primary,
}

interface Guest {
  x: number
  y: number
  scale: number
  head: HeadShape
  hair: HairStyle
  outfit: Outfit
  pose: ArmPose
  shoulders: number
  dur: number
  delay: number
}

/** Spec positions as % of 800×420; drawn back-to-front by y. */
const GUESTS: Guest[] = [
  { x: 0.15, y: 0.6, scale: 0.78, head: 'round', hair: 'curly', outfit: 'tee', pose: 'down', shoulders: 0.95, dur: 3.1, delay: -0.4 },
  { x: 0.3, y: 0.48, scale: 0.9, head: 'jaw', hair: 'short', outfit: 'jacket', pose: 'crossed', shoulders: 1.12, dur: 3.6, delay: -1.2 },
  { x: 0.42, y: 0.63, scale: 0.76, head: 'oval', hair: 'bun', outfit: 'dress', pose: 'hip', shoulders: 0.9, dur: 2.7, delay: -2.1 },
  { x: 0.62, y: 0.57, scale: 0.82, head: 'round', hair: 'cap', outfit: 'tee', pose: 'pockets', shoulders: 1.0, dur: 3.3, delay: -0.9 },
  { x: 0.76, y: 0.45, scale: 0.92, head: 'oval', hair: 'long', outfit: 'jacket', pose: 'chin', shoulders: 1.02, dur: 3.9, delay: -1.7 },
  { x: 0.88, y: 0.62, scale: 0.74, head: 'jaw', hair: 'beanie', outfit: 'hoodie', pose: 'down', shoulders: 1.08, dur: 2.9, delay: -2.6 },
]

const IMPOSTER_POS = { x: 0.5, y: 0.38, scale: 1.08 }

const W = 800
const H = 420

export const ImposterArtwork = forwardRef<ArtworkHandle>(function ImposterArtwork(_, ref) {
  const sorted = [...GUESTS].sort((a, b) => a.y - b.y)
  const back = sorted.filter((g) => g.y < IMPOSTER_POS.y)
  const front = sorted.filter((g) => g.y >= IMPOSTER_POS.y)

  return (
    <ArtworkStage ref={ref} game="imposter" signatureEvery={4200} signatureDuration={900}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="ga-svg">
        <defs>
          <linearGradient id="imp-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070B14" />
            <stop offset="100%" stopColor="#04060A" />
          </linearGradient>
          <radialGradient id="imp-spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.primary} stopOpacity="0.16" />
            <stop offset="55%" stopColor={C.primary} stopOpacity="0.08" />
            <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="imp-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.highlight} stopOpacity="0.16" />
            <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="imp-floor" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#243040" />
            <stop offset="55%" stopColor="#161C26" />
            <stop offset="100%" stopColor="#0C1016" />
          </radialGradient>
          <radialGradient id="ga-shadow-imp" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="imp-eye-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.highlight} stopOpacity="0.95" />
            <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g id="background" className="ga-layer ga-layer--bg">
          <rect width={W} height={H} fill="url(#imp-bg)" />
          <g opacity="0.7">
            <rect x="28" y="0" width="96" height="300" fill="#0A0F18" />
            <rect x="676" y="0" width="96" height="300" fill="#0A0F18" />
            <rect x="188" y="0" width="64" height="270" fill="#090E16" />
            <rect x="548" y="0" width="64" height="270" fill="#090E16" />
            <line x1="0" y1="298" x2={W} y2="298" stroke="#1A2430" strokeWidth="3" />
          </g>
          <path d="M368,0 L432,0 L418,28 L382,28 Z" fill="#121A26" />
          <ellipse cx="400" cy="30" rx="26" ry="6" fill={C.highlight} opacity="0.55" className="ga-imp-bulb" />
          <path d="M382,30 L418,30 L760,360 L40,360 Z" fill="url(#imp-cone)" />
        </g>

        <g id="environment" className="ga-layer ga-layer--env">
          <ellipse cx="400" cy="348" rx="390" ry="78" fill="url(#imp-floor)" />
          <ellipse cx="400" cy="344" rx="310" ry="54" fill="none" stroke="#2A3848" strokeWidth="2.5" />
          <ellipse cx="400" cy="342" rx="190" ry="30" fill="none" stroke="#334456" strokeWidth="1.5" opacity="0.7" />
        </g>

        <g id="lighting" className="ga-layer ga-layer--light">
          <ellipse cx="400" cy="250" rx="250" ry="190" fill="url(#imp-spot)" className="ga-imp-spot" />
        </g>

        <g id="characters" className="ga-layer ga-layer--chars">
          {back.map((g, i) => (
            <GuestFigure key={`b${i}`} guest={g} />
          ))}

          <g transform={`translate(${IMPOSTER_POS.x * W}, ${IMPOSTER_POS.y * H}) scale(${IMPOSTER_POS.scale})`}>
            <ellipse cx="0" cy="128" rx="58" ry="12" fill="url(#ga-shadow-imp)" />
            <g className="ga-idle ga-imposter" style={{ animationDuration: '4.6s', animationDelay: '-0.6s' }}>
              <Figure head="oval" hair="none" outfit="hoodie" pose="down" shoulders={1.04} style={IMPOSTER}>
                <path d="M-24,-96 C-14,-108 14,-108 24,-96 L25,-82 C12,-92 -12,-92 -25,-82 Z" fill="#06090D" />
                <path
                  d="M14,-48 C38,-44 58,-34 62,-10 C66,18 62,58 56,100"
                  fill="none"
                  stroke={C.primary}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  className="ga-imp-rim"
                />
                <path
                  d="M4,-116 C22,-114 28,-98 26,-82 C24,-70 16,-60 2,-58"
                  fill="none"
                  stroke={C.primary}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  className="ga-imp-rim"
                />
                <circle cx="10" cy="-84" r="16" fill="url(#imp-eye-glow)" className="ga-imp-eye-glow" />
                <ellipse cx="10" cy="-84" rx="5" ry="3" fill={C.highlight} className="ga-imp-eye" />
              </Figure>
            </g>
          </g>

          {front.map((g, i) => (
            <GuestFigure key={`f${i}`} guest={g} />
          ))}
        </g>

        <g id="effects" className="ga-layer ga-layer--fx">
          <Particles count={7} color={C.highlight} area={{ x: 80, y: 40, w: 640, h: 300 }} size={1.8} />
        </g>
      </svg>
    </ArtworkStage>
  )
})

function GuestFigure({ guest }: { guest: Guest }) {
  return (
    <g transform={`translate(${guest.x * W}, ${guest.y * H}) scale(${guest.scale})`}>
      <ellipse cx="0" cy="128" rx="54" ry="11" fill="url(#ga-shadow-imp)" />
      <g className="ga-idle" style={{ animationDuration: `${guest.dur}s`, animationDelay: `${guest.delay}s` }}>
        <Figure
          head={guest.head}
          hair={guest.hair}
          outfit={guest.outfit}
          pose={guest.pose}
          shoulders={guest.shoulders}
          style={PLAYER}
        />
      </g>
    </g>
  )
}
