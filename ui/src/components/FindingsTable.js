// ui/src/components/FindingsTable.jsx
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel
} from '@tanstack/react-table';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, CaretSortIcon } from '@radix-ui/react-icons';

function FindingsTable({ 
  findings, 
  filters, 
  filterCategory, 
  setFilterCategory, 
  filterUrgency, 
  setFilterUrgency,
  formatCurrency 
}) {
  const [sorting, setSorting] = React.useState([{
    id: 'urgency',
    desc: false
  }]);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'item',
        header: 'Item',
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'urgency',
        header: ({ column }) => {
          return (
            <div
              className="cursor-pointer select-none flex items-center gap-1"
              onClick={column.getToggleSortingHandler()}
            >
              Urgency
              {column.getIsSorted() ? (
                column.getIsSorted() === 'asc' ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )
              ) : (
                <CaretSortIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const urgencyOrder = {
            'Critical': 1,
            'High': 2,
            'Medium': 3,
            'Low': 4,
            'Informational': 5
          };

          const aValue = urgencyOrder[rowA.original.urgency] || 999;
          const bValue = urgencyOrder[rowB.original.urgency] || 999;

          return aValue - bValue;
        }
      },
      {
        accessorKey: 'difficultyScore',
        header: ({ column }) => {
          return (
            <div
              className="cursor-pointer select-none flex items-center gap-1"
              onClick={column.getToggleSortingHandler()}
            >
              Difficulty Score
              {column.getIsSorted() ? (
                column.getIsSorted() === 'asc' ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )
              ) : (
                <CaretSortIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
          );
        },
        sortingFn: 'number'
      },
      {
        accessorKey: 'difficultyDescription',
        header: 'Difficulty Description',
      },
      {
        accessorKey: 'estimate',
        header: ({ column }) => {
          return (
            <div
              className="cursor-pointer select-none flex items-center gap-1"
              onClick={column.getToggleSortingHandler()}
            >
              Estimate
              {column.getIsSorted() ? (
                column.getIsSorted() === 'asc' ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )
              ) : (
                <CaretSortIcon className="h-4 w-4 text-gray-400" />
              )}
            </div>
          );
        },
        cell: ({ getValue }) => {
          const value = getValue();
          return value === "Variable" ? value : formatCurrency(value);
        },
        sortingFn: (rowA, rowB) => {
          const getNumericValue = (value) => {
            if (!value) return 0;
            if (value === "Variable") return 0;
            if (typeof value === 'number') return value;

            const numericValue = parseFloat(value.toString().replace(/[$,]/g, ''));
            return isNaN(numericValue) ? 0 : numericValue;
          };

          const aValue = getNumericValue(rowA.original.estimate);
          const bValue = getNumericValue(rowB.original.estimate);

          return aValue - bValue;
        }
      },
    ],
    [formatCurrency]
  );

  const table = useReactTable({
    data: findings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    enableSortingRemoval: true,
    sortDescFirst: false,
  });

  return (
    <>
      <div className="flex gap-4 mb-6 py-6 bg-surface">
        <Select.Root value={filterCategory} onValueChange={setFilterCategory}>
          {/* Category filter content */}
          {/* ... (Copy the existing Select.Root content for category) ... */}
        </Select.Root>

        <Select.Root value={filterUrgency} onValueChange={setFilterUrgency}>
          {/* Urgency filter content */}
          {/* ... (Copy the existing Select.Root content for urgency) ... */}
        </Select.Root>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 bg-gray-50"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-900"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default FindingsTable;