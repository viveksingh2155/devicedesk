import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Laptop,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Cpu,
  Hash,
  AlertTriangle,
  PlusCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { AssetCategory } from '../../types';

export const MyDevicesModule: React.FC = () => {
  const { currentUser, assets, setCurrentView, setSelectedAssetId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Employee only sees assigned to them, Admin or IT can see all or filter
  const isEmployee = currentUser.role === 'employee';
  const relevantDevices = isEmployee
    ? assets.filter((a) => a.assignedTo === currentUser.employeeId)
    : assets;

  const filteredDevices = relevantDevices.filter((dev) => {
    const matchesSearch =
      dev.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || dev.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getWarrantyDaysRemaining = (expiryDateStr: string) => {
    const expiry = new Date(expiryDateStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((expiry - now) / (1000 * 3600 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-forest uppercase tracking-wider">
            {isEmployee ? 'Personal Hardware Custody' : 'Enterprise Device Directory'}
          </div>
          <h2 className="text-2xl font-bold text-desk-primary tracking-tight">
            {isEmployee ? 'My Assigned Devices' : 'Assigned IT Asset Registry'}
          </h2>
          <p className="text-xs text-desk-secondary mt-1">
            {isEmployee
              ? `You currently hold ${relevantDevices.length} enterprise IT asset(s) registered under Employee ID ${currentUser.employeeId}.`
              : 'Managing all company laptops, workstations, peripherals, and network components.'}
          </p>
        </div>

        <button
          onClick={() => setCurrentView('raise_ticket')}
          className="desk-btn-primary py-2 text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Device Issue</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="desk-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-desk-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by device, serial number, model..."
            className="desk-input w-full pl-9 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-desk-secondary shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="desk-input text-xs py-2 w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            <option value="Laptop">Laptops</option>
            <option value="Monitor">Monitors</option>
            <option value="Desktop">Desktops</option>
            <option value="Mobile">Mobile Devices</option>
            <option value="Network">Network Devices</option>
          </select>
        </div>
      </div>

      {/* Devices Grid */}
      {filteredDevices.length === 0 ? (
        <div className="desk-card p-12 text-center text-xs text-desk-secondary">
          <Laptop className="w-10 h-10 text-desk-secondary mx-auto mb-3 opacity-40" />
          <h4 className="font-semibold text-sm text-desk-primary">No devices match your criteria</h4>
          <p className="mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDevices.map((dev) => {
            const warrantyDays = getWarrantyDaysRemaining(dev.warrantyExpiry);
            const isWarrantyActive = warrantyDays > 0;

            return (
              <div
                key={dev.assetId}
                className="desk-card p-5 flex flex-col justify-between space-y-4 hover:border-olive transition-all group"
              >
                <div>
                  {/* Top Bar: Icon + Category + Condition */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-cream transition-colors">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-desk-secondary">
                          {dev.category}
                        </span>
                        <div className="font-mono text-xs font-bold text-forest">
                          {dev.assetId}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        dev.condition === 'Excellent'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : dev.condition === 'Good'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {dev.condition}
                    </span>
                  </div>

                  {/* Device Name and Model */}
                  <h3 className="font-bold text-sm text-desk-primary group-hover:text-forest transition-colors">
                    {dev.deviceName}
                  </h3>
                  <p className="text-xs text-desk-secondary mt-0.5 line-clamp-2">
                    {dev.model}
                  </p>

                  {/* Specs Pill */}
                  {dev.specs && (
                    <div className="mt-2.5 p-2 rounded-lg bg-desk-bg/80 border border-desk-border text-[11px] text-desk-primary leading-relaxed">
                      <Cpu className="w-3 h-3 text-olive inline mr-1" />
                      {dev.specs}
                    </div>
                  )}

                  {/* Detailed Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 mt-3 border-t border-desk-border">
                    <div>
                      <span className="text-[10px] text-desk-secondary block">Serial Number</span>
                      <span className="font-mono font-medium text-desk-primary">{dev.serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-desk-secondary block">Manufacturer</span>
                      <span className="font-medium text-desk-primary">{dev.manufacturer}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-desk-secondary block">Purchase Date</span>
                      <span className="text-desk-primary">{dev.purchaseDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-desk-secondary block">Warranty Status</span>
                      <span
                        className={`font-semibold inline-flex items-center gap-1 ${
                          isWarrantyActive ? 'text-forest' : 'text-red-600'
                        }`}
                      >
                        {isWarrantyActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            {warrantyDays} days left
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Expired
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {!isEmployee && (
                    <div className="mt-2 pt-2 border-t border-desk-border text-xs flex items-center justify-between text-desk-secondary">
                      <span>Assigned To:</span>
                      <span className="font-medium text-desk-primary">
                        {dev.assignedToName || 'Unassigned / Available'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setCurrentView('raise_ticket');
                    }}
                    className="w-full desk-btn-secondary text-xs py-2 justify-center"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-forest" />
                    <span>Report Problem with this Device</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
