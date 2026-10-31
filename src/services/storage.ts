import { User, Asset, Ticket, TicketComment, ActivityLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    _id: 'usr_emp_1',
    employeeId: 'EMP101',
    name: 'Aditya Sharma',
    email: 'aditya.sharma@devicedesk.internal',
    department: 'Engineering',
    role: 'employee',
    accountStatus: 'active',
    createdAt: '2025-01-15T09:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-8901'
  },
  {
    _id: 'usr_emp_2',
    employeeId: 'EMP102',
    name: 'Maya Patel',
    email: 'maya.patel@devicedesk.internal',
    department: 'Product & Design',
    role: 'employee',
    accountStatus: 'active',
    createdAt: '2025-02-10T10:15:00Z',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6789'
  },
  {
    _id: 'usr_agt_1',
    employeeId: 'AGT201',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@devicedesk.internal',
    department: 'IT Operations',
    role: 'it_support',
    accountStatus: 'active',
    createdAt: '2024-11-01T08:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 456-7890'
  },
  {
    _id: 'usr_agt_2',
    employeeId: 'AGT202',
    name: 'David Kim',
    email: 'david.kim@devicedesk.internal',
    department: 'IT Operations',
    role: 'it_support',
    accountStatus: 'active',
    createdAt: '2024-12-05T08:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 567-8901'
  },
  {
    _id: 'usr_adm_1',
    employeeId: 'ADM301',
    name: 'Alex Rivera',
    email: 'alex.rivera@devicedesk.internal',
    department: 'Enterprise Infrastructure',
    role: 'admin',
    accountStatus: 'active',
    createdAt: '2024-08-01T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 678-9012'
  }
];

