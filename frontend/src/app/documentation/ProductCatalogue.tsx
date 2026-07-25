'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Coffee,
  GitMerge,
  Package,
  Scale,
  Search,
  ShieldCheck,
  ArrowRight,
  Users,
  FileText,
  Layers,
  Workflow,
  Info,
} from 'lucide-react';
import {
  BAG_STATUSES,
  CATALOGUE_NAV,
  CatalogueSectionId,
  EXAMPLE_FLOW,
  GLOSSARY,
  RULES,
  SCREENS,
  VARIETIES,
  WORKFLOWS,
} from '../../content/productCatalogue';

const STATUS_STYLES = {
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  sky: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  violet: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
} as const;

function SectionHeading({
  id,
  eyebrow,
  title,
  children,
}: {
  id: CatalogueSectionId;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header id={id} className="scroll-mt-28 space-y-2 border-b border-borderToken/80 pb-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amberAccent">{eyebrow}</p>
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-50">{title}</h2>
      {children ? <div className="text-sm text-gray-400 leading-relaxed max-w-3xl">{children}</div> : null}
    </header>
  );
}

export function ProductCatalogue({ embedded = false }: { embedded?: boolean }) {
  const [activeId, setActiveId] = useState<CatalogueSectionId>('overview');
  const [glossaryFilter, setGlossaryFilter] = useState('');

  const filteredGlossary = useMemo(() => {
    const q = glossaryFilter.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter(
      (entry) => entry.term.toLowerCase().includes(q) || entry.definition.toLowerCase().includes(q)
    );
  }, [glossaryFilter]);

  useEffect(() => {
    const nodes = CATALOGUE_NAV.map((item) => document.getElementById(item.id)).filter(
      Boolean
    ) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target?.id as CatalogueSectionId | undefined;
        if (top) setActiveId(top);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.35, 0.6] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: CatalogueSectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  return (
    <div className={`animate-fadeIn ${embedded ? '' : 'max-w-6xl mx-auto'}`}>
      {/* Intro band */}
      <div className="relative overflow-hidden rounded-3xl border border-borderToken bg-gradient-to-br from-[#1a1410] via-surface to-background px-6 py-8 sm:px-10 sm:py-11 mb-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, #F59E0B 0%, transparent 42%), radial-gradient(circle at 88% 10%, #78716c 0%, transparent 35%)',
          }}
        />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amberAccent/35 bg-amberAccent/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amberAccent">
              <BookOpen className="w-3.5 h-3.5" />
              Product catalogue
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-50 leading-tight">
              Understand CoffeeTrace
              <span className="block text-amberAccent/90 font-extrabold text-2xl sm:text-3xl mt-1">
                from harvest bag to export lot
              </span>
            </h1>
            <p className="text-sm sm:text-[15px] text-gray-300 leading-relaxed">
              This guide explains what the system does, the language it uses, how coffee moves through
              merges, and how origin is proven for any lot — written for operators, reviewers, and anyone
              new to the platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            {[
              { icon: Users, label: 'Farmers' },
              { icon: Package, label: 'Bags' },
              { icon: GitMerge, label: 'Merges' },
              { icon: Scale, label: 'Attribution' },
              { icon: FileText, label: 'Certificates' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-xl border border-borderToken bg-background/50 px-3 py-2 text-gray-300"
              >
                <Icon className="w-3.5 h-3.5 text-amberAccent" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        {/* TOC */}
        <aside className="mb-8 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-500 mb-3 px-1">
            On this page
          </p>
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            {CATALOGUE_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`shrink-0 text-left rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                  activeId === item.id
                    ? 'bg-amberAccent text-gray-950'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-surfaceHover border border-transparent lg:border-borderToken/60'
                }`}
              >
                <span className="lg:hidden">{item.short}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Body */}
        <div className="space-y-16 pb-16">
          <section className="space-y-5">
            <SectionHeading id="overview" eyebrow="01 · Overview" title="What is CoffeeTrace?">
              CoffeeTrace is a coffee supply-chain traceability platform. It records smallholder harvest
              bags, lets operations merge those bags into larger composite lots across multiple tiers, and
              can still answer — for any final lot — which farmers contributed, how much weight each
              contributed, and from which regions the coffee originated.
            </SectionHeading>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {[
                {
                  icon: Layers,
                  title: 'Lineage, not just inventory',
                  text: 'Every merge writes durable parent→child links, so history survives multi-tier blending.',
                },
                {
                  icon: Scale,
                  title: 'Fair weight attribution',
                  text: 'Farmer shares are computed from contributed kilograms, not guesswork.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Safe operations',
                  text: 'Cycle checks, status locks, and unique codes keep the ledger trustworthy.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-borderToken bg-surface/70 p-4 space-y-2">
                  <item.icon className="w-4 h-4 text-amberAccent" />
                  <h3 className="font-bold text-gray-100">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading id="purpose" eyebrow="02 · Purpose" title="The problem it solves">
              In export coffee, many small harvest bags are combined again and again into warehouse lots and
              finally into export lots. Without structured lineage, buyers and auditors cannot reliably
              reconnect a finished lot to the farmers and regions that produced it.
            </SectionHeading>
            <div className="rounded-2xl border border-borderToken bg-surface/60 p-5 space-y-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gray-500">
                Typical multi-tier story
              </p>
              <ol className="space-y-3">
                {EXAMPLE_FLOW.map((step, index) => (
                  <li key={step.label} className="flex gap-3 text-sm">
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-amberAccent/15 border border-amberAccent/30 text-amberAccent text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-bold text-gray-100">{step.label}</div>
                      <p className="text-xs text-gray-400 mt-0.5">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading id="concepts" eyebrow="03 · Concepts" title="Core building blocks">
              Almost everything in CoffeeTrace is built from three ideas: farmers, bags, and merge
              relations between bags.
            </SectionHeading>
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p>
                <strong className="text-gray-100">Farmers</strong> are origin producers. Each has a unique
                farmer code, a name, and geography (region / country). Harvest bags point to exactly one
                farmer.
              </p>
              <p>
                <strong className="text-gray-100">Coffee bags</strong> are the units you track. A bag has a
                unique bag code, initial weight, current (remaining) weight, variety, status, and optional
                quality signals such as moisture percent and quality score.
              </p>
              <p>
                <strong className="text-gray-100">Merge relations</strong> connect source bags (parents) to a
                newly created composite (child), storing how many kilograms moved along that edge. That graph
                is what makes recursive tracing possible.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mr-1 self-center">
                  Varieties
                </span>
                {VARIETIES.map((v) => (
                  <span
                    key={v}
                    className="rounded-lg border border-borderToken bg-background/70 px-2.5 py-1 text-[11px] font-mono font-bold text-amberAccent"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading id="lifecycle" eyebrow="04 · Lifecycle" title="Bag statuses explained">
              Status tells you what you can still do with a bag. There are four statuses in the system —
              there is no separate “ACTIVE” status; “active storage” on the dashboard simply means bags
              currently in <span className="font-mono text-sky-300">IN_STORAGE</span>.
            </SectionHeading>
            <div className="space-y-3">
              {BAG_STATUSES.map((item) => (
                <div
                  key={item.status}
                  className="rounded-2xl border border-borderToken bg-surface/50 p-4 flex flex-col sm:flex-row sm:items-start gap-3"
                >
                  <span
                    className={`shrink-0 inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-mono font-extrabold ${STATUS_STYLES[item.color]}`}
                  >
                    {item.status}
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed">{item.meaning}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading id="merging" eyebrow="05 · Merging" title="How bag merges work">
              Merging is how smaller bags become warehouse and export lots. The platform always creates a
              <em className="text-gray-100 not-italic"> new</em> target bag code for the result — it does not
              silently overwrite an existing lot.
            </SectionHeading>
            <ul className="space-y-3 text-sm text-gray-300">
              {[
                'Select at least two eligible sources (available weight > 0, not fully MERGED, not EXPORTED).',
                'For each source, use the full remaining weight or specify a partial weightUsedKg.',
                'Provide a unique targetBagCode. The child is created as IN_STORAGE with farmerId empty.',
                'Each contribution writes a merge relation (parent → child + weight used).',
                'Sources drop to MERGED when fully consumed, or stay IN_STORAGE with leftover kilograms.',
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <ArrowRight className="w-4 h-4 text-amberAccent shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-5">
            <SectionHeading id="traceability" eyebrow="06 · Traceability" title="Backward and forward lineage">
              Traceability answers two complementary questions from any bag in the graph.
            </SectionHeading>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-borderToken bg-surface/70 p-5 space-y-2">
                <h3 className="text-sm font-bold text-amberAccent flex items-center gap-2">
                  <GitMerge className="w-4 h-4" />
                  Backward (origin)
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  From a lot, walk toward ancestor bags until leaf harvest bags and their farmers. This is
                  the view used for origin proof and attribution.
                </p>
              </div>
              <div className="rounded-2xl border border-borderToken bg-surface/70 p-5 space-y-2">
                <h3 className="text-sm font-bold text-sky-300 flex items-center gap-2">
                  <Workflow className="w-4 h-4" />
                  Forward (downstream)
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  From a bag, walk toward descendant composites to see which later lots received its coffee
                  and how much weight flowed onward.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Traceability Graph page visualizes these relationships and can replay the merge sequence
              so reviewers can follow the story step by step.
            </p>
          </section>

          <section className="space-y-5">
            <SectionHeading id="attribution" eyebrow="07 · Attribution" title="How farmer percentages are calculated">
              Attribution is mass-based. For a selected lot, the system aggregates contributed kilograms that
              ultimately come from each farmer’s harvest bags, then expresses each share as a percentage of
              that lot’s initial weight.
            </SectionHeading>
            <div className="rounded-2xl border border-amberAccent/30 bg-amberAccent/5 p-5 font-mono text-xs text-amber-100/90 space-y-2">
              <p>contributionPercentage = (contributedWeightKg ÷ lot.initialWeightKg) × 100</p>
              <p className="text-gray-400 font-sans text-[12px] leading-relaxed pt-1">
                Results are rounded to two decimal places and typically listed highest contribution first,
                alongside farmer code, name, region, and the original harvest bag reference where applicable.
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading id="certificates" eyebrow="08 · Certificates" title="Origin export certificates">
              Certificates package a lot’s identity and farmer attributions into a printable document for
              demos, audits, and buyer conversations.
            </SectionHeading>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                'Lot identity: code, weight, variety, optional moisture/quality',
                'Farmer attribution table with regions',
                'QR code linking to the live trace page for that lot',
                'SHA-256 fingerprint of the certificate payload for integrity checking',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <FileText className="w-4 h-4 text-amberAccent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <SectionHeading id="workflows" eyebrow="09 · Workflows" title="Day-to-day operating workflows">
              These are the main jobs users perform in the product.
            </SectionHeading>
            <div className="space-y-5">
              {WORKFLOWS.map((flow, index) => (
                <div key={flow.title} className="rounded-2xl border border-borderToken bg-surface/40 p-5">
                  <h3 className="text-sm font-black text-gray-100 mb-3 flex items-center gap-2">
                    <span className="text-amberAccent font-mono text-xs">{String(index + 1).padStart(2, '0')}</span>
                    {flow.title}
                  </h3>
                  <ol className="space-y-2">
                    {flow.steps.map((step, stepIndex) => (
                      <li key={step} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                        <span className="text-[11px] font-mono text-gray-500 mt-0.5">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading id="screens" eyebrow="10 · Screens" title="Where to find things in the app">
              A quick map of the product surfaces.
            </SectionHeading>
            <div className="divide-y divide-borderToken border border-borderToken rounded-2xl overflow-hidden bg-surface/40">
              {SCREENS.map((screen) => (
                <div key={screen.name} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                  <div className="sm:w-40 shrink-0">
                    {screen.href ? (
                      <Link
                        href={screen.href}
                        className="text-sm font-bold text-amberAccent hover:text-amber-300 transition-colors"
                      >
                        {screen.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-gray-100">{screen.name}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{screen.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading id="rules" eyebrow="11 · Rules" title="System rules you should know">
              These constraints are enforced by the API and reflected in the UI.
            </SectionHeading>
            <div className="space-y-3">
              {RULES.map((rule) => (
                <div key={rule.title} className="rounded-2xl border border-borderToken/90 bg-background/40 p-4">
                  <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amberAccent" />
                    {rule.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mt-1.5 pl-6">{rule.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionHeading id="glossary" eyebrow="12 · Glossary" title="Terms used throughout CoffeeTrace">
              Search or skim the dictionary of product language.
            </SectionHeading>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={glossaryFilter}
                onChange={(e) => setGlossaryFilter(e.target.value)}
                placeholder="Filter terms — e.g. attribution, MERGED, DAG…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-borderToken text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-amberAccent/50"
              />
            </div>
            <dl className="space-y-0 divide-y divide-borderToken border border-borderToken rounded-2xl overflow-hidden">
              {filteredGlossary.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">No terms match that filter.</div>
              ) : (
                filteredGlossary.map((entry) => (
                  <div key={entry.term} className="grid sm:grid-cols-[200px_minmax(0,1fr)] gap-2 sm:gap-6 p-4 sm:p-5 bg-surface/30">
                    <dt className="text-sm font-bold text-amberAccent">{entry.term}</dt>
                    <dd className="text-sm text-gray-300 leading-relaxed">{entry.definition}</dd>
                  </div>
                ))
              )}
            </dl>
          </section>

          <section className="space-y-5">
            <SectionHeading id="stack" eyebrow="13 · Stack" title="Technical overview (brief)">
              Useful context for engineers and technical reviewers — not required to operate the product.
            </SectionHeading>
            <div className="rounded-2xl border border-borderToken bg-surface/50 p-5 space-y-3 text-sm text-gray-300 leading-relaxed">
              <p className="flex items-start gap-2">
                <Coffee className="w-4 h-4 text-amberAccent shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-100">Frontend:</strong> Next.js App Router, TypeScript,
                  Tailwind CSS, TanStack Query, React Flow for lineage graphs.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Coffee className="w-4 h-4 text-amberAccent shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-100">Backend:</strong> Express + Zod validation + Prisma ORM on
                  PostgreSQL. Traceability walks the merge graph with cycle-safe BFS.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Coffee className="w-4 h-4 text-amberAccent shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-100">API docs:</strong> Interactive Swagger is available on the
                  API host at <span className="font-mono text-amberAccent/90">/docs</span> (separate from this
                  product catalogue).
                </span>
              </p>
            </div>
            {!embedded ? (
              <Link
                href="/settings?tab=documentation"
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-amberAccent transition-colors"
              >
                Also available in Settings → Documentation
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/documentation"
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-amberAccent transition-colors"
              >
                Open full-page catalogue
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
