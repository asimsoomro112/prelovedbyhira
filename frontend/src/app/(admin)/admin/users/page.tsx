"use client";
import { Search, Shield, UserCheck, UserX } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminUsersPage() {
	const [users, setUsers] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("");

	const fetchUsers = useCallback(() => {
		setIsLoading(true);
		api
			.get("/admin/users", {
				params: { search, role: roleFilter || undefined },
			})
			.then((r: any) => setUsers(r.data))
			.catch(() => {})
			.finally(() => setIsLoading(false));
	}, [search, roleFilter]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const toggleUser = async (id: string) => {
		try {
			await api.put(`/admin/users/${id}/toggle`);
			fetchUsers();
			toast.success("User status updated");
		} catch {
			toast.error("Failed to update status");
		}
	};

	return (
		<div className="min-h-screen pt-20 md:pt-28 pb-16">
			<div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
				<h1 className="text-fluid-section font-display font-bold mb-6 md:mb-8 text-dark-900 dark:text-cream-50">
					User Directory
				</h1>

				<div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-dark-900 p-4 md:p-6 rounded-3xl md:rounded-[32px] border border-gold-400/10 shadow-soft">
					<div className="relative flex-1">
						<Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search by name or email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/5 rounded-2xl pl-12 md:pl-14 pr-6 py-3 md:py-4 outline-none focus:border-gold-400/30 transition-all font-medium text-sm min-h-[48px]"
						/>
					</div>
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						className="w-full sm:w-auto bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/5 rounded-2xl px-6 md:px-8 py-3 md:py-4 outline-none focus:border-gold-400/30 transition-all font-bold text-xs md:text-sm min-h-[48px]"
					>
						<option value="">All Roles</option>
						<option value="CUSTOMER">Customer</option>
						<option value="SELLER">Seller</option>
						<option value="ADMIN">Admin</option>
					</select>
				</div>

				<div className="bg-white dark:bg-dark-900 rounded-3xl md:rounded-[40px] border border-gold-400/10 shadow-card overflow-hidden">
					<div className="hidden md:block overflow-x-auto">
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
									<tr>
										<td
											colSpan={4}
											className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest"
										>
											Gathering records...
										</td>
									</tr>
								) : users.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest"
										>
											No matching users found
										</td>
									</tr>
								) : (
									users.map((u) => (
										<tr
											key={u.id}
											className="hover:bg-gold-400/5 transition-colors group"
										>
											<td className="px-8 py-6">
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-gold-400/20 relative shrink-0">
														{u.avatar ? (
															<img
																src={u.avatar}
																alt={u.name}
																className="w-full h-full object-cover"
															/>
														) : (
															u.name?.[0] || "U"
														)}
													</div>
													<div>
														<p className="font-bold text-dark-900 dark:text-cream-50 text-sm">
															{u.name}
														</p>
														<p className="text-xs text-gray-500">{u.email}</p>
													</div>
												</div>
											</td>
											<td className="px-8 py-6">
												<span className="px-3 py-1 rounded-pill bg-gold-400/10 text-gold-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit border border-gold-400/10">
													<Shield className="w-3 h-3" />
													{u.role}
												</span>
											</td>
											<td className="px-8 py-6">
												<span
													className={`px-3 py-1 rounded-pill text-[9px] font-bold uppercase tracking-wider ${u.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
												>
													{u.isActive ? "Active" : "Banned"}
												</span>
											</td>
											<td className="px-8 py-6 text-right">
												<button
													onClick={() => toggleUser(u.id)}
													className={`p-3 rounded-xl transition-all active:scale-90 min-h-[44px] ${u.isActive ? "hover:bg-red-500/10 text-red-500" : "hover:bg-emerald-500/10 text-emerald-500"}`}
												>
													{u.isActive ? (
														<UserX className="w-5 h-5" />
													) : (
														<UserCheck className="w-5 h-5" />
													)}
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* ✅ Mobile Card View */}
					<div className="md:hidden divide-y divide-gold-400/10">
						{isLoading ? (
							<div className="p-10 text-center animate-pulse text-gray-400 text-[10px] font-bold uppercase tracking-widest">
								Gathering records...
							</div>
						) : users.length === 0 ? (
							<div className="p-10 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
								No users found
							</div>
						) : (
							users.map((u) => (
								<div
									key={u.id}
									className="p-5 flex items-center justify-between gap-4 active:bg-gold-400/5 transition-all"
								>
									<div className="flex items-center gap-4 min-w-0">
										<div className="w-12 h-12 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center font-bold text-lg overflow-hidden border border-gold-400/10 relative shrink-0">
											{u.avatar ? (
												<img
													src={u.avatar}
													alt={u.name}
													className="w-full h-full object-cover"
												/>
											) : (
												u.name?.[0] || "U"
											)}
										</div>
										<div className="min-w-0">
											<p className="font-bold text-dark-900 dark:text-cream-50 text-sm truncate">
												{u.name}
											</p>
											<p className="text-[10px] text-gray-500 truncate mb-1">
												{u.email}
											</p>
											<div className="flex items-center gap-2">
												<span className="px-2 py-0.5 rounded-md bg-gold-400/10 text-gold-400 text-[8px] font-bold uppercase tracking-widest border border-gold-400/5 flex items-center gap-1">
													<Shield className="w-2 h-2" /> {u.role}
												</span>
												<span
													className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${u.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
												>
													{u.isActive ? "Active" : "Banned"}
												</span>
											</div>
										</div>
									</div>
									<button
										onClick={() => toggleUser(u.id)}
										className={`p-3 rounded-2xl transition-all active:scale-90 min-w-[48px] min-h-[48px] flex items-center justify-center ${u.isActive ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}
									>
										{u.isActive ? (
											<UserX className="w-5 h-5" />
										) : (
											<UserCheck className="w-5 h-5" />
										)}
									</button>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
