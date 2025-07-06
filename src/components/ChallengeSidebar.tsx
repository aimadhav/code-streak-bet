
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChallengeChart } from './ChallengeChart';
import { Calendar, Target, TrendingUp, Clock } from 'lucide-react';

interface Challenge {
  id: string;
  goal_type: 'daily' | 'weekly' | 'custom';
  target_count: number;
  stake_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'failed';
  current_progress: number;
  progress_snapshots: Array<{
    date: string;
    questions_solved: number;
  }>;
}

interface ChallengeSidebarProps {
  activeChallenges: Challenge[];
  pastChallenges: Challenge[];
}

export const ChallengeSidebar: React.FC<ChallengeSidebarProps> = ({
  activeChallenges,
  pastChallenges
}) => {
  const formatTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00FF7F';
      case 'completed': return '#28A745';
      case 'failed': return '#DC3545';
      default: return '#AAAAAA';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🎯';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const ChallengeCard: React.FC<{ challenge: Challenge; isActive: boolean }> = ({ challenge, isActive }) => (
    <Card className="mb-4" style={{ 
      backgroundColor: '#1A1A1A', 
      border: `1px solid ${isActive ? '#00FF7F' : '#2A2A2A'}`,
      borderRadius: '8px'
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle style={{ 
            fontSize: '1rem', 
            fontWeight: 500, 
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{getStatusIcon(challenge.status)}</span>
            {challenge.goal_type.charAt(0).toUpperCase() + challenge.goal_type.slice(1)} Goal
          </CardTitle>
          <Badge style={{ 
            backgroundColor: getStatusColor(challenge.status),
            color: '#0D0D0D',
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            {challenge.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm" style={{ color: '#AAAAAA' }}>
          <Target className="w-4 h-4" />
          <span>Solve {challenge.target_count} questions</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm" style={{ color: '#AAAAAA' }}>
          <Calendar className="w-4 h-4" />
          <span>Stake: ₹{challenge.stake_amount}</span>
        </div>
        
        {isActive && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#AAAAAA' }}>
            <Clock className="w-4 h-4" />
            <span>{formatTimeLeft(challenge.end_date)}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: '#AAAAAA' }}>Progress</span>
            <span style={{ color: '#FFFFFF' }}>
              {challenge.current_progress} / {challenge.target_count}
            </span>
          </div>
          <Progress 
            value={getProgressPercentage(challenge.current_progress, challenge.target_count)}
            className="h-2"
            style={{ backgroundColor: '#0D0D0D' }}
          />
        </div>
        
        {challenge.progress_snapshots && challenge.progress_snapshots.length > 0 && (
          <ChallengeChart 
            data={challenge.progress_snapshots}
            targetCount={challenge.target_count}
            title="📈 Your Progress"
          />
        )}
        
        {!isActive && (
          <div className="pt-2 border-t" style={{ borderColor: '#2A2A2A' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#AAAAAA' }}>
              <TrendingUp className="w-4 h-4" />
              <span>
                Completed on {new Date(challenge.end_date).toLocaleDateString()}
              </span>
            </div>
            {challenge.status === 'failed' && (
              <div className="text-sm mt-1" style={{ color: '#DC3545' }}>
                Autopay charged: ₹{challenge.stake_amount}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-md">
      <div className="space-y-6">
        <div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#FFFFFF', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎯 Active Challenges
          </h3>
          {activeChallenges.length > 0 ? (
            activeChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} isActive={true} />
            ))
          ) : (
            <Card style={{ 
              backgroundColor: '#1A1A1A', 
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#AAAAAA' }}>No active challenges</p>
              <p style={{ color: '#AAAAAA', fontSize: '0.875rem', marginTop: '8px' }}>
                Create your first challenge to get started!
              </p>
            </Card>
          )}
        </div>
        
        <div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#FFFFFF', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📚 Past Challenges
          </h3>
          {pastChallenges.length > 0 ? (
            pastChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} isActive={false} />
            ))
          ) : (
            <Card style={{ 
              backgroundColor: '#1A1A1A', 
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#AAAAAA' }}>No past challenges</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
