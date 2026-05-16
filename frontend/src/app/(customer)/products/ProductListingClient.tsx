"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, X, SlidersHorizontal, Search, CheckCircle2, Check } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const CATEGORIES = ['Dresses', 'Bags', 'Shoes', 'Jewelry', 'Tops', 'Watches', 'Accessories'];
const BRANDS = ['Chanel', 'Louis Vuitton', 'Gucci', 'Prada', 'Hermes', 'Rolex', 'Cartier', 'Dior', 'Others'];
const CONDITIONS = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'];

const SORT_OPTIONS = [
  { id: 'newest',     label: 'Newest Arrivals' },
  { id: 'price_asc',  label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'popular',    label: 'Most Popular' },
];

export default function ProductListingClient({ initialProducts, initialPagination }: { initialProducts: any[], initialPagination: any }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [] as string[],
    brand: [] as string[],
    condition: [] as string[],
    size: [] as string[],
    minPrice: 0,
    maxPrice: 500000,
    sortBy: 'newest',
    search: ''
  });

  const searchParams = useSearchParams();

  // Initialize filters from URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    const brand = searchParams.get('brand');
    const sort = searchParams.get('sortBy');
    const search = searchParams.get('search');

    setFilters(prev => ({
      ...prev,
      category: cat ? [cat] : prev.category,
      brand: brand ? [brand] : prev.brand,
      sortBy: sort || prev.sortBy,
      search: search || prev.search
    }));
  }, [searchParams]);

  // Lock body scroll when filter is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
        if (isFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }
    return () => { if (typeof document !== 'undefined') document.body.style.overflow = 'unset'; };
  }, [isFilterOpen]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch
  } = useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: async ({ pageParam = null }) => {
      const { data } = await api.get('/products', {
        params: {
          ...filters,
          lastDocId: pageParam,
          limit: 12
        }
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.lastDocId;
      }
      return undefined;
    },
    initialPageParam: null,
    initialData: (filters.sortBy === 'newest' && filters.category.length === 0 && filters.condition.length === 0 && filters.size.length === 0) 
      ? {
          pages: [{ products: initialProducts, pagination: initialPagination }],
          pageParams: [null],
        }
      : undefined
  });

  // Infinite Scroll Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const target = document.querySelector('#load-more-trigger');
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleFilter = (type: 'category' | 'condition' | 'size' | 'brand', value: string) => {
    setFilters(prev => {
      const current = prev[type] as string[];
      const updated = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const activeFilterCount = filters.category.length + filters.brand.length + filters.condition.length + filters.size.length + (filters.maxPrice < 500000 ? 1 : 0) + (filters.search ? 1 : 0);

  const clearAllFilters = () => {
    setFilters({ category: [], brand: [], condition: [], size: [], minPrice: 0, maxPrice: 500000, sortBy: 'newest', search: '' });
  };

  const FilterContent = () => (
    <div className="space-y-10">
      {/* Search Input (Mobile Only) */}
      <div className="sm:hidden relative">
        <input 
          type="text"
          placeholder="Neural Search..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full h-12 bg-cream-50 dark:bg-dark-900 rounded-2xl pl-12 pr-4 text-sm border border-gold-400/10 focus:border-gold-400 transition-all outline-none"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Categories Section */}
      <FilterSection title="Curated Categories">
        <div className="grid grid-cols-1 gap-1">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => toggleFilter('category', cat)}
              className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 ${
                filters.category.includes(cat) 
                  ? "bg-gold-400/10 text-gold-400" 
                  : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400"
              }`}
            >
              <span className="text-[12px] font-bold tracking-wide">{cat}</span>
              {filters.category.includes(cat) && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Designer Brands Section */}
      <FilterSection title="Designer Brands">
        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto scrollbar-none px-1">
          {BRANDS.map(brand => (
            <button 
              key={brand}
              onClick={() => toggleFilter('brand', brand)}
              className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 ${
                filters.brand.includes(brand) 
                  ? "bg-gold-400/10 text-gold-400" 
                  : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400"
              }`}
            >
              <span className="text-[12px] font-bold tracking-wide">{brand}</span>
              {filters.brand.includes(brand) && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Condition Section */}
      <FilterSection title="Condition Protocol">
         <div className="grid grid-cols-2 gap-2">
           {CONDITIONS.map(cond => (
             <button 
              key={cond}
              onClick={() => toggleFilter('condition', cond)}
              className={`py-3.5 rounded-2xl text-[10px] font-black tracking-[0.1em] border-2 transition-all ${
                filters.condition.includes(cond) 
                  ? "border-gold-400 bg-gold-400 text-white shadow-lg shadow-gold-400/20" 
                  : "border-gold-400/10 text-gray-400 hover:border-gold-400/30 dark:bg-white/5"
              }`}
             >
               {cond}
             </button>
           ))}
         </div>
      </FilterSection>

      {/* Price Range Section */}
      <FilterSection title="Price Ceiling">
        <div className="space-y-6 px-1">
          <div className="relative pt-8">
            {/* Price Label (Floating) */}
            <motion.div 
              initial={false}
              animate={{ left: `${(filters.maxPrice / 500000) * 100}%` }}
              className="absolute top-0 -translate-x-1/2 bg-gold-400 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-xl shadow-gold-400/30 whitespace-nowrap"
            >
              Rs. {filters.maxPrice.toLocaleString()}
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gold-400 rotate-45" />
            </motion.div>

            <input 
              type="range" 
              min="0" 
              max="500000" 
              step="1000"
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-400" 
              aria-label="Maximum price"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>Entry</span>
            <span className="text-gold-400">Luxury Peak</span>
          </div>
        </div>
      </FilterSection>

      {/* Size Section */}
      <FilterSection title="Fitting System">
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map(size => (
            <button 
              key={size}
              onClick={() => toggleFilter('size', size)}
              className={`h-11 rounded-xl border-2 flex items-center justify-center text-[11px] font-bold transition-all ${
                filters.size.includes(size) 
                  ? "border-gold-400 bg-gold-400 text-white" 
                  : "border-gold-400/10 text-gray-400 hover:border-gold-400/30"
              }`}
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
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-display font-bold">Browse</h1>
            <div className="hidden sm:flex flex-1 max-w-xs relative ml-4">
              <input 
                type="text"
                placeholder="Neural Search..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full h-10 bg-cream-50 dark:bg-dark-900 rounded-full pl-10 pr-4 text-xs border border-gold-400/10 focus:border-gold-400 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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

            {/* ✅ Custom Sort Dropdown */}
            <div className="relative group">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 bg-cream-50 dark:bg-dark-800 text-xs font-bold text-dark-900 dark:text-cream-50 border border-gold-400/10 rounded-xl px-4 py-2.5 outline-none min-h-[44px] transition-all hover:border-gold-400/30"
              >
                {SORT_OPTIONS.find(opt => opt.id === filters.sortBy)?.label || 'Sort By'}
                <ChevronDown className={`w-4 h-4 text-gold-400 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-900 border border-gold-400/15 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, sortBy: opt.id }));
                          setIsSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-[11px] font-bold transition-colors ${
                          filters.sortBy === opt.id 
                            ? "bg-gold-400/10 text-gold-400" 
                            : "text-gray-500 hover:bg-gold-400/5 hover:text-gold-400"
                        }`}
                      >
                        {opt.label}
                        {filters.sortBy === opt.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

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

        <div className="flex-1 space-y-6">
          <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 transition-opacity duration-300 ${isFetching ? 'opacity-40' : 'opacity-100'}`}>
            {isLoading && !data ? (
              Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              data?.pages.map((page) => 
                page.products.map((p: any) => <ProductCard key={p.id} product={p} />)
              )
            )}
          </div>

          <div id="load-more-trigger" className="h-10 w-full" />

          {hasNextPage && (
            <div className="flex justify-center pt-6 pb-4">
              <button 
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full md:w-auto px-12 py-4 bg-gold-400/10 text-gold-400 rounded-2xl font-bold hover:bg-gold-400 hover:text-white active:scale-95 transition-all disabled:opacity-50 min-h-[52px]"
              >
                {isFetchingNextPage ? "Loading More..." : "Load more items"}
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

      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
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
              
              <div className="flex-1 overflow-y-auto px-5 py-6 scrollbar-none">
                <FilterContent />
              </div>
              
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
