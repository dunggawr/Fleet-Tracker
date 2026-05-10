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
    <div className="w-full overflow-x-auto bg-surface rounded-xl border border-border">
      <table className="data-table">
        <thead>
          <tr className="border-b border-outline-variant">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                style={{ width: col.width }}
                className="table-header"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-12">
                <div className="w-6 h-6 border-[3px] border-white/10 border-t-primary rounded-full animate-spin mx-auto" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-12 text-text-dim text-sm">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr 
                key={rowIdx} 
                onClick={() => onRowClick?.(item)}
                className={`
                  table-row
                  ${onRowClick ? 'cursor-pointer' : 'cursor-default'}
                `.trim()}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="table-cell">
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
