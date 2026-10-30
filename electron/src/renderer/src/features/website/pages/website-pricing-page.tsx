import { useState } from 'react';
import { Link } from '@tanstack/react-router';
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
    const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [seatCount, setSeatCount] = useState(1);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<CheckoutPlan | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Discount calculation
  const volumeDiscountPercent = seatCount >= 10 ? 20 : seatCount >= 5 ? 10 : 0;

  const faqs = [
    {
      q: 'Can I use AlphaVoice Studio commercially on client projects?',
      a: 'Yes. Both the Pro Annual and Pro Lifetime licenses include full commercial rights to monetize synthetic speech, audiobooks, podcasts, YouTube videos, voiceovers, video games, and commercial client deliverables.',
    },
    {
      q: 'How does the Lifetime license work?',
      a: 'The Lifetime license is a single one-time payment ($299). There are no recurring fees or renewals ever. You receive permanent commercial rights and free updates across all AlphaVoice v1.x and v2.x versions.',
    },
    {
      q: 'Do license keys require an internet connection to stay active?',
      a: 'No. AlphaVoice Studio license keys are cryptographically signed offline keys. Once entered or activated, your installation validates the key 100% offline without needing to ping a central licensing server.',
    },
    {
      q: 'What is your refund policy?',
      a: 'We offer an unconditional 14-day money-back guarantee for Pro and Lifetime licenses. If AlphaVoice does not meet your studio needs or your hardware is incompatible, contact support for a full prompt refund.',
    },
  ];

  const comparisonFeatures = [
    {
      category: 'Core Neural Engines',
      features: [
        { name: 'Kokoro-82M Ultra-Fast Engine', free: true, pro: true, life: true, ent: true },
        { name: 'KittenTTS CPU Lightweight Engine', free: true, pro: true, life: true, ent: true },
        { name: 'F5-TTS Zero-Shot Cloning Engine', free: false, pro: true, life: true, ent: true },
        { name: 'CosyVoice Multilingual Engine', free: false, pro: true, life: true, ent: true },
        { name: 'WhisperX GPU Speech Dictation', free: false, pro: true, life: true, ent: true },
        { name: 'Chatterbox Conversational Engine', free: false, pro: true, life: true, ent: true },
      ],
    },
    {
      category: 'Workflows & Production',
      features: [
        { name: 'Unlimited Offline Speech Generation', free: true, pro: true, life: true, ent: true },
        { name: 'Local OpenAI-Compatible REST Server', free: true, pro: true, life: true, ent: true },
        { name: 'Commercial Rights & Monetization', free: false, pro: true, life: true, ent: true },
        { name: 'Multilingual Video Dubbing & Lip-Sync', free: false, pro: true, life: true, ent: true },
        { name: 'Multi-Speaker Audiobook Chapter Studio', free: false, pro: true, life: true, ent: true },
        { name: 'Batch Export & Multi-Worker Queues', free: false, pro: true, life: true, ent: true },
      ],
    },
    {
      category: 'Licensing & Support',
      features: [
        { name: '100% Offline Cryptographic Key Validation', free: true, pro: true, life: true, ent: true },
        { name: 'Zero Telemetry & Private Model Weights', free: true, pro: true, life: true, ent: true },
        { name: 'Community Discord Support', free: true, pro: true, life: true, ent: true },
        { name: 'Priority Developer Email & Ticket Support', free: false, pro: true, life: true, ent: true },
        { name: 'Custom Model Fine-Tuning & Private Cloud Relay', free: false, free_note: '', pro: false, life: false, ent: true },
        { name: 'Dedicated Enterprise SLA & Floating Seats', free: false, pro: false, life: false, ent: true },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <ZapIcon className="size-3.5" />
          <span>Transparent Pricing</span>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Simple, Sovereign Pricing
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed">
          No monthly character quotas. No per-word charges. Pay once or subscribe for commercial rights,
          all 40+ neural engines, and priority releases.
        </p>

        {/* Billing cycle & seat selector */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center rounded-xl border border-border/70 bg-card p-1 text-xs">
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-lg px-4 py-1.5 font-semibold transition ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual Billing (Save 20%)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-lg px-4 py-1.5 font-semibold transition ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly Billing
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Seats:</span>
            <button
              type="button"
              onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
              className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted"
            >
              <MinusIcon className="size-3" />
            </button>
            <span className="w-6 text-center font-bold text-foreground">{seatCount}</span>
            <button
              type="button"
              onClick={() => setSeatCount(Math.min(99, seatCount + 1))}
              className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted"
            >
              <PlusIcon className="size-3" />
            </button>
            {volumeDiscountPercent > 0 && (
              <span className="ml-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                {volumeDiscountPercent}% Off
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Free Plan */}
        <div className="website-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Community Free</h3>
            <p className="mt-1 text-xs text-muted-foreground">For personal exploration and developers.</p>
            <div className="mt-6">
              <span className="text-4xl font-extrabold text-foreground">$0</span>
              <span className="text-xs text-muted-foreground"> / forever</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Kokoro-82M & KittenTTS engines</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Unlimited local CPU generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Local OpenAI-compatible REST server</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Community Discord support</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 pt-4 border-t border-border/50">
            <Link
              to="/download"
              className="flex h-10 w-full items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Download Free
            </Link>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="website-card rounded-3xl p-6 flex flex-col justify-between border-primary/40 relative">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Pro Subscription</h3>
              <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">Popular</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">For creators & studios monetizing audio.</p>
            <div className="mt-6">
              <span className="text-4xl font-extrabold text-foreground">
                ${billingCycle === 'yearly' ? 99 * seatCount : 12 * seatCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {billingCycle === 'yearly' ? ' / year' : ' / month'}
              </span>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckIcon className="size-4 text-primary" />
                <span>All 40+ neural models & voice cloning</span>
              </li>
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckIcon className="size-4 text-primary" />
                <span>Full commercial monetization rights</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>WhisperX real-time GPU dictation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Multi-speaker video dubbing & audiobooks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Priority model releases and updates</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 pt-4 border-t border-border/50">
            <Button
              onClick={() =>
                setSelectedPlanForCheckout({
                  id: 'yearly',
                  name: `AlphaVoice Pro (${billingCycle === 'yearly' ? 'Annual' : 'Monthly'})`,
                  unitPrice: billingCycle === 'yearly' ? 99 : 12,
                  period: billingCycle === 'yearly' ? 'per year' : 'per month',
                  seats: seatCount,
                })
              }
              className="h-10 w-full text-xs font-semibold"
            >
              Get Pro Subscription
            </Button>
          </div>
        </div>

        {/* Lifetime Plan */}
        <div className="website-card rounded-3xl p-6 flex flex-col justify-between border-2 border-primary bg-primary/5 relative shadow-xl shadow-primary/10">
          <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
            Best Value · Pay Once
          </span>
          <div>
            <h3 className="text-lg font-bold text-foreground">Pro Lifetime</h3>
            <p className="mt-1 text-xs text-muted-foreground">Perpetual commercial license. No recurring fees.</p>
            <div className="mt-6">
              <span className="text-4xl font-extrabold text-foreground">${299 * seatCount}</span>
              <span className="text-xs text-muted-foreground"> / one-time</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 text-foreground font-semibold">
                <SparklesIcon className="size-4 text-primary" />
                <span>Everything in Pro — forever</span>
              </li>
              <li className="flex items-center gap-2 text-foreground font-semibold">
                <CheckIcon className="size-4 text-primary" />
                <span>Perpetual updates for all v1.x & v2.x releases</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Offline cryptographic key (no phone-home)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>VIP Discord badge & priority developer support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Unlimited client productions</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 pt-4 border-t border-primary/20">
            <Button
              onClick={() =>
                setSelectedPlanForCheckout({
                  id: 'lifetime',
                  name: 'AlphaVoice Pro Lifetime',
                  unitPrice: 299,
                  period: 'one-time payment',
                  seats: seatCount,
                })
              }
              className="h-10 w-full text-xs font-bold shadow-md shadow-primary/25"
            >
              Get Lifetime License
            </Button>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="website-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Enterprise</h3>
            <p className="mt-1 text-xs text-muted-foreground">For game studios, broadcast networks, & teams.</p>
            <div className="mt-6">
              <span className="text-4xl font-extrabold text-foreground">$999+</span>
              <span className="text-xs text-muted-foreground"> / volume</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2 text-foreground font-medium">
                <CheckIcon className="size-4 text-primary" />
                <span>Custom proprietary voice fine-tuning</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Floating multi-seat network licenses</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>SSO / SAML authentication support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 text-emerald-400" />
                <span>Dedicated SLA & engineering onboarding</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 pt-4 border-t border-border/50">
            <Link
              to="/contact"
              className="flex h-10 w-full items-center justify-center rounded-xl border border-border/80 bg-card text-xs font-semibold text-foreground hover:bg-muted"
            >
              Contact Enterprise
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURE COMPARISON TABLE */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Detailed Feature Comparison</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Everything included across every AlphaVoice tier.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card/60 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="p-4 font-bold text-foreground">Feature</th>
                <th className="p-4 font-bold text-foreground text-center">Community Free</th>
                <th className="p-4 font-bold text-foreground text-center">Pro Annual</th>
                <th className="p-4 font-bold text-primary text-center">Pro Lifetime</th>
                <th className="p-4 font-bold text-foreground text-center">Enterprise</th>
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
                        {feat.free ? <CheckIcon className="size-4 mx-auto text-emerald-400" /> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="p-4 text-center">
                        {feat.pro ? <CheckIcon className="size-4 mx-auto text-emerald-400" /> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="p-4 text-center">
                        {feat.life ? <CheckIcon className="size-4 mx-auto text-primary" /> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="p-4 text-center">
                        {feat.ent ? <CheckIcon className="size-4 mx-auto text-emerald-400" /> : <span className="text-muted-foreground/40">—</span>}
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
          <h2 className="text-2xl font-bold text-foreground">Pricing & Licensing FAQ</h2>
          <p className="mt-1 text-xs text-muted-foreground">Common questions about payments and licensing.</p>
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
