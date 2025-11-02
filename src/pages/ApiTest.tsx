/**
 * API Test Page
 * Quick test to verify LeetCode API integration
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { getLeetCodeProfile, getUserSubmissions } from '@/lib/leetcode-api';

export default function ApiTest() {
  const [username, setUsername] = useState('madhav');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [submissionsData, setSubmissionsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing API: /user/' + username);
      const data = await getLeetCodeProfile(username);
      console.log('Profile data:', data);
      setProfileData(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const testSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing API: /user/' + username + '/submissions');
      const data = await getUserSubmissions(username, 20);
      console.log('Submissions data:', data);
      setSubmissionsData(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const testDirect = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://leetcode-api-pied.vercel.app/user/${username}`;
      console.log('Direct fetch:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('Direct data:', data);
      setProfileData(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">LeetCode API Test</h1>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              LeetCode Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testProfile} disabled={loading}>
              Test Profile API
            </Button>
            <Button onClick={testSubmissions} disabled={loading}>
              Test Submissions API
            </Button>
            <Button onClick={testDirect} disabled={loading} variant="outline">
              Test Direct Fetch
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>API Base URL: https://leetcode-api-pied.vercel.app</p>
            <p>Endpoint: /user/{username}</p>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <h3 className="text-red-700 font-semibold mb-2">Error</h3>
          <pre className="text-sm text-red-600 whitespace-pre-wrap">
            {error}
          </pre>
        </Card>
      )}

      {profileData && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">Profile Data</h3>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </Card>
      )}

      {submissionsData && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            Recent Submissions ({submissionsData.length})
          </h3>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(submissionsData, null, 2)}
          </pre>
        </Card>
      )}

      {loading && (
        <div className="text-center text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  );
}
