import type {
  CellDifference,
  ChangedColumnSummary,
  ColumnFamily,
  ColumnStats,
  CompareReport,
  CsvProfileReport,
  DuplicateKey,
  GroupInsight,
  InferredField,
  IntelligenceFinding,
  IssueLayer,
  LinkColumnSummary,
  NearMatch,
  RelationshipInsight,
  ProblemGroup,
  ProblemRow,
  ValueDependencyLayer,
} from "./compare";
import { renderHtmlReport } from "./html";

export type ReportFormat = "markdown" | "json" | "html";

export type AnyReport = CompareReport | CsvProfileReport;

export function renderReport(report: AnyReport, format: ReportFormat): string {
  if (format === "json") {
    return `${JSON.stringify(isProfileReport(report) ? toProfileJson(report) : report, null, 2)}\n`;
  }

  if (format === "html") {
    return renderHtmlReport(report);
  }

  if (isProfileReport(report)) {
    return renderMarkdownProfileReport(report);
  }

  return renderMarkdownReport(report);
}

function isProfileReport(report: AnyReport): report is CsvProfileReport {
  return "mode" in report && report.mode === "profile";
}

function toProfileJson(report: CsvProfileReport): object {
  return {
    mode: report.mode,
    sourcePath: report.sourcePath,
    generatedAt: report.generatedAt,
    rows: report.rows,
    columns: report.columns,
    keyField: report.keyField,
    duplicateKeys: report.duplicateKeys,
    columnStats: report.columnStats.map((stats) => ({
      column: stats.column,
      filled: stats.sourceFilled,
      blank: stats.sourceBlank,
      distinctValues: Object.keys(stats.sourceOptions).filter((value) => value !== "").length,
      options: stats.sourceOptions,
    })),
    analysis: {
      profile: report.analysis.profile,
      contextColumns: report.analysis.contextColumns,
      inferredFields: report.analysis.inferredFields.map((field) => ({
        column: field.column,
        roles: field.roles,
        roleConfidence: field.roleConfidence,
        valuePattern: field.valuePattern,
        signals: field.signals,
        filled: field.sourceFilled,
        distinct: field.sourceDistinct,
        completeness: field.sourceCompleteness,
        uniqueness: field.sourceUniqueness,
        averageLength: field.averageLength,
        topOptions: field.sourceTopOptions,
      })),
      rowGroups: report.analysis.rowGroups,
      groupInsights: report.analysis.groupInsights,
      valueDependencies: report.analysis.valueDependencies,
      linkColumns: report.analysis.linkColumns.map((column) => ({
        column: column.column,
        distinctValues: column.sourceDistinct,
      })),
      columnFamilies: report.analysis.columnFamilies,
    },
  };
}

