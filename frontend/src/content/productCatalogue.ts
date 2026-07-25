export type CatalogueSectionId =
  | 'overview'
  | 'purpose'
  | 'concepts'
  | 'lifecycle'
  | 'merging'
  | 'traceability'
  | 'attribution'
  | 'certificates'
  | 'workflows'
  | 'screens'
  | 'rules'
  | 'glossary'
  | 'stack';

export type CatalogueNavItem = {
  id: CatalogueSectionId;
  label: string;
  short: string;
};

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export type StatusEntry = {
  status: string;
  meaning: string;
  color: 'amber' | 'sky' | 'violet' | 'emerald';
};

export const CATALOGUE_NAV: CatalogueNavItem[] = [
  { id: 'overview', label: 'What is CoffeeTrace?', short: 'Overview' },
  { id: 'purpose', label: 'Purpose & problem', short: 'Purpose' },
  { id: 'concepts', label: 'Core building blocks', short: 'Concepts' },
  { id: 'lifecycle', label: 'Bag lifecycle', short: 'Lifecycle' },
  { id: 'merging', label: 'How merging works', short: 'Merging' },
  { id: 'traceability', label: 'Traceability', short: 'Trace' },
  { id: 'attribution', label: 'Farmer attribution', short: 'Attribution' },
  { id: 'certificates', label: 'Origin certificates', short: 'Certificates' },
  { id: 'workflows', label: 'Day-to-day workflows', short: 'Workflows' },
  { id: 'screens', label: 'Where to find things', short: 'Screens' },
  { id: 'rules', label: 'System rules', short: 'Rules' },
  { id: 'glossary', label: 'Glossary A-Z', short: 'Glossary' },
  { id: 'stack', label: 'Technical overview', short: 'Stack' },
];

export const BAG_STATUSES: StatusEntry[] = [
  {
    status: 'HARVESTED',
    meaning:
      'A newly logged harvest bag tied to one farmer. Weight starts equal to the initial harvest weight.',
    color: 'amber',
  },
  {
    status: 'IN_STORAGE',
    meaning:
      'Coffee available for further use. Composite merge targets are created in this state. Source bags that still have leftover weight after a partial merge also become IN_STORAGE.',
    color: 'sky',
  },
  {
    status: 'MERGED',
    meaning:
      'A source bag that has been fully consumed into one or more child lots (current weight is 0). It cannot be merged again.',
    color: 'violet',
  },
  {
    status: 'EXPORTED',
    meaning: 'A terminal lot that has left the warehouse workflow. Exported bags cannot be used as merge sources.',
    color: 'emerald',
  },
];

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Attribution',
    definition:
      'The calculated share of a lot’s weight that traces back to each contributing farmer, shown in kilograms and as a percentage of the lot’s initial weight.',
  },
  {
    term: 'Bag / Coffee bag',
    definition:
      'A tracked unit of coffee with a unique bag code, weights, variety, status, and optional moisture/quality fields. Harvest bags belong to one farmer; composite lots do not.',
  },
  {
    term: 'Bag code',
    definition:
      'Human-readable unique identifier such as BAG-RWA-2026-H1 or EXPORT-SUPER-LOT-01. Lookups accept either the code or the internal UUID.',
  },
  {
    term: 'Backward trace',
    definition:
      'Walking from a selected lot toward its ancestor bags and leaf farmers, answering "where did this coffee come from?"',
  },
  {
    term: 'Child bag',
    definition:
      'The resulting composite lot created by a merge. Parent bags contribute weight into the child.',
  },
  {
    term: 'Composite lot',
    definition:
      'A bag created by merging two or more sources. It has no single farmer owner (farmerId is null) and usually starts as IN_STORAGE.',
  },
  {
    term: 'Contribution percentage',
    definition:
      'Farmer contributed weight ÷ lot initial weight × 100, rounded to two decimal places.',
  },
  {
    term: 'Cycle / circular merge',
    definition:
      'An illegal merge that would make a bag an ancestor of itself. The system rejects these to keep lineage acyclic.',
  },
  {
    term: 'DAG (lineage graph)',
    definition:
      'Directed acyclic graph of bags connected by merge relations. Edges carry the weight used from parent to child.',
  },
  {
    term: 'Farmer',
    definition:
      'A smallholder producer record: unique code, name, region, country (default Rwanda), optional contact and elevation.',
  },
  {
    term: 'Farmer code',
    definition:
      'Unique producer identifier such as FRM-RWA-001. Immutable after registration.',
  },
  {
    term: 'Forward trace',
    definition:
      'Walking from a bag toward descendant lots, answering "where did this coffee go next?"',
  },
  {
    term: 'Harvest bag',
    definition:
      'An original bag logged from a single farmer harvest (status HARVESTED at creation).',
  },
  {
    term: 'Initial weight',
    definition:
      'The weight recorded when the bag was created. For composites, this is the sum of weights used from sources.',
  },
  {
    term: 'Current weight',
    definition:
      'How much coffee is still available in that bag. Decreases when the bag contributes to a merge.',
  },
  {
    term: 'Merge',
    definition:
      'Operation that combines at least two eligible source bags (full or partial weights) into a new target bag code, writing merge relations for lineage.',
  },
  {
    term: 'Merge relation',
    definition:
      'A stored edge from parent (source) to child (target) including weightUsedKg.',
  },
  {
    term: 'Origin certificate',
    definition:
      'Printable/downloadable document for a lot: identity, attributions, regions, QR link to the live trace page, and a SHA-256 fingerprint of the certificate payload.',
  },
  {
    term: 'Parent bag',
    definition:
      'A source bag that contributed weight into a child composite during a merge.',
  },
  {
    term: 'Partial merge',
    definition:
      'Using only part of a source bag’s available weight. Leftover weight remains; the source becomes IN_STORAGE if not fully consumed.',
  },
  {
    term: 'Region / country',
    definition:
      'Geographic origin fields on the farmer profile, used for origin claims on certificates and attribution lists.',
  },
  {
    term: 'Variety',
    definition:
      'Coffee botanical variety on a bag: ARABICA, ROBUSTA, TYPICA, BOURBON, or GEISHA.',
  },
];

