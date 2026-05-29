#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseCsv } from "./csv";
import { buildCompareReport, buildCsvProfileReport, defaultGroupDepth, defaultViolationMinSupport, maxGroupDepth } from "./compare";
import { buildLocalAiNarrative, type AiApi } from "./ollama";
import { renderReport, type ReportFormat } from "./report";

interface CliOptions {
  sourcePath: string;
  targetPath?: string;
  keyField: string;
  outPath: string;
  format: ReportFormat;
  formatExplicit: boolean;
  trimValues: boolean;
  compareValues: boolean;
  contextFields: string[];
  groupDepth: number;
  violationMinSupport: number;
  dedupeRules: boolean;
  useOllama: boolean;
  ollamaModel: string;
  ollamaUrl: string;
  ollamaTimeoutMs: number;
  ollamaApi: AiApi;
  ollamaApiKey: string;
}

const VERSION = "0.1.0";

async function main(): Promise<void> {
  const options = parseArgs(Bun.argv.slice(2));

  if (options === "help") {
    printHelp();
    return;
  }

  if (options === "version") {
    console.log(VERSION);
    return;
  }

  const sourceText = await Bun.file(options.sourcePath).text();
  const source = parseCsv(sourceText, { trimValues: options.trimValues });

  const report = options.targetPath === undefined
    ? buildCsvProfileReport({
      sourcePath: options.sourcePath,
      source,
      options: {
        keyField: options.keyField,
        contextFields: options.contextFields,
        groupDepth: options.groupDepth,
        dedupeRules: options.dedupeRules,
      },
    })
    : buildCompareReport({
      sourcePath: options.sourcePath,
      targetPath: options.targetPath,
      source,
      target: parseCsv(await Bun.file(options.targetPath).text(), { trimValues: options.trimValues }),
      options: {
        keyField: options.keyField,
        compareValues: options.compareValues,
        contextFields: options.contextFields,
        groupDepth: options.groupDepth,
        violationMinSupport: options.violationMinSupport,
        dedupeRules: options.dedupeRules,
      },
    });

  if (!("mode" in report) && options.useOllama) {
    report.analysis.localAi = await buildLocalAiNarrative(report, {
      model: options.ollamaModel,
      url: options.ollamaUrl,
      timeoutMs: options.ollamaTimeoutMs,
      api: options.ollamaApi,
      apiKey: options.ollamaApiKey === "" ? undefined : options.ollamaApiKey,
    });
  } else if ("mode" in report && options.useOllama) {
    console.error("--ollama is only used for two-file comparison reports. Profile mode stayed deterministic and local.");
  }
  const rendered = renderReport(report, options.format);

  if (options.outPath === "-") {
    process.stdout.write(rendered);
  } else {
    await mkdir(dirname(resolve(options.outPath)), { recursive: true });
    await Bun.write(options.outPath, rendered);
    console.log(`Report written to ${options.outPath}`);
  }

  process.exitCode = "mode" in report ? 0 : report.passed ? 0 : 1;
}