function renderMarkdownReport(report: CompareReport): string {
  const lines: string[] = [];
  lines.push("# CSV Compare Report");
  lines.push("");
  lines.push(`Status: **${report.passed ? "PASS" : "FAIL"}**`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(markdownTable(
    ["Metric", "Value"],
    [
      ["Source", report.sourcePath],
      ["Target", report.targetPath],
      ["Key field", report.keyField],
      ["Generated", report.generatedAt],
      ["Source rows", String(report.sourceRows)],
      ["Target rows", String(report.targetRows)],
      ["Matched rows", String(report.matchedRows)],
      ["Missing in target", String(report.missingInTarget.length)],
      ["Extra in target", String(report.extraInTarget.length)],
      ["Cell differences", String(report.cellDifferences.length)],
    ],
  ));
  lines.push("");

  addComparisonGoal(lines, report);
  addLogicExplanation(lines, report);
  addIntelligenceLayer(lines, report.analysis.intelligence);
  addLocalAiNarrative(lines, report);
  addAnalyticLayers(lines, report);
  addInferredFields(lines, report.analysis.inferredFields);
  addContextColumns(lines, report.analysis.contextColumns);
  addColumnFamilies(lines, report.analysis.columnFamilies);
  addProblemGroups(lines, report.analysis.problemGroups);
  addProblemRows(lines, "Missing Rows In Target", report.analysis.missingRows);
  addProblemRows(lines, "Extra Rows In Target", report.analysis.extraRows);
  addDuplicateSection(lines, "Duplicate Keys In Source", report.duplicateKeysInSource);
  addDuplicateSection(lines, "Duplicate Keys In Target", report.duplicateKeysInTarget);
  addListSection(lines, "Source-only Columns", report.sourceOnlyColumns);
  addListSection(lines, "Target-only Columns", report.targetOnlyColumns);
  addColumnSummary(lines, report.columnStats);
  addChangedColumnSummary(lines, report.analysis.changedColumns);
  addLinkColumns(lines, report.analysis.linkColumns);
  addCellDifferences(lines, report.cellDifferences);
  addColumnOptions(lines, report.columnStats);

  return `${lines.join("\n")}\n`;
}

function renderMarkdownProfileReport(report: CsvProfileReport): string {
  const lines: string[] = [];
  lines.push("# CSV Profile Report");
  lines.push("");
  lines.push("Status: **PROFILE**");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(markdownTable(
    ["Metric", "Value"],
    [
      ["Source", report.sourcePath],
      ["Generated", report.generatedAt],
      ["Rows", String(report.rows)],
      ["Columns", String(report.columns)],
      ["Key field", report.keyField === "" ? "No key inferred or provided" : report.keyField],
      ["Duplicate key groups", String(report.duplicateKeys.length)],
    ],
  ));
  lines.push("");

  addProfileGoal(lines, report);
  addProfileLogicExplanation(lines);
  addProfileTargetGuidance(lines, report);
  addProfileSummary(lines, report);
  addColumnFamilies(lines, report.analysis.columnFamilies);
  addProfileInferredFields(lines, report.analysis.inferredFields);
  addContextColumns(lines, report.analysis.contextColumns);
  addProfileGroupInsights(lines, report.analysis.groupInsights);
  addValueDependencies(lines, report.analysis.valueDependencies, false);
  addProfileRowGroups(lines, report.analysis.rowGroups);
  addDuplicateSection(lines, "Duplicate Keys", report.duplicateKeys);
  addProfileColumnSummary(lines, report.columnStats);
  addProfileLinkColumns(lines, report);
  addProfileColumnOptions(lines, report.columnStats);

  return `${lines.join("\n")}\n`;
}

function addProfileGoal(lines: string[], report: CsvProfileReport): void {
  lines.push("## Profile Goal");
  lines.push("");
  lines.push(
    `The goal is to understand \`${escapeBackticks(report.sourcePath)}\` well enough to build or validate a target CSV later. ` +
      "This report profiles row count, columns, value options, blank rates, inferred field roles, likely keys, links, audit fields, and useful row groups.",
  );
  lines.push("");
  lines.push(
    "No target CSV was compared. The findings describe the expected data shape a future target should preserve.",
  );
  lines.push("");
}

function addProfileLogicExplanation(lines: string[]): void {
  lines.push("## Logic Explanation");
  lines.push("");
  lines.push(markdownTable(
    ["Step", "What it checks", "Why it matters"],
    [
      [
        "1. Parse CSV",
        "Read headers and rows, preserving each value after optional trimming.",
        "A reliable profile starts from the actual exported structure.",
      ],
      [
        "2. Resolve key",
        "Use the provided key, a detected ID column, or a strong inferred candidate key when available.",
        "This lets the report check uniqueness and name stable row identity for future comparison.",
      ],
      [
        "3. Profile columns",
        "Count filled values, blanks, distinct options, and option counts for every column.",
        "This defines the value domains and completeness a target should match.",
      ],
      [
        "4. Infer data shape",
        "Classify fields as likely keys, links, audit actors, timestamps, categories, numbers, booleans, or text.",
        "This gives unknown CSV data enough meaning to explain what each column may control.",
      ],
      [
        "5. Group rows",
        "Group rows by useful context fields; date/datetime fields are grouped by calendar day, ignoring the time.",
        "This shows important slices a target should preserve, such as owner, status, account, or day counts.",
      ],
    ],
  ));
  lines.push("");
}

function addProfileTargetGuidance(lines: string[], report: CsvProfileReport): void {
  const profile = report.analysis.profile;
  lines.push("## Target Build Guidance");
  lines.push("");
  lines.push(markdownTable(
    ["Check", "Expected target behavior"],
    [
      ["Rows", `Target should contain ${profile.rows} row(s), unless a known filter is intentionally applied.`],
      ["Columns", `Target should include these ${profile.columns} profiled column(s), or documented mappings for renamed fields.`],
      ["Key", report.keyField === "" ? "No reliable key was inferred. Provide --key for stronger future comparison." : `Target should keep ${report.keyField} unique and stable.`],
      ["Duplicate keys", report.duplicateKeys.length === 0 ? "No duplicate key groups found." : `${report.duplicateKeys.length} duplicate key group(s) need review before one-to-one comparison.`],
      ["Value options", "Target should preserve the listed option counts for categorical/status/link fields unless mappings are intentional."],
      ["Date buckets", "Target should preserve calendar-day distributions for date/time fields; the time part is ignored for grouping."],
      ["Column families", "Target should preserve section/family column groups, especially form sections, metadata, dates, flags, and unknown/not-known markers."],
    ],
  ));
  lines.push("");
}

function addProfileSummary(lines: string[], report: CsvProfileReport): void {
  const profile = report.analysis.profile;
  lines.push("## Data Profile");
  lines.push("");
  lines.push(markdownTable(
    ["Metric", "Value"],
    [
      ["Rows", String(profile.rows)],
      ["Columns", String(profile.columns)],
      ["Inferred roles", formatRoleCounts(profile.inferredRoleCounts)],
      ["Candidate keys", profile.candidateKeyColumns.join(", ")],
      ["High blank columns", profile.highBlankColumns.join(", ")],
      ["High cardinality columns", profile.highCardinalityColumns.join(", ")],
      ["Likely link columns", profile.likelyLinkColumns.join(", ")],
      ["Likely audit columns", profile.likelyAuditColumns.join(", ")],
      ["Likely date/time columns", profile.likelyTimestampColumns.join(", ")],
      ["Column families", report.analysis.columnFamilies.map((family) => `${family.family} (${family.columnCount})`).join(", ")],
    ],
  ));
  lines.push("");
}

function addColumnFamilies(lines: string[], families: ColumnFamily[]): void {
  lines.push("## Column Families");
  lines.push("");
  if (families.length === 0) {
    lines.push("No column families inferred.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    [
      "Family",
      "Columns",
      "Identifiers",
      "Dates/times",
      "Unknown markers",
      "Flags",
      "Measures",
      "Status/categories",
      "Text/specify",
      "Columns",
    ],
    families.map((family) => [
      family.label,
      String(family.columnCount),
      formatFullList(family.identifierColumns),
      formatFullList(family.dateColumns),
      formatFullList(family.unknownMarkerColumns),
      formatFullList(family.flagColumns),
      formatFullList(family.measureColumns),
      formatFullList(family.statusColumns),
      formatFullList(family.textColumns),
      formatFullList(family.columns),
    ]),
  ));
  lines.push("");
}

