import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  SpeakingPodiumModal,
  SpeakingPodiumModalProps,
} from '@/components/speaking/SpeakingPodiumModal'
import { SpeakingArena } from '@/components/speaking/SpeakingArena'
import type {
  SpeakingScenario,
  SpeakingSessionResult,
} from '@/types/speaking'
import {
  sendSpeakingTurnAction,
  completeSpeakingSessionAction,
} from '@/app/actions/speaking'
import { getStoredSrsDeck } from '@/lib/srs-storage'

// Mock next/navigation
const mockRouterPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}))

// Mock useSpeech hook
const mockSpeak = vi.fn()
const mockCancelSpeech = vi.fn()
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: mockCancelSpeech,
    isSpeaking: false,
    isSupported: true,
  }),
}))

// Mock useSpeechRecognition hook
vi.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    isSupported: true,
    error: null,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    resetTranscript: vi.fn(),
  }),
}))

// Mock useStudentSession
vi.mock('@/hooks/use-student-session', () => ({
  useStudentSession: () => ({
    session: { classCode: 'L1', studentName: 'Test Student' },
    isAnonymous: false,
    isLoaded: true,
  }),
}))

// Mock server actions
vi.mock('@/app/actions/speaking', () => ({
  sendSpeakingTurnAction: vi.fn(),
  completeSpeakingSessionAction: vi.fn(),
  getStudentSpeakingStatsAction: vi.fn(),
}))

const mockScenario: SpeakingScenario = {
  id: 'ordering-cafe',
  titleVi: 'Gọi đồ uống tại quán cà phê',
  titleEn: 'Ordering at a Café',
  descriptionVi: 'Thực hành gọi đồ uống.',
  level: 'A1',
  icon: '☕',
  targetTurns: 2,
  persona: {
    id: 'barista-emma',
    name: 'Emma',
    avatar: '☕',
    role: 'Barista',
    accent: 'us',
    toneVi: 'Niềm nở',
  },
  initialMessage: 'Hello! What can I get for you?',
  initialHints: [
    {
      level: 'starter',
      textEn: 'A hot coffee, please.',
      textVi: 'Một ly cà phê nóng, làm ơn.',
      phoneticHint: '/ə hɒt ˈkɒfi pliːz/',
    },
  ],
}

const mockResult: SpeakingSessionResult = {
  scenarioId: 'ordering-cafe',
  personaId: 'barista-emma',
  totalTurns: 3,
  overallScore: 88,
  pronunciationScore: 85,
  fluencyScore: 92,
  stars: 3,
  xpEarned: 75,
  mispronouncedWords: ['macchiato', 'croissant'],
  turns: [],
}

