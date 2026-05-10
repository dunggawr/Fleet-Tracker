'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Users, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ExportActions } from '../components/ExportActions';
import { api } from '@/lib/api';
import { KpiLeaderboardItem } from '@/types/reports';

export default function KpiLeaderboardPage() {
  const [data, setData] = useState<KpiLeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<KpiLeaderboardItem[]>('/reports/kpi-leaderboard');
      setData(response);
    } catch (error) {
      console.error('Error fetching KPI leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const columns: Column<KpiLeaderboardItem>[] = [
    { 
      header: 'Rank', 
      accessor: (item: KpiLeaderboardItem) => (
        <RankBadge rank={item.rank} />
      ),
      width: '80px'
    },
    { 
      header: 'Driver', 
      accessor: (item: KpiLeaderboardItem) => (
        <DriverCell item={item} />
      )
    },
    { 
      header: 'KPI Score', 
      accessor: (item: KpiLeaderboardItem) => (
        <ScoreCell score={item.score} color={getScoreColor(item.score)} />
      )
    },
    { header: 'Trips', accessor: 'tripsCount' as keyof KpiLeaderboardItem },
    { 
      header: 'Completion', 
      accessor: (item: KpiLeaderboardItem) => `${item.completionRate}%`
    },
    { 
      header: 'Violations', 
      accessor: (item: KpiLeaderboardItem) => (
        <span style={{ color: item.violationsCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
          {item.violationsCount}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (item: KpiLeaderboardItem) => (
        <Badge variant={item.score >= 80 ? 'success' : item.score >= 50 ? 'warning' : 'danger'}>
          {item.score >= 80 ? 'Excellent' : item.score >= 50 ? 'Good' : 'Needs Improvement'}
        </Badge>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-(--space-lg)">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-(--space-sm) text-(--color-text-dim) text-sm">
          <Trophy size={20} className="text-(--color-warning)" />
          <span>Updated every 24 hours</span>
        </div>
        <ExportActions reportName="kpi_leaderboard" />
      </div>

      <DataTable 
        data={data} 
        columns={columns} 
        isLoading={isLoading}
        onRowClick={(item) => console.log('Driver clicked:', item.driverId)}
      />
    </div>
  );
}

// Helper components for table cells to keep the columns definition clean
function RankBadge({ rank }: { rank: number }) {
  return <span className="font-bold text-(--color-primary-light)">#{rank}</span>;
}

function DriverCell({ item }: { item: KpiLeaderboardItem }) {
  return (
    <Link href={`/drivers?id=${item.driverId}`} className="group flex items-center gap-(--space-md) no-underline text-inherit hover:text-(--color-primary-light) transition-colors duration-150">
      <div className="w-8 h-8 bg-surface-high rounded-full flex items-center justify-center font-bold text-xs text-text">
        {item.driverName.charAt(0)}
      </div>
      <div className="flex items-center gap-1.5">
        <span>{item.driverName}</span>
        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      </div>
    </Link>
  );
}

function ScoreCell({ score, color }: { score: number, color: string }) {
  return (
    <div className="flex items-center gap-(--space-md) min-w-[150px]">
      <div className="flex-1 h-2 bg-surface-high rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ 
            width: `${score}%`,
            background: color
          }} 
        />
      </div>
      <span className="font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}
