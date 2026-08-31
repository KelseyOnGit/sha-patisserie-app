'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  location: string;
  employmentType: string;
}

interface TimeLog {
  id: string;
  clockIn: string;
  location: string;
}

export default function ClockPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'Sha' | 'ZB'>('Sha');
  const [activeLog, setActiveLog] = useState<TimeLog | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      });
  }, []);

  // Fetch active log when selected user changes
  useEffect(() => {
    if (!selectedUserId) {
      setActiveLog(null);
      return;
    }

    fetch(`/api/clock-in?userId=${selectedUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setActiveLog(data.activeLog || null);
      });
  }, [selectedUserId]);

  const handleClockAction = (action: 'clock-in' | 'clock-out') => {
    if (!selectedUserId) {
      setStatusMessage({ type: 'error', text: 'Please select your name first.' });
      return;
    }

    if (!navigator.geolocation) {
      setStatusMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Verifying your physical GPS location...' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        try {
          const res = await fetch('/api/clock-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: selectedUserId,
              action,
              location: selectedLocation,
              userLat,
              userLng,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setStatusMessage({ type: 'error', text: data.error });
          } else {
            setStatusMessage({ type: 'success', text: data.message });
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
          text: 'GPS permission denied. Please allow location access on your device to clock in/out.',
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Time Kiosk</h1>
        <p className="text-sm text-gray-500 mb-6">Onsite Location Verification Required</p>

        {/* Staff Selection */}
        <div className="text-left mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Select Staff Member</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">-- Choose Name --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.employmentType})
              </option>
            ))}
          </select>
        </div>

        {/* Location Selection */}
        <div className="text-left mb-6">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Current Venue Location</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedLocation('Sha')}
              className={`p-3 text-sm font-semibold rounded-lg border ${
                selectedLocation === 'Sha'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              Sha Patisserie
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocation('ZB')}
              className={`p-3 text-sm font-semibold rounded-lg border ${
                selectedLocation === 'ZB'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              ZB
            </button>
          </div>
        </div>

        {/* Active Shift Status */}
        {selectedUserId && (
          <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200 text-left">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Current Status
            </span>
            {activeLog ? (
              <div>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
                <span className="font-bold text-green-700">Clocked In</span>
                <p className="text-xs text-gray-500 mt-1">
                  Since {new Date(activeLog.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({activeLog.location})
                </p>
              </div>
            ) : (
              <div>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400 mr-2"></span>
                <span className="font-bold text-gray-600">Clocked Out</span>
              </div>
            )}
          </div>
        )}

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-sm mb-6 ${
              statusMessage.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : statusMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleClockAction('clock-in')}
            disabled={loading || !selectedUserId || !!activeLog}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Clock In
          </button>
          <button
            onClick={() => handleClockAction('clock-out')}
            disabled={loading || !selectedUserId || !activeLog}
            className="w-full py-4 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Clock Out
          </button>
        </div>
      </div>
    </div>
  );
}