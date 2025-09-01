import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody, Button, Box } from '@mui/material';

const LOG_KEY = 'regulatory_logs';

export function addRegulatoryLog(log) {
  const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  logs.push(log);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

export function getRegulatoryLogs() {
  return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
}

const RegulatoryLogModal = ({ open, onClose }) => {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    if (open) setLogs(getRegulatoryLogs());
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Regulatory Logs</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell>{log.time}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RegulatoryLogModal;
