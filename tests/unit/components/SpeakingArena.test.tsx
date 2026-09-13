import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SpeakingBubble } from '@/components/speaking/SpeakingBubble'
import { ScaffoldingHints } from '@/components/speaking/ScaffoldingHints'
import { MicPulseButton } from '@/components/speaking/MicPulseButton'
import { SpeakingArena } from '@/components/speaking/SpeakingArena'
import SpeakingScenarioPage from '@/app/speaking/[scenarioId]/page'
import type {
  SpeakingDialogueTurn,
  SpeakingPersona,
  SpeakingScaffoldingHint,
  SpeakingScenario,
} from '@/types/speaking'
import { sendSpeakingTurnAction, completeSpeakingSessionAction } from '@/app/actions/speaking'

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
let mockIsListening = false
let mockTranscript = ''
const mockStartListening = vi.fn()
const mockStopListening = vi.fn()
const mockResetTranscript = vi.fn()

vi.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    isListening: mockIsListening,
    transcript: mockTranscript,
    interimTranscript: '',
    isSupported: true,
    error: null,
    startListening: mockStartListening,
    stopListening: mockStopListening,
    resetTranscript: mockResetTranscript,
  }),
}))

// Mock server actions
vi.mock('@/app/actions/speaking', () => ({
  sendSpeakingTurnAction: vi.fn(),
  completeSpeakingSessionAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      scenarioId: 'ordering-cafe',
      personaId: 'barista-emma',
      totalTurns: 2,
      overallScore: 92,
      pronunciationScore: 90,
      fluencyScore: 94,
      stars: 3,
      xpEarned: 50,
      mispronouncedWords: [],
      turns: [],
    },
  }),
  getStudentSpeakingStatsAction: vi.fn(),
}))

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
    get: (key: string) => (key === 'persona' ? 'barista-emma' : null),
  }),
}))

// Mock student session
vi.mock('@/hooks/use-student-session', () => ({
  useStudentSession: () => ({
    session: { studentId: 'stu-123', classCode: 'L1', studentName: 'Test Student' },
    isAnonymous: false,
    isLoaded: true,
  }),
}))

const samplePersona: SpeakingPersona = {
  id: 'barista-emma',
  name: 'Emma',
  avatar: '☕',
  role: 'Barista',
  accent: 'us',
  toneVi: 'Niềm nở và kiên nhẫn',
}

const sampleHints: SpeakingScaffoldingHint[] = [
  {
    level: 'starter',
    textEn: 'A hot coffee, please.',
    textVi: 'Một ly cà phê nóng, làm ơn.',
    phoneticHint: '/ə hɒt ˈkɒfi pliːz/',
  },
  {
    level: 'natural',
    textEn: 'Can I have an iced latte, please?',
    textVi: 'Cho mình một ly latte đá được không ạ?',
    phoneticHint: '/kæn aɪ hæv ən aɪst ˈlɑːteɪ pliːz/',
  },
  {
    level: 'expressive',
    textEn: "I'd love an iced caramel macchiato with oat milk, please!",
    textVi: 'Cho mình một ly macchiato caramel đá cùng sữa yến mạch nhé!',
    phoneticHint: '/aɪd lʌv ən aɪst ˈkærəməl ˌmækiˈɑːtəʊ wɪð əʊt mɪlk pliːz/',
  },
]

const sampleScenario: SpeakingScenario = {
  id: 'ordering-cafe',
  titleVi: 'Gọi đồ uống tại quán cà phê',
  titleEn: 'Ordering at a Café',
  descriptionVi: 'Thực hành gọi đồ uống và món bánh yêu thích.',
  level: 'A1',
  icon: '☕',
  targetTurns: 2,
  persona: samplePersona,
  initialMessage: 'Hello! Welcome to Sunshine Café. What would you like to order today?',
  initialHints: sampleHints,
}

