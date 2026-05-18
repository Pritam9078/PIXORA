const Footer = () => {
  return (
    <footer className="bg-[#0D0E12] border-t border-white/10 w-full py-12 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4">
          <div className="text-lg font-black text-white font-headline">PIXORA</div>
          <p className="font-headline text-xs font-light text-slate-600">
            © 2026 Pixora. Engineered for the Next Frontier.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="font-headline text-xs font-light text-slate-600 hover:text-accent-lime transition-colors uppercase tracking-widest" href="#">Privacy Policy</a>
          <a className="font-headline text-xs font-light text-slate-600 hover:text-accent-lime transition-colors uppercase tracking-widest" href="#">Terms of Service</a>
          <a className="font-headline text-xs font-light text-slate-600 hover:text-accent-lime transition-colors uppercase tracking-widest" href="#">Github</a>
          <a className="font-headline text-xs font-light text-slate-600 hover:text-accent-lime transition-colors uppercase tracking-widest" href="#">Discord</a>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-500 hover:text-accent-lime cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-sm">share</span>
          </div>
          <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-500 hover:text-accent-lime cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-sm">language</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
