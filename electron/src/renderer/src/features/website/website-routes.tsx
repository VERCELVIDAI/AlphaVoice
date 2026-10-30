import { WebsiteLayout } from './website-layout';
import { WebsiteHomePage } from './pages/website-home-page';
import { WebsiteFeaturesPage } from './pages/website-features-page';
import { WebsitePricingPage } from './pages/website-pricing-page';
import { WebsiteDownloadPage } from './pages/website-download-page';
import { WebsiteDocsPage } from './pages/website-docs-page';
import { WebsiteAboutContactPage } from './pages/website-about-contact-page';
import { WebsiteAuthPage } from './pages/website-auth-page';
import { WebsiteAccountPage } from './pages/website-account-page';
import { WebsiteAdminPage } from './pages/website-admin-page';

export function PublicHomePage() {
  return (
    <WebsiteLayout>
      <WebsiteHomePage />
    </WebsiteLayout>
  );
}

export function PublicFeaturesPage() {
  return (
    <WebsiteLayout>
      <WebsiteFeaturesPage />
    </WebsiteLayout>
  );
}

export function PublicPricingPage() {
  return (
    <WebsiteLayout>
      <WebsitePricingPage />
    </WebsiteLayout>
  );
}

export function PublicDownloadPage() {
  return (
    <WebsiteLayout>
      <WebsiteDownloadPage />
    </WebsiteLayout>
  );
}

export function PublicDocsPage() {
  return (
    <WebsiteLayout>
      <WebsiteDocsPage />
    </WebsiteLayout>
  );
}

export function PublicAboutPage() {
  return (
    <WebsiteLayout>
      <WebsiteAboutContactPage />
    </WebsiteLayout>
  );
}

export function PublicLoginPage() {
  return (
    <WebsiteLayout>
      <WebsiteAuthPage initialMode="login" />
    </WebsiteLayout>
  );
}

export function PublicRegisterPage() {
  return (
    <WebsiteLayout>
      <WebsiteAuthPage initialMode="register" />
    </WebsiteLayout>
  );
}

export function PublicForgotPage() {
  return (
    <WebsiteLayout>
      <WebsiteAuthPage initialMode="forgot" />
    </WebsiteLayout>
  );
}

export function PublicAccountPage() {
  return (
    <WebsiteLayout>
      <WebsiteAccountPage />
    </WebsiteLayout>
  );
}

export function PublicAdminPage() {
  return (
    <WebsiteLayout>
      <WebsiteAdminPage />
    </WebsiteLayout>
  );
}