function parseArgs(args: string[]): CliOptions | "help" | "version" {
  if (args.includes("--help") || args.includes("-h")) {
    return "help";
  }

  if (args.includes("--version") || args.includes("-v")) {
    return "version";
  }

  const positional: string[] = [];
  const options: Omit<CliOptions, "sourcePath" | "targetPath"> = {
    keyField: "",
    outPath: "csv-compare-report.md",
    format: "markdown",
    formatExplicit: false,
    trimValues: true,
    compareValues: true,
    contextFields: [],
    groupDepth: defaultGroupDepth(),
    violationMinSupport: defaultViolationMinSupport(),
    dedupeRules: false,
    useOllama: false,
    ollamaModel: "llama3.2",
    ollamaUrl: "http://localhost:11434",
    ollamaTimeoutMs: 30000,
    ollamaApi: "native",
    ollamaApiKey: "",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--key" || arg === "-k") {
      options.keyField = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--out" || arg === "-o") {
      options.outPath = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--format" || arg === "-f") {
      const value = readOptionValue(args, index, arg);
      if (value !== "markdown" && value !== "json" && value !== "html") {
        throw new Error('--format must be "markdown", "json", or "html".');
      }
      options.format = value;
      options.formatExplicit = true;
      index += 1;
      continue;
    }

    if (arg === "--no-trim") {
      options.trimValues = false;
      continue;
    }

    if (arg === "--no-cell-compare") {
      options.compareValues = false;
      continue;
    }

    if (arg === "--context") {
      options.contextFields = readOptionValue(args, index, arg)
        .split(",")
        .map((field) => field.trim())
        .filter((field) => field !== "");
      index += 1;
      continue;
    }

    if (arg === "--group-depth") {
      const value = Number(readOptionValue(args, index, arg));
      if (!Number.isInteger(value) || value <= 0 || value > maxGroupDepth()) {
        throw new Error(`--group-depth must be a whole number between 1 and ${maxGroupDepth()}.`);
      }
      options.groupDepth = value;
      index += 1;
      continue;
    }

    if (arg === "--violation-min-support") {
      const value = Number(readOptionValue(args, index, arg));
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("--violation-min-support must be a whole number of 1 or more.");
      }
      options.violationMinSupport = value;
      index += 1;
      continue;
    }

    if (arg === "--dedupe-rules") {
      options.dedupeRules = true;
      continue;
    }

    if (arg === "--ollama") {
      options.useOllama = true;
      continue;
    }

    if (arg === "--ollama-model") {
      options.ollamaModel = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--ollama-url") {
      options.ollamaUrl = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--ollama-timeout-ms") {
      const value = Number(readOptionValue(args, index, arg));
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("--ollama-timeout-ms must be a positive number.");
      }
      options.ollamaTimeoutMs = value;
      index += 1;
      continue;
    }

    if (arg === "--ollama-api") {
      const value = readOptionValue(args, index, arg);
      if (value !== "native" && value !== "openai") {
        throw new Error('--ollama-api must be "native" (Ollama) or "openai" (OpenAI-compatible, e.g. Open WebUI).');
      }
      options.ollamaApi = value;
      index += 1;
      continue;
    }

    if (arg === "--ollama-api-key") {
      options.ollamaApiKey = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option "${arg}".`);
    }

    positional.push(arg);
  }

  if (positional.length < 1 || positional.length > 2) {
    throw new Error("Expected one CSV for profile mode, or two CSV files for compare mode: <source.csv> [target.csv].");
  }

  if (!options.formatExplicit && options.outPath !== "-") {
    const inferred = inferFormatFromPath(options.outPath);
    if (inferred !== undefined) {
      options.format = inferred;
    }
  }

  return {
    sourcePath: positional[0],
    targetPath: positional[1],
    ...options,
  };
}

function inferFormatFromPath(outPath: string): ReportFormat | undefined {
  const match = /\.([a-z0-9]+)$/i.exec(outPath);
  const extension = match?.[1]?.toLowerCase();
  if (extension === "html" || extension === "htm") {
    return "html";
  }
  if (extension === "json") {
    return "json";
  }
  if (extension === "md" || extension === "markdown") {
    return "markdown";
  }
  return undefined;
}

function readOptionValue(args: string[], index: number, optionName: string): string {
  const value = args[index + 1];
  if (value === undefined || (value !== "-" && value.startsWith("-"))) {
    throw new Error(`Missing value for ${optionName}.`);
  }
  return value;
}

function printHelp(): void {
  console.log(`csv-compare ${VERSION}

Profile one CSV, or prove that a target CSV matches a source CSV by ID or another key field.
When differences are found, write a report that explains what failed, what
kind of data appears affected, likely causes, evidence, and next checks.
Analysis is deterministic and local; no external AI service is called.

Usage:
  bun run src/index.ts <source.csv> [options]
  bun run src/index.ts <source.csv> <target.csv> [options]
  bun run compare -- <source.csv> [options]
  bun run compare -- <source.csv> <target.csv> [options]

Options:
  -k, --key <field>          Match/profile rows using this field. Defaults to shared or detected ID/Id/id.
  -o, --out <path>           Report path. Use "-" for stdout. Default: csv-compare-report.md
  -f, --format <format>      markdown, json, or html. Inferred from --out extension if omitted. Default: markdown
      --context <fields>     Comma-separated context fields to include in problem grouping.
      --group-depth <n>      Build grouped slices up to this many context fields. Default: ${defaultGroupDepth()}, max: ${maxGroupDepth()}
      --violation-min-support <n> Min source rows backing a rule before a target break is flagged. Default: ${defaultViolationMinSupport()}. Use 1 to flag every broken relationship.
      --dedupe-rules         Collapse reverse-direction value rules (A=x => B=y vs B=y => A=x) to the stronger one.
      --ollama               Add an optional AI narrative section for compare mode.
      --ollama-model <name>  Model to use. Default: llama3.2
      --ollama-url <url>     Base URL or full endpoint. Default: http://localhost:11434
      --ollama-api <kind>    "native" (Ollama) or "openai" (OpenAI-compatible, e.g. Open WebUI). Default: native
      --ollama-api-key <key> Bearer token for hosted/authenticated endpoints. Falls back to OLLAMA_API_KEY or OPENAI_API_KEY.
      --ollama-timeout-ms <n> Timeout for AI requests. Default: 30000
      --no-cell-compare      Only compare row presence and column-level distributions.
      --no-trim              Preserve leading and trailing spaces in headers and values.
  -h, --help                 Show this help.
  -v, --version              Show the version.

Examples:
  bun run compare -- source.csv --out profile.md
  bun run compare -- old.csv new.csv --key ID --out report.html
  bun run src/index.ts export-a.csv export-b.csv --key CustomerId --format json --out -
  bun run compare -- old.csv new.csv --key ID --ollama --ollama-model llama3.2
  bun run compare -- old.csv new.csv --key ID --ollama --ollama-api openai \\
    --ollama-url https://webui.example.com/api/chat/completions --ollama-api-key sk-... --ollama-model llama3.1
`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