function addProfileInferredFields(lines: string[], fields: InferredField[]): void {
  lines.push("## Inferred Data Shape");
  lines.push("");
  lines.push(markdownTable(
    [
      "Column",
      "Likely roles",
      "Pattern",
      "Complete",
      "Unique",
      "Average length",
      "Confidence",
      "Signals",
    ],
    fields.map((field) => [
      field.column,
      field.roles.join(", "),
      field.valuePattern,
      formatRatio(field.sourceCompleteness),
      formatRatio(field.sourceUniqueness),
      String(field.averageLength),
      formatRoleCounts(field.roleConfidence),
      field.signals.join("; "),
    ]),
  ));
  lines.push("");
  lines.push("### Value Summary");
  lines.push("");
  lines.push(markdownTable(
    ["Column", "Top values"],
    fields.map((field) => [
      field.column,
      formatTopOptions(field.sourceTopOptions),
    ]),
  ));
  lines.push("");
}

function addProfileRowGroups(lines: string[], groups: CsvProfileReport["analysis"]["rowGroups"]): void {
  lines.push("## All Grouped Row Counts");
  lines.push("");
  if (groups.length === 0) {
    lines.push("No grouped row patterns found.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Depth", "Grouped by", "Value", "Rows", "Keys"],
    groups.map((group) => [
      String(group.depth),
      group.column,
      showBlank(group.value),
      String(group.count),
      group.sampleKeys.join(", "),
    ]),
  ));
  lines.push("");
}

function addProfileGroupInsights(lines: string[], insights: GroupInsight[]): void {
  lines.push("### Group Insights");
  lines.push("");
  if (insights.length === 0) {
    lines.push("No row group patterns found.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Depth", "Group", "Value", "Rows", "Share", "Interpretation", "Keys"],
    insights.map((insight) => [
      String(insight.depth),
      insight.groupBy,
      showBlank(insight.value),
      String(insight.count),
      formatRatio(insight.shareOfProblem),
      insight.interpretation,
      insight.sampleKeys.join(", "),
    ]),
  ));
  lines.push("");
}

