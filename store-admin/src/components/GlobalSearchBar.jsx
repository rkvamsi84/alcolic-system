import React from 'react';
import { InputBase, Paper, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function GlobalSearchBar({ onSearch }) {
  const [query, setQuery] = React.useState('');
  return (
    <Paper component="form" sx={{ display: 'flex', alignItems: 'center', width: { xs: 1, sm: 300 }, p: 0.5, boxShadow: 1 }} onSubmit={e => { e.preventDefault(); onSearch(query); }}>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search..."
        inputProps={{ 'aria-label': 'global search' }}
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <IconButton type="submit" sx={{ p: 1 }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
