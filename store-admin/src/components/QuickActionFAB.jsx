import React, { useState } from 'react';
import { Fab, Tooltip, SpeedDial, SpeedDialAction } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion, AnimatePresence } from 'framer-motion';

const MotionFab = motion(Fab);
const MotionSpeedDial = motion(SpeedDial);

const defaultActions = [
  { icon: <FileCopyIcon />, name: 'Copy' },
  { icon: <SaveIcon />, name: 'Save' },
  { icon: <PrintIcon />, name: 'Print' },
  { icon: <ShareIcon />, name: 'Share' },
  { icon: <EditIcon />, name: 'Edit' },
];

const storeActions = [
  { icon: <ShoppingCartIcon />, name: 'Add Product', action: 'add_product' },
  { icon: <VisibilityIcon />, name: 'View Orders', action: 'view_orders' },
  { icon: <AssessmentIcon />, name: 'Generate Report', action: 'generate_report' },
  { icon: <InventoryIcon />, name: 'Manage Inventory', action: 'manage_inventory' },
];

export default function QuickActionFAB({ onClick, label = 'Quick Actions', variant = 'default' }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <AnimatePresence>
      <MotionSpeedDial
        ariaLabel={label}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        icon={<AddIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
        FabProps={{
          sx: {
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }
        }}
      >
        {(variant === 'store' ? storeActions : defaultActions).map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => {
              handleClose();
              if (variant === 'store' && action.action) {
                onClick && onClick(action.action);
              } else {
                onClick && onClick(action.name.toLowerCase());
              }
            }}
            FabProps={{
              sx: {
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'background.default',
                }
              }
            }}
          />
        ))}
      </MotionSpeedDial>
    </AnimatePresence>
  );
}