describe('SpeakingBubble Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders tutor turn with avatar, text, and replay button', () => {
    const onPlayAudio = vi.fn()
    const tutorTurn: SpeakingDialogueTurn = {
      id: 'turn-1',
      sender: 'tutor',
      text: 'Hello! Welcome to our cafe.',
      timestamp: '2026-09-12T10:00:00Z',
    }

    render(
      <SpeakingBubble
        turn={tutorTurn}
        persona={samplePersona}
        onPlayAudio={onPlayAudio}
      />
    )

    expect(screen.getByTestId('turn-tutor')).toBeInTheDocument()
    expect(screen.getByText('Hello! Welcome to our cafe.')).toBeInTheDocument()
    expect(screen.getByText('☕')).toBeInTheDocument()
    expect(screen.getByText('Emma')).toBeInTheDocument()

    const replayBtn = screen.getByTestId('replay-audio-turn-1')
    fireEvent.click(replayBtn)
    expect(onPlayAudio).toHaveBeenCalledWith('Hello! Welcome to our cafe.')
  })

  it('renders student turn with word breakdown color coding, accuracy score, and feedbackVi', () => {
    const studentTurn: SpeakingDialogueTurn = {
      id: 'turn-2',
      sender: 'student',
      text: 'A hot coffee please',
      accuracyScore: 85,
      wordBreakdown: [
        { word: 'A', isMatch: true, score: 95 },
        { word: 'hot', isMatch: true, score: 75 },
        { word: 'coffee', isMatch: true, score: 85 },
        { word: 'please', isMatch: true, score: 40 },
      ],
      feedbackVi: 'Chú ý phát âm đuôi từ please!',
      timestamp: '2026-09-12T10:01:00Z',
    }

    render(
      <SpeakingBubble
        turn={studentTurn}
        persona={samplePersona}
      />
    )

    expect(screen.getByTestId('turn-student')).toBeInTheDocument()
    expect(screen.getByTestId('turn-accuracy-score')).toHaveTextContent(/85%/)

    // Word >= 80: emerald/green
    const wordA = screen.getByText('A')
    expect(wordA.className).toMatch(/emerald|green/i)

    // Word 50-79: amber/yellow
    const wordHot = screen.getByText('hot')
    expect(wordHot.className).toMatch(/amber|yellow/i)

    // Word < 50: rose/red
    const wordPlease = screen.getByText('please')
    expect(wordPlease.className).toMatch(/rose|red/i)

    // Vietnamese feedback
    expect(screen.getByText(/Chú ý phát âm đuôi từ please!/i)).toBeInTheDocument()
  })

  it('renders student plain text when no word breakdown is provided', () => {
    const studentTurn: SpeakingDialogueTurn = {
      id: 'turn-3',
      sender: 'student',
      text: 'Can I have some water?',
      timestamp: '2026-09-12T10:02:00Z',
    }

    render(
      <SpeakingBubble
        turn={studentTurn}
        persona={samplePersona}
      />
    )

    expect(screen.getByTestId('turn-student')).toBeInTheDocument()
    expect(screen.getByText('Can I have some water?')).toBeInTheDocument()
    expect(screen.queryByTestId('turn-accuracy-score')).not.toBeInTheDocument()
  })
})

describe('ScaffoldingHints Component', () => {
  it('renders 3 hint tiers with phonetic guides and handles selection and preview audio', () => {
    const onSelectHint = vi.fn()
    const onPreviewAudio = vi.fn()

    render(
      <ScaffoldingHints
        hints={sampleHints}
        onSelectHint={onSelectHint}
        onPreviewAudio={onPreviewAudio}
      />
    )

    expect(screen.getByTestId('scaffolding-hints')).toBeInTheDocument()
    expect(screen.getByTestId('hint-starter')).toBeInTheDocument()
    expect(screen.getByTestId('hint-natural')).toBeInTheDocument()
    expect(screen.getByTestId('hint-expressive')).toBeInTheDocument()

    // Starter content
    expect(screen.getByText('A hot coffee, please.')).toBeInTheDocument()
    expect(screen.getByText('/ə hɒt ˈkɒfi pliːz/')).toBeInTheDocument()
    expect(screen.getByText('Một ly cà phê nóng, làm ơn.')).toBeInTheDocument()

    // Test selection
    fireEvent.click(screen.getByTestId('hint-starter'))
    expect(onSelectHint).toHaveBeenCalledWith(sampleHints[0])

    // Test preview audio button
    const listenStarterBtn = screen.getByTestId('listen-hint-starter')
    fireEvent.click(listenStarterBtn)
    expect(onPreviewAudio).toHaveBeenCalledWith('A hot coffee, please.')
  })
})

