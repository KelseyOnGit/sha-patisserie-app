'use client';

import { useState, useEffect } from 'react';

interface User {
  workType: any;
  id: string;
  name: string;
  email: string;
  role: string;
  hourlyRate: number | null;
}

export default function StaffDirectory() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STAFF',
    hourlyRate: '',
    pinCode: '',
    workType: 'FULL_TIME', // Default work type
    location: 'Sha',
  });

  // Fetch staff list on page load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: '', email: '', role: 'STAFF', hourlyRate: '', pinCode: '', workType: 'FULL_TIME', location: 'Sha' });
        fetchUsers(); // Refresh the list
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Staff Directory</h1>

      {/* Add Staff Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Employee</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <select
           value={formData.location}
           onChange={(e) =>setFormData({ ...formData, location: e.target.value})}
           className="p-2 boder rounded"
          >
            <option value="Sha">Sha Patisserie</option>
            <option value="ZB">Zushi Bento</option>
          </select>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
          <input
            type="text"
            placeholder="Clock-in PIN (4 digits)"
            maxLength={4}
            value={formData.pinCode}
            onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={formData.workType}
            onChange={(e) => setFormData({...formData, workType: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="FULL_TIME">Full-Time</option>
            <option value="PART_TIME">Part-Time</option>
            <option value="CASUAL">Casual</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 font-medium"
        >
          Add Staff Member
        </button>
      </form>

      {/* Staff List Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b bg-gray-50">Current Staff</h2>
        {loading ? (
          <p className="p-4 text-gray-500">Loading staff directory...</p>
        ) : users.length === 0 ? (
          <p className="p-4 text-gray-500">No staff members found. Add one above!</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b text-sm text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Work Type</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-gray-600">{user.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-gray-200 text-xs rounded font-semibold">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">{user.workType.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}