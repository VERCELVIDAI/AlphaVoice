import { FileTextIcon } from 'lucide-react';

export function WebsiteTermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <FileTextIcon className="size-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Terms of Service & Commercial Agreement
        </h1>
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          Last updated: October 30, 2026 · Effective for all AlphaVoice Studio commercial software installations.
        </p>
      </div>

      <div className="website-card rounded-3xl p-8 sm:p-10 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            1. Commercial License Grant
          </h2>
          <p>
            Upon payment of the applicable license fee (6-Month, 1-Year, 2-Year, or Custom timeline duration) and issuance of a cryptographic license key, AlphaVoice Technologies grants you a non-exclusive, worldwide commercial license to use AlphaVoice Studio for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Creating commercial synthesized voiceovers, audiobooks, podcasts, YouTube and streaming content.</li>
            <li>Monetizing client multimedia deliverables, film/TV dubbing, video games, and commercial software integrations.</li>
            <li>Deploying local offline OpenAI-compatible REST server and Anthropic MCP voice agent endpoints.</li>
            <li>Executing zero-shot neural voice clones and generative prompt-based voice designs without per-word or monthly character quotas.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            2. Local-First Execution & Data Sovereignty
          </h2>
          <p>
            AlphaVoice Studio executes 100% locally on your own computer hardware (CPU, NVIDIA CUDA, AMD ROCm, or Apple Silicon). No synthetic speech audio, cloned reference recordings, or prompt text is transmitted to our servers or third-party cloud infrastructure. You retain 100% intellectual property ownership over all generated audio files and acoustic profiles created with the software.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            3. License Timeline, Payment & Taxes (GST)
          </h2>
          <p>
            Commercial plans are billed according to your selected timeline: 6 Months (₹17,000 + 18% GST), 1 Year (₹30,000 + 18% GST), 2 Years (₹54,000 + 18% GST), or Custom month durations. In accordance with applicable tax regulations, Goods and Services Tax (GST) at 18% is applied at checkout. Registered Indian business entities providing a valid GSTIN receive an official tax invoice eligible for Input Tax Credit (ITC).
          </p>
          <p>
            Software installer files and update channels are strictly reserved for accounts with an active, paid commercial license. Without payment, installer downloads cannot be accessed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            4. Permitted Use & Ethical Voice Cloning
          </h2>
          <p>
            You agree to use voice cloning and acoustic synthesis responsibly. You warrant that you have lawful authorization, consent, or copyright permissions for any voice sample or reference audio you input into the software for cloning purposes. AlphaVoice Studio must not be used to produce unlawful deceptive deepfakes, fraudulent impersonations, or defamatory media.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            5. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, AlphaVoice Technologies provides the software &quot;as is&quot; without warranties of uninterrupted local hardware compatibility. In no event shall AlphaVoice Technologies be liable for indirect, punitive, or consequential damages resulting from local software execution or third-party hardware failures.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            6. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of India. Any legal dispute or claim arising under this agreement shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
}
