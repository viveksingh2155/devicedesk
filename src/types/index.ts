export type UserRole = 'employee' | 'it_support' | 'admin';

export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  passwordHash?: string;
  department: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  avatar?: string;
  phone?: string;
}

export type AssetCategory = 'Laptop' | 'Desktop' | 'Mobile' | 'Monitor' | 'Peripherals' | 'Network';

export type AssetStatus = 'assigned' | 'available' | 'under_repair' | 'retired';

export type DeviceCondition = 'Excellent' | 'Good' | 'Fair' | 'Needs Service';

export interface Asset {
  _id: string;
  assetId: string;
  deviceName: string;
  category: AssetCategory;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  assignedTo: string | null; // employeeId or null
  assignedToName?: string;
  status: AssetStatus;
  condition: DeviceCondition;
  assignedDate?: string;
  specs?: string;
  imageUrl?: string;
  createdAt: string;
}

export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Access' | 'Other';

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TicketStatus = 'Open' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  priorityScore: number; // 1 = Critical, 2 = High, 3 = Medium, 4 = Low
  status: TicketStatus;
  requesterId: string; // employeeId
  requesterName: string;
  requesterEmail: string;
  requesterDept: string;
  assetId: string | null;
  assetName?: string;
  assignedAgentId: string | null;
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  slaDeadline: string;
  slaBreached?: boolean;
  escalated?: boolean;
  attachments?: TicketAttachment[];
  aiSummary?: string;
  aiConfidence?: number;
  aiSuggestedCategory?: TicketCategory;
  aiSuggestedPriority?: TicketPriority;
  aiSuggestedSteps?: string[];
  aiSimilarTicketIds?: string[];
}

export interface TicketComment {
  _id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
  attachments?: TicketAttachment[];
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  userId: string;
  userName: string;
  ticketId?: string;
  assetId?: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}
