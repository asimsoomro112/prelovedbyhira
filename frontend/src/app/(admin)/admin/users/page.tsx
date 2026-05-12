'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search, UserX, UserCheck, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = () => { 
    setIsLoading(true); 
    api.get('/admin/users', { params: { search, role: roleFilter || undefined } })
      .then((r: any) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false)); 
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const toggleUser = async (id: string) => { 
    try { 
      await api.put(`/admin/users/${id}/toggle`); 
      fetchUsers(); 
      toast.success('User status updated'); 
    } catch { 
      toast.error('Failed to update status'); 
    } 
  };

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold mb-8">User Directory</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-dark-900 p-6 rounded-[32px] border border-gold-400/10 shadow-soft">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/5 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-gold-400/30 transition-all font-medium" 
            />
          </div>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)} 
            className="bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/5 rounded-2xl px-8 py-4 outline-none focus:border-gold-400/30 transition-all font-bold text-sm min-w-[160px]"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cream-50 dark:bg-dark-950/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">User Identity</th>
                  <th className="px-8 py-6">Role</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-400/10">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Gathering records...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No matching users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-gold-400/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-gold-400/20 relative">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name?.[0] || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-dark-900 dark:text-cream-50">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 rounded-pill bg-gold-400/10 text-gold-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 w-fit">
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${u.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {u.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => toggleUser(u.id)} 
                        className={`p-3 rounded-2xl transition-all ${u.isActive ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-emerald-500/10 text-emerald-500'}`}
                      >
                        {u.isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
