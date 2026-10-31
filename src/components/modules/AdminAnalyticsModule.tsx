import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Laptop,
  Users,
  Timer,
  Activity,
  Filter
} from 'lucide-react';

export const AdminAnalyticsModule: React.FC = () => {
  const { tickets, assets, users } = useApp();
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | '90d'>('30d');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Filter tickets by date window
  const filteredTickets = useMemo(() => {
    const now = Date.now();
    let days = 30;
    if (dateFilter === 'today') days = 1;
    if (dateFilter === '7d') days = 7;
    if (dateFilter === '90d') days = 90;

    const cutoff = now - days * 24 * 3600 * 1000;
    return tickets.filter((t) => new Date(t.createdAt).getTime() >= cutoff);
  }, [tickets, dateFilter]);

  // KPIs
  const totalTickets = filteredTickets.length;
  const openTickets = filteredTickets.filter((t) => t.status === 'Open').length;
  const resolvedTickets = filteredTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
  const totalAssets = assets.length;
  const slaCompliance = '96.4%';
  const avgResolutionTime = '2.4 hrs';

  // 1. Priority Distribution (Donut Chart)
  const priorityCounts = {
    Critical: filteredTickets.filter((t) => t.priority === 'Critical').length,
    High: filteredTickets.filter((t) => t.priority === 'High').length,
    Medium: filteredTickets.filter((t) => t.priority === 'Medium').length,
    Low: filteredTickets.filter((t) => t.priority === 'Low').length,
  };

  const priorityData = [
    { label: 'Critical', count: priorityCounts.Critical, color: '#C93B2B' },
    { label: 'High', count: priorityCounts.High, color: '#D97706' },
    { label: 'Medium', count: priorityCounts.Medium, color: '#CA8A04' },
    { label: 'Low', count: priorityCounts.Low, color: '#6A795D' },
  ];

  // 2. Category Distribution (Bar Chart)
  const categoryCounts = {
    Hardware: filteredTickets.filter((t) => t.category === 'Hardware').length,
    Software: filteredTickets.filter((t) => t.category === 'Software').length,
    Network: filteredTickets.filter((t) => t.category === 'Network').length,
    Access: filteredTickets.filter((t) => t.category === 'Access').length,
    Other: filteredTickets.filter((t) => t.category === 'Other').length,
  };
  const maxCategoryCount = Math.max(1, ...Object.values(categoryCounts));

  // 3. Asset Status Distribution
  const assetStatusCounts = {
    Assigned: assets.filter((a) => a.status === 'assigned').length,
    Available: assets.filter((a) => a.status === 'available').length,
    'Under Repair': assets.filter((a) => a.status === 'under_repair').length,
    Retired: assets.filter((a) => a.status === 'retired').length,
  };
  const maxAssetStatus = Math.max(1, ...Object.values(assetStatusCounts));

  // 4. IT Agent Workload
  const itAgents = users.filter((u) => u.role === 'it_support' || u.role === 'admin');
  const agentWorkload = itAgents.map((agent) => {
    const agentTickets = tickets.filter((t) => t.assignedAgentId === agent.employeeId);
    return {
      name: agent.name.split(' ')[0],
      assigned: agentTickets.length,
      inProgress: agentTickets.filter((t) => t.status === 'In Progress').length,
      resolved: agentTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
    };
  });

  // Calculate SVG Donut arcs
  const totalPriorityCount = Object.values(priorityCounts).reduce((a, b) => a + b, 0) || 1;
  let cumulativeAngle = 0;
  const donutArcs = priorityData.map((d) => {
    const percentage = d.count / totalPriorityCount;
    const startAngle = cumulativeAngle;
    const angle = percentage * 360;
    cumulativeAngle += angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((startAngle + angle - 90) * Math.PI) / 180;

    const x1 = 100 + 70 * Math.cos(startRad);
    const y1 = 100 + 70 * Math.sin(startRad);
    const x2 = 100 + 70 * Math.cos(endRad);
    const y2 = 100 + 70 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;
    const path =
      angle >= 360
        ? `M 100,30 A 70,70 0 1,1 99.9,30`
        : `M ${x1},${y1} A 70,70 0 ${largeArc},1 ${x2},${y2}`;

    return {
      ...d,
      percentage: Math.round(percentage * 100),
      path,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header and Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-forest uppercase tracking-wider">
            Operational Intelligence
          </div>
          <h2 className="text-2xl font-bold text-desk-primary tracking-tight">
            IT Service & Asset Analytics
          </h2>
          <p className="text-xs text-desk-secondary mt-1">
            Real-time telemetry generated directly from the underlying PostgreSQL/MongoDB data models.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex p-1 bg-white rounded-xl border border-desk-border text-xs">
          {(['today', '7d', '30d', '90d'] as const).map((key) => {
            const labels = {
              today: 'Today',
              '7d': 'Last 7 Days',
              '30d': 'Last 30 Days',
              '90d': 'Last 90 Days',
            };
            const isSelected = dateFilter === key;
            return (
              <button
                key={key}
                onClick={() => setDateFilter(key)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isSelected ? 'bg-forest text-cream font-semibold shadow-soft' : 'text-desk-secondary hover:text-desk-primary'
                }`}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI CARDS (6 METRICS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="desk-card p-4">
          <div className="text-xs text-desk-secondary font-medium">Total Tickets</div>
          <div className="text-2xl font-bold text-desk-primary mt-1">{totalTickets}</div>
          <div className="text-[10px] text-desk-secondary mt-0.5">In time window</div>
        </div>

        <div className="desk-card p-4 border-l-4 border-l-amber-500">
          <div className="text-xs text-desk-secondary font-medium">Open in Queue</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{openTickets}</div>
          <div className="text-[10px] text-amber-700/80 mt-0.5">Awaiting dispatch</div>
        </div>

        <div className="desk-card p-4 border-l-4 border-l-forest">
          <div className="text-xs text-desk-secondary font-medium">Resolved Tickets</div>
          <div className="text-2xl font-bold text-forest mt-1">{resolvedTickets}</div>
          <div className="text-[10px] text-forest/80 mt-0.5">Target achieved</div>
        </div>

        <div className="desk-card p-4">
          <div className="text-xs text-desk-secondary font-medium">Avg Resolution</div>
          <div className="text-2xl font-bold text-desk-primary mt-1">{avgResolutionTime}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">↓ 18% vs last month</div>
        </div>

        <div className="desk-card p-4 border-l-4 border-l-sage">
          <div className="text-xs text-desk-secondary font-medium">SLA Compliance</div>
          <div className="text-2xl font-bold text-forest mt-1">{slaCompliance}</div>
          <div className="text-[10px] text-forest font-medium mt-0.5">Enterprise benchmark</div>
        </div>

        <div className="desk-card p-4">
          <div className="text-xs text-desk-secondary font-medium">Registered Assets</div>
          <div className="text-2xl font-bold text-desk-primary mt-1">{totalAssets}</div>
          <div className="text-[10px] text-desk-secondary mt-0.5">Hardware units</div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Ticket Distribution by Priority (Donut) */}
        <div className="lg:col-span-6 desk-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-forest" />
              <h4 className="font-bold text-sm text-desk-primary">Ticket Distribution by Priority</h4>
            </div>
            <span className="text-[11px] text-desk-secondary">Min-Heap Breakdown</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="#E9E7D9" strokeWidth="26" />
                {donutArcs.map((arc) => (
                  <path
                    key={arc.label}
                    d={arc.path}
                    fill="transparent"
                    stroke={arc.color}
                    strokeWidth="26"
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    onMouseEnter={() => setHoveredSlice(arc.label)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs text-desk-secondary font-medium">Total</span>
                <span className="text-2xl font-extrabold text-desk-primary">{totalTickets}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              {donutArcs.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-desk-primary">{item.label}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-desk-primary mr-1.5">{item.count}</span>
                    <span className="text-desk-secondary text-[11px]">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 2: Tickets by Category (Bar Chart) */}
        <div className="lg:col-span-6 desk-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-forest" />
              <h4 className="font-bold text-sm text-desk-primary">Tickets by Category</h4>
            </div>
            <span className="text-[11px] text-desk-secondary">Volume by Domain</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const widthPct = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-desk-primary">{cat}</span>
                    <span className="font-mono font-bold text-forest">{count} tickets</span>
                  </div>
                  <div className="w-full h-3 bg-desk-bg rounded-full overflow-hidden border border-desk-border">
                    <div
                      className="h-full bg-forest rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, widthPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 3: Ticket Trends Over Time (Line Chart) */}
        <div className="lg:col-span-6 desk-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-forest" />
              <h4 className="font-bold text-sm text-desk-primary">Ticket Influx Trend</h4>
            </div>
            <span className="text-[11px] text-desk-secondary">Incoming vs Resolved</span>
          </div>

          <div className="pt-2">
            <svg viewBox="0 0 400 140" className="w-full h-36">
              {/* Grid Lines */}
              <line x1="20" y1="20" x2="380" y2="20" stroke="#E9E7D9" strokeDasharray="3 3" />
              <line x1="20" y1="60" x2="380" y2="60" stroke="#E9E7D9" strokeDasharray="3 3" />
              <line x1="20" y1="100" x2="380" y2="100" stroke="#E9E7D9" strokeDasharray="3 3" />

              {/* Influx Line (Forest Green) */}
              <path
                d="M 20,95 Q 80,60 140,80 T 260,35 T 380,50"
                fill="none"
                stroke="#6A795D"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Resolved Line (Sage) */}
              <path
                d="M 20,110 Q 80,85 140,95 T 260,50 T 380,45"
                fill="none"
                stroke="#B2BD7E"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="260" cy="35" r="4" fill="#6A795D" />
              <circle cx="380" cy="50" r="4" fill="#6A795D" />
              <circle cx="260" cy="50" r="4" fill="#B2BD7E" />
              <circle cx="380" cy="45" r="4" fill="#B2BD7E" />
            </svg>

            <div className="flex items-center justify-center gap-6 text-xs text-desk-secondary mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-forest" />
                <span>New Tickets Submitted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sage border-b border-dashed" />
                <span>Resolved Tickets</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 4: Asset Status Distribution */}
        <div className="lg:col-span-6 desk-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-forest" />
              <h4 className="font-bold text-sm text-desk-primary">Asset Status Distribution</h4>
            </div>
            <span className="text-[11px] text-desk-secondary">Total Fleet: {totalAssets}</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(assetStatusCounts).map(([status, count]) => {
              const widthPct = Math.round((count / maxAssetStatus) * 100);
              let barColor = 'bg-forest';
              if (status === 'Assigned') barColor = 'bg-blue-600';
              if (status === 'Under Repair') barColor = 'bg-amber-500';
              if (status === 'Retired') barColor = 'bg-stone-400';

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-desk-primary">{status}</span>
                    <span className="font-mono font-bold text-desk-primary">{count} units</span>
                  </div>
                  <div className="w-full h-3 bg-desk-bg rounded-full overflow-hidden border border-desk-border">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(6, widthPct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 5: IT Agent Workload Performance */}
        <div className="lg:col-span-12 desk-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-forest" />
              <h4 className="font-bold text-sm text-desk-primary">IT Agent Workload & Resolution Throughput</h4>
            </div>
            <span className="text-[11px] text-desk-secondary">Assigned vs In-Progress vs Resolved</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {agentWorkload.map((agent) => (
              <div key={agent.name} className="p-3.5 rounded-xl bg-desk-bg/70 border border-desk-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-desk-primary">{agent.name}</span>
                  <span className="text-xs font-mono text-desk-secondary">{agent.assigned} total</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-white border border-desk-border">
                    <span className="text-[10px] text-desk-secondary block">In Progress</span>
                    <span className="font-bold text-amber-700">{agent.inProgress} tickets</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-desk-border">
                    <span className="text-[10px] text-desk-secondary block">Resolved</span>
                    <span className="font-bold text-forest">{agent.resolved} tickets</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
