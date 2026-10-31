import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  Headphones,
  UserCheck,
  CheckCircle2,
  XCircle,
  Laptop,
  Ticket,
  Edit2,
  Lock,
  Unlock,
  X,
  Phone,
  Mail,
  Building
} from 'lucide-react';

export const EmployeeManagementModule: React.FC = () => {
  const {
    users,
    assets,
    tickets,
    createUser,
    updateUser,
    toggleUserStatus,
    setSelectedTicketId,
    setCurrentView
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState<UserRole>('employee');
  const [phone, setPhone] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesDept = departmentFilter === 'all' || u.department === departmentFilter;

    return matchesSearch && matchesRole && matchesDept;
  });

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setDepartment(u.department);
    setRole(u.role);
    setPhone(u.phone || '');
    setShowAddModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (editingUser) {
      updateUser(editingUser.employeeId, {
        name,
        email,
        department,
        role,
        phone
      });
    } else {
      createUser({
        name,
        email,
        department,
        role,
        phone
      });
    }

    setShowAddModal(false);
    setEditingUser(null);
    setName('');
    setEmail('');
    setDepartment('Engineering');
    setRole('employee');
    setPhone('');
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-forest text-cream">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        );
      case 'it_support':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-olive-light/40 text-olive-dark border border-olive/30">
            <Headphones className="w-3 h-3" />
            IT Support
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sage-light/40 text-forest-dark border border-sage/40">
            <UserCheck className="w-3 h-3" />
            Employee
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-forest uppercase tracking-wider">
            Identity & Access Management (IAM)
          </div>
          <h2 className="text-2xl font-bold text-desk-primary tracking-tight">
            Employee Directory & Role RBAC
          </h2>
          <p className="text-xs text-desk-secondary mt-1">
            Manage organization members, assigned hardware custody, active support queues, and permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setName('');
            setEmail('');
            setDepartment('Engineering');
            setRole('employee');
            setPhone('');
            setShowAddModal(true);
          }}
          className="desk-btn-primary py-2 text-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="desk-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-desk-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, email, department..."
            className="desk-input w-full pl-9 py-2 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-desk-secondary">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="desk-input py-1.5 px-2 text-xs"
            >
              <option value="all">All Roles</option>
              <option value="employee">Employees</option>
              <option value="it_support">IT Support Agents</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-desk-secondary">
            <span>Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="desk-input py-1.5 px-2 text-xs"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="IT Operations">IT Operations</option>
              <option value="Enterprise Infrastructure">Enterprise Infrastructure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="desk-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-desk-border text-[11px] uppercase tracking-wider text-desk-secondary bg-desk-bg/50">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Assets</th>
                <th className="py-3 px-4">Active Tickets</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-desk-border text-xs">
              {filteredUsers.map((user) => {
                const userAssets = assets.filter((a) => a.assignedTo === user.employeeId);
                const userTickets = tickets.filter(
                  (t) => t.requesterId === user.employeeId && (t.status === 'Open' || t.status === 'In Progress')
                );

                return (
                  <tr key={user.employeeId} className="hover:bg-cream-light/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-xl object-cover border border-desk-border"
                        />
                        <div>
                          <div className="font-bold text-desk-primary">{user.name}</div>
                          <div className="text-[11px] font-mono text-desk-secondary">
                            {user.employeeId} • {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-desk-secondary font-medium">
                      {user.department}
                    </td>

                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedUserDetail(user)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-dark"
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span>{userAssets.length} Device(s)</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          userTickets.length > 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-desk-bg text-desk-secondary border border-desk-border'
                        }`}
                      >
                        {userTickets.length} active
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                          user.accountStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        {user.accountStatus === 'active' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-stone-500" />
                        )}
                        {user.accountStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Edit Profile & Role"
                          className="p-1.5 rounded-lg border border-desk-border hover:bg-desk-bg text-desk-secondary transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => toggleUserStatus(user.employeeId)}
                          title={user.accountStatus === 'active' ? 'Deactivate Account' : 'Activate Account'}
                          className={`p-1.5 rounded-lg border border-desk-border transition-colors ${
                            user.accountStatus === 'active'
                              ? 'hover:bg-amber-50 hover:text-amber-700 text-desk-secondary'
                              : 'hover:bg-emerald-50 hover:text-emerald-700 text-desk-secondary'
                          }`}
                        >
                          {user.accountStatus === 'active' ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="desk-card max-w-md w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-center justify-between border-b border-desk-border pb-3">
              <h3 className="font-bold text-base text-desk-primary">
                {editingUser ? `Edit Employee – ${editingUser.employeeId}` : 'Register New Employee'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-desk-secondary hover:text-desk-primary p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-desk-primary mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="desk-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-desk-primary mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya.sharma@devicedesk.internal"
                  className="desk-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="desk-input w-full"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="IT Operations">IT Operations</option>
                    <option value="Enterprise Infrastructure">Enterprise Infrastructure</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="desk-input w-full"
                  >
                    <option value="employee">Employee</option>
                    <option value="it_support">IT Support Agent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-desk-primary mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="desk-input w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-desk-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="desk-btn-secondary py-1.5 px-3"
                >
                  Cancel
                </button>
                <button type="submit" className="desk-btn-primary py-1.5 px-4">
                  {editingUser ? 'Save Updates' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Details Modal (Assets & Tickets) */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="desk-card max-w-lg w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-center justify-between border-b border-desk-border pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserDetail.avatar}
                  alt={selectedUserDetail.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-desk-primary">{selectedUserDetail.name}</h3>
                  <p className="text-xs text-desk-secondary">
                    {selectedUserDetail.employeeId} • {selectedUserDetail.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="text-desk-secondary hover:text-desk-primary p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-desk-secondary">
                Assigned Hardware Devices:
              </h4>
              {assets.filter((a) => a.assignedTo === selectedUserDetail.employeeId).length === 0 ? (
                <div className="p-3 rounded-lg bg-desk-bg text-desk-secondary text-center">
                  No devices currently assigned.
                </div>
              ) : (
                <div className="space-y-2">
                  {assets
                    .filter((a) => a.assignedTo === selectedUserDetail.employeeId)
                    .map((a) => (
                      <div
                        key={a.assetId}
                        className="p-2.5 rounded-lg bg-desk-bg border border-desk-border flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-desk-primary">{a.deviceName}</div>
                          <div className="text-[10px] text-desk-secondary font-mono">
                            {a.assetId} • {a.serialNumber}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-desk-border">
                          {a.condition}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <h4 className="font-bold text-xs uppercase tracking-wider text-desk-secondary pt-2">
                Active Support Tickets:
              </h4>
              {tickets.filter((t) => t.requesterId === selectedUserDetail.employeeId).length === 0 ? (
                <div className="p-3 rounded-lg bg-desk-bg text-desk-secondary text-center">
                  No tickets on record.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {tickets
                    .filter((t) => t.requesterId === selectedUserDetail.employeeId)
                    .map((t) => (
                      <div
                        key={t.ticketId}
                        onClick={() => {
                          setSelectedTicketId(t.ticketId);
                          setSelectedUserDetail(null);
                          setCurrentView('ticket_details');
                        }}
                        className="p-2 rounded bg-desk-bg border border-desk-border flex items-center justify-between cursor-pointer hover:bg-cream-light/30 transition-colors"
                      >
                        <div className="truncate mr-2">
                          <span className="font-mono font-bold text-forest mr-1.5">{t.ticketId}</span>
                          <span className="text-desk-primary">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white">
                          {t.status}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-desk-border">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="desk-btn-secondary py-1 px-3 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
