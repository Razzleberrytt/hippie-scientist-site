'use client';

import React, { useState, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export type EvidenceGrade = 
  | 'Strong' 
  | 'Moderate' 
  | 'Limited to Moderate' 
  | 'Limited' 
  | 'Mixed';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface EvidenceMatrixProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  caption?: React.ReactNode;
  variant?: 'default' | 'comparison' | 'compact';
  showGrades?: boolean;
  gradeColorMap?: Partial<Record<EvidenceGrade, string>>;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  
  // Enhanced features
  searchable?: boolean;
  searchPlaceholder?: string;
  filterKeys?: (keyof T)[];
  emptyState?: React.ReactNode;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  actions?: (row: T, index: number) => React.ReactNode;
  actionsHeader?: string;
  density?: 'comfortable' | 'compact';
}

// ============================================
// DEFAULT GRADE COLORS
// ============================================

const defaultGradeColors: Record<EvidenceGrade, string> = {
  'Strong': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Moderate': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Limited to Moderate': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'Limited': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'Mixed': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};

// ============================================
// EVIDENCE MATRIX (ENHANCED + GENERIC)
// ============================================

export function EvidenceMatrix<T extends Record<string, any>>({
  data,
  columns,
  title,
  caption,
  variant = 'default',
  showGrades = true,
  gradeColorMap = defaultGradeColors,
  onRowClick,
  className = '',
  searchable = false,
  searchPlaceholder = "Search table...",
  filterKeys,
  emptyState,
  loading = false,
  loadingComponent,
  actions,
  actionsHeader = "Actions",
  density = 'comfortable',
}: EvidenceMatrixProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const searchableKeys = useMemo(() => {
    if (filterKeys && filterKeys.length > 0) return filterKeys;
    return columns
      .filter(col => typeof (data[0]?.[col.key]) === 'string' || col.render)
      .map(col => col.key);
  }, [columns, data, filterKeys]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();

    return data.filter(row => {
      return searchableKeys.some(key => {
        const value = row[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchableKeys]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIndicator = (key: keyof T) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const tablePadding = density === 'compact' ? 'px-3 py-2.5' : 'px-4 py-4';
  const variantBorder = {
    default: 'border-gray-200 dark:border-gray-700',
    comparison: 'border-teal-200 dark:border-teal-800',
    compact: 'border-gray-200 dark:border-gray-700',
  }[variant];

  if (loading) {
    return (
      <div className={`my-8 ${className}`}>
        {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
        {loadingComponent || (
          <div className="flex items-center justify-center h-40 border rounded-xl border-gray-200 dark:border-gray-700">
            <div className="text-gray-500 dark:text-gray-400">Loading data...</div>
          </div>
        )}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={`my-8 ${className}`}>
        {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
        {emptyState || <p className="text-gray-500 italic">No data available.</p>}
      </div>
    );
  }

  const hasResults = sortedData.length > 0;

  return (
    <div className={`my-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {title && (
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        )}

        {searchable && (
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      <div className={`overflow-x-auto rounded-xl border ${variantBorder}`}>
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`
                    ${tablePadding} text-left font-semibold text-gray-700 dark:text-gray-300
                    ${column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60 select-none' : ''}
                    ${column.headerClassName || ''}
                  `}
                >
                  {column.header}
                  {column.sortable !== false && getSortIndicator(column.key)}
                </th>
              ))}
              {actions && (
                <th className={`${tablePadding} text-left font-semibold text-gray-700 dark:text-gray-300 w-24`}>
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {!hasResults && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No results found for “{searchTerm}”.
                </td>
              </tr>
            )}

            {sortedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row, index)}
                className={`
                  group hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const isGradeValue = showGrades && typeof value === 'string' && Object.keys(gradeColorMap).includes(value);

                  return (
                    <td key={String(column.key)} className={`${tablePadding} align-top text-gray-700 dark:text-gray-300 ${column.className || ''}`}>
                      {column.render ? (
                        column.render(row, index)
                      ) : isGradeValue ? (
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-medium ${gradeColorMap[value as EvidenceGrade]}`}>
                            {value}
                          </span>
                          <span className="text-sm leading-snug pr-2">{String(value)}</span>
                        </div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-[13.5px] leading-relaxed">
                          {String(value ?? '')}
                        </div>
                      )}
                    </td>
                  );
                })}

                {actions && (
                  <td className={`${tablePadding} align-top`}>
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {actions(row, index)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {caption && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {caption}
        </div>
      )}
    </div>
  );
}

// Standalone Grade Badge
export function EvidenceGradeBadge({ grade, className = '' }: { grade: EvidenceGrade; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${defaultGradeColors[grade]} ${className}`}>
      {grade}
    </span>
  );
}
