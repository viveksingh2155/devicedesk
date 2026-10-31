import { Ticket, TicketPriority } from '../types';

export const PRIORITY_MAP: Record<TicketPriority, number> = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

export const REVERSE_PRIORITY_MAP: Record<number, TicketPriority> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};

/**
 * Comparator implementing the required ordering:
 * (priority ASC, createdAt ASC, ticketId ASC)
 * Returns < 0 if a should be processed before b, > 0 if b should be before a, 0 if equal.
 */
export function compareTickets(a: Ticket, b: Ticket): number {
  const scoreA = a.priorityScore ?? PRIORITY_MAP[a.priority];
  const scoreB = b.priorityScore ?? PRIORITY_MAP[b.priority];

  // 1. Primary sort: priority ASC (1 is higher priority than 4)
  if (scoreA !== scoreB) {
    return scoreA - scoreB;
  }

  // 2. Secondary sort: createdAt ASC (FIFO tie-breaker - older tickets first)
  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  if (timeA !== timeB) {
    return timeA - timeB;
  }

  // 3. Tertiary sort: ticketId ASC (deterministic tie-breaking)
  return a.ticketId.localeCompare(b.ticketId);
}

/**
 * Min-Heap based Priority Queue for scheduling IT Support tickets.
 *
 * Guarantees:
 * - enqueue: O(log n)
 * - dequeue: O(log n)
 * - peek: O(1)
 * - size: O(1)
 * - isEmpty: O(1)
 * - updatePriority: O(n) search + O(log n) reheapify
 * - remove: O(n) search + O(log n) reheapify
 * - Concurrency protection: Atomic ticket assignment lock to prevent double-dispatch
 */
export class PriorityQueue {
  private heap: Ticket[] = [];
  // Mutex lock flag for transactional assignment protection
  private assignmentLock: boolean = false;

  constructor(initialTickets: Ticket[] = []) {
    // Only load eligible Open tickets
    for (const ticket of initialTickets) {
      if (this.isEligible(ticket)) {
        this.enqueue(ticket);
      }
    }
  }

  /**
   * Helper to check eligibility: Only Open tickets (not In Progress, Resolved, or Closed)
   */
  private isEligible(ticket: Ticket): boolean {
    return ticket.status === 'Open';
  }

  /**
   * Insert ticket into heap. O(log n)
   */
  public enqueue(ticket: Ticket): void {
    if (!this.isEligible(ticket)) {
      return;
    }

    // Clone to prevent external mutation side-effects
    const item: Ticket = {
      ...ticket,
      priorityScore: ticket.priorityScore || PRIORITY_MAP[ticket.priority],
    };

    // Prevent duplicate entries in queue
    const existingIndex = this.heap.findIndex((t) => t.ticketId === item.ticketId);
    if (existingIndex !== -1) {
      this.heap[existingIndex] = item;
      this.bubbleUp(existingIndex);
      this.bubbleDown(existingIndex);
      return;
    }

    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Return the highest priority eligible ticket without removing it. O(1)
   */
  public peek(): Ticket | null {
    if (this.heap.length === 0) return null;
    return this.heap[0];
  }

  /**
   * Dequeue and return the highest priority eligible ticket. O(log n)
   */
  public dequeue(): Ticket | null {
    if (this.heap.length === 0) return null;

    const top = this.heap[0];
    const bottom = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }

    return top;
  }

  /**
   * Atomically assign the next available ticket to an IT agent.
   * Concurrency-safe: acquires a lock so parallel requests cannot double-assign.
   */
  public async atomicAssignNext(
    agentId: string,
    agentName: string
  ): Promise<Ticket | null> {
    if (this.assignmentLock) {
      // Wait for release if locked
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    try {
      this.assignmentLock = true;

      // Find first eligible unassigned open ticket
      if (this.isEmpty()) {
        return null;
      }

      const ticket = this.dequeue();
      if (!ticket) return null;

      ticket.assignedAgentId = agentId;
      ticket.assignedAgentName = agentName;
      ticket.status = 'In Progress';
      ticket.startedAt = new Date().toISOString();
      ticket.updatedAt = new Date().toISOString();

      return ticket;
    } finally {
      this.assignmentLock = false;
    }
  }

  /**
   * Update priority of a ticket and re-balance the heap. O(log n)
   */
  public updatePriority(ticketId: string, newPriority: TicketPriority): boolean {
    const index = this.heap.findIndex((t) => t.ticketId === ticketId);
    if (index === -1) return false;

    this.heap[index].priority = newPriority;
    this.heap[index].priorityScore = PRIORITY_MAP[newPriority];
    this.heap[index].updatedAt = new Date().toISOString();

    // Re-balance: could go up or down
    this.bubbleUp(index);
    this.bubbleDown(index);
    return true;
  }

  /**
   * Remove a ticket by ID (e.g. when cancelled, deleted, or assigned directly). O(log n)
   */
  public remove(ticketId: string): boolean {
    const index = this.heap.findIndex((t) => t.ticketId === ticketId);
    if (index === -1) return false;

    const last = this.heap.pop()!;
    if (index < this.heap.length) {
      this.heap[index] = last;
      this.bubbleUp(index);
      this.bubbleDown(index);
    }
    return true;
  }

  /**
   * Check if a ticket exists in queue
   */
  public contains(ticketId: string): boolean {
    return this.heap.some((t) => t.ticketId === ticketId);
  }

  /**
   * Returns current count of waiting tickets
   */
  public size(): number {
    return this.heap.length;
  }

  /**
   * Returns true if queue has no waiting tickets
   */
  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Returns all tickets currently in queue sorted by priority order
   */
  public toSortedArray(): Ticket[] {
    const clone = [...this.heap];
    clone.sort(compareTickets);
    return clone;
  }

  /**
   * Apply Aging / SLA Escalation Policy:
   * To prevent starvation of Low or Medium tickets, any ticket waiting longer than
   * maxWaitMinutes is escalated one level up (Low -> Medium, Medium -> High).
   */
  public applyAgingPolicy(maxWaitMinutes: number = 30): Ticket[] {
    const now = Date.now();
    const escalatedTickets: Ticket[] = [];

    for (let i = 0; i < this.heap.length; i++) {
      const ticket = this.heap[i];
      const waitMs = now - new Date(ticket.createdAt).getTime();
      const waitMinutes = waitMs / (1000 * 60);

      if (waitMinutes >= maxWaitMinutes) {
        if (ticket.priority === 'Low') {
          ticket.priority = 'Medium';
          ticket.priorityScore = 3;
          ticket.escalated = true;
          escalatedTickets.push(ticket);
        } else if (ticket.priority === 'Medium' && waitMinutes >= maxWaitMinutes * 2) {
          ticket.priority = 'High';
          ticket.priorityScore = 2;
          ticket.escalated = true;
          escalatedTickets.push(ticket);
        }
      }
    }

    if (escalatedTickets.length > 0) {
      this.rebuildHeap();
    }

    return escalatedTickets;
  }

  /**
   * Rebuild heap invariant from scratch O(n)
   */
  public rebuildHeap(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  /**
   * Clear all items
   */
  public clear(): void {
    this.heap = [];
  }

  // --- Private Min-Heap helpers ---

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (compareTickets(this.heap[index], this.heap[parentIdx]) < 0) {
        this.swap(index, parentIdx);
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < length &&
        compareTickets(this.heap[leftChild], this.heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < length &&
        compareTickets(this.heap[rightChild], this.heap[smallest]) < 0
      ) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
