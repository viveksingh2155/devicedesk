import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketPriority, TicketStatus } from '../../types';
import {
  ListOrdered,
  Play,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Headphones,
  Users,
  Timer,
  ChevronRight,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const ITSupportDashboard: React.FC = () => {
  const {
    tickets,
    queueTickets,
    processNextTicket,
    assignTicket,
    updateTicketPriority,
    updateTicketStatus,
    runAgingPolicy,
    users,
    currentUser,
    setSelectedTicketId,
    setCurrentView
  } = useApp();

  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState<string>('');
  const [activeTicketForModal, setActiveTicketForModal] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [newPriorityValue, setNewPriorityValue] = useState<TicketPriority>('Medium');

  // Priority counts strictly for currently OPEN tickets (waiting in queue)
  const openTickets = tickets.filter((t) => t.status === 'Open');
  const criticalOpenCount = openTickets.filter((t) => t.priority === 'Critical').length;
  const highOpenCount = openTickets.filter((t) => t.priority === 'High').length;
  const mediumOpenCount = openTickets.filter((t) => t.priority === 'Medium').length;
  const lowOpenCount = openTickets.filter((t) => t.priority === 'Low').length;

  // Status counts
  const totalOpen = openTickets.length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const onHoldCount = tickets.filter((t) => t.status === 'On Hold').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  // IT Agents list
  const itAgents = users.filter((u) => u.role === 'it_support' || u.role === 'admin');

  // Agent Workloads
  const agentWorkload = itAgents.map((agent) => {
    const assignedTickets = tickets.filter((t) => t.assignedAgentId === agent.employeeId);
    return {
      agent,
      inProgress: assignedTickets.filter((t) => t.status === 'In Progress').length,
      resolved: assignedTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
      total: assignedTickets.length,
    };
  });

  // Calculate waiting duration
  const getWaitingDuration = (dateStr: string) => {
    const elapsedMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(elapsedMs / (1000 * 60));
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  // SLA Deadline checks
  const ticketsNearSLA = tickets
    .filter((t) => t.status === 'Open' || t.status === 'In Progress')
    .map((t) => {
      const remainingMs = new Date(t.slaDeadline).getTime() - Date.now();
      const remainingMins = Math.round(remainingMs / (1000 * 60));
      return { ...t, remainingMins };
    })
    .sort((a, b) => a.remainingMins - b.remainingMins)
    .slice(0, 3);

  const handleProcessNext = async () => {
    await processNextTicket(currentUser.employeeId, currentUser.name);
  };

  const handleAssignSubmit = () => {
    if (!activeTicketForModal || !selectedAgentForAssign) return;
    const agent = users.find((u) => u.employeeId === selectedAgentForAssign);
    if (agent) {
      assignTicket(activeTicketForModal, agent.employeeId, agent.name);
      setShowAssignModal(false);
      setActiveTicketForModal(null);
    }
  };

  const handlePrioritySubmit = () => {
    if (!activeTicketForModal) return;
    updateTicketPriority(activeTicketForModal, newPriorityValue, 'IT Dispatcher calibration');
    setShowPriorityModal(false);
    setActiveTicketForModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Priority Queue Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur p-5 rounded-2xl border border-desk-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-forest">
              Operations Center
            </span>
            <span className="text-xs text-desk-secondary">•</span>
            <span className="text-xs text-desk-secondary">Min-Heap Dispatch Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-desk-primary tracking-tight mt-0.5">
            IT Support Dashboard & Live Queue
          </h2>
        </div>

        {/* Action Buttons: Process Next & Starvation Aging Check */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={runAgingPolicy}
            title="Checks if any tickets exceeded wait limits and escalates priority"
            className="desk-btn-secondary py-2 px-3 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-forest" />
            <span>Run SLA Aging Check</span>
          </button>

          <button
            onClick={handleProcessNext}
            disabled={queueTickets.length === 0}
            className="desk-btn-primary py-2 px-4 text-xs font-bold disabled:opacity-40 shadow-soft"
          >
            <Play className="w-3.5 h-3.5 fill-current text-cream" />
            <span>Process Next Ticket (O(log n))</span>
          </button>
        </div>
      </div>

      {/* TOP FOUR PRIORITY CARDS (WITH REAL COUNTS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CRITICAL */}
        <div className="desk-card p-5 border-l-4 border-l-red-600 bg-gradient-to-br from-red-50/40 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 tracking-wider uppercase">
              1. Critical Priority
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
              Score: 1
            </span>
          </div>
          <div className="text-3xl font-extrabold text-red-700 mt-2">
            {criticalOpenCount}
          </div>
          <p className="text-[11px] text-red-900/70 mt-1 font-medium">
            Open in waiting queue • 2h SLA
          </p>
        </div>

        {/* HIGH */}
        <div className="desk-card p-5 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/40 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 tracking-wider uppercase">
              2. High Priority
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              Score: 2
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-700 mt-2">
            {highOpenCount}
          </div>
          <p className="text-[11px] text-amber-900/70 mt-1 font-medium">
            Open in waiting queue • 4h SLA
          </p>
        </div>

        {/* MEDIUM */}
        <div className="desk-card p-5 border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50/40 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-700 tracking-wider uppercase">
              3. Medium Priority
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
              Score: 3
            </span>
          </div>
          <div className="text-3xl font-extrabold text-yellow-700 mt-2">
            {mediumOpenCount}
          </div>
          <p className="text-[11px] text-yellow-900/70 mt-1 font-medium">
            Open in waiting queue • 8h SLA
          </p>
        </div>

        {/* LOW */}
        <div className="desk-card p-5 border-l-4 border-l-forest bg-gradient-to-br from-sage-light/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest tracking-wider uppercase">
              4. Low Priority
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sage-light text-forest-dark">
              Score: 4
            </span>
          </div>
          <div className="text-3xl font-extrabold text-forest mt-2">
            {lowOpenCount}
          </div>
          <p className="text-[11px] text-forest/80 mt-1 font-medium">
            Open in waiting queue • 24h SLA
          </p>
        </div>
      </div>

      {/* OPERATIONAL STATUS METRIC ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="desk-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-desk-secondary">Total Open Tickets</div>
            <div className="text-xl font-bold text-desk-primary mt-0.5">{totalOpen}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-desk-bg flex items-center justify-center text-forest">
            <ListOrdered className="w-4 h-4" />
          </div>
        </div>

        <div className="desk-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-desk-secondary">In-Progress Tickets</div>
            <div className="text-xl font-bold text-blue-700 mt-0.5">{inProgressCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="desk-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-desk-secondary">On-Hold Tickets</div>
            <div className="text-xl font-bold text-stone-700 mt-0.5">{onHoldCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="desk-card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-desk-secondary">Resolved Tickets</div>
            <div className="text-xl font-bold text-forest mt-0.5">{resolvedCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-forest">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* LIVE PRIORITY QUEUE SECTION */}
      <div className="desk-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-desk-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-forest"></span>
              </span>
              <h3 className="font-bold text-base text-desk-primary">
                Live Priority Queue (Min-Heap Scheduled)
              </h3>
            </div>
            <p className="text-xs text-desk-secondary mt-0.5">
              Deterministic ordering: <code className="bg-desk-bg px-1 py-0.5 rounded font-mono text-forest">priority ASC, createdAt ASC, ticketId ASC</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cream-light text-olive-dark border border-cream">
              {queueTickets.length} Waiting Tickets
            </span>
          </div>
        </div>

        {queueTickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-desk-secondary">
            <CheckCircle2 className="w-10 h-10 text-forest mx-auto mb-2 opacity-50" />
            <h4 className="font-semibold text-sm text-desk-primary">Queue is Empty</h4>
            <p className="mt-0.5">All customer support tickets have been assigned or resolved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-desk-border text-[11px] uppercase tracking-wider text-desk-secondary bg-desk-bg/50">
                  <th className="py-2.5 px-3">Queue Rank</th>
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Issue Title</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Wait Duration</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-desk-border text-xs">
                {queueTickets.map((ticket, index) => {
                  const isTop = index === 0;
                  return (
                    <tr
                      key={ticket.ticketId}
                      className={`hover:bg-cream-light/30 transition-colors ${
                        isTop ? 'bg-cream-light/20 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                            isTop
                              ? 'bg-forest text-cream'
                              : 'bg-desk-bg text-desk-secondary border border-desk-border'
                          }`}
                        >
                          #{index + 1} {isTop ? 'NEXT' : ''}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-forest">
                        {ticket.ticketId}
                      </td>

                      <td className="py-3 px-3">
                        <div
                          onClick={() => {
                            setSelectedTicketId(ticket.ticketId);
                            setCurrentView('ticket_details');
                          }}
                          className="font-medium text-desk-primary hover:text-forest transition-colors cursor-pointer truncate max-w-xs"
                        >
                          {ticket.title}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-desk-primary">{ticket.requesterName}</div>
                        <div className="text-[10px] text-desk-secondary">{ticket.requesterDept}</div>
                      </td>

                      <td className="py-3 px-3 text-desk-secondary">
                        <span className="px-2 py-0.5 rounded bg-desk-bg border border-desk-border text-[11px]">
                          {ticket.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ticket.priority === 'Critical'
                              ? 'badge-critical'
                              : ticket.priority === 'High'
                              ? 'badge-high'
                              : ticket.priority === 'Medium'
                              ? 'badge-medium'
                              : 'badge-low'
                          }`}
                        >
                          {ticket.priority} (Score {ticket.priorityScore})
                        </span>
                      </td>

                      <td className="py-3 px-3 text-desk-secondary whitespace-nowrap">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-olive" />
                          {getWaitingDuration(ticket.createdAt)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign modal trigger */}
                          <button
                            onClick={() => {
                              setActiveTicketForModal(ticket.ticketId);
                              setSelectedAgentForAssign(currentUser.employeeId);
                              setShowAssignModal(true);
                            }}
                            className="p-1.5 rounded-lg border border-desk-border hover:bg-forest/10 hover:text-forest text-desk-secondary transition-colors"
                            title="Assign to Agent"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Priority Override trigger */}
                          <button
                            onClick={() => {
                              setActiveTicketForModal(ticket.ticketId);
                              setNewPriorityValue(ticket.priority);
                              setShowPriorityModal(true);
                            }}
                            className="p-1.5 rounded-lg border border-desk-border hover:bg-amber-50 hover:text-amber-700 text-desk-secondary transition-colors"
                            title="Change Priority Score"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Process button */}
                          <button
                            onClick={() => {
                              assignTicket(ticket.ticketId, currentUser.employeeId, currentUser.name);
                            }}
                            className="desk-btn-primary py-1 px-2.5 text-[11px]"
                          >
                            <span>Claim</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: AGENT WORKLOAD & SLA WATCHLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Agent Workload */}
        <div className="lg:col-span-7 desk-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-forest" />
              <h4 className="font-bold text-sm text-desk-primary">IT Support Agent Workload</h4>
            </div>
            <span className="text-[11px] text-desk-secondary">Real-Time Ticket Distribution</span>
          </div>

          <div className="space-y-3">
            {agentWorkload.map(({ agent, inProgress, resolved, total }) => (
              <div
                key={agent.employeeId}
                className="p-3 rounded-xl bg-desk-bg/70 border border-desk-border flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <div className="font-bold text-desk-primary">{agent.name}</div>
                    <div className="text-[10px] text-desk-secondary">{agent.employeeId} • {agent.department}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-center">
                  <div>
                    <span className="text-[10px] text-desk-secondary block">In Progress</span>
                    <span className="font-bold text-amber-700">{inProgress}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-desk-secondary block">Resolved</span>
                    <span className="font-bold text-forest">{resolved}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-desk-secondary block">Total Active</span>
                    <span className="font-bold text-desk-primary">{total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Escalation & Deadlines */}
        <div className="lg:col-span-5 desk-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-desk-border pb-2">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-sm text-desk-primary">Tickets Approaching SLA</h4>
            </div>
            <span className="text-[11px] text-desk-secondary">Deadline Monitor</span>
          </div>

          {ticketsNearSLA.length === 0 ? (
            <div className="p-6 text-center text-xs text-desk-secondary">
              No tickets at risk of SLA breach.
            </div>
          ) : (
            <div className="space-y-2.5">
              {ticketsNearSLA.map((t) => {
                const isBreached = t.remainingMins <= 0;
                return (
                  <div
                    key={t.ticketId}
                    onClick={() => {
                      setSelectedTicketId(t.ticketId);
                      setCurrentView('ticket_details');
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isBreached
                        ? 'bg-red-50 border-red-200 hover:border-red-400'
                        : 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-forest">{t.ticketId}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isBreached
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {isBreached ? 'SLA Breached' : `${t.remainingMins}m remaining`}
                      </span>
                    </div>
                    <div className="text-desk-primary font-medium truncate mt-1">{t.title}</div>
                    <div className="text-[10px] text-desk-secondary mt-0.5">
                      Priority: {t.priority} • Status: {t.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Average response and resolution stats */}
          <div className="pt-2 border-t border-desk-border grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-desk-bg border border-desk-border">
              <div className="text-[10px] text-desk-secondary">Avg Response Time</div>
              <div className="font-bold text-desk-primary mt-0.5">14.2 mins</div>
            </div>
            <div className="p-2 rounded-lg bg-desk-bg border border-desk-border">
              <div className="text-[10px] text-desk-secondary">Avg Resolution Time</div>
              <div className="font-bold text-forest mt-0.5">2.4 hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="desk-card max-w-sm w-full p-6 space-y-4 shadow-elevated">
            <h3 className="font-bold text-sm text-desk-primary">
              Assign Ticket {activeTicketForModal}
            </h3>
            <p className="text-xs text-desk-secondary">
              Select an IT Support Agent to take ownership of this request:
            </p>

            <select
              value={selectedAgentForAssign}
              onChange={(e) => setSelectedAgentForAssign(e.target.value)}
              className="desk-input w-full text-xs"
            >
              {itAgents.map((agent) => (
                <option key={agent.employeeId} value={agent.employeeId}>
                  {agent.name} ({agent.department})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="desk-btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="desk-btn-primary py-1.5 px-4 text-xs"
              >
                Assign & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Priority Modal */}
      {showPriorityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="desk-card max-w-sm w-full p-6 space-y-4 shadow-elevated">
            <h3 className="font-bold text-sm text-desk-primary">
              Recalibrate Priority – {activeTicketForModal}
            </h3>
            <p className="text-xs text-desk-secondary">
              Updating priority re-balances the Min-Heap queue instantly:
            </p>

            <select
              value={newPriorityValue}
              onChange={(e) => setNewPriorityValue(e.target.value as TicketPriority)}
              className="desk-input w-full text-xs"
            >
              <option value="Critical">Critical (1 - Top Dispatch)</option>
              <option value="High">High (2)</option>
              <option value="Medium">Medium (3)</option>
              <option value="Low">Low (4)</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPriorityModal(false)}
                className="desk-btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePrioritySubmit}
                className="desk-btn-primary py-1.5 px-4 text-xs"
              >
                Update Priority
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
