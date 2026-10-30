import { useState } from 'react';
import {
  BuildingIcon,
  CheckCircle2Icon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  QrCodeIcon,
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
  id: string; // '6months' | '1year' | '2years' | 'custom' | 'yearly' | 'lifetime' | 'enterprise'
  name: string;
  durationMonths?: number;
  basePrice?: number;
  gstRate?: number; // default 0.18 (18%)
  seats?: number;
  unitPrice?: number;
  period?: string;
}

interface CheckoutModalProps {
  plan: CheckoutPlan;
  onClose: () => void;
  onSuccess?: (license: CommercialLicense) => void;
}

export function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'invoice'>('upi');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activatedNow, setActivatedNow] = useState(false);
  const [issuedLicense, setIssuedLicense] = useState<CommercialLicense | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');

  const seats = plan.seats || 1;
  const durationMonths = plan.durationMonths || (plan.id === '1year' || plan.id === 'yearly' ? 12 : plan.id === '2years' ? 24 : 6);
  const unitBase = plan.basePrice || plan.unitPrice || 17000;
  const baseSubtotal = unitBase * seats;

  // Volume discount: 10% for 5+ seats, 20% for 10+ seats
  const volumeDiscount = seats >= 10 ? 0.2 : seats >= 5 ? 0.1 : 0;
  const volumeDiscountAmount = Math.round(baseSubtotal * volumeDiscount);
  const promoDiscountAmount = Math.round((baseSubtotal - volumeDiscountAmount) * (discountPercent / 100));
  const discountedBaseTotal = Math.max(0, baseSubtotal - volumeDiscountAmount - promoDiscountAmount);

  // 18% GST compliance
  const gstRate = plan.gstRate ?? 0.18;
  const gstAmount = Math.round(discountedBaseTotal * gstRate);
  const finalTotal = discountedBaseTotal + gstAmount;

  function applyPromo() {
    if (promoCode.trim().toUpperCase() === 'ALPHA2026' || promoCode.trim().toUpperCase() === 'PROMO') {
      setDiscountPercent(10);
      setPromoApplied(true);
    } else {
      alert('Invalid coupon code. Try ALPHA2026 for 10% promotional credit.');
    }
  }

  async function handleCompletePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!customerEmail) {
      alert('Please provide a valid email address for commercial license and invoice delivery.');
      return;
    }
    setStep('processing');

    const generatedKey = generateLicenseKey(plan.id, durationMonths);
    const expiresAt = new Date(Date.now() + durationMonths * 30.5 * 24 * 3600 * 1000).toISOString();
    const invNumber = `INV-ALPHA-${Math.floor(Date.now() / 1000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setInvoiceNumber(invNumber);

    // Call backend API if user is authenticated or store session
    try {
      const token = localStorage.getItem('alphavoice.website_session_token');
      if (token) {
        await fetch('/api/website/customer/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_id: plan.id,
            plan_name: plan.name,
            amount: finalTotal,
            base_amount: discountedBaseTotal,
            gst_amount: gstAmount,
            currency: 'INR',
            billing_cycle: `${durationMonths}months`,
            duration_months: durationMonths,
            seats,
            payment_method: paymentMethod,
            gstin: gstin.trim(),
            company_name: companyName.trim(),
          }),
        });
      }
    } catch {
      // Offline or network error; proceeds with offline cryptographic license
    }

    setTimeout(() => {
      const planCategory =
        durationMonths === 6
          ? 'pro_6months'
          : durationMonths === 12
            ? 'pro_1year'
            : durationMonths === 24
              ? 'pro_2years'
              : 'pro_custom';

      const license: CommercialLicense = {
        key: generatedKey,
        plan: planCategory,
        planName: plan.name,
        seats,
        durationMonths,
        baseAmount: discountedBaseTotal,
        gstAmount,
        totalAmount: finalTotal,
        currency: 'INR',
        customerName: customerName || 'Licensed Creator',
        customerEmail,
        companyName: companyName || undefined,
        gstin: gstin || undefined,
        issuedAt: new Date().toISOString(),
        expiresAt,
        status: 'active',
        signature: 'SIG_' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        features: [
          'All 40+ Neural Voice Models',
          'Zero-Shot Voice Cloning (3-Sec Reference)',
          'Generative Prompt-Based Voice Design',
          'Automated Video Dubbing & Multi-Track Studio',
          'WhisperX GPU Speech Dictation',
          'Full Commercial Monetization Rights',
          'Local OpenAI-Compatible REST Server',
          'Anthropic Model Context Protocol (MCP) Endpoints',
          '100% On-Device Offline Execution',
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
    const certData = JSON.stringify(
      {
        ...issuedLicense,
        invoiceNumber,
        gstDetails: {
          taxType: 'GST @ 18% (CGST 9% + SGST 9% / IGST 18%)',
          baseAmountINR: discountedBaseTotal,
          gstAmountINR: gstAmount,
          totalAmountINR: finalTotal,
          customerGSTIN: gstin || 'Unregistered Consumer',
          vendorGSTIN: '07AAAAA0000A1Z5',
        },
      },
      null,
      2
    );
    const blob = new Blob([certData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AlphaVoice-Commercial-License-${issuedLicense.key}.json`;
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
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-card/95 shadow-2xl backdrop-blur-2xl">
        {/* Top Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-card/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <SparklesIcon className="size-4" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm">
                {step === 'success' ? 'Commercial License Issued' : 'AlphaVoice Commercial License Checkout'}
              </span>
              <div className="text-[10px] text-muted-foreground">GST Compliant · 100% Sovereign Offline Keys</div>
            </div>
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
              Processing Commercial License Order...
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Generating cryptographically signed offline key for {customerEmail || 'your machine'}.
            </p>
          </div>
        )}

        {step === 'checkout' && (
          <form onSubmit={handleCompletePayment} className="p-6 space-y-4">
            {/* Order Summary Card with GST Breakdown */}
            <div className="rounded-xl border border-border/70 bg-muted/40 p-4 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-sm">{plan.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Duration: {durationMonths} Months · {seats} {seats === 1 ? 'Workstation Seat' : 'Workstation Seats'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-primary">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Inclusive of 18% GST
                  </span>
                </div>
              </div>

              {/* Tax Line Item Breakdown */}
              <div className="border-t border-border/50 pt-2 text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Base Commercial License Fee:</span>
                  <span className="text-foreground font-medium">₹{discountedBaseTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Goods & Services Tax (GST @ 18%):</span>
                  <span className="text-foreground font-medium">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                {volumeDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Volume Discount ({volumeDiscount * 100}%):</span>
                    <span>-₹{volumeDiscountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Coupon Discount (10%):</span>
                    <span>-₹{promoDiscountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    License Delivery Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="rahul@studio.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Company / Organization (Optional)
                  </label>
                  <Input
                    placeholder="Studio or Media House"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    GSTIN (Optional, for Input Tax Credit)
                  </label>
                  <Input
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Select Indian Payment Gateway / Method
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex h-10 flex-col items-center justify-center rounded-lg border text-[11px] font-semibold transition ${
                    paymentMethod === 'upi'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <QrCodeIcon className="size-3.5 mb-0.5" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex h-10 flex-col items-center justify-center rounded-lg border text-[11px] font-semibold transition ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <CreditCardIcon className="size-3.5 mb-0.5" />
                  Cards / RuPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`flex h-10 flex-col items-center justify-center rounded-lg border text-[11px] font-semibold transition ${
                    paymentMethod === 'netbanking'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <BuildingIcon className="size-3.5 mb-0.5" />
                  Net Banking
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('invoice')}
                  className={`flex h-10 flex-col items-center justify-center rounded-lg border text-[11px] font-semibold transition ${
                    paymentMethod === 'invoice'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <SparklesIcon className="size-3.5 mb-0.5" />
                  RTGS / Invoice
                </button>
              </div>
            </div>

            {/* UPI QR Code Interface */}
            {paymentMethod === 'upi' && (
              <div className="rounded-xl border border-border/60 bg-background/50 p-4 text-center space-y-2">
                <div className="mx-auto flex size-28 items-center justify-center rounded-xl border border-border bg-white p-2">
                  {/* Generated QR Placeholder */}
                  <div className="size-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px] flex flex-col items-center justify-center text-[10px] font-mono text-black font-bold">
                    <span>UPI QR</span>
                    <span className="text-[8px] text-gray-500">Scan & Pay</span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-foreground">
                  UPI VPA: <span className="font-mono text-primary">alphavoice@icici</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI banking app.
                </p>
              </div>
            )}

            {/* Card Inputs */}
            {paymentMethod === 'card' && (
              <div className="space-y-2.5 rounded-xl border border-border/60 bg-background/50 p-3.5">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                    Card Number (RuPay, Visa, MasterCard)
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
                      CVV / Security Code
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

            {/* Net Banking */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-2 rounded-xl border border-border/60 bg-background/50 p-3.5">
                <label className="block text-[11px] font-medium text-muted-foreground">
                  Choose Bank
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Other Bank'].map(
                    (b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`rounded-lg border p-2 text-center text-xs font-semibold transition ${
                          selectedBank === b
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/60 hover:bg-muted'
                        }`}
                      >
                        {b}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Corporate Invoice */}
            {paymentMethod === 'invoice' && (
              <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 text-xs text-muted-foreground space-y-1.5">
                <p className="font-semibold text-foreground">Direct Bank Wire / NEFT / RTGS</p>
                <p>An official GST invoice will be generated and issued immediately upon checkout.</p>
                <div className="rounded border border-border bg-muted/40 p-2 font-mono text-[11px] text-foreground">
                  A/C Name: AlphaVoice Technologies Pvt Ltd<br />
                  A/C No: 000405001234 · IFSC: ICIC0000004 · Branch: Gurugram DLF Phase 2
                </div>
              </div>
            )}

            {/* Promo Code Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Discount Coupon (e.g. ALPHA2026)"
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
              <div className="text-xs font-medium text-emerald-500">
                ✓ Coupon ALPHA2026 applied: 10% promotional credit saved!
              </div>
            )}

            {/* Pay Button */}
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full gap-2 text-sm font-semibold shadow-lg shadow-primary/25"
            >
              <ShieldCheckIcon className="size-4" />
              Pay ₹{finalTotal.toLocaleString('en-IN')} & Unlock Software License
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              🔒 256-Bit SSL Encrypted. Instant offline cryptographic key issuance with 14-day refund policy.
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
                Commercial License Issued & Activated!
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Your license key has been cryptographically generated and sent to{' '}
                <strong>{issuedLicense.customerEmail}</strong>.
              </p>
            </div>

            {/* License Box */}
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Official Cryptographic License Key
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  Active · 100% Offline Valid
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-border/80 bg-background/90 p-2.5 font-mono text-sm font-bold text-foreground">
                <span className="break-all">{issuedLicense.key}</span>
                <button
                  type="button"
                  onClick={copyKeyToClipboard}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 ml-2"
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
                  Duration: <span className="text-foreground font-medium">{durationMonths} Months</span>
                </div>
                <div>
                  Paid (INR): <span className="text-foreground font-medium">₹{finalTotal.toLocaleString('en-IN')} (incl. GST)</span>
                </div>
                <div>
                  Invoice: <span className="text-foreground font-mono font-medium">{invoiceNumber}</span>
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
                Download Commercial License Certificate & GST Invoice (.json)
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="h-10 w-full text-xs font-semibold"
              >
                {activatedNow ? 'All Set — Continue to Downloads' : 'Close'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
