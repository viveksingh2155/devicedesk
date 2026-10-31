import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';

// Modules
import { AuthModule } from './components/modules/AuthModule';
import { EmployeeDashboard } from './components/modules/EmployeeDashboard';
import { MyDevicesModule } from './components/modules/MyDevicesModule';
import { RaiseTicketModule } from './components/modules/RaiseTicketModule';
import { MyTicketsModule } from './components/modules/MyTicketsModule';
import { TicketDetailsModule } from './components/modules/TicketDetailsModule';
import { ITSupportDashboard } from './components/modules/ITSupportDashboard';
import { PriorityQueueModule } from './components/modules/PriorityQueueModule';
import { AssetInventoryModule } from './components/modules/AssetInventoryModule';
import { EmployeeManagementModule } from './components/modules/EmployeeManagementModule';
import { AdminAnalyticsModule } from './components/modules/AdminAnalyticsModule';

import { ChevronRight, Home, Laptop } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, setCurrentView, isAuthenticated } = useApp();

  // If not authenticated, render Login / Register view first
  if (!isAuthenticated || currentView === 'auth') {
    return (
      <div className="min-h-screen bg-[#F7F7F1] flex flex-col justify-between">
        <header className="px-6 py-4 border-b border-desk-border bg-white/80 backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-white shadow-soft">
              <Laptop className="w-5 h-5 text-cream" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-desk-primary">DeviceDesk</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-cream-light text-olive-dark border border-cream">
                Enterprise v2.4
              </span>
            </div>
          </div>
          <div className="text-xs text-desk-secondary hidden sm:block">
            IT Asset & Min-Heap Support Portal
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-6 px-4">
          <div className="w-full max-w-5xl">
            <AuthModule />
          </div>
        </main>

        <footer className="py-4 border-t border-desk-border text-center text-xs text-desk-secondary">
          DeviceDesk Enterprise Portal • IT Asset & Support Management System
        </footer>

        <ToastContainer />
      </div>
    );
  }

  const getViewBreadcrumb = () => {
    switch (currentView) {
      case 'employee_dashboard':
        return 'Employee Dashboard (Slide Overview)';
      case 'my_devices':
        return 'My Assigned Devices';
      case 'raise_ticket':
        return 'Raise Support Ticket';
      case 'my_tickets':
        return 'Support Ticket Directory';
      case 'ticket_details':
        return 'Ticket Lifecycle Details';
      case 'it_support_dashboard':
        return 'IT Operations Center';
      case 'priority_queue':
        return 'Min-Heap Priority Queue Engine';
      case 'asset_inventory':
        return 'Hardware Asset Inventory';
      case 'employee_management':
        return 'Employee IAM Directory';
      case 'admin_analytics':
        return 'Operational Intelligence & Analytics';
      default:
        return 'Dashboard';
    }
  };

  const renderActiveModule = () => {
    switch (currentView) {
      case 'employee_dashboard':
        return <EmployeeDashboard />;
      case 'my_devices':
        return <MyDevicesModule />;
      case 'raise_ticket':
        return <RaiseTicketModule />;
      case 'my_tickets':
        return <MyTicketsModule />;
      case 'ticket_details':
        return <TicketDetailsModule />;
      case 'it_support_dashboard':
        return <ITSupportDashboard />;
      case 'priority_queue':
        return <PriorityQueueModule />;
      case 'asset_inventory':
        return <AssetInventoryModule />;
      case 'employee_management':
        return <EmployeeManagementModule />;
      case 'admin_analytics':
        return <AdminAnalyticsModule />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F1] text-[#25291F]">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-desk-secondary mb-4 pb-2 border-b border-desk-border">
            <button
              onClick={() => setCurrentView('employee_dashboard')}
              className="hover:text-forest flex items-center gap-1 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>DeviceDesk</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-desk-primary">{getViewBreadcrumb()}</span>
          </div>

          {/* Module Content */}
          <div className="animate-in fade-in duration-300">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