function addProfileColumnSummary(lines: string[], columnStats: ColumnStats[]): void {
  lines.push("## Column Counts");
  lines.push("");
  lines.push(markdownTable(
    ["Column", "Filled", "Blank", "Distinct values"],
    columnStats.map((stats) => [
      stats.column,
      String(stats.sourceFilled),
      String(stats.sourceBlank),
      String(Object.keys(stats.sourceOptions).filter((value) => value !== "").length),
    ]),
  ));
  lines.push("");
}

function addProfileLinkColumns(lines: string[], report: CsvProfileReport): void {
  lines.push("## Link And Audit Columns");
  lines.push("");
  if (report.analysis.linkColumns.length === 0) {
    lines.push("No likely link or audit actor columns were inferred.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Column", "Likely roles", "Distinct values", "Top values"],
    report.analysis.linkColumns.map((column) => {
      const field = report.analysis.inferredFields.find((item) => item.column === column.column);
      return [
        column.column,
        field?.roles.join(", ") ?? "",
        String(column.sourceDistinct),
        formatTopOptions(field?.sourceTopOptions ?? []),
      ];
    }),
  ));
  lines.push("");
}

function addProfileColumnOptions(lines: string[], columnStats: ColumnStats[]): void {
  lines.push("## Column Options");
  lines.push("");
  for (const stats of columnStats) {
    lines.push(`### ${escapeMarkdown(stats.column)}`);
    lines.push("");
    lines.push(markdownTable(
      ["Value", "Count"],
      Object.entries(stats.sourceOptions)
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], undefined, { numeric: true, sensitivity: "base" }))
        .map(([value, count]) => [showBlank(value), String(count)]),
    ));
    lines.push("");
  }
}

function addLocalAiNarrative(lines: string[], report: CompareReport): void {
  if (report.analysis.localAi === undefined) {
    return;
  }

  const localAi = report.analysis.localAi;
  lines.push("## Local AI Narrative");
  lines.push("");
  lines.push(markdownTable(
    ["Metric", "Value"],
    [
      ["Provider", localAi.provider],
      ["Model", localAi.model],
      ["Generated", localAi.generatedAt],
      ["Scope", localAi.promptScope],
    ],
  ));
  lines.push("");

  if (localAi.error !== undefined) {
    lines.push(`Ollama narrative was requested but could not be generated: ${escapeMarkdown(localAi.error)}`);
    lines.push("");
    return;
  }

  lines.push(localAi.text ?? "");
  lines.push("");
}

function addAnalyticLayers(lines: string[], report: CompareReport): void {
  const analytics = report.analysis.analytics;
  lines.push("## Analytic Layers");
  lines.push("");
  lines.push("This section explains the data from several angles: overall profile, issue layer, grouped patterns, possible near-matches, relationship drift, value dependencies between columns, and the columns with the highest impact.");
  lines.push("");
  lines.push("### Data Profile");
  lines.push("");
  lines.push(markdownTable(
    ["Metric", "Value"],
    [
      ["Source columns", String(analytics.dataProfile.sourceColumns)],
      ["Target columns", String(analytics.dataProfile.targetColumns)],
      ["Shared columns", String(analytics.dataProfile.sharedColumns)],
      ["Source match coverage", formatRatio(analytics.dataProfile.matchCoverageSource)],
      ["Target match coverage", formatRatio(analytics.dataProfile.matchCoverageTarget)],
      ["Changed matched rows", String(analytics.dataProfile.changedMatchedRows)],
      ["Inferred roles", formatRoleCounts(analytics.dataProfile.inferredRoleCounts)],
      ["Candidate keys", analytics.dataProfile.candidateKeyColumns.join(", ")],
      ["High blank columns", analytics.dataProfile.highBlankColumns.join(", ")],
      ["High cardinality columns", analytics.dataProfile.highCardinalityColumns.join(", ")],
    ],
  ));
  lines.push("");
  addIssueLayers(lines, analytics.issueLayers);
  addGroupInsights(lines, analytics.groupInsights);
  addNearMatches(lines, analytics.nearMatches);
  addRelationshipInsights(lines, analytics.relationshipInsights);
  addValueDependencies(lines, analytics.valueDependencies, true);
  addColumnImpact(lines, analytics.columnImpact);
}

