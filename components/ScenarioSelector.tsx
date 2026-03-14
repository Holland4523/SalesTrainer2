'use client'

interface Scenario {
  id: number
  label: string
  personality: string
  pest: string
  season: string
  competitor: string
}

interface ScenarioSelectorProps {
  scenarios: Scenario[]
  selected: Scenario
  onSelect: (scenario: Scenario) => void
  difficulty: number
  onDifficultyChange: (difficulty: number) => void
  onStart: () => void
}

const DIFFICULTIES = [
  { level: 1, label: 'EASY', desc: 'Great for warm-up' },
  { level: 2, label: 'MEDIUM', desc: 'Real-world pacing' },
  { level: 3, label: 'HARD', desc: 'Value framing required' },
  { level: 4, label: 'ELITE', desc: 'Master-level challenge' },
]

export default function ScenarioSelector({
  scenarios,
  selected,
  onSelect,
  difficulty,
  onDifficultyChange,
  onStart,
}: ScenarioSelectorProps) {
  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Practice Setup</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Choose Scenario</h2>
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => onSelect(scenario)}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  selected.id === scenario.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-white/5 bg-dark-card hover:border-white/10'
                }`}
              >
                <p className="font-semibold text-white">{scenario.label}</p>
                <p className="text-xs text-white/50 mt-1">
                  {scenario.pest} • {scenario.season} • {scenario.competitor}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Difficulty Level</h2>
          <div className="space-y-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.level}
                onClick={() => onDifficultyChange(diff.level)}
                className={`w-full rounded-lg border p-4 text-left transition-all ${
                  difficulty === diff.level
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-white/5 bg-dark-card hover:border-white/10'
                }`}
              >
                <p className="font-semibold text-white">{diff.label}</p>
                <p className="text-xs text-white/50">{diff.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="mt-8 rounded-lg bg-amber-500 px-8 py-3 font-semibold text-black transition-all hover:bg-amber-400"
      >
        Start Training
      </button>
    </div>
  )
}