describe('MicPulseButton Component', () => {
  it('renders idle state and triggers toggle on click', () => {
    const onToggle = vi.fn()
    render(
      <MicPulseButton
        isListening={false}
        isSupported={true}
        onToggleListen={onToggle}
      />
    )

    const btn = screen.getByTestId('mic-pulse-button')
    expect(btn).toBeInTheDocument()
    expect(screen.getByTestId('mic-status-label')).toBeInTheDocument()

    fireEvent.click(btn)
    expect(onToggle).toHaveBeenCalled()
  })

  it('renders listening and processing state labels', () => {
    const { rerender } = render(
      <MicPulseButton
        isListening={true}
        isSupported={true}
        onToggleListen={vi.fn()}
      />
    )

    expect(screen.getByTestId('mic-status-label')).toHaveTextContent(/nghe|lắng nghe|nói/i)

    rerender(
      <MicPulseButton
        isListening={false}
        isProcessing={true}
        isSupported={true}
        onToggleListen={vi.fn()}
      />
    )
    expect(screen.getByTestId('mic-status-label')).toHaveTextContent(/xử lý|chấm điểm/i)
  })

  it('renders unsupported browser warning when isSupported is false', () => {
    render(
      <MicPulseButton
        isListening={false}
        isSupported={false}
        onToggleListen={vi.fn()}
      />
    )

    expect(screen.getByTestId('mic-status-label')).toHaveTextContent(/không hỗ trợ/i)
  })
})

