import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Switch
} from '@mui/material';
import { Help, Article, Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

// TODO: Replace with API calls to fetch real FAQ and knowledge base data
// const fetchFaqs = async () => {
//   const response = await fetch('/api/v1/faqs');
//   return response.json();
// };

// const fetchArticles = async () => {
//   const response = await fetch('/api/v1/knowledge-base/articles');
//   return response.json();
// };

const mockFaqs = [];
const mockArticles = [];

function FaqKnowledgeBaseManagement() {
  const [tab, setTab] = useState(0);
  const [faqs, setFaqs] = useState(mockFaqs);
  const [articles, setArticles] = useState(mockArticles);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const handleOpenDialog = (item = null) => {
    setEditItem(item);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditItem(null);
    setOpenDialog(false);
  };
  const handleSave = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    if (tab === 0) setFaqs(faqs.filter((f) => f.id !== id));
    else setArticles(articles.filter((a) => a.id !== id));
  };
  const handleStatusToggle = (id) => {
    if (tab === 0) setFaqs(faqs.map((f) => f.id === id ? { ...f, status: !f.status } : f));
    else setArticles(articles.map((a) => a.id === id ? { ...a, status: !a.status } : a));
  };
  const handleBulkAction = (action) => {
    if (tab === 0) {
      if (action === 'activate') setFaqs(faqs.map((f) => selected.includes(f.id) ? { ...f, status: true } : f));
      else if (action === 'deactivate') setFaqs(faqs.map((f) => selected.includes(f.id) ? { ...f, status: false } : f));
      else if (action === 'delete') setFaqs(faqs.filter((f) => !selected.includes(f.id)));
    } else {
      if (action === 'activate') setArticles(articles.map((a) => selected.includes(a.id) ? { ...a, status: true } : a));
      else if (action === 'deactivate') setArticles(articles.map((a) => selected.includes(a.id) ? { ...a, status: false } : a));
      else if (action === 'delete') setArticles(articles.filter((a) => !selected.includes(a.id)));
    }
    setSelected([]);
  };

  const filteredFaqs = faqs.filter((f) => !search || f.question.toLowerCase().includes(search.toLowerCase()));
  const filteredArticles = articles.filter((a) => !search || a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Help sx={{ mr: 1 }} />FAQ & Knowledge Base Management</Typography>
      <Tabs value={tab} onChange={(_, v) => { setTab(v); setSelected([]); }} sx={{ mb: 2 }}>
        <Tab label="FAQs" icon={<Help />} iconPosition="start" />
        <Tab label="Articles" icon={<Article />} iconPosition="start" />
      </Tabs>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label={tab === 0 ? 'Search question' : 'Search title'} value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add {tab === 0 ? 'FAQ' : 'Article'}</Button>
        <Button variant="outlined" color="primary" disabled={selected.length === 0} onClick={() => handleBulkAction('activate')}>Activate</Button>
        <Button variant="outlined" color="warning" disabled={selected.length === 0} onClick={() => handleBulkAction('deactivate')}>Deactivate</Button>
        <Button variant="outlined" color="error" disabled={selected.length === 0} onClick={() => handleBulkAction('delete')}>Delete</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      {tab === 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Question</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFaqs.map((faq) => (
                <TableRow key={faq.id} selected={selected.includes(faq.id)}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(faq.id)}
                      onChange={e => {
                        setSelected(e.target.checked
                          ? [...selected, faq.id]
                          : selected.filter(id => id !== faq.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>{faq.question}</TableCell>
                  <TableCell>{faq.category}</TableCell>
                  <TableCell>
                    <Switch checked={faq.status} onChange={() => handleStatusToggle(faq.id)} color="success" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => handleOpenDialog(faq)}><Edit fontSize="small" /></Button>
                    <Button size="small" color="error" onClick={() => handleDelete(faq.id)}><Delete fontSize="small" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFaqs.length === 0 && (
                <TableRow><TableCell colSpan={5}><Typography align="center">No FAQs found.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id} selected={selected.includes(article.id)}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(article.id)}
                      onChange={e => {
                        setSelected(e.target.checked
                          ? [...selected, article.id]
                          : selected.filter(id => id !== article.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    <Switch checked={article.status} onChange={() => handleStatusToggle(article.id)} color="success" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => handleOpenDialog(article)}><Edit fontSize="small" /></Button>
                    <Button size="small" color="error" onClick={() => handleDelete(article.id)}><Delete fontSize="small" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredArticles.length === 0 && (
                <TableRow><TableCell colSpan={5}><Typography align="center">No articles found.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Add/Edit Dialog (mock) */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? `Edit ${tab === 0 ? 'FAQ' : 'Article'}` : `Add ${tab === 0 ? 'FAQ' : 'Article'}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {tab === 0 ? (
              <>
                <TextField label="Question" defaultValue={editItem?.question || ''} fullWidth size="small" />
                <TextField label="Answer" defaultValue={editItem?.answer || ''} fullWidth size="small" multiline rows={3} />
                <TextField label="Category" defaultValue={editItem?.category || ''} fullWidth size="small" />
              </>
            ) : (
              <>
                <TextField label="Title" defaultValue={editItem?.title || ''} fullWidth size="small" />
                <TextField label="Summary" defaultValue={editItem?.summary || ''} fullWidth size="small" multiline rows={2} />
                <TextField label="Category" defaultValue={editItem?.category || ''} fullWidth size="small" />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module={tab === 0 ? 'FAQs' : 'Articles'} />
    </Box>
  );
}

export default FaqKnowledgeBaseManagement;
