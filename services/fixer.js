// ─────────────────────────────────────────────────────────────────────────────
// Fixer Agent — Heuristic URL Repair Engine
//
// Applies a multi-pass correction pipeline to broken API endpoints.
// Each pass targets a specific class of URL defect, ordered from
// highest-confidence fixes to progressively more speculative ones.
// No external API calls — all inference is local.
// ─────────────────────────────────────────────────────────────────────────────

// ── Knowledge Base ──────────────────────────────────────────────────────────
// Common REST resource names the agent "knows about" — used as a reference
// vocabulary when the path segment doesn't look like a real word.

const KNOWN_RESOURCES = [
  "users", "posts", "comments", "albums", "photos", "todos",
  "products", "orders", "items", "categories", "tags",
  "articles", "reviews", "messages", "notifications",
  "sessions", "tokens", "accounts", "profiles", "settings",
  "events", "logs", "files", "images", "videos",
];

// Irregular plural forms that simple suffix rules can't handle.
const IRREGULAR_PLURALS = {
  person: "people",
  child: "children",
  man: "men",
  woman: "women",
  mouse: "mice",
  goose: "geese",
  ox: "oxen",
  datum: "data",
  index: "indices",
  vertex: "vertices",
  matrix: "matrices",
  analysis: "analyses",
  status: "statuses",
  medium: "media",
};

// ── String Distance ─────────────────────────────────────────────────────────
// Levenshtein distance — measures how "far" a typo is from the intended word.
// The agent uses this to find the closest known resource when a path segment
// doesn't match anything exactly.

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

// ── Pluralization Engine ────────────────────────────────────────────────────
// REST convention: collection endpoints are plural (/users, /posts).
// The agent detects singular nouns and converts them, handling English
// morphology rules (not just appending "s").

function pluralize(word) {
  const lower = word.toLowerCase();

  // Already plural — common plural endings
  if (lower.endsWith("ses") || lower.endsWith("ies") || lower.endsWith("ves")) {
    return word;
  }

  // Check irregular forms first
  if (IRREGULAR_PLURALS[lower]) {
    return IRREGULAR_PLURALS[lower];
  }

  // Already looks plural (ends in "s" but not "ss", "us", "is")
  if (lower.endsWith("s") && !lower.endsWith("ss") && !lower.endsWith("us") && !lower.endsWith("is")) {
    return word;
  }

  // English morphology rules, ordered by specificity
  if (lower.endsWith("y") && !/[aeiou]y$/.test(lower)) {
    return word.slice(0, -1) + "ies";       // category → categories
  }
  if (/(?:s|sh|ch|x|z)$/.test(lower)) {
    return word + "es";                      // match → matches
  }
  if (lower.endsWith("f")) {
    return word.slice(0, -1) + "ves";        // leaf → leaves
  }
  if (lower.endsWith("fe")) {
    return word.slice(0, -2) + "ves";        // knife → knives
  }

  return word + "s";                         // default: post → posts
}

// ── Typo Correction via Fuzzy Match ─────────────────────────────────────────
// When a path segment isn't a recognized resource, the agent computes edit
// distance against its vocabulary and picks the closest match — but only
// if the distance is below a confidence threshold (max 2 edits).

function fuzzyMatchResource(segment) {
  const lower = segment.toLowerCase();
  let bestMatch = null;
  let bestDistance = Infinity;

  for (const resource of KNOWN_RESOURCES) {
    const dist = levenshtein(lower, resource);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = resource;
    }
  }

  // Confidence gate: only accept if the typo is within 2 edits
  // and the segment is at least 3 chars (avoid false positives on short words)
  const maxAllowedDistance = lower.length <= 4 ? 1 : 2;
  if (bestDistance <= maxAllowedDistance && lower.length >= 3) {
    return bestMatch;
  }

  return null;
}

// ── Path Normalization ──────────────────────────────────────────────────────
// Cleans structural defects that commonly cause 404s:
//   - double slashes    → single slash
//   - trailing slashes  → removed (unless root)
//   - mixed case paths  → lowercased
//   - whitespace/encoding artifacts

