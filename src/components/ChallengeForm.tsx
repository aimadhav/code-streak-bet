
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, Target, Clock, Wallet, User } from 'lucide-react';
import { createChallengeTransaction, saveChallengeToStorage } from '@/lib/stellar';
import { getLeetCodeProfile } from '@/lib/leetcode-api';
import { useToast } from '@/hooks/use-toast';

interface ChallengeFormProps {
  userLeetcodeId: string;
  onGetStarted: () => void;
  isLoggedIn: boolean;
  publicKey?: string | null;
  signTransaction?: (xdr: string) => Promise<string>;
}

export const ChallengeForm: React.FC<ChallengeFormProps> = ({ 
  userLeetcodeId, 
  onGetStarted,
  isLoggedIn,
  publicKey,
  signTransaction
}) => {
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [dailyQuestions, setDailyQuestions] = useState('1');
  const [dailyDays, setDailyDays] = useState('7');
  const [weeklyQuestions, setWeeklyQuestions] = useState('15');
  const [weeklyWeeks, setWeeklyWeeks] = useState('1');
  const [customQuestions, setCustomQuestions] = useState('');
  const [customDays, setCustomDays] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState(userLeetcodeId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingUsername, setIsVerifyingUsername] = useState(false);
  const [usernameVerified, setUsernameVerified] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const verifyLeetCodeUsername = async () => {
    if (!leetcodeUsername || leetcodeUsername === 'your_username') {
      toast({
        title: "Invalid Username",
        description: "Please enter your LeetCode username",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingUsername(true);
    
    try {
      const profile = await getLeetCodeProfile(leetcodeUsername);
      
      setUsernameVerified(true);
      toast({
        title: "Username Verified! ✓",
        description: `Connected to ${profile.username}'s LeetCode profile`,
      });
    } catch (error: any) {
      setUsernameVerified(false);
      toast({
        title: "Verification Failed",
        description: "Username not found. Please check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      onGetStarted();
      return;
    }
    
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet to create a challenge",
        variant: "destructive",
      });
      return;
    }

    if (!usernameVerified) {
      toast({
        title: "Verify Username",
        description: "Please verify your LeetCode username first",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate target count and end date based on goal type
      let targetCount = 0;
      let endDate = new Date();
      const startDate = new Date();
      let dailyQuestionsValue = 0;
      let weeklyQuestionsValue = 0;
      let weeksValue = 0;
      
      if (goalType === 'daily') {
        dailyQuestionsValue = parseInt(dailyQuestions);
        targetCount = dailyQuestionsValue * parseInt(dailyDays);
        endDate.setDate(endDate.getDate() + parseInt(dailyDays));
      } else if (goalType === 'weekly') {
        weeklyQuestionsValue = parseInt(weeklyQuestions);
        weeksValue = parseInt(weeklyWeeks);
        targetCount = weeklyQuestionsValue * weeksValue;
        endDate.setDate(endDate.getDate() + (weeksValue * 7));
      } else {
        targetCount = parseInt(customQuestions);
        endDate.setDate(endDate.getDate() + parseInt(customDays));
      }

      // Generate unique challenge ID
      const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      console.log('Creating challenge on Stellar blockchain:', {
        challengeId,
        goalType,
        targetCount,
        stakeAmount,
        leetcodeUsername,
        endDate: endDate.toISOString(),
      });
      
      // Create XLM staking transaction
      toast({
        title: "Processing Transaction",
        description: "Creating XLM staking transaction...",
      });

      const xdr = await createChallengeTransaction(
        publicKey,
        stakeAmount,
        challengeId,
        {
          targetCount,
          endDate: endDate.toISOString(),
          goalType,
        }
      );

      // Sign and submit transaction
      toast({
        title: "Signing Transaction",
        description: "Please approve the transaction in Freighter",
      });

      const txHash = await signTransaction(xdr);

      // Save challenge data locally
      saveChallengeToStorage({
        id: challengeId,
        userId: publicKey,
        leetcodeUsername,
        publicKey,
        goalType,
        targetCount,
        dailyQuestions: dailyQuestionsValue || undefined,
        weeklyQuestions: weeklyQuestionsValue || undefined,
        weeks: weeksValue || undefined,
        stakeAmount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        transactionHash: txHash,
        currentProgress: 0,
        createdAt: new Date().toISOString(),
      });

      console.log('Challenge created successfully:', { txHash, challengeId });

      toast({
        title: "Challenge Created! 🎉",
        description: `Your ${stakeAmount} XLM has been staked. Start solving problems now!`,
        duration: 5000,
      });

      // Reset form
      setStakeAmount('');
      setGoalType('daily');
      setDailyQuestions('1');
      setDailyDays('7');
      
      // Reload the page to show the new challenge
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGoalDescription = () => {
    if (goalType === 'daily') {
      return `I will solve ${dailyQuestions} ${parseInt(dailyQuestions) === 1 ? 'question' : 'questions'} per day for ${dailyDays} days`;
    } else if (goalType === 'weekly') {
      return `I will solve ${weeklyQuestions} questions per week for ${weeklyWeeks} ${parseInt(weeklyWeeks) === 1 ? 'week' : 'weeks'}`;
    } else {
      return `I will solve ${customQuestions || '___'} questions in ${customDays || '___'} days`;
    }
  };

  const handleCardClick = (type: 'daily' | 'weekly' | 'custom') => {
    if (!isLoggedIn) {
      onGetStarted();
      return;
    }
    setGoalType(type);
  };

  return (
    <div ref={formRef} id="challenge-form" className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Challenge Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" 
               style={{ backgroundColor: 'rgba(0, 255, 127, 0.1)', border: '1px solid rgba(0, 255, 127, 0.3)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#00FF7F' }} />
            <span style={{ color: '#00FF7F', fontSize: '0.875rem', fontWeight: 500 }}>
              Time to level up
            </span>
          </div>
          
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: 700, 
            color: '#FFFFFF', 
            lineHeight: 1.1,
            marginBottom: '16px'
          }}>
            Challenge Yourself
          </h2>
          
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#AAAAAA', 
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Set your coding goals, put money on the line, and watch your skills soar
          </p>
        </div>

        <Card className="w-full max-w-4xl mx-auto" style={{ 
          backgroundColor: '#1A1A1A', 
          borderRadius: '24px', 
          padding: '0',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid #2A2A2A',
          overflow: 'hidden'
        }}>
          {/* Commitment Banner */}
          <div className="relative p-8 text-center" style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.1) 0%, rgba(0, 255, 127, 0.05) 100%)',
            borderBottom: '1px solid #2A2A2A'
          }}>
            <div className="absolute top-4 left-4">
              <Target className="w-5 h-5" style={{ color: '#00FF7F' }} />
            </div>
            
            <div className="text-lg mb-4" style={{ color: '#AAAAAA' }}>
              I <span style={{ 
                color: '#00FF7F', 
                fontWeight: 600,
                background: 'rgba(0, 255, 127, 0.1)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>{userLeetcodeId}</span> commit to...
            </div>
            
            <div className="p-6 rounded-xl text-center" style={{ 
              backgroundColor: '#0D0D0D', 
              border: '2px solid #00FF7F',
              fontSize: '1.25rem',
              color: '#00FF7F',
              fontWeight: 600,
              boxShadow: '0 0 30px rgba(0, 255, 127, 0.2)',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {renderGoalDescription()}
            </div>
          </div>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Goal Type Selection */}
              <div className="space-y-6">
                <Label style={{ 
                  color: '#FFFFFF', 
                  fontWeight: 600, 
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Clock className="w-5 h-5" style={{ color: '#00FF7F' }} />
                  Choose your commitment:
                </Label>
                
                <div className="grid gap-4">
                  {/* Daily Goal */}
                  <div 
                    className={`p-6 rounded-xl transition-all duration-300 cursor-pointer ${
                      goalType === 'daily' 
                        ? 'bg-gradient-to-r from-green-500/10 to-green-400/5 border-2 border-green-500 shadow-lg shadow-green-500/20' 
                        : 'bg-zinc-900/50 border-2 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                    onClick={() => handleCardClick('daily')}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          goalType === 'daily' 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-zinc-500'
                        }`} />
                        <Label style={{ 
                          color: '#FFFFFF', 
                          cursor: 'pointer', 
                          fontSize: '1.1rem', 
                          fontWeight: 500 
                        }}>
                          Daily Consistency
                        </Label>
                      </div>
                      
                      {isLoggedIn && goalType === 'daily' && (
                        <div className="flex items-center gap-4 flex-wrap">
                          <span style={{ color: '#AAAAAA' }}>I will solve</span>
                          <Input
                            type="number"
                            placeholder="1"
                            value={dailyQuestions}
                            onChange={(e) => setDailyQuestions(e.target.value)}
                            className="w-20 text-center"
                            style={{ 
                              backgroundColor: '#0D0D0D', 
                              border: '1px solid #2A2A2A',
                              color: '#FFFFFF',
                              borderRadius: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span style={{ color: '#AAAAAA' }}>questions per day for</span>
                          <Input
                            type="number"
                            placeholder="7"
                            value={dailyDays}
                            onChange={(e) => setDailyDays(e.target.value)}
                            className="w-20 text-center"
                            style={{ 
                              backgroundColor: '#0D0D0D', 
                              border: '1px solid #2A2A2A',
                              color: '#FFFFFF',
                              borderRadius: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span style={{ color: '#AAAAAA' }}>days</span>
                        </div>
                      )}
                      
                      <p className="text-sm" style={{ color: '#666' }}>
                        Perfect for building daily coding habits
                      </p>
                    </div>
                  </div>

                  {/* Weekly Goal */}
                  <div 
                    className={`p-6 rounded-xl transition-all duration-300 cursor-pointer ${
                      goalType === 'weekly' 
                        ? 'bg-gradient-to-r from-green-500/10 to-green-400/5 border-2 border-green-500 shadow-lg shadow-green-500/20' 
                        : 'bg-zinc-900/50 border-2 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                    onClick={() => handleCardClick('weekly')}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          goalType === 'weekly' 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-zinc-500'
                        }`} />
                        <Label style={{ 
                          color: '#FFFFFF', 
                          cursor: 'pointer', 
                          fontSize: '1.1rem', 
                          fontWeight: 500 
                        }}>
                          Weekly Target
                        </Label>
                      </div>
                      
                      {isLoggedIn && goalType === 'weekly' && (
                        <div className="flex items-center gap-4 flex-wrap">
                          <span style={{ color: '#AAAAAA' }}>I will solve</span>
                          <Input
                            type="number"
                            placeholder="15"
                            value={weeklyQuestions}
                            onChange={(e) => setWeeklyQuestions(e.target.value)}
                            className="w-20 text-center"
                            style={{ 
                              backgroundColor: '#0D0D0D', 
                              border: '1px solid #2A2A2A',
                              color: '#FFFFFF',
                              borderRadius: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span style={{ color: '#AAAAAA' }}>questions per week for</span>
                          <Input
                            type="number"
                            placeholder="1"
                            value={weeklyWeeks}
                            onChange={(e) => setWeeklyWeeks(e.target.value)}
                            className="w-20 text-center"
                            style={{ 
                              backgroundColor: '#0D0D0D', 
                              border: '1px solid #2A2A2A',
                              color: '#FFFFFF',
                              borderRadius: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span style={{ color: '#AAAAAA' }}>weeks</span>
                        </div>
                      )}
                      
                      <p className="text-sm" style={{ color: '#666' }}>
                        Flexible weekly goals with room to breathe
                      </p>
                    </div>
                  </div>

                  {/* Custom Goal */}
                  <div 
                    className={`p-6 rounded-xl transition-all duration-300 cursor-pointer ${
                      goalType === 'custom' 
                        ? 'bg-gradient-to-r from-green-500/10 to-green-400/5 border-2 border-green-500 shadow-lg shadow-green-500/20' 
                        : 'bg-zinc-900/50 border-2 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                    onClick={() => handleCardClick('custom')}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          goalType === 'custom' 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-zinc-500'
                        }`} />
                        <Label style={{ 
                          color: '#FFFFFF', 
                          cursor: 'pointer', 
                          fontSize: '1.1rem', 
                          fontWeight: 500 
                        }}>
                          Custom Challenge
                        </Label>
                      </div>
                      
                      {isLoggedIn && goalType === 'custom' && (
                        <div className="flex items-center gap-4 flex-wrap">
                          <span style={{ color: '#AAAAAA' }}>I will solve</span>
                          <Input
                            type="number"
                            placeholder="30"
                            value={customQuestions}
                            onChange={(e) => setCustomQuestions(e.target.value)}
                            className="w-24 text-center"
                            style={{ 
                              backgroundColor: '#0D0D0D', 
                              border: '1px solid #2A2A2A',
                              color: '#FFFFFF',
                              borderRadius: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span style={{ color: '#AAAAAA' }}>questions in</span>
                          <Input
                            type="number"
                            placeholder="30"
                            value={customDays}
                            onChange={(e) => setCustomDays(e.target.value)}
                            className="w-24 text-center"
                            style={{ 
                              backgroundColor: '#0D0D0D', 
                              border: '1px solid #2A2A2A',
                              color: '#FFFFFF',
                              borderRadius: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span style={{ color: '#AAAAAA' }}>days</span>
                        </div>
                      )}
                      
                      <p className="text-sm" style={{ color: '#666' }}>
                        Design your own challenge timeline
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* LeetCode Username Verification - Only show if logged in */}
              {isLoggedIn && (
                <div className="space-y-4">
                  <Label htmlFor="leetcode-username" style={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600, 
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <User className="w-5 h-5" style={{ color: '#00FF7F' }} />
                    LeetCode Username
                  </Label>
                  
                  <div className="flex gap-3">
                    <Input
                      id="leetcode-username"
                      type="text"
                      placeholder="your_leetcode_username"
                      value={leetcodeUsername}
                      onChange={(e) => {
                        setLeetcodeUsername(e.target.value);
                        setUsernameVerified(false);
                      }}
                      required
                      className="flex-1"
                      style={{ 
                        backgroundColor: '#0D0D0D', 
                        border: usernameVerified ? '2px solid #00FF7F' : '2px solid #2A2A2A',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        color: '#FFFFFF',
                        fontSize: '1rem',
                        height: '56px'
                      }}
                    />
                    <Button
                      type="button"
                      onClick={verifyLeetCodeUsername}
                      disabled={isVerifyingUsername || !leetcodeUsername || leetcodeUsername === 'your_username'}
                      style={{
                        backgroundColor: usernameVerified ? '#00FF7F' : '#2A2A2A',
                        color: usernameVerified ? '#0D0D0D' : '#FFFFFF',
                        borderRadius: '12px',
                        padding: '0 24px',
                        height: '56px',
                        minWidth: '120px',
                        fontWeight: 600,
                      }}
                    >
                      {isVerifyingUsername ? 'Verifying...' : usernameVerified ? 'Verified ✓' : 'Verify'}
                    </Button>
                  </div>
                  
                  <p style={{ color: '#666', fontSize: '0.875rem' }}>
                    We'll track your LeetCode submissions to verify challenge completion
                  </p>
                </div>
              )}

              {/* Stake Amount - Only show if logged in */}
              {isLoggedIn && (
                <div className="space-y-4">
                  <Label htmlFor="stake" style={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600, 
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Wallet className="w-5 h-5" style={{ color: '#00FF7F' }} />
                    Your stake (XLM)
                  </Label>
                  
                  <div className="relative">
                    <Input
                      id="stake"
                      type="number"
                      placeholder="10"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      required
                      step="0.01"
                      min="1"
                      className="text-xl font-medium"
                      style={{ 
                        backgroundColor: '#0D0D0D', 
                        border: '2px solid #2A2A2A',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        color: '#FFFFFF',
                        fontSize: '1.25rem',
                        height: '64px'
                      }}
                    />
                  </div>
                  
                  <div className="p-4 rounded-xl" style={{ 
                    backgroundColor: 'rgba(0, 255, 127, 0.05)', 
                    border: '1px solid rgba(0, 255, 127, 0.2)' 
                  }}>
                    <p style={{ color: '#00FF7F', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      💡 <strong>How it works:</strong> Your XLM is locked in a smart contract. If you fail to complete your challenge, 
                      you lose your stake. Success means you get everything back plus the satisfaction of achieving your goal!
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || (isLoggedIn && !stakeAmount)}
                  className="w-full text-xl font-semibold relative overflow-hidden group"
                  style={{
                    backgroundColor: '#00FF7F',
                    color: '#0D0D0D',
                    borderRadius: '16px',
                    padding: '0 32px',
                    height: '72px',
                    boxShadow: '0 8px 32px rgba(0, 255, 127, 0.4)',
                    transition: 'all 300ms ease',
                    border: 'none'
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    {!isLoggedIn 
                      ? 'Sign In to Start Challenge' 
                      : isSubmitting 
                        ? 'Creating Your Challenge...' 
                        : 'Start My Challenge'
                    }
                  </div>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
