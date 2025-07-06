
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ChallengeFormProps {
  userLeetcodeId: string;
}

export const ChallengeForm: React.FC<ChallengeFormProps> = ({ userLeetcodeId }) => {
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [dailyDays, setDailyDays] = useState('7');
  const [weeklyWeeks, setWeeklyWeeks] = useState('1');
  const [customQuestions, setCustomQuestions] = useState('');
  const [customDays, setCustomDays] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Calculate target count and end date based on goal type
      let targetCount = 0;
      let endDate = new Date();
      
      if (goalType === 'daily') {
        targetCount = parseInt(dailyDays);
        endDate.setDate(endDate.getDate() + parseInt(dailyDays));
      } else if (goalType === 'weekly') {
        targetCount = 15 * parseInt(weeklyWeeks);
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
      return `I will solve 1 question per day for ${dailyDays} days`;
    } else if (goalType === 'weekly') {
      return `I will solve 15 questions per week for ${weeklyWeeks} weeks`;
    } else {
      return `I will solve ${customQuestions || '___'} questions in ${customDays || '___'} days`;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" style={{ 
      backgroundColor: '#1A1A1A', 
      borderRadius: '16px', 
      padding: '24px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
      border: '1px solid #2A2A2A'
    }}>
      <CardHeader className="text-center pb-6">
        <CardTitle style={{ 
          fontSize: '2rem', 
          fontWeight: 700, 
          color: '#FFFFFF', 
          lineHeight: 1.2,
          marginBottom: '16px'
        }}>
          Challenge Yourself
        </CardTitle>
        <div className="text-xl" style={{ color: '#AAAAAA', lineHeight: 1.5 }}>
          I <span style={{ color: '#00FF7F', fontWeight: 500 }}>{userLeetcodeId}</span> bet I will...
        </div>
        <div className="mt-4 p-4 rounded-lg" style={{ 
          backgroundColor: '#0D0D0D', 
          border: '1px solid #2A2A2A',
          fontSize: '1.25rem',
          color: '#00FF7F',
          fontWeight: 500
        }}>
          {renderGoalDescription()}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '1rem' }}>
              Choose your goal type:
            </Label>
            <RadioGroup value={goalType} onValueChange={(value: 'daily' | 'weekly' | 'custom') => setGoalType(value)}>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ 
                  backgroundColor: goalType === 'daily' ? '#0D0D0D' : 'transparent',
                  border: `1px solid ${goalType === 'daily' ? '#00FF7F' : '#2A2A2A'}`
                }}>
                  <RadioGroupItem value="daily" id="daily" className="text-primary" />
                  <div className="flex-1 flex items-center gap-3">
                    <Label htmlFor="daily" style={{ color: '#FFFFFF', cursor: 'pointer' }}>
                      Daily Goal: I will solve 1 question per day for
                    </Label>
                    <Select value={dailyDays} onValueChange={setDailyDays} disabled={goalType !== 'daily'}>
                      <SelectTrigger className="w-20" style={{ 
                        backgroundColor: '#0D0D0D', 
                        border: '1px solid #2A2A2A',
                        color: '#FFFFFF'
                      }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="14">14</SelectItem>
                        <SelectItem value="21">21</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                      </SelectContent>
                    </Select>
                    <span style={{ color: '#AAAAAA' }}>days</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ 
                  backgroundColor: goalType === 'weekly' ? '#0D0D0D' : 'transparent',
                  border: `1px solid ${goalType === 'weekly' ? '#00FF7F' : '#2A2A2A'}`
                }}>
                  <RadioGroupItem value="weekly" id="weekly" className="text-primary" />
                  <div className="flex-1 flex items-center gap-3">
                    <Label htmlFor="weekly" style={{ color: '#FFFFFF', cursor: 'pointer' }}>
                      Weekly Goal: I will solve 15 questions per week for
                    </Label>
                    <Select value={weeklyWeeks} onValueChange={setWeeklyWeeks} disabled={goalType !== 'weekly'}>
                      <SelectTrigger className="w-16" style={{ 
                        backgroundColor: '#0D0D0D', 
                        border: '1px solid #2A2A2A',
                        color: '#FFFFFF'
                      }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                    <span style={{ color: '#AAAAAA' }}>weeks</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ 
                  backgroundColor: goalType === 'custom' ? '#0D0D0D' : 'transparent',
                  border: `1px solid ${goalType === 'custom' ? '#00FF7F' : '#2A2A2A'}`
                }}>
                  <RadioGroupItem value="custom" id="custom" className="text-primary" />
                  <div className="flex-1 flex items-center gap-3">
                    <Label htmlFor="custom" style={{ color: '#FFFFFF', cursor: 'pointer' }}>
                      Custom Goal: I will solve
                    </Label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={customQuestions}
                      onChange={(e) => setCustomQuestions(e.target.value)}
                      disabled={goalType !== 'custom'}
                      className="w-20"
                      style={{ 
                        backgroundColor: '#0D0D0D', 
                        border: '1px solid #2A2A2A',
                        color: '#FFFFFF'
                      }}
                    />
                    <span style={{ color: '#AAAAAA' }}>questions in</span>
                    <Input
                      type="number"
                      placeholder="30"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      disabled={goalType !== 'custom'}
                      className="w-20"
                      style={{ 
                        backgroundColor: '#0D0D0D', 
                        border: '1px solid #2A2A2A',
                        color: '#FFFFFF'
                      }}
                    />
                    <span style={{ color: '#AAAAAA' }}>days</span>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stake" style={{ color: '#FFFFFF', fontWeight: 500 }}>
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
                border: '1px solid #2A2A2A',
                borderRadius: '4px',
                padding: '8px 16px',
                color: '#FFFFFF',
                fontSize: '1rem'
              }}
            />
            <p style={{ color: '#AAAAAA', fontSize: '0.875rem' }}>
              This amount will be charged only if you fail to complete your challenge
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !stakeAmount}
            className="w-full"
            style={{
              backgroundColor: '#00FF7F',
              color: '#0D0D0D',
              borderRadius: '8px',
              padding: '0 16px',
              height: '48px',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              transition: 'all 150ms ease-in-out'
            }}
          >
            {isSubmitting ? 'Creating Challenge...' : 'Start Challenge'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
