'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Truck, Clock, Zap } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { ReportChartWrapper } from '../components/ReportChartWrapper';
import { api } from '@/lib/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function UtilizationPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<any>('/reports/vehicle-utilization');
      setData(response);
    } catch (error) {
      console.error('Error fetching utilization report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="utilization-reports">
      <div className="stats-grid">
        <StatCard 
          label="Active Vehicles" 
          value={data?.activeCount || 0} 
          icon={Truck} 
          color="var(--color-primary)"
        />
        <StatCard 
          label="Idle Vehicles" 
          value={data?.idleCount || 0} 
          icon={Clock} 
          color="var(--color-text-muted)"
        />
        <StatCard 
          label="Avg. Utilization" 
          value={`${data?.averageUtilization || 0}%`} 
          icon={Zap} 
          color="var(--color-success)"
        />
      </div>

      <div className="charts-grid">
        <ReportChartWrapper 
          title="Utilization by Vehicle" 
          subtitle="Percentage of time spent on trips"
          isLoading={isLoading}
          isEmpty={!data?.vehicleStats?.length}
          height={400}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.vehicleStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={12} />
              <YAxis dataKey="plateNumber" type="category" stroke="var(--color-text-muted)" fontSize={12} width={100} />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="utilization" fill="var(--color-primary)" radius={[0, 4, 4, 0]}>
                {(data?.vehicleStats || []).map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.utilization > 80 ? 'var(--color-success)' : entry.utilization > 40 ? 'var(--color-primary)' : 'var(--color-warning)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ReportChartWrapper>
      </div>

      <style jsx>{`
        .utilization-reports {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-lg);
        }

        .charts-grid {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
