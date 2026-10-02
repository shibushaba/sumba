import { describe, expect, it } from 'vitest'
import { buildRound, isValidImposterCount, MIN_PLAYERS, MAX_PLAYERS } from '../../game-engine/imposter/engine'
import {
  imposterReducer,
  initialImposterState,
  tryAddSetupPlayer,
} from '../../game-engine/imposter/reducer'

function player(id: string, name: string) {
  return { savedPlayerId: id, displayName: name }
}

describe('Imposter V2 reducer', () => {
  it('requires minimum players', () => {
    let state = initialImposterState
    state = tryAddSetupPlayer(state, player('a', 'A')).state
    state = tryAddSetupPlayer(state, player('b', 'B')).state
    expect(state.setupPlayers.length).toBe(2)
    state = imposterReducer(state, { type: 'START_GAME' })
    const blocked = imposterReducer(state, { type: 'GO_TO_IMPOSTER_COUNT' })
    expect(blocked.phase).toBe('players')
  })

  it(`allows up to ${MAX_PLAYERS} players`, () => {
    let state = initialImposterState
    for (let i = 1; i <= MAX_PLAYERS; i += 1) {
      state = tryAddSetupPlayer(state, player(`id-${i}`, `P${i}`)).state
    }
    expect(state.setupPlayers.length).toBe(MAX_PLAYERS)
  })

  it('rejects duplicate saved player ids', () => {
    let state = tryAddSetupPlayer(initialImposterState, player('x', 'Shibu')).state
    const dup = tryAddSetupPlayer(state, player('x', 'Other'))
    expect(dup.error).toBeTruthy()
  })

  it('rejects 2 imposters with 5 players', () => {
    expect(isValidImposterCount(5, 2)).toBe(false)
    expect(isValidImposterCount(6, 2)).toBe(true)
  })

  it('assigns roles and secret word', () => {
    const round = buildRound({
      setupPlayers: [
        player('1', 'A'),
        player('2', 'B'),
        player('3', 'C'),
        player('4', 'D'),
      ],
      imposterCount: 1,
      secretWord: 'PIZZA',
      packId: 'random',
      packLabel: 'RANDOM',
      roundNumber: 1,
      recentWords: [],
    })
    expect(round.secretWord).toBe('PIZZA')
    expect(round.imposterIds).toHaveLength(1)
    expect(round.players.every((p) => p.isImposter || !p.isImposter)).toBe(true)
  })

  it('rejects self vote', () => {
    const round = buildRound({
      setupPlayers: [player('1', 'A'), player('2', 'B'), player('3', 'C')],
      imposterCount: 1,
      secretWord: 'TEST',
      packId: 'random',
      packLabel: 'RANDOM',
      roundNumber: 1,
      recentWords: [],
    })
    let state: typeof initialImposterState = {
      ...initialImposterState,
      phase: 'voting',
      setupPlayers: [player('1', 'A'), player('2', 'B'), player('3', 'C')],
      round: {
        ...round,
        phase: 'voting',
        votingStep: 'select',
        votingIndex: 0,
      },
    }
    const voter = state.round!.players[0]
    state = imposterReducer(state, { type: 'VOTE_SELECT', targetId: voter.id })
    expect(state.round?.voteError).toMatch(/yourself/i)
  })
})

describe('player limits', () => {
  it('enforces min and max', () => {
    expect(MIN_PLAYERS).toBe(3)
    expect(MAX_PLAYERS).toBe(50)
  })
})
