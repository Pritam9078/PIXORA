import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
