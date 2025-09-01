import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme/theme';
import { createStoreTheme } from './config/unified-config';
import { AuthProvider, useAuth } from './auth/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './auth/Login';
import Dashboard from './modules/Dashboard';
import Orders from './modules/Orders';
import POS from './modules/POS';
import Products from './modules/Products';
import PromotionsManagement from './modules/PromotionsManagement';
import HelpSupport from './modules/HelpSupport';
import SystemConfigurations from './modules/SystemConfigurations';
import ThirdPartyIntegrations from './modules/ThirdPartyIntegrations';
import AuditLogs from './modules/AuditLogs';
import NotificationCenter from './modules/NotificationCenter';
import DocumentManagement from './modules/DocumentManagement';
import CampaignManagement from './modules/CampaignManagement';
import ZoneCategoryManagement from './modules/ZoneCategoryManagement';
import TaxFeeManagement from './modules/TaxFeeManagement';
import BannerManagement from './modules/BannerManagement';
import FaqKnowledgeBaseManagement from './modules/FaqKnowledgeBaseManagement';
import SettingsPreferences from './modules/SettingsPreferences';
import ApiKeysIntegrationsManagement from './modules/ApiKeysIntegrationsManagement';
import UserFeedbackIssueTracking from './modules/UserFeedbackIssueTracking';
import AuditTrailExports from './modules/AuditTrailExports';
import ActivityDashboardAnalytics from './modules/ActivityDashboardAnalytics';
import Analytics from './modules/Analytics';
import ChangelogReleaseNotes from './modules/ChangelogReleaseNotes';
import LegalPolicyManagement from './modules/LegalPolicyManagement';
import SystemLogsErrorMonitoring from './modules/SystemLogsErrorMonitoring';
import CustomFieldsMetadataManagement from './modules/CustomFieldsMetadataManagement';
import InternalMessagingAnnouncements from './modules/InternalMessagingAnnouncements';
import RealTimeNotifications from './modules/RealTimeNotifications';
import RoleAccessControl from './modules/RoleAccessControl';
import CustomDashboard from './modules/CustomDashboard';
import AIAnalytics from './modules/AIAnalytics';
import WorkflowAutomation from './modules/WorkflowAutomation';
import ApiMonitoring from './modules/ApiMonitoring';
import AdvancedSearch from './modules/AdvancedSearch';
import IntegrationMarketplace from './modules/IntegrationMarketplace';
import MobileAdminCompanion from './modules/MobileAdminCompanion';
import AccessibilityIntl from './modules/AccessibilityIntl';
import UserActivityHeatmap from './modules/UserActivityHeatmap';
import NotificationRules from './modules/NotificationRules';
import DataVisualization from './modules/DataVisualization';
import DragDropTable from './modules/DragDropTable';
import AuditLogReplay from './modules/AuditLogReplay';
import MultiTabSync from './modules/MultiTabSync';
import ThemeToggle from './modules/ThemeToggle';
import CustomBranding from './modules/CustomBranding';
import AdvancedFiltering from './modules/AdvancedFiltering';
import InAppChat from './modules/InAppChat';

