import { createRootRoute, createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router';
import { AppShell } from '@/components/app-shell/app-shell';
import { readLastSettingsRoute } from '@/lib/settings-route';
import { NotFoundPage } from '@/components/not-found-page';

const HomePage = lazyRouteComponent(() => import('@/features/home/home-page'), 'HomePage');

const ClonePage = lazyRouteComponent(() => import('@/features/clone/clone-page'), 'ClonePage');
const DesignPage = lazyRouteComponent(() => import('@/features/design/design-page'), 'DesignPage');
const DubPage = lazyRouteComponent(() => import('@/features/dub/dub-page'), 'DubPage');
const BatchPage = lazyRouteComponent(() => import('@/features/batch/batch-page'), 'BatchPage');
const GalleryPage = lazyRouteComponent(
  () => import('@/features/gallery/gallery-page'),
  'GalleryPage',
);
const TranscriptionsPage = lazyRouteComponent(
  () => import('@/features/transcriptions/transcriptions-page'),
  'TranscriptionsPage',
);
const StoriesPage = lazyRouteComponent(
  () => import('@/features/longform/longform-page'),
  'StoriesPage',
);
const AudiobookPage = lazyRouteComponent(
  () => import('@/features/longform/longform-page'),
  'AudiobookPage',
);
const ProjectsPage = lazyRouteComponent(
  () => import('@/features/projects/projects-page'),
  'ProjectsPage',
);
const WorkflowsPage = lazyRouteComponent(
  () => import('@/features/workflows/workflows-page'),
  'WorkflowsPage',
);
// Calls lives beside the workflow canvas (a call step hands off to it), so it
// shares the page but opens on the Calls view instead of the canvas.
const CallsPage = lazyRouteComponent(
  () => import('@/features/workflows/workflows-page'),
  'WorkflowCallsPage',
);
const ToolsPage = lazyRouteComponent(() => import('@/features/tools/tools-page'), 'ToolsPage');
const IntegrationsPage = lazyRouteComponent(
  () => import('@/features/integrations/integrations-page'),
  'IntegrationsPage',
);
const IntegrationDetailPage = lazyRouteComponent(
  () => import('@/features/integrations/integration-detail-page'),
  'IntegrationDetailPage',
);
const SettingsPage = lazyRouteComponent(
  () => import('@/features/settings/settings-page'),
  'SettingsPage',
);
const ProPage = lazyRouteComponent(() => import('@/features/pro/pro-page'), 'ProPage');
const PortalPage = lazyRouteComponent(() => import('@/features/portal/portal-page'), 'PortalPage');
const PublicHomePage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicHomePage');
const PublicFeaturesPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicFeaturesPage');
const PublicPricingPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicPricingPage');
const PublicDownloadPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicDownloadPage');
const PublicDocsPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicDocsPage');
const PublicAboutPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicAboutPage');
const PublicContactPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicContactPage');
const PublicTermsPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicTermsPage');
const PublicPrivacyPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicPrivacyPage');
const PublicRefundPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicRefundPage');
const PublicDeliveryPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicDeliveryPage');
const PublicLicensePage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicLicensePage');
const PublicLoginPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicLoginPage');
const PublicRegisterPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicRegisterPage');
const PublicForgotPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicForgotPage');
const PublicResetPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicResetPage');
const PublicAccountPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicAccountPage');
const PublicAdminPage = lazyRouteComponent(() => import('@/features/website/website-routes'), 'PublicAdminPage');

export const rootRoute = createRootRoute({ component: AppShell });

const RootIndexComponent = __WEB_DEPLOYMENT__ ? PublicHomePage : HomePage;

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RootIndexComponent,
});

export const studioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/studio',
  component: HomePage,
});

export const savedVoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/personas',
  component: lazyRouteComponent(
    () => import('@/features/clone/saved-voices-page'),
    'SavedVoicesPage',
  ),
});

export const cloneRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clone',
  component: ClonePage,
});

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: () => {
    throw redirect({ to: readLastSettingsRoute() });
  },
});

export const appearanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/appearance',
  component: SettingsPage,
});
export const generalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/general',
  component: SettingsPage,
});

export const modelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/models',
  component: SettingsPage,
});
export const modelFamilyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/models/$family',
  component: SettingsPage,
});

export const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  component: NotFoundPage,
});

