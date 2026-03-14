export default function StatCard({
  label,
  value,
  color = 'amber',
}: {
  label: string
  value: string | number
  color?: 'amber' | 'green' | 'blue'
}) {
  const bgColor = {
    amber: 'bg-amber-500/10 border-amber-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
  }[color]

  const textColor = {
    amber: 'text-amber-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
  }[color]

  return (
    <div className={`rounded-lg border ${bgColor} p-6`}>
      <p className="mb-2 text-xs font-semibold text-white/50">{label}</p>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  )
}
