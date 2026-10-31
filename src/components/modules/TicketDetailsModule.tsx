import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketPriority, TicketStatus } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  Laptop,
  AlertTriangle,
  MessageSquare,
  Send,
  ShieldCheck,
  Headphones,
  Paperclip,
  Activity,
  Calendar,
  AlertCircle,
  FileText,
  CornerDownRight
} from 'lucide-react';

export const TicketDetailsModule: React.FC = () => {
  const {
    currentUser,
    tickets,
    selectedTicketId,
    comments,
    activityLogs,
    setCurrentView,
    addComment,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    users
  } = useApp();

  const [newCommentText, setNewCommentText] = useState('');
  const [overridePriority, setOverridePriority] = useState<TicketPriority>('Medium');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  // Find ticket or fallback to first
  const ticket =
    tickets.find((t) => t.ticketId === selectedTicketId) ||
    tickets[0];

  if (!ticket) {
    return (
      <div className="desk-card p-12 text-center text-xs text-desk-secondary">
        <AlertCircle className="w-8 h-8 text-desk-secondary mx-auto mb-2 opacity-50" />
        <p>No ticket selected. Please select a ticket from your dashboard or ticket list.</p>
        <button
          onClick={() => setCurrentView('my_tickets')}
          className="desk-btn-primary mt-4 py-2 text-xs"
        >
          Go to Tickets
        </button>
      </div>
    );
  }

  // Filter comments for this ticket
  const ticketComments = comments.filter((c) => c.ticketId === ticket.ticketId);
  const ticketLogs = activityLogs.filter((l) => l.ticketId === ticket.ticketId);

  // Lifecycle steps: Open -> In Progress -> On Hold -> Resolved -> Closed
  const lifecycleStages: { key: TicketStatus; label: string }[] = [
    { key: 'Open', label: '1. Open' },
    { key: 'In Progress', label: '2. In Progress' },
    { key: 'On Hold', label: '3. On Hold' },
    { key: 'Resolved', label: '4. Resolved' },
    { key: 'Closed', label: '5. Closed' },
  ];

  const getStageState = (stageKey: TicketStatus) => {
    const order: TicketStatus[] = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
    const currentIdx = order.indexOf(ticket.status);
    const stageIdx = order.indexOf(stageKey);

    if (ticket.status === stageKey) return 'current';
    if (stageIdx < currentIdx && ticket.status !== 'On Hold') return 'completed';
    if (stageKey === 'On Hold' && ticket.status !== 'On Hold') return 'skipped';
    if (stageIdx < currentIdx) return 'completed';
    return 'upcoming';
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(ticket.ticketId, newCommentText);
    setNewCommentText('');
  };

  const handlePriorityOverride = () => {
    updateTicketPriority(ticket.ticketId, overridePriority, overrideReason || 'Manual IT adjustment');
    setShowOverrideModal(false);
    setOverrideReason('');
  };

  const isStaff = currentUser.role === 'it_support' || currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('my_tickets')}
            className="p-2 rounded-xl border border-desk-border bg-white hover:bg-desk-bg transition-colors text-desk-secondary hover:text-desk-primary"
            title="Back to Tickets"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-forest">{ticket.ticketId}</span>
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
                {ticket.priority} Priority
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-200">
                {ticket.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-desk-primary tracking-tight mt-0.5">
              {ticket.title}
            </h2>
          </div>
        </div>

        {/* Action Controls for Staff */}
        {isStaff && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setOverridePriority(ticket.priority);
                setShowOverrideModal(true);
              }}
              className="desk-btn-secondary py-1.5 px-3 text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Change Priority</span>
            </button>

            {ticket.status !== 'In Progress' && (
              <button
                onClick={() => updateTicketStatus(ticket.ticketId, 'In Progress')}
                className="desk-btn-primary py-1.5 px-3 text-xs bg-amber-600 hover:bg-amber-700"
              >
                <span>Mark In Progress</span>
              </button>
            )}

            {ticket.status !== 'On Hold' && (
              <button
                onClick={() => updateTicketStatus(ticket.ticketId, 'On Hold', 'Waiting for user feedback')}
                className="desk-btn-secondary py-1.5 px-3 text-xs"
              >
                <span>Put On Hold</span>
              </button>
            )}

            {ticket.status !== 'Resolved' && (
              <button
                onClick={() => updateTicketStatus(ticket.ticketId, 'Resolved', 'Issue successfully resolved')}
                className="desk-btn-primary py-1.5 px-3 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve Ticket</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* VISUAL TICKET TIMELINE */}
      <div className="desk-card p-6">
        <div className="text-xs font-bold text-desk-secondary uppercase tracking-wider mb-4">
          Visual Ticket Lifecycle Progression
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 relative">
          {lifecycleStages.map((stage, idx) => {
            const state = getStageState(stage.key);
            let pillClass = 'bg-desk-bg text-desk-secondary border-desk-border';
            let icon = <Clock className="w-3.5 h-3.5 text-desk-secondary" />;

            if (state === 'completed') {
              pillClass = 'bg-forest/10 text-forest border-forest/30 font-semibold';
              icon = <CheckCircle2 className="w-3.5 h-3.5 text-forest" />;
            } else if (state === 'current') {
              pillClass = 'bg-forest text-cream border-forest font-bold shadow-soft';
              icon = <Activity className="w-3.5 h-3.5 text-cream animate-pulse" />;
            }

            return (
              <div
                key={stage.key}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${pillClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">{stage.label}</span>
                  {icon}
                </div>
                <div className="text-[10px] opacity-80">
                  {stage.key === 'Open' && (
                    <span>Submitted: {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                  {stage.key === 'In Progress' && (
                    <span>{ticket.startedAt ? `Started: ${new Date(ticket.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Pending triage'}</span>
                  )}
                  {stage.key === 'On Hold' && (
                    <span>{ticket.status === 'On Hold' ? 'Awaiting response' : 'Standard flow'}</span>
                  )}
                  {stage.key === 'Resolved' && (
                    <span>{ticket.resolvedAt ? `Resolved: ${new Date(ticket.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not resolved'}</span>
                  )}
                  {stage.key === 'Closed' && (
                    <span>{ticket.closedAt ? `Closed` : 'Post-resolution'}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Description & Communication Thread */}
        <div className="lg:col-span-8 space-y-6">
          {/* Problem Description Card */}
          <div className="desk-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-desk-primary border-b border-desk-border pb-2">
              Reported Problem Description
            </h3>
            <p className="text-xs text-desk-primary leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>

            {/* AI Summary and Steps if available */}
            {ticket.aiSummary && (
              <div className="p-3.5 rounded-xl bg-cream-light/50 border border-cream text-xs space-y-2">
                <div className="font-semibold text-olive-dark flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-forest" />
                  <span>AI Problem Synthesis:</span>
                </div>
                <p className="text-desk-secondary text-[11px] leading-relaxed">
                  {ticket.aiSummary}
                </p>
                {ticket.aiSuggestedSteps && ticket.aiSuggestedSteps.length > 0 && (
                  <div className="pt-2 border-t border-cream/70">
                    <span className="font-semibold text-olive-dark text-[11px] block mb-1">
                      Suggested Diagnostic Steps:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-desk-secondary space-y-0.5">
                      {ticket.aiSuggestedSteps.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ticket Comments & Communication Thread */}
          <div className="desk-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-desk-border pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-forest" />
                <h3 className="font-bold text-sm text-desk-primary">
                  Communication Thread ({ticketComments.length})
                </h3>
              </div>
              <span className="text-[11px] text-desk-secondary">
                Direct IT-to-Employee Chat
              </span>
            </div>

            {/* Message List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {ticketComments.length === 0 ? (
                <div className="p-6 text-center text-xs text-desk-secondary">
                  No comments posted yet. Leave an update below.
                </div>
              ) : (
                ticketComments.map((cmt) => {
                  const isAuthorStaff = cmt.authorRole === 'it_support' || cmt.authorRole === 'admin';
                  return (
                    <div
                      key={cmt._id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        isAuthorStaff
                          ? 'bg-sage-light/20 border-sage/40 ml-4'
                          : 'bg-white border-desk-border mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-desk-primary">{cmt.authorName}</span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              isAuthorStaff
                                ? 'bg-forest text-cream'
                                : 'bg-desk-bg text-desk-secondary border border-desk-border'
                            }`}
                          >
                            {cmt.authorRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-desk-secondary">
                          {new Date(cmt.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-desk-primary text-xs leading-relaxed pt-1">
                        {cmt.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handlePostComment} className="pt-2">
              <div className="relative">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={`Reply as ${currentUser.name}...`}
                  rows={2}
                  className="desk-input w-full pr-24 resize-none text-xs"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="absolute right-2 bottom-2 desk-btn-primary py-1.5 px-3 text-xs disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Metadata & Audit Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Metadata Card */}
          <div className="desk-card p-5 space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-desk-secondary">
              Ticket Metadata & SLA
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-desk-border">
                <span className="text-desk-secondary">Status:</span>
                <span className="font-semibold text-desk-primary">{ticket.status}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-desk-border">
                <span className="text-desk-secondary">Priority:</span>
                <span className="font-bold text-forest">{ticket.priority} (Score {ticket.priorityScore})</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-desk-border">
                <span className="text-desk-secondary">SLA Deadline:</span>
                <span className="font-mono font-semibold text-amber-700">
                  {new Date(ticket.slaDeadline).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-desk-border">
                <span className="text-desk-secondary">Assigned Agent:</span>
                <span className="font-semibold text-desk-primary">
                  {ticket.assignedAgentName || 'Unassigned (Waiting)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-desk-border">
                <span className="text-desk-secondary">Requester:</span>
                <div className="text-right">
                  <div className="font-semibold text-desk-primary">{ticket.requesterName}</div>
                  <div className="text-[10px] text-desk-secondary">{ticket.requesterDept}</div>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-desk-border">
                <span className="text-desk-secondary">Related Asset:</span>
                <span className="font-semibold text-desk-primary">
                  {ticket.assetName || ticket.assetId || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-desk-secondary">Last Updated:</span>
                <span className="text-desk-secondary">
                  {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Audit Trail */}
          <div className="desk-card p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-desk-primary">
              <Activity className="w-3.5 h-3.5 text-forest" />
              <span>Audit History</span>
            </div>

            <div className="space-y-2 text-xs">
              {ticketLogs.map((log) => (
                <div key={log._id} className="p-2 rounded-lg bg-desk-bg/80 border border-desk-border text-[11px]">
                  <div className="flex justify-between font-medium text-desk-primary">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-desk-secondary">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-desk-secondary text-[10px] mt-0.5">
                    By {log.userName}
                  </div>
                  {log.newValue && (
                    <div className="text-[10px] text-forest font-semibold mt-0.5">
                      {log.newValue}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="desk-card max-w-md w-full p-6 space-y-4 shadow-elevated">
            <h3 className="font-bold text-base text-desk-primary">
              Override Priority – {ticket.ticketId}
            </h3>
            <p className="text-xs text-desk-secondary">
              IT Agents and Administrators can recalibrate priority scores in the Min-Heap.
            </p>

            <div>
              <label className="block text-xs font-semibold text-desk-primary mb-1">
                New Priority Level
              </label>
              <select
                value={overridePriority}
                onChange={(e) => setOverridePriority(e.target.value as TicketPriority)}
                className="desk-input w-full text-xs"
              >
                <option value="Critical">Critical (1 - Top Dispatch)</option>
                <option value="High">High (2)</option>
                <option value="Medium">Medium (3)</option>
                <option value="Low">Low (4)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-desk-primary mb-1">
                Reason for Adjustment
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Verified severe departmental outage"
                className="desk-input w-full text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="desk-btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePriorityOverride}
                className="desk-btn-primary py-1.5 px-4 text-xs"
              >
                Confirm Priority Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