export const transcriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transcriptions',
  component: TranscriptionsPage,
});

export const designRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/design',
  component: DesignPage,
});

export const dubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dub',
  component: DubPage,
});

export const logsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/logs',
  component: SettingsPage,
});

export const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gallery',
  component: GalleryPage,
});

export const batchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/batch',
  component: BatchPage,
});
export const callsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calls',
  component: CallsPage,
});
export const workflowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workflows',
  component: WorkflowsPage,
});
export const toolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools',
  component: ToolsPage,
});
export const integrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integrations',
  component: IntegrationsPage,
});
export const integrationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integrations/$slug',
  component: IntegrationDetailPage,
});
export const mediaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/media',
  component: SettingsPage,
});
export const pronunciationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/pronunciation',
  component: SettingsPage,
});
export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
});
export const storiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stories',
  component: StoriesPage,
});
export const audiobookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/audiobook',
  component: AudiobookPage,
});
export const networkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/network',
  component: SettingsPage,
});
export const sharingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/sharing',
  component: SettingsPage,
});
export const credentialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/credentials',
  component: SettingsPage,
});
export const performanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/performance',
  component: SettingsPage,
});
export const usageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/usage',
  component: SettingsPage,
});
export const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/account',
  component: SettingsPage,
});
export const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/privacy',
  component: SettingsPage,
});
export const permissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/permissions',
  component: SettingsPage,
});
export const storageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/storage',
  component: SettingsPage,
});
export const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/support',
  validateSearch: (search: Record<string, unknown>): { compare?: boolean } => ({
    compare: search.compare === true || search.compare === 'true' ? true : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (search.compare) throw redirect({ to: '/pro' });
  },
  component: SettingsPage,
});
export const proRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pro',
  component: ProPage,
});
export const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal',
  component: PortalPage,
});
export const storeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/store',
  component: PortalPage,
});
export const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/download',
  component: PublicDownloadPage,
});
export const websiteHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/website',
  component: PublicHomePage,
});
export const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features',
  component: PublicFeaturesPage,
});
export const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PublicPricingPage,
});
export const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/docs',
  component: PublicDocsPage,
});
export const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: PublicAboutPage,
});
export const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: PublicContactPage,
});
export const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: PublicTermsPage,
});
export const websitePrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PublicPrivacyPage,
});
export const refundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/refund-policy',
  component: PublicRefundPage,
});
export const deliveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/delivery-policy',
  component: PublicDeliveryPage,
});
export const licenseAgreementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/license-agreement',
  component: PublicLicensePage,
});
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: PublicLoginPage,
});
export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: PublicRegisterPage,
});
export const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: PublicForgotPage,
});
export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: PublicResetPage,
});
export const accountPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: PublicAccountPage,
});
export const adminWebsiteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/website',
  component: PublicAdminPage,
});
export const updatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/updates',
  component: SettingsPage,
});
export const openApiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/openapi',
  component: SettingsPage,
});
export const diagnosticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/diagnostics',
  component: SettingsPage,
});
export const routeTree = rootRoute.addChildren([
  diagnosticsRoute,
  openApiRoute,
  updatesRoute,
  supportRoute,
  proRoute,
  portalRoute,
  storeRoute,
  downloadRoute,
  websiteHomeRoute,
  featuresRoute,
  pricingRoute,
  docsRoute,
  aboutRoute,
  contactRoute,
  termsRoute,
  websitePrivacyRoute,
  refundRoute,
  deliveryRoute,
  licenseAgreementRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  accountPortalRoute,
  adminWebsiteRoute,
  storageRoute,
  privacyRoute,
  accountRoute,
  permissionsRoute,
  performanceRoute,
  usageRoute,
  networkRoute,
  sharingRoute,
  credentialsRoute,
  storiesRoute,
  audiobookRoute,
  projectsRoute,
  indexRoute,
  studioRoute,
  cloneRoute,
  savedVoicesRoute,
  pronunciationRoute,
  mediaRoute,
  toolsRoute,
  callsRoute,
  workflowsRoute,
  integrationsRoute,
  integrationDetailRoute,
  batchRoute,
  galleryRoute,
  logsRoute,
  dubRoute,
  designRoute,
  transcriptionsRoute,
  settingsRoute,
  appearanceRoute,
  generalRoute,
  modelsRoute,
  modelFamilyRoute,
  catchAllRoute,
]);
