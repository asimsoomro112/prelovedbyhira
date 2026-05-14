"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, X, SlidersHorizontal, Search, CheckCircle2 } from "lucide-react";
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

  // Lock body scroll when filter is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFilterOpen]);

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

  const activeFilterCount = filters.category.length + filters.condition.length + filters.size.length + (filters.maxPrice < 50000 ? 1 : 0);

  const clearAllFilters = () => {
    setFilters({ category: [], condition: [], size: [], minPrice: 0, maxPrice: 50000, sortBy: 'newest' });
  };

  // ✅ Shared filter content used in both mobile sheet and desktop sidebar
  const FilterContent = () => (
    <div className="space-y-8">
      <FilterSection title="Categories">
        <div className="space-y-2">
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
              className={`py-3 rounded-xl text-xs font-bold border-2 transition-all min-h-[44px] ${
                filters.condition.includes(cond) 
                  ? "border-gold-400 bg-gold-400 text-white" 
                  : "border-gold-400/10 text-gray-400 hover:border-gold-400/30 active:bg-gold-400/5"
              }`}
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
            className="w-full accent-gold-400 min-h-[44px]" 
            aria-label="Maximum price"
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
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-all ${
                filters.size.includes(size) 
                  ? "border-gold-400 bg-gold-400 text-white" 
                  : "border-gold-400/10 text-gray-400 hover:border-gold-400/30 active:bg-gold-400/5"
              }`}
              aria-label={`Size ${size}`}
              aria-pressed={filters.size.includes(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-4 md:py-8">
      
      {/* ✅ STICKY FILTER + SORT BAR */}
      <div className="sticky top-[72px] lg:top-[100px] z-40 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-white/90 dark:bg-dark-950/90 backdrop-blur-xl border-b border-gold-400/10 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-3xl font-display font-bold">Browse</h1>
            <span className="text-xs text-gray-400 font-medium hidden md:inline">
              {data?.pages[0]?.pagination?.totalProducts || 0} products
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* ✅ Filter button with active count badge — mobile only */}
            <button 
              onClick={() => setIsFilterOpen(true)} 
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gold-400 text-white rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all min-h-[44px] relative"
              aria-label="Open filters"
            >
              <Filter className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* ✅ Sort — native select on mobile */}
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="bg-cream-50 dark:bg-dark-800 text-xs font-bold text-dark-900 dark:text-cream-50 border border-gold-400/10 rounded-xl px-3 py-2.5 outline-none min-h-[44px] appearance-none pr-8"
              aria-label="Sort products"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C4A35A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>

        {/* ✅ Active filter chips — wrap, don't overflow */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.category.map(c => (
              <button key={c} onClick={() => toggleFilter('category', c)} className="flex items-center gap-1 px-3 py-1.5 bg-gold-400/10 text-gold-400 rounded-full text-[11px] font-bold min-h-[32px]">
                {c} <X className="w-3 h-3" />
              </button>
            ))}
            {filters.condition.map(c => (
              <button key={c} onClick={() => toggleFilter('condition', c)} className="flex items-center gap-1 px-3 py-1.5 bg-gold-400/10 text-gold-400 rounded-full text-[11px] font-bold min-h-[32px]">
                {c} <X className="w-3 h-3" />
              </button>
            ))}
            {filters.size.map(s => (
              <button key={s} onClick={() => toggleFilter('size', s)} className="flex items-center gap-1 px-3 py-1.5 bg-gold-400/10 text-gold-400 rounded-full text-[11px] font-bold min-h-[32px]">
                Size {s} <X className="w-3 h-3" />
              </button>
            ))}
            <button onClick={clearAllFilters} className="px-3 py-1.5 text-red-400 text-[11px] font-bold min-h-[32px]">
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-8 lg:gap-12">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-[180px] h-[calc(100vh-200px)] overflow-y-auto pr-4 scrollbar-none">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display">Filters</h2>
            <button 
              onClick={clearAllFilters}
              className="text-xs font-bold text-gold-400 hover:underline min-h-[44px] flex items-center"
            >
              Clear All
            </button>
          </div>
          <FilterContent />
        </aside>

        {/* ✅ PRODUCT GRID — 2 columns mobile, 3 tablet, 4 desktop */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              data?.pages.map((page) => 
                page.products.map((p: any) => <ProductCard key={p.id} product={p} />)
              )
            )}
          </div>

          {/* ✅ LOAD MORE — large tap target */}
          {hasNextPage && (
            <div className="flex justify-center pt-6 pb-4">
              <button 
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full md:w-auto px-12 py-4 bg-gold-400/10 text-gold-400 rounded-2xl font-bold hover:bg-gold-400 hover:text-white active:scale-95 transition-all disabled:opacity-50 min-h-[52px]"
              >
                {isFetchingNextPage ? "Loading More..." : "Load More Style"}
              </button>
            </div>
          )}

          {!isLoading && data?.pages[0].products.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl">👗</div>
              <h2 className="text-xl font-display font-bold">No products found</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Try adjusting your filters to find your perfect match.</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ MOBILE FILTER BOTTOM SHEET — slides up from bottom, max 90vh */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* ✅ Bottom sheet — max-height 90vh, slide up */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-900 rounded-t-[28px] shadow-2xl flex flex-col"
              style={{ maxHeight: '90dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
              role="dialog"
              aria-modal="true"
              aria-label="Filter products"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-1" />
              
              <div className="flex items-center justify-between px-5 py-3 border-b border-gold-400/10">
                <h2 className="text-lg font-display font-bold">Filters</h2>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="text-xs font-bold text-red-400 min-h-[44px] flex items-center">
                      Reset
                    </button>
                  )}
                  <button 
                    onClick={() => setIsFilterOpen(false)} 
                    className="w-10 h-10 bg-gold-400/10 text-gold-400 rounded-xl flex items-center justify-center"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* ✅ Scrollable filter content */}
              <div className="flex-1 overflow-y-auto px-5 py-6 scrollbar-none">
                <FilterContent />
              </div>
              
              {/* ✅ Sticky apply button at bottom */}
              <div className="p-4 border-t border-gold-400/10">
                <button 
                  onClick={() => setIsFilterOpen(false)} 
                  className="w-full py-4 bg-gold-400 text-white rounded-2xl font-bold shadow-gold active:scale-95 transition-all min-h-[52px]"
                >
                  Show Results {data?.pages[0]?.pagination?.totalProducts ? `(${data.pages[0].pagination.totalProducts})` : ''}
                </button>
              </div>
            </motion.div>
          </div>
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
      className={`w-full flex items-center justify-between py-2 px-1 group min-h-[44px] ${active ? "text-gold-400" : "text-gray-500"}`}
      aria-pressed={active}
    >
      <span className="text-sm font-medium transition-colors group-hover:text-gold-400">{label}</span>
      <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${active ? "border-gold-400 bg-gold-400 text-white" : "border-gold-400/20 group-hover:border-gold-400/40"}`}>
        {active && <CheckIcon className="w-4 h-4" />}
      </div>
    </button>
  );
}

function CheckIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 12 5 5L20 7"/>
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="aspect-square bg-gold-400/5 rounded-2xl" />
      <div className="space-y-2 px-1">
        <div className="h-3 bg-gold-400/5 rounded w-2/3" />
        <div className="h-3 bg-gold-400/5 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-gold-400/5 rounded w-20" />
          <div className="h-5 bg-gold-400/5 rounded w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
