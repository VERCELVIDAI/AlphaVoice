import { ShieldCheckIcon } from 'lucide-react';

export function WebsitePrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-400">
          <ShieldCheckIcon className="size-3.5" />
          <span>Local-First Data Privacy</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy & Security Architecture
        </h1>
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          Last updated: October 30, 2026 · True local-first data protection.
        </p>
      </div>

      <div className="website-card rounded-3xl p-8 sm:p-10 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            1. The Sovereign Local-First Privacy Guarantee
          </h2>
          <p>
            Unlike traditional cloud TTS SaaS providers that transmit your sensitive scripts, voice recordings, and customer data across public networks, AlphaVoice Studio is built on a 100% on-device architecture:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Zero Audio Transmission:</strong> Your microphone recordings, cloned voice audio, synthesized takes, and video files never leave your machine.</li>
            <li><strong>Zero Prompt Telemetry:</strong> Text scripts and prompts entered into the studio or REST API are processed locally in RAM and written only to your local SQLite database.</li>
            <li><strong>No Model Training On User Data:</strong> We never harvest, aggregate, or train future models on your personal voice reference files.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            2. Customer Portal & Transaction Data
          </h2>
          <p>
            When purchasing a commercial license on our website, we collect only necessary billing data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Your name, email address, and optional company name (for license key delivery and portal login).</li>
            <li>GSTIN and billing address (if provided for tax deduction and input tax credit).</li>
            <li>Payment transaction IDs processed securely through PCI-DSS Level 1 compliant payment gateways (UPI, Cards, Net Banking). We never store raw credit card numbers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            3. Offline License Cryptography
          </h2>
          <p>
            License keys issued by AlphaVoice Technologies are cryptographically signed. Your desktop application validates the digital signature 100% offline using asymmetric public-key cryptography. The application does not require a continuous internet heartbeat to function.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            4. User Rights & Data Deletion
          </h2>
          <p>
            You have the right to request access to or deletion of your customer portal account and associated purchase history at any time by contacting <code className="text-foreground">privacy@alphavoice.studio</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
