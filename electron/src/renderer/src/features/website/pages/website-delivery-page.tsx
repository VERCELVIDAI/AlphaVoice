import { ZapIcon, ClockIcon, MailIcon, DownloadIcon } from 'lucide-react';

export function WebsiteDeliveryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <ZapIcon className="size-3.5" />
          <span>Fulfillment Policy</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Digital Delivery & Software Fulfillment
        </h1>
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          Instant electronic software fulfillment · No physical shipment required.
        </p>
      </div>

      <div className="website-card rounded-3xl p-8 sm:p-10 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            1. 100% Digital Electronic Delivery
          </h2>
          <p>
            AlphaVoice Studio is a proprietary commercial desktop software product delivered exclusively via electronic transmission. We do not dispatch physical CD/DVD media, printed manuals, or hardware dongles to your postal address.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            2. Instant Delivery Timeline (Zero Waiting Period)
          </h2>
          <p>
            Upon successful completion of payment (via UPI, Credit/Debit Card, or Net Banking) for any commercial license plan (6 Months, 1 Year, 2 Years, or Custom timeline):
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <ClockIcon className="size-4" />
              </div>
              <h3 className="font-semibold text-foreground text-xs">Immediate Key Display</h3>
              <p className="text-[11px] text-muted-foreground">
                Your cryptographic license key and tax invoice appear on your screen instantly.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <DownloadIcon className="size-4" />
              </div>
              <h3 className="font-semibold text-foreground text-xs">Instant Download Access</h3>
              <p className="text-[11px] text-muted-foreground">
                Download access to Windows, macOS, and Linux production binaries unlocks immediately.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                <MailIcon className="size-4" />
              </div>
              <h3 className="font-semibold text-foreground text-xs">Confirmation Email</h3>
              <p className="text-[11px] text-muted-foreground">
                A copy of your license key, certificate JSON, and official GST invoice is sent to your email.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            3. Delivery Verification & Issues
          </h2>
          <p>
            If you have completed payment but do not see your license key or cannot access the Download Center within 5 minutes, please check your Customer Account Portal at <code className="text-foreground">/account</code>, or contact our 24/7 delivery support team at <strong className="text-foreground">support@alphavoice.studio</strong> with your transaction reference.
          </p>
        </section>
      </div>
    </div>
  );
}