import ScheduledReports from './modules/ScheduledReports';
import WebhooksSubscriptions from './modules/WebhooksSubscriptions';
import DataMaskingPermissions from './modules/DataMaskingPermissions';
import CustomScripting from './modules/CustomScripting';
import AIIntegrationSettings from './modules/AIIntegrationSettings';
import RealTimeMonitoring from './modules/RealTimeMonitoring';
import DeliverymanManagement from './modules/DeliverymanManagement';
import EmployeeManagement from './modules/EmployeeManagement';
import CustomerManagement from './modules/CustomerManagement';
import StoreManagement from './modules/StoreManagement';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [mode, setMode] = useState('light');
  const theme = mode === 'light' ? createTheme(createStoreTheme()) : getTheme(mode);
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout mode={mode} toggleMode={toggleMode} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />

            <Route path="orders" element={<Orders />} />
            <Route path="pos" element={<POS />} />
            <Route path="promotions" element={<PromotionsManagement />} />
            <Route path="help-support" element={<HelpSupport />} />
            <Route path="settings" element={<ProtectedRoute roles={['admin']}><SystemConfigurations /></ProtectedRoute>} />
            <Route path="integrations" element={<ThirdPartyIntegrations />} />
            <Route path="audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="documents" element={<DocumentManagement />} />
            <Route path="campaigns" element={<CampaignManagement />} />
            <Route path="zones-categories" element={<ZoneCategoryManagement />} />
            <Route path="tax-fees" element={<TaxFeeManagement />} />
            <Route path="banners" element={<BannerManagement />} />
            <Route path="faq-kb" element={<FaqKnowledgeBaseManagement />} />
            <Route path="settings-preferences" element={<SettingsPreferences />} />
            <Route path="api-keys-integrations" element={<ProtectedRoute roles={['admin']}><ApiKeysIntegrationsManagement /></ProtectedRoute>} />
            <Route path="feedback-issues" element={<UserFeedbackIssueTracking />} />
            <Route path="audit-exports" element={<ProtectedRoute roles={['admin']}><AuditTrailExports /></ProtectedRoute>} />
            <Route path="activity-dashboard" element={<ActivityDashboardAnalytics />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="changelog" element={<ChangelogReleaseNotes />} />
            <Route path="legal-policy" element={<LegalPolicyManagement />} />
            <Route path="system-logs" element={<ProtectedRoute roles={['admin']}><SystemLogsErrorMonitoring /></ProtectedRoute>} />
            <Route path="custom-fields" element={<CustomFieldsMetadataManagement />} />
            <Route path="internal-messaging" element={<InternalMessagingAnnouncements />} />
            <Route path="real-time-notifications" element={<RealTimeNotifications />} />
            <Route path="role-access-control" element={<RoleAccessControl />} />
            <Route path="custom-dashboard" element={<CustomDashboard />} />
            <Route path="ai-analytics" element={<AIAnalytics />} />
            <Route path="workflow-automation" element={<WorkflowAutomation />} />
            <Route path="api-monitoring" element={<ApiMonitoring />} />
            <Route path="advanced-search" element={<AdvancedSearch />} />
            <Route path="integration-marketplace" element={<IntegrationMarketplace />} />
            <Route path="mobile-admin" element={<MobileAdminCompanion />} />
            <Route path="accessibility-intl" element={<AccessibilityIntl />} />
            <Route path="user-activity-heatmap" element={<UserActivityHeatmap />} />
            <Route path="notification-rules" element={<NotificationRules />} />
            <Route path="data-visualization" element={<DataVisualization />} />
            <Route path="drag-drop-table" element={<DragDropTable />} />
            <Route path="audit-log-replay" element={<AuditLogReplay />} />
            <Route path="multi-tab-sync" element={<MultiTabSync />} />
            <Route path="theme-toggle" element={<ThemeToggle />} />
            <Route path="custom-branding" element={<CustomBranding />} />
            <Route path="advanced-filtering" element={<AdvancedFiltering />} />
            <Route path="in-app-chat" element={<InAppChat />} />

            <Route path="scheduled-reports" element={<ScheduledReports />} />
            <Route path="webhooks-subscriptions" element={<WebhooksSubscriptions />} />
            <Route path="data-masking-permissions" element={<ProtectedRoute roles={['admin']}><DataMaskingPermissions /></ProtectedRoute>} />
            <Route path="custom-scripting" element={<CustomScripting />} />
            <Route path="ai-integration" element={<AIIntegrationSettings />} />
            <Route path="mobile-app-integration" element={<ApiKeysIntegrationsManagement />} />
            <Route path="real-time-monitoring" element={<RealTimeMonitoring />} />
            <Route path="deliverymen" element={<DeliverymanManagement />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="store-management" element={<StoreManagement />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
