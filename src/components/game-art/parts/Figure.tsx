import type { ReactNode } from 'react'

/**
 * Stylized human built from organic SVG paths.
 * Local origin: chest. Head top ≈ -118. Feet ≈ +128. Half-width ≈ 62.
 */
export type HeadShape = 'round' | 'oval' | 'jaw'
export type HairStyle = 'short' | 'bun' | 'long' | 'cap' | 'beanie' | 'curly' | 'none'
export type Outfit = 'tee' | 'jacket' | 'hoodie' | 'dress'
export type ArmPose = 'down' | 'crossed' | 'hip' | 'chin' | 'pockets'

export interface FigureStyle {
  body: string
  bodyHighlight: string
  head: string
  hair: string
  legs: string
  /** Optional clothing-edge stroke so the figure separates from a dark stage. */
  edge?: string
}

export interface FigureProps {
  head?: HeadShape
  hair?: HairStyle
  outfit?: Outfit
  pose?: ArmPose
  shoulders?: number
  style: FigureStyle
  children?: ReactNode
}

const HEADS: Record<HeadShape, string> = {
  round:
    'M0,-114 C-22,-114 -30,-96 -28,-80 C-26,-66 -16,-58 0,-56 C16,-58 26,-66 28,-80 C30,-96 22,-114 0,-114 Z',
  oval:
    'M0,-118 C-19,-118 -26,-98 -24,-82 C-22,-66 -14,-56 0,-54 C14,-56 22,-66 24,-82 C26,-98 19,-118 0,-118 Z',
  jaw:
    'M0,-114 C-22,-114 -28,-98 -28,-84 C-28,-68 -20,-58 -10,-56 L10,-56 C20,-58 28,-68 28,-84 C28,-98 22,-114 0,-114 Z',
}

function torsoPath(outfit: Outfit, sw: number): string {
  const s = (n: number) => (n * sw).toFixed(1)
  if (outfit === 'dress') {
    return `M-14,-52 C${s(-32)},-50 ${s(-48)},-40 ${s(-52)},-16 C${s(-54)},4 ${s(-46)},22 ${s(-38)},38 C${s(-52)},62 ${s(-60)},86 ${s(-66)},108 L${s(66)},108 C${s(60)},86 ${s(52)},62 ${s(38)},38 C${s(46)},22 ${s(54)},4 ${s(52)},-16 C${s(48)},-40 ${s(32)},-50 14,-52 Z`
  }
  return `M-14,-52 C${s(-36)},-50 ${s(-56)},-40 ${s(-60)},-14 C${s(-64)},16 ${s(-60)},56 ${s(-54)},98 L${s(54)},98 C${s(60)},56 ${s(64)},16 ${s(60)},-14 C${s(56)},-40 ${s(36)},-50 14,-52 Z`
}

function highlightPath(sw: number): string {
  const s = (n: number) => (n * sw).toFixed(1)
  return `M-14,-52 C${s(-36)},-50 ${s(-56)},-40 ${s(-60)},-14 C${s(-62)},8 ${s(-58)},36 ${s(-54)},64 L${s(-42)},64 C${s(-46)},36 ${s(-48)},8 ${s(-46)},-12 C${s(-42)},-34 ${s(-26)},-46 -14,-52 Z`
}

function Arms({ pose, sw, fill }: { pose: ArmPose; sw: number; fill: string }) {
  const s = (n: number) => (n * sw).toFixed(1)
  switch (pose) {
    case 'crossed':
      return (
        <path
          d={`M${s(-54)},-12 C-28,10 28,10 ${s(54)},-12 L${s(56)},10 C28,32 -28,32 ${s(-56)},10 Z`}
          fill={fill}
        />
      )
    case 'hip':
      return (
        <>
          <path
            d={`M${s(-58)},-14 C${s(-70)},12 ${s(-74)},52 ${s(-68)},90 C${s(-66)},100 ${s(-54)},100 ${s(-52)},90 L${s(-50)},-8 Z`}
            fill={fill}
          />
          <path
            d={`M${s(50)},-10 C${s(70)},10 ${s(76)},36 ${s(60)},52 L${s(48)},44 C${s(60)},32 ${s(56)},14 ${s(46)},2 Z`}
            fill={fill}
          />
        </>
      )
    case 'chin':
      return (
        <>
          <path
            d={`M${s(-58)},-14 C${s(-70)},12 ${s(-74)},52 ${s(-68)},90 C${s(-66)},100 ${s(-54)},100 ${s(-52)},90 L${s(-50)},-8 Z`}
            fill={fill}
          />
          <path
            d={`M${s(50)},-8 C${s(64)},8 ${s(60)},24 ${s(46)},28 C${s(36)},28 ${s(32)},18 ${s(34)},10 C30,-10 22,-34 12,-56 L24,-60 C34,-38 ${s(40)},-16 ${s(50)},-8 Z`}
            fill={fill}
          />
        </>
      )
    case 'pockets':
      return (
        <>
          <path
            d={`M${s(-58)},-14 C${s(-68)},12 ${s(-64)},42 ${s(-46)},56 L${s(-36)},48 C${s(-50)},36 ${s(-54)},10 ${s(-50)},-8 Z`}
            fill={fill}
          />
          <path
            d={`M${s(58)},-14 C${s(68)},12 ${s(64)},42 ${s(46)},56 L${s(36)},48 C${s(50)},36 ${s(54)},10 ${s(50)},-8 Z`}
            fill={fill}
          />
        </>
      )
    default:
      return (
        <>
          <path
            d={`M${s(-58)},-14 C${s(-70)},12 ${s(-74)},52 ${s(-68)},90 C${s(-66)},100 ${s(-54)},100 ${s(-52)},90 L${s(-50)},-8 Z`}
            fill={fill}
          />
          <path
            d={`M${s(58)},-14 C${s(70)},12 ${s(74)},52 ${s(68)},90 C${s(66)},100 ${s(54)},100 ${s(52)},90 L${s(50)},-8 Z`}
            fill={fill}
          />
        </>
      )
  }
}

