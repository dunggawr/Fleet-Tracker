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
        <span className="rank-badge">#{item.rank}</span>
      ),
      width: '80px'
    },
    { 
      header: 'Driver', 
      accessor: (item: KpiLeaderboardItem) => (
        <Link href={`/drivers?id=${item.driverId}`} className="driver-cell link">
          <div className="avatar">{item.driverName.charAt(0)}</div>
          <div className="driver-name-wrapper">
            <span>{item.driverName}</span>
            <ExternalLink size={12} className="link-icon" />
          </div>
        </Link>
      )
    },
    { 
      header: 'KPI Score', 
      accessor: (item: KpiLeaderboardItem) => (
        <div className="score-cell">
          <div className="score-bar-bg">
            <div 
              className="score-bar-fill" 
              style={{ 
                width: `${item.score}%`,
                background: getScoreColor(item.score)
              }} 
            />
          </div>
          <span style={{ color: getScoreColor(item.score), fontWeight: 'bold' }}>{item.score}%</span>
        </div>
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
    <div className="flex flex-col gap-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-sm text-text-dim text-sm">
          <Trophy size={20} className="text-warning" />
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
