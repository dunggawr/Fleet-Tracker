'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Truck,
  User as UserIcon,
  ChevronRight,
  Info,
  AlertTriangle,
  History
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ExportActions } from '../components/ExportActions';
import { MapBox, MapMarker } from '@/components/ui/MapBox';
import { api } from '@/lib/api';
import { TripRecord, TripSummaryData } from '@/types/reports';

export default function TripSummaryPage() {
  const [data, setData] = useState<TripSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<TripSummaryData>('/reports/trip-summary', {
        params: dateRange
      });
      setData(response);
    } catch (error) {
      console.error('Error fetching trip summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const columns: Column<TripRecord>[] = [
    { 
      header: 'Trip ID', 
      accessor: (t: TripRecord) => <span className="font-mono text-xs">{t.id.slice(0, 8)}...</span>,
      width: '100px'
    },
    { header: 'Date', accessor: 'date' },
    { 
      header: 'Vehicle', 
      accessor: (t: TripRecord) => (
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-dim" />
          <span>{t.vehiclePlate}</span>
        </div>
      )
    },
    { 
      header: 'Driver', 
      accessor: (t: TripRecord) => (
        <div className="flex items-center gap-2">
          <UserIcon size={14} className="text-dim" />
          <span>{t.driverName}</span>
        </div>
      )
    },
    { 
      header: 'Distance', 
      accessor: (t: TripRecord) => `${t.distance} km` 
    },
    { 
      header: 'Status', 
      accessor: (t: TripRecord) => (
        <Badge variant={
          t.status === 'completed' ? 'success' : 
          t.status === 'ongoing' ? 'primary' : 
          t.status === 'delayed' ? 'warning' : 'neutral'
        }>
          {t.status}
        </Badge>
      )
    },
    {
      header: '',
      accessor: () => <ChevronRight size={18} className="text-dim" />,
      width: '40px'
    }
  ];

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex justify-between items-center">
        <DateRangeFilter onRangeChange={setDateRange} />
        <ExportActions reportName="trip_summary" params={dateRange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        <StatCard 
          label="Total Trips" 
          value={data?.totalTrips || 0} 
          icon={Calendar} 
          color="var(--color-primary)"
        />
        <StatCard 
          label="Active Trips" 
          value={data?.activeTrips || 0} 
          icon={Truck} 
          color="var(--color-success)"
        />
        <StatCard 
          label="Delayed Trips" 
          value={data?.delayedTrips || 0} 
          icon={Clock} 
          color="var(--color-danger)"
        />
      </div>

      <section className="flex flex-col gap-md p-0 overflow-hidden bg-surface border border-border rounded-lg">
        <header className="flex justify-between items-center py-md px-lg border-b border-border bg-surface-low">
          <div className="flex items-center gap-sm">
            <Info size={18} className="text-primary" />
            <h3 className="text-lg font-bold text-text m-0">Trip History</h3>
          </div>
          <div className="text-xs font-medium text-text-dim">Showing {data?.trips?.length || 0} results</div>
        </header>
        
        <DataTable 
          data={data?.trips || []} 
          columns={columns} 
          isLoading={isLoading}
          onRowClick={(trip) => setSelectedTrip(trip as TripRecord)}
        />
      </section>

      <Modal
        isOpen={Boolean(selectedTrip)}
        onClose={() => setSelectedTrip(null)}
        title="Trip Details"
      >
        {selectedTrip && (
          <div className="flex flex-col gap-xl">
            <div className="flex justify-between items-center">
              <Badge variant={
                selectedTrip.status === 'completed' ? 'success' : 
                selectedTrip.status === 'ongoing' ? 'primary' : 'warning'
              }>
                {selectedTrip.status}
              </Badge>
              <span className="font-mono text-xs text-text-dim">ID: {selectedTrip.id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="flex flex-col gap-xs">
                <label className="text-xs text-text-dim uppercase block mb-1 font-semibold">Route</label>
                <div className="flex flex-col gap-xs p-md bg-surface-low rounded-default border-l-4 border-primary">
                  <div className="flex items-center gap-sm font-medium">
                    <MapPin size={16} className="text-primary" />
                    <span>{selectedTrip.startLocation}</span>
                  </div>
                  <div className="w-px h-3 bg-border ml-[7px]" />
                  <div className="flex items-center gap-sm font-medium">
                    <MapPin size={16} className="text-danger" />
                    <span>{selectedTrip.endLocation}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-md">
                <div className="flex items-center gap-md p-sm px-md bg-surface-low rounded-default">
                  <Clock size={16} className="text-text-dim" />
                  <div>
                    <label className="text-[10px] text-text-dim uppercase block leading-tight">Duration</label>
                    <span className="text-sm font-medium">{selectedTrip.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-md p-sm px-md bg-surface-low rounded-default">
                  <Truck size={16} className="text-text-dim" />
                  <div>
                    <label className="text-[10px] text-text-dim uppercase block leading-tight">Distance</label>
                    <span className="text-sm font-medium">{selectedTrip.distance} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-md p-sm px-md bg-surface-low rounded-default">
                  <UserIcon size={16} className="text-text-dim" />
                  <div>
                    <label className="text-[10px] text-text-dim uppercase block leading-tight">Driver</label>
                    <span className="text-sm font-medium">{selectedTrip.driverName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[300px] bg-surface-high rounded-lg overflow-hidden relative border border-border">
              <MapBox 
                path={selectedTrip.trail || [
                  { lat: 21.0285, lng: 105.8542 },
                  { lat: 20.8449, lng: 106.6881 }
                ]}
                markers={[
                  {
                    id: 'start',
                    lat: (selectedTrip.trail?.[0]?.lat) || 21.0285,
                    lng: (selectedTrip.trail?.[0]?.lng) || 105.8542,
                    label: 'Start: ' + selectedTrip.startLocation,
                    color: 'var(--color-primary)',
                    icon: <MapPin size={12} className="text-white" />
                  },
                  {
                    id: 'end',
                    lat: (selectedTrip.trail?.[selectedTrip.trail.length - 1]?.lat) || 20.8449,
                    lng: (selectedTrip.trail?.[selectedTrip.trail.length - 1]?.lng) || 106.6881,
                    label: 'End: ' + selectedTrip.endLocation,
                    color: 'var(--color-danger)',
                    icon: <MapPin size={12} className="text-white" />
                  }
                ]}
                zoom={9}
                className="w-full h-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl pt-lg border-t border-border">
              <section className="flex flex-col gap-md">
                <div className="flex items-center gap-sm">
                  <History size={16} className="text-text-dim" />
                  <h4 className="text-xs uppercase m-0 text-text-dim font-bold">Trip Timeline</h4>
                </div>
                <div className="flex flex-col gap-md relative">
                  {(selectedTrip.timeline || [
                    { status: 'Departed', time: '08:00 AM', location: selectedTrip.startLocation },
                    { status: 'Arrived', time: '10:30 AM', location: selectedTrip.endLocation }
                  ]).map((item, i, arr) => (
                    <div key={i} className="flex gap-md text-[13px]">
                      <div className="w-[70px] text-text-dim font-mono">{item.time}</div>
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-primary mt-[6px] z-10 relative" />
                        {i !== arr.length - 1 && (
                          <div className="absolute top-2 left-[3px] w-px h-full bg-border z-0" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold">{item.status}</div>
                        <div className="text-text-dim text-xs">{item.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-md">
                <div className="flex items-center gap-sm">
                  <AlertTriangle size={16} className="text-danger" />
                  <h4 className="text-xs uppercase m-0 text-text-dim font-bold">Violations</h4>
                </div>
                <div className="flex flex-col gap-sm">
                  {selectedTrip.violations?.length ? (
                    selectedTrip.violations.map((v, i) => (
                      <div key={i} className="flex justify-between items-center p-sm bg-danger-low rounded-sm">
                        <Badge variant="danger">{v.type}</Badge>
                        <span className="text-[11px] text-text-dim">{v.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[13px] text-success italic">No violations recorded</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
