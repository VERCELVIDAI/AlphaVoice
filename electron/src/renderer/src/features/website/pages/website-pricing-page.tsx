import { useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  SparklesIcon,
  ZapIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CheckoutModal, type CheckoutPlan } from '@/features/portal/checkout-modal';

export function WebsitePricingPage() {
  const [seatCount, setSeatCount] = useState(1);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<CheckoutPlan | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Custom month duration selector state
  const [customMonths, setCustomMonths] = useState<number>(3);

  // Rate calculator for custom months
  const getCustomRatePerMonth = (months: number) => {
    if (months < 6) return 3000;
    if (months < 12) return 2833.33; // 6 months = 17,000
    if (months < 24) return 2500; // 12 months = 30,000
    return 2250; // 24+ months = 54,000
  };

  const customBaseUnit = Math.round(customMonths * getCustomRatePerMonth(customMonths));
  const customGstUnit = Math.round(customBaseUnit * 0.18);
  const customTotalUnit = customBaseUnit + customGstUnit;

  // Volume discount calculation
  const volumeDiscountPercent = seatCount >= 10 ? 20 : seatCount >= 5 ? 10 : 0;

  const faqs = [
    {
      q: 'How does the commercial license timeline work?',
      a: 'Licenses are issued for designated durations: 6 Months (₹17,000 + 18% GST), 1 Year (₹30,000 + 18% GST), 2 Years (₹54,000 + 18% GST), or a Custom Duration where you select the exact number of months. During your license period, you have full commercial monetization rights and software access.',
    },
    {
      q: 'Why is 18% GST applicable?',
      a: 'Under Indian GST laws, digital software licenses and electronic software distributions attract 18% Goods and Services Tax (CGST 9% + SGST 9% for intra-state, or IGST 18% for inter-state). If you have a business GSTIN, enter it at checkout to claim full Input Tax Credit (ITC).',
    },
    {
      q: 'Can I download the software installer without paying?',
      a: 'No. Standalone installer packages (.exe, .dmg, .AppImage) and offline cryptographic neural runtime bundles are gated exclusively for active commercial license holders. Once your license is issued, the Download Center is instantly unlocked.',
    },
    {
      q: 'Do AlphaVoice license keys require an internet connection?',
      a: 'No. AlphaVoice Studio license keys are cryptographically signed offline keys. Once entered or activated, your local application validates the key 100% offline without phoning home to central licensing servers.',
    },
    {
      q: 'What is your refund policy?',
      a: 'We provide an unconditional 14-day money-back guarantee for all commercial license tiers. If AlphaVoice does not meet your studio needs or your hardware is incompatible, contact support within 14 days for a full refund.',
    },
    {
      q: 'Can I use AlphaVoice for commercial client projects?',
      a: 'Yes. All paid commercial licenses grant you 100% royalty-free rights to monetize voiceovers, podcasts, audiobooks, YouTube content, video game characters, and commercial client deliverables.',
    },
  ];

  const comparisonFeatures = [
    {
      category: 'Core Neural Voice Engines',
      features: [
        { name: 'Kokoro-82M Ultra-Fast Engine', m6: true, y1: true, y2: true, cust: true },
        { name: 'KittenTTS CPU Lightweight Engine', m6: true, y1: true, y2: true, cust: true },
        { name: 'F5-TTS Zero-Shot Cloning Engine (3-Sec Voice)', m6: true, y1: true, y2: true, cust: true },
        { name: 'CosyVoice Multilingual Emotion Engine', m6: true, y1: true, y2: true, cust: true },
        { name: 'WhisperX Real-Time GPU Speech Dictation', m6: true, y1: true, y2: true, cust: true },
        { name: 'Chatterbox Conversational Dialogue Engine', m6: true, y1: true, y2: true, cust: true },
      ],
    },
    {
      category: 'Workflows & Production Capabilities',
      features: [
        { name: 'Unlimited Offline Speech Generation (No Word Quotas)', m6: true, y1: true, y2: true, cust: true },
        { name: 'Local OpenAI-Compatible REST Server', m6: true, y1: true, y2: true, cust: true },
        { name: 'Commercial Rights & Content Monetization', m6: true, y1: true, y2: true, cust: true },
        { name: 'Multilingual Video Dubbing & Lip-Sync', m6: true, y1: true, y2: true, cust: true },
        { name: 'Multi-Speaker Audiobook Chapter Studio', m6: true, y1: true, y2: true, cust: true },
        { name: 'Batch Export & Multi-Worker Queues', m6: true, y1: true, y2: true, cust: true },
      ],
    },
    {
      category: 'Licensing, Security & Tax Compliance',
      features: [
        { name: '100% Offline Cryptographic Key Validation', m6: true, y1: true, y2: true, cust: true },
        { name: 'Zero Telemetry & Private Local Model Weights', m6: true, y1: true, y2: true, cust: true },
        { name: 'Official GST 18% Tax Invoice for Input Tax Credit', m6: true, y1: true, y2: true, cust: true },
        { name: 'Instant Installer Binary Download Access', m6: true, y1: true, y2: true, cust: true },
        { name: 'Priority Updates & Neural Weights Releases', m6: true, y1: true, y2: true, cust: true },
        { name: 'Dedicated Technical Support Desk', m6: true, y1: true, y2: true, cust: true },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <ZapIcon className="size-3.5" />
          <span>Timeline-Based Commercial Licensing</span>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Transparent License Timeline Plans
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed">
          100% on-device private voice AI. Pay for your required license duration starting at 6 months, 
          with official 18% GST tax invoices and instant offline cryptographic key delivery.
        </p>

        {/* Seat Counter */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-2 text-xs">
            <span className="text-muted-foreground font-medium">Workstation Seats:</span>
            <button
              type="button"
              onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
              className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted"
            >
              <MinusIcon className="size-3" />
            </button>
            <span className="w-8 text-center font-bold text-foreground text-sm">{seatCount}</span>
            <button
              type="button"
              onClick={() => setSeatCount(Math.min(99, seatCount + 1))}
              className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted"
            >
              <PlusIcon className="size-3" />
            </button>
            {volumeDiscountPercent > 0 && (
              <span className="ml-2 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {volumeDiscountPercent}% Volume Off
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4 Plan Cards Grid: 6 Months, 1 Year, 2 Years, and Custom Duration */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Plan 1: 6 Months */}
        <div className="website-card rounded-3xl p-6 flex flex-col justify-between border-border/70">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">6 Months Plan</h3>
              <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                6 Months
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Ideal for single productions and projects.</p>

            <div className="mt-6 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">
                  ₹{(17000 * seatCount).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-muted-foreground font-medium">+ 18% GST</span>
              </div>
              <div className="text-xs text-primary font-semibold">
                Total: ₹{(20060 * seatCount).toLocaleString('en-IN')} (incl. GST)
              </div>
              <div className="text-[11px] text-muted-foreground">
                Effective ~₹2,833 / month
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>6 Months Full Commercial Rights</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>All 40+ Local Neural Voice Models</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Zero-Shot Voice Cloning & Voice Design</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>WhisperX Real-Time GPU Dictation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Instant Software Installer Access</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Offline Cryptographic Key Activation</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-border/50">
            <Button
              onClick={() =>
                setSelectedPlanForCheckout({
                  id: '6months',
                  name: 'AlphaVoice 6 Months Commercial License',
                  basePrice: 17000,
                  durationMonths: 6,
                  seats: seatCount,
                  period: '6 Months Timeline',
                })
              }
              className="h-10 w-full text-xs font-semibold"
            >
              Choose 6-Month Plan
            </Button>
          </div>
        </div>

        {/* Plan 2: 1 Year (12 Months) - Featured */}
        <div className="website-card rounded-3xl p-6 flex flex-col justify-between border-2 border-primary bg-primary/5 relative shadow-xl shadow-primary/10">
          <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
            Most Popular · Save ₹4,000
          </span>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">1 Year Plan</h3>
              <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                12 Months
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">For active studios, creators, and agencies.</p>

            <div className="mt-6 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">
                  ₹{(30000 * seatCount).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-muted-foreground font-medium">+ 18% GST</span>
              </div>
              <div className="text-xs text-primary font-bold">
                Total: ₹{(35400 * seatCount).toLocaleString('en-IN')} (incl. GST)
              </div>
              <div className="text-[11px] text-muted-foreground">
                Effective ₹2,500 / month (Save vs 6mo renewal)
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 text-foreground font-semibold">
                <SparklesIcon className="size-4 text-primary shrink-0" />
                <span>Full 1 Year Uninterrupted Commercial License</span>
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckIcon className="size-4 text-primary shrink-0" />
                <span>Multi-Speaker Video Dubbing & Lip-Sync</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Multi-Track Audiobook Production Studio</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Local OpenAI REST Server & MCP Integration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Priority Release Updates & New Models</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Instant Software Installer Unlocked</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-primary/20">
            <Button
              onClick={() =>
                setSelectedPlanForCheckout({
                  id: '1year',
                  name: 'AlphaVoice 1 Year Commercial License',
                  basePrice: 30000,
                  durationMonths: 12,
                  seats: seatCount,
                  period: '12 Months Timeline',
                })
              }
              className="h-10 w-full text-xs font-bold shadow-md shadow-primary/25"
            >
              Choose 1-Year Plan
            </Button>
          </div>
        </div>

        {/* Plan 3: 2 Years (24 Months) */}
        <div className="website-card rounded-3xl p-6 flex flex-col justify-between border-border/70">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">2 Years Plan</h3>
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                24 Months · Best Value
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Long-term license for established production teams.</p>

            <div className="mt-6 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">
                  ₹{(54000 * seatCount).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-muted-foreground font-medium">+ 18% GST</span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                Total: ₹{(63720 * seatCount).toLocaleString('en-IN')} (incl. GST)
              </div>
              <div className="text-[11px] text-muted-foreground">
                Effective ₹2,250 / month (Maximum Savings)
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>24 Months Uninterrupted Commercial Rights</span>
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Guaranteed Free Upgrades Across v1.x & v2.x</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>All 40+ Neural Voice Models & Future Weights</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Multi-Workstation Transferable License Key</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>VIP Priority Developer Ticket Support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400 shrink-0" />
                <span>Instant Installer Delivery & Gated Updates</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-border/50">
            <Button
              onClick={() =>
                setSelectedPlanForCheckout({
                  id: '2years',
                  name: 'AlphaVoice 2 Years Commercial License',
                  basePrice: 54000,
                  durationMonths: 24,
                  seats: seatCount,
                  period: '24 Months Timeline',
                })
              }
              className="h-10 w-full text-xs font-semibold"
            >
              Choose 2-Year Plan
            </Button>
          </div>
        </div>

        {/* Plan 4: Custom Duration Plan (Interactive Month Selector) */}
        <div className="website-card rounded-3xl p-6 flex flex-col justify-between border-cyan-500/40 bg-cyan-500/5 relative">
          <span className="absolute -top-3 right-6 rounded-full bg-cyan-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            Custom Duration
          </span>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Custom Plan</h3>
              <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                {customMonths} Months
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Select any number of months you need.</p>

            {/* Interactive Slider and Controls */}
            <div className="mt-5 rounded-2xl border border-border/60 bg-card/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Choose Duration:</span>
                <span className="text-foreground font-bold text-sm text-cyan-400">{customMonths} Months</span>
              </div>

              <input
                type="range"
                min="1"
                max="60"
                value={customMonths}
                onChange={(e) => setCustomMonths(parseInt(e.target.value) || 1)}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-muted rounded-lg"
              />

              <div className="flex items-center justify-between gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCustomMonths(1)}
                  className="rounded px-1.5 py-0.5 bg-muted hover:bg-muted/80 text-muted-foreground"
                >
                  1 Mo
                </button>
                <button
                  type="button"
                  onClick={() => setCustomMonths(3)}
                  className="rounded px-1.5 py-0.5 bg-muted hover:bg-muted/80 text-muted-foreground"
                >
                  3 Mo
                </button>
                <button
                  type="button"
                  onClick={() => setCustomMonths(6)}
                  className="rounded px-1.5 py-0.5 bg-muted hover:bg-muted/80 text-muted-foreground"
                >
                  6 Mo
                </button>
                <button
                  type="button"
                  onClick={() => setCustomMonths(12)}
                  className="rounded px-1.5 py-0.5 bg-muted hover:bg-muted/80 text-muted-foreground"
                >
                  12 Mo
                </button>
                <button
                  type="button"
                  onClick={() => setCustomMonths(36)}
                  className="rounded px-1.5 py-0.5 bg-muted hover:bg-muted/80 text-muted-foreground"
                >
                  36 Mo
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">
                  ₹{(customBaseUnit * seatCount).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-muted-foreground font-medium">+ 18% GST</span>
              </div>
              <div className="text-xs text-cyan-400 font-bold">
                Total: ₹{(customTotalUnit * seatCount).toLocaleString('en-IN')} (incl. GST)
              </div>
              <div className="text-[11px] text-muted-foreground">
                GST Amount: ₹{(customGstUnit * seatCount).toLocaleString('en-IN')}
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckIcon className="size-4 text-cyan-400 shrink-0" />
                <span>Custom {customMonths} Months Commercial License</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-cyan-400 shrink-0" />
                <span>All 40+ Local Neural Speech Engines</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-cyan-400 shrink-0" />
                <span>Instant Installer Binary Download</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-cyan-400 shrink-0" />
                <span>GST 18% Tax Invoice for Business ITC</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-cyan-500/20">
            <Button
              onClick={() =>
                setSelectedPlanForCheckout({
                  id: 'custom',
                  name: `AlphaVoice ${customMonths} Months Custom License`,
                  basePrice: customBaseUnit,
                  durationMonths: customMonths,
                  seats: seatCount,
                  period: `${customMonths} Months Timeline`,
                })
              }
              className="h-10 w-full text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Get {customMonths} Months License
            </Button>
          </div>
        </div>
      </div>

      {/* FEATURE COMPARISON TABLE */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Commercial License Features Matrix</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Complete comparison across all timeline durations.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card/60 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="p-4 font-bold text-foreground">Capability / Feature</th>
                <th className="p-4 font-bold text-foreground text-center">6 Months</th>
                <th className="p-4 font-bold text-primary text-center">1 Year</th>
                <th className="p-4 font-bold text-foreground text-center">2 Years</th>
                <th className="p-4 font-bold text-cyan-400 text-center">Custom</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((sec, idx) => (
                <tr key={idx} className="contents">
                  <td colSpan={5} className="bg-muted/20 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-t border-border/40">
                    {sec.category}
                  </td>
                  {sec.features.map((feat, fIdx) => (
                    <tr key={fIdx} className="border-b border-border/30 hover:bg-muted/10">
                      <td className="p-4 font-medium text-foreground">{feat.name}</td>
                      <td className="p-4 text-center">
                        {feat.m6 ? <CheckIcon className="size-4 mx-auto text-emerald-400" /> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="p-4 text-center">
                        {feat.y1 ? <CheckIcon className="size-4 mx-auto text-primary" /> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="p-4 text-center">
                        {feat.y2 ? <CheckIcon className="size-4 mx-auto text-emerald-400" /> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="p-4 text-center">
                        {feat.cust ? <CheckIcon className="size-4 mx-auto text-cyan-400" /> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                    </tr>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Pricing, Tax & Licensing FAQ</h2>
          <p className="mt-1 text-xs text-muted-foreground">Common questions about Indian GST, offline licenses, and download access.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div key={idx} className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs font-semibold text-foreground hover:bg-muted/30"
                >
                  <span>{faq.q}</span>
                  <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs leading-relaxed text-muted-foreground border-t border-border/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
