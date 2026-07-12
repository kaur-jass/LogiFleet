import React, { useState, useEffect } from 'react';
import Card from './Card';
import Table from './Table';
import Button from './Button';
import API from '../api/axios';
import { getFuelLogs, createFuelLog } from '../services/fuelService';

export default function FuelPageContent() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [role, setRole] = useState('');

  // Form State
  const [form, setForm] = useState({
    vehicleId: '',
    liters: '',
    cost: '',
    tripId: '',
    date: new Date().toISOString().substring(0, 10),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFuelLogs();
      setFuelLogs(res.data?.logs || []);
    } catch (err) {
      setError('Failed to fetch fuel logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setRole(localStorage.getItem('role') || '');
  }, []);

  const openLogModal = async () => {
    try {
      const res = await API.get('/vehicles');
      setVehicles(res.data?.data?.vehicles || []);
      setShowModal(true);
    } catch (err) {
      alert('Failed to load vehicles list.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFuelLog({
        vehicleId: form.vehicleId,
        tripId: form.tripId.trim() || null,
        liters: parseFloat(form.liters),
        cost: parseFloat(form.cost),
        date: new Date(form.date),
      });
      setShowModal(false);
      setForm({
        vehicleId: '',
        liters: '',
        cost: '',
        tripId: '',
        date: new Date().toISOString().substring(0, 10),
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to log fuel log');
    }
  };

  const columns = [
    { key: 'id', label: 'Log ID', render: (row) => row.id.substring(0, 8) },
    { key: 'vehicle', label: 'Vehicle', render: (row) => row.vehicle ? `${row.vehicle.name} [${row.vehicle.regNumber}]` : row.vehicleId.substring(0, 8) },
    { key: 'liters', label: 'Liters (L)', render: (row) => `${row.liters} L` },
    { key: 'cost', label: 'Cost', render: (row) => `₹${row.cost.toLocaleString()}` },
    { key: 'date', label: 'Date Registered', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'trip', label: 'Linked Trip', render: (row) => row.trip ? `${row.trip.source} → ${row.trip.destination}` : 'None' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Fuel Logs</h2>
        {(role === 'FLEET_MANAGER' || role === 'DRIVER') && (
          <Button onClick={openLogModal}>Log Fuel Fill</Button>
        )}
      </div>

      <Card title="Fuel Transaction Logs">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading fuel logs...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : fuelLogs.length > 0 ? (
          <Table columns={columns} data={fuelLogs} />
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">No fuel records logged yet.</div>
        )}
      </Card>

      {/* LOG FUEL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Fuel Transaction</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500">Vehicle</label>
                <select
                  required
                  value={form.vehicleId}
                  onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} [{v.licensePlate}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500">Liters (L)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 45.5"
                    value={form.liters}
                    onChange={(e) => setForm({ ...form, liters: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Total Cost (₹)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 3500"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500">Linked Trip ID (Optional)</label>
                <input
                  type="text"
                  placeholder="Paste UUID if linking to active/completed trip"
                  value={form.tripId}
                  onChange={(e) => setForm({ ...form, tripId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" className="bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Submit Log</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