function addValueDependencies(lines: string[], layer: ValueDependencyLayer, compareMode: boolean): void {
  lines.push("### Value Dependencies");
  lines.push("");
  lines.push(
    "Conditional rules of the form `A=x => B=y`: when column A holds a value, what value column B takes, with the supporting row count and confidence. " +
      `Rules are derived only from value-bearing columns (${layer.eligibleColumns.length === 0 ? "none eligible" : layer.eligibleColumns.join(", ")}); identity keys and free text are skipped. No support or confidence floor is applied, so every rule is listed.`,
  );
  lines.push("");

  if (compareMode) {
    lines.push("#### Rule Violations In Target");
    lines.push("");
    if (layer.violations.length === 0) {
      lines.push("No strict source value rule is broken in the target at the current support threshold.");
      lines.push("");
    } else {
      lines.push(markdownTable(
        ["If", "Then (source)", "Source support", "Target keys breaking it", "Target shows instead"],
        layer.violations.map((violation) => [
          `${violation.antecedentColumn}=${showBlank(violation.antecedentValue)}`,
          `${violation.consequentColumn}=${showBlank(violation.expectedValue)}`,
          `${violation.sourceSupport}/${violation.sourceSupport}`,
          violation.violatingKeys.join(", "),
          formatTopOptions(violation.observedValues),
        ]),
      ));
      lines.push("");
    }
  }

  lines.push(`#### All Value Rules${compareMode ? " (Source)" : ""}`);
  lines.push("");
  if (layer.rules.length === 0) {
    lines.push("No value-bearing column pairs were eligible for rule discovery.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["If", "Then", "Support", "Confidence", "Strict"],
    layer.rules.map((rule) => [
      `${rule.antecedentColumn}=${showBlank(rule.antecedentValue)}`,
      `${rule.consequentColumn}=${showBlank(rule.consequentValue)}`,
      `${rule.matches}/${rule.support}`,
      formatRatio(rule.confidence),
      rule.strict ? "yes" : "no",
    ]),
  ));
  lines.push("");
}

function addIssueLayers(lines: string[], layers: IssueLayer[]): void {
  lines.push("### Issue Layers");
  lines.push("");
  lines.push(markdownTable(
    ["Layer", "Severity", "Summary", "Evidence", "Related columns"],
    layers.map((layer) => [
      layer.layer,
      layer.severity,
      layer.summary,
      layer.evidence.join("; "),
      layer.relatedColumns.join(", "),
    ]),
  ));
  lines.push("");
}

function addGroupInsights(lines: string[], insights: GroupInsight[]): void {
  lines.push("### Group Insights");
  lines.push("");
  if (insights.length === 0) {
    lines.push("No group patterns found.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Problem", "Depth", "Group", "Value", "Count", "Share", "Interpretation", "Keys"],
    insights.map((insight) => [
      insight.problem,
      String(insight.depth),
      insight.groupBy,
      showBlank(insight.value),
      String(insight.count),
      formatRatio(insight.shareOfProblem),
      insight.interpretation,
      insight.sampleKeys.join(", "),
    ]),
  ));
  lines.push("");
}

function addNearMatches(lines: string[], matches: NearMatch[]): void {
  lines.push("### Possible Near Matches");
  lines.push("");
  if (matches.length === 0) {
    lines.push("No strong near-matches found between missing source rows and extra target rows.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Source key", "Target key", "Score", "Matched fields", "Different fields"],
    matches.slice(0, 20).map((match) => [
      match.sourceKey,
      match.targetKey,
      `${match.score}%`,
      match.matchedFields.join(", "),
      match.differentFields
        .map((field) => `${field.column}: ${showBlank(field.source)} -> ${showBlank(field.target)}`)
        .join("; "),
    ]),
  ));
  lines.push("");
}

function addRelationshipInsights(lines: string[], insights: RelationshipInsight[]): void {
  lines.push("### Relationship And Audit Insights");
  lines.push("");
  if (insights.length === 0) {
    lines.push("No relationship or audit drift found.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Column", "Role", "Summary", "Evidence", "Next checks"],
    insights.map((insight) => [
      insight.column,
      insight.role,
      insight.summary,
      insight.evidence.join("; "),
      insight.nextChecks.join("; "),
    ]),
  ));
  lines.push("");
}