describe('SpeakingPodiumModal Component', () => {
  const defaultProps: SpeakingPodiumModalProps = {
    isOpen: true,
    result: mockResult,
    scenario: mockScenario,
    onRestart: vi.fn(),
    onBackToHub: vi.fn(),
    onAddToMistakes: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    render(<SpeakingPodiumModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('speaking-podium-modal')).not.toBeInTheDocument()
  })

  it('renders dialog with accessibility attributes when isOpen is true', () => {
    render(<SpeakingPodiumModal {...defaultProps} />)
    const modal = screen.getByTestId('speaking-podium-modal')
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveAttribute('role', 'dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
  })

  it('renders star rating with animated stars', () => {
    render(<SpeakingPodiumModal {...defaultProps} />)
    const starRating = screen.getByTestId('star-rating')
    expect(starRating).toBeInTheDocument()
    // Should display stars representation
    expect(starRating.textContent).toContain('⭐')
  })

  it('renders overall score, pronunciation score, fluency score, and XP badges', () => {
    render(<SpeakingPodiumModal {...defaultProps} />)

    const overallBadge = screen.getByTestId('overall-score-badge')
    expect(overallBadge).toBeInTheDocument()
    expect(overallBadge).toHaveTextContent('88%')

    const pronunciationBadge = screen.getByTestId('pronunciation-score-badge')
    expect(pronunciationBadge).toBeInTheDocument()
    expect(pronunciationBadge).toHaveTextContent('85%')

    const fluencyBadge = screen.getByTestId('fluency-score-badge')
    expect(fluencyBadge).toBeInTheDocument()
    expect(fluencyBadge).toHaveTextContent('92%')

    const xpBadge = screen.getByTestId('xp-earned-badge')
    expect(xpBadge).toBeInTheDocument()
    expect(xpBadge).toHaveTextContent('+75 XP')
  })

  it('triggers onRestart when restart button is clicked', () => {
    const onRestart = vi.fn()
    render(<SpeakingPodiumModal {...defaultProps} onRestart={onRestart} />)

    const restartBtn = screen.getByTestId('restart-button')
    expect(restartBtn).toBeInTheDocument()
    fireEvent.click(restartBtn)
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('triggers onBackToHub when back to hub button is clicked', () => {
    const onBackToHub = vi.fn()
    render(<SpeakingPodiumModal {...defaultProps} onBackToHub={onBackToHub} />)

    const backBtn = screen.getByTestId('back-to-hub-button')
    expect(backBtn).toBeInTheDocument()
    fireEvent.click(backBtn)
    expect(onBackToHub).toHaveBeenCalledTimes(1)
  })

  it('displays mispronounced words and wires add to mistakes button with feedback state', () => {
    const onAddToMistakes = vi.fn()
    render(
      <SpeakingPodiumModal
        {...defaultProps}
        onAddToMistakes={onAddToMistakes}
      />
    )

    // Verify mispronounced words list
    expect(screen.getByText('macchiato')).toBeInTheDocument()
    expect(screen.getByText('croissant')).toBeInTheDocument()

    // Button should be visible
    const addBtn = screen.getByTestId('add-to-mistakes-button')
    expect(addBtn).toBeInTheDocument()

    // No feedback before clicking
    expect(screen.queryByTestId('added-to-mistakes-feedback')).not.toBeInTheDocument()

    // Click add to mistakes
    fireEvent.click(addBtn)

    // onAddToMistakes should be called with word list
    expect(onAddToMistakes).toHaveBeenCalledWith(['macchiato', 'croissant'])

    // Feedback should now be shown
    const feedback = screen.getByTestId('added-to-mistakes-feedback')
    expect(feedback).toBeInTheDocument()
    expect(feedback).toHaveTextContent(/sổ tay/i)
  })

  it('does not render add to mistakes button when there are no mispronounced words', () => {
    const resultNoMistakes: SpeakingSessionResult = {
      ...mockResult,
      mispronouncedWords: [],
    }

    render(
      <SpeakingPodiumModal
        {...defaultProps}
        result={resultNoMistakes}
      />
    )

    expect(screen.queryByTestId('add-to-mistakes-button')).not.toBeInTheDocument()
    expect(screen.getByText(/không có từ nào bị phát âm sai/i)).toBeInTheDocument()
  })
})

describe('SpeakingArena Integration with SpeakingPodiumModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders SpeakingPodiumModal when session completes, allows adding to mistakes, and restarts', async () => {
    const mockSend = vi.mocked(sendSpeakingTurnAction)
    const mockComplete = vi.mocked(completeSpeakingSessionAction)
    const onAddToMistakesMock = vi.fn()

    mockSend.mockResolvedValueOnce({
      success: true,
      tutorMessage: 'Here is your coffee! Anything else?',
      accuracyScore: 82,
      wordBreakdown: [
        { word: 'a', isMatch: true, score: 95 },
        { word: 'hot', isMatch: true, score: 88 },
        { word: 'croissant', isMatch: false, score: 45 },
      ],
      isCompleted: true,
    })

    mockComplete.mockResolvedValueOnce({
      success: true,
      data: {
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        totalTurns: 1,
        overallScore: 82,
        pronunciationScore: 80,
        fluencyScore: 87,
        stars: 2,
        xpEarned: 60,
        mispronouncedWords: ['croissant'],
        turns: [],
      },
    })

    render(
      <SpeakingArena
        scenario={mockScenario}
        onAddToMistakes={onAddToMistakesMock}
      />
    )

    const textInput = screen.getByTestId('text-input-fallback')
    const submitBtn = screen.getByTestId('text-submit-button')

    fireEvent.change(textInput, { target: { value: 'A hot croissant' } })
    fireEvent.click(submitBtn)

    // Wait for completion modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('speaking-podium-modal')).toBeInTheDocument()
    })

    const modal = screen.getByTestId('speaking-podium-modal')

    // Verify modal elements rendered in arena
    expect(screen.getByTestId('star-rating')).toBeInTheDocument()
    expect(screen.getByTestId('overall-score-badge')).toHaveTextContent('82%')
    expect(screen.getByTestId('xp-earned-badge')).toHaveTextContent('+60 XP')
    expect(modal.textContent).toContain('croissant')

    // Test adding mispronounced words to mistake notebook
    const addMistakesBtn = screen.getByTestId('add-to-mistakes-button')
    fireEvent.click(addMistakesBtn)

    expect(onAddToMistakesMock).toHaveBeenCalledWith(['croissant'])
    expect(screen.getByTestId('added-to-mistakes-feedback')).toBeInTheDocument()

    // Verify word was saved into SRS storage
    const storedDeck = getStoredSrsDeck('L1', 'Test Student')
    expect(storedDeck.some((c) => c.correctAnswer === 'croissant' && c.gameType === 'speaking')).toBe(true)

    // Test restarting session from modal
    const restartBtn = screen.getByTestId('restart-button')
    fireEvent.click(restartBtn)

    // Modal closes and arena is back in interactive state
    expect(screen.queryByTestId('speaking-podium-modal')).not.toBeInTheDocument()
    expect(screen.getByTestId('mic-pulse-button')).toBeInTheDocument()
    expect(screen.getByTestId('text-input-fallback')).toBeInTheDocument()
  })

  it('navigates back to /speaking when back to hub button is clicked in modal', async () => {
    const mockSend = vi.mocked(sendSpeakingTurnAction)
    const mockComplete = vi.mocked(completeSpeakingSessionAction)

    mockSend.mockResolvedValueOnce({
      success: true,
      tutorMessage: 'Great job!',
      accuracyScore: 95,
      isCompleted: true,
    })

    mockComplete.mockResolvedValueOnce({
      success: true,
      data: {
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        totalTurns: 1,
        overallScore: 95,
        pronunciationScore: 95,
        fluencyScore: 95,
        stars: 3,
        xpEarned: 85,
        mispronouncedWords: [],
        turns: [],
      },
    })

    render(<SpeakingArena scenario={mockScenario} />)

    const textInput = screen.getByTestId('text-input-fallback')
    const submitBtn = screen.getByTestId('text-submit-button')

    fireEvent.change(textInput, { target: { value: 'Hello' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('speaking-podium-modal')).toBeInTheDocument()
    })

    const backBtn = screen.getByTestId('back-to-hub-button')
    fireEvent.click(backBtn)

    expect(mockRouterPush).toHaveBeenCalledWith('/speaking')
  })
})
