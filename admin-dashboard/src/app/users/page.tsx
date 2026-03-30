'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import AuthGuard from '@/components/auth/auth-guard';
import { UserGroupIcon, PlusIcon, MagnifyingGlassIcon, TrashIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { UserResponse, BranchResponse, CreateUserRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toaster';
import { Label } from '@/components/ui/label';

export default function UsersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateUserRequest & { password: string }>({
    fullName: '',
    email: '',
    password: '',
    role: 'CASHIER',
    assignedBranchId: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, branchesRes] = await Promise.all([
        api.users.getAll(),
        api.branches.getAll(),
      ]);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (branchesRes.success) setBranches(branchesRes.data || []);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({ fullName: '', email: '', password: '', role: 'CASHIER', assignedBranchId: '' });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: CreateUserRequest = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        assignedBranchId: formData.assignedBranchId || undefined,
      };
      const response = await api.users.create(payload);
      if (response.success) {
        toast({ title: 'Success', description: 'User created successfully.' });
        setIsAddOpen(false);
        resetForm();
        fetchUsers();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Create user error:', err);
      toast({ title: 'Error', description: 'Failed to create user.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      const response = await api.users.delete(id);
      if (response.success) {
        toast({ title: 'Deactivated', description: 'User has been deactivated.' });
        fetchUsers();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Deactivate user error:', err);
      toast({ title: 'Error', description: 'Failed to deactivate user.', variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleVariant = (role: string): 'error' | 'warning' | 'success' | 'info' | 'default' => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'MANAGER': return 'warning';
      case 'CASHIER': return 'success';
      default: return 'default';
    }
  };

  const getInitials = (fullName: string) =>
    fullName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Users (Staff)</h1>
              <p className="mt-1 text-sm text-text-secondary font-medium">
                Manage staff accounts and role assignments
              </p>
            </div>

            <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new staff account with a role assignment.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (min. 8 characters)</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="input-field w-full"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'MANAGER' | 'CASHIER' })}
                    >
                      <option value="CASHIER">Cashier</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  {(formData.role === 'CASHIER' || formData.role === 'MANAGER') && (
                    <div className="space-y-2">
                      <Label htmlFor="assignedBranchId">Assigned Branch</Label>
                      <select
                        id="assignedBranchId"
                        className="input-field w-full"
                        value={formData.assignedBranchId || ''}
                        onChange={e => setFormData({ ...formData, assignedBranchId: e.target.value })}
                      >
                        <option value="">No branch assigned</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name} ({branch.branchType})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create User'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Staff</p>
                  <p className="text-2xl font-black text-primary">{filteredUsers.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-error">
              <div className="flex items-center">
                <div className="p-3 bg-error/10 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-error" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Admin Count</p>
                  <p className="text-2xl font-black text-error">
                    {filteredUsers.filter(u => u.role === 'ADMIN').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-success">
              <div className="flex items-center">
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Users</p>
                  <p className="text-2xl font-black text-success">
                    {filteredUsers.filter(u => u.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="card p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <Input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-12"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-error/5 border border-error/20 rounded-xl p-4 flex items-center justify-between">
              <p className="text-error text-sm font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchUsers}>Retry</Button>
            </div>
          )}

          {/* Users Table */}
          <div className="card overflow-hidden">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-divider">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">Last Login</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-divider">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(6)].map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-8 bg-surface rounded w-full"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                              <span className="text-sm font-black text-primary">{getInitials(user.fullName)}</span>
                            </div>
                            <div>
                              <div className="text-sm font-black text-primary">{user.fullName}</div>
                              <div className="text-[10px] text-text-secondary font-bold">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-text-secondary">
                          {user.assignedBranchName || <span className="italic opacity-50">Global</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.isActive ? 'success' : 'error'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {user.isActive && (
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-error/5"
                              onClick={() => handleDeactivate(user.id)}
                              title="Deactivate user"
                            >
                              <TrashIcon className="h-4 w-4 text-error" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-text-secondary bg-surface/30">
                        <UserGroupIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No users found</p>
                        <p className="text-sm mt-1">Try adjusting your search or add a new user.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-divider">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-surface rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-surface rounded w-1/2"></div>
                  </div>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-surface transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 flex-shrink-0 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <span className="text-sm font-black text-primary">{getInitials(user.fullName)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-black text-primary truncate">{user.fullName}</h4>
                          <Badge variant={getRoleVariant(user.role)} className="h-4 px-1 text-[8px] shrink-0">{user.role}</Badge>
                        </div>
                        <p className="text-[10px] text-text-secondary truncate">{user.email}</p>
                        <p className="text-[10px] text-primary font-black mt-0.5">{user.assignedBranchName || 'Global Access'}</p>
                      </div>
                    </div>
                    {user.isActive && (
                      <Button
                        variant="outline" size="icon"
                        className="h-8 w-8 rounded-lg border-error/20 hover:bg-error/5 shrink-0"
                        onClick={() => handleDeactivate(user.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-error" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-text-secondary">
                  <p className="font-bold">No users found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && filteredUsers.length > 0 && (
              <div className="px-6 py-3 bg-surface/50 border-t border-divider text-xs text-text-secondary font-medium">
                {filteredUsers.length} of {users.length} users
              </div>
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
