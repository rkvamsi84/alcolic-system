import { Box, Typography, Grid, Card, CardContent, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel, useTheme } from "@mui/material";
import { SupportAgent, Chat, Email, Error, CheckCircle, FilterList, Search, Close, Visibility, Add } from "@mui/icons-material";
import { useState } from "react";

const mockChats = [
  { id: 1, type: "Chat", user: "John Doe", subject: "Order not delivered", date: "2024-01-15", status: "Ongoing", priority: "High", agent: "Sarah Wilson", lastMessage: "We're investigating the issue with your delivery.", messageCount: 8 },
  { id: 2, type: "Ticket", user: "Jane Smith", subject: "Refund request", date: "2024-01-15", status: "Resolved", priority: "Medium", agent: "Mike Johnson", lastMessage: "Refund has been processed successfully.", messageCount: 5 },
  { id: 3, type: "Chat", user: "Bob Johnson", subject: "Driver late", date: "2024-01-14", status: "New", priority: "High", agent: "Unassigned", lastMessage: "Customer waiting for driver update.", messageCount: 3 },
  { id: 4, type: "Ticket", user: "Alice Brown", subject: "Payment issue", date: "2024-01-13", status: "Ongoing", priority: "Medium", agent: "Lisa Davis", lastMessage: "Payment method verification in progress.", messageCount: 12 },
  { id: 5, type: "Chat", user: "Charlie Davis", subject: "Product missing", date: "2024-01-12", status: "Resolved", priority: "Low", agent: "Tom Wilson", lastMessage: "Missing item has been delivered.", messageCount: 6 }
];

const getStatusColor = (status) => {
  switch (status) {
    case "New": return "info";
    case "Ongoing": return "warning";
    case "Resolved": return "success";
    default: return "default";
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case "Chat": return <Chat />;
    case "Ticket": return <Email />;
    default: return <SupportAgent />;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High": return "error";
    case "Medium": return "warning";
    case "Low": return "success";
    default: return "default";
  }
};

