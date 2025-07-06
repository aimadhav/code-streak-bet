
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    <div ref={formRef} id="challenge-form">
      <Card className="w-full max-w-4xl mx-auto" style={{ 
        backgroundColor: '#1A1A1A', 
        borderRadius: '20px', 
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid #2A2A2A'
      }}>
        <CardHeader className="text-center pb-8">
          <CardTitle style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            color: '#FFFFFF', 
            lineHeight: 1.2,
            marginBottom: '24px'
          }}>
            Challenge Yourself
          </CardTitle>
          <div className="text-xl mb-6" style={{ color: '#AAAAAA', lineHeight: 1.5 }}>
            I <span style={{ color: '#00FF7F', fontWeight: 600 }}>{userLeetcodeId}</span> bet I will...
          </div>
          <div className="p-6 rounded-xl" style={{ 
            backgroundColor: '#0D0D0D', 
            border: '2px solid #00FF7F',
            fontSize: '1.5rem',
            color: '#00FF7F',
            fontWeight: 600,
            boxShadow: '0 0 20px rgba(0, 255, 127, 0.2)'
          }}>
            {renderGoalDescription()}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <Label style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '1.25rem' }}>
                Choose your goal type:
              </Label>
              <RadioGroup value={goalType} onValueChange={(value: 'daily' | 'weekly' | 'custom') => setGoalType(value)}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-6 rounded-xl transition-all" style={{ 
                    backgroundColor: goalType === 'daily' ? 'rgba(0, 255, 127, 0.1)' : 'transparent',
                    border: `2px solid ${goalType === 'daily' ? '#00FF7F' : '#2A2A2A'}`
                  }}>
                    <RadioGroupItem value="daily" id="daily" className="text-primary w-5 h-5" />
                    <div className="flex-1 flex items-center gap-4 flex-wrap">
                      <Label htmlFor="daily" style={{ color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500 }}>
                        Daily Goal: I will solve
                      </Label>
                      <Input
                        type="number"
                        placeholder="1"
                        value={dailyQuestions}
                        onChange={(e) => setDailyQuestions(e.target.value)}
                        disabled={goalType !== 'daily'}
                        className="w-20"
                        style={{ 
                          backgroundColor: '#0D0D0D', 
                          border: '1px solid #2A2A2A',
                          color: '#FFFFFF',
                          textAlign: 'center'
                        }}
                      />
                      <span style={{ color: '#AAAAAA' }}>questions per day for</span>
                      <Input
                        type="number"
                        placeholder="7"
                        value={dailyDays}
                        onChange={(e) => setDailyDays(e.target.value)}
                        disabled={goalType !== 'daily'}
                        className="w-20"
                        style={{ 
                          backgroundColor: '#0D0D0D', 
                          border: '1px solid #2A2A2A',
                          color: '#FFFFFF',
                          textAlign: 'center'
                        }}
                      />
                      <span style={{ color: '#AAAAAA' }}>days</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-6 rounded-xl transition-all" style={{ 
                    backgroundColor: goalType === 'weekly' ? 'rgba(0, 255, 127, 0.1)' : 'transparent',
                    border: `2px solid ${goalType === 'weekly' ? '#00FF7F' : '#2A2A2A'}`
                  }}>
                    <RadioGroupItem value="weekly" id="weekly" className="text-primary w-5 h-5" />
                    <div className="flex-1 flex items-center gap-4 flex-wrap">
                      <Label htmlFor="weekly" style={{ color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500 }}>
                        Weekly Goal: I will solve
                      </Label>
                      <Input
                        type="number"
                        placeholder="15"
                        value={weeklyQuestions}
                        onChange={(e) => setWeeklyQuestions(e.target.value)}
                        disabled={goalType !== 'weekly'}
                        className="w-20"
                        style={{ 
                          backgroundColor: '#0D0D0D', 
                          border: '1px solid #2A2A2A',
                          color: '#FFFFFF',
                          textAlign: 'center'
                        }}
                      />
                      <span style={{ color: '#AAAAAA' }}>questions per week for</span>
                      <Input
                        type="number"
                        placeholder="1"
                        value={weeklyWeeks}
                        onChange={(e) => setWeeklyWeeks(e.target.value)}
                        disabled={goalType !== 'weekly'}
                        className="w-20"
                        style={{ 
                          backgroundColor: '#0D0D0D', 
                          border: '1px solid #2A2A2A',
                          color: '#FFFFFF',
                          textAlign: 'center'
                        }}
                      />
                      <span style={{ color: '#AAAAAA' }}>weeks</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-6 rounded-xl transition-all" style={{ 
                    backgroundColor: goalType === 'custom' ? 'rgba(0, 255, 127, 0.1)' : 'transparent',
                    border: `2px solid ${goalType === 'custom' ? '#00FF7F' : '#2A2A2A'}`
                  }}>
                    <RadioGroupItem value="custom" id="custom" className="text-primary w-5 h-5" />
                    <div className="flex-1 flex items-center gap-4 flex-wrap">
                      <Label htmlFor="custom" style={{ color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500 }}>
                        Custom Goal: I will solve
                      </Label>
                      <Input
                        type="number"
                        placeholder="30"
                        value={customQuestions}
                        onChange={(e) => setCustomQuestions(e.target.value)}
                        disabled={goalType !== 'custom'}
                        className="w-24"
                        style={{ 
                          backgroundColor: '#0D0D0D', 
                          border: '1px solid #2A2A2A',
                          color: '#FFFFFF',
                          textAlign: 'center'
                        }}
                      />
                      <span style={{ color: '#AAAAAA' }}>questions in</span>
                      <Input
                        type="number"
                        placeholder="30"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        disabled={goalType !== 'custom'}
                        className="w-24"
                        style={{ 
                          backgroundColor: '#0D0D0D', 
                          border: '1px solid #2A2A2A',
                          color: '#FFFFFF',
                          textAlign: 'center'
                        }}
                      />
                      <span style={{ color: '#AAAAAA' }}>days</span>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="stake" style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '1.1rem' }}>
                Stake Amount (₹)
              </Label>
              <Input
                id="stake"
                type="number"
                placeholder="500"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                required
                style={{ 
                  backgroundColor: '#0D0D0D', 
                  border: '2px solid #2A2A2A',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  color: '#FFFFFF',
                  fontSize: '1.1rem',
                  height: '56px'
                }}
              />
              <p style={{ color: '#AAAAAA', fontSize: '0.9rem', lineHeight: 1.5 }}>
                💡 This amount will be charged only if you fail to complete your challenge. Success means you keep your money!
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !stakeAmount}
              className="w-full text-lg font-semibold"
              style={{
                backgroundColor: '#00FF7F',
                color: '#0D0D0D',
                borderRadius: '16px',
                padding: '0 24px',
                height: '64px',
                boxShadow: '0 4px 20px rgba(0, 255, 127, 0.4)',
                transition: 'all 200ms ease'
              }}
            >
              {isSubmitting ? 'Creating Challenge...' : '🚀 Start My Challenge'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
