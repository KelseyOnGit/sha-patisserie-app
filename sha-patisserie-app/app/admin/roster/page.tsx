'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  employmentType: string;
  location: string;
}

interface Shift {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  location: string;
  roleTag: string | null;
  notes: string | null;
  user: User;
}

export default function ShiftRoster() {
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    userId: '',
    startTime: '',
    endTime: '',
    breakMinutes: 30,
    location: 'Sha',
    roleTag: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, shiftsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/shifts'),
      ]);
      const usersData = await usersRes.json();
      const shiftsData = await shiftsRes.json();

      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(shiftsData)) setShifts(shiftsData);
    } catch (err) {
      console.error('Failed to load roster data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          userId: '',
          startTime: '',
          endTime: '',
          breakMinutes: 30,
          location: 'Sha',
          roleTag: '',
          notes: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderShiftTable = (type: string, title: string) => {
    const filteredShifts = shifts.filter(
      (s) => (s.user?.employmentType || 'CASUAL') === type
    );

    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold bg-gray-100 p-3 rounded-t border text-gray-700">
          {title} ({filteredShifts.length})
        </h3>
        {filteredShifts.length === 0 ? (
          <p className="p-4 border-x border-b text-gray-400 text-sm bg-white">
            No shifts scheduled for {title.toLowerCase()}.
          </p>
        ) : (
          <table className="w-full text-left border-collapse bg-white border-x border-b">
            <thead>
              <tr className="border-b text-xs text-gray-500 uppercase bg-gray-50">
                <th className="p-3">Staff Name</th>
                <th className="p-3">Location</th>
                <th className="p-3">Station / Tag</th>
                <th className="p-3">Start Time</th>
                <th className="p-3">End Time</th>
                <th className="p-3">Break</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((shift) => (
                <tr key={shift.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-3 font-semibold">{shift.user?.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      shift.location === 'ZB' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {shift.location || 'Sha'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border">
                      {shift.roleTag || 'General'}
                    </span>
                  </td>
                  <td className="p-3">{new Date(shift.startTime).toLocaleString()}</td>
                  <td className="p-3">{new Date(shift.endTime).toLocaleString()}</td>
                  <td className="p-3 font-medium text-gray-600">{shift.breakMinutes} mins</td>
                  <td className="p-3 text-gray-500">{shift.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Shift Roster</h1>

      {/* Assign Shift Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Assign New Shift</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Employee</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">Select Employee...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.employmentType || 'Casual'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Entity / Location</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="p-2 border rounded w-full"
            >
              <option value="Sha">Sha Patisserie</option>
              <option value="ZB">Zushi Bento</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Station / Role</label>
            <input
              type="text"
              value={formData.roleTag}
              onChange={(e) => setFormData({ ...formData, roleTag: e.target.value })}
              className="p-2 border rounded w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="p-2 border rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Break Time (Mins)</label>
            <input
              type="number"
              placeholder="30"
              value={formData.breakMinutes}
              onChange={(e) => setFormData({ ...formData, breakMinutes: Number(e.target.value) })}
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Notes (Optional)</label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="p-2 border rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 font-medium"
        >
          Publish Shift
        </button>
      </form>

      {/* Roster Tables Grouped by Employment Type */}
      <div className="bg-white rounded-lg shadow-md border p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Weekly Schedule</h2>
        {loading ? (
          <p className="text-gray-500">Loading roster...</p>
        ) : (
          <>
            {renderShiftTable('FULL_TIME', 'Full-Time Staff')}
            {renderShiftTable('PART_TIME', 'Part-Time Staff')}
            {renderShiftTable('CASUAL', 'Casual Staff')}
          </>
        )}
      </div>
    </div>
  );
}
