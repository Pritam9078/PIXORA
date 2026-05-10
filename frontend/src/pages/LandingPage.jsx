import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-margin-x">
          <div className="absolute inset-0 hero-gradient-lime"></div>
          <div className="absolute inset-0 hero-gradient-purple"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-stack-md"
            >
              <div className="inline-flex items-center space-x-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                <span className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Now enrolling: 2024 Engineering Cohort</span>
              </div>
              
              <h1 className="font-headline text-headline-xl text-white max-w-xl leading-[1.1] tracking-tight">
                Master the Tech of the <span className="text-secondary-container">Next Frontier.</span>
              </h1>
              
              <p className="text-body-base text-on-surface-variant max-w-lg">
                Elite technical education for the decentralized era. Deep-dive into Game Development and Blockchain Engineering with industry legends.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="bg-secondary-container text-on-secondary px-8 py-4 rounded font-headline text-sm flex items-center justify-center space-x-2 hover:shadow-[0_0_20px_rgba(195,244,0,0.4)] transition-all">
                  <span>EXPLORE GAME DEV</span>
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                </button>
                <button className="border border-on-tertiary-container text-on-tertiary-container px-8 py-4 rounded font-headline text-sm flex items-center justify-center space-x-2 hover:bg-on-tertiary-container/10 transition-all">
                  <span>MASTER BLOCKCHAIN</span>
                  <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="space-y-4 pt-12">
                  <div className="glass-panel rounded-xl p-1 overflow-hidden">
                    <img alt="Game Dev" className="w-full h-48 object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXUd_Wzz5IO3tFyJgZwAeEViC3g2wqMJP77ixq2yLTGN6ERqGPDg_j_Os4cl_WxSE8Kt4faCNfDSfxThcodxbBNKR8MtyI0ucXq1caq5LvLaSgNfWYdam-fLP7TedGmwOoXTGcNFX3AiXIYaIq3McAu_tg2DwyUetwlHQNoSY5AGVlIF9_V4HhjZu4FJiXICn1XOykuV83_hAkJp2KzPPbOL-3Fhc1XPVHXqP71z-7PV0HB5zNXDgKlacK1Ef7Do7FV2iWGJesV28B"/>
                  </div>
                  <div className="glass-panel rounded-xl p-6 border-on-secondary-container/30">
                    <span className="material-symbols-outlined text-secondary-container mb-4">videogame_asset</span>
                    <h3 className="font-headline text-white text-lg">AAA Pipeline</h3>
                    <p className="text-xs text-on-surface-variant mt-2">Unreal Engine 5 mastery from greybox to gold.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass-panel rounded-xl p-6 border-on-tertiary-container/30">
                    <span className="material-symbols-outlined text-on-tertiary-container mb-4">hub</span>
                    <h3 className="font-headline text-white text-lg">Smart Contracts</h3>
                    <p className="text-xs text-on-surface-variant mt-2">Security-first Solidity and Rust architectures.</p>
                  </div>
                  <div className="glass-panel rounded-xl p-1 overflow-hidden">
                    <img alt="Blockchain" className="w-full h-48 object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB99J2100FTdbnMJc2JEbBEuOEpcZsMyeTbpc5YH9JLDdqbwRK5hGOYfWeZzjlCgamLhQ5ImQAfc1Z-bnsrZW7wZtcbpaHXg2ie3fvs7hVM5sxx2uy1D4fovcYOSSuVhnwi0ghjyi218Y6zPTsWHYbTIVb5MurF3j0nQvtqQMprbWVBnaVRFI7qZIXptGBcKj55LZM9UyStPd3iAYkH_b50xDnN8zU5E0b86vvY7fdb3_MPupnfvmbzjjGbDhtj6x1T1jj9VN1YyfrF"/>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Pixora Section */}
        <section className="py-stack-lg bg-surface">
          <div className="max-w-7xl mx-auto px-margin-x">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="font-headline text-on-tertiary-container uppercase tracking-widest text-xs">The Academic Standard</span>
              <h2 className="font-headline text-headline-xl text-white mt-4">Why Pixora?</h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <motion.div 
                whileHover={{ y: -10 }}
                className="glass-panel p-8 rounded-xl border-white/5 hover:border-secondary-container/30 transition-all group"
              >
                <div className="w-12 h-12 rounded flex items-center justify-center bg-secondary-container/10 text-secondary-container mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">podcasts</span>
                </div>
                <h3 className="font-headline text-white mb-4">Live Satellite Classes</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  No pre-recorded lectures. Engage in real-time with lead architects from world-class studios and protocol labs.
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -10 }}
                className="glass-panel p-8 rounded-xl border-white/5 hover:border-on-tertiary-container/30 transition-all group"
              >
                <div className="w-12 h-12 rounded flex items-center justify-center bg-on-tertiary-container/10 text-on-tertiary-container mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <h3 className="font-headline text-white mb-4">Tactical Mentorship</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  1-on-1 code reviews and architecture audits. Get precise feedback from engineers who have built the tools you use.
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -10 }}
                className="glass-panel p-8 rounded-xl border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded flex items-center justify-center bg-white/10 text-white mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">rocket</span>
                </div>
                <h3 className="font-headline text-white mb-4">Industry-Ready Projects</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Build production-grade games and protocols. Our capstone projects are co-designed with top industry hiring partners.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Specializations (Bento Layout) */}
        <section className="py-stack-lg bg-primary-container">
          <div className="max-w-7xl mx-auto px-margin-x">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <span className="font-headline text-secondary-container uppercase tracking-widest text-xs">Active Tracks</span>
                <h2 className="font-headline text-headline-xl text-white mt-4">Featured Specializations</h2>
              </div>
              <button className="text-on-surface-variant hover:text-white flex items-center space-x-2 font-headline text-xs transition-colors group">
                <span>VIEW ALL COURSES</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">chevron_right</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Large Feature */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-8 relative group overflow-hidden rounded-xl border border-white/5 aspect-video md:aspect-auto md:h-[600px]"
              >
                <img alt="UE5 Engineering" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRBLeKhY5ZHezdNYZQEkNnUXKiKs0HBWsgro74epVRyxV3iZ3YPeYnVcbrifhRJAN_0zd_zXqgBOieYnMiWdb3ipFILDQO714CMFhdWgbQErpOANnJSjffmd4BehY_pcFUFCQtTOl7VBfsk1aWJ_F6dbP1T0vuFVENXH80Vvc3pPo6Sie71Z1SaUNnDKasOrgzrsnkbdA_NMjLrw-UxZsAO_luoDPTJH4rO2URTfuoyBkzCjNd_kEYEj92J_9eZFnr2QZ6wDgYNxAd"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-secondary-container text-on-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded">Game Dev</span>
                    <span className="text-white/60 text-[10px] font-headline">COHORT STARTS OCT 12</span>
                  </div>
                  <h3 className="font-headline text-3xl text-white mb-2">Unreal Engine 5: Architectural Systems</h3>
                  <p className="text-on-surface-variant text-sm max-w-lg mb-6">Advanced C++ implementation for large-scale open worlds and procedural generation.</p>
                  <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2 rounded text-xs font-bold hover:bg-white hover:text-black transition-colors uppercase tracking-widest">Enroll Now</button>
                </div>
              </motion.div>

              {/* Side Cards Wrapper */}
              <div className="md:col-span-4 flex flex-col gap-6">
                {/* Side Card 1 */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex-1 relative group overflow-hidden rounded-xl border border-white/5 min-h-[288px]"
                >
                  <img alt="DeFi Engineering" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGUFfyNLmi4qHg3QZUd-fc3xCMwHZPze1JwyGqUI4aslt8cs_tNg60ynKAwhF5u7FYyTsaMCJpwTeezMW9GNi9dggnkAFVu3SS6x3TREd6l7muR31QTYQq_G_oUn0O10AFFhN5nNUhOFqIb6n4BkljWZG2r0EmNajV4JAAbFbtTV8k4vsJMHcIhUjMQjfGM0_Q8fTpQ7E6kjjOAKRxudz4SPj2t1ySry6kBP3Y6AnQ5Vhc3q6UCnpu2XCAfiujomibp5r9t-xKAxle"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="bg-on-tertiary-container text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded mb-3 inline-block">Blockchain</span>
                    <h4 className="font-headline text-lg text-white">Advanced DeFi Protocols</h4>
                    <p className="text-white/60 text-xs mt-1">Mastering liquidity pools and AMM design.</p>
                  </div>
                </motion.div>

                {/* Side Card 2 */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 relative group overflow-hidden rounded-xl border border-white/5 min-h-[288px]"
                >
                  <img alt="3D Character Art" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDET74agfUy9_ZBsx1Lx3zWCgNocp05Px5zGI37z-dy8ah3l2k1okNPeVCnpjHguVBBYduz5lj8H8Vzi0EEQmgXlyA4EdkK-fLfnD9A1f0lEoZRGj7kthvNrHZkt7X-A7JB9sCqzc5tVBDbneG6F4vWXu07ZebLMW9YHJX1h8tzLgE2-DN-DvQcx9jKW8Fu0RJ7qH6cakHuvUA_ETNvmDbuoU4nhOIygqQe_6lYgUJMi5Hv7ME17jISqwK-78-CZFP44sOlO4EQa-fI"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="bg-secondary-container text-on-secondary px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded mb-3 inline-block">Game Dev</span>
                    <h4 className="font-headline text-lg text-white">Procedural Hard Surface Art</h4>
                    <p className="text-white/60 text-xs mt-1">Houdini and Substance Designer pipelines.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Terminal Section */}
        <section className="py-stack-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary-container/5 mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-margin-x relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-panel border-secondary-container/20 p-1 rounded-xl"
            >
              <div className="bg-black rounded-lg p-8 font-mono border border-white/5">
                <div className="flex items-center space-x-2 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  <span className="text-white/30 text-xs ml-4">pixora_admission.sh</span>
                </div>
                <div className="space-y-4 text-sm sm:text-base">
                  <p className="text-secondary-container flex items-center">
                    <span className="mr-3">$</span>
                    <span className="text-white">init_admission_sequence --track="ENGINEERING"</span>
                  </p>
                  <p className="text-slate-500">Scanning credentials...</p>
                  <p className="text-slate-500">Validating technical readiness...</p>
                  <p className="text-on-tertiary-container">[SUCCESS] Access granted to 2024 cohorts.</p>
                  <div className="pt-8">
                    <h2 className="text-headline text-white mb-6">Ready to initiate your sequence?</h2>
                    <div className="flex flex-wrap gap-4">
                      <a href="/role-selection" className="bg-secondary-container text-on-secondary px-6 py-3 rounded font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform inline-block">Begin Application</a>
                      <button className="text-white border border-white/20 px-6 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">Join Discord</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