function addColumnImpact(lines: string[], impact: CompareReport["analysis"]["analytics"]["columnImpact"]): void {
  lines.push("### Column Impact");
  lines.push("");
  if (impact.length === 0) {
    lines.push("No impacted columns found.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Column", "Impact score", "Why it matters"],
    impact.slice(0, 20).map((column) => [
      column.column,
      `${column.score}/100`,
      column.reasons.join("; "),
    ]),
  ));
  lines.push("");
}

function addComparisonGoal(lines: string[], report: CompareReport): void {
  lines.push("## Comparison Goal");
  lines.push("");
  lines.push(
    `The goal is to prove that the target CSV matches the source CSV using \`${escapeBackticks(report.keyField)}\` as the row identity. ` +
      "A passing report means the target has the same required rows, no unexpected rows, the same columns, matching column-level distributions, and matching values for rows that share the same key.",
  );
  lines.push("");
  lines.push(
    "When the files do not match, this report explains the issues with row context, inferred field roles, grouped patterns, likely causes, and recommended checks so the data problem can be investigated.",
  );
  lines.push("");
}

function addLogicExplanation(lines: string[], report: CompareReport): void {
  lines.push("## Logic Explanation");
  lines.push("");
  lines.push(markdownTable(
    ["Step", "What it checks", "Why it matters"],
    [
      [
        "1. Parse CSVs",
        "Read headers and rows, preserving each value after optional trimming.",
        "A reliable comparison starts from the same row and column structure the CSVs provide.",
      ],
      [
        "2. Resolve key",
        `Use \`${report.keyField}\` to identify the same business row in both files.`,
        "This proves whether each source record has a matching target record.",
      ],
      [
        "3. Check key uniqueness",
        "Detect duplicate keys in either file.",
        "Duplicate keys make a one-to-one comparison unreliable.",
      ],
      [
        "4. Check row completeness",
        "Find source keys missing from target and target keys not present in source.",
        "This catches missing migrations, rejected rows, extra loads, or mismatched export windows.",
      ],
      [
        "5. Check schema",
        "Find columns that only exist in one file.",
        "This catches dropped fields, renamed fields, or new fields introduced in target.",
      ],
      [
        "6. Check column distributions",
        "Count filled values, blank values, every distinct option, and option count differences for each column.",
        "This catches data drift even when individual row changes are hard to interpret.",
      ],
      [
        "7. Check matched cells",
        "Compare values column-by-column for rows with the same key.",
        "This proves whether matched records carry the same data.",
      ],
      [
        "8. Infer data shape",
        "Classify fields as likely keys, links, audit actors, timestamps, categories, numbers, booleans, or text.",
        "This gives unknown CSV data enough meaning to explain who or what each problem links to.",
      ],
      [
        "9. Explain findings",
        "Rank issues by severity and confidence, then list evidence, likely causes, affected keys, and next checks.",
        "This turns raw differences into investigation guidance.",
      ],
    ],
  ));
  lines.push("");
}

function addIntelligenceLayer(lines: string[], intelligence: CompareReport["analysis"]["intelligence"]): void {
  lines.push("## Intelligence Layer");
  lines.push("");
  lines.push(markdownTable(
    ["Metric", "Value"],
    [
      ["Risk score", `${intelligence.riskScore}/100`],
      ["Verdict", intelligence.verdict],
      ["Findings", String(intelligence.findings.length)],
    ],
  ));
  lines.push("");

  for (const finding of intelligence.findings.slice(0, 12)) {
    addFinding(lines, finding);
  }

  if (intelligence.findings.length > 12) {
    lines.push(`Showing first 12 of ${intelligence.findings.length} findings.`);
    lines.push("");
  }
}

function addFinding(lines: string[], finding: IntelligenceFinding): void {
  lines.push(`### ${escapeMarkdown(finding.title)}`);
  lines.push("");
  lines.push(markdownTable(
    ["Field", "Value"],
    [
      ["Severity", finding.severity],
      ["Confidence", finding.confidence],
      ["Summary", finding.summary],
      ["Related columns", finding.relatedColumns.join(", ")],
      ["Affected keys", finding.affectedKeys.join(", ")],
    ],
  ));
  lines.push("");
  addShortList(lines, "Evidence", finding.evidence);
  addShortList(lines, "Likely causes", finding.likelyCauses);
  addShortList(lines, "Next checks", finding.nextChecks);
}

function addShortList(lines: string[], title: string, items: string[]): void {
  if (items.length === 0) {
    return;
  }
  lines.push(`${title}:`);
  for (const item of items) {
    lines.push(`- ${escapeMarkdown(item)}`);
  }
  lines.push("");
}

