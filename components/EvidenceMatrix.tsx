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
  'Strong': 'bg-[var(--color-evidence-strong)]/10 text-[var(--color-evidence-strong)]',
  'Moderate': 'bg-[var(--color-evidence-moderate)]/10 text-[var(--color-evidence-moderate)]',
  'Limited to Moderate': 'bg-[var(--color-evidence-limited)]/10 text-[var(--color-evidence-limited)]',
  'Limited': 'bg-[var(--color-evidence-limited)]/10 text-[var(--color-evidence-limited)]',
  'Mixed': 'bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] dark:bg-[var(--accent-secondary)]/15 dark:text-[var(--accent-secondary)]',
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
    default: 'border-brand-900/10 dark:border-[var(--border-soft)]',
    comparison: 'border-brand-900/10 dark:border-[var(--border-soft)]',
    compact: 'border-brand-900/10 dark:border-[var(--border-soft)]',
  }[variant];

  if (loading) {
    return (
      <div className={`my-8 ${className}`}>
        {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
        {loadingComponent || (
          <div className="flex items-center justify-center h-40 border rounded-xl border-brand-900/10 dark:border-[var(--border-soft)]">
            <div className="text-muted dark:text-[var(--text-muted)]">Loading data...</div>
          </div>
        )}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={`my-8 ${className}`}>
        {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
        {emptyState || <p className="text-muted italic">No data available.</p>}
      </div>
    );
  }

  const hasResults = sortedData.length > 0;

  return (
    <div className={`my-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {title && (
          <h3 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">{title}</h3>
        )}

        {searchable && (
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-brand-900/10 bg-white px-4 py-2 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15 dark:border-[var(--border-soft)] dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)]"
            />
          </div>
        )}
      </div>

      <div className={`overflow-x-auto rounded-xl border ${variantBorder}`}>
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-[var(--surface-subtle)] dark:bg-[var(--surface-card-strong)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`
                    ${tablePadding} text-left font-semibold text-ink dark:text-[var(--text-primary)]
                    ${column.sortable !== false ? 'cursor-pointer hover:bg-brand-50/40 dark:hover:bg-[var(--surface-subtle)] select-none' : ''}
                    ${column.headerClassName || ''}
                  `}
                >
                  {column.header}
                  {column.sortable !== false && getSortIndicator(column.key)}
                </th>
              ))}
              {actions && (
                <th className={`${tablePadding} text-left font-semibold text-ink dark:text-[var(--text-primary)] w-24`}>
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-900/10 dark:divide-[var(--border-soft)] bg-white dark:bg-[var(--surface-card-strong)]">
            {!hasResults && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-muted dark:text-[var(--text-muted)]">
                  No results found for “{searchTerm}”.
                </td>
              </tr>
            )}

            {sortedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row, index)}
                className={`
                  group hover:bg-brand-50/40 dark:hover:bg-[var(--surface-subtle)] transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const isGradeValue = showGrades && typeof value === 'string' && Object.keys(gradeColorMap).includes(value);

                  return (
                    <td key={String(column.key)} className={`${tablePadding} align-top text-muted dark:text-[var(--text-muted)] ${column.className || ''}`}>
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
        <div className="mt-3 text-xs text-muted dark:text-[var(--text-muted)]">
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
