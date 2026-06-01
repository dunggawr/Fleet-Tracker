'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { connectSocket } from '@/lib/socket';
import { toast } from 'sonner';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  console.log('AppLayout: isSidebarCollapsed =', isSidebarCollapsed);
  
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  // Global Realtime Operational Toasts for Admin
  useEffect(() => {
    if (!isAuthenticated || isLoginPage) return;

    let socket: any;

    const setupSocket = async () => {
      try {
        socket = await connectSocket();

        // 1. Operational & SOS Alerts
        socket.on('alert:new', (payload: any) => {
          const severity = payload.severity?.toUpperCase() || 'HIGH';
          const isSOS = payload.type === 'SOS' || severity === 'CRITICAL';
          
          toast[isSOS ? 'error' : 'warning'](
            isSOS ? '🚨 SOS EMERGENCY' : '⚠️ OPERATIONAL ALERT',
            {
              description: `${payload.message} (${payload.vehicle?.plateNumber || 'Unknown vehicle'})`,
              duration: isSOS ? 15000 : 7000,
              action: {
                label: 'Track Now',
                onClick: () => {
                  if (payload.vehicleId) router.push(`/dispatch?vehicleId=${payload.vehicleId}`);
                  else router.push('/tracking');
                }
              }
            }
          );
        });

        // 2. Alert Resolution
        socket.on('alert:resolved', (payload: any) => {
          toast.success('✅ Alert Resolved', {
            description: payload.message || 'Alert has been cleared from dashboard.',
            duration: 4000
          });
        });

        // 3. Trip updates
        socket.on('trip:status-changed', (payload: any) => {
          const statusText = payload.status === 'in_progress' ? 'started' : payload.status;
          toast.info(`🚚 Trip Update`, {
            description: `Trip is now ${statusText}.`,
            duration: 5000,
            action: {
              label: 'Track',
              onClick: () => router.push('/tracking')
            }
          });
        });

        // 4. Order Milestone/Verification
        socket.on('order:verified', (payload: any) => {
          toast.success('✨ Milestone Verified', {
            description: `ORD-${payload.orderId.substring(0, 4)} verification success!`,
            duration: 5000
          });
        });

        // 5. Trip Assignment
        socket.on('trip:assigned', (payload: any) => {
          toast.success('📋 Trip Dispatched', {
            description: `New trip assigned to driver ${payload.driverId}.`,
            duration: 5000
          });
        });

        // 6. Biometrics
        socket.on('enroll:required', (payload: any) => {
          toast.message('🧬 Biometric Enrollment Required', {
            description: `Fingerprint registration required on device ${payload.deviceId}`,
            duration: 6000
          });
        });

        socket.on('enroll:result', (payload: any) => {
          if (payload.success) {
            toast.success('🧬 Fingerprint Enrolled', {
              description: `Biometric registered successfully on device ${payload.deviceId}`,
              duration: 6000
            });
          } else {
            toast.error('❌ Enrollment Failed', {
              description: `Biometric registration failed on vehicle ${payload.deviceId}`,
              duration: 7000
            });
          }
        });

        // 7. Fingerprint Deletions
        socket.on('fingerprint:deleted', (payload: any) => {
          if (payload.success) {
            toast.success('🛡️ Fingerprint Deleted', {
              description: payload.message || `Fingerprint slot #${payload.fingerprintId} deleted on device ${payload.deviceId}`,
              duration: 6000
            });
          } else {
            toast.error('❌ Fingerprint Deletion Failed', {
              description: payload.message || `Failed to delete fingerprint slot #${payload.fingerprintId} on device ${payload.deviceId}`,
              duration: 7000
            });
          }
        });

        socket.on('fingerprint:all_cleared', (payload: any) => {
          if (payload.success) {
            toast.success('🧹 All Fingerprints Cleared', {
              description: payload.message || `All fingerprints wiped on device ${payload.deviceId}`,
              duration: 8000
            });
          } else {
            toast.error('❌ Clear All Failed', {
              description: payload.message || `Failed to wipe fingerprints on device ${payload.deviceId}`,
              duration: 8000
            });
          }
        });

      } catch (err) {
        console.error('Failed to set up global realtime socket toasts:', err);
      }
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.off('alert:new');
        socket.off('alert:resolved');
        socket.off('trip:status-changed');
        socket.off('order:verified');
        socket.off('trip:assigned');
        socket.off('enroll:required');
        socket.off('enroll:result');
        socket.off('fingerprint:deleted');
        socket.off('fingerprint:all_cleared');
      }
    };
  }, [isAuthenticated, isLoginPage, router]);

  useEffect(() => {
    if (isSidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
      document.body.style.setProperty('--sidebar-width', '80px');
    } else {
      document.body.classList.remove('sidebar-collapsed');
      document.body.style.setProperty('--sidebar-width', '260px');
    }
  }, [isSidebarCollapsed]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div 
        className="flex-1 flex flex-col transition-all duration-200"
        style={{ marginLeft: isSidebarCollapsed ? 'var(--width-sidebar-collapsed)' : 'var(--width-sidebar)' }}
      >
        <Header />
        <main className="p-lg md:p-xl flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
