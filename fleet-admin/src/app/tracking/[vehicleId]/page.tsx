'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { Navigation, Play, Pause, ArrowLeft, Calendar, Clock, FastForward, Rewind } from 'lucide-react';
import { format, subHours, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RouteReplayMap = dynamic(() => import('@/components/tracking/RouteReplayMap'), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <div className="map-loading-spinner" />
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
    <div className="replay-page">
      <div className="replay-header">
        <div className="title-section">
          <Link href="/tracking" className="back-btn">
            <ArrowLeft size={20} />
          </Link>
          <div className="tracking-title">
            <Navigation size={24} />
            <h1>Lịch sử di chuyển - Xe #{params.vehicleId.slice(0, 8)}</h1>
          </div>
        </div>

        <div className="filter-section">
          <div className="time-input">
            <Calendar size={16} />
            <input
              type="datetime-local"
              value={fromTime}
              onChange={e => setFromTime(e.target.value)}
            />
          </div>
          <span className="to-text">đến</span>
          <div className="time-input">
            <Clock size={16} />
            <input
              type="datetime-local"
              value={toTime}
              onChange={e => setToTime(e.target.value)}
            />
          </div>
          <button className="search-btn" onClick={fetchHistory} disabled={isLoading}>
            {isLoading ? 'Đang tải...' : 'Xem'}
          </button>
        </div>
      </div>

      <div className="replay-body">
        <div className="map-wrapper">
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <RouteReplayMap history={history} currentIndex={currentIndex} />
          )}
        </div>

        <div className="playback-controls">
          <div className="controls-header">
            <div className="controls-info">
              <span className="points-count">{history.length} điểm dữ liệu</span>
              {history[currentIndex] && (
                <span className="current-time">
                  {formatDateTime(history[currentIndex].recordedAt)} - {history[currentIndex].speedKmh.toFixed(1)} km/h
                </span>
              )}
            </div>
            
            <div className="speed-controls">
              <span className="speed-label">Tốc độ:</span>
              {[1, 2, 4, 8].map(s => (
                <button
                  key={s}
                  className={`speed-btn ${speed === s ? 'active' : ''}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="slider-container">
            <button className="play-btn" onClick={togglePlay} disabled={history.length === 0}>
              {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
            </button>
            
            <input
              type="range"
              min="0"
              max={Math.max(0, history.length - 1)}
              value={currentIndex}
              onChange={handleSliderChange}
              className="progress-slider"
              disabled={history.length === 0}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .replay-page {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
          min-height: 0;
        }

        .replay-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          background: var(--bg-card);
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .tracking-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-primary);
        }

        .tracking-title h1 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }

        .filter-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .time-input {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-secondary);
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .time-input input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          outline: none;
          font-size: 14px;
        }

        .to-text {
          color: var(--text-muted);
          font-size: 14px;
        }

        .search-btn {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .search-btn:hover {
          background: var(--accent-hover);
        }

        .search-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .replay-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 0;
        }

        .map-wrapper {
          flex: 1;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          position: relative;
        }

        .error-message {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #ef4444;
          background: var(--bg-card);
          padding: 20px;
        }

        .playback-controls {
          background: var(--bg-card);
          padding: 16px 24px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .controls-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .points-count {
          font-size: 13px;
          color: var(--text-muted);
        }

        .current-time {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: monospace;
          background: var(--bg-secondary);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .speed-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .speed-label {
          font-size: 13px;
          color: var(--text-muted);
        }

        .speed-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .speed-btn.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .play-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .play-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: scale(1.05);
        }

        .play-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .progress-slider {
          flex: 1;
          height: 6px;
          -webkit-appearance: none;
          background: var(--bg-secondary);
          border-radius: 3px;
          outline: none;
        }

        .progress-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent-primary);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
