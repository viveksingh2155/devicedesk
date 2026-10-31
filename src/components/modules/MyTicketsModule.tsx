import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketPriority, TicketStatus } from '../../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  PlusCircle,
  ExternalLink,
  Ticket,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';

export const MyTicketsModule: React.FC = () => {
  const {
    currentUser,
    tickets,
    setCurrentView,
    setSelectedTicketId
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'priority_asc'>('date_desc');

  // If role is employee, only show their tickets. If agent/admin, allow toggling all vs my
  const isEmployee = currentUser.role === 'employee';
  const [showAllTickets, setShowAllTickets] = useState(!isEmployee);

  const baseTickets = showAllTickets
    ? tickets
    : tickets.filter((t) => t.requesterId === currentUser.employeeId);

  const filteredTickets = baseTickets
    .filter((t) => {
      const matchesSearch =
        t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.requesterName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority =
        priorityFilter === 'all' || t.priority === priorityFilter;

      const matchesStatus =
        statusFilter === 'all' || t.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'date_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'priority_asc') {
        return a.priorityScore - b.priorityScore;
      }
      return 0;
    });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'badge-critical';
      case 'High':
        return 'badge-high';
      case 'Medium':
        return 'badge-medium';
      default:
        return 'badge-low';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'On Hold':
        return 'bg-stone-100 text-stone-700 border-stone-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-forest uppercase tracking-wider">
            {isEmployee ? 'Personal Requests' : 'Support Ticket Operations'}
          </div>
          <h2 className="text-2xl font-bold text-desk-primary tracking-tight">
            {isEmployee ? 'My Support Tickets' : 'Ticket Directory & Logs'}
          </h2>
          <p className="text-xs text-desk-secondary mt-1">
            Track submitted technical inquiries, review SLAs, and open detailed audit histories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEmployee && (
            <div className="flex p-1 bg-white rounded-xl border border-desk-border text-xs">
              <button
                onClick={() => setShowAllTickets(false)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  !showAllTickets ? 'bg-forest text-white' : 'text-desk-secondary'
                }`}
              >
                My Tickets
              </button>
              <button
                onClick={() => setShowAllTickets(true)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  showAllTickets ? 'bg-forest text-white' : 'text-desk-secondary'
                }`}
              >
                All Org Tickets ({tickets.length})
              </button>
            </div>
          )}

          <button
            onClick={() => setCurrentView('raise_ticket')}
            className="desk-btn-primary py-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="desk-card p-4 flex flex-col lg:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-desk-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by ID, title, keyword..."
            className="desk-input w-full pl-9 py-2 text-xs"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-desk-secondary">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="desk-input py-1.5 px-2 text-xs"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-desk-secondary">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="desk-input py-1.5 px-2 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open (Queue)</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 text-xs text-desk-secondary">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="desk-input py-1.5 px-2 text-xs"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="priority_asc">Priority Order (Min-Heap)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="desk-card overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-desk-secondary">
            <Ticket className="w-10 h-10 text-desk-secondary mx-auto mb-3 opacity-40" />
            <h4 className="font-semibold text-sm text-desk-primary">No matching tickets found</h4>
            <p className="mt-1">Try resetting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-desk-border text-[11px] uppercase tracking-wider text-desk-secondary bg-desk-bg/60">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Issue Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-desk-border text-xs">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.ticketId}
                    onClick={() => {
                      setSelectedTicketId(ticket.ticketId);
                      setCurrentView('ticket_details');
                    }}
                    className="hover:bg-cream-light/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-forest">
                      {ticket.ticketId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-desk-primary max-w-sm truncate group-hover:text-forest transition-colors">
                        {ticket.title}
                      </div>
                      <div className="text-[11px] text-desk-secondary truncate">
                        By {ticket.requesterName} • {ticket.requesterDept}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-desk-secondary">
                      <span className="px-2 py-0.5 rounded bg-desk-bg border border-desk-border text-[11px]">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeClass(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-desk-secondary whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-desk-secondary">
                      {ticket.assignedAgentName ? (
                        <span className="font-medium text-desk-primary">{ticket.assignedAgentName}</span>
                      ) : (
                        <span className="italic text-desk-secondary/60">Unassigned (In Queue)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(ticket.ticketId);
                          setCurrentView('ticket_details');
                        }}
                        className="desk-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 group-hover:border-forest"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3 text-forest" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
