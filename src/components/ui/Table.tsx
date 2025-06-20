import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export type ColumnDefinition<T, K extends keyof T> = {
  key: K;
  header: string;
  width?: string;
  render?: (value: T[K], row: T) => React.ReactNode;
  sortable?: boolean;
};

export type SortDirection = "asc" | "desc";

export type SortConfig<T> = {
  key: keyof T;
  direction: SortDirection;
};

type TableProps<T, K extends keyof T> = {
  data: T[];
  columns: ColumnDefinition<T, K>[];
  sortConfig?: SortConfig<T>;
  onSort?: (config: SortConfig<T>) => void;
  rowKey: (row: T) => string | number;
  className?: string;
  emptyState?: React.ReactNode;
};

const Table = <T, K extends keyof T>({
  data,
  columns,
  sortConfig,
  onSort,
  rowKey,
  className = "",
  emptyState,
}: TableProps<T, K>) => {
  const handleSort = (key: keyof T) => {
    if (!onSort || !sortConfig) return;

    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    onSort({ key, direction });
  };

  const getSortIcon = (key: keyof T) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <FiChevronUp className="ml-1 inline" />
    ) : (
      <FiChevronDown className="ml-1 inline" />
    );
  };

  return (
    <div
      className={`overflow-x-auto rounded-lg border border-gray-700/50 shadow-sm ${className}`}
    >
      <table className="min-w-full divide-y divide-gray-700/50">
        <thead className="bg-gray-50 dark:bg-gray-700/20">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? "cursor-pointer hover:bg-gray-700/80" : ""
                }`}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.header}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-700/20 divide-y divide-gray-700/50">
          {data.length > 0 ? (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="hover:bg-gray-700/80 transition-colors text-gray-400"
              >
                {columns.map((column) => (
                  <td
                    key={`${rowKey(row)}-${column.key as string}`}
                    className="px-6 py-4 whitespace-nowrap "
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : (row[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-gray-500"
              >
                {emptyState || "No data available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
