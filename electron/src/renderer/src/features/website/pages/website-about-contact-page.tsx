import { useState } from 'react';
import {
  CheckCircle2Icon,
  Code2Icon,
  MailIcon,
  MessageSquareIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function WebsiteAboutContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

      const data = await res.json();
      setTicketId(data.ticket_id || 'TICKET_RECEIVED');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-20">
      {/* ABOUT SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <SparklesIcon className="size-3.5" />
          <span>Our Mission</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Sovereign Voice Intelligence for Everyone
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          AlphaVoice Studio was created on a single uncompromising principle: powerful generative voice AI
          should belong to the creator, not locked behind expensive cloud paywalls or surveillance telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="website-card rounded-2xl p-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheckIcon className="size-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">100% On-Device Privacy</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Your voice is your biological identity. AlphaVoice processes speech entirely on your local GPU
            and CPU. No audio data ever leaves your computer.
          </p>
        </div>

        <div className="website-card rounded-2xl p-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
            <SparklesIcon className="size-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">Zero Subscription Fatigue</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Forget recurring per-character and per-minute credit meters. Run unlimited synthesis, cloning,
            and dubbing as long as your hardware has power.
          </p>
        </div>

        <div className="website-card rounded-2xl p-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
            <MessageSquareIcon className="size-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">Open Ecosystem</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Built with modern open neural architectures (Kokoro, KittenTTS, F5-TTS, WhisperX). Seamless
            OpenAI API and Model Context Protocol integration.
          </p>
        </div>
      </div>

      {/* CONTACT & SUPPORT FORM */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Get in Touch with Our Team</h2>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
              Have questions about enterprise deployment, volume licensing, custom model fine-tuning, or
              need technical assistance? Send us a message and we will respond within 24 hours.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MailIcon className="size-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-foreground">Direct Email</div>
                <div className="text-muted-foreground">support@alphavoice.studio</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Code2Icon className="size-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-foreground">Open Source Repository</div>
                <a
                  href="https://github.com/alphavoice/AlphaVoice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  github.com/alphavoice/AlphaVoice
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="website-card rounded-3xl p-8 lg:col-span-7 shadow-xl">
          {ticketId ? (
            <div className="text-center py-8 space-y-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                <CheckCircle2Icon className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Inquiry Received!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Your support ticket has been created and assigned ticket ID:{' '}
                <strong className="font-mono text-foreground">{ticketId}</strong>. A support engineer will review your inquiry shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTicketId(null)}
                className="mt-4 text-xs"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-foreground">Send a Message</h3>

              {errorMsg && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Your Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Subject
                </label>
                <Input
                  required
                  placeholder="e.g. Enterprise inquiry, feature request, or technical question"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Message
                </label>
                <Textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-10 w-full gap-2 text-xs font-semibold shadow-md shadow-primary/20"
              >
                <SendIcon className="size-3.5" />
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
