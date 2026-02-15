'use client';

import { useEffect, useState } from 'react';
import type { Property } from '@/lib/types';
import { getSimilarProperties } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, LoaderCircle } from 'lucide-react';

interface SimilarPropertiesProps {
  property: Property;
}

type Recommendation = {
  id: string;
  title: string;
  price: number;
  location: string;
  relevanceScore: number;
  reason: string;
};

export function SimilarProperties({ property }: SimilarPropertiesProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      setError(null);
      const result = await getSimilarProperties(property);
      if (result.success && result.data) {
        setRecommendations(result.data);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
      setLoading(false);
    }

    fetchRecommendations();
  }, [property]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-accent" />
          <span>AI-Powered Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            <span>Generating personalized recommendations...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && recommendations.length > 0 && (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border rounded-lg bg-secondary/50">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold">{rec.title}</h4>
                  <p className="font-bold text-primary">₹{rec.price.toLocaleString('en-IN')}</p>
                </div>
                <p className="text-sm text-muted-foreground">{rec.location}</p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Why it's a match:</span> {rec.reason}
                </p>
                <div className="text-xs text-right text-muted-foreground">
                  Relevance: {rec.relevanceScore}%
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && !error && recommendations.length === 0 && (
            <p className="text-muted-foreground">No similar properties found.</p>
        )}
      </CardContent>
    </Card>
  );
}
