import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  useTheme
} from "@mui/material";
import { 
  Article, 
  Image, 
  Announcement, 
  Add, 
  Edit, 
  Delete,
  Close
} from "@mui/icons-material";

const mockPages = [
  { id: 1, title: "Home", type: "Static Page", status: "Published", content: "Welcome to our liquor delivery service..." },
  { id: 2, title: "About Us", type: "Static Page", status: "Published", content: "We are a premium liquor delivery service..." },
  { id: 3, title: "Terms & Conditions", type: "Static Page", status: "Published", content: "By using our service, you agree to..." },
  { id: 4, title: "Privacy Policy", type: "Static Page", status: "Published", content: "Your privacy is important to us..." },
  { id: 5, title: "FAQ", type: "Static Page", status: "Draft", content: "Frequently asked questions..." }
];

const mockBanners = [
  { id: 1, title: "New Year Sale Banner", status: "Active", image: "banner1.jpg", link: "/sale" },
  { id: 2, title: "Valentine's Day Promo", status: "Scheduled", image: "banner2.jpg", link: "/valentine" }
];

const mockBlogs = [
  { id: 1, title: "How to Choose the Best Wine", date: "2024-01-10", status: "Published", content: "Choosing the right wine can be..." },
  { id: 2, title: "Holiday Delivery Tips", date: "2024-01-05", status: "Draft", content: "During holidays, delivery times may..." }
];

const getStatusColor = (status) => {
  switch (status) {
    case "Published":
    case "Active": return "success";
    case "Draft":
    case "Scheduled": return "info";
    default: return "default";
  }
};

