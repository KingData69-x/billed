"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, X } from "lucide-react";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", address: "" });

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("clients").select("*").eq("user_id", user!.id).order("name");
    setClients((data ?? []) as Client[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("clients").insert({ ...form, user_id: user!.id });
    setForm({ name: "", email: "", phone: "", company: "", address: "" });
    setShowForm(false);
    await load();
    setSaving(false);
  }

  async function deleteClient(id: string) {
    if (!confirm("Delete this client?")) return;
    const supabase = createClient();
    await supabase.from("clients").delete().eq("id", id);
    setClients((p) => p.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{clients.length} saved</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">New Client</h2>
            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
            <Input label="Name *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="John Smith" />
            <Input label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} type="email" placeholder="john@example.com" />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
            <Input label="Company" value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="Acme Inc." />
            <div className="col-span-2">
              <label className="text-sm font-medium text-zinc-300 block mb-1.5">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                rows={2}
                placeholder="123 Main St, New York, NY 10001"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={saving} size="sm">Save Client</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-zinc-400">Loading...</div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-10 h-10 text-zinc-600 mb-4" />
          <p className="text-white font-medium mb-1">No clients yet</p>
          <p className="text-zinc-400 text-sm">Add your first client to autofill invoices</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div key={c.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-orange-500/20 transition-all group">
              <div className="flex items-start justify-between mb-2">
                <p className="text-white font-semibold">{c.name}</p>
                <button onClick={() => deleteClient(c.id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {c.company && <p className="text-zinc-400 text-xs mb-1">{c.company}</p>}
              {c.email && <p className="text-zinc-400 text-xs">{c.email}</p>}
              {c.phone && <p className="text-zinc-400 text-xs">{c.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
