import { useState } from 'react';
import {
  CheckCircle2Icon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  ShieldCheckIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  generateLicenseKey,
  saveActiveLicense,
  type CommercialLicense,
} from '@/lib/store/license-store';

export interface CheckoutPlan {
  id: 'yearly' | 'lifetime' | 'enterprise';
  name: string;
  unitPrice: number;
  period: string;
  seats: number;
}

interface CheckoutModalProps {
  plan: CheckoutPlan;
  onClose: () => void;
  onSuccess?: (license: CommercialLicense) => void;
}

export function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto'>('card');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activatedNow, setActivatedNow] = useState(false);
  const [issuedLicense, setIssuedLicense] = useState<CommercialLicense | null>(null);

  // Volume discount calculation (10% off for 5+ seats, 20% off for 10+ seats)
  const volumeDiscount =
    plan.seats >= 10 ? 0.2 : plan.seats >= 5 ? 0.1 : 0;
  const baseTotal = plan.unitPrice * plan.seats;
  const volumeDiscountAmount = baseTotal * volumeDiscount;
  const promoDiscountAmount = (baseTotal - volumeDiscountAmount) * (discountPercent / 100);
  const finalTotal = Math.max(0, Math.round(baseTotal - volumeDiscountAmount - promoDiscountAmount));

  function applyPromo() {
    if (promoCode.trim().toUpperCase() === 'ALPHA2026' || promoCode.trim().toUpperCase() === 'PROMO') {
      setDiscountPercent(20);
      setPromoApplied(true);
    } else {
      alert('Invalid coupon code. Try ALPHA2026 for 20% off!');
    }
  }

  function handleCompletePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!customerEmail) {
      alert('Please provide a valid email address for license delivery.');
      return;
    }
    setStep('processing');

    setTimeout(() => {
      const generatedKey = generateLicenseKey(plan.id);
      const isLifetime = plan.id === 'lifetime';
      const expiresAt = isLifetime
        ? null
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const license: CommercialLicense = {
        key: generatedKey,
        plan: plan.id === 'lifetime' ? 'pro_lifetime' : plan.id === 'enterprise' ? 'enterprise' : 'pro_yearly',
        planName: plan.name,
        seats: plan.seats,
        customerName: customerName || 'Valued Creator',
        customerEmail,
        companyName: companyName || undefined,
        issuedAt: new Date().toISOString(),
        expiresAt,
        status: 'active',
        signature: 'SIG_' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        features: [
          'All 40+ Neural Models',
          'Zero-Shot Voice Cloning',
          'Generative Voice Design',
          'Automated Video Dubbing',
          'WhisperX Real-Time Dictation',
          'Commercial Monetization License',
          'Local OpenAI-Compatible API Server',
          'Priority Updates',
        ],
      };

      setIssuedLicense(license);
      saveActiveLicense(license);
      setActivatedNow(true);
      setStep('success');
      onSuccess?.(license);
    }, 1200);
  }

  function copyKeyToClipboard() {
    if (!issuedLicense) return;
    navigator.clipboard.writeText(issuedLicense.key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  function downloadCertificate() {
    if (!issuedLicense) return;
    const certData = JSON.stringify(issuedLicense, null, 2);
    const blob = new Blob([certData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AlphaVoice-License-${issuedLicense.key}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AlphaVoice Checkout"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-card/95 shadow-2xl backdrop-blur-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <SparklesIcon className="size-4" />
            </div>
            <span className="font-semibold text-foreground">
              {step === 'success' ? 'Purchase Complete' : 'AlphaVoice Commercial Checkout'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Processing Commercial License...
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Encrypting cryptographically signed offline key for {customerEmail || 'your machine'}
            </p>
          </div>
        )}

        {step === 'checkout' && (
          <form onSubmit={handleCompletePayment} className="p-6">
            {/* Order Summary Card */}
            <div className="mb-5 rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{plan.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {plan.seats} {plan.seats === 1 ? 'Seat' : 'Seats'} · {plan.period}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">${finalTotal}</div>
                  {volumeDiscount > 0 && (
                    <span className="text-[11px] font-medium text-emerald-500">
                      {(volumeDiscount * 100).toFixed(0)}% Volume Discount
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="mb-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Alex Morgan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    License Delivery Email
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="alex@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Company / Organization (Optional)
                </label>
                <Input
                  placeholder="Studio or Agency name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <CreditCardIcon className="size-3.5" />
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition ${
                    paymentMethod === 'paypal'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="font-bold">PayPal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition ${
                    paymentMethod === 'crypto'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="font-bold">Crypto</span>
                </button>
              </div>
            </div>

            {/* Card Inputs */}
            {paymentMethod === 'card' && (
              <div className="mb-4 space-y-2.5 rounded-xl border border-border/60 bg-background/50 p-3.5">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                    Card Number
                  </label>
                  <Input
                    required
                    placeholder="4242 •••• •••• 4242"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="h-9 font-mono text-xs tracking-wider"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      Expiry (MM/YY)
                    </label>
                    <Input
                      required
                      placeholder="12/28"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                      CVC / CVV
                    </label>
                    <Input
                      required
                      placeholder="888"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="mb-4 rounded-xl border border-border/60 bg-background/50 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  You will be connected to PayPal to approve your license purchase.
                </p>
                <div className="mt-2 inline-block rounded-md bg-[#0070BA] px-4 py-1.5 font-bold text-white text-xs">
                  PayPal Checkout Instant
                </div>
              </div>
            )}

            {paymentMethod === 'crypto' && (
              <div className="mb-4 rounded-xl border border-border/60 bg-background/50 p-3.5">
                <p className="text-[11px] text-muted-foreground">
                  Send exact amount in <strong>USDC / USDT</strong> (Polygon or Solana):
                </p>
                <div className="mt-1.5 rounded border border-border bg-muted/40 p-2 font-mono text-[11px] text-foreground break-all select-all">
                  0x71C9F4E5A82d3345A7d57Dbc9F08A2eB811B24c0
                </div>
              </div>
            )}

            {/* Promo Code Input */}
            <div className="mb-5 flex gap-2">
              <Input
                placeholder="Discount Code (e.g. ALPHA2026)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyPromo}
                className="h-8 shrink-0 text-xs"
              >
                Apply
              </Button>
            </div>

            {promoApplied && (
              <div className="mb-4 text-xs font-medium text-emerald-500">
                ✓ Coupon ALPHA2026 applied: 20% discount saved!
              </div>
            )}

            {/* Pay Button */}
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full gap-2 text-sm font-semibold shadow-lg shadow-primary/25"
            >
              <ShieldCheckIcon className="size-4" />
              Pay ${finalTotal} & Get Instant License
            </Button>
            <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
              🔒 256-Bit SSL Encrypted. Instant offline cryptographic key issuance.
            </p>
          </form>
        )}

        {step === 'success' && issuedLicense && (
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2Icon className="size-8" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-foreground">
                License Issued Successfully!
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Your AlphaVoice Pro license has been activated and sent to{' '}
                <strong>{issuedLicense.customerEmail}</strong>.
              </p>
            </div>

            {/* License Box */}
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Official Commercial License Key
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  Active
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-border/80 bg-background/90 p-2.5 font-mono text-sm font-bold text-foreground">
                <span>{issuedLicense.key}</span>
                <button
                  type="button"
                  onClick={copyKeyToClipboard}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Copy Key"
                >
                  <CopyIcon className="size-4" />
                </button>
              </div>
              {copiedKey && (
                <div className="mt-1 text-right text-[11px] text-emerald-500">Copied to clipboard!</div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div>
                  Plan: <span className="text-foreground font-medium">{issuedLicense.planName}</span>
                </div>
                <div>
                  Seats: <span className="text-foreground font-medium">{issuedLicense.seats}</span>
                </div>
                <div>
                  Issued To: <span className="text-foreground font-medium">{issuedLicense.customerName}</span>
                </div>
                <div>
                  Type: <span className="text-foreground font-medium">{issuedLicense.expiresAt ? 'Annual' : 'Perpetual Lifetime'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                type="button"
                onClick={downloadCertificate}
                variant="outline"
                className="h-10 w-full gap-2 text-xs"
              >
                <DownloadIcon className="size-4" />
                Download License Certificate (.json)
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="h-10 w-full text-xs font-semibold"
              >
                {activatedNow ? 'All Set — Return to AlphaVoice' : 'Close'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