export const INITIAL_ASSETS: Asset[] = [
  {
    _id: 'ast_1',
    assetId: 'AST-1001',
    deviceName: 'MacBook Pro 16" M3 Max',
    category: 'Laptop',
    manufacturer: 'Apple',
    model: 'MacBookPro18,2 (36GB RAM / 1TB SSD)',
    serialNumber: 'C02G40XYZ918',
    purchaseDate: '2025-01-20',
    warrantyExpiry: '2028-01-20',
    assignedTo: 'EMP101',
    assignedToName: 'Aditya Sharma',
    status: 'assigned',
    condition: 'Excellent',
    assignedDate: '2025-01-22',
    specs: 'Apple M3 Max 14-core CPU, 30-core GPU, Liquid Retina XDR',
    createdAt: '2025-01-20T10:00:00Z'
  },
  {
    _id: 'ast_2',
    assetId: 'AST-1002',
    deviceName: 'Dell UltraSharp 32" 4K Video Conf Monitor',
    category: 'Monitor',
    manufacturer: 'Dell',
    model: 'U3223QZ USB-C Hub Monitor',
    serialNumber: 'CN-098F41-74411',
    purchaseDate: '2024-11-15',
    warrantyExpiry: '2027-11-15',
    assignedTo: 'EMP101',
    assignedToName: 'Aditya Sharma',
    status: 'assigned',
    condition: 'Good',
    assignedDate: '2024-11-20',
    specs: 'IPS Black panel, 4K HDR, Built-in 4K Webcam & Echo Mic',
    createdAt: '2024-11-15T11:00:00Z'
  },
  {
    _id: 'ast_3',
    assetId: 'AST-1003',
    deviceName: 'ThinkPad X1 Carbon Gen 11',
    category: 'Laptop',
    manufacturer: 'Lenovo',
    model: '21HM001QUS Core i7-1365U',
    serialNumber: 'PF-4J8291',
    purchaseDate: '2024-09-10',
    warrantyExpiry: '2027-09-10',
    assignedTo: 'EMP102',
    assignedToName: 'Maya Patel',
    status: 'assigned',
    condition: 'Excellent',
    assignedDate: '2024-09-15',
    specs: 'Intel Core i7 13th Gen, 32GB LPDDR5, 512GB NVMe, 2.8K OLED',
    createdAt: '2024-09-10T12:00:00Z'
  },
  {
    _id: 'ast_4',
    assetId: 'AST-1004',
    deviceName: 'Dell XPS 15 9530',
    category: 'Laptop',
    manufacturer: 'Dell',
    model: 'XPS9530-7429SLV-PUS',
    serialNumber: '8Q2KZ33',
    purchaseDate: '2025-02-01',
    warrantyExpiry: '2028-02-01',
    assignedTo: null,
    status: 'available',
    condition: 'Excellent',
    specs: 'Intel Core i7-13700H, RTX 4060, 32GB RAM, 1TB SSD',
    createdAt: '2025-02-01T09:00:00Z'
  },
  {
    _id: 'ast_5',
    assetId: 'AST-1005',
    deviceName: 'Cisco Catalyst 9300 Edge Switch',
    category: 'Network',
    manufacturer: 'Cisco Systems',
    model: 'C9300-48P-A',
    serialNumber: 'FCW2345L09B',
    purchaseDate: '2023-05-12',
    warrantyExpiry: '2028-05-12',
    assignedTo: null,
    status: 'available',
    condition: 'Good',
    specs: '48-port PoE+ enterprise switch with redundant modular power',
    createdAt: '2023-05-12T08:00:00Z'
  },
  {
    _id: 'ast_6',
    assetId: 'AST-1006',
    deviceName: 'Apple iPhone 15 Pro (Corp Test Unit)',
    category: 'Mobile',
    manufacturer: 'Apple',
    model: 'A3102 256GB Natural Titanium',
    serialNumber: 'M2Q449J918',
    purchaseDate: '2024-03-01',
    warrantyExpiry: '2025-03-01',
    assignedTo: null,
    status: 'under_repair',
    condition: 'Needs Service',
    specs: 'A17 Pro, Super Retina XDR, USB-C (Screen shattered in testing)',
    createdAt: '2024-03-01T14:30:00Z'
  },
  {
    _id: 'ast_7',
    assetId: 'AST-1007',
    deviceName: 'Dell Latitude 7420 (Legacy Fleet)',
    category: 'Laptop',
    manufacturer: 'Dell',
    model: 'Latitude 7420 Core i5',
    serialNumber: '5G8LK12',
    purchaseDate: '2021-04-10',
    warrantyExpiry: '2024-04-10',
    assignedTo: null,
    status: 'retired',
    condition: 'Fair',
    specs: 'Intel Core i5 11th Gen, 16GB RAM, 256GB SSD (End-of-life de-provisioned)',
    createdAt: '2021-04-10T10:00:00Z'
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    _id: 'tkt_1',
    ticketId: 'TCK-2026-089',
    title: 'VPN Gateway Auth Failure – Production Blocked',
    description: 'Cannot authenticate to GlobalProtect VPN from home office. LDAP handshake keeps throwing timeout error 504. Production release is halted.',
    category: 'Network',
    priority: 'Critical',
    priorityScore: 1,
    status: 'Open',
    requesterId: 'EMP101',
    requesterName: 'Aditya Sharma',
    requesterEmail: 'aditya.sharma@devicedesk.internal',
    requesterDept: 'Engineering',
    assetId: 'AST-1001',
    assetName: 'MacBook Pro 16" M3 Max',
    assignedAgentId: null,
    createdAt: '2026-10-31T09:10:00Z',
    updatedAt: '2026-10-31T09:10:00Z',
    slaDeadline: '2026-10-31T11:10:00Z', // 2 hour SLA for Critical
    aiSummary: 'GlobalProtect VPN LDAP authentication handshake timeout 504 blocking prod deployment.',
    aiConfidence: 0.96,
    aiSuggestedSteps: [
      'Restart GlobalProtect service daemon',
      'Check RADIUS / SAML SSO server health',
      'Verify employee 2FA token validity'
    ]
  },
  {
    _id: 'tkt_2',
    ticketId: 'TCK-2026-088',
    title: 'MacBook Pro Thermal Throttling & Battery Drain',
    description: 'Fan spinning at maximum RPM even at idle. Battery drains from 100% to 15% in 45 minutes during code compilation.',
    category: 'Hardware',
    priority: 'High',
    priorityScore: 2,
    status: 'Open',
    requesterId: 'EMP101',
    requesterName: 'Aditya Sharma',
    requesterEmail: 'aditya.sharma@devicedesk.internal',
    requesterDept: 'Engineering',
    assetId: 'AST-1001',
    assetName: 'MacBook Pro 16" M3 Max',
    assignedAgentId: null,
    createdAt: '2026-10-31T08:45:00Z',
    updatedAt: '2026-10-31T08:45:00Z',
    slaDeadline: '2026-10-31T12:45:00Z', // 4 hour SLA for High
    aiSummary: 'Excessive thermal throttling and rapid battery drain on M3 Max laptop.',
    aiConfidence: 0.91,
    aiSuggestedSteps: [
      'Inspect Activity Monitor for runaway background daemon',
      'Run Apple Hardware Diagnostics (hold D on boot)',
      'Inspect battery health condition in System Settings'
    ]
  },
  {
    _id: 'tkt_3',
    ticketId: 'TCK-2026-085',
    title: 'Figma Enterprise Workspace License Seat Missing',
    description: 'Upgraded team role requires Figma Organization seat for the new design sprints. Currently locked in read-only viewer mode.',
    category: 'Access',
    priority: 'Medium',
    priorityScore: 3,
    status: 'In Progress',
    requesterId: 'EMP102',
    requesterName: 'Maya Patel',
    requesterEmail: 'maya.patel@devicedesk.internal',
    requesterDept: 'Product & Design',
    assetId: 'AST-1003',
    assetName: 'ThinkPad X1 Carbon Gen 11',
    assignedAgentId: 'AGT201',
    assignedAgentName: 'Sarah Jenkins',
    createdAt: '2026-10-31T07:30:00Z',
    updatedAt: '2026-10-31T08:00:00Z',
    startedAt: '2026-10-31T08:00:00Z',
    slaDeadline: '2026-10-31T15:30:00Z', // 8 hour SLA for Medium
    aiSummary: 'Figma Organization enterprise editor license provisioning request.',
    aiConfidence: 0.94
  },
  {
    _id: 'tkt_4',
    ticketId: 'TCK-2026-081',
    title: 'Secondary Display Cable Replacement Request',
    description: 'Need a 2-meter USB-C to DisplayPort cable for the Dell 4K monitor. The current HDMI cable flickers occasionally at 60Hz.',
    category: 'Hardware',
    priority: 'Low',
    priorityScore: 4,
    status: 'Open',
    requesterId: 'EMP101',
    requesterName: 'Aditya Sharma',
    requesterEmail: 'aditya.sharma@devicedesk.internal',
    requesterDept: 'Engineering',
    assetId: 'AST-1002',
    assetName: 'Dell UltraSharp 32" 4K Video Conf Monitor',
    assignedAgentId: null,
    createdAt: '2026-10-31T06:15:00Z',
    updatedAt: '2026-10-31T06:15:00Z',
    slaDeadline: '2026-11-01T18:15:00Z', // 24 hour SLA for Low
    aiSummary: 'Request for USB-C to DisplayPort cable replacement due to 60Hz HDMI flicker.',
    aiConfidence: 0.98
  },
  {
    _id: 'tkt_5',
    ticketId: 'TCK-2026-074',
    title: 'Docker Desktop WSL2 Engine Crash on Boot',
    description: 'Docker failed to initialize WSL2 backend after Windows 11 cumulative update KB5034441. Docker daemon exits immediately.',
    category: 'Software',
    priority: 'High',
    priorityScore: 2,
    status: 'Resolved',
    requesterId: 'EMP101',
    requesterName: 'Aditya Sharma',
    requesterEmail: 'aditya.sharma@devicedesk.internal',
    requesterDept: 'Engineering',
    assetId: 'AST-1001',
    assetName: 'MacBook Pro 16" M3 Max',
    assignedAgentId: 'AGT202',
    assignedAgentName: 'David Kim',
    createdAt: '2026-10-30T11:20:00Z',
    updatedAt: '2026-10-30T14:10:00Z',
    startedAt: '2026-10-30T11:35:00Z',
    resolvedAt: '2026-10-30T14:10:00Z',
    slaDeadline: '2026-10-30T15:20:00Z',
    aiSummary: 'WSL2 Linux kernel update solved Docker daemon initialization failure.'
  }
];

