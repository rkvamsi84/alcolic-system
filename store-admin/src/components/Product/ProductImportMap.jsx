import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const ProductImportMap = ({ csvData, onSuccess, onBack }) => {
  const [mappings, setMappings] = useState(() => {
    const headers = csvData[0].map(h => h.trim().toLowerCase());
    const defaultMappings = {
      upc: headers.indexOf('upc'),
      name: headers.indexOf('name'),
      brand: headers.indexOf('brand'),
      category: headers.indexOf('category'),
      price: headers.indexOf('price'),
      stock: headers.indexOf('stock')
    };
    return defaultMappings;
  });

  const availableFields = [
    { value: 'upc', label: 'UPC', required: true },
    { value: 'name', label: 'Product Name', required: false },
    { value: 'brand', label: 'Brand', required: false },
    { value: 'category', label: 'Category', required: false },
    { value: 'price', label: 'Price', required: false },
    { value: 'stock', label: 'Stock', required: false }
  ];

  const handleMapping = (csvIndex, field) => {
    setMappings(prev => ({
      ...prev,
      [field]: csvIndex
    }));
  };

  const handleContinue = () => {
    // Ensure UPC is mapped
    if (mappings.upc === -1) {
      alert('UPC field must be mapped');
      return;
    }

    // Create mapped data with headers
    const mappedData = [
      ['upc', 'name', 'brand', 'category', 'price', 'stock'], // Fixed header row
      ...csvData.slice(1).map(row => {
        return [
          row[mappings.upc] || '', // UPC (required)
          row[mappings.name] || '', // Name
          row[mappings.brand] || '', // Brand
          row[mappings.category] || '', // Category
          row[mappings.price] || '', // Price
          row[mappings.stock] || '' // Stock
        ];
      })
    ];

    onSuccess(mappedData);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>Map CSV Fields</Typography>
      <Typography variant="body2" mb={3} color="text.secondary">
        Map your CSV columns to the required product fields. UPC is required.
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>CSV Column</TableCell>
              <TableCell>Sample Data</TableCell>
              <TableCell>Map To Field</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {csvData[0].map((header, index) => (
              <TableRow key={index}>
                <TableCell>{header}</TableCell>
                <TableCell>{csvData[1]?.[index] || ''}</TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <InputLabel>Field</InputLabel>
                    <Select
                      value={Object.keys(mappings).find(key => mappings[key] === index) || ''}
                      onChange={(e) => handleMapping(index, e.target.value)}
                      label="Field"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {availableFields.map(field => (
                        <MenuItem 
                          key={field.value} 
                          value={field.value}
                          disabled={Object.keys(mappings).some(key => key !== field.value && mappings[key] === index)}
                        >
                          {field.label}{field.required ? ' *' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={handleContinue}>Continue</Button>
      </Box>
    </Paper>
  );
};

export default ProductImportMap; 