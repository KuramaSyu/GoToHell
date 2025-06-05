import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

/**
 * Represents a Table Row for EditableNumberTable
 * With it's id, and a column-id to value mapping.
 * The column id needs for key value pairs needs to exist in EditableNumberTableProps in columns
 */
export interface TableDataRow {
  /**
   * id of the row
   */
  id: string | number;
  /**
   * column-id to value mapping
   */
  [key: string]: string | number;
}

export interface EditableNumberTableProps {
  /**
   * initial table data
   */
  data: TableDataRow[];
  /**
   * List with mappings from id to label of the columns in the table
   */
  columns: { id: string; label: string }[];
  /**
   * function, which is called, when data changes. Should be used to update
   * the data
   * @param newData the data, which will be used to override the existing data
   */
  onDataChange: (newData: TableDataRow[]) => void;
}

export const EditableNumberTable: React.FC<EditableNumberTableProps> = ({
  data,
  columns,
  onDataChange,
}) => {
  const [tableData, setTableData] = useState<TableDataRow[]>([]);
  const [errors, setErrors] = useState<Record<string, Record<string, boolean>>>(
    {}
  );

  // load internal tableData and errors on start and when data or columns change
  useEffect(() => {
    setTableData(data);
    // Initialize error state
    const initialErrors: Record<string, Record<string, boolean>> = {};
    data.forEach((row) => {
      initialErrors[row.id] = {};
      columns.forEach((column) => {
        initialErrors[row.id]![column.id] = false;
      });
    });
    setErrors(initialErrors);
  }, [data, columns]);

  // Validate if a string is a valid number
  const isValidNumber = (value: string): boolean => {
    // Check if the value is a valid number (allows for decimals and negative numbers)
    const numberRegex = /^-?\d*\.?\d*$/;
    return (
      numberRegex.test(value) &&
      value.trim() !== '' &&
      value !== '-' &&
      value !== '.'
    );
  };

  // Handle cell value change
  const handleCellChange = (
    rowId: string | number,
    columnId: string,
    value: string
  ) => {
    // Check if the value is a valid number
    const isValid = isValidNumber(value);

    // Update error state
    setErrors((prevErrors) => ({
      ...prevErrors,
      [rowId]: {
        ...prevErrors[rowId],
        [columnId]: !isValid && value !== '', // Mark as error only if not empty and invalid
      },
    }));

    // Update the data
    const updatedData = tableData.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          [columnId]: value, // Keep as string in the input field for now
        };
      }
      return row;
    });

    setTableData(updatedData);

    // Only propagate valid changes to parent component
    if (isValid || value === '') {
      // Convert to number if valid, otherwise keep as empty string
      const processedData = updatedData.map((row) => {
        if (row.id === rowId) {
          const processedValue = value === '' ? '' : parseFloat(value);
          return {
            ...row,
            [columnId]: processedValue,
          };
        }
        return row;
      });
      onDataChange(processedData);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="editable number table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={`${row.id}-${column.id}`}>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={row[column.id] !== undefined ? row[column.id] : ''}
                    onChange={(e) =>
                      handleCellChange(row.id, column.id, e.target.value)
                    }
                    error={errors[row.id] && errors[row.id]![column.id]}
                    helperText={
                      errors[row.id] && errors[row.id]![column.id]
                        ? 'Please enter a valid number'
                        : ''
                    }
                    inputProps={{
                      'aria-label': `Edit ${column.label}`,
                      style: { textAlign: 'right' },
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EditableNumberTable;
