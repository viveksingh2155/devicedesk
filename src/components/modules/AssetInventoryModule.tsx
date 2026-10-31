import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetCategory, AssetStatus, DeviceCondition } from '../../types';
import {
  Boxes,
  PlusCircle,
  Search,
  Filter,
  Laptop,
  CheckCircle2,
  Wrench,
  Archive,
  UserCheck,
  Trash2,
  Edit2,
  UserX,
  X,
  AlertTriangle
} from 'lucide-react';

export const AssetInventoryModule: React.FC = () => {
  const {
    assets,
    users,
    createAsset,
    updateAsset,
    deleteAsset,
    assignAsset,
    unassignAsset
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assigningAsset, setAssigningAsset] = useState<Asset | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState<Partial<Asset>>({
    deviceName: '',
    category: 'Laptop',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
    status: 'available',
    condition: 'Excellent',
    specs: ''
  });

  const [targetEmployeeId, setTargetEmployeeId] = useState('');

  // Counts
  const totalAssets = assets.length;
  const assignedCount = assets.filter((a) => a.status === 'assigned').length;
  const availableCount = assets.filter((a) => a.status === 'available').length;
  const repairCount = assets.filter((a) => a.status === 'under_repair').length;
  const retiredCount = assets.filter((a) => a.status === 'retired').length;

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.assignedToName && asset.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({ ...asset });
    setShowAddModal(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deviceName || !formData.manufacturer) return;

    if (editingAsset) {
      updateAsset(editingAsset.assetId, formData);
    } else {
      createAsset(formData);
    }

    setShowAddModal(false);
    setEditingAsset(null);
    setFormData({
      deviceName: '',
      category: 'Laptop',
      manufacturer: '',
      model: '',
      serialNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyExpiry: new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
      status: 'available',
      condition: 'Excellent',
      specs: ''
    });
  };

  const handleConfirmAssign = () => {
    if (!assigningAsset || !targetEmployeeId) return;
    assignAsset(assigningAsset.assetId, targetEmployeeId);
    setAssigningAsset(null);
    setTargetEmployeeId('');
  };

  const handleConfirmDelete = () => {
    if (!deletingAssetId) return;
    deleteAsset(deletingAssetId);
    setDeletingAssetId(null);
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'available':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'under_repair':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'retired':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      default:
        return 'bg-desk-bg text-desk-secondary border-desk-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-forest uppercase tracking-wider">
            Enterprise Asset Management
          </div>
          <h2 className="text-2xl font-bold text-desk-primary tracking-tight">
            IT Asset Inventory & Hardware Registry
          </h2>
          <p className="text-xs text-desk-secondary mt-1">
            Track hardware lifecycle, warranty coverage, employee custody, and maintenance status.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAsset(null);
            setFormData({
              deviceName: '',
              category: 'Laptop',
              manufacturer: '',
              model: '',
              serialNumber: '',
              purchaseDate: new Date().toISOString().split('T')[0],
              warrantyExpiry: new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
              status: 'available',
              condition: 'Excellent',
              specs: ''
            });
            setShowAddModal(true);
          }}
          className="desk-btn-primary py-2 text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="desk-card p-4">
          <div className="text-xs text-desk-secondary font-medium">Total Assets</div>
          <div className="text-2xl font-bold text-desk-primary mt-1">{totalAssets}</div>
          <div className="text-[10px] text-desk-secondary mt-0.5">Tracked units</div>
        </div>

        <div className="desk-card p-4 border-l-4 border-l-blue-500">
          <div className="text-xs text-desk-secondary font-medium">Assigned</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{assignedCount}</div>
          <div className="text-[10px] text-blue-700/80 mt-0.5">In active custody</div>
        </div>

        <div className="desk-card p-4 border-l-4 border-l-forest">
          <div className="text-xs text-desk-secondary font-medium">Available</div>
          <div className="text-2xl font-bold text-forest mt-1">{availableCount}</div>
          <div className="text-[10px] text-forest/80 mt-0.5">Ready for dispatch</div>
        </div>

        <div className="desk-card p-4 border-l-4 border-l-amber-500">
          <div className="text-xs text-desk-secondary font-medium">Under Repair</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{repairCount}</div>
          <div className="text-[10px] text-amber-700/80 mt-0.5">In maintenance</div>
        </div>

        <div className="desk-card p-4 border-l-4 border-l-stone-400">
          <div className="text-xs text-desk-secondary font-medium">Retired</div>
          <div className="text-2xl font-bold text-stone-700 mt-1">{retiredCount}</div>
          <div className="text-[10px] text-stone-600 mt-0.5">Decommissioned</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="desk-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-desk-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by asset ID, model, serial, employee..."
            className="desk-input w-full pl-9 py-2 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-desk-secondary">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="desk-input py-1.5 px-2 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="available">Available</option>
              <option value="under_repair">Under Repair</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-desk-secondary">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="desk-input py-1.5 px-2 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="Laptop">Laptop</option>
              <option value="Monitor">Monitor</option>
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Network">Network</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="desk-card overflow-hidden">
        {filteredAssets.length === 0 ? (
          <div className="p-12 text-center text-xs text-desk-secondary">
            <Boxes className="w-10 h-10 text-desk-secondary mx-auto mb-2 opacity-50" />
            <p>No assets match your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-desk-border text-[11px] uppercase tracking-wider text-desk-secondary bg-desk-bg/50">
                  <th className="py-3 px-3.5">Asset ID</th>
                  <th className="py-3 px-3.5">Device Name & Model</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Serial Number</th>
                  <th className="py-3 px-3.5">Warranty Expiry</th>
                  <th className="py-3 px-3.5">Assigned Employee</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-desk-border text-xs">
                {filteredAssets.map((asset) => (
                  <tr key={asset.assetId} className="hover:bg-cream-light/30 transition-colors">
                    <td className="py-3.5 px-3.5 font-mono font-bold text-forest">
                      {asset.assetId}
                    </td>

                    <td className="py-3.5 px-3.5">
                      <div className="font-semibold text-desk-primary">{asset.deviceName}</div>
                      <div className="text-[11px] text-desk-secondary truncate max-w-xs">{asset.model}</div>
                    </td>

                    <td className="py-3.5 px-3.5 text-desk-secondary">
                      <span className="px-2 py-0.5 rounded bg-desk-bg border border-desk-border text-[11px]">
                        {asset.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 font-mono text-desk-primary">
                      {asset.serialNumber}
                    </td>

                    <td className="py-3.5 px-3.5 text-desk-secondary whitespace-nowrap">
                      {asset.warrantyExpiry}
                    </td>

                    <td className="py-3.5 px-3.5">
                      {asset.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-forest" />
                          <span className="font-medium text-desk-primary">{asset.assignedToName}</span>
                        </div>
                      ) : (
                        <span className="italic text-desk-secondary/60">Unassigned / In Stock</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getStatusBadge(
                          asset.status
                        )}`}
                      >
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {asset.status === 'assigned' ? (
                          <button
                            onClick={() => unassignAsset(asset.assetId)}
                            title="Unassign Device (Return to Stock)"
                            className="p-1.5 rounded-lg border border-desk-border hover:bg-amber-50 hover:text-amber-700 text-desk-secondary transition-colors"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setAssigningAsset(asset);
                              setTargetEmployeeId(users[0]?.employeeId || '');
                            }}
                            title="Assign to Employee"
                            className="p-1.5 rounded-lg border border-desk-border hover:bg-forest/10 hover:text-forest text-desk-secondary transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(asset)}
                          title="Edit Asset Details"
                          className="p-1.5 rounded-lg border border-desk-border hover:bg-desk-bg text-desk-secondary transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingAssetId(asset.assetId)}
                          title="Decommission / Delete Asset"
                          className="p-1.5 rounded-lg border border-desk-border hover:bg-red-50 hover:text-red-600 text-desk-secondary transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="desk-card max-w-lg w-full p-6 space-y-4 shadow-elevated my-8">
            <div className="flex items-center justify-between border-b border-desk-border pb-3">
              <h3 className="font-bold text-base text-desk-primary">
                {editingAsset ? `Edit Asset – ${editingAsset.assetId}` : 'Register New Hardware Asset'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-desk-secondary hover:text-desk-primary p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-desk-primary mb-1">Device Name *</label>
                <input
                  type="text"
                  required
                  value={formData.deviceName}
                  onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                  placeholder="e.g. Dell XPS 15 9530"
                  className="desk-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Dell"
                    className="desk-input w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                    className="desk-input w-full"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Network">Network</option>
                    <option value="Peripherals">Peripherals</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Model / Part Number</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Core i7 32GB"
                    className="desk-input w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="e.g. CN-098F41-74411"
                    className="desk-input w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="desk-input w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    className="desk-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                    className="desk-input w-full"
                  >
                    <option value="available">Available (In Stock)</option>
                    <option value="assigned">Assigned</option>
                    <option value="under_repair">Under Repair</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-desk-primary mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as DeviceCondition })}
                    className="desk-input w-full"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Service">Needs Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-desk-primary mb-1">Technical Specs & Notes</label>
                <textarea
                  rows={2}
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  placeholder="e.g. 14-core CPU, 32GB RAM, 1TB NVMe, Liquid Retina XDR"
                  className="desk-input w-full resize-none"
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
                  {editingAsset ? 'Save Asset Updates' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Device Modal */}
      {assigningAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="desk-card max-w-sm w-full p-6 space-y-4 shadow-elevated">
            <h3 className="font-bold text-sm text-desk-primary">
              Assign {assigningAsset.deviceName} ({assigningAsset.assetId})
            </h3>
            <p className="text-xs text-desk-secondary">
              Select an employee to checkout this hardware asset:
            </p>

            <select
              value={targetEmployeeId}
              onChange={(e) => setTargetEmployeeId(e.target.value)}
              className="desk-input w-full text-xs"
            >
              {users.map((u) => (
                <option key={u.employeeId} value={u.employeeId}>
                  {u.name} ({u.employeeId} • {u.department})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssigningAsset(null)}
                className="desk-btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                className="desk-btn-primary py-1.5 px-4 text-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAssetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="desk-card max-w-sm w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Asset Decommission</span>
            </div>
            <p className="text-xs text-desk-secondary leading-relaxed">
              Are you sure you want to delete asset <strong className="text-desk-primary font-mono">{deletingAssetId}</strong> from active inventory records?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingAssetId(null)}
                className="desk-btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="desk-btn-primary bg-red-600 hover:bg-red-700 py-1.5 px-4 text-xs"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
