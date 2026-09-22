export default function StatCard({ icon: Icon, label, value, accent = 'teal' }) {
  const accentClasses = {
    teal: 'bg-teal-50 text-teal-600',
    sand: 'bg-sand-100 text-sand-600',
    ink: 'bg-ink/5 text-ink',
  }
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm ${accentClasses[accent]}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-semibold text-ink">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}