describe('SpeakingArena Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsListening = false
    mockTranscript = ''
  })

  it('renders arena with initial tutor message and scaffolding hints', () => {
    render(<SpeakingArena scenario={sampleScenario} />)

    expect(screen.getByTestId('speaking-arena')).toBeInTheDocument()
    // Initial tutor bubble
    expect(screen.getByText(sampleScenario.initialMessage)).toBeInTheDocument()
    // Back link
    expect(screen.getByRole('link', { name: /chọn chủ đề khác/i })).toHaveAttribute('href', '/speaking')
    // Scaffolding hints rendered
    expect(screen.getByTestId('scaffolding-hints')).toBeInTheDocument()
  })

  it('submits turn via fallback text input and receives tutor response', async () => {
    const mockSendAction = vi.mocked(sendSpeakingTurnAction)
    mockSendAction.mockResolvedValueOnce({
      success: true,
      tutorMessage: 'Great choice! Would you like that hot or iced?',
      tutorAudioText: 'Great choice! Would you like that hot or iced?',
      accuracyScore: 92,
      wordBreakdown: [
        { word: 'A', isMatch: true, score: 95 },
        { word: 'hot', isMatch: true, score: 90 },
        { word: 'coffee', isMatch: true, score: 91 },
      ],
      feedbackVi: 'Phát âm rất rõ ràng!',
      hints: [
        {
          level: 'starter',
          textEn: 'Hot, please.',
          textVi: 'Nóng, làm ơn.',
          phoneticHint: '/hɒt pliːz/',
        },
      ],
      isCompleted: false,
    })

    render(<SpeakingArena scenario={sampleScenario} />)

    const textInput = screen.getByTestId('text-input-fallback')
    const submitBtn = screen.getByTestId('text-submit-button')

    fireEvent.change(textInput, { target: { value: 'A hot coffee' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockSendAction).toHaveBeenCalledWith(
        expect.objectContaining({
          scenarioId: 'ordering-cafe',
          personaId: 'barista-emma',
          userMessage: 'A hot coffee',
        })
      )
    })

    // Tutor response appears in dialogue
    await waitFor(() => {
      expect(
        screen.getByText('Great choice! Would you like that hot or iced?')
      ).toBeInTheDocument()
    })

    // Feedback and score rendered
    expect(screen.getByText(/Phát âm rất rõ ràng!/i)).toBeInTheDocument()
    expect(screen.getByTestId('turn-accuracy-score')).toHaveTextContent(/92%/)

    // Auto-plays tutor speech
    expect(mockSpeak).toHaveBeenCalledWith(
      'Great choice! Would you like that hot or iced?'
    )

    // Hints updated to new tutor hints
    expect(screen.getByText('Hot, please.')).toBeInTheDocument()
  })

  it('populates text input when user clicks a scaffolding hint', () => {
    render(<SpeakingArena scenario={sampleScenario} />)

    const starterHint = screen.getByTestId('hint-starter')
    fireEvent.click(starterHint)

    const textInput = screen.getByTestId('text-input-fallback') as HTMLInputElement
    expect(textInput.value).toBe('A hot coffee, please.')
  })

  it('triggers speech recognition start on mic button click', () => {
    render(<SpeakingArena scenario={sampleScenario} />)

    const micBtn = screen.getByTestId('mic-pulse-button')
    fireEvent.click(micBtn)

    expect(mockStartListening).toHaveBeenCalled()
  })

  it('allows replaying tutor turn and previewing hint audio', () => {
    render(<SpeakingArena scenario={sampleScenario} />)

    // Preview hint audio
    const previewBtn = screen.getByTestId('listen-hint-starter')
    fireEvent.click(previewBtn)
    expect(mockSpeak).toHaveBeenCalledWith('A hot coffee, please.')

    // Replay initial tutor message
    const replayBtn = screen.getByTestId(`replay-audio-turn-init-${sampleScenario.id}`)
    fireEvent.click(replayBtn)
    expect(mockSpeak).toHaveBeenCalledWith(sampleScenario.initialMessage)
  })

  it('handles completion and allows restarting session', async () => {
    const mockSendAction = vi.mocked(sendSpeakingTurnAction)
    const onCompleteMock = vi.fn()

    mockSendAction.mockResolvedValueOnce({
      success: true,
      tutorMessage: 'Here is your coffee! Enjoy!',
      tutorAudioText: 'Here is your coffee! Enjoy!',
      accuracyScore: 95,
      wordBreakdown: [{ word: 'Thanks', isMatch: true, score: 95 }],
      isCompleted: true,
    })

    render(
      <SpeakingArena
        scenario={sampleScenario}
        onComplete={onCompleteMock}
      />
    )

    const textInput = screen.getByTestId('text-input-fallback')
    const submitBtn = screen.getByTestId('text-submit-button')

    fireEvent.change(textInput, { target: { value: 'Thanks' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      // Completed state banner / modal
      expect(screen.getByText(/Hoàn thành xuất sắc|Hoàn thành luyện nói/i)).toBeInTheDocument()
    })

    expect(completeSpeakingSessionAction).toHaveBeenCalled()

    // Test restarting session
    const restartBtn = screen.getByRole('button', { name: /Luyện lại/i })
    fireEvent.click(restartBtn)

    // Back to active arena
    expect(screen.getByTestId('mic-pulse-button')).toBeInTheDocument()
    expect(screen.getByTestId('text-input-fallback')).toBeInTheDocument()
  })
})

describe('SpeakingScenarioPage (/speaking/[scenarioId])', () => {
  it('renders speaking arena when scenario is found', async () => {
    const paramsPromise = Promise.resolve({ scenarioId: 'ordering-cafe' })

    await act(async () => {
      render(
        <React.Suspense fallback={<div>Đang tải...</div>}>
          <SpeakingScenarioPage params={paramsPromise} />
        </React.Suspense>
      )
    })

    expect(screen.getByTestId('speaking-arena')).toBeInTheDocument()
    expect(screen.getByText(/Gọi đồ uống tại quán cà phê/i)).toBeInTheDocument()
  })

  it('renders 404 message when scenario is not found', async () => {
    const paramsPromise = Promise.resolve({ scenarioId: 'non-existent-scenario' })

    await act(async () => {
      render(
        <React.Suspense fallback={<div>Đang tải...</div>}>
          <SpeakingScenarioPage params={paramsPromise} />
        </React.Suspense>
      )
    })

    expect(screen.getByText(/Không tìm thấy kịch bản/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Quay lại danh sách kịch bản|chọn chủ đề/i })).toHaveAttribute(
      'href',
      '/speaking'
    )
  })
})
