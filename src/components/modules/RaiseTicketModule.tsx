import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketCategory, TicketPriority, TicketAttachment } from '../../types';
import { AITicketService, AIAnalysisResult } from '../../services/aiClassifier';
import {
  Sparkles,
  ShieldAlert,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Laptop,
  ArrowRight,
  Info,
  Clock,
  Layers,
  X,
  FileText
} from 'lucide-react';

export const RaiseTicketModule: React.FC = () => {
  const {
    currentUser,
    assets,
    tickets,
    createTicket,
    setCurrentView,
    setSelectedTicketId
  } = useApp();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Hardware');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // AI Classification State
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiApplied, setAiApplied] = useState(false);

  // Filter assigned devices for this user
  const userDevices = assets.filter((a) => a.assignedTo === currentUser.employeeId);

  // Set default asset if available
  useEffect(() => {
    if (userDevices.length > 0 && !selectedAssetId) {
      setSelectedAssetId(userDevices[0].assetId);
    }
  }, [userDevices, selectedAssetId]);

  // Real-time AI classification debounced
  useEffect(() => {
    if (title.trim().length > 6 || description.trim().length > 15) {
      const timer = setTimeout(() => {
        const result = AITicketService.analyzeTicket(title, description, priority, tickets);
        setAiAnalysis(result);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setAiAnalysis(null);
    }
  }, [title, description, priority, tickets]);

  const applyAISuggestions = () => {
    if (!aiAnalysis) return;
    setCategory(aiAnalysis.suggestedCategory);
    setPriority(aiAnalysis.suggestedPriority);
    setAiApplied(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: TicketAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newAttachments.push({
        id: `att_${Date.now()}_${i}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'application/octet-stream'
      });
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Please provide a clear issue title.';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!description.trim()) {
      errs.description = 'Please describe what went wrong and how to reproduce it.';
    } else if (description.trim().length < 15) {
      errs.description = 'Description must be at least 15 characters.';
    }

    // Business rule validation: Standard employees cannot unilaterally assign Critical
    if (currentUser.role === 'employee' && priority === 'Critical') {
      const isSystemWide =
        (title + ' ' + description).toLowerCase().includes('company wide') ||
        (title + ' ' + description).toLowerCase().includes('outage') ||
        (title + ' ' + description).toLowerCase().includes('production') ||
        (title + ' ' + description).toLowerCase().includes('entire team');

      if (!isSystemWide) {
        errs.priority =
          'Enterprise Rule EP-104: Critical priority is reserved for systemic outages. Please select High, Medium, or Low. An IT Agent can escalate if needed.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const relatedAsset = assets.find((a) => a.assetId === selectedAssetId);

    setTimeout(() => {
      const created = createTicket({
        title,
        description,
        category,
        priority,
        assetId: selectedAssetId || null,
        assetName: relatedAsset?.deviceName,
        attachments,
        aiSummary: aiAnalysis?.problemSummary,
        aiConfidence: aiAnalysis?.confidence,
        aiSuggestedSteps: aiAnalysis?.troubleshootingSteps
      });

      setIsSubmitting(false);
      setSelectedTicketId(created.ticketId);
      setCurrentView('ticket_details');
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-forest uppercase tracking-wider">
          Support Desk Ticket Intake
        </div>
        <h2 className="text-2xl font-bold text-desk-primary tracking-tight">
          Raise IT Support Ticket
        </h2>
        <p className="text-xs text-desk-secondary mt-1">
          Submit technical issues directly to the Min-Heap Priority Queue for rapid resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Ticket Form */}
        <div className="lg:col-span-7 desk-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Requester Identity Banner */}
            <div className="p-3 rounded-xl bg-desk-bg/80 border border-desk-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <div>
                  <div className="font-semibold text-desk-primary">{currentUser.name}</div>
                  <div className="text-[11px] text-desk-secondary">
                    {currentUser.employeeId} • {currentUser.department}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-forest bg-sage-light/40 px-2 py-0.5 rounded-full border border-sage/40">
                Auto-Verified Requester
              </span>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-desk-primary mb-1">
                Issue Summary / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Docker container crashes on boot with error code 137"
                className="desk-input w-full"
              />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>

            {/* Category & Device Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-desk-primary mb-1">
                  Issue Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="desk-input w-full"
                >
                  <option value="Hardware">Hardware (Device/Display/Power)</option>
                  <option value="Software">Software (OS/Application/Crash)</option>
                  <option value="Network">Network (VPN/Wi-Fi/DNS)</option>
                  <option value="Access">Access (SSO/2FA/Permissions)</option>
                  <option value="Other">Other / Procurement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-desk-primary mb-1">
                  Related Hardware Device
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="desk-input w-full"
                >
                  <option value="">-- No specific device --</option>
                  {userDevices.map((dev) => (
                    <option key={dev.assetId} value={dev.assetId}>
                      {dev.assetId} – {dev.deviceName}
                    </option>
                  ))}
                  {/* General company devices */}
                  {assets
                    .filter((a) => a.assignedTo !== currentUser.employeeId)
                    .map((dev) => (
                      <option key={dev.assetId} value={dev.assetId}>
                        {dev.assetId} – {dev.deviceName} (General)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-desk-primary mb-1">
                Detailed Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Please describe symptoms, when the problem started, error logs, and any steps you've tried..."
                className="desk-input w-full resize-none"
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Priority Selector with Business Rule notice */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-desk-primary">
                  Requested Priority / Severity Level
                </label>
                <span className="text-[11px] text-desk-secondary">
                  IT Agent validates final priority
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Critical'] as TicketPriority[]).map((p) => {
                  const isSelected = priority === p;
                  let borderActive = 'border-forest bg-sage-light/20 text-forest-dark';
                  if (p === 'Critical') borderActive = 'border-red-500 bg-red-50 text-red-800';
                  if (p === 'High') borderActive = 'border-amber-500 bg-amber-50 text-amber-800';

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        isSelected
                          ? `${borderActive} shadow-soft`
                          : 'border-desk-border bg-white text-desk-secondary hover:border-olive'
                      }`}
                    >
                      <div className="capitalize">{p}</div>
                      <div className="text-[10px] font-normal text-desk-secondary mt-0.5">
                        {p === 'Critical'
                          ? '2h SLA'
                          : p === 'High'
                          ? '4h SLA'
                          : p === 'Medium'
                          ? '8h SLA'
                          : '24h SLA'}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.priority && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mt-2 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errors.priority}</span>
                </div>
              )}
            </div>

            {/* Attachments Section */}
            <div>
              <label className="block text-xs font-semibold text-desk-primary mb-1">
                Screenshots & Log Attachments
              </label>
              <div className="flex items-center gap-3">
                <label className="desk-btn-secondary py-1.5 px-3 text-xs cursor-pointer">
                  <Paperclip className="w-3.5 h-3.5 text-forest" />
                  <span>Attach File (Max 10MB)</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-desk-secondary">
                  PNG, JPG, PDF, TXT or LOG formats
                </span>
              </div>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-desk-bg border border-desk-border text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-forest shrink-0" />
                        <span className="font-medium text-desk-primary truncate">{att.name}</span>
                        <span className="text-[10px] text-desk-secondary">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="text-desk-secondary hover:text-red-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="desk-btn-primary w-full py-3 text-sm justify-center shadow-medium"
              >
                {isSubmitting ? (
                  <span>Enqueuing into Min-Heap...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-cream" />
                    <span>Submit & Insert into Priority Queue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* AI Copilot & Real-Time Classification Assistant */}
        <div className="lg:col-span-5 space-y-4">
          <div className="desk-card p-5 bg-gradient-to-br from-cream-light/50 via-white to-sage-light/20 border-sage/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-forest text-cream flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-desk-primary">AI Support Assistant</h3>
                  <p className="text-[11px] text-desk-secondary">Real-time classification & triage</p>
                </div>
              </div>
              {aiAnalysis && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest text-cream">
                  {(aiAnalysis.confidence * 100).toFixed(0)}% Match
                </span>
              )}
            </div>

            {aiAnalysis ? (
              <div className="space-y-3 animate-in fade-in">
                {/* Suggested Classification */}
                <div className="p-3 rounded-xl bg-white/90 border border-desk-border text-xs space-y-1.5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-desk-secondary">Suggested Category:</span>
                    <strong className="text-desk-primary">{aiAnalysis.suggestedCategory}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-desk-secondary">Suggested Priority:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        aiAnalysis.suggestedPriority === 'Critical'
                          ? 'badge-critical'
                          : aiAnalysis.suggestedPriority === 'High'
                          ? 'badge-high'
                          : 'badge-medium'
                      }`}
                    >
                      {aiAnalysis.suggestedPriority} (Score {aiAnalysis.priorityScore})
                    </span>
                  </div>
                  {aiAnalysis.extractedDevice && (
                    <div className="flex items-center justify-between">
                      <span className="text-desk-secondary">Extracted Device:</span>
                      <strong className="text-forest font-mono">{aiAnalysis.extractedDevice}</strong>
                    </div>
                  )}

                  <p className="text-[11px] text-desk-secondary mt-1 pt-1.5 border-t border-desk-border">
                    {aiAnalysis.reasoning}
                  </p>

                  <button
                    type="button"
                    onClick={applyAISuggestions}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-forest/10 hover:bg-forest/20 text-forest text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply AI Category & Priority</span>
                  </button>
                </div>

                {/* Self-Service Troubleshooting Steps */}
                {aiAnalysis.troubleshootingSteps.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/90 border border-desk-border text-xs space-y-2 shadow-soft">
                    <div className="font-semibold text-desk-primary flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-forest" />
                      <span>Recommended Self-Troubleshooting:</span>
                    </div>
                    <ul className="space-y-1 text-desk-secondary text-[11px] list-disc list-inside">
                      {aiAnalysis.troubleshootingSteps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Similar Past Tickets */}
                {aiAnalysis.similarTickets.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/90 border border-desk-border text-xs space-y-1.5 shadow-soft">
                    <div className="font-semibold text-desk-primary flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-forest" />
                      <span>Similar Historical Tickets:</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      {aiAnalysis.similarTickets.map((st) => (
                        <div key={st.ticketId} className="p-1.5 rounded bg-desk-bg border border-desk-border">
                          <div className="flex justify-between font-mono text-[10px] text-forest">
                            <span>{st.ticketId}</span>
                            <span>{(st.similarityScore * 100).toFixed(0)}% similarity</span>
                          </div>
                          <div className="text-desk-primary font-medium truncate mt-0.5">
                            {st.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Rule Banner */}
                {aiAnalysis.businessRuleEnforced && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      {aiAnalysis.businessRuleNote}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-desk-secondary bg-white/60 rounded-xl border border-dashed border-desk-border">
                <Sparkles className="w-6 h-6 text-olive mx-auto mb-2 opacity-50" />
                <p className="font-medium text-desk-primary">AI Copilot is listening</p>
                <p className="mt-1 text-[11px]">
                  Start typing your issue title and description to see live category detection, priority scoring, and instant troubleshooting steps.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
