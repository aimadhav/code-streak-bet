
import React from 'react';
import { Button } from "@/components/ui/button";
import { Code2, Target, TrendingUp, Calendar } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: '#0D0D0D', padding: '80px 0 120px' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full border border-green-500"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full border border-green-500"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full border border-green-500"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        {/* Logo/Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" 
             style={{ backgroundColor: 'rgba(0, 255, 127, 0.1)', border: '1px solid rgba(0, 255, 127, 0.3)' }}>
          <Code2 className="w-4 h-4" style={{ color: '#00FF7F' }} />
          <span style={{ color: '#00FF7F', fontSize: '0.875rem', fontWeight: 500 }}>
            From accountability comes greatness
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="mb-6" style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          fontWeight: 700, 
          color: '#FFFFFF', 
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          maxWidth: '800px',
          margin: '0 auto 24px'
        }}>
          Empowering Your <span style={{ color: '#00FF7F' }}>Coding Journey</span> for Success
        </h1>

        {/* Subtitle */}
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#AAAAAA', 
          lineHeight: 1.6,
          maxWidth: '600px',
          margin: '0 auto 48px'
        }}>
          Put your money where your commitment is. Set coding goals, track your progress, and stay accountable with financial stakes.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <Button
            onClick={onGetStarted}
            className="px-8 py-3 text-lg font-medium"
            style={{
              backgroundColor: '#00FF7F',
              color: '#0D0D0D',
              borderRadius: '12px',
              height: '56px',
              boxShadow: '0 4px 16px rgba(0, 255, 127, 0.3)',
              transition: 'all 200ms ease'
            }}
          >
            Start Challenge
          </Button>
          
          <Button
            variant="outline"
            className="px-8 py-3 text-lg font-medium"
            style={{
              backgroundColor: 'transparent',
              color: '#FFFFFF',
              border: '2px solid #2A2A2A',
              borderRadius: '12px',
              height: '56px'
            }}
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-lg" 
                 style={{ backgroundColor: 'rgba(0, 255, 127, 0.1)' }}>
              <Target className="w-6 h-6" style={{ color: '#00FF7F' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              10K+
            </div>
            <div style={{ fontSize: '0.875rem', color: '#AAAAAA' }}>
              Challenges Created
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-lg" 
                 style={{ backgroundColor: 'rgba(0, 255, 127, 0.1)' }}>
              <TrendingUp className="w-6 h-6" style={{ color: '#00FF7F' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              85%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#AAAAAA' }}>
              Success Rate
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-lg" 
                 style={{ backgroundColor: 'rgba(0, 255, 127, 0.1)' }}>
              <Calendar className="w-6 h-6" style={{ color: '#00FF7F' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              30+
            </div>
            <div style={{ fontSize: '0.875rem', color: '#AAAAAA' }}>
              Days Average Streak
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-lg" 
                 style={{ backgroundColor: 'rgba(0, 255, 127, 0.1)' }}>
              <Code2 className="w-6 h-6" style={{ color: '#00FF7F' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              50K+
            </div>
            <div style={{ fontSize: '0.875rem', color: '#AAAAAA' }}>
              Problems Solved
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
