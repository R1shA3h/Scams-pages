import { useEffect, useState } from 'react';
import { GeoDistributionItem } from '@/lib/types/api.types';
import { fetchGeoDistribution } from '@/lib/api/geo-distribution';
import { IndiaHeatmap } from './IndiaHeatmap';

export function GeoDistribution() {
  const [data, setData] = useState<GeoDistributionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchGeoDistribution();
        // Sort by count in descending order
        const sortedData = [...response].sort((a, b) => b.count - a.count);
        setData(sortedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return <IndiaHeatmap data={[]} />;
  }

  if (error) {
    return <IndiaHeatmap data={[]} />;
  }

  return <IndiaHeatmap data={data} />;
} 