import { tool } from 'ai';
import { z } from 'zod';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'boolean';
}

export interface TableData {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  title?: string;
  caption?: string;
}

/**
 * Generates structured table data from input data and column definitions.
 * 
 * @param data - Array of objects representing table rows
 * @param columns - Optional array of column definitions
 * @param title - Optional table title
 * @param caption - Optional table caption/description
 * @returns Structured table data object
 */
export function generateTableData(
  data: Record<string, unknown>[], 
  columns?: TableColumn[], 
  title?: string,
  caption?: string
): TableData {
  try {
    // If no columns provided, infer from the first row
    let tableColumns = columns;
    if (!tableColumns && data.length > 0) {
      const firstRow = data[0];
      tableColumns = Object.keys(firstRow).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        type: inferColumnType(firstRow[key])
      }));
    }

    return {
      columns: tableColumns || [],
      rows: data,
      title,
      caption
    };
  } catch (error) {
    throw new Error(`Error generating table data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Infers the column type from a sample value
 */
function inferColumnType(value: unknown): 'string' | 'number' | 'date' | 'boolean' {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (value instanceof Date) return 'date';
  if (typeof value === 'string') {
    // Check if it looks like a date
    if (!isNaN(Date.parse(value))) return 'date';
    // Check if it looks like a number
    if (!isNaN(Number(value))) return 'number';
  }
  return 'string';
}

// Tool definition using the AI SDK helper
export const tableTool = tool({
  description: 'Generates a structured table from data arrays. Use this when you need to display tabular data in a formatted table instead of plain text.',
  parameters: z.object({
    data: z.array(z.record(z.unknown())).describe('Array of objects representing table rows. Each object should have consistent keys.'),
    columns: z.array(z.object({
      key: z.string().describe('The key/field name from the data objects'),
      label: z.string().describe('The display label for the column header'),
      type: z.enum(['string', 'number', 'date', 'boolean']).optional().describe('The data type of the column')
    })).optional().describe('Optional array of column definitions. If not provided, columns will be inferred from the data.'),
    title: z.string().optional().describe('Optional title for the table'),
    caption: z.string().optional().describe('Optional caption/description for the table')
  }),
  
  execute: async ({ data, columns, title, caption }) => {
    return generateTableData(data, columns, title, caption);
  },
});