export default function CMS() {
  const theme = useTheme();
  const [pages, setPages] = useState(mockPages);
  const [banners, setBanners] = useState(mockBanners);
  const [blogs, setBlogs] = useState(mockBlogs);
  
  // Dialog states
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  
  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");
  const [type, setType] = useState("Static Page");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");

  // Add new page
  const handleAddPage = () => {
    setEditMode(false);
    setSelectedItem(null);
    setTitle("");
    setContent("");
    setStatus("Draft");
    setType("Static Page");
    setPageDialogOpen(true);
  };

  // Edit page
  const handleEditPage = (page) => {
    setEditMode(true);
    setSelectedItem(page);
    setTitle(page.title);
    setContent(page.content);
    setStatus(page.status);
    setType(page.type);
    setPageDialogOpen(true);
  };

  // Delete page
  const handleDeletePage = (pageId) => {
    setPages(pages.filter(p => p.id !== pageId));
  };

  // Save page
  const handleSavePage = () => {
    if (editMode && selectedItem) {
      setPages(pages.map(page =>
        page.id === selectedItem.id ? {
          ...page,
          title,
          content,
          status,
          type
        } : page
      ));
    } else {
      const newId = Math.max(...pages.map(p => p.id)) + 1;
      const newPage = {
        id: newId,
        title,
        content,
        status,
        type
      };
      setPages([...pages, newPage]);
    }
    setPageDialogOpen(false);
  };

  // Add new banner
  const handleAddBanner = () => {
    setEditMode(false);
    setSelectedItem(null);
    setTitle("");
    setImage("");
    setLink("");
    setStatus("Draft");
    setBannerDialogOpen(true);
  };

  // Edit banner
  const handleEditBanner = (banner) => {
    setEditMode(true);
    setSelectedItem(banner);
    setTitle(banner.title);
    setImage(banner.image);
    setLink(banner.link);
    setStatus(banner.status);
    setBannerDialogOpen(true);
  };

  // Delete banner
  const handleDeleteBanner = (bannerId) => {
    setBanners(banners.filter(b => b.id !== bannerId));
  };

  // Save banner
  const handleSaveBanner = () => {
    if (editMode && selectedItem) {
      setBanners(banners.map(banner =>
        banner.id === selectedItem.id ? {
          ...banner,
          title,
          image,
          link,
          status
        } : banner
      ));
    } else {
      const newId = Math.max(...banners.map(b => b.id)) + 1;
      const newBanner = {
        id: newId,
        title,
        image,
        link,
        status
      };
      setBanners([...banners, newBanner]);
    }
    setBannerDialogOpen(false);
  };

  // Add new blog
  const handleAddBlog = () => {
    setEditMode(false);
    setSelectedItem(null);
    setTitle("");
    setContent("");
    setStatus("Draft");
    setBlogDialogOpen(true);
  };

  // Edit blog
  const handleEditBlog = (blog) => {
    setEditMode(true);
    setSelectedItem(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setStatus(blog.status);
    setBlogDialogOpen(true);
  };

  // Delete blog
  const handleDeleteBlog = (blogId) => {
    setBlogs(blogs.filter(b => b.id !== blogId));
  };

  // Save blog
  const handleSaveBlog = () => {
    if (editMode && selectedItem) {
      setBlogs(blogs.map(blog =>
        blog.id === selectedItem.id ? {
          ...blog,
          title,
          content,
          status
        } : blog
      ));
    } else {
      const newId = Math.max(...blogs.map(b => b.id)) + 1;
      const newBlog = {
        id: newId,
        title,
        content,
        status,
        date: new Date().toISOString().split('T')[0]
      };
      setBlogs([...blogs, newBlog]);
    }
    setBlogDialogOpen(false);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Content Management (CMS)</Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Static Pages</Typography>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<Add />}
                onClick={handleAddPage}
              >
                Add Page
              </Button>
            </Box>
            <List>
              {pages.map((page) => (
                <ListItem 
                  key={page.id} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: 1, 
                    mb: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%" mb={1}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Article />
                    </ListItemIcon>
                    <ListItemText 
                      primary={page.title} 
                      secondary={page.type}
                      sx={{ flex: 1 }}
                    />
                    <Chip 
                      label={page.status} 
                      color={getStatusColor(page.status)} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                  </Box>
                  <Box display="flex" gap={1} width="100%">
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleEditPage(page)}
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeletePage(page.id)}
                      sx={{ flex: 1 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Banners & Promos</Typography>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<Add />}
                onClick={handleAddBanner}
              >
                Add Banner
              </Button>
            </Box>
            <List>
              {banners.map((banner) => (
                <ListItem 
                  key={banner.id} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: 1, 
                    mb: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%" mb={1}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Image />
                    </ListItemIcon>
                    <ListItemText 
                      primary={banner.title}
                      sx={{ flex: 1 }}
                    />
                    <Chip 
                      label={banner.status} 
                      color={getStatusColor(banner.status)} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                  </Box>
                  <Box display="flex" gap={1} width="100%">
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleEditBanner(banner)}
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteBanner(banner.id)}
                      sx={{ flex: 1 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Blog & Announcements</Typography>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<Add />}
                onClick={handleAddBlog}
              >
                Add Blog
              </Button>
            </Box>
            <List>
              {blogs.map((blog) => (
                <ListItem 
                  key={blog.id} 
                  sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    mb: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%" mb={1}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Announcement />
                    </ListItemIcon>
                    <ListItemText 
                      primary={blog.title} 
                      secondary={blog.date}
                      sx={{ flex: 1 }}
                    />
                    <Chip 
                      label={blog.status} 
                      color={getStatusColor(blog.status)} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                  </Box>
                  <Box display="flex" gap={1} width="100%">
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleEditBlog(blog)}
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteBlog(blog.id)}
                      sx={{ flex: 1 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Page Dialog */}
      <Dialog open={pageDialogOpen} onClose={() => setPageDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Edit Page" : "Add New Page"}
          <IconButton
            aria-label="close"
            onClick={() => setPageDialogOpen(false)}
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
              label="Page Title"
              variant="outlined"
              value={title}
              onChange={e => setTitle(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Page Type</InputLabel>
              <Select value={type} label="Page Type" onChange={e => setType(e.target.value)}>
                <MenuItem value="Static Page">Static Page</MenuItem>
                <MenuItem value="Landing Page">Landing Page</MenuItem>
                <MenuItem value="Information Page">Information Page</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Page Content"
              variant="outlined"
              value={content}
              onChange={e => setContent(e.target.value)}
              multiline
              rows={6}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPageDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePage}>
            {editMode ? "Save Changes" : "Add Page"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={bannerDialogOpen} onClose={() => setBannerDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Edit Banner" : "Add New Banner"}
          <IconButton
            aria-label="close"
            onClick={() => setBannerDialogOpen(false)}
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
              label="Banner Title"
              variant="outlined"
              value={title}
              onChange={e => setTitle(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Image URL"
              variant="outlined"
              value={image}
              onChange={e => setImage(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Link URL"
              variant="outlined"
              value={link}
              onChange={e => setLink(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBannerDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveBanner}>
            {editMode ? "Save Changes" : "Add Banner"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Blog Dialog */}
      <Dialog open={blogDialogOpen} onClose={() => setBlogDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Edit Blog" : "Add New Blog"}
          <IconButton
            aria-label="close"
            onClick={() => setBlogDialogOpen(false)}
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
              label="Blog Title"
              variant="outlined"
              value={title}
              onChange={e => setTitle(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Blog Content"
              variant="outlined"
              value={content}
              onChange={e => setContent(e.target.value)}
              multiline
              rows={8}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlogDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveBlog}>
            {editMode ? "Save Changes" : "Add Blog"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}