import { KeyIcon } from 'lucide-react';

export function WebsiteLicensePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <KeyIcon className="size-3.5" />
          <span>Software Agreement</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Commercial License Agreement & EULA
        </h1>
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          Cryptographically signed offline commercial licenses · Timeline rules & terms.
        </p>
      </div>

      <div className="website-card rounded-3xl p-8 sm:p-10 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            1. License Architecture & Cryptographic Signing
          </h2>
          <p>
            Every AlphaVoice Studio commercial license is issued as a tamper-proof cryptographic token carrying your licensed seats, plan duration (6 Months, 1 Year, 2 Years, or Custom months), and authorized feature set. The desktop application validates this digital signature locally on your computer with zero cloud telemetry or periodic phone-home handshakes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            2. License Timeline Tiers
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <h3 className="font-bold text-foreground text-sm">6-Month Commercial License</h3>
              <p className="text-xs text-muted-foreground">
                Base Price: ₹17,000 + 18% GST (Total: ₹20,060). Valid for 180 calendar days from activation. Includes full commercial rights, unlimited local synthesis, and priority updates.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <h3 className="font-bold text-foreground text-sm">1-Year Commercial License</h3>
              <p className="text-xs text-muted-foreground">
                Base Price: ₹30,000 + 18% GST (Total: ₹35,400). Valid for 365 calendar days. Saves ₹4,000 over two 6-month licenses. Includes priority developer support and model pack updates.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <h3 className="font-bold text-foreground text-sm">2-Year Commercial License</h3>
              <p className="text-xs text-muted-foreground">
                Base Price: ₹54,000 + 18% GST (Total: ₹63,720). Valid for 730 calendar days. Best long-term value (effective ₹2,250/mo) with guaranteed rate lock and multi-seat deployment rights.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <h3 className="font-bold text-foreground text-sm">Custom Duration License</h3>
              <p className="text-xs text-muted-foreground">
                Flexible duration from 1 to 60 months tailored to client contract lengths. Calculated at dynamically tiered monthly rates with 18% GST breakdown.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            3. Hardware Activation & Seat Transfers
          </h2>
          <p>
            Each purchased seat authorizes simultaneous installation on your primary workstation (e.g. desktop studio PC) and secondary portable device (e.g. laptop). If you replace your workstation or reformat your operating system, your license key can be reactivated seamlessly without contacting support.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            4. Installer Download Access
          </h2>
          <p>
            In accordance with commercial distribution rules, software binary installers (.exe, .dmg, .AppImage) are strictly restricted to accounts with an active paid license. Software files cannot be downloaded without a verified purchase.
          </p>
        </section>
      </div>
    </div>
  );
}