function addInferredFields(lines: string[], fields: InferredField[]): void {
  lines.push("## Inferred Data Shape");
  lines.push("");
  lines.push(markdownTable(
    [
      "Column",
      "Likely roles",
      "Pattern",
      "Source complete",
      "Target complete",
      "Source unique",
      "Target unique",
      "Average length",
      "Confidence",
      "Signals",
    ],
    fields.map((field) => [
      field.column,
      field.roles.join(", "),
      field.valuePattern,
      formatRatio(field.sourceCompleteness),
      formatRatio(field.targetCompleteness),
      formatRatio(field.sourceUniqueness),
      formatRatio(field.targetUniqueness),
      String(field.averageLength),
      formatRoleCounts(field.roleConfidence),
      field.signals.join("; "),
    ]),
  ));
  lines.push("");
  lines.push("### Value Summary");
  lines.push("");
  lines.push(markdownTable(
    ["Column", "Source top values", "Target top values"],
    fields.map((field) => [
      field.column,
      formatTopOptions(field.sourceTopOptions),
      formatTopOptions(field.targetTopOptions),
    ]),
  ));
  lines.push("");
}

function addContextColumns(lines: string[], columns: string[]): void {
  lines.push("## Context Columns");
  lines.push("");
  if (columns.length === 0) {
    lines.push("No useful context columns were inferred.");
  } else {
    lines.push(columns.map((column) => `\`${escapeBackticks(column)}\``).join(", "));
  }
  lines.push("");
}

function addProblemGroups(lines: string[], groups: ProblemGroup[]): void {
  lines.push("## All Grouped Problem Counts");
  lines.push("");
  if (groups.length === 0) {
    lines.push("No grouped problems found.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Problem", "Depth", "Grouped by", "Value", "Count", "Keys"],
    groups.map((group) => [
      group.problem,
      String(group.depth),
      group.column,
      showBlank(group.value),
      String(group.count),
      group.sampleKeys.join(", "),
    ]),
  ));
  lines.push("");
}

function addProblemRows(lines: string[], title: string, rows: ProblemRow[]): void {
  lines.push(`## ${title}`);
  lines.push("");
  if (rows.length === 0) {
    lines.push("None.");
    lines.push("");
    return;
  }

  const contextColumns = Object.keys(rows[0]?.context ?? {});
  lines.push(markdownTable(
    ["Key", "CSV row", ...contextColumns],
    rows.map((row) => [
      row.key,
      row.rowNumber === 0 ? "" : String(row.rowNumber),
      ...contextColumns.map((column) => showBlank(row.context[column] ?? "")),
    ]),
  ));
  lines.push("");
}

function addColumnSummary(lines: string[], columnStats: ColumnStats[]): void {
  lines.push("## Column Counts");
  lines.push("");
  lines.push(markdownTable(
    [
      "Column",
      "Source filled",
      "Target filled",
      "Source blank",
      "Target blank",
      "Missing options",
      "Extra options",
      "Count diffs",
    ],
    columnStats.map((stats) => [
      stats.column,
      String(stats.sourceFilled),
      String(stats.targetFilled),
      String(stats.sourceBlank),
      String(stats.targetBlank),
      String(stats.missingOptionsInTarget.length),
      String(stats.extraOptionsInTarget.length),
      String(stats.optionCountDifferences.length),
    ]),
  ));
  lines.push("");
}

function addChangedColumnSummary(lines: string[], changedColumns: ChangedColumnSummary[]): void {
  lines.push("## Changed Columns");
  lines.push("");
  if (changedColumns.length === 0) {
    lines.push("No changed columns found for matched rows.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Column", "Changed cells", "Sample keys", "Source changed values", "Target changed values"],
    changedColumns.map((column) => [
      column.column,
      String(column.changedCells),
      column.sampleKeys.join(", "),
      formatTopOptions(column.sourceTopValues),
      formatTopOptions(column.targetTopValues),
    ]),
  ));
  lines.push("");
}

function addLinkColumns(lines: string[], linkColumns: LinkColumnSummary[]): void {
  lines.push("## Link And Audit Columns");
  lines.push("");
  if (linkColumns.length === 0) {
    lines.push("No likely link or audit actor columns were inferred.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Column", "Source distinct", "Target distinct", "Missing values", "Extra values", "Count differences"],
    linkColumns.map((column) => [
      column.column,
      String(column.sourceDistinct),
      String(column.targetDistinct),
      inlineCodeList(column.missingValuesInTarget),
      inlineCodeList(column.extraValuesInTarget),
      column.countDifferences
        .map((difference) => `${showBlank(difference.value)} (${difference.source} -> ${difference.target})`)
        .join(", "),
    ]),
  ));
  lines.push("");
}

