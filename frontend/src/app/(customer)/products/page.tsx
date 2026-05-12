"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Grid, List, ChevronDown, X, SlidersHorizontal, Search } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const CATEGORIES = ['Dresses', 'Bags', 'Shoes', 'Jewelry', 'Tops', 'More'];
const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductListingPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [] as string[],
    condition: [] as string[],
    size: [] as string[],
    minPrice: 0,
    maxPrice: 50000,
    sortBy: 'newest'
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get('/products', {
        params: {
          ...filters,
          page: pageParam,
          limit: 12
        }
      });
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.pagination.page < lastPage.pagination.totalPages ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const toggleFilter = (type: 'category' | 'condition' | 'size', value: string) => {
    setFilters(prev => {
      const current = prev[type] as string[];
      const updated = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* MOBILE HEADER */}
      <div className="flex lg:hidden items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Browse</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsFilterOpen(true)} className="p-3 bg-gold-400 text-white rounded-2xl shadow-gold"><Filter className="w-5 h-5" /></button>
          <button className="p-3 bg-white dark:bg-dark-800 rounded-2xl border border-gold-400/20"><SlidersHorizontal className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex gap-12">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-10 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display">Filters</h2>
            <button 
              onClick={() => setFilters({ category: [], condition: [], size: [], minPrice: 0, maxPrice: 50000, sortBy: 'newest' })}
              className="text-xs font-bold text-gold-400 hover:underline"
            >
              Clear All
            </button>
          </div>

          <FilterSection title="Categories">
            <div className="space-y-3">
              {CATEGORIES.map(cat => (
                <FilterItem 
                  key={cat} 
                  label={cat} 
                  active={filters.category.includes(cat)} 
                  onClick={() => toggleFilter('category', cat)} 
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Condition">
             <div className="grid grid-cols-2 gap-2">
               {CONDITIONS.map(cond => (
                 <button 
                  key={cond}
                  onClick={() => toggleFilter('condition', cond)}
                  className={`py-2 rounded-xl text-[10px] font-bold border-2 transition-all ${filters.condition.includes(cond) ? "border-gold-400 bg-gold-400 text-white" : "border-gold-400/10 text-gray-400 hover:border-gold-400/30"}`}
                 >
                   {cond}
                 </button>
               ))}
             </div>
          </FilterSection>

          <FilterSection title="Price Range">
            <div className="space-y-4">
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                className="w-full accent-gold-400" 
              />
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Rs. 0</span>
                <span>Rs. {filters.maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Size">
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => (
                <button 
                  key={size}
                  onClick={() => toggleFilter('size', size)}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-[10px] font-bold transition-all ${filters.size.includes(size) ? "border-gold-400 bg-gold-400 text-white" : "border-gold-400/10 text-gray-400 hover:border-gold-400/30"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </FilterSection>
        </aside>

        {/* PRODUCT AREA */}
        <div className="flex-1 space-y-8">
          {/* SORT BAR */}
          <div className="flex items-center justify-between bg-white dark:bg-dark-900 p-4 rounded-3xl border border-gold-400/10 shadow-soft">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="font-bold text-dark-900 dark:text-cream-50">{data?.pages[0]?.pagination?.totalProducts || 0}</span> products
            </p>
            <div className="flex items-center gap-4">
              <select 
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="bg-transparent text-sm font-bold text-gold-400 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              data?.pages.map((page) => 
                page.products.map((p: any) => <ProductCard key={p.id} product={p} />)
              )
            )}
          </div>

          {/* LOAD MORE */}
          {hasNextPage && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-12 py-4 bg-gold-400/10 text-gold-400 rounded-pill font-bold shadow-glow hover:bg-gold-400 hover:text-white transition-all disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading More..." : "Load More Style"}
              </button>
            </div>
          )}

          {!isLoading && data?.pages[0].products.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="text-6xl">👗</div>
              <h2 className="text-2xl font-display font-bold">No products found</h2>
              <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters to find your perfect match.</p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[100] bg-white dark:bg-dark-900 p-6 flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-3 bg-gold-400/10 text-gold-400 rounded-2xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-8">
              {/* Reuse Desktop components here */}
            </div>
            <button onClick={() => setIsFilterOpen(false)} className="w-full py-5 bg-gold-400 text-white rounded-pill font-bold shadow-gold mt-6">Apply Filters</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-gold-400 uppercase tracking-widest">{title}</h3>
      {children}
    </div>
  );
}

function FilterItem({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between py-1 group ${active ? "text-gold-400" : "text-gray-500"}`}
    >
      <span className="text-sm font-medium transition-colors group-hover:text-gold-400">{label}</span>
      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${active ? "border-gold-400 bg-gold-400 text-white" : "border-gold-400/20 group-hover:border-gold-400/40"}`}>
        {active && <CheckCircle2 className="w-3.5 h-3.5" />}
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-[3/4] bg-gold-400/5 rounded-card" />
      <div className="space-y-2">
        <div className="h-4 bg-gold-400/5 rounded w-2/3" />
        <div className="h-3 bg-gold-400/5 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gold-400/5 rounded w-20" />
          <div className="h-6 bg-gold-400/5 rounded w-12 rounded-pill" />
        </div>
      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/>
    </svg>
  );
}
