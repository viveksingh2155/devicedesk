import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LogIn,
  LayoutDashboard,
  Laptop,
  PlusCircle,
  Ticket,
  FileText,
  Headphones,
  ListOrdered,
  Boxes,
  Users,
  BarChart3,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles: ('employee' | 'it_support' | 'admin')[];
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, queueTickets, tickets } = useApp();

  const openTicketsCount = tickets.filter(
    (t) => t.status === 'Open' && (currentUser.role !== 'employee' || t.requesterId === currentUser.employeeId)
  ).length;

  const myTicketsCount = tickets.filter((t) => t.requesterId === currentUser.employeeId).length;

  const accountItems: NavItem[] = [
    {
      id: 'auth',
      label: 'Login / Register',
      icon: <LogIn className="w-4 h-4" />,
      allowedRoles: ['employee', 'it_support', 'admin']
    }
  ];

  const employeeItems: NavItem[] = [
    {
      id: 'employee_dashboard',
      label: 'Employee Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['employee', 'it_support', 'admin']
    },
    {
      id: 'my_devices',
      label: 'My Devices',
      icon: <Laptop className="w-4 h-4" />,
      allowedRoles: ['employee', 'it_support', 'admin']
    },
    {
      id: 'raise_ticket',
      label: 'Raise Support Ticket',
      icon: <PlusCircle className="w-4 h-4 text-forest" />,
      allowedRoles: ['employee', 'it_support', 'admin']
    },
    {
      id: 'my_tickets',
      label: 'My Tickets',
      icon: <Ticket className="w-4 h-4" />,
      allowedRoles: ['employee', 'it_support', 'admin'],
      badge: myTicketsCount
    },
    {
      id: 'ticket_details',
      label: 'Ticket Details',
      icon: <FileText className="w-4 h-4" />,
      allowedRoles: ['employee', 'it_support', 'admin']
    }
  ];

  const itOpsItems: NavItem[] = [
    {
      id: 'it_support_dashboard',
      label: 'IT Support Dashboard',
      icon: <Headphones className="w-4 h-4" />,
      allowedRoles: ['it_support', 'admin'],
      badge: openTicketsCount
    },
    {
      id: 'priority_queue',
      label: 'Priority Queue (Min-Heap)',
      icon: <ListOrdered className="w-4 h-4" />,
      allowedRoles: ['it_support', 'admin'],
      badge: queueTickets.length
    },
    {
      id: 'asset_inventory',
      label: 'Asset Inventory',
      icon: <Boxes className="w-4 h-4" />,
      allowedRoles: ['admin', 'it_support']
    },
    {
      id: 'employee_management',
      label: 'Employee Management',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['admin']
    },
    {
      id: 'admin_analytics',
      label: 'Admin Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      allowedRoles: ['admin']
    }
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-6">
      <div className="text-[11px] font-semibold tracking-wider uppercase text-desk-secondary px-3 mb-2 flex items-center justify-between">
        <span>{title}</span>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const isAllowed = item.allowedRoles.includes(currentUser.role);
          const isActive = currentView === item.id;

          if (!isAllowed) {
            return (
              <div
                key={item.id}
                title={`Requires ${item.allowedRoles.join('/')} privileges`}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-desk-secondary/50 cursor-not-allowed select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="opacity-40">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <Lock className="w-3.5 h-3.5 opacity-40" />
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-forest text-white shadow-soft font-semibold'
                  : 'text-desk-primary hover:bg-cream-light/60 hover:text-desk-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-cream' : 'text-olive'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-cream text-forest-dark'
                      : 'bg-sage-light text-forest-dark'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="w-64 bg-[#FFFEF9] border-r border-desk-border shrink-0 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between">
      <div>
        {renderNavGroup('Account', accountItems)}
        {renderNavGroup('Employee Portal', employeeItems)}
        {renderNavGroup('IT Operations', itOpsItems)}
      </div>

      {/* Bottom Feature Card: Algorithm Callout */}
      <div className="p-3.5 rounded-2xl bg-cream-light/40 border border-cream/70 text-xs text-desk-primary space-y-2">
        <div className="flex items-center gap-2 font-semibold text-olive-dark">
          <Sparkles className="w-4 h-4 text-forest" />
          <span>Min-Heap Priority Queue</span>
        </div>
        <p className="text-[11px] text-desk-secondary leading-relaxed">
          Tickets ordered by <code className="bg-white/80 px-1 py-0.5 rounded border border-cream text-forest font-mono">p ASC, t ASC</code> with SLA starvation prevention.
        </p>
        <button
          onClick={() => {
            if (currentUser.role === 'employee') {
              setCurrentView('raise_ticket');
            } else {
              setCurrentView('it_support_dashboard');
            }
          }}
          className="w-full text-center py-1.5 rounded-lg bg-forest text-cream text-[11px] font-semibold hover:bg-forest-dark transition-colors flex items-center justify-center gap-1.5"
        >
          <span>{currentUser.role === 'employee' ? 'Submit Ticket' : 'Open IT Dashboard'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
