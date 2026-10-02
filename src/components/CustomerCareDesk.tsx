/**
 * BFS – Bank Fraud Shield
 * Customer Care & Security Support Desk (Customer View)
 * Connects directly with the Bank Security Administrator / SOC
 */

import React, { useState, useEffect } from 'react';
import {
  Headphones,
  MessageSquare,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  RefreshCw,
  ChevronRight,
  ShieldAlert,
  User,
  ShieldCheck,
  X
} from 'lucide-react';
import { api } from '../services/api.ts';
import { SupportTicket, TicketMessage } from '../types.ts';

interface CustomerCareDeskProps {
  onTicketUpdated?: () => void;
  heldTransactionId?: number | null;
}

export const CustomerCareDesk: React.FC<CustomerCareDeskProps> = ({ onTicketUpdated, heldTransactionId }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // New ticket modal
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<'Security Alert' | 'Transaction Hold' | 'Account Access' | 'General Inquiry'>('General Inquiry');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newMessage, setNewMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketNotice, setTicketNotice] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getSupportTickets();
      if (res.success) {
        setTickets(res.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Pre-fill held transaction inquiry if passed
  useEffect(() => {
    if (heldTransactionId) {
      setNewSubject(`Inquiry regarding held transaction #${heldTransactionId}`);
      setNewCategory('Transaction Hold');
      setNewPriority('High');
      setNewMessage(`Hello Bank Care Team,\n\nMy transaction #${heldTransactionId} is currently showing status "Under Review". Please verify that this is an authorized transaction by me and process it as soon as possible.\n\nThank you.`);
      setIsNewTicketOpen(true);
    }
  }, [heldTransactionId]);

  const loadTicketDetail = async (ticketId: number) => {
    setSelectedTicketId(ticketId);
    try {
      const res = await api.getSupportTicketDetail(ticketId);
      if (res.success) {
        setActiveTicket(res.ticket);
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Failed to load ticket detail:', err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await api.replySupportTicket(selectedTicketId, replyText.trim());
      if (res.success) {
        setReplyText('');
        await loadTicketDetail(selectedTicketId);
        await fetchTickets();
        if (onTicketUpdated) onTicketUpdated();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    setSubmittingTicket(true);
    try {
      const res = await api.createSupportTicket({
        subject: newSubject.trim(),
        category: newCategory,
        priority: newPriority,
        message: newMessage.trim()
      });

      if (res.success) {
        setTicketNotice('Ticket registered successfully. A Security Officer will respond shortly.');
        setNewSubject('');
        setNewMessage('');
        setIsNewTicketOpen(false);
        await fetchTickets();
        if (res.ticketId) {
          loadTicketDetail(res.ticketId);
        }
        if (onTicketUpdated) onTicketUpdated();
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">Open</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">In Review by Admin</span>;
      case 'Resolved':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved</span>;
      case 'Closed':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <span className="text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Urgent</span>;
      case 'High':
        return <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">High</span>;
      case 'Medium':
        return <span className="text-[10px] font-medium text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Medium</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-500 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">Low</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Care Header */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Customer Care & Security Desk
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                Connected to Admin SOC
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Direct assistance with held transactions, security verifications, and account services
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            title="Refresh Tickets"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open Support Request</span>
          </button>
        </div>
      </div>

      {ticketNotice && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{ticketNotice}</span>
          </div>
          <button onClick={() => setTicketNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Dual-Pane: Ticket List (Left) + Conversation Thread (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
        
        {/* Ticket List (5 Cols) */}
        <div className="md:col-span-5 border-r border-slate-200 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No support requests yet.</p>
              <p className="text-[11px] text-slate-400">
                Need help with a transaction hold or security inquiry? Click "Open Support Request".
              </p>
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicketId === t.ticket_id;
              return (
                <div
                  key={t.ticket_id}
                  onClick={() => loadTicketDetail(t.ticket_id)}
                  className={`p-4 transition cursor-pointer hover:bg-slate-50/80 ${
                    isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">
                      {t.subject}
                    </span>
                    {getStatusBadge(t.status)}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                    <span className="font-mono text-slate-700">#{t.ticket_id}</span>
                    <span>&bull;</span>
                    <span className="text-slate-600 font-medium">{t.category}</span>
                    <span>&bull;</span>
                    {getPriorityBadge(t.priority)}
                  </div>

                  {t.last_message && (
                    <p className="text-xs text-slate-600 line-clamp-1 italic bg-white p-1.5 rounded border border-slate-100">
                      "{t.last_message}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>Updated: {t.formattedUpdatedAt || t.updated_at.slice(0, 16)}</span>
                    <span className="font-semibold text-blue-600 flex items-center gap-0.5">
                      {t.messages_count || 1} msg &rarr;
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Conversation Thread (7 Cols) */}
        <div className="md:col-span-7 flex flex-col justify-between bg-slate-50/30">
          {activeTicket ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-600">Ticket #{activeTicket.ticket_id}</span>
                    <h3 className="font-bold text-sm text-slate-900">{activeTicket.subject}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>Category: <strong>{activeTicket.category}</strong></span>
                    <span>&bull;</span>
                    <span>Priority: {getPriorityBadge(activeTicket.priority)}</span>
                    {activeTicket.assigned_admin && (
                      <>
                        <span>&bull;</span>
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Handled by: {activeTicket.assigned_admin}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div>{getStatusBadge(activeTicket.status)}</div>
              </div>

              {/* Message List */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[350px] flex-1">
                {messages.map((m) => {
                  const isAdmin = m.sender_role === 'Admin';
                  return (
                    <div
                      key={m.message_id}
                      className={`flex gap-3 max-w-[85%] ${
                        isAdmin ? 'mr-auto' : 'ml-auto flex-row-reverse'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isAdmin ? 'SOC' : 'You'}
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          isAdmin
                            ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                            : 'bg-blue-600 text-white shadow-xs'
                        }`}
                      >
                        <div
                          className={`text-[10px] font-bold flex items-center justify-between gap-4 ${
                            isAdmin ? 'text-indigo-600' : 'text-blue-100'
                          }`}
                        >
                          <span>{m.sender_name} ({m.sender_role})</span>
                          <span>{m.formattedTime || m.created_at.slice(11, 16)}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.message_text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message to Bank Support / Security Admin..."
                  disabled={activeTicket.status === 'Closed' || sendingReply}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || activeTicket.status === 'Closed' || sendingReply}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 space-y-2">
              <Headphones className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-medium">Select a ticket from the left to view response from Bank Security Team</p>
              <button
                onClick={() => setIsNewTicketOpen(true)}
                className="mt-2 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Or submit a new support request &rarr;
              </button>
            </div>
          )}
        </div>

      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900">
                <Headphones className="w-5 h-5 text-blue-600" />
                <span>Open Bank Support Request</span>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Inquiry regarding held transaction #1004"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Transaction Hold">Transaction Hold</option>
                    <option value="Security Alert">Security Alert</option>
                    <option value="Account Access">Account Access</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Detailed Explanation
                </label>
                <textarea
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Explain your issue, transaction details, or security question..."
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  {submittingTicket ? 'Submitting to SOC...' : 'Submit Support Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
