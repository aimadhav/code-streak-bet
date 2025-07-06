
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Target, Clock, DollarSign } from 'lucide-react';

interface ChallengeFormProps {
  userLeetcodeId: string;
}

export const ChallengeForm: React.FC<ChallengeFormProps> = ({ userLeetcodeId }) => {
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [dailyQuestions, setDailyQuestions] = useState('1');
  const [dailyDays, setDailyDays] = useState('7');
  const [weeklyQuestions, setWeeklyQuestions] = useState('15');
  const [weeklyWeeks, setWeeklyWeeks] = useState('1');
  const [customQuestions, setCustomQuestions] = useState('');
  const [customDays, setCustomDays] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Calculate target count and end date based on goal type
      let targetCount = 0;
      let endDate = new Date();
      
      if (goalType === 'daily') {
        targetCount = parseInt(dailyQuestions) * parseInt(dailyDays);
        endDate.setDate(endDate.getDate() + parseInt(dailyDays));
      } else if (goalType === 'weekly') {
        targetCount = parseInt(weeklyQuestions) * parseInt(weeklyWeeks);
        endDate.setDate(endDate.getDate() + (parseInt(weeklyWeeks) * 7));
      } else {
        targetCount = parseInt(customQuestions);
        endDate.setDate(endDate.getDate() + parseInt(customDays));
      }

      // TODO: Save to Supabase and redirect to Stripe
      console.log('Challenge data:', {
        goalType,
        targetCount,
        stakeAmount,
        endDate: endDate.toISOString(),
      });
      
      // Placeholder for Stripe integration
      alert('Challenge created! Redirecting to payment setup...');
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
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
                
                <RadioGroup value={goalType} onValueChange={(value: 'daily' | 'weekly' | 'custom') => setGoalType(value)}>
                  <div className="grid gap-4">
                    {/* Daily Goal */}
                    <div className="relative group">
                      <div className={`p-6 rounded-xl transition-all duration-300 cursor-pointer ${
                        goalType === 'daily' 
                          ? 'bg-gradient-to-r from-green-500/10 to-green-400/5 border-2 border-green-500 shadow-lg shadow-green-500/20' 
                          : 'bg-zinc-900/50 border-2 border-zinc-800 hover:border-zinc-700'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <RadioGroupItem value="daily" id="daily" className="text-primary w-5 h-5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-4 flex-wrap">
                              <Label htmlFor="daily" style={{ 
                                color: '#FFFFFF', 
                                cursor: 'pointer', 
                                fontSize: '1.1rem', 
                                fontWeight: 500 
                              }}>
                                Daily Consistency: I will solve
                              </Label>
                              <Input
                                type="number"
                                placeholder="1"
                                value={dailyQuestions}
                                onChange={(e) => setDailyQuestions(e.target.value)}
                                disabled={goalType !== 'daily'}
                                className="w-20 text-center"
                                style={{ 
                                  backgroundColor: '#0D0D0D', 
                                  border: '1px solid #2A2A2A',
                                  color: '#FFFFFF',
                                  borderRadius: '8px'
                                }}
                              />
                              <span style={{ color: '#AAAAAA' }}>questions per day for</span>
                              <Input
                                type="number"
                                placeholder="7"
                                value={dailyDays}
                                onChange={(e) => setDailyDays(e.target.value)}
                                disabled={goalType !== 'daily'}
                                className="w-20 text-center"
                                style={{ 
                                  backgroundColor: '#0D0D0D', 
                                  border: '1px solid #2A2A2A',
                                  color: '#FFFFFF',
                                  borderRadius: '8px'
                                }}
                              />
                              <span style={{ color: '#AAAAAA' }}>days</span>
                            </div>
                            <p className="text-sm mt-2" style={{ color: '#666' }}>
                              Perfect for building daily coding habits
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Goal */}
                    <div className="relative group">
                      <div className={`p-6 rounded-xl transition-all duration-300 cursor-pointer ${
                        goalType === 'weekly' 
                          ? 'bg-gradient-to-r from-green-500/10 to-green-400/5 border-2 border-green-500 shadow-lg shadow-green-500/20' 
                          : 'bg-zinc-900/50 border-2 border-zinc-800 hover:border-zinc-700'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <RadioGroupItem value="weekly" id="weekly" className="text-primary w-5 h-5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-4 flex-wrap">
                              <Label htmlFor="weekly" style={{ 
                                color: '#FFFFFF', 
                                cursor: 'pointer', 
                                fontSize: '1.1rem', 
                                fontWeight: 500 
                              }}>
                                Weekly Target: I will solve
                              </Label>
                              <Input
                                type="number"
                                placeholder="15"
                                value={weeklyQuestions}
                                onChange={(e) => setWeeklyQuestions(e.target.value)}
                                disabled={goalType !== 'weekly'}
                                className="w-20 text-center"
                                style={{ 
                                  backgroundColor: '#0D0D0D', 
                                  border: '1px solid #2A2A2A',
                                  color: '#FFFFFF',
                                  borderRadius: '8px'
                                }}
                              />
                              <span style={{ color: '#AAAAAA' }}>questions per week for</span>
                              <Input
                                type="number"
                                placeholder="1"
                                value={weeklyWeeks}
                                onChange={(e) => setWeeklyWeeks(e.target.value)}
                                disabled={goalType !== 'weekly'}
                                className="w-20 text-center"
                                style={{ 
                                  backgroundColor: '#0D0D0D', 
                                  border: '1px solid #2A2A2A',
                                  color: '#FFFFFF',
                                  borderRadius: '8px'
                                }}
                              />
                              <span style={{ color: '#AAAAAA' }}>weeks</span>
                            </div>
                            <p className="text-sm mt-2" style={{ color: '#666' }}>
                              Flexible weekly goals with room to breathe
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Custom Goal */}
                    <div className="relative group">
                      <div className={`p-6 rounded-xl transition-all duration-300 cursor-pointer ${
                        goalType === 'custom' 
                          ? 'bg-gradient-to-r from-green-500/10 to-green-400/5 border-2 border-green-500 shadow-lg shadow-green-500/20' 
                          : 'bg-zinc-900/50 border-2 border-zinc-800 hover:border-zinc-700'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <RadioGroupItem value="custom" id="custom" className="text-primary w-5 h-5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-4 flex-wrap">
                              <Label htmlFor="custom" style={{ 
                                color: '#FFFFFF', 
                                cursor: 'pointer', 
                                fontSize: '1.1rem', 
                                fontWeight: 500 
                              }}>
                                Custom Challenge: I will solve
                              </Label>
                              <Input
                                type="number"
                                placeholder="30"
                                value={customQuestions}
                                onChange={(e) => setCustomQuestions(e.target.value)}
                                disabled={goalType !== 'custom'}
                                className="w-24 text-center"
                                style={{ 
                                  backgroundColor: '#0D0D0D', 
                                  border: '1px solid #2A2A2A',
                                  color: '#FFFFFF',
                                  borderRadius: '8px'
                                }}
                              />
                              <span style={{ color: '#AAAAAA' }}>questions in</span>
                              <Input
                                type="number"
                                placeholder="30"
                                value={customDays}
                                onChange={(e) => setCustomDays(e.target.value)}
                                disabled={goalType !== 'custom'}
                                className="w-24 text-center"
                                style={{ 
                                  backgroundColor: '#0D0D0D', 
                                  border: '1px solid #2A2A2A',
                                  color: '#FFFFFF',
                                  borderRadius: '8px'
                                }}
                              />
                              <span style={{ color: '#AAAAAA' }}>days</span>
                            </div>
                            <p className="text-sm mt-2" style={{ color: '#666' }}>
                              Design your own challenge timeline
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Stake Amount */}
              <div className="space-y-4">
                <Label htmlFor="stake" style={{ 
                  color: '#FFFFFF', 
                  fontWeight: 600, 
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <DollarSign className="w-5 h-5" style={{ color: '#00FF7F' }} />
                  Your stake (₹)
                </Label>
                
                <div className="relative">
                  <Input
                    id="stake"
                    type="number"
                    placeholder="500"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    required
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
                    💡 <strong>How it works:</strong> This amount is only charged if you fail to complete your challenge. 
                    Success means you keep every rupee and gain the satisfaction of achieving your goal!
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !stakeAmount}
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
                    {isSubmitting ? 'Creating Your Challenge...' : 'Start My Challenge'}
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
