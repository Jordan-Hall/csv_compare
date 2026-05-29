# CSV Compare

A Bun-powered, local-only CLI for profiling one CSV or proving that a target CSV matches a source CSV.

The main goal is not just to list differences. The goal is to answer:

- Did every source record arrive in the target?
- Did the target gain any unexpected records?
- Do the columns, counts, options, and row values match?
- If there is no target yet, what should the target be shaped like?
- If something is wrong, what kind of data is affected?
- Who or what does the problem appear to link to?
- What logic produced the finding?

It checks:

- single CSV profiles with row count, column count, inferred data shape, option counts, blank counts, and useful row groups
- missing rows in the target CSV
- extra rows in the target CSV
- duplicate keys in either file
- columns that only exist in one file
- filled and blank counts for every column
- all option/value counts for every column
- all grouped row/problem counts in Markdown reports, not just sampled groups
- cell-level differences for matched rows
- inferred field roles for unknown data, such as match keys, link IDs, audit actors, timestamps, categories, numbers, and text
- grouped problem analysis around useful context fields like `CreatedBy`, `UpdatedBy`, `OwnerId`, `AccountId`, `Status`, and dates
- multi-level grouping up to a configurable depth, such as `Status > UpdatedBy > UpdatedAt month`
- date/time context is grouped by year, month, and day while ignoring the time portion
- analytic layers for data profile, completeness, schema, values, relationships, audit, time, near-matches, column impact, and value dependencies
- conditional value-dependency rules (`A=x ⇒ B=y`) that explain what one column's value implies about another, plus the target rows that break a rule the source guaranteed
- an intelligence layer with risk score, verdict, ranked findings, likely causes, evidence, and next checks
- local column profiling for arbitrary headers using name tokens, value patterns, uniqueness, blank rates, and cardinality

Every Markdown report includes a comparison goal and logic explanation so the report can stand alone as audit evidence. The tool does not call an external AI service; the analysis is deterministic and runs locally.

## Usage

```bash
bun run src/index.ts <source.csv> --out profile.md
bun run src/index.ts <source.csv> <target.csv> --key ID --out report.md
```

You can also use the package script:

```bash
bun run compare -- <source.csv> --out profile.md
bun run compare -- <source.csv> <target.csv> --key CustomerId --out report.md
```

## Options

```text
-k, --key <field>          Match/profile rows using this field. Defaults to shared or detected ID/Id/id.
-o, --out <path>           Report path. Use "-" for stdout. Default: csv-compare-report.md
-f, --format <format>      markdown, json, or html. Default: markdown
    --context <fields>     Comma-separated context fields to force into row detail and grouping.
    --group-depth <n>      Build grouped slices up to this many context fields. Default: 3, max: 5
    --violation-min-support <n> Min source rows backing a value rule before a target break is flagged. Default: 2. Use 1 to flag every broken relationship.
    --dedupe-rules         Collapse reverse-direction value rules (A=x => B=y vs B=y => A=x) to the stronger one.
    --no-progress          Hide the live progress bar (percent + ETA) shown on stderr while generating the report.
    --ollama               Add an optional local Ollama narrative section for compare mode.
    --ollama-model <name>  Ollama model to use. Default: llama3.2
    --ollama-url <url>     Ollama base URL. Default: http://localhost:11434
    --ollama-timeout-ms <n> Timeout for Ollama requests. Default: 30000
    --no-cell-compare      Only compare row presence and column-level distributions.
    --no-trim              Preserve leading and trailing spaces in headers and values.
-h, --help                 Show help.
-v, --version              Show the version.
```

While the report is generated, a live progress bar with percent complete, the current phase, and a rough ETA is shown on stderr (so piped report output on stdout stays clean). It updates in place in an interactive terminal and prints one line per phase when output is redirected. Disable it with `--no-progress`.

Single-file profile mode exits with code `0` when the profile report is written. Two-file compare mode exits with code `0` when the files match and `1` when differences are found.

## Profile One CSV

Use profile mode when you only have the source/export and need to understand the target you should build later:

```bash
bun run profile
```

That writes `examples/profile-report.md`.

Profile reports include:

- expected row and column counts
- likely key fields and duplicate key groups
- filled, blank, distinct, and option counts for every column
- all grouped row counts and all column value counts
- inferred field roles and value patterns
- likely links, audit actor fields, and date/time fields
- grouped row analysis by useful context fields
- multi-level row groups up to `--group-depth`
- date/time groups by year, month, and day, ignoring time

## Comparison Logic

The tool treats the source CSV as the expected truth and the target CSV as the data being verified.

| Step | What it checks | Why it matters |
| --- | --- | --- |
| 1. Parse CSVs | Reads headers and rows, with trimming enabled by default. | Keeps the comparison based on the actual exported structure. |
| 2. Resolve key | Uses `--key`, or shared `ID`/`Id`/`id`, to match rows. | Establishes row identity across both files. |
| 3. Check key uniqueness | Finds duplicate keys in either file. | Duplicate keys make one-to-one matching unreliable. |
| 4. Check row completeness | Finds missing source rows and extra target rows. | Proves whether the target contains the expected record set. |
| 5. Check schema | Finds source-only and target-only columns. | Catches dropped, renamed, or newly added fields. |
| 6. Check column distributions | Counts filled values, blanks, distinct options, and option count differences. | Catches drift even when row-level meaning is unknown. |
| 7. Check matched cells | Compares every shared column for matched rows. | Proves whether matching records contain matching data. |
| 8. Infer data shape | Detects likely keys, links, audit actors, timestamps, categories, numbers, booleans, and text. | Gives unknown CSV data enough meaning to explain issues. |
| 9. Explain findings | Ranks issues and gives evidence, likely causes, affected keys, and next checks. | Turns raw differences into an investigation path. |

