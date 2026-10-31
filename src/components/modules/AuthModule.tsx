import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  User,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Headphones,
  UserCheck
} from 'lucide-react';

export const AuthModule: React.FC = () => {
  const { users, currentUser, setCurrentUser, login, addToast, setCurrentView } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [regRole, setRegRole] = useState<UserRole>('employee');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateLogin = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    // Check if user exists in registered list
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      login(found);
      addToast('Login Successful', `Welcome back, ${found.name}! Redirecting to dashboard...`, 'success');
    } else {
      // Create user on the fly if valid format
      const newUser = {
        _id: `usr_${Date.now()}`,
        employeeId: `EMP${Math.floor(100 + Math.random() * 900)}`,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        department: 'Engineering',
        role: 'employee' as UserRole,
        accountStatus: 'active' as const,
        createdAt: new Date().toISOString(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      login(newUser);
      addToast('Session Established', `Logged in as ${newUser.name}`, 'success');
    }
  };

  const validateRegister = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!employeeId.trim()) errs.employeeId = 'Employee ID is required (e.g. EMP109).';
    if (!regEmail.trim()) errs.regEmail = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(regEmail)) errs.regEmail = 'Invalid email address.';
    if (!regPassword) errs.regPassword = 'Password is required.';
    else if (regPassword.length < 6) errs.regPassword = 'Password must be at least 6 characters.';
    if (regPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    const newUser = {
      _id: `usr_${Date.now()}`,
      employeeId: employeeId.toUpperCase(),
      name: fullName,
      email: regEmail,
      department,
      role: regRole,
      accountStatus: 'active' as const,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    login(newUser);
    addToast('Account Created', `Registered as ${newUser.name} with ${newUser.role} privileges.`, 'success');
  };

  const quickLoginAs = (empId: string) => {
    const target = users.find((u) => u.employeeId === empId);
    if (target) {
      login(target);
      addToast('Quick Sign In', `Authenticated as ${target.name} (${target.role})`, 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-light text-forest-dark border border-cream text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-forest" />
          Enterprise SSO & Role-Based Access Control
        </div>
        <h2 className="text-3xl font-bold text-desk-primary tracking-tight">
          {isLogin ? 'Sign in to DeviceDesk' : 'Create Organization Account'}
        </h2>
        <p className="text-sm text-desk-secondary mt-1 max-w-md mx-auto">
          Manage assigned hardware, submit priority support tickets, or orchestrate IT operations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-7 desk-card p-8">
          {/* Toggle Tab */}
          <div className="flex p-1 bg-desk-bg rounded-xl mb-6 border border-desk-border">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isLogin ? 'bg-white text-desk-primary shadow-soft' : 'text-desk-secondary hover:text-desk-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isLogin ? 'bg-white text-desk-primary shadow-soft' : 'text-desk-secondary hover:text-desk-primary'
              }`}
            >
              Register Employee
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-desk-primary mb-1">Corporate Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-desk-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditya.sharma@devicedesk.internal"
                    className="desk-input w-full pl-9"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-desk-primary">Password</label>
                  <button
                    type="button"
                    onClick={() => addToast('Reset Link Sent', 'Password reset instructions dispatched to your corporate inbox.', 'info')}
                    className="text-[11px] text-forest hover:text-forest-dark font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-desk-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="desk-input w-full pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-desk-secondary hover:text-desk-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-desk-border text-forest focus:ring-forest w-4 h-4"
                  />
                  <span className="text-xs text-desk-secondary">Remember this device</span>
                </label>
              </div>

              <button type="submit" className="desk-btn-primary w-full mt-4 py-2.5">
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-desk-primary mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Sharma"
                    className="desk-input w-full"
                  />
                  {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-desk-primary mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="EMP104"
                    className="desk-input w-full"
                  />
                  {errors.employeeId && <p className="text-xs text-red-600 mt-1">{errors.employeeId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-desk-primary mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="desk-input w-full"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="IT Operations">IT Operations</option>
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="Finance & HR">Finance & HR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-desk-primary mb-1">Assigned Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="desk-input w-full"
                  >
                    <option value="employee">Employee</option>
                    <option value="it_support">IT Support Agent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-desk-primary mb-1">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="employee@devicedesk.internal"
                  className="desk-input w-full"
                />
                {errors.regEmail && <p className="text-xs text-red-600 mt-1">{errors.regEmail}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-desk-primary mb-1">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="desk-input w-full"
                  />
                  {errors.regPassword && <p className="text-xs text-red-600 mt-1">{errors.regPassword}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-desk-primary mb-1">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="desk-input w-full"
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <button type="submit" className="desk-btn-primary w-full mt-4 py-2.5">
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Quick Persona Demo Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="desk-card p-6 bg-gradient-to-br from-cream-light/40 to-sage-light/20">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-forest" />
              <h3 className="font-bold text-sm text-desk-primary">One-Click Persona Evaluation</h3>
            </div>
            <p className="text-xs text-desk-secondary mb-4 leading-relaxed">
              Test role-specific workflows instantly without typing credentials:
            </p>

            <div className="space-y-2.5">
              {/* Employee */}
              <button
                onClick={() => quickLoginAs('EMP101')}
                className="w-full p-3 rounded-xl bg-white border border-desk-border hover:border-forest/50 text-left transition-all flex items-center justify-between group shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sage-light flex items-center justify-center text-forest">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-desk-primary group-hover:text-forest transition-colors">
                      Aditya Sharma
                    </div>
                    <div className="text-[10px] text-desk-secondary">Employee (Software Engineer)</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sage-light text-forest">
                  Employee View
                </span>
              </button>

              {/* IT Support Agent */}
              <button
                onClick={() => quickLoginAs('AGT201')}
                className="w-full p-3 rounded-xl bg-white border border-desk-border hover:border-olive/50 text-left transition-all flex items-center justify-between group shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-olive-light/40 flex items-center justify-center text-olive-dark">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-desk-primary group-hover:text-olive-dark transition-colors">
                      Sarah Jenkins
                    </div>
                    <div className="text-[10px] text-desk-secondary">IT Support Agent (Queue Dispatcher)</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-olive-light/50 text-olive-dark">
                  IT Agent View
                </span>
              </button>

              {/* Admin */}
              <button
                onClick={() => quickLoginAs('ADM301')}
                className="w-full p-3 rounded-xl bg-white border border-desk-border hover:border-forest/50 text-left transition-all flex items-center justify-between group shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest-light/30 flex items-center justify-center text-forest-dark">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-desk-primary group-hover:text-forest-dark transition-colors">
                      Alex Rivera
                    </div>
                    <div className="text-[10px] text-desk-secondary">Enterprise Systems Administrator</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-forest-light/40 text-forest-dark">
                  Admin View
                </span>
              </button>
            </div>
          </div>

          <div className="desk-card p-4 text-xs text-desk-secondary flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Active Session: <strong className="text-desk-primary">{currentUser.name}</strong> ({currentUser.email}) logged in with <strong className="capitalize text-forest">{currentUser.role}</strong> privileges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
