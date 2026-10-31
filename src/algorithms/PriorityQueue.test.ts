import { describe, it, expect, beforeEach } from 'vitest';
import { PriorityQueue, compareTickets } from './PriorityQueue';
import { Ticket } from '../types';

function createMockTicket(
  id: string,
  priority: 'Critical' | 'High' | 'Medium' | 'Low',
  createdAt: string,
  status: 'Open' | 'In Progress' | 'Resolved' = 'Open'
): Ticket {
  const priorityScores = { Critical: 1, High: 2, Medium: 3, Low: 4 };
  return {
    _id: `id_${id}`,
    ticketId: id,
    title: `Issue ${id}`,
    description: `Description for ${id}`,
    category: 'Hardware',
    priority,
    priorityScore: priorityScores[priority],
    status,
    requesterId: 'EMP001',
    requesterName: 'Aditya Employee',
    requesterEmail: 'aditya@company.com',
    requesterDept: 'Engineering',
    assetId: 'AST-001',
    assignedAgentId: null,
    createdAt,
    updatedAt: createdAt,
    slaDeadline: new Date(new Date(createdAt).getTime() + 4 * 3600 * 1000).toISOString(),
  };
}

describe('PriorityQueue & Min-Heap Scheduling Algorithm', () => {
  let pq: PriorityQueue;

  beforeEach(() => {
    pq = new PriorityQueue();
  });

  it('handles empty queue gracefully', () => {
    expect(pq.isEmpty()).toBe(true);
    expect(pq.size()).toBe(0);
    expect(pq.peek()).toBeNull();
    expect(pq.dequeue()).toBeNull();
  });

  it('enforces priority ordering: Critical (1) > High (2) > Medium (3) > Low (4)', () => {
    const tLow = createMockTicket('T-LOW', 'Low', '2026-10-31T10:00:00Z');
    const tHigh = createMockTicket('T-HIGH', 'High', '2026-10-31T10:00:00Z');
    const tMed = createMockTicket('T-MED', 'Medium', '2026-10-31T10:00:00Z');
    const tCrit = createMockTicket('T-CRIT', 'Critical', '2026-10-31T10:00:00Z');

    pq.enqueue(tLow);
    pq.enqueue(tHigh);
    pq.enqueue(tMed);
    pq.enqueue(tCrit);

    expect(pq.size()).toBe(4);
    expect(pq.peek()?.ticketId).toBe('T-CRIT');

    expect(pq.dequeue()?.ticketId).toBe('T-CRIT');
    expect(pq.dequeue()?.ticketId).toBe('T-HIGH');
    expect(pq.dequeue()?.ticketId).toBe('T-MED');
    expect(pq.dequeue()?.ticketId).toBe('T-LOW');
    expect(pq.isEmpty()).toBe(true);
  });

  it('correctly executes the exact example from the specification', () => {
    // Specification example:
    // Ticket A: Priority = Medium, Created = 10:00 AM
    // Ticket B: Priority = Critical, Created = 10:15 AM
    // Ticket C: Priority = High, Created = 10:05 AM
    // Ticket D: Priority = Critical, Created = 10:10 AM
    // Expected processing order:
    // 1. Ticket D – Critical (10:10 AM)
    // 2. Ticket B – Critical (10:15 AM)
    // 3. Ticket C – High (10:05 AM)
    // 4. Ticket A – Medium (10:00 AM)
    const ticketA = createMockTicket('Ticket A', 'Medium', '2026-10-31T10:00:00Z');
    const ticketB = createMockTicket('Ticket B', 'Critical', '2026-10-31T10:15:00Z');
    const ticketC = createMockTicket('Ticket C', 'High', '2026-10-31T10:05:00Z');
    const ticketD = createMockTicket('Ticket D', 'Critical', '2026-10-31T10:10:00Z');

    pq.enqueue(ticketA);
    pq.enqueue(ticketB);
    pq.enqueue(ticketC);
    pq.enqueue(ticketD);

    expect(pq.dequeue()?.ticketId).toBe('Ticket D');
    expect(pq.dequeue()?.ticketId).toBe('Ticket B');
    expect(pq.dequeue()?.ticketId).toBe('Ticket C');
    expect(pq.dequeue()?.ticketId).toBe('Ticket A');
    expect(pq.dequeue()).toBeNull();
  });

  it('performs FIFO tie-breaking for tickets with identical priority', () => {
    const tOlder = createMockTicket('T-OLD', 'High', '2026-10-31T08:00:00Z');
    const tNewer = createMockTicket('T-NEW', 'High', '2026-10-31T09:30:00Z');
    const tNewest = createMockTicket('T-NEWEST', 'High', '2026-10-31T11:00:00Z');

    pq.enqueue(tNewest);
    pq.enqueue(tOlder);
    pq.enqueue(tNewer);

    expect(pq.dequeue()?.ticketId).toBe('T-OLD');
    expect(pq.dequeue()?.ticketId).toBe('T-NEW');
    expect(pq.dequeue()?.ticketId).toBe('T-NEWEST');
  });

  it('breaks tie deterministically by ticketId if priority and createdAt are identical', () => {
    const tZ = createMockTicket('TICKET-Z', 'Medium', '2026-10-31T10:00:00Z');
    const tA = createMockTicket('TICKET-A', 'Medium', '2026-10-31T10:00:00Z');
    const tM = createMockTicket('TICKET-M', 'Medium', '2026-10-31T10:00:00Z');

    pq.enqueue(tZ);
    pq.enqueue(tA);
    pq.enqueue(tM);

    expect(pq.dequeue()?.ticketId).toBe('TICKET-A');
    expect(pq.dequeue()?.ticketId).toBe('TICKET-M');
    expect(pq.dequeue()?.ticketId).toBe('TICKET-Z');
  });

  it('re-heapifies correctly when ticket priority is updated', () => {
    const t1 = createMockTicket('T1', 'Low', '2026-10-31T10:00:00Z');
    const t2 = createMockTicket('T2', 'Medium', '2026-10-31T10:05:00Z');
    const t3 = createMockTicket('T3', 'High', '2026-10-31T10:10:00Z');

    pq.enqueue(t1);
    pq.enqueue(t2);
    pq.enqueue(t3);

    // Initial order: T3 (High), T2 (Medium), T1 (Low)
    expect(pq.peek()?.ticketId).toBe('T3');

    // Escalate T1 from Low to Critical!
    const updated = pq.updatePriority('T1', 'Critical');
    expect(updated).toBe(true);

    // Now T1 must jump to top
    expect(pq.peek()?.ticketId).toBe('T1');
    expect(pq.dequeue()?.ticketId).toBe('T1');
    expect(pq.dequeue()?.ticketId).toBe('T3');
    expect(pq.dequeue()?.ticketId).toBe('T2');
  });

  it('removes tickets correctly', () => {
    const t1 = createMockTicket('T1', 'Critical', '2026-10-31T10:00:00Z');
    const t2 = createMockTicket('T2', 'High', '2026-10-31T10:01:00Z');
    const t3 = createMockTicket('T3', 'Medium', '2026-10-31T10:02:00Z');

    pq.enqueue(t1);
    pq.enqueue(t2);
    pq.enqueue(t3);

    // Remove middle ticket T2
    expect(pq.remove('T2')).toBe(true);
    expect(pq.contains('T2')).toBe(false);
    expect(pq.size()).toBe(2);

    expect(pq.dequeue()?.ticketId).toBe('T1');
    expect(pq.dequeue()?.ticketId).toBe('T3');
    expect(pq.isEmpty()).toBe(true);

    // Removing non-existent ticket returns false
    expect(pq.remove('NON_EXISTENT')).toBe(false);
  });

  it('prevents non-Open tickets from being queued', () => {
    const tOpen = createMockTicket('T-OPEN', 'High', '2026-10-31T10:00:00Z', 'Open');
    const tProgress = createMockTicket('T-PROG', 'Critical', '2026-10-31T09:00:00Z', 'In Progress');
    const tResolved = createMockTicket('T-RES', 'Critical', '2026-10-31T08:00:00Z', 'Resolved');

    pq.enqueue(tOpen);
    pq.enqueue(tProgress); // should be rejected
    pq.enqueue(tResolved); // should be rejected

    expect(pq.size()).toBe(1);
    expect(pq.peek()?.ticketId).toBe('T-OPEN');
  });

  it('prevents duplicate assignment in atomicAssignNext', async () => {
    const t1 = createMockTicket('T1', 'Critical', '2026-10-31T10:00:00Z');
    const t2 = createMockTicket('T2', 'High', '2026-10-31T10:05:00Z');

    pq.enqueue(t1);
    pq.enqueue(t2);

    // Simulate two IT agents assigning at the exact same moment
    const [assignedA, assignedB] = await Promise.all([
      pq.atomicAssignNext('AGT-001', 'Sarah Jenkins'),
      pq.atomicAssignNext('AGT-002', 'David Kim'),
    ]);

    expect(assignedA).not.toBeNull();
    expect(assignedB).not.toBeNull();
    // They must NOT receive the same ticket
    expect(assignedA?.ticketId).not.toBe(assignedB?.ticketId);
    expect([assignedA?.ticketId, assignedB?.ticketId].sort()).toEqual(['T1', 'T2']);

    // Queue should now be empty
    expect(pq.isEmpty()).toBe(true);
  });

  it('escalates long-waiting tickets under aging policy', () => {
    // Ticket created 45 minutes ago as Low
    const oldTime = new Date(Date.now() - 45 * 60 * 1000).toISOString();
    const tOldLow = createMockTicket('T-OLD-LOW', 'Low', oldTime);

    // Ticket created 2 minutes ago as High
    const recentTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const tRecentHigh = createMockTicket('T-REC-HIGH', 'High', recentTime);

    pq.enqueue(tOldLow);
    pq.enqueue(tRecentHigh);

    // Before aging policy, High is at front
    expect(pq.peek()?.ticketId).toBe('T-REC-HIGH');

    // Run aging policy with 30 min threshold: T-OLD-LOW escalates to Medium
    const escalated = pq.applyAgingPolicy(30);
    expect(escalated.length).toBe(1);
    expect(escalated[0].ticketId).toBe('T-OLD-LOW');
    expect(escalated[0].priority).toBe('Medium');
  });
});