## Example

```bash
bun run sample
```

This writes a passing report to `examples/report.md`.

To see a failing report with missing rows, extra rows, option differences, and a changed cell:

```bash
bun run sample:diff
```

That writes `examples/diff-report.md` and exits with code `1`, because differences were found.

To see the local profiler handle less predictable headers and value shapes:

```bash
bun run sample:unknown
```

That writes `examples/unknown-report.md` and exits with code `1`, because the example target intentionally differs.

## HTML Reports (Interactive)

Generate interactive, browser-based reports with charts, tables, and diagrams:

```bash
bun run compare -- source.csv target.csv --key ID --out report.html --format html
```

HTML reports are **self-contained single files** with no external dependencies. Features:

- **Dark/light theme toggle** — top-right button to switch between dark and light modes
- **Interactive charts**:
  - Risk score gauge showing data quality risk (0–100)
  - Venn diagram showing row overlap (matched, missing, extra)
  - Donut chart for finding severity distribution
  - Bar charts for column impact, changed columns, and problem groups
  - Role distribution donut for profile mode
- **Sortable, searchable tables** — click column headers to sort, use search boxes to filter
- **Severity filtering** — for compare mode, filter findings by critical/high/medium/low/info
- **Tabbed interface** for organized content:
  - **Overview** — verdict, risk gauge, overlap, top changes, issue layers
  - **Findings** — intelligence findings with evidence, causes, and next checks
  - **Columns** — impact ranking, changed columns, all column statistics
  - **Rows** — missing/extra rows, problem groups, near matches, duplicates
  - **Fields** — inferred roles, column families, link/audit insights
  - **AI** (if enabled) — local Ollama narrative
  - **Raw JSON** — complete machine-readable report
- **Print-friendly** — top-right button to save/print as PDF
- **Responsive** — works on desktop and mobile browsers
- **Instant rendering** — all JavaScript client-side, data embedded in HTML

**Size**: ~220KB for typical reports (gzip-friendly, embeds all styling and charts inline)

Example:

```bash
# Compare mode with HTML
bun run compare -- old.csv new.csv --key ID --out report.html --format html

# Profile mode with HTML
bun run compare -- data.csv --out profile.html --format html

# With local Ollama narrative
bun run compare -- old.csv new.csv --key ID --format html --out report.html --ollama
```

## Unknown Data Analysis

The CLI does not need to know the business meaning of the CSV ahead of time. It uses column names and values to infer likely roles:

- `CreatedBy`, `UpdatedBy`, `OwnerId`, and similar fields are treated as audit actor context.
- `AccountId`, `CustomerID`, `*_id`, UUID-like values, and key-like fields are treated as links.
- `CreatedAt`, `UpdatedAt`, date-like values, and timestamp-like names are treated as time context.
- Date and timestamp context is grouped into year, month, and day buckets, so `2026-05-20T14:30:00` is grouped as `2026`, `2026-05`, and `2026-05-20`.
- Low-cardinality fields such as status/type/state values are treated as categories.
- Email, URL, phone, currency, percentage, JSON, boolean, multi-value, long-text, and numeric-looking fields are detected from value patterns.
- Candidate keys are inferred only when the field is highly unique and also looks identifier-like.

You can guide the report when you already know important fields:

```bash
bun run compare -- source.csv target.csv --key ID --context CreatedBy,UpdatedBy,AccountId,Status --out report.md
```

## Analytic Layers

The report explains the data through multiple layers:

- **Data profile**: column counts, match coverage, changed matched rows, and inferred role counts.
- **Issue layers**: completeness, schema, values, relationships, audit, and time.
- **Group insights**: concentrated problem slices, such as missing rows grouped by account, status, user, date, or combinations up to `--group-depth`.
- **Possible near matches**: missing source rows that look similar to extra target rows, useful when keys changed.
- **Relationship and audit insights**: fields that look like links or actor metadata and how their distributions drifted.
- **Column impact**: a ranked list of columns that explain most of the mismatch.
- **Value dependencies**: conditional rules of the form `A=x ⇒ B=y`, showing what value one column takes when another column holds a given value, with the supporting row count and confidence. Rules are derived from value-bearing columns only (identity keys and free text are skipped) and no support/confidence floor is applied, so every rule is listed. In compare mode, any rule that was always true in the source (backed by 2+ rows) but is broken in the target is raised as a finding — for example "`CreatedBy=sam` always implied `Status=Active` in source, but target row 2 is `Inactive`". This is what explains *why* a dependent column looks wrong based on the value in another column.

## Intelligence Layer

Every report includes a deterministic intelligence section near the top. It ranks problems by severity and confidence, then explains:

- what looks risky
- the evidence behind the finding
- likely causes
- which keys and columns are affected
- practical checks to run next

This is rule-based and local, so it works without sending data to an external AI service.

## Optional Ollama

The core report does not need AI. If you want a local model to write a short narrative interpretation, enable Ollama explicitly:

```bash
bun run compare -- source.csv target.csv --key ID --ollama --ollama-model llama3.2 --out report.md
```

The Ollama prompt uses a compact report summary, not the raw CSV rows. If Ollama is unavailable or times out, the report still writes and includes the local AI error message. You can tune the local request timeout with `--ollama-timeout-ms`.
