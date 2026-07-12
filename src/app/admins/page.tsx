'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { API_BASE } from '@/lib/api';
import { Field, GhostBtn, Modal, PrimaryBtn, StatusBadge, inputCls } from '@/components/ui/kit';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
};

const EMPTY = { email: '', password: '', name: '', role: 'super_admin' };

export default function AdminUsersPage() {
  const { token, session } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAdmins = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load admins');
      setAdmins(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, [token]);

  const handleCreate = async () => {
    setFormError('');
    if (!form.email || !form.password || !form.name) {
      setFormError('All fields are required');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message ?? 'Failed to create admin');
      }
      setCreating(false);
      setForm(EMPTY);
      fetchAdmins();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? They will no longer be able to login.`)) return;
    try {
      await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdmins();
    } catch {
      alert('Failed to deactivate admin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1E17]">Admin Users</h1>
          <p className="text-[#8C7E77] text-xs mt-1">
            Manage administrator accounts with role-based access control.
          </p>
        </div>
        <PrimaryBtn onClick={() => { setForm(EMPTY); setFormError(''); setCreating(true); }}>
          + Add Admin
        </PrimaryBtn>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white border border-[#EFE6DD] rounded-2xl shadow-sm overflow-hidden animate-rise-in">
        <table className="w-full text-left text-xs text-[#8C7E77]">
          <thead className="border-b border-[#EFE6DD]">
            <tr>
              {['Admin', 'Role', 'Status', 'Last Login', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-4 font-bold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-[#EFE6DD]">
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-3 bg-[#EFE6DD] rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : admins.map((admin) => (
              <tr key={admin.id} className="border-b border-[#EFE6DD] hover:bg-[#FAF6F0]/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8C5A3C] to-[#D99B26] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {admin.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D1E17]">{admin.name}</p>
                      <p className="text-[10px]">{admin.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-[#8C5A3C] text-[10px] bg-[#8C5A3C]/10 px-2 py-1 rounded-full">
                    {ROLE_LABELS[admin.role] ?? admin.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={admin.isActive ? 'Active' : 'Inactive'} />
                </td>
                <td className="px-6 py-4 text-[#2D1E17]">
                  {admin.lastLoginAt
                    ? new Date(admin.lastLoginAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Never'}
                </td>
                <td className="px-6 py-4">
                  {admin.id !== session?.id && admin.isActive && (
                    <button
                      onClick={() => handleDeactivate(admin.id, admin.name)}
                      className="text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 font-semibold text-[10px] px-3 py-1.5 rounded-lg transition-all"
                    >
                      Deactivate
                    </button>
                  )}
                  {admin.id === session?.id && (
                    <span className="text-[10px] text-[#8C7E77] font-semibold bg-[#8C7E77]/10 px-2 py-1 rounded-full">Current User</span>
                  )}
                  {!admin.isActive && (
                    <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-1 rounded-full">Inactive</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center text-[#8C7E77]">
                  <div className="text-3xl mb-2">👤</div>
                  <p className="text-sm font-medium">No admin users found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Admin Modal */}
      <Modal title="Add Admin User" open={creating} onClose={() => setCreating(false)}>
        <div className="space-y-4">
          <Field label="Full Name *">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
            />
          </Field>
          <Field label="Email Address *">
            <input
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="priya@prarthna.com"
            />
          </Field>
          <Field label="Password * (min 8 chars)">
            <input
              type="password"
              className={inputCls}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </Field>

          {formError && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              ⚠️ {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <GhostBtn onClick={() => setCreating(false)}>Cancel</GhostBtn>
            <PrimaryBtn onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating…' : 'Create Admin'}
            </PrimaryBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