function addColumnOptions(lines: string[], columnStats: ColumnStats[]): void {
  lines.push("## All Column Options");
  lines.push("");

  if (columnStats.length === 0) {
    lines.push("No columns found.");
    lines.push("");
    return;
  }

  for (const stats of columnStats) {
    lines.push(`### ${escapeMarkdown(stats.column)}`);
    lines.push("");
    const values = [...new Set([...Object.keys(stats.sourceOptions), ...Object.keys(stats.targetOptions)])]
      .sort((left, right) => {
        const sourceTotal = stats.sourceOptions[right] ?? 0;
        const targetTotal = stats.targetOptions[right] ?? 0;
        const leftTotal = (stats.sourceOptions[left] ?? 0) + (stats.targetOptions[left] ?? 0);
        const rightTotal = sourceTotal + targetTotal;
        return rightTotal - leftTotal || left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
      });
    lines.push(markdownTable(
      ["Value", "Source count", "Target count", "Difference"],
      values.map((value) => {
        const source = stats.sourceOptions[value] ?? 0;
        const target = stats.targetOptions[value] ?? 0;
        return [
          showBlank(value),
          String(source),
          String(target),
          String(target - source),
        ];
      }),
    ));
    lines.push("");
  }
}

function addCellDifferences(lines: string[], differences: CellDifference[]): void {
  lines.push("## Cell Differences");
  lines.push("");

  if (differences.length === 0) {
    lines.push("No cell differences found for matched rows.");
    lines.push("");
    return;
  }

  lines.push(markdownTable(
    ["Key", "Column", "Source", "Target", "Context"],
    differences.map((difference) => [
      difference.key,
      difference.column,
      showBlank(difference.source),
      showBlank(difference.target),
      formatContext(difference.sourceContext),
    ]),
  ));
  lines.push("");
}

function addListSection(lines: string[], title: string, items: string[]): void {
  lines.push(`## ${title}`);
  lines.push("");
  if (items.length === 0) {
    lines.push("None.");
  } else {
    for (const item of items) {
      lines.push(`- \`${escapeBackticks(showBlank(item))}\``);
    }
  }
  lines.push("");
}

function addDuplicateSection(lines: string[], title: string, duplicates: DuplicateKey[]): void {
  lines.push(`## ${title}`);
  lines.push("");
  if (duplicates.length === 0) {
    lines.push("None.");
  } else {
    lines.push(markdownTable(
      ["Key", "Rows"],
      duplicates.map((duplicate) => [showBlank(duplicate.key), duplicate.rows.join(", ")]),
    ));
  }
  lines.push("");
}

function markdownTable(headers: string[], rows: string[][]): string {
  const escapedHeaders = headers.map(escapeTableCell);
  const escapedRows = rows.map((row) => row.map(escapeTableCell));
  return [
    `| ${escapedHeaders.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...escapedRows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function inlineCodeList(items: string[]): string {
  if (items.length === 0) {
    return "";
  }
  return items.map((item) => `\`${escapeBackticks(showBlank(item))}\``).join(", ");
}

function formatContext(context: Record<string, string>): string {
  return Object.entries(context)
    .map(([key, value]) => `${key}=${showBlank(value)}`)
    .join("; ");
}

function formatTopOptions(options: Array<{ value: string; count: number }>): string {
  return options
    .map((option) => `${showBlank(option.value)} (${option.count})`)
    .join(", ");
}

function formatFullList(values: string[]): string {
  if (values.length === 0) {
    return "";
  }
  return values.join(", ");
}

function formatRatio(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

function formatRoleCounts(counts: Record<string, number>): string {
  return Object.entries(counts)
    .map(([role, count]) => `${role}=${count}`)
    .join(", ");
}

function showBlank(value: string): string {
  return value === "" ? "(blank)" : value;
}

function escapeTableCell(value: string): string {
  return escapeMarkdown(value).replaceAll("\n", "<br>");
}

function escapeMarkdown(value: string): string {
  return value.replaceAll("|", "\\|");
}

function escapeBackticks(value: string): string {
  return value.replaceAll("`", "\\`");
}