export const INITIAL_COMMENTS: TicketComment[] = [
  {
    _id: 'cmt_1',
    ticketId: 'TCK-2026-085',
    authorId: 'AGT201',
    authorName: 'Sarah Jenkins',
    authorRole: 'it_support',
    message: 'Hello Maya, I have submitted the procurement approval ticket to the design director for your Figma seat. Will activate once signed off.',
    createdAt: '2026-10-31T08:05:00Z'
  },
  {
    _id: 'cmt_2',
    ticketId: 'TCK-2026-085',
    authorId: 'EMP102',
    authorName: 'Maya Patel',
    authorRole: 'employee',
    message: 'Thanks Sarah! Our director mentioned she just approved it in Workday.',
    createdAt: '2026-10-31T08:14:00Z'
  },
  {
    _id: 'cmt_3',
    ticketId: 'TCK-2026-074',
    authorId: 'AGT202',
    authorName: 'David Kim',
    authorRole: 'it_support',
    message: 'Pushed the WSL2 Linux kernel patch v5.15.150 via Microsoft Endpoint Manager. Aditya, please restart and confirm.',
    createdAt: '2026-10-30T13:40:00Z'
  },
  {
    _id: 'cmt_4',
    ticketId: 'TCK-2026-074',
    authorId: 'EMP101',
    authorName: 'Aditya Sharma',
    authorRole: 'employee',
    message: 'Rebooted and Docker daemon is running smoothly now. Resolving this ticket. Thank you!',
    createdAt: '2026-10-30T14:08:00Z'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    _id: 'log_1',
    userId: 'EMP101',
    userName: 'Aditya Sharma',
    ticketId: 'TCK-2026-089',
    action: 'Ticket Created',
    newValue: 'Open (Critical)',
    timestamp: '2026-10-31T09:10:00Z'
  },
  {
    _id: 'log_2',
    userId: 'AGT201',
    userName: 'Sarah Jenkins',
    ticketId: 'TCK-2026-085',
    action: 'Ticket Assigned',
    newValue: 'Assigned to Sarah Jenkins (In Progress)',
    timestamp: '2026-10-31T08:00:00Z'
  },
  {
    _id: 'log_3',
    userId: 'AGT202',
    userName: 'David Kim',
    ticketId: 'TCK-2026-074',
    action: 'Ticket Resolved',
    previousValue: 'In Progress',
    newValue: 'Resolved',
    timestamp: '2026-10-30T14:10:00Z'
  }
];

const STORAGE_KEYS = {
  USERS: 'devicedesk_users',
  ASSETS: 'devicedesk_assets',
  TICKETS: 'devicedesk_tickets',
  COMMENTS: 'devicedesk_comments',
  LOGS: 'devicedesk_logs',
  ACTIVE_USER: 'devicedesk_active_user'
};

export class StorageService {
  public static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  public static saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public static getAssets(): Asset[] {
    const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_ASSETS));
      return INITIAL_ASSETS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ASSETS;
    }
  }

  public static saveAssets(assets: Asset[]): void {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  }

  public static getTickets(): Ticket[] {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_TICKETS;
    }
  }

  public static saveTickets(tickets: Ticket[]): void {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }

  public static getComments(): TicketComment[] {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
      return INITIAL_COMMENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_COMMENTS;
    }
  }

  public static saveComments(comments: TicketComment[]): void {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }

  public static getLogs(): ActivityLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LOGS;
    }
  }

  public static saveLogs(logs: ActivityLog[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  public static getActiveUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // fallback
      }
    }
    // Default to Employee
    return INITIAL_USERS[0];
  }

  public static setActiveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  }

  public static resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_ASSETS));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[0]));
  }
}
