
import React, { useState, useEffect } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { ChallengeForm } from '@/components/ChallengeForm';
import { ChallengeSidebar } from '@/components/ChallengeSidebar';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, User, Code2, Wallet, Sparkles } from 'lucide-react';
import { useFreighterWallet } from '@/hooks/useFreighterWallet';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [pastChallenges, setPastChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  
  const { 
    isWalletConnected, 
    publicKey, 
    isLoading: isWalletLoading, 
    error: walletError,
    connectWallet, 
    disconnectWallet 
  } = useFreighterWallet();

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleGetStarted = () => {
    setShowSignInDialog(true);
  };

  const handleLogin = async () => {
    // Connect Freighter wallet first
    await connectWallet();
    
    if (walletError) {
      alert('Please install Freighter wallet extension to continue');
      return;
    }
    
    // Mock login - in real app this would be Supabase Auth
    setUser({
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      leetcode_username: 'john_codes',
      wallet_address: publicKey
    });

    // Mock challenges data
    setActiveChallenges([
      {
        id: '1',
        goal_type: 'daily',
        target_count: 14,
        stake_amount: 500,
        start_date: '2025-01-01',
        end_date: '2025-01-15',
        status: 'active',
        current_progress: 8,
        progress_snapshots: [
          { date: '2025-01-01', questions_solved: 1 },
          { date: '2025-01-02', questions_solved: 2 },
          { date: '2025-01-03', questions_solved: 3 },
          { date: '2025-01-04', questions_solved: 4 },
          { date: '2025-01-05', questions_solved: 6 },
          { date: '2025-01-06', questions_solved: 7 },
          { date: '2025-01-07', questions_solved: 8 },
        ]
      }
    ]);

    setPastChallenges([
      {
        id: '2',
        goal_type: 'weekly',
        target_count: 15,
        stake_amount: 300,
        start_date: '2024-12-01',
        end_date: '2024-12-08',
        status: 'completed',
        current_progress: 16,
        progress_snapshots: [
          { date: '2024-12-01', questions_solved: 2 },
          { date: '2024-12-02', questions_solved: 4 },
          { date: '2024-12-03', questions_solved: 7 },
          { date: '2024-12-04', questions_solved: 9 },
          { date: '2024-12-05', questions_solved: 12 },
          { date: '2024-12-06', questions_solved: 14 },
          { date: '2024-12-07', questions_solved: 16 },
        ]
      }
    ]);

    setShowSignInDialog(false);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveChallenges([]);
    setPastChallenges([]);
    disconnectWallet();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="text-center">
          <Code2 className="w-12 h-12 mx-auto mb-4 animate-pulse" style={{ color: '#00FF7F' }} />
          <p style={{ color: '#AAAAAA', fontSize: '1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D0D' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-sm" style={{ 
        borderColor: '#2A2A2A', 
        padding: '16px 0',
        backgroundColor: 'rgba(13, 13, 13, 0.8)'
      }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8" style={{ color: '#00FF7F' }} />
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#FFFFFF' 
            }}>
              LeetCode Streak Bet
            </h1>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ 
                backgroundColor: 'rgba(0, 255, 127, 0.1)', 
                border: '1px solid rgba(0, 255, 127, 0.3)' 
              }}>
                <Wallet className="w-5 h-5" style={{ color: '#00FF7F' }} />
                <span style={{ color: '#00FF7F', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : 'Connecting...'}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                style={{
                  backgroundColor: 'transparent',
                  color: '#AAAAAA',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px'
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleGetStarted}
              style={{
                backgroundColor: '#00FF7F',
                color: '#0D0D0D',
                borderRadius: '8px',
                fontWeight: 600
              }}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Challenge Form */}
          <div className="xl:col-span-3">
            <ChallengeForm 
              userLeetcodeId={user?.leetcode_username || 'your_username'} 
              onGetStarted={handleGetStarted}
              isLoggedIn={!!user}
            />
          </div>
          
          {/* Challenge Sidebar */}
          {user && (
            <div className="xl:col-span-1">
              <ChallengeSidebar 
                activeChallenges={activeChallenges}
                pastChallenges={pastChallenges}
              />
            </div>
          )}
        </div>
      </main>

      {/* Sign In Dialog */}
      <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <DialogContent className="sm:max-w-md" style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: '16px'
        }}>
          <DialogHeader>
            <DialogTitle style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              Connect Your Freighter Wallet
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Wallet className="w-12 h-12" style={{ color: '#00FF7F' }} />
            </div>
            
            <p style={{ 
              color: '#AAAAAA', 
              fontSize: '1rem', 
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              Connect your Freighter wallet to stake XLM and start your coding challenge
            </p>
            
            {walletError && (
              <div className="p-3 rounded-lg mb-4" style={{ 
                backgroundColor: 'rgba(255, 0, 0, 0.1)', 
                border: '1px solid rgba(255, 0, 0, 0.3)' 
              }}>
                <p style={{ color: '#ff4444', fontSize: '0.9rem', textAlign: 'center' }}>
                  ⚠️ Please install the Freighter wallet extension
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                disabled={isWalletLoading}
                className="w-full"
                style={{
                  backgroundColor: '#00FF7F',
                  color: '#0D0D0D',
                  borderRadius: '12px',
                  padding: '0 24px',
                  height: '56px',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                <Wallet className="w-5 h-5 mr-3" />
                {isWalletLoading ? 'Connecting...' : 'Connect Freighter Wallet'}
              </Button>
              
              <p style={{ 
                color: '#666', 
                fontSize: '0.85rem', 
                textAlign: 'center',
                lineHeight: 1.5
              }}>
                Don't have Freighter?{' '}
                <a 
                  href="https://www.freighter.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#00FF7F', textDecoration: 'underline' }}
                >
                  Download it here
                </a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