export default function Support() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  
  // New ticket form states
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketType, setTicketType] = useState("Ticket");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [assignToAgent, setAssignToAgent] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState("");

  const filteredChats = mockChats.filter(c => {
    const matchesSearch = c.user.toLowerCase().includes(searchTerm.toLowerCase()) || c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
    const matchesDate = !dateFilter || c.date === dateFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesDate;
  });

  const handleViewChat = (chat) => {
    setSelectedChat(chat);
    setViewDialogOpen(true);
  };

  const handleMoreFilters = () => {
    setFiltersDialogOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setPriorityFilter("all");
    setDateFilter("");
    setFiltersDialogOpen(false);
  };

  const handleNewTicket = () => {
    setNewTicketDialogOpen(true);
  };

  const handleNewTicketSubmit = () => {
    // Mock creating new ticket
    console.log("Creating new ticket:", {
      subject: ticketSubject,
      description: ticketDescription,
      type: ticketType,
      priority: ticketPriority,
      customerEmail,
      customerName,
      assignToAgent,
      assignedAgent
    });
    
    // Reset form and close dialog
    setTicketSubject("");
    setTicketDescription("");
    setTicketType("Ticket");
    setTicketPriority("Medium");
    setCustomerEmail("");
    setCustomerName("");
    setAssignToAgent(false);
    setAssignedAgent("");
    setNewTicketDialogOpen(false);
    
    // Show success message
    alert("Support ticket created successfully!");
  };

  const handleNewTicketCancel = () => {
    setNewTicketDialogOpen(false);
    // Reset form
    setTicketSubject("");
    setTicketDescription("");
    setTicketType("Ticket");
    setTicketPriority("Medium");
    setCustomerEmail("");
    setCustomerName("");
    setAssignToAgent(false);
    setAssignedAgent("");
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Support & Live Chat</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleNewTicket}
        >
          New Ticket
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Search Chats/Tickets" 
              variant="outlined" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              InputProps={{ 
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> 
              }} 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select 
                value={statusFilter} 
                label="Status Filter" 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Ongoing">Ongoing</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />} 
              fullWidth
              onClick={handleMoreFilters}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <List>
        {filteredChats.map((c) => (
          <ListItem key={c.id} alignItems="flex-start" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            <ListItemIcon>{getTypeIcon(c.type)}</ListItemIcon>
            <ListItemText
              primary={
                <>
                  <Typography variant="subtitle1" fontWeight="bold">{c.subject}</Typography>
                  <Typography variant="body2" color="textSecondary">{c.user}</Typography>
                </>
              }
              secondary={
                <>
                  <Typography variant="caption">{c.type} • {c.date}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{c.lastMessage}</Typography>
                </>
              }
            />
            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
              <Chip label={c.status} color={getStatusColor(c.status)} size="small" />
              <Chip label={c.priority} color={getPriorityColor(c.priority)} size="small" />
              <Button 
                size="small" 
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => handleViewChat(c)}
              >
                View
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>

      {/* New Ticket Dialog */}
      <Dialog open={newTicketDialogOpen} onClose={handleNewTicketCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          Create New Support Ticket
          <IconButton
            aria-label="close"
            onClick={handleNewTicketCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Subject"
              variant="outlined"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              multiline
              rows={4}
              sx={{ mb: 2 }}
              required
            />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select 
                    value={ticketType} 
                    label="Type" 
                    onChange={(e) => setTicketType(e.target.value)}
                  >
                    <MenuItem value="Ticket">Support Ticket</MenuItem>
                    <MenuItem value="Chat">Live Chat</MenuItem>
                    <MenuItem value="Email">Email Support</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select 
                    value={ticketPriority} 
                    label="Priority" 
                    onChange={(e) => setTicketPriority(e.target.value)}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  variant="outlined"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Email"
                  variant="outlined"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={assignToAgent} 
                  onChange={(e) => setAssignToAgent(e.target.checked)} 
                />
              }
              label="Assign to specific agent"
              sx={{ mb: 2 }}
            />
            
            {assignToAgent && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Assign to Agent</InputLabel>
                <Select 
                  value={assignedAgent} 
                  label="Assign to Agent" 
                  onChange={(e) => setAssignedAgent(e.target.value)}
                >
                  <MenuItem value="Sarah Wilson">Sarah Wilson</MenuItem>
                  <MenuItem value="Mike Johnson">Mike Johnson</MenuItem>
                  <MenuItem value="Lisa Davis">Lisa Davis</MenuItem>
                  <MenuItem value="Tom Wilson">Tom Wilson</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewTicketCancel}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleNewTicketSubmit}
            disabled={!ticketSubject || !ticketDescription || !customerName || !customerEmail}
            startIcon={<Add />}
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Filters Dialog */}
      <Dialog open={filtersDialogOpen} onClose={() => setFiltersDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Advanced Filters
          <IconButton
            aria-label="close"
            onClick={() => setFiltersDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select 
                value={typeFilter} 
                label="Type" 
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Chat">Chat</MenuItem>
                <MenuItem value="Ticket">Ticket</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select 
                value={priorityFilter} 
                label="Priority" 
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Date Filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters}>Clear All</Button>
          <Button variant="contained" onClick={() => setFiltersDialogOpen(false)}>Apply Filters</Button>
        </DialogActions>
      </Dialog>

      {/* View Chat Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Support Ticket Details
          <IconButton
            aria-label="close"
            onClick={() => setViewDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedChat && (
            <Box sx={{ mt: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                {getTypeIcon(selectedChat.type)}
                <Box sx={{ flex: 1, ml: 2 }}>
                  <Typography variant="h6">
                    {selectedChat.subject}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    by {selectedChat.user}
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip 
                    label={selectedChat.status} 
                    color={getStatusColor(selectedChat.status)} 
                    size="small"
                  />
                  <Chip 
                    label={selectedChat.priority} 
                    color={getPriorityColor(selectedChat.priority)} 
                    size="small"
                  />
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedChat.lastMessage}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Customer</Typography>
                  <Typography variant="body2">{selectedChat.user}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                  <Typography variant="body2">{selectedChat.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                  <Typography variant="body2">{selectedChat.date}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Typography variant="body2">{selectedChat.status}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Priority</Typography>
                  <Typography variant="body2">{selectedChat.priority}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Assigned Agent</Typography>
                  <Typography variant="body2">{selectedChat.agent}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Messages</Typography>
                  <Typography variant="body2">{selectedChat.messageCount}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained">Reply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}