'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_WORKING_HOURS,
  type DayOfWeek,
  type WorkingDayConfig,
  type WorkingHoursMap,
  type WorkingTimeRange,
} from '@/lib/workingHours';

// --- Interfaces for Profile Details ---
interface StaffProfileData {
  // 1. Personal & Account Details
  fullName: string;
  email: string;
  contactNumber: string;
  accountStatus: 'Active' | 'Pending' | 'Inactive (Left Company)';

  // 2. Venue & Work Settings
  location: 'Sha Patisserie' | 'Zushi Bento';
  employmentType: '' | 'FULL_TIME' | 'PART_TIME' | 'CASUAL';
  annualLeaveHours: string;
  personalLeaveHours: string;

  // 3. Pay Rates & Tax Setup
  hourlyPayRate: string;
  rateLastUpdated: string;
  workingRightStatus: 'Aus Citizen / Permanent Resident' | 'Student Visa' | 'Working Holiday' | '';
  claimTaxFreeThreshold: boolean | null;
}

interface StaffProfileFormProps {
  id?: string;
}

interface StaffProfileResponse {
  id: string;
  name: string | null;
  email: string;
  contactNumber: string | null;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  employmentType: StaffProfileData['employmentType'] | null;
  annualLeaveHours: string;
  personalLeaveHours: string;
  location: { code: 'SHA' | 'ZB'; name: string } | null;
  hourlyPayRate: string;
  rateLastUpdated: string;
  workingRightStatus: StaffProfileData['workingRightStatus'];
  claimTaxFreeThreshold: boolean | null;
}

async function readApiResponse<T>(response: Response): Promise<T> {
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error(`Unexpected server response (${response.status}). Check the API route.`);
  }
  return response.json() as Promise<T>;
}

