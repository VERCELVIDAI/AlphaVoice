import { RefreshCwIcon, HelpCircleIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function WebsiteRefundPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <RefreshCwIcon className="size-3.5" />
          <span>Fair & Transparent</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Refund & Cancellation Policy
        </h1>
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          Our commitment to creator confidence and satisfaction · Effective October 2026.
        </p>
      </div>

      <div className="website-card rounded-3xl p-8 sm:p-10 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            1. 14-Day Money-Back Guarantee
          </h2>
          <p>
            We stand firmly behind the quality and neural performance of AlphaVoice Studio. If you purchase any commercial license (6-Month, 1-Year, 2-Year, or Custom timeline) and determine that the software does not meet your studio workflow requirements or your host computer hardware is incompatible, you may request a <strong>100% full refund within 14 calendar days</strong> of the original transaction date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            2. Refund Process & Eligibility
          </h2>
          <p>
            To request a refund within the 14-day evaluation window:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Email our customer billing desk at <strong className="text-foreground">billing@alphavoice.studio</strong> from the email address registered on your customer account.</li>
            <li>Include your Invoice Number (e.g. <code className="text-foreground">INV-ALPHA-...</code>) and the reason for your refund request.</li>
            <li>Our billing team will review and approve your request within 24 business hours. Upon approval, the associated cryptographic license key will be deactivated.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            3. Payout & Processing Timelines
          </h2>
          <p>
            Approved refunds are credited directly back to your original payment method (UPI account, Credit/Debit card, or Net Banking bank account). Processing times typically range between <strong>5 to 7 business days</strong> depending on your banking institution or UPI payment provider.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            4. Cancellations & Renewals
          </h2>
          <p>
            AlphaVoice Studio does not perform surprise automatic credit card deductions. At the end of your license timeline (6 Months, 1 Year, 2 Years, or Custom months), your key simply reaches its scheduled expiry date. You retain full control over whether and when to renew or purchase additional license months.
          </p>
        </section>

        <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HelpCircleIcon className="size-4 text-primary" />
            <span>Have questions about our refund policy or billing terms?</span>
          </div>
          <Link
            to="/contact"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Contact Billing Support
          </Link>
        </div>
      </div>
    </div>
  );
}
