import { forwardRef } from 'react'
import { ArtworkStage, type ArtworkHandle } from './ArtworkStage'
import { Particles } from './Particles'
import { GAME_ART_COLORS } from './types'

const C = GAME_ART_COLORS.mafia
const W = 800
const H = 420

/** Chest origin at x = 57%, y = 45%. Knife hand at x ≈ 69%, y ≈ 58%. */
const CHAR_X = 0.57 * W
const CHAR_Y = 0.45 * H

const BRICK_ROWS = Array.from({ length: 13 }, (_, i) => 36 + i * 26)

export const MafiaArtwork = forwardRef<ArtworkHandle>(function MafiaArtwork(_, ref) {
  return (
    <ArtworkStage ref={ref} game="mafia" signatureEvery={6000} signatureDuration={1000}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="ga-svg">
        <defs>
          <linearGradient id="maf-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B0507" />
            <stop offset="100%" stopColor="#040304" />
          </linearGradient>
          <linearGradient id="maf-door" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A0C14" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0E0406" />
          </linearGradient>
          <radialGradient id="maf-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.secondary} stopOpacity="0.28" />
            <stop offset="40%" stopColor={C.secondary} stopOpacity="0.16" />
            <stop offset="100%" stopColor={C.secondary} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="maf-blade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5A5E66" />
            <stop offset="50%" stopColor="#C8CCD4" />
            <stop offset="100%" stopColor="#4A4E56" />
          </linearGradient>
          <linearGradient id="maf-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#161012" />
            <stop offset="100%" stopColor="#080506" />
          </linearGradient>
          <radialGradient id="maf-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="maf-lamp" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB36B" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FFB36B" stopOpacity="0" />
          </radialGradient>
          <filter id="maf-blur" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        <g id="background" className="ga-layer ga-layer--bg">
          <rect width={W} height={H} fill="url(#maf-bg)" />
          <rect x="0" y="0" width="248" height="360" fill="#141010" />
          <g stroke="#2A2224" strokeWidth="1.4">
            {BRICK_ROWS.map((y) => (
              <line key={y} x1="0" y1={y} x2="248" y2={y} />
            ))}
            {BRICK_ROWS.map((y, i) => (
              <g key={`v${y}`}>
                {[28, 88, 148, 208].map((x) => (
                  <line key={x} x1={x + (i % 2) * 30} y1={y} x2={x + (i % 2) * 30} y2={y + 26} />
                ))}
              </g>
            ))}
          </g>
          <rect x="638" y="0" width="162" height="360" fill="#120E10" />
          <rect x="720" y="0" width="10" height="360" fill="#1C1618" />
          <rect x="714" y="292" width="22" height="12" fill="#241A1C" />
          <path d="M800,50 L736,50 L736,60 L788,60 Z" fill="#1C1618" />
          <ellipse cx="738" cy="66" rx="12" ry="6" fill="#FFB36B" opacity="0.55" className="ga-maf-lamp" />
          <circle cx="738" cy="88" r="72" fill="url(#maf-lamp)" className="ga-maf-lamp" />
        </g>

        <g id="environment" className="ga-layer ga-layer--env">
          <rect x="292" y="18" width="312" height="348" fill="#18080C" />
          <rect x="286" y="10" width="324" height="16" fill="#221014" />
          <rect x="308" y="36" width="280" height="330" fill="url(#maf-door)" />
          <line x1="448" y1="36" x2="448" y2="366" stroke="#2A1016" strokeWidth="4" />
          <rect x="324" y="56" width="108" height="128" fill="none" stroke="#2A1016" strokeWidth="3" />
          <rect x="464" y="56" width="108" height="128" fill="none" stroke="#2A1016" strokeWidth="3" />
          <path d="M278,366 L618,366 L644,392 L252,392 Z" fill="#1A1416" />
          <rect x="0" y="366" width={W} height="54" fill="url(#maf-floor)" />
          <line x1="0" y1="366" x2={W} y2="366" stroke="#2A2224" strokeWidth="3" />
          <ellipse cx={CHAR_X} cy="388" rx="140" ry="16" fill="url(#maf-shadow)" />
        </g>

        <g id="lighting" className="ga-layer ga-layer--light">
          <circle cx="470" cy="190" r="260" fill="url(#maf-red)" className="ga-maf-red" />
          <ellipse cx="400" cy="372" rx="420" ry="28" fill="#3A0F18" opacity="0.16" filter="url(#maf-blur)" className="ga-maf-fog" />
        </g>

        <g id="characters" className="ga-layer ga-layer--chars">
          <g transform={`translate(${CHAR_X}, ${CHAR_Y})`}>
            <g className="ga-maf-body">
              {/* left arm */}
              <path
                d="M-90,-28 C-106,4 -112,48 -106,92 C-104,104 -88,106 -84,94 C-88,52 -84,10 -74,-20 Z"
                fill="#1A1A20"
              />

              {/* trench coat */}
              <path
                d="M-98,148 C-96,90 -94,44 -88,10 C-82,-24 -70,-42 -50,-52 L-22,-64 L26,-64 L54,-52 C76,-42 88,-20 92,14 C96,50 102,100 106,148 Z"
                fill="#141418"
              />
              <path d="M-22,-64 L-2,-36 L-12,70 L-24,148 L-48,148 L-38,-22 Z" fill="#222228" />
              <path d="M26,-64 L6,-36 L12,70 L20,148 L38,148 L40,-22 Z" fill="#1C1C22" />
              <path d="M-72,28 C-16,36 24,36 80,28 L80,40 C24,48 -16,48 -72,40 Z" fill="#0E0E12" />
              <path d="M-2,-36 L6,-36 L12,70 L-12,70 Z" fill="#121216" />
              <path
                d="M54,-52 C76,-42 88,-20 92,14 C96,50 102,100 106,148"
                fill="none"
                stroke={C.primary}
                strokeWidth="4"
                strokeLinecap="round"
                className="ga-maf-rim"
              />

              {/* neck + collar */}
              <path d="M-14,-86 L14,-86 L16,-62 L-16,-62 Z" fill="#2A262C" />
              <path d="M-34,-70 C-30,-84 -14,-92 0,-92 C14,-92 30,-84 34,-70 L26,-62 L-26,-62 Z" fill="#1A1A20" />

              {/* head + fedora */}
              <g transform="translate(0,-68)">
                <g className="ga-maf-head">
                  <g transform="translate(0,68)">
                    {/* face: nose + jaw readable, ~70% in hat shadow */}
                    <path
                      d="M-28,-136 C-26,-158 22,-166 34,-144 L38,-118 C42,-110 48,-104 44,-98 C40,-92 34,-92 30,-96 C32,-84 24,-72 12,-68 C0,-66 -12,-70 -20,-76 C-30,-86 -32,-104 -28,-120 Z"
                      fill="#3A343C"
                    />
                    <path
                      d="M34,-118 L50,-106 L38,-98"
                      fill="#5A5058"
                    />
                    <path
                      d="M30,-96 C32,-84 24,-72 12,-68"
                      fill="none"
                      stroke={C.primary}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      className="ga-maf-rim"
                    />
                    <path
                      d="M-28,-136 C-26,-158 22,-166 34,-144 L38,-118 L40,-104 L-30,-104 Z"
                      fill="#0C0C10"
                      opacity="0.88"
                    />
                    <ellipse cx="20" cy="-114" rx="5" ry="2.6" fill={C.highlight} className="ga-maf-eye" />
                    <g transform="rotate(-4 4 -148)">
                      <path
                        d="M-92,-140 C-70,-156 -28,-162 8,-160 C50,-162 88,-154 104,-136 C88,-122 44,-118 2,-122 C-40,-120 -72,-124 -92,-140 Z"
                        fill="#0A0A0E"
                      />
                      <path d="M-42,-154 C-36,-188 40,-192 50,-150 L52,-142 L-44,-142 Z" fill="#121216" />
                      <path d="M-44,-156 L52,-156 L54,-142 L-46,-142 Z" fill="#1A1A20" />
                      <path
                        d="M44,-154 C74,-150 94,-144 104,-136"
                        fill="none"
                        stroke={C.primary}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        className="ga-maf-rim"
                      />
                    </g>
                  </g>
                </g>
              </g>

              {/* right arm + hand */}
              <path d="M62,-38 C84,-10 98,24 102,52 L116,54 C114,24 104,-12 88,-42 Z" fill="#1C1C22" />
              <path
                d="M88,-42 C104,-12 114,24 116,54"
                fill="none"
                stroke={C.primary}
                strokeWidth="2.6"
                strokeLinecap="round"
                className="ga-maf-rim"
              />
              <path d="M94,48 C102,38 118,40 122,52 C124,64 114,76 102,74 C92,72 88,58 94,48 Z" fill="#3A3238" />

              {/* knife at local (96,55) → canvas ~ (552, 244) = 69%, 58% */}
              <g transform="translate(96,55) rotate(25)" className="ga-maf-knife">
                <path d="M-7,-2 L7,-2 L7,26 L-7,26 Z" fill="#222228" />
                <path d="M-7,8 L7,8 M-7,16 L7,16" stroke="#33333A" strokeWidth="1.6" />
                <path d="M-12,-8 L12,-8 L12,-2 L-12,-2 Z" fill="#3A3A42" />
                <path d="M-5,-8 L5,-8 L4,-62 C2,-74 -2,-74 -4,-62 Z" fill="url(#maf-blade)" />
                <path d="M0,-12 L0,-58" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.35" />
                <path
                  d="M0,-12 L0,-58"
                  stroke={C.highlight}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="14 60"
                  className="ga-maf-glint"
                />
              </g>
            </g>
          </g>
        </g>

        <g id="effects" className="ga-layer ga-layer--fx">
          <Particles count={8} color={C.highlight} area={{ x: 120, y: 60, w: 560, h: 280 }} size={1.6} />
        </g>
      </svg>
    </ArtworkStage>
  )
})
