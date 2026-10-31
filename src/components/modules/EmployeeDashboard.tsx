import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Laptop,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    tickets,
    assets,
    comments,
    activityLogs,
    setCurrentView,
    setSelectedTicketId
  } = useApp();

  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Filter employee-specific data
  const myTickets = tickets.filter((t) => t.requesterId === currentUser.employeeId);
  const myDevices = assets.filter((a) => a.assignedTo === currentUser.employeeId);
  const openCount = myTickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = myTickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = myTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  const slides = [
    { id: 0, title: 'Overview', subtitle: 'Executive workspace metrics & status' },
    { id: 1, title: 'My Tickets', subtitle: 'Submitted support requests & real-time queue' },
    { id: 2, title: 'My Devices', subtitle: 'Hardware inventory assigned to your account' },
    { id: 3, title: 'Support Activity', subtitle: 'Latest updates, responses & audit logs' },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50 && currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else if (distance < -50 && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

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
      {/* Top Header & Slide Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur p-4 rounded-2xl border border-desk-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-forest">Employee Portal</span>
            <span className="text-xs text-desk-secondary">•</span>
            <span className="text-xs text-desk-secondary">
              Panel {currentSlide + 1} of {slides.length}: <strong className="text-desk-primary">{slides[currentSlide].title}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold text-desk-primary tracking-tight mt-0.5">
            {slides[currentSlide].title}
          </h2>
        </div>

        {/* Navigation Dots and Prev/Next */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx
                    ? 'w-7 h-2.5 bg-forest'
                    : 'w-2.5 h-2.5 bg-desk-border hover:bg-olive'
                }`}
                title={`Jump to ${s.title}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="p-2 rounded-xl border border-desk-border bg-desk-card hover:bg-cream-light/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-desk-primary"
              title="Previous Slide (or Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-xl border border-desk-border bg-desk-card hover:bg-cream-light/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-desk-primary"
              title="Next Slide (or Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setCurrentView('raise_ticket')}
            className="desk-btn-primary py-2 text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Raise Ticket</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL CONTAINER */}
      <div
        className="relative overflow-hidden w-full rounded-2xl min-h-[540px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* ================= SLIDE 1 – OVERVIEW ================= */}
          <div className="w-full shrink-0 p-1 space-y-6">
            {/* Welcome Banner */}
            <div className="desk-card p-6 bg-gradient-to-r from-cream-light/60 via-sage-light/30 to-white relative overflow-hidden">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest text-cream inline-block mb-3">
                  Workspace Connected
                </span>
                <h3 className="text-2xl font-bold text-desk-primary tracking-tight">
                  Welcome back, {currentUser.name}
                </h3>
                <p className="text-sm text-desk-secondary mt-1 leading-relaxed">
                  Your IT portal is active. You currently have <strong className="text-forest font-semibold">{openCount} open</strong> support ticket(s) and <strong className="text-forest font-semibold">{myDevices.length} assigned enterprise device(s)</strong>.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => setCurrentView('raise_ticket')}
                    className="desk-btn-primary text-xs py-2"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Report Problem / Submit Ticket</span>
                  </button>
                  <button
                    onClick={() => setCurrentSlide(1)}
                    className="desk-btn-secondary text-xs py-2"
                  >
                    <span>View Ticket Status ({myTickets.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="desk-card p-4">
                <div className="text-xs text-desk-secondary font-medium">Total Tickets</div>
                <div className="text-2xl font-bold text-desk-primary mt-1">{myTickets.length}</div>
                <div className="text-[11px] text-desk-secondary mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-olive" />
                  All-time lifetime
                </div>
              </div>

              <div className="desk-card p-4 border-l-4 border-l-amber-500">
                <div className="text-xs text-desk-secondary font-medium">Open in Queue</div>
                <div className="text-2xl font-bold text-amber-700 mt-1">{openCount}</div>
                <div className="text-[11px] text-amber-700/80 mt-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Awaiting dispatch
                </div>
              </div>

              <div className="desk-card p-4 border-l-4 border-l-blue-500">
                <div className="text-xs text-desk-secondary font-medium">In Progress</div>
                <div className="text-2xl font-bold text-blue-700 mt-1">{inProgressCount}</div>
                <div className="text-[11px] text-blue-700/80 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Agent working
                </div>
              </div>

              <div className="desk-card p-4 border-l-4 border-l-forest">
                <div className="text-xs text-desk-secondary font-medium">Resolved</div>
                <div className="text-2xl font-bold text-forest mt-1">{resolvedCount}</div>
                <div className="text-[11px] text-forest/80 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </div>
              </div>

              <div className="desk-card p-4">
                <div className="text-xs text-desk-secondary font-medium">Assigned Devices</div>
                <div className="text-2xl font-bold text-desk-primary mt-1">{myDevices.length}</div>
                <div className="text-[11px] text-desk-secondary mt-1 flex items-center gap-1">
                  <Laptop className="w-3 h-3 text-forest" />
                  Hardware units
                </div>
              </div>
            </div>

            {/* Recent Ticket Activity on Overview */}
            <div className="desk-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-desk-primary flex items-center gap-2">
                  <Activity className="w-4 h-4 text-forest" />
                  Recent Support Ticket Activity
                </h4>
                <button
                  onClick={() => setCurrentSlide(1)}
                  className="text-xs text-forest hover:text-forest-dark font-semibold flex items-center gap-1"
                >
                  <span>View All Tickets</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {myTickets.length === 0 ? (
                <div className="text-center py-8 text-desk-secondary text-xs">
                  No tickets submitted yet. Use the Raise Ticket button above!
                </div>
              ) : (
                <div className="divide-y divide-desk-border">
                  {myTickets.slice(0, 3).map((t) => (
                    <div
                      key={t.ticketId}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-cream-light/20 px-2 rounded-xl transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedTicketId(t.ticketId);
                        setCurrentView('ticket_details');
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-forest">{t.ticketId}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(t.priority)}`}>
                            {t.priority}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-desk-primary truncate mt-1">{t.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-desk-secondary">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                        <div className="text-[10px] text-forest font-semibold mt-0.5">Details →</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= SLIDE 2 – MY TICKETS ================= */}
          <div className="w-full shrink-0 p-1 space-y-4">
            <div className="desk-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-sm text-desk-primary">My Submitted Support Tickets</h4>
                  <p className="text-xs text-desk-secondary">Click on any ticket row to inspect timeline and live comments</p>
                </div>
                <button
                  onClick={() => setCurrentView('raise_ticket')}
                  className="desk-btn-primary py-1.5 px-3 text-xs"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>New Request</span>
                </button>
              </div>

              {myTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-desk-secondary">
                  No active or past tickets found for your account.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-desk-border text-[11px] uppercase tracking-wider text-desk-secondary bg-desk-bg/50">
                        <th className="py-2.5 px-3">Ticket ID</th>
                        <th className="py-2.5 px-3">Issue Title</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3">Submitted</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Assigned Agent</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-desk-border text-xs">
                      {myTickets.map((ticket) => (
                        <tr
                          key={ticket.ticketId}
                          onClick={() => {
                            setSelectedTicketId(ticket.ticketId);
                            setCurrentView('ticket_details');
                          }}
                          className="hover:bg-cream-light/30 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-forest">
                            {ticket.ticketId}
                          </td>
                          <td className="py-3 px-3 font-medium text-desk-primary max-w-xs truncate">
                            {ticket.title}
                          </td>
                          <td className="py-3 px-3 text-desk-secondary">{ticket.category}</td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-desk-secondary whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-desk-secondary">
                            {ticket.assignedAgentName || (
                              <span className="italic text-desk-secondary/60">Awaiting Agent</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1 ml-auto">
                              <span>Details</span>
                              <ExternalLink className="w-3 h-3" />
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

          {/* ================= SLIDE 3 – MY DEVICES ================= */}
          <div className="w-full shrink-0 p-1 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-sm text-desk-primary">Hardware Assigned to Your Profile</h4>
                <p className="text-xs text-desk-secondary">Enterprise IT devices currently checked out in your custody</p>
              </div>
              <button
                onClick={() => setCurrentView('my_devices')}
                className="text-xs text-forest hover:text-forest-dark font-semibold flex items-center gap-1"
              >
                <span>Full Device Management</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {myDevices.length === 0 ? (
              <div className="desk-card p-12 text-center text-xs text-desk-secondary">
                <Laptop className="w-8 h-8 text-desk-secondary mx-auto mb-2 opacity-50" />
                No physical devices currently linked to your Employee ID ({currentUser.employeeId}).
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myDevices.map((dev) => (
                  <div key={dev.assetId} className="desk-card p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-forest-light/20 flex items-center justify-center text-forest">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-desk-primary">{dev.deviceName}</h5>
                          <span className="text-[11px] font-mono text-desk-secondary">{dev.assetId} • {dev.category}</span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {dev.condition}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-desk-border">
                      <div>
                        <span className="text-[10px] text-desk-secondary block">Serial Number</span>
                        <span className="font-mono font-medium text-desk-primary">{dev.serialNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-desk-secondary block">Manufacturer</span>
                        <span className="font-medium text-desk-primary">{dev.manufacturer}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-desk-secondary block">Assigned Date</span>
                        <span className="text-desk-primary">{dev.assignedDate || '2025-01-22'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-desk-secondary block">Warranty Expiry</span>
                        <span className="text-desk-primary font-medium">{dev.warrantyExpiry}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setCurrentView('raise_ticket');
                        }}
                        className="text-xs text-forest hover:text-forest-dark font-medium flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Report Issue on this Device</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= SLIDE 4 – SUPPORT ACTIVITY ================= */}
          <div className="w-full shrink-0 p-1 space-y-4">
            <div className="desk-card p-5">
              <h4 className="font-bold text-sm text-desk-primary mb-1">Support Activity & Response Feed</h4>
              <p className="text-xs text-desk-secondary mb-4">
                Recent status updates, agent responses, and device maintenance dispatches
              </p>

              <div className="space-y-3">
                {activityLogs.slice(0, 5).map((log) => (
                  <div key={log._id} className="p-3 rounded-xl bg-desk-bg/70 border border-desk-border flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center text-forest shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-desk-primary">{log.userName}</span>
                        <span className="text-[10px] text-desk-secondary">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-desk-secondary mt-0.5 font-medium">
                        {log.action} {log.ticketId && <span className="font-mono text-forest">[{log.ticketId}]</span>}
                      </p>
                      {log.newValue && (
                        <p className="text-[11px] text-desk-primary mt-1 bg-white/80 p-1.5 rounded border border-desk-border">
                          {log.newValue}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
