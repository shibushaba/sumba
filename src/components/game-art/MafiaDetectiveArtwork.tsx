import { ArtworkStage } from './ArtworkStage'
import { Figure, type FigureStyle } from './parts/Figure'
import { GAME_ART_COLORS } from './types'

const C = GAME_ART_COLORS.mafia

const SUSPECT: FigureStyle = {
  body: '#1E1A1E',
  bodyHighlight: '#3A3238',
  head: '#2A262C',
  hair: '#121014',
  legs: '#181518',
  edge: '#4A4048',
}

/** Compact line-up used on the Detective role card (non-interactive). */
export function MafiaDetectiveArtwork() {
  return (
    <ArtworkStage game="mafia" interactive={false} signatureEvery={4000} signatureDuration={900}>
      <svg viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice" className="ga-svg">
        <defs>
          <radialGradient id="det-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="det-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={C.secondary} stopOpacity="0.2" />
            <stop offset="100%" stopColor={C.secondary} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g id="background" className="ga-layer ga-layer--bg">
          <rect width="800" height="420" fill="#070506" />
          <rect x="0" y="0" width="800" height="330" fill="#0A0809" />
          <g stroke="#120E0F" strokeWidth="1">
            {[60, 100, 140, 180, 220, 260, 300].map((y) => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} />
            ))}
          </g>
          <g stroke="#1A1416" strokeWidth="2" opacity="0.6">
            {[120, 160, 200, 240, 280].map((y) => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} />
            ))}
          </g>
        </g>
        <g id="environment" className="ga-layer ga-layer--env">
          <rect x="0" y="330" width="800" height="90" fill="#0B0A0B" />
          <line x1="0" y1="330" x2="800" y2="330" stroke="#181214" strokeWidth="2" />
        </g>
        <g id="lighting" className="ga-layer ga-layer--light">
          <circle cx="520" cy="210" r="200" fill="url(#det-red)" className="ga-maf-red" />
        </g>
        <g id="characters" className="ga-layer ga-layer--chars">
          {[
            { x: 160, pose: 'down', hair: 'short', head: 'round' },
            { x: 340, pose: 'pockets', hair: 'cap', head: 'jaw' },
            { x: 520, pose: 'crossed', hair: 'none', head: 'oval' },
            { x: 690, pose: 'hip', hair: 'long', head: 'round' },
          ].map((p, i) => (
            <g key={p.x} transform={`translate(${p.x}, 212) scale(0.92)`}>
              <ellipse cx="0" cy="124" rx="50" ry="9" fill="url(#det-shadow)" />
              <g className="ga-idle" style={{ animationDuration: `${3 + i * 0.4}s`, animationDelay: `${-i * 0.7}s` }}>
                <Figure
                  head={p.head as 'round' | 'oval' | 'jaw'}
                  hair={p.hair as 'short' | 'cap' | 'none' | 'long'}
                  pose={p.pose as 'down' | 'pockets' | 'crossed' | 'hip'}
                  outfit={i === 2 ? 'hoodie' : 'jacket'}
                  style={SUSPECT}
                >
                  {i === 2 ? (
                    <ellipse cx="9" cy="-86" rx="4" ry="2.4" fill={C.highlight} className="ga-maf-eye" />
                  ) : null}
                </Figure>
              </g>
            </g>
          ))}
        </g>
        <g id="effects" className="ga-layer ga-layer--fx">
          <circle cx="520" cy="130" r="70" fill="none" stroke={C.primary} strokeWidth="2" opacity="0.5" className="ga-det-ring" />
          <line x1="40" y1="60" x2="760" y2="60" stroke={C.primary} strokeWidth="1.5" opacity="0.3" />
          <g transform="translate(610, 300) rotate(-20)" opacity="0.9">
            <circle r="30" fill="none" stroke="#5A5560" strokeWidth="5" />
            <circle r="22" fill="rgba(255,48,79,0.08)" />
            <line x1="0" y1="30" x2="0" y2="70" stroke="#5A5560" strokeWidth="7" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </ArtworkStage>
  )
}
