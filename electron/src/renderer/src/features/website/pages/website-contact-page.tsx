import { useState, type FormEvent } from 'react';
import {
  MailIcon,
  PhoneIcon,
  SendIcon,
  CheckCircle2Icon,
  HeadphonesIcon,
  Building2Icon,
  HelpCircleIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function WebsiteContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Commercial License Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/website/support/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) {
        throw new Error('Failed to submit message. Please try again.');
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <HeadphonesIcon className="size-3.5" />
          <span>Support & Enterprise Desk</span>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Get in Touch with AlphaVoice
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base leading-relaxed">
          Need licensing assistance, custom duration quotes, or hardware deployment guidance?
          Our engineering team responds promptly within 12 business hours.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
        {/* Contact Form */}
        <div className="website-card rounded-3xl p-8 sm:p-10 border-primary/20">
          <h2 className="text-xl font-bold text-foreground">Send an Official Inquiry</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Directly logged into our priority customer support ticketing system.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
              <CheckCircle2Icon className="mx-auto size-10 text-emerald-400" />
              <h3 className="font-bold text-foreground text-sm">Inquiry Received Successfully</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Thank you, <strong className="text-foreground">{name}</strong>. A support ticket has been dispatched to your email (<strong className="text-foreground">{email}</strong>). Our technical team will follow up shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {errorMsg && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Your Name *</label>
                  <Input
                    required
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Email Address *</label>
                  <Input
                    required
                    type="email"
                    placeholder="alex@studio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Inquiry Topic *</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Commercial License Inquiry">Commercial License (6 Mo / 1 Yr / 2 Yr)</option>
                  <option value="Custom Duration License Quote">Custom Duration License Quote</option>
                  <option value="Hardware Acceleration & GPU Setup">Hardware Acceleration (CUDA / ROCm)</option>
                  <option value="GST Invoice / Tax Exemption">GST Invoice & Input Tax Credit</option>
                  <option value="Enterprise Multi-Seat Deployment">Enterprise Multi-Seat Deployment</option>
                  <option value="Technical Support & Troubleshooting">Technical Support & Troubleshooting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Your Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Detail your requirements, timeline, or hardware environment..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-10 text-xs font-semibold gap-2">
                {submitting ? 'Submitting...' : 'Submit Official Inquiry'}
                <SendIcon className="size-3.5" />
              </Button>
            </form>
          )}
        </div>

        {/* Corporate Information */}
        <div className="space-y-6">
          <div className="website-card rounded-3xl p-8 space-y-6">
            <h2 className="text-xl font-bold text-foreground">Corporate Headquarters</h2>
            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Building2Icon className="size-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-xs">AlphaVoice Technologies Pvt. Ltd.</h3>
                  <p>Cyber City Commercial Towers, Sector 24, DLF Phase 3</p>
                  <p>Gurugram, National Capital Region (Delhi NCR), India</p>
                  <p className="mt-1 font-mono text-[11px] text-primary">GSTIN: 07AAAAA0000A1Z5</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <MailIcon className="size-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-xs">Direct Support & Licensing Emails</h3>
                  <p>Commercial Licensing: <a href="mailto:licensing@alphavoice.studio" className="text-foreground hover:underline">licensing@alphavoice.studio</a></p>
                  <p>Technical & API Support: <a href="mailto:support@alphavoice.studio" className="text-foreground hover:underline">support@alphavoice.studio</a></p>
                  <p>Billing & GST Desk: <a href="mailto:billing@alphavoice.studio" className="text-foreground hover:underline">billing@alphavoice.studio</a></p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                  <PhoneIcon className="size-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-xs">Customer Service Desk</h3>
                  <p>Phone: +91 11 4050 9200 (Monday – Friday, 9:00 AM – 6:30 PM IST)</p>
                  <p>Enterprise Dedicated SLA: 24/7 Priority Emergency Channel</p>
                </div>
              </div>
            </div>
          </div>

          <div className="website-card rounded-3xl p-6 bg-muted/20 border-border/70 space-y-3">
            <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
              <HelpCircleIcon className="size-4 text-primary" />
              Frequently Asked Support Questions
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Looking for installation guides or API code samples? Check our comprehensive online documentation at <a href="/docs" className="text-primary hover:underline">Documentation</a> or review your commercial license keys in the <a href="/account" className="text-primary hover:underline">Customer Portal</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