function normalizePath(pathname) {
  let cleaned = pathname
    .replace(/\/\/+/g, "/")     // collapse double slashes
    .replace(/\s+/g, "")        // strip accidental whitespace
    .replace(/%20/g, "");       // strip encoded spaces

  // Remove trailing slash (but keep root "/")
  if (cleaned.length > 1 && cleaned.endsWith("/")) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned;
}

// ── Segment-Level Repair ────────────────────────────────────────────────────
// The core "reasoning" pass. For each path segment:
//   1. Is it a known resource? → keep it
//   2. Is its plural form known? → use the plural (REST convention)
//   3. Does it fuzzy-match a known resource? → correct the typo
//   4. Otherwise → pluralize it (assume it should be a collection endpoint)

function repairSegments(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const repaired = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i].toLowerCase();

    // Skip numeric IDs and UUIDs — these are resource identifiers, not names
    if (/^\d+$/.test(seg) || /^[0-9a-f]{8}-/.test(seg)) {
      repaired.push(seg);
      continue;
    }

    // Check: exact match in vocabulary
    if (KNOWN_RESOURCES.includes(seg)) {
      repaired.push(seg);
      continue;
    }

    // Check: singular form whose plural is in vocabulary
    const plural = pluralize(seg);
    if (KNOWN_RESOURCES.includes(plural)) {
      repaired.push(plural);
      continue;
    }

    // Check: typo correction via fuzzy matching
    const fuzzyResult = fuzzyMatchResource(seg);
    if (fuzzyResult) {
      repaired.push(fuzzyResult);
      continue;
    }

    // Fallback: pluralize unknown nouns (REST convention for collections)
    // Only pluralize the last segment (the resource), not intermediate path parts
    const isLastSegment = i === segments.length - 1;
    const isNextSegmentId = i + 1 < segments.length && /^\d+$/.test(segments[i + 1]);

    if (isLastSegment || isNextSegmentId) {
      repaired.push(pluralize(seg));
    } else {
      repaired.push(seg);
    }
  }

  return "/" + repaired.join("/");
}

// ── API Version Prefix Detection ────────────────────────────────────────────
// Preserves version prefixes like /v1/, /v2/, /api/ so the repair pass
// doesn't mangle them.

function splitVersionPrefix(pathname) {
  const match = pathname.match(/^(\/(?:api\/)?v\d+)(\/.*)/i);
  if (match) {
    return { prefix: match[1], rest: match[2] };
  }

  const apiMatch = pathname.match(/^(\/api)(\/.*)/i);
  if (apiMatch) {
    return { prefix: apiMatch[1], rest: apiMatch[2] };
  }

  return { prefix: "", rest: pathname };
}

// ── Main Agent ──────────────────────────────────────────────────────────────
// Orchestrates the full repair pipeline:
//   1. Parse the URL
//   2. Normalize path structure
//   3. Preserve API version prefix
//   4. Run segment-level repair (typo correction + pluralization)
//   5. Reconstruct the URL

function fixerAgent(issue, config) {
  const updatedConfig = { ...config };

  // Only attempt URL repair for endpoint-related issues
  if (!issue || !issue.includes("Endpoint")) {
    return updatedConfig;
  }

  try {
    const parsed = new URL(config.url);

    // Pass 1: Structural normalization
    let pathname = normalizePath(parsed.pathname);

    // Pass 2: Separate version prefix from resource path
    const { prefix, rest } = splitVersionPrefix(pathname);

    // Pass 3: Segment-level intelligent repair
    const repairedPath = repairSegments(rest);

    // Reconstruct
    parsed.pathname = prefix + repairedPath;
    updatedConfig.url = parsed.toString();
  } catch {
    // URL parsing failed — return config unchanged rather than crashing
    return updatedConfig;
  }

  return updatedConfig;
}

module.exports = fixerAgent;
