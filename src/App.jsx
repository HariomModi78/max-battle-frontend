import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterOtp from './pages/RegisterOtp';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Leaderboard from './pages/Leaderboard';
import TournamentDetail from './pages/TournamentDetail';
import TournamentSlot from './pages/TournamentSlot';
import TournamentPayment from './pages/TournamentPayment';
import Transaction from './pages/Transaction';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Notification from './pages/NotificationPage';
import SpinWheel from './pages/SpinWheel';
import ReferAndEarn from './pages/ReferAndEarn';
import MyTournaments from './pages/MyTournaments';
import Tournaments from './pages/Tournaments';
import AdminPanel from './pages/AdminPanel';
import AdminCreateTournament from './pages/AdminCreateTournament';
import AdminEditTournament from './pages/AdminEditTournament';
import AdminTotalUser from './pages/AdminTotalUser';
import AdminTotalTournament from './pages/AdminTotalTournament';
import AdminPrizeDistribution from './pages/AdminPrizeDistribution';
import AdminSendEmail from './pages/AdminSendEmail';
import PendingWithdrawRequest from './pages/PendingWithdrawRequest';
import MonthlyPrizeDistribution from './pages/MonthlyPrizeDistribution';
import ErrorPage from './pages/ErrorPage';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndCondition from './pages/TermsAndCondition';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-otp" element={<RegisterOtp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/tournament/detail/:tournamentId" element={<TournamentDetail />} />
      <Route path="/tournament/slot/:tournamentId" element={<TournamentSlot />} />
      <Route path="/tournament/payment/:tournamentId/:slotNumber" element={<TournamentPayment />} />
      <Route path="/transaction" element={<Transaction />} />
      <Route path="/deposit" element={<Deposit />} />
      <Route path="/withdraw" element={<Withdraw />} />
      <Route path="/notification" element={<Notification />} />
      <Route path="/spin" element={<SpinWheel />} />
      <Route path="/referAndEarn" element={<ReferAndEarn />} />
      <Route path="/my-tournaments" element={<MyTournaments />} />
      <Route path="/tournaments" element={<Tournaments />} />

      {/* Admin Routes */}
      <Route path="/adminPanel/:adminId" element={<AdminPanel />} />
      <Route path="/adminCreateTournament/:adminId" element={<AdminCreateTournament />} />
      <Route path="/adminEditTournament/:adminId/:tournamentId" element={<AdminEditTournament />} />
      <Route path="/adminTotalUser/:adminId" element={<AdminTotalUser />} />
      <Route path="/admin/tournament/:status/:adminId" element={<AdminTotalTournament />} />
      <Route path="/adminPrizeDistribute/:adminId/:tournamentId" element={<AdminPrizeDistribution />} />
      <Route path="/adminSendEmail/:adminId" element={<AdminSendEmail />} />
      <Route path="/pendingWithdrawRequest/:adminId" element={<PendingWithdrawRequest />} />
      <Route path="/monthlyPrizeDistribution/verification/:adminId" element={<MonthlyPrizeDistribution />} />

      {/* Static Pages */}
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/termsAndCondition" element={<TermsAndCondition />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

function DesktopLayout({ sidebarOpen, setSidebarOpen, user }) {
  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex h-screen">
        {user && <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
        <div className={`${user ? 'flex-1' : 'w-full'} flex flex-col overflow-hidden`}>
          <Header isDesktop={true} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-secondary-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <AppRoutes />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function MobileLayout({ sidebarOpen, setSidebarOpen, user }) {
  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex flex-col min-h-screen">
        <Header
          isDesktop={false}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuIcon={user ? true : false}
        />
        <main className="flex-1 overflow-y-auto">
          <AppRoutes />
        </main>
        {user && (
          <Sidebar
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            isMobile={true}
          />
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <>
      {isDesktop ? (
        <DesktopLayout
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
        />
      ) : (
        <MobileLayout
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;