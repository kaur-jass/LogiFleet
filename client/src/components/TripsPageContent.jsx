import React, { useState, useEffect } from 'react';
import Card from './Card';
import Table from './Table';
import Badge from './Badge';
import Button from './Button';
import API from '../api/axios';
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../services/tripService';

const statusVariant = {
  DRAFT: 'info',
  DISPATCHED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export default function TripsPageContent() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Form list options
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);

  // Create Trip form state
  const [createForm, setCreateForm] = useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    plannedDistance: '',
    revenue: '',
  });

  // Complete Trip form state
  const [completeForm, setCompleteForm] = useState({
    actualDistance: '',
    fuelConsumed: '',
    finalOdometer: '',
    revenue: '',
  });

  const [filterStatus, setFilterStatus] = useState('');
  const [role, setRole] = useState('');

  // Load Trips
  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await getTrips();
      // Apply client-side status filtering
      const list = res.data?.trips || [];
      if (filterStatus) {
        setTrips(list.filter(t => t.status === filterStatus));
      } else {
        setTrips(list);
      }
    } catch (err) {
      setError('Failed to fetch trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
    setRole(localStorage.getItem('role') || '');
  }, [filterStatus]);

  // Fetch options for creation form
  const openCreateModal = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        API.get('/drivers/available'),
        API.get('/vehicles/available')
      ]);
      setAvailableDrivers(driversRes.data?.data?.drivers || []);
      setAvailableVehicles(vehiclesRes.data?.data?.vehicles || []);
      setShowCreateModal(true);
    } catch (err) {
      alert('Failed to load available drivers and vehicles.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTrip({
        ...createForm,
        cargoWeight: parseFloat(createForm.cargoWeight),
        plannedDistance: parseFloat(createForm.plannedDistance),
        revenue: createForm.revenue ? parseFloat(createForm.revenue) : 0,
      });
      setShowCreateModal(false);
      setCreateForm({
        source: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        plannedDistance: '',
        revenue: '',
      });
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create trip');
    }
  };

  const handleDispatchAction = async (id) => {
    if (!confirm('Are you sure you want to dispatch this trip?')) return;
    try {
      await dispatchTrip(id);
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch trip');
    }
  };

  const handleCancelAction = async (id) => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;
    try {
      await cancelTrip(id);
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel trip');
    }
  };

  const openCompleteModal = (id) => {
    setSelectedTripId(id);
    setCompleteForm({
      actualDistance: '',
      fuelConsumed: '',
      finalOdometer: '',
      revenue: '',
    });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await completeTrip(selectedTripId, {
        actualDistance: parseFloat(completeForm.actualDistance),
        fuelConsumed: parseFloat(completeForm.fuelConsumed),
        finalOdometer: parseFloat(completeForm.finalOdometer),
        revenue: completeForm.revenue ? parseFloat(completeForm.revenue) : undefined,
      });
      setShowCompleteModal(false);
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to complete trip');
    }
  };

  const columns = [
    { key: 'id', label: 'Trip ID', render: (row) => row.id.substring(0, 8) },
    { key: 'route', label: 'Route', render: (row) => <span className="font-semibold">{row.source} → {row.destination}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant[row.status] || 'neutral'}>{row.status}</Badge> },
    { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle ? `${row.vehicle.name} [${row.vehicle.regNumber}]` : row.vehicleId.substring(0, 8) },
    { key: 'driver', label: 'Driver', render: (row) => row.driver ? row.driver.name : row.driverId.substring(0, 8) },
    { key: 'cargoWeight', label: 'Cargo', render: (row) => `${row.cargoWeight} kg` },
    { key: 'plannedDistance', label: 'Distance', render: (row) => `${row.plannedDistance} km` },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        if (row.status === 'DRAFT') {
          return (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleDispatchAction(row.id)}>Dispatch</Button>
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => handleCancelAction(row.id)}>Cancel</Button>
            </div>
          );
        }
        if (row.status === 'DISPATCHED') {
          return (
            <div className="flex gap-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => openCompleteModal(row.id)}>Complete</Button>
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => handleCancelAction(row.id)}>Cancel</Button>
            </div>
          );
        }
        return <span className="text-xs text-slate-400">None</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Trips Dashboard</h2>
        {(role === 'FLEET_MANAGER' || role === 'DRIVER') && (
          <Button onClick={openCreateModal}>Create New Trip</Button>
        )}
      </div>

      <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <span className="text-sm font-medium text-slate-500">Filter Status:</span>
        <div className="flex gap-2">
          {['', 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                filterStatus === st
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-transparent text-slate-600 border-slate-200 hover:bg-slate-50 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-900'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      <Card title="Trips List">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading trips...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : trips.length > 0 ? (
          <Table columns={columns} data={trips} />
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">No trips matched the filter status.</div>
        )}
      </Card>

      {/* CREATE TRIP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Trip</h3>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500">Source</label>
                  <input
                    type="text"
                    required
                    placeholder="Source city"
                    value={createForm.source}
                    onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="Destination city"
                    value={createForm.destination}
                    onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Assign Driver</label>
                <select
                  required
                  value={createForm.driverId}
                  onChange={(e) => setCreateForm({ ...createForm, driverId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">Select an available driver</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.licenseNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Assign Vehicle</label>
                <select
                  required
                  value={createForm.vehicleId}
                  onChange={(e) => setCreateForm({ ...createForm, vehicleId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">Select an available vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} [{v.licensePlate}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 500"
                    value={createForm.cargoWeight}
                    onChange={(e) => setCreateForm({ ...createForm, cargoWeight: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Planned Dist. (km)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 350"
                    value={createForm.plannedDistance}
                    onChange={(e) => setCreateForm({ ...createForm, plannedDistance: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Revenue (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 15000"
                    value={createForm.revenue}
                    onChange={(e) => setCreateForm({ ...createForm, revenue: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" className="bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit">Create Trip</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Complete Dispatched Trip</h3>
            <form onSubmit={handleCompleteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500">Actual Distance (km)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 362"
                  value={completeForm.actualDistance}
                  onChange={(e) => setCompleteForm({ ...completeForm, actualDistance: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Fuel Consumed (L)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 42"
                  value={completeForm.fuelConsumed}
                  onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Final Odometer (km)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 120500"
                  value={completeForm.finalOdometer}
                  onChange={(e) => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Final Revenue (₹) - Optional</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Leave empty to keep planned revenue"
                  value={completeForm.revenue}
                  onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" className="bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" onClick={() => setShowCompleteModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Submit Completion</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
