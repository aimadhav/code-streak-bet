
import React, { useState, useEffect } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { ChallengeForm } from '@/components/ChallengeForm';
import { ChallengeSidebar } from '@/components/ChallengeSidebar';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, User, Code2, Target, Clock, DollarSign, Sparkles } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [pastChallenges, setPastChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignInDialog, setShowSignInDialog] = useState(false);

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

  const handleLogin = () => {
    // Mock login - in real app this would be Supabase Auth
    setUser({
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      leetcode_username: 'john_codes'
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
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: '#AAAAAA' }} />
                <span style={{ color: '#FFFFFF', fontSize: '1rem' }}>
                  Welcome back, {user.name}
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
              Get Started
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
              Ready to Start Your Challenge?
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 p-4">
            <p style={{ 
              color: '#AAAAAA', 
              fontSize: '1rem', 
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              Sign in to create your first coding challenge and start your journey
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                className="w-full"
                style={{
                  backgroundColor: '#00FF7F',
                  color: '#0D0D0D',
                  borderRadius: '12px',
                  padding: '0 24px',
                  height: '48px',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Sign in with Google
              </Button>
              
              <Button
                onClick={handleLogin}
                variant="outline"
                className="w-full"
                style={{
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  border: '2px solid #2A2A2A',
                  borderRadius: '12px',
                  padding: '0 24px',
                  height: '48px',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Sign in with GitHub
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