export default function StaffProfileForm({ id }: StaffProfileFormProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'profile' | 'working-hours'>('profile');

  // --- Profile Details State ---
  const [formData, setFormData] = useState<StaffProfileData>({
    fullName: '',
    email: '',
    contactNumber: '',
    accountStatus: 'Active',
    location: 'Sha Patisserie',
    employmentType: '',
    annualLeaveHours: '0',
    personalLeaveHours: '0',
    hourlyPayRate: '',
    rateLastUpdated: '',
    workingRightStatus: '',
    claimTaxFreeThreshold: null,
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savedFormData, setSavedFormData] = useState<StaffProfileData | null>(null);
  const [message, setMessage] = useState('');
  const [canManageEmployment, setCanManageEmployment] = useState(false);

  // --- Regular Working Hours State ---
  const [workingHoursPolicy, setWorkingHoursPolicy] = useState<'policy' | 'custom'>('custom');
  const [workingHours, setWorkingHours] = useState<WorkingHoursMap>(DEFAULT_WORKING_HOURS);
  const [savingHours, setSavingHours] = useState(false);
  const [loadingHours, setLoadingHours] = useState(true);

  // Load Profile Details
  useEffect(() => {
    async function loadProfile() {
      try {
        const query = id ? `?userId=${encodeURIComponent(id)}` : '';
        const response = await fetch(`/api/admin/staff/update${query}`);
        const data = await readApiResponse<{ user: StaffProfileResponse; canManageEmployment: boolean; error?: string }>(response);
        if (!response.ok) throw new Error(data.error || 'Failed to load staff profile');
        setCanManageEmployment(data.canManageEmployment);

        const user = data.user as StaffProfileResponse;
        const loadedFormData = {
          fullName: user.name || '',
          email: user.email,
          contactNumber: user.contactNumber || '',
          accountStatus:
            user.status === 'ACTIVE'
              ? 'Active'
              : user.status === 'PENDING'
                ? 'Pending'
                : 'Inactive (Left Company)',
          location: user.location?.code === 'ZB' ? 'Zushi Bento' : 'Sha Patisserie',
          employmentType: user.employmentType ?? '',
          annualLeaveHours: String(user.annualLeaveHours),
          personalLeaveHours: String(user.personalLeaveHours),
          hourlyPayRate: user.hourlyPayRate,
          rateLastUpdated: user.rateLastUpdated,
          workingRightStatus: user.workingRightStatus,
          claimTaxFreeThreshold: user.claimTaxFreeThreshold,
        } satisfies StaffProfileData;
        setFormData(loadedFormData);
        setSavedFormData(loadedFormData);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to load staff profile.');
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [id]);

  useEffect(() => {
    async function loadWorkingHours() {
      try {
        const query = id ? `?userId=${encodeURIComponent(id)}` : '';
        const response = await fetch(`/api/admin/staff/working-hours${query}`);
        const data = await readApiResponse<{
          error?: string;
          workingHoursPolicy: 'policy' | 'custom';
          workingHours: Partial<WorkingHoursMap> | null;
        }>(response);
        if (!response.ok) throw new Error(data.error || 'Failed to load regular working hours');

        setWorkingHoursPolicy(data.workingHoursPolicy);
        if (data.workingHours) {
          const schedule = Object.fromEntries(
            (Object.keys(DEFAULT_WORKING_HOURS) as DayOfWeek[]).map((day) => {
              const savedDay = data.workingHours?.[day];
              return [day, {
                ...DEFAULT_WORKING_HOURS[day],
                ...savedDay,
                additionalHours: Array.isArray(savedDay?.additionalHours)
                  ? savedDay.additionalHours
                  : [],
                breakMinutes: savedDay && Number.isInteger(savedDay.breakMinutes)
                  ? savedDay.breakMinutes
                  : savedDay?.enabled
                    ? 30
                    : 0,
              }];
            })
          ) as WorkingHoursMap;
          setWorkingHours(schedule);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to load regular working hours.');
      } finally {
        setLoadingHours(false);
      }
    }

    void loadWorkingHours();
  }, [id]);

  const isTaxFreeEligible =
    formData.workingRightStatus === 'Aus Citizen / Permanent Resident' ||
    formData.workingRightStatus === 'Student Visa';

  // --- Profile Form Handlers ---
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
      claimTaxFreeThreshold:
        status === 'Working Holiday' ? false : status === '' ? null : prev.claimTaxFreeThreshold,
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
        body: JSON.stringify({ ...formData, userId: id }),
      });

      const data = await readApiResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || 'Failed to update staff profile');

      setSavedFormData(formData);
      setIsEditing(false);
      setMessage('Staff profile saved successfully.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (savedFormData) setFormData(savedFormData);
    setIsEditing(false);
    setMessage('');
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

  // --- Working Hours Handlers ---
  const handleDayToggle = (day: DayOfWeek) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const handleHoursFieldChange = (
    day: DayOfWeek,
    field: keyof WorkingDayConfig,
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleAddHours = (day: DayOfWeek) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        additionalHours: [...prev[day].additionalHours, { startTime: '', endTime: '' }],
      },
    }));
  };

  const handleAdditionalHoursChange = (
    day: DayOfWeek,
    index: number,
    field: keyof WorkingTimeRange,
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        additionalHours: prev[day].additionalHours.map((range, rangeIndex) =>
          rangeIndex === index ? { ...range, [field]: value } : range
        ),
      },
    }));
  };

  const handleRemoveAdditionalHours = (day: DayOfWeek, index: number) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        additionalHours: prev[day].additionalHours.filter((_, rangeIndex) => rangeIndex !== index),
      },
    }));
  };

  const handleBreakMinutesChange = (day: DayOfWeek, value: string) => {
    const breakMinutes = value === '' ? 0 : Number(value);
    if (!Number.isInteger(breakMinutes) || breakMinutes < 0 || breakMinutes > 240) return;

    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], breakMinutes },
    }));
  };

  const handleSaveWorkingHours = async () => {
    setSavingHours(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/staff/working-hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, workingHoursPolicy, workingHours }),
      });

      const data = await readApiResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || 'Failed to save working hours');

      setMessage('Regular working hours saved successfully.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save working hours.');
    } finally {
      setSavingHours(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header & Tabs */}
      <div className="border-b border-stone-200 pb-0">
        <div className="flex items-end justify-between gap-4 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
              Admin Panel
            </p>
            <h1 className="mt-1 text-2xl font-bold text-stone-900">
              {formData.fullName ? `${formData.fullName}'s Profile` : 'Staff Profile'}
            </h1>
          </div>
          {activeTab === 'profile' && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 text-sm font-semibold text-stone-500">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setMessage('');
            }}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Profile Details
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('working-hours');
              setMessage('');
            }}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'working-hours'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            Regular Working Hours
          </button>
        </div>
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

      {/* TAB 1: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <fieldset disabled={!isEditing || loading || saving} className="space-y-8">
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
                    placeholder="e.g. Julia Wilson"
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
                    placeholder="julia@example.com"
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
              </div>
            </section>

            {/* SECTION 3: Pay Rates & Tax Setup */}
            <section className="space-y-4 border-t border-stone-200 pt-5">
              <h2 className="text-lg font-semibold text-stone-900">Employment &amp; Leave Entitlement</h2>
              <label className="block text-sm font-medium text-stone-700">
                Employment Status
                <select name="employmentType" value={formData.employmentType} onChange={handleChange} disabled={!canManageEmployment} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm disabled:bg-stone-50">
                  <option value="">Not set</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="CASUAL">Casual</option>
                </select>
              </label>
              {formData.employmentType === 'PART_TIME' || formData.employmentType === 'FULL_TIME' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-stone-700">Annual leave balance (hours)
                    <input name="annualLeaveHours" type="number" min="0" max="99999999" step="0.01" value={formData.annualLeaveHours} onChange={handleChange} disabled={!canManageEmployment} className="mt-1 block w-full rounded-lg border border-stone-300 p-2.5 text-sm" />
                  </label>
                  <label className="text-sm text-stone-700">Personal leave balance (hours)
                    <input name="personalLeaveHours" type="number" min="0" max="99999999" step="0.01" value={formData.personalLeaveHours} onChange={handleChange} disabled={!canManageEmployment} className="mt-1 block w-full rounded-lg border border-stone-300 p-2.5 text-sm" />
                  </label>
                </div>
              ) : <p className="text-sm text-stone-500">Leave entitlement: {formData.employmentType === 'CASUAL' ? 'None (unpaid time off only)' : 'Employment status not set'}</p>}
            </section>
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
                    { id: '', label: 'Not set' },
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
                        checked={formData.claimTaxFreeThreshold === null}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, claimTaxFreeThreshold: null }))
                        }
                        className="text-stone-900 focus:ring-stone-800"
                      />
                      Not set
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
          </fieldset>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-lg bg-stone-900 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-stone-800 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}
        </form>
      )}

      {/* TAB 2: REGULAR WORKING HOURS (Matching Photo 1) */}
      {activeTab === 'working-hours' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Set {formData.fullName ? `${formData.fullName.split(' ')[0]}'s` : 'staff'} regular working hours
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Regular working hours define when users are expected to work.
            </p>
          </div>



          {/* Days Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs font-bold text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Working day</th>
                  <th className="py-3 px-4 font-semibold">Working hours (Optional)</th>
                  <th className="py-3 px-4 font-semibold">Break (min)</th>
                  <th className="py-3 px-4 font-semibold">Standard total hours (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(Object.keys(workingHours) as DayOfWeek[]).map((day) => {
                  const config = workingHours[day];
                  return (
                    <tr
                      key={day}
                      className={!config.enabled ? 'bg-stone-50/40 text-stone-400' : ''}
                    >
                      <td className="py-3.5 px-4 font-medium">
                        <label className="flex items-center gap-2.5 cursor-pointer text-stone-800">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={() => handleDayToggle(day)}
                            className="rounded border-stone-300 text-sky-600 focus:ring-sky-500"
                          />
                          <span className={!config.enabled ? 'text-stone-400' : 'text-stone-800'}>
                            {day}
                          </span>
                        </label>
                      </td>
                      <td className="py-3.5 px-4">
                        {config.enabled ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="time"
                                aria-label={`${day} start time`}
                                value={config.startTime}
                                onChange={(e) =>
                                  handleHoursFieldChange(day, 'startTime', e.target.value)
                                }
                                className="w-28 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                              />
                              <span className="text-xs text-stone-400">to</span>
                              <input
                                type="time"
                                aria-label={`${day} end time`}
                                value={config.endTime}
                                onChange={(e) =>
                                  handleHoursFieldChange(day, 'endTime', e.target.value)
                                }
                                className="w-28 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                              />
                            </div>
                            {config.additionalHours.map((range, index) => (
                              <div key={`${day}-hours-${index}`} className="flex flex-wrap items-center gap-2">
                                <input
                                  type="time"
                                  aria-label={`${day} additional period ${index + 1} start time`}
                                  value={range.startTime}
                                  onChange={(e) =>
                                    handleAdditionalHoursChange(day, index, 'startTime', e.target.value)
                                  }
                                  className="w-28 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                                />
                                <span className="text-xs text-stone-400">to</span>
                                <input
                                  type="time"
                                  aria-label={`${day} additional period ${index + 1} end time`}
                                  value={range.endTime}
                                  onChange={(e) =>
                                    handleAdditionalHoursChange(day, index, 'endTime', e.target.value)
                                  }
                                  className="w-28 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  aria-label={`Remove ${day} additional period ${index + 1}`}
                                  onClick={() => handleRemoveAdditionalHours(day, index)}
                                  className="text-xs font-medium text-rose-700 hover:text-rose-800"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddHours(day)}
                              disabled={config.additionalHours.length >= 5}
                              className="text-sky-600 hover:text-sky-700 text-xs font-semibold ml-2"
                            >
                              + Add hours
                            </button>
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-4">
                        {config.enabled && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="240"
                              step="5"
                              aria-label={`${day} break duration in minutes`}
                              value={config.breakMinutes}
                              onChange={(e) => handleBreakMinutesChange(day, e.target.value)}
                              className="w-20 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                            />
                            <span className="text-xs text-stone-500">min</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {config.enabled && (
                          <input
                            type="text"
                            placeholder="Type here"
                            value={config.standardHours}
                            onChange={(e) =>
                              handleHoursFieldChange(day, 'standardHours', e.target.value)
                            }
                            className="w-36 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveWorkingHours}
              disabled={savingHours || loadingHours}
              className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 transition disabled:opacity-50"
            >
              {loadingHours ? 'Loading...' : savingHours ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}