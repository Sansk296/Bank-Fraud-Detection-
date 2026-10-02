/**
 * BFS – Bank Fraud Shield
 * Admin SOC Customer Care & Support Center
 * Review and resolve customer inquiries, held transaction appeals, and security reports
 */

import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  RefreshCw,
  User,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  ArrowUpRight,
  Lock,
  Mail
} from 'lucide-react';
import { api } from '../services/api.ts';
import { SupportTicket, TicketMessage } from '../types.ts';

export const AdminSupportDesk: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getSupportTickets();
      if (res.success) {
        setTickets(res.tickets || []);
        if (selectedTicketId) {
          loadTicketDetail(selectedTicketId);
        } else if (res.tickets && res.tickets.length > 0) {
          loadTicketDetail(res.tickets[0].ticket_id);
        }
      }
    } catch (err) {
      console.error('Failed to load admin support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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
      }
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicketId) return;
    setStatusUpdating(true);
    try {
      const res = await api.updateSupportTicketStatus(selectedTicketId, newStatus);
      if (res.success) {
        await loadTicketDetail(selectedTicketId);
        await fetchTickets();
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.user_name && t.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.user_email && t.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(t.ticket_id).includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">Open (New)</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">In Progress</span>;
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
        return <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-50 px-1.5 py-0.5 rounded border border-rose-300">Urgent</span>;
      case 'High':
        return <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">High</span>;
      case 'Medium':
        return <span className="text-[10px] font-medium text-blue-700 uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Medium</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-600 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">Low</span>;
    }
  };

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Top Support Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Tickets</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{tickets.length}</div>
          <span className="text-[11px] text-slate-400">All customer cases</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-rose-600 uppercase">Open / Unassigned</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{openCount}</div>
          <span className="text-[11px] text-slate-400">Awaiting officer reply</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-amber-600 uppercase">In Progress</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{inProgressCount}</div>
          <span className="text-[11px] text-slate-400">Under SOC investigation</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600 uppercase">Resolved</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</div>
          <span className="text-[11px] text-slate-400">Successfully closed</span>
        </div>
      </div>

      {/* Main Dual-Pane Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name, email, subject, or ID..."
                className="w-full px-3 py-1.5 pl-8 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Transaction Hold">Transaction Hold</option>
              <option value="Security Alert">Security Alert</option>
              <option value="Account Access">Account Access</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>

            <button
              onClick={fetchTickets}
              title="Refresh"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Master-Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
          
          {/* Left: Ticket List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-200 divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tickets matching current filters.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicketId === t.ticket_id;
                return (
                  <div
                    key={t.ticket_id}
                    onClick={() => loadTicketDetail(t.ticket_id)}
                    className={`p-4 transition cursor-pointer hover:bg-slate-50/80 ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-slate-900 line-clamp-1">
                        #{t.ticket_id} &bull; {t.subject}
                      </span>
                      {getStatusBadge(t.status)}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-1.5">
                      <span className="font-semibold text-blue-700">{t.user_name || 'Customer'}</span>
                      <span>&bull;</span>
                      <span className="text-slate-500 font-mono text-[10px]">{t.user_email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{t.category}</span>
                      <span>&bull;</span>
                      {getPriorityBadge(t.priority)}
                      {t.assigned_admin && (
                        <>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-medium">Assigned: {t.assigned_admin}</span>
                        </>
                      )}
                    </div>

                    {t.last_message && (
                      <p className="text-xs text-slate-600 line-clamp-1 italic bg-white p-1.5 rounded border border-slate-100">
                        "{t.last_message}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>Updated: {t.formattedUpdatedAt || t.updated_at.slice(0, 16)}</span>
                      <span className="font-semibold text-blue-600">{t.messages_count || 1} messages &rarr;</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Conversation Thread & Actions (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between bg-slate-50/20">
            {activeTicket ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-white space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-600">Ticket #{activeTicket.ticket_id}</span>
                        <h3 className="font-bold text-sm text-slate-900">{activeTicket.subject}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{activeTicket.user_name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">({activeTicket.user_email})</span>
                      </div>
                    </div>
                    <div>{getStatusBadge(activeTicket.status)}</div>
                  </div>

                  {/* Admin Status Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Change Status:</span>
                      <button
                        onClick={() => handleUpdateStatus('In Progress')}
                        disabled={statusUpdating || activeTicket.status === 'In Progress'}
                        className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('Resolved')}
                        disabled={statusUpdating || activeTicket.status === 'Resolved'}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('Closed')}
                        disabled={statusUpdating || activeTicket.status === 'Closed'}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                      >
                        Close Ticket
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Priority: {getPriorityBadge(activeTicket.priority)}
                    </div>
                  </div>
                </div>

                {/* Message Thread */}
                <div className="p-4 space-y-3 overflow-y-auto max-h-[350px] flex-1">
                  {messages.map((m) => {
                    const isAdmin = m.sender_role === 'Admin';
                    return (
                      <div
                        key={m.message_id}
                        className={`flex gap-3 max-w-[85%] ${
                          isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isAdmin ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                          }`}
                        >
                          {isAdmin ? 'SOC' : 'User'}
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs space-y-1 ${
                            isAdmin
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                          }`}
                        >
                          <div
                            className={`text-[10px] font-bold flex items-center justify-between gap-4 ${
                              isAdmin ? 'text-indigo-100' : 'text-slate-500'
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

                {/* Admin Reply Input */}
                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official response to customer as Security Officer..."
                    disabled={sendingReply}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sendingReply}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send as Admin</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 space-y-2">
                <Headphones className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-medium">Select a ticket from the left to view customer communication</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
