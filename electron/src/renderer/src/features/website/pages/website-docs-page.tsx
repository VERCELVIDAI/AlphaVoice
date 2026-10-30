import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ChevronRightIcon,
  CopyIcon,
  SearchIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DocSection {
  id: string;
  category: string;
  title: string;
  content: string;
  codeSnippet?: string;
}

export function WebsiteDocsPage() {
  const [activeDocId, setActiveDocId] = useState<string>('quickstart');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const docSections: DocSection[] = [
    {
      id: 'quickstart',
      category: 'Getting Started',
      title: 'Quickstart & Installation',
      content: `Welcome to the official AlphaVoice Studio documentation. AlphaVoice Studio is designed to run 100% on your own hardware without uploading audio to external cloud servers.

To get started:
1. Download the installer for your platform from the Download Center.
2. Complete the installation wizard.
3. Launch AlphaVoice Studio. The internal FastAPI engine and electron shell will start automatically.
4. On first run, AlphaVoice verifies your GPU acceleration (NVIDIA CUDA, Apple Metal, or AMD DirectML) and provisions local model caches.`,
      codeSnippet: `# Test local API server connectivity
curl http://localhost:3900/system/info`,
    },
    {
      id: 'hardware',
      category: 'Getting Started',
      title: 'Hardware Acceleration & GPUs',
      content: `AlphaVoice dynamically detects available hardware compute devices:
- **Windows:** Supports NVIDIA GPUs via CUDA 12.x or AMD Radeon GPUs via DirectML. If no GPU is present, it automatically uses quantized CPU inference.
- **macOS:** Native Apple Silicon execution via Metal Performance Shaders (MPS) across M1, M2, M3, and M4 chips.
- **Linux:** Full CUDA container and ROCm acceleration.

You can verify and select compute backends in Settings → Performance.`,
    },
    {
      id: 'cloning-guide',
      category: 'User Tutorials',
      title: 'Voice Cloning Guide',
      content: `Zero-shot voice cloning enables generating new speech that replicates any voice using a short reference audio clip.

Best practices for optimal cloning:
1. Provide 3 to 10 seconds of clear, uncompressed speech (WAV or clean MP3).
2. Avoid clips with background music, echo, or overlapping voices.
3. Transcribe or type the exact words spoken in the reference audio inside the "Reference Text" box for maximum acoustic alignment.
4. Click "Synthesize" to generate speech with the cloned timbre.`,
      codeSnippet: `# Clone voice via local REST endpoint
curl -X POST http://localhost:3900/api/generation \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello world", "profile_id": "my_cloned_voice"}'`,
    },
    {
      id: 'dubbing-pipeline',
      category: 'User Tutorials',
      title: 'Video Dubbing & Subtitling',
      content: `The AlphaVoice Dubbing studio enables importing existing video files, extracting dialogue, translating the speech into other languages, and regenerating audio aligned to the original video.

Steps:
1. Open Dubbing from the sidebar navigation.
2. Drag and drop your source video (MP4/MKV).
3. Select your target language (e.g. Spanish, French, Japanese, German).
4. Review generated subtitles and voice assignments.
5. Click "Render & Export Dubbed Video".`,
    },
    {
      id: 'api-reference',
      category: 'Developer API',
      title: 'OpenAI-Compatible REST API',
      content: `AlphaVoice Studio provides a drop-in local OpenAI-compatible audio API at \`http://localhost:3900/v1\`. You can use the official OpenAI Python or TypeScript SDK by pointing \`base_url\` to your local instance.`,
      codeSnippet: `from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3900/v1",
    api_key="local-alphavoice-key"
)

response = client.audio.speech.create(
    model="kokoro",
    voice="alpha-host",
    input="AlphaVoice runs 100% locally on your machine."
)

response.stream_to_file("speech.mp3")`,
    },
    {
      id: 'mcp-setup',
      category: 'Developer API',
      title: 'Anthropic Model Context Protocol (MCP)',
      content: `Connect local AI coding assistants like Claude Code and Cursor to AlphaVoice Studio via the Model Context Protocol.

Add the following configuration to your Claude Desktop or Cursor MCP config (\`claude_desktop_config.json\`):`,
      codeSnippet: `{
  "mcpServers": {
    "alphavoice": {
      "command": "python",
      "args": ["-m", "backend.mcp_server"],
      "env": {
        "ALPHAVOICE_PORT": "3900"
      }
    }
  }
}`,
    },
    {
      id: 'troubleshooting',
      category: 'Troubleshooting',
      title: 'Troubleshooting & FAQs',
      content: `Common issues and resolutions:
- **Port 3900 already in use:** AlphaVoice defaults to port 3900. If another process is using this port, set the environment variable \`ALPHAVOICE_BACKEND_PORT=3905\` before launching.
- **CUDA Out of Memory:** If you have less than 6GB VRAM, switch the active engine in Settings → Models to Kokoro or KittenTTS, which are optimized for ultra-low memory and CPU inference.
- **Microphone access blocked:** On macOS, ensure Terminal or AlphaVoice has Microphone permissions in System Settings → Privacy & Security.`,
    },
  ];

  const filteredDocs = docSections.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentDoc = docSections.find((d) => d.id === activeDocId) || docSections[0];

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  // Group by category
  const categories = Array.from(new Set(docSections.map((d) => d.category)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Sidebar Docs Navigation */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="space-y-6">
            {categories.map((cat) => {
              const catDocs = filteredDocs.filter((d) => d.category === cat);
              if (catDocs.length === 0) return null;
              return (
                <div key={cat} className="space-y-1">
                  <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </h3>
                  <div className="space-y-0.5">
                    {catDocs.map((doc) => {
                      const isActive = activeDocId === doc.id;
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setActiveDocId(doc.id)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                            isActive
                              ? 'bg-primary/15 text-primary font-bold'
                              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                          }`}
                        >
                          <span>{doc.title}</span>
                          {isActive && <ChevronRightIcon className="size-3 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Documentation Reader */}
        <div className="lg:col-span-9 space-y-8">
          <div className="website-card rounded-3xl p-8 sm:p-12 shadow-xl">
            <div className="border-b border-border/50 pb-4">
              <span className="text-xs font-semibold text-primary">{currentDoc.category}</span>
              <h1 className="mt-1 text-3xl font-extrabold text-foreground sm:text-4xl">
                {currentDoc.title}
              </h1>
            </div>

            <div className="mt-6 font-sans text-sm leading-relaxed text-muted-foreground whitespace-pre-line space-y-4">
              {currentDoc.content}
            </div>

            {currentDoc.codeSnippet && (
              <div className="mt-8 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Example Snippet</span>
                  <button
                    type="button"
                    onClick={() => copyCode(currentDoc.codeSnippet!)}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <CopyIcon className="size-3" />
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-2xl border border-border/70 bg-black/60 p-4 font-mono text-xs text-emerald-400">
                  <code>{currentDoc.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Docs Help Banner */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Need additional help or custom guidance?</h4>
              <p className="text-xs text-muted-foreground">
                Our engineering team and Discord community are available 24/7.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-card border border-border px-4 text-xs font-semibold text-foreground hover:bg-muted shrink-0"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
