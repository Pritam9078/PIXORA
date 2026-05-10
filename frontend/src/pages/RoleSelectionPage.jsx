import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Link } from 'react-router-dom';

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Access advanced blockchain engineering courses, participate in orbital hackathons, and earn verified skill-badges.',
    icon: 'school',
    color: 'accent-lime',
    link: '/signup/student'
  },
  {
    id: 'college-admin',
    title: 'College Admin',
    description: 'Manage institutional curriculum, oversee student progress, and integrate your campus with the Pixora global network.',
    icon: 'account_balance',
    color: 'accent-purple',
    link: '/application/college'
  },
  {
    id: 'instructor',
    title: 'Instructor',
    description: 'Architect high-fidelity learning modules, mentor the next generation of pioneers, and earn tokens based on mastery.',
    icon: 'terminal',
    color: 'white',
    link: '/application/instructor'
  },
  {
    id: 'partner',
    title: 'Partner',
    description: 'Recruit elite talent directly from the academy, sponsor research expeditions, and integrate your tech stack.',
    icon: 'hub',
    color: 'accent-lime',
    link: '/application/partner'
  }
];

const RoleSelectionPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-lime/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="flex-grow pt-32 pb-20 px-6 relative circuit-bg">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <span className="text-accent-lime font-headline text-[10px] tracking-[0.3em] uppercase mb-4 block">Initialization Phase // Terminal Alpha-01</span>
            <h2 className="font-headline text-headline-xl text-white mb-6 uppercase">Define Your Trajectory</h2>
            <p className="text-on-surface-variant max-w-2xl text-body-base mx-auto">
              Choose your identity within the Pixora ecosystem. Each path offers specialized protocols and direct access to the global engineering grid.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={role.link} className="glass-card p-8 h-full flex flex-col items-start text-left group">
                  <div className={`w-14 h-14 rounded-lg bg-${role.color}/10 flex items-center justify-center mb-8 border border-${role.color}/20 group-hover:border-${role.color}/50 transition-colors`}>
                    <span className={`material-symbols-outlined text-${role.color} text-3xl`}>
                      {role.icon}
                    </span>
                  </div>
                  <h3 className="font-headline text-xl text-white mb-4">{role.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
                    {role.description}
                  </p>
                  <div className={`w-full mt-auto py-4 px-6 border border-${role.color}/40 text-${role.color} font-headline text-[10px] uppercase tracking-widest group-hover:bg-secondary-container group-hover:text-on-secondary transition-all duration-300 text-center`}>
                    Select Path
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoleSelectionPage;
