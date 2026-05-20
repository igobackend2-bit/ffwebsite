'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Search, Mail, Phone, Calendar, 
  Trash2, MessageCircle, ExternalLink, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminLeadsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLeads(data || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Leads Fetch Error:', err.message);
      toast.error('Failed to load leads data');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Lead status updated');
      fetchLeads();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone?.includes(searchQuery) ||
    l.source?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Leads & Inquiries</h2>
          <p className="text-muted-foreground font-medium mt-1">Manage potential customers from forms and signups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Leads</p>
              <h3 className="text-2xl font-black">{leads.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">New Leads</p>
              <h3 className="text-2xl font-black">{leads.filter(l => l.status === 'New').length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-border/50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search leads by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-primary gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-black uppercase tracking-widest text-xs">Loading Leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20 bg-[#F1F3F5]/30 rounded-3xl border border-dashed border-border">
            <Users className="mx-auto text-muted-foreground/30 mb-4" size={48} />
            <p className="text-lg font-black text-muted-foreground">No leads found</p>
            <p className="text-sm text-muted-foreground/60 font-medium mt-1">When customers fill out forms, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F1F3F5]/50 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50">
                  <th className="px-6 py-5">Contact Details</th>
                  <th className="px-6 py-5">Source</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-black text-foreground">{lead.name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground font-bold">{lead.email}</p>
                        {lead.phone && <p className="text-xs text-muted-foreground font-bold mt-0.5">{lead.phone}</p>}
                      </div>
                      {lead.message && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-xl text-xs font-medium italic border border-border text-foreground">
                          &quot;{lead.message}&quot;
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black uppercase px-3 py-1 bg-primary/10 text-primary rounded-lg">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <Calendar size={14} />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={lead.status || 'New'}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg border-0 cursor-pointer outline-none ${
                          lead.status === 'New' ? 'bg-blue-100 text-blue-700' :
                          lead.status === 'Contacted' ? 'bg-amber-100 text-amber-700' :
                          lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Converted">Converted</option>
                        <option value="Junk">Junk</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors" title="Call">
                            <Phone size={16} />
                          </a>
                        )}
                        <a href={`mailto:${lead.email}`} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Email">
                          <Mail size={16} />
                        </a>
                        <a href={`https://wa.me/${lead.phone?.replace(/\D/g,'')}?text=Hi%20${lead.name},%20we%20saw%20your%20interest%20in%20Farmers%20Factory!`} target="_blank" rel="noreferrer" className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="WhatsApp">
                          <MessageCircle size={16} />
                        </a>
                        <button onClick={() => deleteLead(lead.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
