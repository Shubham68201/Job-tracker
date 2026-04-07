export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-slate-700" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-t-indigo-500 animate-spin" />
        </div>
        <p className="text-slate-400 font-body text-sm">Loading JobTrackr...</p>
      </div>
    </div>
  );
}
