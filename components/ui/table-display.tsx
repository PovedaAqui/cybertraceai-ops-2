'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableData, TableColumn } from '@/lib/ai/tools/table';

interface TableDisplayProps {
  data: TableData;
  className?: string;
}

export function TableDisplay({ data, className }: TableDisplayProps) {
  const { columns, rows, title, caption } = data;

  if (!columns || columns.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No table data available
      </div>
    );
  }

  const formatCellValue = (value: unknown, column: TableColumn) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>;
    }

    switch (column.type) {
      case 'boolean':
        return value ? '✓' : '✗';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'date':
        try {
          const date = new Date(value);
          return isNaN(date.getTime()) ? value : date.toLocaleDateString();
        } catch {
          return value;
        }
      default:
        return String(value);
    }
  };

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
      )}
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="text-center text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {formatCellValue(row[column.key], column)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}