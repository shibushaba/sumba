import { forwardRef } from 'react'
import { ArtworkStage, type ArtworkHandle } from './ArtworkStage'
import { Particles } from './Particles'
import { GAME_ART_COLORS } from './types'

const C = GAME_ART_COLORS['who-where-what']
const W = 800
const H = 420

/** Person hip origin: x = 28%, y = 58%. Feet land on rooftop floor (y ≈ 304). */
const PERSON_X = 0.28 * W
const PERSON_Y = 0.58 * H

const SKYLINE = [
  { x: 0, w: 70, h: 150 },
  { x: 80, w: 48, h: 96 },
  { x: 140, w: 90, h: 180 },
  { x: 244, w: 56, h: 120 },
  { x: 312, w: 110, h: 214 },
  { x: 436, w: 64, h: 132 },
  { x: 512, w: 92, h: 170 },
  { x: 618, w: 54, h: 108 },
  { x: 684, w: 116, h: 196 },
]

export const WhoWhereWhatArtwork = forwardRef<ArtworkHandle>(function WhoWhereWhatArtwork(_, ref) {
  return (
    <ArtworkStage ref={ref} game="who-where-what" signatureEvery={6000} signatureDuration={900}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="ga-svg">
        <defs>
          <linearGradient id="www-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#040806" />
            <stop offset="100%" stopColor="#081009" />
          </linearGradient>
          <linearGradient id="www-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A2E24" />
            <stop offset="100%" stopColor="#0C1610" />
          </linearGradient>
          <radialGradient id="www-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.primary} stopOpacity="0.18" />
            <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="www-lamp" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.highlight} stopOpacity="0.55" />
            <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="www-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g id="background" className="ga-layer ga-layer--bg">
          <rect width={W} height={H} fill="url(#www-sky)" />
          <g fill="#CFEFD9" opacity="0.55">
            <circle cx="90" cy="40" r="1.4" />
            <circle cx="210" cy="72" r="1" />
            <circle cx="330" cy="30" r="1.2" />
            <circle cx="470" cy="58" r="1" />
            <circle cx="580" cy="26" r="1.4" />
            <circle cx="700" cy="66" r="1" />
            <circle cx="760" cy="34" r="1.2" />
          </g>
          <circle cx="640" cy="90" r="150" fill="url(#www-glow)" />
          <g fill="#1C3228" stroke="#2A4436" strokeWidth="1">
            {SKYLINE.map((b) => (
              <rect key={b.x} x={b.x} y={268 - b.h} width={b.w} height={b.h} />
            ))}
          </g>
          <g fill={C.primary} opacity="0.35">
            <rect x="160" y="110" width="6" height="8" />
            <rect x="182" y="140" width="6" height="8" />
            <rect x="340" y="80" width="6" height="8" />
            <rect x="370" y="122" width="6" height="8" />
            <rect x="398" y="96" width="6" height="8" />
            <rect x="540" y="128" width="6" height="8" />
            <rect x="572" y="156" width="6" height="8" />
            <rect x="710" y="104" width="6" height="8" />
            <rect x="760" y="150" width="6" height="8" />
          </g>
        </g>

        <g id="environment" className="ga-layer ga-layer--env">
          <g className="ga-www-roof">
            <rect x="606" y="140" width="5" height="106" fill="#3A5044" />
            <path d="M586,166 L630,166 M590,186 L626,186 M594,206 L622,206" stroke="#3A5044" strokeWidth="3" />
            <circle cx="608" cy="138" r="4" fill={C.highlight} className="ga-www-beacon" />
            <rect x="676" y="200" width="54" height="46" fill="#142018" />
            <rect x="672" y="194" width="62" height="8" fill="#243830" />
            <rect x="48" y="228" width="704" height="18" fill="#3A5646" />
            <g fill="#2E4438">
              {[80, 140, 200, 260, 320, 380, 440, 500, 560, 620, 680].map((x) => (
                <rect key={x} x={x} y="210" width="14" height="20" />
              ))}
            </g>
            <rect x="56" y="246" width="688" height="58" fill="#16251D" />
            <g stroke="#3A5646" strokeWidth="1.6">
              <line x1="56" y1="266" x2="744" y2="266" />
              <line x1="56" y1="286" x2="744" y2="286" />
            </g>
            <path d="M28,304 L772,304 L800,420 L0,420 Z" fill="url(#www-roof)" />
            <line x1="28" y1="304" x2="772" y2="304" stroke="#5A7A66" strokeWidth="4" />
            <g stroke="#142018" strokeWidth="1.2" opacity="0.8">
              <line x1="120" y1="420" x2="200" y2="304" />
              <line x1="400" y1="420" x2="400" y2="304" />
              <line x1="680" y1="420" x2="600" y2="304" />
            </g>
            <rect x="560" y="268" width="68" height="40" fill="#243830" />
            <rect x="566" y="274" width="56" height="28" fill="none" stroke="#0E1611" strokeWidth="2" />
            <rect x="126" y="196" width="5" height="48" fill="#3A5044" />
            <path d="M116,190 L142,190 L136,200 L122,200 Z" fill="#2A4436" />
            <circle cx="129" cy="204" r="36" fill="url(#www-lamp)" className="ga-www-lamp" />
            <ellipse cx="129" cy="200" rx="7" ry="3.5" fill={C.highlight} opacity="0.65" className="ga-www-lamp" />
          </g>
        </g>

        <g id="lighting" className="ga-layer ga-layer--light">
          <ellipse cx={PERSON_X} cy="300" rx="130" ry="20" fill={C.secondary} opacity="0.18" />
        </g>

        <g id="characters" className="ga-layer ga-layer--chars">
          <g transform={`translate(${PERSON_X}, ${PERSON_Y}) scale(1.12)`}>
            <ellipse cx="0" cy="62" rx="52" ry="8" fill="url(#www-shadow)" />
            <g className="ga-www-dance ga-www-body">
              {/* planted leg */}
              <path d="M-40,10 C-42,30 -36,46 -32,60 L-8,60 C-6,42 -4,28 0,12 Z" fill="#1B2024" />
              <path d="M-36,56 L-8,56 L-2,66 L-40,66 Z" fill="#0E1113" />

              {/* lifted dance leg */}
              <g transform="translate(-2,12)">
                <g className="ga-www-dance ga-www-leg">
                  <g transform="translate(2,-12)">
                    <path d="M0,12 C16,20 30,34 40,46 L54,36 C42,20 26,6 10,2 Z" fill="#1B2024" />
                    <path d="M40,46 L54,36 L78,16 L88,28 Z" fill="#1B2024" />
                    <path d="M74,12 L90,6 L96,18 L84,30 Z" fill="#0E1113" />
                  </g>
                </g>
              </g>

              {/* torso — green shirt */}
              <path
                d="M-12,-66 C-32,-64 -46,-52 -48,-30 C-50,-8 -44,8 -40,16 L40,16 C44,8 50,-8 48,-30 C46,-52 32,-64 12,-66 Z"
                fill="#243530"
                stroke={C.secondary}
                strokeWidth="2.2"
              />
              <path d="M-40,-18 C2,-8 40,-18" fill="none" stroke={C.primary} strokeWidth="4" />
              <path
                d="M-12,-66 C-32,-64 -46,-52 -48,-30 C-50,-8 -44,8 -40,16"
                fill="none"
                stroke={C.primary}
                strokeWidth="2.6"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* raised arm */}
              <g transform="translate(-32,-48)">
                <g className="ga-www-dance ga-www-arm-l">
                  <g transform="translate(32,48)">
                    <path
                      d="M-32,-48 C-48,-60 -62,-76 -64,-92 C-66,-108 -58,-122 -48,-136 L-36,-128 C-44,-116 -48,-104 -48,-92 C-46,-78 -38,-64 -24,-56 Z"
                      fill="#2E3834"
                    />
                    <path d="M-54,-140 C-46,-148 -34,-142 -36,-130 C-38,-122 -50,-122 -54,-130 Z" fill="#2E3834" />
                  </g>
                </g>
              </g>

              {/* extended arm */}
              <g transform="translate(30,-48)">
                <g className="ga-www-dance ga-www-arm-r">
                  <g transform="translate(-30,48)">
                    <path
                      d="M30,-52 C48,-54 68,-50 86,-42 C96,-36 100,-28 96,-24 L88,-28 C76,-36 60,-40 44,-38 C36,-36 32,-42 30,-46 Z"
                      fill="#2E3834"
                    />
                    <path d="M90,-30 C100,-36 110,-28 104,-18 C98,-10 88,-14 86,-22 Z" fill="#2E3834" />
                  </g>
                </g>
              </g>

              {/* neck + head + hair + face */}
              <path d="M-8,-76 L8,-76 L10,-62 L-10,-62 Z" fill="#2E3834" />
              <path
                d="M0,-124 C-20,-124 -28,-108 -26,-94 C-24,-80 -14,-72 0,-70 C14,-72 24,-80 26,-94 C28,-108 20,-124 0,-124 Z"
                fill="#2E3834"
              />
              <path
                d="M-26,-100 C-32,-126 -8,-134 6,-132 C24,-132 34,-118 28,-98 C20,-108 8,-112 0,-110 C-12,-112 -20,-108 -26,-100 Z"
                fill="#11171A"
              />
              <g fill={C.highlight}>
                <circle cx="-6" cy="-94" r="2.2" />
                <circle cx="8" cy="-94" r="2.2" />
              </g>
              <path
                d="M-6,-82 C0,-76 8,-76 12,-82"
                fill="none"
                stroke={C.highlight}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>

        <g id="effects" className="ga-layer ga-layer--fx">
          <Particles count={9} color={C.primary} area={{ x: 120, y: 120, w: 560, h: 180 }} size={2} />
          <g className="ga-www-burst" fill={C.highlight}>
            <circle cx={PERSON_X - 40} cy={PERSON_Y - 90} r="2.5" />
            <circle cx={PERSON_X + 70} cy={PERSON_Y - 60} r="2" />
            <circle cx={PERSON_X - 60} cy={PERSON_Y - 20} r="2" />
            <circle cx={PERSON_X + 60} cy={PERSON_Y - 120} r="2.5" />
            <circle cx={PERSON_X + 20} cy={PERSON_Y - 150} r="1.8" />
          </g>
        </g>
      </svg>
    </ArtworkStage>
  )
})
