
import React from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    SlidersHorizontal,
    Plus,
    LayoutGrid,
    List,
    ChevronDown,
    RefreshCw,
    X,
    Check,
    LucideIcon,
    Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/theme';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './DropdownMenu';

export interface FilterOption {
    id: string;
    label: string;
    field: string;
    type: 'select' | 'boolean' | 'text';
    options?: { value: string; label: string }[];
}

export interface SortOption {
    id: string;
    label: string;
    field: string;
    direction: 'asc' | 'desc';
}

interface HeaderProps {
    title: string;
    totalCount?: number;
    totalValue?: string;
    createButtonLabel?: string;
    viewMode: 'kanban' | 'list';
    setViewMode: (mode: 'kanban' | 'list') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filters: Record<string, any>;
    setFilters: (filters: Record<string, any>) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    onAddNew: () => void;
    onRefresh: () => void;
}

const CRMHeader = ({
    title,
    totalCount,
    totalValue,
    createButtonLabel,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    onAddNew,
    onRefresh,
}: HeaderProps) => {
    const { t } = useTranslation()
    const { mode, colors } = useTheme()
    const isDark = mode === "dark"

    const filterOptions: FilterOption[] = [
        { id: 'type', label: t('common.category', 'Category'), field: 'type', type: 'select', options: [
            { value: 'Lead', label: t('common.lead', 'Lead') }, { value: 'Customer', label: t('common.customer', 'Customer') }, { value: 'Partner', label: t('common.partner', 'Partner') }
        ]},
        { id: 'priority', label: t('common.priority', 'Priority'), field: 'priority', type: 'select', options: [
            { value: 'High', label: t('common.high', 'High') }, { value: 'Medium', label: t('common.medium', 'Medium') }, { value: 'Low', label: t('common.low', 'Low') }
        ]}
    ];

    const sortOptions: SortOption[] = [
        { id: 'name-asc', label: t('common.sort_alphabetical', 'Alphabetical (A-Z)'), field: 'name', direction: 'asc' },
        { id: 'value-desc', label: t('common.sort_value_high', 'Expected Value (High)'), field: 'dealsValue', direction: 'desc' },
        { id: 'date-newest', label: t('common.sort_recent', 'Recently Updated'), field: 'updatedAt', direction: 'desc' }
    ];

    const activeFilterCount = Object.keys(filters).length;

    const handleFilterChange = (field: string, value: any) => {
        const newFilters = { ...filters };
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            delete newFilters[field];
        } else {
            newFilters[field] = value;
        }
        setFilters(newFilters);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
        show: { opacity: 1, y: 0, filter: 'blur(0px)' }
    };

    return (
        <header 
            style={{ 
                backgroundColor: isDark ? colors.background : '#FFFFFF',
                borderBottom: `1px solid ${isDark ? colors.border : '#E6E9EF'}`
            }}
            className="sticky top-0 z-40 px-8 pt-10 pb-6 transition-all duration-300 font-sans"
        >
            <motion.div variants={container} initial="hidden" animate="show" className="max-w-[1600px] mx-auto space-y-8">
                
                {/* Row 1: Title and Main Action */}
                <div className="flex items-center justify-between">
                    <motion.div variants={item} className="flex items-center gap-4">
                        <h1 
                            style={{ 
                                color: isDark ? colors.textPrimary : '#323338'
                            }}
                            className="text-3xl font-bold tracking-tight"
                        >
                            {title}
                        </h1>
                        <div className="flex items-center gap-2">
                            {totalCount !== undefined && (
                                <span 
                                    style={{ 
                                        backgroundColor: isDark ? colors.mutedBg : '#f3f4ee',
                                        color: isDark ? colors.textSecondary : '#4c6b22'
                                    }}
                                    className="px-3.5 py-1.5 rounded-full text-[13px] font-bold"
                                >
                                    {totalCount} {title.toLowerCase()}
                                </span>
                            )}
                            {totalValue !== undefined && (
                                <span 
                                    style={{ 
                                        backgroundColor: isDark ? colors.mutedBg : '#f3f4ee',
                                        color: isDark ? colors.textSecondary : '#4c6b22'
                                    }}
                                    className="px-3.5 py-1.5 rounded-full text-[13px] font-bold"
                                >
                                    {totalValue}
                                </span>
                            )}
                        </div>
                    </motion.div>

                    <motion.div variants={item}>
                        <button
                            onClick={onAddNew}
                            style={{ 
                                backgroundColor: isDark ? colors.action : '#017F9B',
                                color: '#FFFFFF'
                            }}
                            className="flex items-center gap-2 px-3 py-3 rounded-xl font-bold text-[15px] transition-all shadow-sm active:scale-95 hover:opacity-95"
                        >
                            <Plus className="w-5 h-5" />
                            <span>{createButtonLabel || t('common.add_new', 'Add New')}</span>
                        </button>
                    </motion.div>
                </div>

                {/* Row 2: Search, Filters, Toggles */}
                <div className="flex items-center justify-between">
                    <motion.div variants={item} className="flex items-center gap-3 flex-1 max-w-4xl">
                        {/* Search Bar on Left */}
                        <div className="relative group w-80">
                            <div 
                                style={{
                                    backgroundColor: isDark ? colors.card : '#FFFFFF',
                                    borderColor: isDark ? colors.border : '#E6E9EF',
                                }}
                                className="flex items-center gap-3 border px-4 py-2.5 rounded-2xl transition-all shadow-sm focus-within:ring-2 focus-within:ring-black/5"
                            >
                                <Search className="w-4 h-4" style={{ color: isDark ? colors.textSecondary : '#B2B9C0' }} />
                                <input
                                    type="text"
                                    placeholder={t('common.search_placeholder', `Search ${title.toLowerCase()}...`)}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-[13px] font-medium w-full placeholder:text-[#B2B9C0]"
                                    style={{ 
                                        color: isDark ? colors.textPrimary : '#323338',
                                    }}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} style={{ color: isDark ? colors.textSecondary : '#B2B9C0' }}>
                                        <X className="w-4 h-4 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter and Sort */}
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button 
                                        style={{
                                            backgroundColor: activeFilterCount > 0 
                                                ? (isDark ? 'rgba(76, 107, 34, 0.1)' : 'rgba(76, 107, 34, 0.05)')
                                                : (isDark ? colors.card : '#FFFFFF'),
                                            borderColor: activeFilterCount > 0 
                                                ? 'rgba(76, 107, 34, 0.3)'
                                                : (isDark ? colors.border : '#E6E9EF'),
                                            color: activeFilterCount > 0 
                                                ? '#4c6b22'
                                                : (isDark ? colors.textSecondary : '#323338')
                                        }}
                                        className="flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-bold rounded-2xl border transition-all shadow-sm"
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>{t('common.filter', 'Filter')}</span>
                                        {activeFilterCount > 0 && (
                                            <span style={{ backgroundColor: '#4c6b22', color: '#FFFFFF' }} className="px-2 py-0.5 rounded-full text-[10px]">{activeFilterCount}</span>
                                        )}
                                        <ChevronDown className="w-4 h-4 opacity-40" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                    align="start" 
                                    className={`w-72 p-4 rounded-2xl shadow-xl border ${
                                        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: isDark ? colors.border : '#E6E9EF' }}>
                                        <span className="text-xs font-black uppercase tracking-widest text-premium-400">
                                            {t('common.parameters', 'Parameters')}
                                        </span>
                                        {activeFilterCount > 0 && (
                                            <button onClick={() => setFilters({})} className="text-[10px] font-black hover:underline uppercase text-brand-rose">
                                                {t('common.reset', 'Reset')}
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {filterOptions.map(option => (
                                            <div key={option.id} className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-premium-300 px-1">
                                                    {option.label}
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {option.options?.map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleFilterChange(option.field, filters[option.field] === opt.value ? undefined : opt.value)}
                                                            style={{
                                                                backgroundColor: filters[option.field] === opt.value
                                                                    ? '#4c6b22'
                                                                    : (isDark ? colors.mutedBg : '#f3f4ee'),
                                                                color: filters[option.field] === opt.value
                                                                    ? '#FFFFFF'
                                                                    : (isDark ? colors.textSecondary : '#4c6b22')
                                                            }}
                                                            className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all hover:opacity-80"
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button 
                                        style={{
                                            backgroundColor: isDark ? colors.card : '#FFFFFF',
                                            borderColor: isDark ? colors.border : '#E6E9EF',
                                            color: isDark ? colors.textSecondary : '#323338'
                                        }}
                                        className="flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-bold border rounded-2xl transition-all shadow-sm"
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        <span>{t('common.sort', 'Sort')}</span>
                                        <ChevronDown className="w-4 h-4 opacity-40" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                    align="start" 
                                    className={`w-56 p-1.5 rounded-2xl shadow-xl border ${
                                        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                                    }`}
                                >
                                    {sortOptions.map(item => (
                                        <DropdownMenuItem 
                                            key={item.id} 
                                            onClick={() => setSortBy(item.id)} 
                                            className={`rounded-xl text-[13px] font-bold py-2.5 px-3 flex items-center justify-between ${
                                                isDark ? 'text-zinc-100' : 'text-gray-900'
                                            }`}
                                        >
                                            {item.label}
                                            {sortBy === item.id && <Check className="w-4 h-4 text-[#4c6b22]" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </motion.div>

                    {/* View Toggles on Right */}
                    <motion.div variants={item} className="flex items-center gap-4">
                        <button
                            onClick={onRefresh}
                            style={{ color: isDark ? colors.textSecondary : '#B2B9C0' }}
                            className="p-3 transition-all hover:bg-gray-100 dark:hover:bg-premium-800 rounded-xl"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>

                        <div 
                            style={{
                                backgroundColor: isDark ? colors.mutedBg : '#f3f4ee',
                                borderColor: isDark ? colors.border : '#E6E9EF'
                            }}
                            className="flex items-center rounded-2xl p-1.5 border"
                        >
                            <button
                                onClick={() => setViewMode('kanban')}
                                style={{
                                    backgroundColor: viewMode === 'kanban' 
                                        ? (isDark ? colors.card : '#FFFFFF')
                                        : 'transparent',
                                    color: viewMode === 'kanban' 
                                        ? (isDark ? colors.textPrimary : '#323338')
                                        : (isDark ? colors.textSecondary : '#B2B9C0')
                                }}
                                className={`flex items-center justify-center p-2 rounded-xl transition-all ${viewMode === 'kanban' ? 'shadow-sm' : ''}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    backgroundColor: viewMode === 'list' 
                                        ? (isDark ? colors.card : '#FFFFFF')
                                        : 'transparent',
                                    color: viewMode === 'list' 
                                        ? (isDark ? colors.textPrimary : '#323338')
                                        : (isDark ? colors.textSecondary : '#B2B9C0')
                                }}
                                className={`flex items-center justify-center p-2 rounded-xl transition-all ${viewMode === 'list' ? 'shadow-sm' : ''}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </header>
    );
};

export default CRMHeader;
