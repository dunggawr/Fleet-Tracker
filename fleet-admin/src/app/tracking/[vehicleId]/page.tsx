'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { Navigation, Play, Pause, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { format, subHours, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RouteReplayMap = dynamic(() => import('@/components/tracking/RouteReplayMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-text-dim">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <span>Đang tải bản đồ...</span>
    </div>
  ),
});

interface HistoryPoint {
  id: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  recordedAt: string;
}

export default function RouteReplayPage({ params }: { params: { vehicleId: string } }) {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time range
  const [fromTime, setFromTime] = useState<string>(
    format(subHours(new Date(), 24), "yyyy-MM-dd'T'HH:mm")
  );
  const [toTime, setToTime] = useState<string>(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );

  // Playback state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 4x, 8x
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<HistoryPoint[]>(`/tracking/vehicle/${params.vehicleId}/history`, {
        params: {
          from: new Date(fromTime).toISOString(),
          to: new Date(toTime).toISOString(),
        }
      });
      setHistory(res);
      setCurrentIndex(0);
      setIsPlaying(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử xe');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [params.vehicleId]); // Fetch initial

  // Playback logic
  useEffect(() => {
    if (isPlaying && history.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, history.length, speed]);

  const togglePlay = () => {
    if (currentIndex >= history.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(Number(e.target.value));
  };

  const formatDateTime = (isoStr: string) => {
    try {
      return format(parseISO(isoStr), 'dd/MM/yyyy HH:mm:ss');
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-5 bg-background min-h-0">
      <div className="flex items-center justify-between shrink-0 bg-surface p-4 px-5 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <Link href="/tracking" className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-highest text-text-dim no-underline transition-all hover:bg-surface-high hover:text-text">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3 text-text">
            <Navigation size={24} className="text-primary" />
            <h1 className="text-xl font-bold m-0">Lịch sử di chuyển - Xe #{params.vehicleId.slice(0, 8)}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-highest p-2 px-3 rounded-lg border border-border text-text-dim">
            <Calendar size={16} />
            <input
              type="datetime-local"
              value={fromTime}
              onChange={e => setFromTime(e.target.value)}
              className="bg-transparent border-none text-text outline-none text-sm"
            />
          </div>
          <span className="text-text-muted text-sm">đến</span>
          <div className="flex items-center gap-2 bg-surface-highest p-2 px-3 rounded-lg border border-border text-text-dim">
            <Clock size={16} />
            <input
              type="datetime-local"
              value={toTime}
              onChange={e => setToTime(e.target.value)}
              className="bg-transparent border-none text-text outline-none text-sm"
            />
          </div>
          <button 
            className="bg-primary text-white border-none p-2 px-5 rounded-lg font-semibold cursor-pointer transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={fetchHistory} 
            disabled={isLoading}
          >
            {isLoading ? 'Đang tải...' : 'Xem'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="flex-1 rounded-xl overflow-hidden border border-border relative">
          {error ? (
            <div className="flex items-center justify-center h-full text-error bg-surface p-5 text-center">
              {error}
            </div>
          ) : (
            <RouteReplayMap history={history} currentIndex={currentIndex} />
          )}
        </div>

        <div className="bg-surface p-4 px-6 rounded-xl border border-border shrink-0 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-text-muted">{history.length} điểm dữ liệu</span>
              {history[currentIndex] && (
                <span className="text-sm font-semibold text-text font-mono bg-surface-highest p-1 px-3 rounded-full">
                  {formatDateTime(history[currentIndex].recordedAt)} - {history[currentIndex].speedKmh.toFixed(1)} km/h
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-text-muted">Tốc độ:</span>
              {[1, 2, 4, 8].map(s => (
                <button
                  key={s}
                  className={`bg-surface-highest border p-1 px-2.5 rounded-md text-[12px] font-semibold cursor-pointer transition-all hover:bg-surface-high active:scale-95 ${speed === s ? 'bg-primary text-white border-primary' : 'border-border text-text-dim'}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              className="w-10 h-10 rounded-full border-none bg-primary text-white flex items-center justify-center cursor-pointer transition-all hover:bg-primary-hover hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow" 
              onClick={togglePlay} 
              disabled={history.length === 0}
            >
              {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
            </button>
            
            <input
              type="range"
              min="0"
              max={Math.max(0, history.length - 1)}
              value={currentIndex}
              onChange={handleSliderChange}
              className="flex-1 h-1.5 appearance-none bg-surface-highest rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
              disabled={history.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
