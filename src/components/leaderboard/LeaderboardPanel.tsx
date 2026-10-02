import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, RefreshCw, Trophy } from 'lucide-react'
import {
  fetchOwnerLeaderboard,
  type LeaderboardPeriod,
  type OwnerLeaderboardRow,
} from '../../services/leaderboard'
import { fetchSelfPlayerId } from '../../services/savedPlayers'
import { ensureGamesRegistered } from '../../games/registerGames'
import { getGames } from '../../game-engine/core/GameRegistry'
import { GlassButton } from '../ui/glass/GlassButton'
import { GlassPanel } from '../ui/glass/GlassPanel'
import { LeaderboardPodium } from './LeaderboardPodium'
import { LeaderboardRow } from './LeaderboardRow'
import { LeaderboardSegment } from './LeaderboardSegment'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { usePlayerAuthOptional } from '../auth/PlayerAuthProvider'

export type LeaderboardGameTab = 'overall' | string

interface LeaderboardPanelProps {
  gameTab: LeaderboardGameTab
  onGameTabChange?: (tab: LeaderboardGameTab) => void
  showGameTabs?: boolean
  compact?: boolean
  refreshKey?: number
}

export function LeaderboardPanel({
  gameTab,
  onGameTabChange,
  showGameTabs = true,
  compact = false,
  refreshKey = 0,
}: LeaderboardPanelProps) {
  const auth = usePlayerAuthOptional()
  const [period, setPeriod] = useState<LeaderboardPeriod>('all_time')
  const [rows, setRows] = useState<OwnerLeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selfPlayerId, setSelfPlayerId] = useState<string | null>(null)

  ensureGamesRegistered()
  const scoringGames = getGames().filter((g) => g.leaderboardEnabled)

  const gameSlug = gameTab === 'overall' ? null : gameTab

  const gameOptions = useMemo(
    () => [
      { value: 'overall' as const, label: 'Overall' },
      ...scoringGames.map((g) => ({
        value: g.slug,
        label: g.slug === 'who-where-what' ? 'WWW' : g.name.split(',')[0],
      })),
    ],
    [scoringGames],
  )

  const periodOptions = useMemo(
    () => [
      { value: 'all_time' as const, label: 'All time' },
      { value: 'week' as const, label: 'This week' },
    ],
    [],
  )

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      setError(null)
      try {
        const [result, selfId] = await Promise.all([
          fetchOwnerLeaderboard(gameSlug, period),
          fetchSelfPlayerId(),
        ])
        setSelfPlayerId(selfId)
        if (!result.ok) {
          if (result.reason === 'auth') {
            setRows([])
            setError(null)
          } else if (result.reason === 'offline') {
            setError('SUMBA is offline. Connect to see scores.')
          } else {
            setError(result.message ?? 'Could not load leaderboard.')
          }
          return
        }
        setRows(result.rows)
      } catch {
        setError('Could not load leaderboard.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [gameSlug, period],
  )

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  useEffect(() => {
    const onFocus = () => void load(true)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !auth?.user) return

    const channel = supabase
      .channel(`owner-scores-${auth.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'player_score_events',
          filter: `owner_user_id=eq.${auth.user.id}`,
        },
        () => {
          void load(true)
        },
      )
      .subscribe()

    return () => {
      if (supabase) void supabase.removeChannel(channel)
    }
  }, [auth?.user?.id, load])

  const selfRow = selfPlayerId
    ? rows.find((r) => r.playerId === selfPlayerId)
    : undefined
  const selfRank =
    selfPlayerId && selfRow
      ? rows.findIndex((r) => r.playerId === selfPlayerId) + 1
      : null

  const periodLabel = period === 'week' ? 'This week' : 'All time'
  const rest = rows.slice(3)
  const listRows = compact ? rows : rest

  if (auth?.loading) {
    return <LeaderboardSkeleton compact={compact} />
  }

  if (!auth?.user) {
    return (
      <GlassPanel className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--smb-border)] bg-black/30">
          <Trophy className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <p className="mt-4 font-display text-sm font-bold uppercase">Your crew&apos;s scores</p>
        <p className="mt-2 text-sm text-muted">
          Sign in to save points after each game and see rankings here.
        </p>
        <Link to="/players" className="mt-5 block">
          <GlassButton fullWidth>Sign in</GlassButton>
        </Link>
      </GlassPanel>
    )
  }

  return (
    <div className="space-y-4">
      <div className="lb-filters space-y-2">
        {showGameTabs && onGameTabChange ? (
          <LeaderboardSegment
            aria-label="Game"
            options={gameOptions}
            value={gameTab}
            onChange={onGameTabChange}
            equalWidth
          />
        ) : null}

        <div className="lb-toolbar-row">
          <LeaderboardSegment
            aria-label="Time period"
            options={periodOptions}
            value={period}
            onChange={setPeriod}
            equalWidth
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            className="lb-refresh-btn touch-manipulation motion-press-card"
            aria-label="Refresh leaderboard"
            disabled={loading || refreshing}
            onClick={() => void load(true)}
          >
            <RefreshCw
              className={['h-4 w-4', refreshing ? 'animate-spin' : ''].join(' ')}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {loading ? (
        <LeaderboardSkeleton compact={compact} />
      ) : error ? (
        <GlassPanel className="text-center">
          <p className="font-display text-sm font-bold uppercase">Couldn&apos;t load</p>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <GlassButton className="mt-4" onClick={() => void load()}>
            Retry
          </GlassButton>
        </GlassPanel>
      ) : rows.length === 0 ? (
        <GlassPanel className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-[var(--smb-border)]">
            <Gamepad2 className="h-6 w-6 text-muted" aria-hidden />
          </div>
          <p className="mt-4 font-display text-sm font-bold uppercase">No scores yet</p>
          <p className="mt-2 text-sm text-muted">
            Add saved players, finish Imposter or Mafia, then open the leaderboard at the end of a
            game.
          </p>
          <Link to="/games" className="mt-5 block">
            <GlassButton fullWidth>Play a game</GlassButton>
          </Link>
        </GlassPanel>
      ) : (
        <div key={`${gameTab}-${period}-${refreshKey}`} className="page-enter space-y-4">
          <LeaderboardPodium rows={rows} periodLabel={periodLabel} compact={compact} />

          {listRows.length > 0 ? (
            <section>
              {!compact && rest.length > 0 ? (
                <h2 className="mb-2 px-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  Rest of the pack
                </h2>
              ) : null}
              <ol className="space-y-2">
                {listRows.map((row, i) => {
                  const rank = compact ? i + 1 : i + 4
                  return (
                    <LeaderboardRow
                      key={row.playerId}
                      row={row}
                      rank={rank}
                      index={i}
                      highlight={row.playerId === selfPlayerId}
                    />
                  )
                })}
              </ol>
            </section>
          ) : null}

          {!compact ? (
            <GlassPanel padding="sm" className="lb-self-card">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                Your position
              </p>
              {selfRow && selfRank ? (
                <div className="mt-3 flex items-center gap-3">
                  <span className="lb-row-rank">{selfRank}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold uppercase">
                      {selfRow.displayName}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider text-primary">
                      On this board
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-black tabular-nums">
                      {selfRow.totalPoints}
                    </p>
                    <p className="text-[8px] font-bold uppercase text-muted">pts</p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  You&apos;re not ranked on this view yet.{' '}
                  <Link to="/players" className="text-primary underline underline-offset-2">
                    Link your player
                  </Link>
                </p>
              )}
            </GlassPanel>
          ) : null}
        </div>
      )}
    </div>
  )
}

function LeaderboardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div
        className={[
          'rounded-[var(--radius-lg)] bg-surface/40',
          compact ? 'h-40' : 'h-52',
        ].join(' ')}
      />
      <div className="h-14 rounded-[var(--radius-md)] bg-surface/35" />
      <div className="h-14 rounded-[var(--radius-md)] bg-surface/35" />
      <div className="h-14 rounded-[var(--radius-md)] bg-surface/35" />
    </div>
  )
}
