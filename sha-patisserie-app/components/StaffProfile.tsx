'use client';

import { useState } from 'react';

interface StaffProfileData {
  // 1. Personal & Account Details
  fullName: string;
  email: string;
  contactNumber: string;
  accountStatus: 'Active' | 'Pending' | 'Inactive (Left Company)';

  // 2. Venue & Work Settings
  location: 'Sha Patisserie' | 'Zushi Bento';
  defaultBreak: '30 mins' | 'None';

  // 3. Pay Rates & Tax Setup
  hourlyPayRate: string;
  rateLastUpdated: string;
  workingRightStatus: 'Aus Citizen / Permanent Resident' | 'Student Visa' | 'Working Holiday';
  claimTaxFreeThreshold: boolean;
}

export default function StaffProfileForm() {
  const [formData, setFormData] = useState<StaffProfileData>({
    fullName: '',
    email: '',
    contactNumber: '',
    accountStatus: 'Active',
    location: 'Sha Patisserie',
    defaultBreak: '30 mins',
    hourlyPayRate: '',
    rateLastUpdated: new Date().toISOString().split('T')[0],
    workingRightStatus: 'Aus Citizen / Permanent Resident',
    claimTaxFreeThreshold: true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isTaxFreeEligible =
    formData.workingRightStatus === 'Aus Citizen / Permanent Resident' ||
    formData.workingRightStatus === 'Student Visa';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleStatusChange = (status: StaffProfileData['workingRightStatus']) => {
    setFormData((prev) => ({
      ...prev,
      workingRightStatus: status,
      // Default to false if not eligible for Tax-Free Threshold
      claimTaxFreeThreshold:
        status === 'Working Holiday' ? false : prev.claimTaxFreeThreshold,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/staff/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update staff profile');

      setMessage('Staff profile updated successfully!');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleOffboard = async () => {
    const confirmEnd = window.confirm(
      `Are you sure you want to end the profile for ${formData.fullName || 'this staff member'}? This will set their account status to Inactive.`
    );

    if (confirmEnd) {
      setFormData((prev) => ({ ...prev, accountStatus: 'Inactive (Left Company)' }));
      setMessage('Profile marked as Inactive. Don\'t forget to save changes.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="border-b border-stone-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
          Admin Panel
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">Staff Profile</h1>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 text-sm font-medium ${
            message.includes('successfully')
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Personal & Account Details */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3">
            1. Personal & Account Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm focus:border-stone-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm focus:border-stone-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="0412 345 678"
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm focus:border-stone-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Account Status
              </label>
              <select
                name="accountStatus"
                value={formData.accountStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm bg-white focus:border-stone-800 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive (Left Company)">
                  Inactive (Left Company)
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION 2: Venue & Work Settings */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3">
            2. Venue & Work Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm bg-white focus:border-stone-800 focus:outline-none"
              >
                <option value="Sha Patisserie">Sha Patisserie</option>
                <option value="Zushi Bento">Zushi Bento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Default Preset Break
              </label>
              <select
                name="defaultBreak"
                value={formData.defaultBreak}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm bg-white focus:border-stone-800 focus:outline-none"
              >
                <option value="30 mins">30 mins</option>
                <option value="None">None (0 mins)</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION 3: Pay Rates & Tax Setup */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3">
            3. Pay Rates & Tax Setup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Hourly Pay Rate ($/hr)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="hourlyPayRate"
                  value={formData.hourlyPayRate}
                  onChange={handleChange}
                  placeholder="28.50"
                  className="w-full rounded-lg border border-stone-300 py-2.5 pl-7 pr-3 text-sm focus:border-stone-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Rate Last Updated
              </label>
              <input
                type="date"
                name="rateLastUpdated"
                value={formData.rateLastUpdated}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-300 p-2.5 text-sm focus:border-stone-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-2">
              Working Right Status
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'Aus Citizen / Permanent Resident',
                  label: 'Aus Citizen / Permanent Resident',
                },
                {
                  id: 'Student Visa',
                  label: 'Student Visa (Follows Citizen/PR Tax Table)',
                },
                {
                  id: 'Working Holiday',
                  label:
                    'Working Holiday (Follows Working Holiday Tax Table - NAT75331)',
                },
              ].map((status) => (
                <label
                  key={status.id}
                  className="flex items-start gap-3 rounded-lg border border-stone-200 p-3 hover:bg-stone-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="workingRightStatus"
                    checked={formData.workingRightStatus === status.id}
                    onChange={() =>
                      handleStatusChange(
                        status.id as StaffProfileData['workingRightStatus']
                      )
                    }
                    className="mt-0.5 text-stone-900 focus:ring-stone-800"
                  />
                  <span className="text-sm font-medium text-stone-800">
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Tax-Free Threshold Section */}
          {isTaxFreeEligible && (
            <div className="rounded-xl bg-stone-50 p-4 border border-stone-200 space-y-2">
              <label className="block text-xs font-bold uppercase text-stone-600">
                Tax-Free Threshold (Citizen / PR / Student only)
              </label>
              <div className="flex gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-stone-800 cursor-pointer">
                  <input
                    type="radio"
                    name="taxFreeChoice"
                    checked={formData.claimTaxFreeThreshold === true}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        claimTaxFreeThreshold: true,
                      }))
                    }
                    className="text-stone-900 focus:ring-stone-800"
                  />
                  Claiming Tax-Free Threshold
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-stone-800 cursor-pointer">
                  <input
                    type="radio"
                    name="taxFreeChoice"
                    checked={formData.claimTaxFreeThreshold === false}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        claimTaxFreeThreshold: false,
                      }))
                    }
                    className="text-stone-900 focus:ring-stone-800"
                  />
                  No Tax-Free Threshold
                </label>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: Offboarding */}
        <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-rose-900">4. Offboarding</h2>
            <p className="text-xs text-rose-700 mt-0.5">
              Deactivate staff access and mark account status as Inactive.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOffboard}
            className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-100 transition"
          >
            End Profile
          </button>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-stone-800 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Staff Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}