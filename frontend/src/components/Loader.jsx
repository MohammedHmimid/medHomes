export default function Loader({ label = 'Chargement…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-20">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-teal-500" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
