export default function ScrollCTA(){
  return(
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 hidden -translate-x-1/2 md:block">
      <div className="pointer-events-auto rounded-full border border-white/60 bg-white/78 px-5 py-3 text-sm font-medium text-ink shadow-[0_12px_35px_rgba(16,32,24,0.12)] backdrop-blur-xl transition-all duration-500 hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:text-brand-50 dark:hover:bg-white/15">
        Compare evidence and stack compatibility
      </div>
    </div>
  )
}
