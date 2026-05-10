import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#0D0E12]/70 backdrop-blur-xl border-b border-white/5">
      <div className="text-2xl font-bold tracking-tighter text-white font-headline">
        <Link to="/">PIXORA</Link>
      </div>
      <nav className="hidden md:flex items-center space-x-8">
        <Link className="font-headline text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest pb-1" to="/catalog">Catalog</Link>
        <Link className="font-headline text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest pb-1" to="/dashboard">Dashboard</Link>
        <Link className="font-headline text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest pb-1" to="/resources">Resources</Link>
        <Link className="font-headline text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest pb-1" to="/community">Community</Link>
      </nav>
      <div className="flex items-center space-x-6">
        <Link to="/login" className="px-5 py-2 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all rounded-md">
          Command Center
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
