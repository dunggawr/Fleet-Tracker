'use client';

import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({ data, columns, onRowClick, isLoading }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto bg-surface border border-border rounded-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-outline-variant">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className="text-[12px] uppercase tracking-wider font-semibold text-text-muted px-4 py-3 text-left"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <div className="w-6 h-6 border-3 border-white/10 border-t-primary rounded-full animate-spin mx-auto" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-text-dim text-sm">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr 
                key={rowIdx} 
                onClick={() => onRowClick?.(item)}
                className={`
                  border-b border-border transition-colors duration-150
                  ${onRowClick ? 'cursor-pointer hover:bg-surface-high' : ''}
                `}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-4 text-sm text-text">
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as unknown as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