function Hair({ style, fill }: { style: HairStyle; fill: string }) {
  switch (style) {
    case 'short':
      return (
        <path
          d="M-28,-88 C-30,-110 -14,-122 0,-122 C14,-122 30,-110 28,-88 C20,-98 8,-102 0,-102 C-10,-102 -20,-98 -28,-88 Z"
          fill={fill}
        />
      )
    case 'bun':
      return (
        <>
          <path
            d="M-28,-88 C-30,-110 -14,-122 0,-122 C14,-122 30,-110 28,-88 C20,-98 8,-102 0,-102 C-10,-102 -20,-98 -28,-88 Z"
            fill={fill}
          />
          <ellipse cx="4" cy="-126" rx="11" ry="10" fill={fill} />
        </>
      )
    case 'long':
      return (
        <>
          <path
            d="M-28,-88 C-30,-110 -14,-122 0,-122 C14,-122 30,-110 28,-88 C20,-98 8,-102 0,-102 C-10,-102 -20,-98 -28,-88 Z"
            fill={fill}
          />
          <path d="M-28,-90 C-36,-74 -38,-54 -34,-36 L-18,-40 C-22,-58 -22,-76 -18,-90 Z" fill={fill} />
          <path d="M28,-90 C36,-74 38,-54 34,-36 L18,-40 C22,-58 22,-76 18,-90 Z" fill={fill} />
        </>
      )
    case 'cap':
      return (
        <>
          <path d="M-28,-92 C-22,-116 22,-116 28,-92 L28,-86 L-28,-86 Z" fill={fill} />
          <path d="M-2,-94 L44,-88 C42,-82 38,-80 32,-80 L-2,-86 Z" fill={fill} />
        </>
      )
    case 'beanie':
      return (
        <>
          <path d="M-28,-90 C-28,-116 28,-116 28,-90 L28,-82 L-28,-82 Z" fill={fill} />
          <path d="M-30,-90 L30,-90 L30,-80 L-30,-80 Z" fill={fill} opacity="0.75" />
        </>
      )
    case 'curly':
      return (
        <path
          d="M-30,-86 C-38,-100 -24,-126 0,-124 C24,-126 38,-100 30,-86 C24,-96 10,-100 0,-98 C-12,-100 -24,-96 -30,-86 Z"
          fill={fill}
        />
      )
    default:
      return null
  }
}

export function Figure({
  head = 'round',
  hair = 'short',
  outfit = 'tee',
  pose = 'down',
  shoulders = 1,
  style,
  children,
}: FigureProps) {
  const sw = shoulders
  const s = (n: number) => (n * sw).toFixed(1)
  const edge = style.edge

  return (
    <g>
      {outfit === 'hoodie' ? (
        <path
          d="M-32,-54 C-40,-92 -20,-124 0,-126 C20,-124 40,-92 32,-54 C20,-46 -20,-46 -32,-54 Z"
          fill={style.hair}
          stroke={edge}
          strokeWidth={edge ? 1.5 : 0}
        />
      ) : null}
      <path d={`M${s(-42)},92 L${s(-36)},128 L-6,128 L-4,92 Z`} fill={style.legs} />
      <path d={`M4,92 L6,128 L${s(36)},128 L${s(42)},92 Z`} fill={style.legs} />
      <path d="M-10,-64 L10,-64 L12,-48 L-12,-48 Z" fill={style.head} />
      <path
        d={torsoPath(outfit, sw)}
        fill={style.body}
        stroke={edge}
        strokeWidth={edge ? 1.6 : 0}
        strokeLinejoin="round"
      />
      <path d={highlightPath(sw)} fill={style.bodyHighlight} opacity="0.7" />
      {outfit === 'jacket' ? (
        <path
          d="M-10,-50 L0,-14 L10,-50"
          fill="none"
          stroke={style.bodyHighlight}
          strokeWidth="2.4"
          opacity="0.85"
        />
      ) : null}
      {outfit === 'tee' ? (
        <path d={`M${s(-22)},-36 L${s(22)},-36`} stroke={style.bodyHighlight} strokeWidth="3" opacity="0.45" />
      ) : null}
      <Arms pose={pose} sw={sw} fill={style.body} />
      <path d={HEADS[head]} fill={style.head} stroke={edge} strokeWidth={edge ? 1.4 : 0} />
      <Hair style={hair} fill={style.hair} />
      {children}
    </g>
  )
}
