import { Routes, Route } from "react-router-dom";
// Placeholder imports for all pages
import Dashboard from "../pages/Dashboard/Dashboard";
import Orders from "../pages/Orders/Orders";
import Products from "../pages/Products/Products";
import Stores from "../pages/Stores/Stores";
import Drivers from "../pages/Drivers/Drivers";
import Customers from "../pages/Customers/Customers";
import Promotions from "../pages/Promotions/Promotions";
import ScheduledOrders from "../pages/ScheduledOrders/ScheduledOrders";
import Analytics from "../pages/Analytics/Analytics";
import Payments from "../pages/Payments/Payments";
import Refunds from "../pages/Refunds/Refunds";
import Notifications from "../pages/Notifications/Notifications";
import DeliveryRadius from "../pages/DeliveryRadius/DeliveryRadius";
import Support from "../pages/Support/Support";
import Reviews from "../pages/Reviews/Reviews";
import CMS from "../pages/CMS/CMS";
import Settings from "../pages/Settings/Settings";
import AdminUsers from "../pages/AdminUsers/AdminUsers";
import AuditLogs from "../pages/AuditLogs/AuditLogs";
import Categories from "../pages/Categories/Categories";
import BannerManagement from "../pages/BannerManagement";
import NotificationManagement from "../pages/NotificationManagement";
import SupportManagement from "../pages/SupportManagement";
import OrderTracking from "../pages/OrderTracking";
import BulkImport from "../pages/BulkImport/BulkImport";
import StorePanel from "../components/StorePanel";

import Logout from "../pages/Logout/Logout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/products" element={<Products />} />
      <Route path="/bulk-import" element={<BulkImport />} />
      <Route path="/stores" element={<Stores />} />
      <Route path="/store-panel" element={<StorePanel />} />
      <Route path="/drivers" element={<Drivers />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/promotions" element={<Promotions />} />
      <Route path="/scheduled-orders" element={<ScheduledOrders />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/refunds" element={<Refunds />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/delivery-radius" element={<DeliveryRadius />} />
      <Route path="/support" element={<Support />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/cms" element={<CMS />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/admin-users" element={<AdminUsers />} />
      <Route path="/audit-logs" element={<AuditLogs />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/banners" element={<BannerManagement />} />
      <Route path="/banner-management" element={<BannerManagement />} />

      <Route path="/notification-management" element={<NotificationManagement />} />
      <Route path="/support" element={<SupportManagement />} />
      <Route path="/order-tracking" element={<OrderTracking />} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
}