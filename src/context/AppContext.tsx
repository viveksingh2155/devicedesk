import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User, Asset, Ticket, TicketComment, ActivityLog, TicketPriority, TicketStatus } from '../types';
import { PriorityQueue, PRIORITY_MAP } from '../algorithms/PriorityQueue';
import { StorageService } from '../services/storage';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;

  // Data collections
  tickets: Ticket[];
  assets: Asset[];
  users: User[];
  comments: TicketComment[];
  activityLogs: ActivityLog[];

  // Priority Queue reactive state
  priorityQueue: PriorityQueue;
  queueTickets: Ticket[];

  // Operations
  createTicket: (data: Partial<Ticket>) => Ticket;
  processNextTicket: (agentId?: string, agentName?: string) => Promise<Ticket | null>;
  assignTicket: (ticketId: string, agentId: string, agentName: string) => void;
  updateTicketPriority: (ticketId: string, newPriority: TicketPriority, reason?: string) => void;
  updateTicketStatus: (ticketId: string, newStatus: TicketStatus, notes?: string) => void;
  addComment: (ticketId: string, message: string) => void;

  // Asset CRUD
  createAsset: (data: Partial<Asset>) => Asset;
  updateAsset: (assetId: string, data: Partial<Asset>) => void;
  deleteAsset: (assetId: string) => void;
  assignAsset: (assetId: string, employeeId: string) => void;
  unassignAsset: (assetId: string) => void;

  // User CRUD
  createUser: (data: Partial<User>) => User;
  updateUser: (employeeId: string, data: Partial<User>) => void;
  toggleUserStatus: (employeeId: string) => void;

  // Queue & Automation
  runAgingPolicy: () => void;
  resetAllData: () => void;

  // Notifications
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('devicedesk_auth') === 'true';
  });
  const [currentUser, setCurrentUserState] = useState<User>(() => StorageService.getActiveUser());
  const [currentView, setCurrentView] = useState<string>('auth');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('TCK-2026-089');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>(() => StorageService.getTickets());
  const [assets, setAssets] = useState<Asset[]>(() => StorageService.getAssets());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [comments, setComments] = useState<TicketComment[]>(() => StorageService.getComments());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => StorageService.getLogs());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Instantiate and maintain the PriorityQueue
  const priorityQueue = useMemo(() => {
    return new PriorityQueue(tickets);
  }, [tickets]);

  // Derived sorted array from the queue
  const queueTickets = useMemo(() => {
    return priorityQueue.toSortedArray();
  }, [priorityQueue]);

  // Sync state to localStorage
  useEffect(() => {
    StorageService.saveTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    StorageService.saveAssets(assets);
  }, [assets]);

  useEffect(() => {
    StorageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    StorageService.saveComments(comments);
  }, [comments]);

  useEffect(() => {
    StorageService.saveLogs(activityLogs);
  }, [activityLogs]);

  const login = (user: User) => {
    sessionStorage.setItem('devicedesk_auth', 'true');
    setIsAuthenticated(true);
    setCurrentUserState(user);
    StorageService.setActiveUser(user);

    // Redirect view based on role
    if (user.role === 'employee') {
      setCurrentView('employee_dashboard');
    } else if (user.role === 'it_support') {
      setCurrentView('it_support_dashboard');
    } else if (user.role === 'admin') {
      setCurrentView('admin_analytics');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('devicedesk_auth');
    setIsAuthenticated(false);
    setCurrentView('auth');
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    StorageService.setActiveUser(user);
    setIsAuthenticated(true);
    sessionStorage.setItem('devicedesk_auth', 'true');
    // Redirect view based on role
    if (user.role === 'employee') {
      setCurrentView('employee_dashboard');
    } else if (user.role === 'it_support') {
      setCurrentView('it_support_dashboard');
    } else if (user.role === 'admin') {
      setCurrentView('admin_analytics');
    }
  };

  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Ticket Actions ---
  const createTicket = (data: Partial<Ticket>): Ticket => {
    const priority = data.priority || 'Medium';
    const priorityScore = PRIORITY_MAP[priority];
    const ticketNum = (tickets.length + 90).toString().padStart(3, '0');
    const ticketId = `TCK-2026-${ticketNum}`;
    const now = new Date().toISOString();

    // SLA Calculation: Critical 2h, High 4h, Medium 8h, Low 24h
    const slaHours = priority === 'Critical' ? 2 : priority === 'High' ? 4 : priority === 'Medium' ? 8 : 24;
    const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const newTicket: Ticket = {
      _id: `tkt_${Date.now()}`,
      ticketId,
      title: data.title || 'Untitled Support Request',
      description: data.description || '',
      category: data.category || 'Other',
      priority,
      priorityScore,
      status: 'Open',
      requesterId: currentUser.employeeId,
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      requesterDept: currentUser.department,
      assetId: data.assetId || null,
      assetName: data.assetName,
      assignedAgentId: null,
      createdAt: now,
      updatedAt: now,
      slaDeadline,
      attachments: data.attachments || [],
      aiSummary: data.aiSummary,
      aiConfidence: data.aiConfidence,
      aiSuggestedSteps: data.aiSuggestedSteps
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Enqueue into PriorityQueue
    priorityQueue.enqueue(newTicket);

    // Activity Log
    const newLog: ActivityLog = {
      _id: `log_${Date.now()}`,
      userId: currentUser.employeeId,
      userName: currentUser.name,
      ticketId,
      action: 'Ticket Created & Enqueued',
      newValue: `Priority: ${priority} (Score: ${priorityScore})`,
      timestamp: now
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    addToast(
      'Ticket Submitted & Enqueued',
      `${ticketId} placed into Live Priority Queue at rank #${priorityQueue.size()}`,
      'success'
    );

    return newTicket;
  };

  const processNextTicket = async (agentId?: string, agentName?: string): Promise<Ticket | null> => {
    const resolvedAgentId = agentId || currentUser.employeeId;
    const resolvedAgentName = agentName || currentUser.name;

    // Use atomic assignment with concurrency lock
    const assignedTicket = await priorityQueue.atomicAssignNext(resolvedAgentId, resolvedAgentName);

    if (!assignedTicket) {
      addToast('Priority Queue Empty', 'There are no waiting Open tickets to process.', 'warning');
      return null;
    }

    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === assignedTicket.ticketId ? { ...assignedTicket } : t))
    );

    // Log activity
    const newLog: ActivityLog = {
      _id: `log_${Date.now()}`,
      userId: resolvedAgentId,
      userName: resolvedAgentName,
      ticketId: assignedTicket.ticketId,
      action: 'Dispatched via Priority Queue',
      previousValue: 'Open',
      newValue: `In Progress (Assigned to ${resolvedAgentName})`,
      timestamp: now
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    addToast(
      'Top Priority Ticket Dispatched',
      `Assigned ${assignedTicket.ticketId} [${assignedTicket.priority}] to ${resolvedAgentName}`,
      'success'
    );

    return assignedTicket;
  };

  const assignTicket = (ticketId: string, agentId: string, agentName: string) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.ticketId === ticketId) {
          return {
            ...t,
            assignedAgentId: agentId,
            assignedAgentName: agentName,
            status: 'In Progress',
            startedAt: t.startedAt || now,
            updatedAt: now
          };
        }
        return t;
      })
    );

    // Remove from waiting queue since it's now in progress
    priorityQueue.remove(ticketId);

    const newLog: ActivityLog = {
      _id: `log_${Date.now()}`,
      userId: currentUser.employeeId,
      userName: currentUser.name,
      ticketId,
      action: 'Manual Ticket Assignment',
      newValue: `Assigned to ${agentName}`,
      timestamp: now
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    addToast('Ticket Assigned', `${ticketId} assigned to ${agentName}`, 'info');
  };

  const updateTicketPriority = (ticketId: string, newPriority: TicketPriority, reason?: string) => {
    const now = new Date().toISOString();
    const oldTicket = tickets.find((t) => t.ticketId === ticketId);
    const oldPriority = oldTicket?.priority;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.ticketId === ticketId) {
          return {
            ...t,
            priority: newPriority,
            priorityScore: PRIORITY_MAP[newPriority],
            updatedAt: now
          };
        }
        return t;
      })
    );

    // Update inside the heap
    priorityQueue.updatePriority(ticketId, newPriority);

    const newLog: ActivityLog = {
      _id: `log_${Date.now()}`,
      userId: currentUser.employeeId,
      userName: currentUser.name,
      ticketId,
      action: 'Priority Overridden',
      previousValue: oldPriority,
      newValue: `${newPriority} ${reason ? `(${reason})` : ''}`,
      timestamp: now
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    addToast('Priority Updated', `${ticketId} updated to ${newPriority}`, 'info');
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus, notes?: string) => {
    const now = new Date().toISOString();
    const target = tickets.find((t) => t.ticketId === ticketId);
    if (!target) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.ticketId === ticketId) {
          const updated: Ticket = {
            ...t,
            status: newStatus,
            updatedAt: now,
            startedAt: newStatus === 'In Progress' && !t.startedAt ? now : t.startedAt,
            resolvedAt: newStatus === 'Resolved' && !t.resolvedAt ? now : t.resolvedAt,
            closedAt: newStatus === 'Closed' && !t.closedAt ? now : t.closedAt
          };
          return updated;
        }
        return t;
      })
    );

    if (newStatus !== 'Open') {
      priorityQueue.remove(ticketId);
    } else {
      priorityQueue.enqueue(target);
    }

    const newLog: ActivityLog = {
      _id: `log_${Date.now()}`,
      userId: currentUser.employeeId,
      userName: currentUser.name,
      ticketId,
      action: `Status Changed to ${newStatus}`,
      previousValue: target.status,
      newValue: `${newStatus} ${notes ? `(${notes})` : ''}`,
      timestamp: now
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    addToast('Status Updated', `${ticketId} is now ${newStatus}`, 'success');
  };

  const addComment = (ticketId: string, message: string) => {
    if (!message.trim()) return;
    const now = new Date().toISOString();
    const newComment: TicketComment = {
      _id: `cmt_${Date.now()}`,
      ticketId,
      authorId: currentUser.employeeId,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      message,
      createdAt: now
    };

    setComments((prev) => [...prev, newComment]);

    // Update ticket updatedAt
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, updatedAt: now } : t))
    );

    addToast('Comment Posted', 'Your reply has been added to the ticket thread.', 'info');
  };

  // --- Asset CRUD ---
  const createAsset = (data: Partial<Asset>): Asset => {
    const count = (assets.length + 1008).toString();
    const assetId = `AST-${count}`;
    const now = new Date().toISOString();

    const newAsset: Asset = {
      _id: `ast_${Date.now()}`,
      assetId,
      deviceName: data.deviceName || 'New IT Hardware',
      category: data.category || 'Laptop',
      manufacturer: data.manufacturer || 'Dell',
      model: data.model || 'Standard Issue',
      serialNumber: data.serialNumber || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      purchaseDate: data.purchaseDate || now.split('T')[0],
      warrantyExpiry: data.warrantyExpiry || new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
      assignedTo: data.assignedTo || null,
      assignedToName: data.assignedToName,
      status: data.status || 'available',
      condition: data.condition || 'Excellent',
      specs: data.specs,
      createdAt: now
    };

    setAssets((prev) => [newAsset, ...prev]);
    addToast('Asset Registered', `${newAsset.assetId} (${newAsset.deviceName}) added to inventory.`, 'success');
    return newAsset;
  };

  const updateAsset = (assetId: string, data: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.assetId === assetId ? { ...a, ...data } : a))
    );
    addToast('Asset Updated', `Asset ${assetId} updated successfully.`, 'info');
  };

  const deleteAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.assetId !== assetId));
    addToast('Asset Removed', `Asset ${assetId} removed from inventory.`, 'warning');
  };

  const assignAsset = (assetId: string, employeeId: string) => {
    const emp = users.find((u) => u.employeeId === employeeId);
    const now = new Date().toISOString().split('T')[0];

    setAssets((prev) =>
      prev.map((a) =>
        a.assetId === assetId
          ? {
              ...a,
              assignedTo: employeeId,
              assignedToName: emp?.name || employeeId,
              status: 'assigned',
              assignedDate: now
            }
          : a
      )
    );
    addToast('Device Assigned', `${assetId} assigned to ${emp?.name || employeeId}`, 'success');
  };

  const unassignAsset = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.assetId === assetId
          ? {
              ...a,
              assignedTo: null,
              assignedToName: undefined,
              status: 'available',
              assignedDate: undefined
            }
          : a
      )
    );
    addToast('Device Unassigned', `${assetId} is now available in inventory.`, 'info');
  };

  // --- Employee CRUD ---
  const createUser = (data: Partial<User>): User => {
    const empNum = (users.length + 103).toString();
    const employeeId = `EMP${empNum}`;
    const newUser: User = {
      _id: `usr_${Date.now()}`,
      employeeId,
      name: data.name || 'New Employee',
      email: data.email || `${employeeId.toLowerCase()}@devicedesk.internal`,
      department: data.department || 'Operations',
      role: data.role || 'employee',
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      phone: data.phone || '+1 (555) 000-0000'
    };

    setUsers((prev) => [...prev, newUser]);
    addToast('Employee Registered', `${newUser.name} (${newUser.employeeId}) added.`, 'success');
    return newUser;
  };

  const updateUser = (employeeId: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.employeeId === employeeId ? { ...u, ...data } : u))
    );
    addToast('Employee Profile Updated', `${employeeId} updated.`, 'info');
  };

  const toggleUserStatus = (employeeId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.employeeId === employeeId) {
          const nextStatus = u.accountStatus === 'active' ? 'inactive' : 'active';
          return { ...u, accountStatus: nextStatus };
        }
        return u;
      })
    );
    addToast('Account Status Changed', `Employee ${employeeId} account status toggled.`, 'info');
  };

  // --- Automation: Aging Policy ---
  const runAgingPolicy = () => {
    const escalated = priorityQueue.applyAgingPolicy(15); // 15 min threshold for testing
    if (escalated.length > 0) {
      setTickets([...priorityQueue.toSortedArray()]);
      addToast(
        'SLA Aging Policy Triggered',
        `${escalated.length} waiting ticket(s) automatically escalated to prevent starvation!`,
        'warning'
      );
    } else {
      addToast('SLA Check Complete', 'No tickets currently exceed the SLA waiting starvation threshold.', 'info');
    }
  };

  const resetAllData = () => {
    StorageService.resetToDefaults();
    setTickets(StorageService.getTickets());
    setAssets(StorageService.getAssets());
    setUsers(StorageService.getUsers());
    setComments(StorageService.getComments());
    setActivityLogs(StorageService.getLogs());
    setCurrentUserState(StorageService.getActiveUser());
    addToast('System Reset', 'All database records restored to default seed state.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        currentView,
        setCurrentView,
        selectedTicketId,
        setSelectedTicketId,
        selectedAssetId,
        setSelectedAssetId,
        tickets,
        assets,
        users,
        comments,
        activityLogs,
        priorityQueue,
        queueTickets,
        createTicket,
        processNextTicket,
        assignTicket,
        updateTicketPriority,
        updateTicketStatus,
        addComment,
        createAsset,
        updateAsset,
        deleteAsset,
        assignAsset,
        unassignAsset,
        createUser,
        updateUser,
        toggleUserStatus,
        runAgingPolicy,
        resetAllData,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