export const WORKFLOWS = [
  {
    title: 'Register a farmer',
    steps: [
      'Open Farmers or use Register Farmer from the dashboard / command palette (Ctrl/Cmd + K).',
      'Provide a unique farmer code, name, and region. Optional: email, phone, country, elevation.',
      'The farmer can then own harvest bags. The code cannot be changed later.',
    ],
  },
  {
    title: 'Log a harvest bag',
    steps: [
      'Choose Log Bag and select the farmer.',
      'Enter a unique bag code and initial weight (kg). Optionally set moisture, quality score, and variety.',
      'The bag is created as HARVESTED with current weight equal to initial weight.',
    ],
  },
  {
    title: 'Merge bags into a lot',
    steps: [
      'Open Merge and pick at least two bags that still have available weight (not fully MERGED or EXPORTED).',
      'Optionally set how many kilograms to take from each source (partial merge).',
      'Provide a new target bag code. The system creates the composite, updates source weights/statuses, and records lineage edges.',
      'You can open the lineage graph immediately after a successful merge.',
    ],
  },
  {
    title: 'Trace origin or downstream lots',
    steps: [
      'Open Traceability Graph or search a bag/lot code on the Trace page.',
      'Backward view shows ancestors and farmer attributions.',
      'Forward view shows descendant lots and how much weight flowed onward.',
      'Use replay to step through the merge story visually.',
    ],
  },
  {
    title: 'Issue an origin certificate',
    steps: [
      'From a traced lot, open the certificate action.',
      'Review lot identity, farmer attributions, and origin regions.',
      'Print or download the PDF. The QR code links back to the live trace page; the fingerprint hashes the certificate payload.',
    ],
  },
  {
    title: 'Edit or remove a farmer',
    steps: [
      'From the Farmers table, edit profile fields (code stays fixed).',
      'Delete is allowed only when the farmer has no linked bags. Otherwise reassign or resolve bags first.',
      'If "Confirm before deleting farmers" is enabled in Settings, a confirmation prompt appears.',
    ],
  },
];

export const SCREENS = [
  {
    name: 'Dashboard',
    href: '/',
    description: 'Live totals, variety mix, recent activity, and shortcuts to register, log, merge, and certificate tools.',
  },
  {
    name: 'Farmers',
    href: '/farmers',
    description: 'Paginated producer directory, profile drawer, edit/delete, and harvest context.',
  },
  {
    name: 'Coffee Bags',
    href: '/bags',
    description: 'Paginated bag ledger with status filters, search, and merge entry points.',
  },
  {
    name: 'Traceability Graph',
    href: '/trace/EXPORT-SUPER-LOT-01',
    description: 'Interactive lineage map for a bag or export lot, with backward/forward modes and replay.',
  },
  {
    name: 'Documentation',
    href: '/documentation',
    description: 'This product catalogue: terminology, workflows, statuses, attribution math, and system rules.',
  },
  {
    name: 'Settings',
    href: '/settings',
    description: 'Workspace preferences, live API health, and the same documentation catalogue under the Documentation tab.',
  },
  {
    name: 'Command palette',
    href: null,
    description: 'Press Ctrl+K (Windows) or Cmd+K (Mac) for global navigation and quick actions.',
  },
];

export const RULES = [
  {
    title: 'List pages show at most 5 records',
    detail:
      'Farmer and bag list APIs accept a page size up to 5. The UI mirrors that limit so large directories stay readable and consistent.',
  },
  {
    title: 'A merge needs at least two sources',
    detail: 'You cannot create a composite from a single bag. Duplicate sources in one merge are rejected.',
  },
  {
    title: 'Weight cannot exceed what is available',
    detail:
      'Each source’s weightUsedKg must be ≤ its currentWeightKg. Omitting weightUsedKg uses the full available weight.',
  },
  {
    title: 'Fully consumed sources become MERGED',
    detail:
      'When current weight reaches 0, status becomes MERGED. Partial leftovers keep the bag usable as IN_STORAGE.',
  },
  {
    title: 'No circular lineage',
    detail: 'Merges that would create a cycle in the bag graph are blocked.',
  },
  {
    title: 'Exported bags are locked for merging',
    detail: 'EXPORTED is terminal for merge inputs.',
  },
  {
    title: 'Unique codes everywhere',
    detail: 'Farmer codes and bag codes must be unique. Conflicts return a clear conflict error.',
  },
  {
    title: 'Farmers with bags cannot be deleted',
    detail: 'Delete is blocked while any bag still references the farmer.',
  },
];

export const VARIETIES = ['ARABICA', 'ROBUSTA', 'TYPICA', 'BOURBON', 'GEISHA'] as const;

export const EXAMPLE_FLOW = [
  { label: 'Harvest', detail: 'BAG-A and BAG-B logged from Farmer 1 & 2' },
  { label: 'Tier-1 merge', detail: 'Both partially or fully combined into BAG-M1' },
  { label: 'Tier-2 merge', detail: 'BAG-M1 merges with another lot into BAG-M2' },
  { label: 'Export lot', detail: 'Final EXPORT-SUPER-LOT for certificate & buyer trace' },
];
