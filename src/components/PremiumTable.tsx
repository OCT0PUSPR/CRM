
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit2, 
  Trash2, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  Copy, 
  Printer, 
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

export interface Column<T> {
  id: string;
  header: string;
  icon?: React.ElementType;
  accessor: keyof T | ((row: T) => React.ReactNode);
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface PremiumTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowIdKey: keyof T;
  onEdit?: (row: T) => void;
  onDelete?: (id: string | number) => void;
  pageSize?: number;
  searchable?: boolean;
  showExport?: boolean;
  title?: string;
}

export function PremiumTable<T extends { [key: string]: any }>({
  data,
  columns,
  rowIdKey,
  onEdit,
  onDelete,
  pageSize = 10,
  searchable = true,
  showExport = true,
  title,
}: PremiumTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(paginatedData.map(row => row[rowIdKey])));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedRows(newSelection);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (localSearch) {
      const q = localSearch.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(q)
        )
      );
    }
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, localSearch, sortConfig]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const allCurrentSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(row[rowIdKey]));

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-all ${
            currentPage === i
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="relative w-full">
      {/* Header Toolbar - Matches the image design */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search" 
              value={localSearch}
              onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10 focus:border-gray-300 dark:focus:border-gray-600 outline-none w-48 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
          {showExport && (
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Download className="w-4 h-4" />
              Export/Import
            </button>
          )}
          <button className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-gray-500 dark:bg-gray-800"
                    checked={allCurrentSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors select-none`}
                    style={{ width: col.width }}
                    onClick={() => handleSort(col.id)}
                  >
                    <div className={`flex items-center gap-1.5 ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''}`}>
                      {col.icon && <col.icon className="w-3.5 h-3.5" />}
                      <span>{col.header}</span>
                      {sortConfig?.key === col.id ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-gray-900 dark:text-white" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-gray-900 dark:text-white" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {paginatedData.map((row, idx) => {
                const isSelected = selectedRows.has(row[rowIdKey]);
                return (
                  <tr
                    key={row[rowIdKey]}
                    className={`group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      isSelected ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-gray-500 dark:bg-gray-800"
                        checked={isSelected}
                        onChange={() => handleSelectRow(row[rowIdKey])}
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 ${
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor as string]}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer - Matches the image design */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} {title || 'entries'}</span>
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {renderPaginationButtons()}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Selection Toolbar */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]">
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl shadow-2xl px-4 py-2.5 flex items-center gap-4"
            >
              <span className="text-sm font-medium px-2">{selectedRows.size} selected</span>
              <div className="w-px h-5 bg-gray-700 dark:bg-gray-300" />
              
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 dark:text-red-600 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              <button 
                onClick={() => setSelectedRows(new Set())}
                className="p-1.5 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

