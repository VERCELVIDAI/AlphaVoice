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
import { WebsiteTermsPage } from './pages/website-terms-page';
import { WebsitePrivacyPage } from './pages/website-privacy-page';
import { WebsiteRefundPage } from './pages/website-refund-page';
import { WebsiteDeliveryPage } from './pages/website-delivery-page';
import { WebsiteLicensePage } from './pages/website-license-page';
import { WebsiteContactPage } from './pages/website-contact-page';

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

export function PublicContactPage() {
  return (
    <WebsiteLayout>
      <WebsiteContactPage />
    </WebsiteLayout>
  );
}

export function PublicTermsPage() {
  return (
    <WebsiteLayout>
      <WebsiteTermsPage />
    </WebsiteLayout>
  );
}

export function PublicPrivacyPage() {
  return (
    <WebsiteLayout>
      <WebsitePrivacyPage />
    </WebsiteLayout>
  );
}

export function PublicRefundPage() {
  return (
    <WebsiteLayout>
      <WebsiteRefundPage />
    </WebsiteLayout>
  );
}

export function PublicDeliveryPage() {
  return (
    <WebsiteLayout>
      <WebsiteDeliveryPage />
    </WebsiteLayout>
  );
}

export function PublicLicensePage() {
  return (
    <WebsiteLayout>
      <WebsiteLicensePage />
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

export function PublicResetPage() {
  return (
    <WebsiteLayout>
      <WebsiteAuthPage initialMode="reset" />
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
