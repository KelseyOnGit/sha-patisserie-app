'use client';

import { useState, useEffect } from 'react';

interface TimeLog {
  id: string;
  clockIn: string;
  location: string;
}

export default function ClockPage() {
  // Mock current logged-in user (Replace with your actual auth context/state once login page is ready)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>({
    id: 'user-id-placeholder',
    name: 'Kelsey Wang',
  });

  const [selectedLocation, setSelectedLocation] = useState<'Sha / Zushi Bento'>('Sha / Zushi Bento');
  const [activeLog, setActiveLog] = useState<TimeLog | null>(null);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Live Clock Display
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active log for current logged-in user
  useEffect(() => {
    if (!currentUser?.id) {
      setActiveLog(null);
      return;
    }

    fetch(`/api/clock-in?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setActiveLog(data.activeLog || null);
      });
  }, [currentUser]);

  const handleClockAction = (action: 'clock-in' | 'clock-out') => {
    if (!currentUser) {
      setStatusMessage({ type: 'error', text: 'No user logged in.' });
      return;
    }

    if (!navigator.geolocation) {
      setStatusMessage({
        type: 'error',
        text: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Verifying GPS location...' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        try {
          // Pass "Sha" as the location key to backend API for geofence validation
          const res = await fetch('/api/clock-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              action,
              location: 'Sha',
              userLat,
              userLng,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setStatusMessage({ type: 'error', text: data.error });
          } else {
            const actionText = action === 'clock-in' ? 'clocked in' : 'clocked out';
            setStatusMessage({
              type: 'success',
              text: `✨ ${currentUser.name} has successfully ${actionText} at ${selectedLocation}.`,
            });
            setActiveLog(action === 'clock-in' ? data.log : null);
          }
        } catch (err) {
          setStatusMessage({ type: 'error', text: 'Network error submitting request.' });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        setStatusMessage({
          type: 'error',
          text: 'GPS permission denied. Please allow location access to clock in or out.',
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-4 selection:bg-amber-100">
      {/* Main Kiosk Card */}
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/60 overflow-hidden">
        
        {/* Soft Clock Banner */}
        <div className="bg-[#F5EFE6] py-5 px-6 text-center border-b border-stone-200/60">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE8DC] border border-stone-300/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-lg text-stone-700 font-semibold tracking-wide">
              {currentTime || '--:--:--'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Combined Venue Card */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
              Venue Location
            </label>
            <div className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold bg-[#EADBC8] text-stone-800 border border-[#D8C4B6] shadow-sm flex items-center justify-center gap-2">
              <span>📍</span> Sha / Zushi Bento
            </div>
          </div>

          {/* Active Shift Card */}
          {currentUser && (
            <div className="p-4 rounded-2xl bg-[#FBF8F3] border border-stone-200/70 shadow-sm">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                  Logged In As
                </span>
                <span className="text-xs font-bold text-stone-700">
                  {currentUser.name}
                </span>
              </div>

              {activeLog ? (
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Clocked In
                  </span>
                  <p className="text-xs text-stone-500 mt-2 font-medium">
                    Since {new Date(activeLog.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Sha / Zushi Bento)
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-200/70 text-stone-700">
                    Clocked Out
                  </span>
                  <span className="text-xs text-stone-400 font-medium">Ready for shift</span>
                </div>
              )}
            </div>
          )}

          {/* Detailed Status Confirmation Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold border transition-all text-center ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200/80'
                  : statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                  : 'bg-amber-50 text-amber-800 border-amber-200/80'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Clock In / Out Action Buttons */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <button
              onClick={() => handleClockAction('clock-in')}
              disabled={loading || !currentUser || !!activeLog}
              className="py-3.5 bg-[#82A083] hover:bg-[#729073] text-white font-bold rounded-2xl shadow-sm active:scale-[0.98] disabled:opacity-35 disabled:hover:bg-[#82A083] disabled:cursor-not-allowed transition-all text-sm tracking-wide"
            >
              {loading ? 'Verifying...' : 'Clock In'}
            </button>
            <button
              onClick={() => handleClockAction('clock-out')}
              disabled={loading || !currentUser || !activeLog}
              className="py-3.5 bg-[#C88EA7] hover:bg-[#B77D96] text-white font-bold rounded-2xl shadow-sm active:scale-[0.98] disabled:opacity-35 disabled:hover:bg-[#C88EA7] disabled:cursor-not-allowed transition-all text-sm tracking-wide"
            >
              {loading ? 'Verifying...' : 'Clock Out'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F5F0] border-t border-stone-200/60 p-3 text-center">
          <p className="text-[11px] text-stone-400 font-medium">
            🔒 GPS Geofencing active • Onsite location required
          </p>
        </div>
      </div>
    </div>
  );
}