import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketPriority } from '../../types';
import {
  ListOrdered,
  Play,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Activity,
  UserCheck
} from 'lucide-react';

export const PriorityQueueModule: React.FC = () => {
  const {
    priorityQueue,
    queueTickets,
    processNextTicket,
    runAgingPolicy,
    currentUser,
    setSelectedTicketId,
    setCurrentView
  } = useApp();

  const [simulatedExecutionLog, setSimulatedExecutionLog] = useState<string[]>([
    'Min-Heap initialized with heap invariant [parent <= children].',
    'Comparator: (priorityScore ASC, createdAt ASC, ticketId ASC).',
    'Atomic ticket concurrency lock active on dispatch.'
  ]);

  const handleDispatchTop = async () => {
    const top = priorityQueue.peek();
    if (!top) {
      setSimulatedExecutionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Queue empty. No eligible ticket to dequeue.`,
        ...prev
      ]);
      return;
    }

    const assigned = await processNextTicket(currentUser.employeeId, currentUser.name);
    if (assigned) {
      setSimulatedExecutionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Dequeued ${assigned.ticketId} [${assigned.priority}]. BubbleDown root re-heapified in O(log n). Assigned to ${currentUser.name}.`,
        ...prev
      ]);
    }
  };

  const handleSimulateAging = () => {
    runAgingPolicy();
    setSimulatedExecutionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] SLA Starvation Aging sweep executed across Min-Heap array.`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur p-5 rounded-2xl border border-desk-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-forest">
              Data Structures & Algorithms Engine
            </span>
            <span className="text-xs text-desk-secondary">•</span>
            <span className="text-xs text-desk-secondary">Min-Heap Implementation</span>
          </div>
          <h2 className="text-2xl font-bold text-desk-primary tracking-tight mt-0.5">
            Priority Queue Visualizer & Scheduler
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateAging}
            className="desk-btn-secondary py-2 px-3 text-xs"
          >
            <Clock className="w-3.5 h-3.5 text-forest" />
            <span>Apply Aging Escalation</span>
          </button>

          <button
            onClick={handleDispatchTop}
            disabled={queueTickets.length === 0}
            className="desk-btn-primary py-2 px-4 text-xs font-bold disabled:opacity-40 shadow-soft"
          >
            <Play className="w-3.5 h-3.5 fill-current text-cream" />
            <span>Process Next Ticket (O(log n))</span>
          </button>
        </div>
      </div>

      {/* Heap Invariant Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="desk-card p-4 space-y-1.5 border-t-4 border-t-forest">
          <div className="text-xs font-bold text-forest uppercase tracking-wider">
            1. Priority Mapping
          </div>
          <p className="text-xs text-desk-secondary leading-relaxed">
            <code className="bg-desk-bg px-1 py-0.5 rounded font-mono text-forest">Critical = 1</code>,{' '}
            <code className="bg-desk-bg px-1 py-0.5 rounded font-mono text-forest">High = 2</code>,{' '}
            <code className="bg-desk-bg px-1 py-0.5 rounded font-mono text-forest">Medium = 3</code>,{' '}
            <code className="bg-desk-bg px-1 py-0.5 rounded font-mono text-forest">Low = 4</code>.
            Lower numerical value holds higher execution precedence.
          </p>
        </div>

        <div className="desk-card p-4 space-y-1.5 border-t-4 border-t-olive">
          <div className="text-xs font-bold text-olive-dark uppercase tracking-wider">
            2. FIFO Tie-Breaker
          </div>
          <p className="text-xs text-desk-secondary leading-relaxed">
            When two tickets share identical priority, <code className="bg-desk-bg px-1 py-0.5 rounded font-mono text-forest">createdAt ASC</code> guarantees the oldest ticket is processed first.
          </p>
        </div>

        <div className="desk-card p-4 space-y-1.5 border-t-4 border-t-amber-600">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            3. SLA Anti-Starvation
          </div>
          <p className="text-xs text-desk-secondary leading-relaxed">
            Aging policy prevents Low tickets from indefinite wait. Tickets exceeding SLA thresholds escalate dynamically.
          </p>
        </div>
      </div>

      {/* MIN-HEAP ARRAY VISUALIZER */}
      <div className="desk-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-desk-border pb-3">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-forest" />
            <h3 className="font-bold text-sm text-desk-primary">
              Binary Heap Representation (Queue Size: {queueTickets.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-forest font-semibold">
              Root Index 0: {queueTickets[0]?.ticketId || 'EMPTY'}
            </span>
          </div>
        </div>

        {queueTickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-desk-secondary">
            <CheckCircle2 className="w-10 h-10 text-forest mx-auto mb-2 opacity-50" />
            No tickets waiting in heap.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Node Chain */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
              {queueTickets.map((ticket, idx) => {
                const isRoot = idx === 0;
                return (
                  <div
                    key={ticket.ticketId}
                    className={`shrink-0 p-3.5 rounded-xl border flex flex-col justify-between w-48 transition-all ${
                      isRoot
                        ? 'bg-forest text-cream border-forest shadow-medium'
                        : 'bg-white text-desk-primary border-desk-border hover:border-olive'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={`font-mono font-bold ${isRoot ? 'text-cream' : 'text-forest'}`}>
                        Heap[{idx}] {isRoot ? '★ ROOT' : ''}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          isRoot ? 'bg-cream text-forest-dark' : 'bg-desk-bg text-desk-secondary'
                        }`}
                      >
                        Score: {ticket.priorityScore}
                      </span>
                    </div>

                    <div className="font-bold text-xs truncate">{ticket.ticketId}</div>
                    <div className={`text-[11px] truncate mt-0.5 ${isRoot ? 'text-cream/80' : 'text-desk-secondary'}`}>
                      {ticket.title}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
                      <span className="capitalize">{ticket.priority}</span>
                      <span className="font-mono">
                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Algorithm Execution Console */}
      <div className="desk-card p-5 space-y-3 bg-[#25291F] text-[#F7F7F1] border-none shadow-elevated">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cream" />
            <h4 className="font-mono text-xs font-bold text-cream">
              Min-Heap Scheduling Engine Logs
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#B2BD7E]">
            Complexity: O(log n)
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto text-emerald-300">
          {simulatedExecutionLog.map((log, index) => (
            <div key={index} className="leading-relaxed flex items-start gap-2">
              <span className="text-olive select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
