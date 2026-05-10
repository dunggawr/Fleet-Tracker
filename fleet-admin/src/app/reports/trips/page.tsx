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
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <DateRangeFilter onRangeChange={setDateRange} />
        <ExportActions reportName="trip_summary" params={dateRange} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
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

      <section className="flex flex-col gap-4 p-0 overflow-hidden bg-slate-800/40 rounded-xl border border-slate-700/50">
        <header className="flex justify-between items-center px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Info size={18} className="text-primary" />
            <h3 className="text-lg font-semibold text-white m-0">Trip History</h3>
          </div>
          <div className="text-xs text-slate-400">Showing {data?.trips?.length || 0} results</div>
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
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <Badge variant={
                selectedTrip.status === 'completed' ? 'success' : 
                selectedTrip.status === 'ongoing' ? 'primary' : 'warning'
              }>
                {selectedTrip.status}
              </Badge>
              <span className="font-mono text-xs text-slate-400">ID: {selectedTrip.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase block font-semibold">Route</label>
                <div className="flex flex-col gap-2 p-4 bg-slate-800/50 rounded-lg border-l-2 border-blue-500">
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <MapPin size={16} className="text-primary" />
                    <span>{selectedTrip.startLocation}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700 ml-[7px]" />
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <MapPin size={16} className="text-danger" />
                    <span>{selectedTrip.endLocation}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 px-4 py-3 bg-slate-800/50 rounded-lg">
                  <Clock size={16} className="text-slate-400" />
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block font-semibold">Duration</label>
                    <span className="text-sm font-medium">{selectedTrip.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-slate-800/50 rounded-lg">
                  <Truck size={16} className="text-slate-400" />
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block font-semibold">Distance</label>
                    <span className="text-sm font-medium">{selectedTrip.distance} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-slate-800/50 rounded-lg">
                  <UserIcon size={16} className="text-slate-400" />
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block font-semibold">Driver</label>
                    <span className="text-sm font-medium">{selectedTrip.driverName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[300px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-700">
              <MapBox 
                path={selectedTrip.trail || [
                  { lat: 21.0285, lng: 105.8542 }, // Hanoi
                  { lat: 20.8449, lng: 106.6881 }  // Hai Phong
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
            
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-700">
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <History size={16} className="text-slate-400" />
                  <h4 className="text-xs uppercase m-0 text-slate-400 font-semibold">Trip Timeline</h4>
                </div>
                <div className="flex flex-col gap-6 relative">
                  {(selectedTrip.timeline || [
                    { status: 'Departed', time: '08:00 AM', location: selectedTrip.startLocation },
                    { status: 'Arrived', time: '10:30 AM', location: selectedTrip.endLocation }
                  ]).map((item, i, arr) => (
                    <div key={i} className="flex gap-4 text-sm relative">
                      <div className="w-[70px] text-slate-400 tabular-nums text-xs">{item.time}</div>
                      <div className="relative flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 z-10" />
                        {i !== arr.length - 1 && (
                          <div className="absolute top-2.5 w-px h-12 bg-slate-700" />
                        )}
                      </div>
                      <div className="flex-1 -mt-0.5">
                        <div className="font-semibold text-sm">{item.status}</div>
                        <div className="text-slate-400 text-xs">{item.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-danger" />
                  <h4 className="text-xs uppercase m-0 text-slate-400 font-semibold">Violations</h4>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedTrip.violations?.length ? (
                    selectedTrip.violations.map((v, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <Badge variant="danger">{v.type}</Badge>
                        <span className="text-[11px] text-slate-400">{v.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-green-500 italic px-2">No violations recorded</div>
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
