import type { CsvRow, ParsedCsv } from "./csv";

export interface CompareOptions {
  keyField: string;
  compareValues: boolean;
  contextFields: string[];
  groupDepth: number;
  violationMinSupport: number;
  dedupeRules: boolean;
}

export interface DuplicateKey {
  key: string;
  rows: number[];
}

export interface ColumnStats {
  column: string;
  existsInSource: boolean;
  existsInTarget: boolean;
  sourceFilled: number;
  sourceBlank: number;
  targetFilled: number;
  targetBlank: number;
  sourceOptions: Record<string, number>;
  targetOptions: Record<string, number>;
  missingOptionsInTarget: string[];
  extraOptionsInTarget: string[];
  optionCountDifferences: Array<{
    option: string;
    source: number;
    target: number;
  }>;
}

export interface CellDifference {
  key: string;
  column: string;
  source: string;
  target: string;
  sourceContext: Record<string, string>;
  targetContext: Record<string, string>;
}

export interface InferredField {
  column: string;
  roles: string[];
  roleConfidence: Record<string, number>;
  valuePattern: string;
  signals: string[];
  sourceFilled: number;
  targetFilled: number;
  sourceDistinct: number;
  targetDistinct: number;
  sourceCompleteness: number;
  targetCompleteness: number;
  sourceUniqueness: number;
  targetUniqueness: number;
  averageLength: number;
  sourceTopOptions: Array<{ value: string; count: number }>;
  targetTopOptions: Array<{ value: string; count: number }>;
}

export interface ProblemRow {
  key: string;
  rowNumber: number;
  context: Record<string, string>;
}

export interface ProblemGroup {
  problem: "missing_in_target" | "extra_in_target" | "cell_difference" | "row_group";
  column: string;
  value: string;
  depth: number;
  count: number;
  sampleKeys: string[];
}

export interface ChangedColumnSummary {
  column: string;
  changedCells: number;
  sampleKeys: string[];
  sourceTopValues: Array<{ value: string; count: number }>;
  targetTopValues: Array<{ value: string; count: number }>;
}

export interface LinkColumnSummary {
  column: string;
  sourceDistinct: number;
  targetDistinct: number;
  missingValuesInTarget: string[];
  extraValuesInTarget: string[];
  countDifferences: Array<{ value: string; source: number; target: number }>;
}

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface IntelligenceFinding {
  severity: FindingSeverity;
  confidence: "high" | "medium" | "low";
  title: string;
  summary: string;
  evidence: string[];
  likelyCauses: string[];
  nextChecks: string[];
  relatedColumns: string[];
  affectedKeys: string[];
}

export interface IntelligenceLayer {
  riskScore: number;
  verdict: string;
  findings: IntelligenceFinding[];
}

export interface LocalAiNarrative {
  provider: string;
  model: string;
  generatedAt: string;
  promptScope: string;
  text?: string;
  error?: string;
}

export interface DataProfile {
  sourceColumns: number;
  targetColumns: number;
  sharedColumns: number;
  matchCoverageSource: number;
  matchCoverageTarget: number;
  changedMatchedRows: number;
  inferredRoleCounts: Record<string, number>;
  candidateKeyColumns: string[];
  highBlankColumns: string[];
  highCardinalityColumns: string[];
}

export interface IssueLayer {
  layer: "completeness" | "schema" | "values" | "relationships" | "audit" | "time";
  severity: FindingSeverity;
  summary: string;
  evidence: string[];
  relatedColumns: string[];
}

export interface GroupInsight {
  problem: ProblemGroup["problem"];
  groupBy: string;
  value: string;
  depth: number;
  count: number;
  shareOfProblem: number;
  interpretation: string;
  sampleKeys: string[];
}

export interface NearMatch {
  sourceKey: string;
  targetKey: string;
  score: number;
  matchedFields: string[];
  differentFields: Array<{ column: string; source: string; target: string }>;
}

export interface ColumnImpact {
  column: string;
  score: number;
  reasons: string[];
}

export interface RelationshipInsight {
  column: string;
  role: "link" | "audit_actor" | "actor";
  summary: string;
  evidence: string[];
  nextChecks: string[];
}

export interface ColumnFamily {
  family: string;
  label: string;
  columnCount: number;
  columns: string[];
  identifierColumns: string[];
  statusColumns: string[];
  dateColumns: string[];
  unknownMarkerColumns: string[];
  flagColumns: string[];
  measureColumns: string[];
  textColumns: string[];
}

export interface ValueDependencyRule {
  antecedentColumn: string;
  antecedentValue: string;
  consequentColumn: string;
  consequentValue: string;
  support: number;
  matches: number;
  confidence: number;
  strict: boolean;
}

export interface RuleViolation {
  antecedentColumn: string;
  antecedentValue: string;
  consequentColumn: string;
  expectedValue: string;
  sourceSupport: number;
  violatingKeys: string[];
  observedValues: Array<{ value: string; count: number }>;
}

export interface ValueDependencyLayer {
  eligibleColumns: string[];
  rules: ValueDependencyRule[];
  violations: RuleViolation[];
}

export interface AnalyticsLayer {
  dataProfile: DataProfile;
  issueLayers: IssueLayer[];
  groupInsights: GroupInsight[];
  nearMatches: NearMatch[];
  columnImpact: ColumnImpact[];
  relationshipInsights: RelationshipInsight[];
  valueDependencies: ValueDependencyLayer;
}

export interface DetailedAnalysis {
  inferredFields: InferredField[];
  contextColumns: string[];
  missingRows: ProblemRow[];
  extraRows: ProblemRow[];
  problemGroups: ProblemGroup[];
  changedColumns: ChangedColumnSummary[];
  linkColumns: LinkColumnSummary[];
  columnFamilies: ColumnFamily[];
  analytics: AnalyticsLayer;
  intelligence: IntelligenceLayer;
  localAi?: LocalAiNarrative;
}

export interface CompareReport {
  sourcePath: string;
  targetPath: string;
  keyField: string;
  generatedAt: string;
  sourceRows: number;
  targetRows: number;
  matchedRows: number;
  missingInTarget: string[];
  extraInTarget: string[];
  duplicateKeysInSource: DuplicateKey[];
  duplicateKeysInTarget: DuplicateKey[];
  sourceOnlyColumns: string[];
  targetOnlyColumns: string[];
  columnStats: ColumnStats[];
  cellDifferences: CellDifference[];
  analysis: DetailedAnalysis;
  passed: boolean;
}

export interface CsvProfileSummary {
  rows: number;
  columns: number;
  inferredRoleCounts: Record<string, number>;
  candidateKeyColumns: string[];
  highBlankColumns: string[];
  highCardinalityColumns: string[];
  likelyLinkColumns: string[];
  likelyAuditColumns: string[];
  likelyTimestampColumns: string[];
}

export interface CsvProfileAnalysis {
  inferredFields: InferredField[];
  contextColumns: string[];
  rowGroups: ProblemGroup[];
  groupInsights: GroupInsight[];
  linkColumns: LinkColumnSummary[];
  columnFamilies: ColumnFamily[];
  valueDependencies: ValueDependencyLayer;
  profile: CsvProfileSummary;
}

export interface CsvProfileReport {
  mode: "profile";
  sourcePath: string;
  generatedAt: string;
  rows: number;
  columns: number;
  keyField: string;
  duplicateKeys: DuplicateKey[];
  columnStats: ColumnStats[];
  analysis: CsvProfileAnalysis;
}

// Reports progress as a 0..1 fraction with a label for the phase just completed.
export type ProgressReporter = (fraction: number, phase: string) => void;
type ProgressAdvance = (weight: number, phase: string) => void;

interface BuildReportInput {
  sourcePath: string;
  targetPath: string;
  source: ParsedCsv;
  target: ParsedCsv;
  options: CompareOptions;
  onProgress?: ProgressReporter;
}

const DEFAULT_GROUP_DEPTH = 3;
const MAX_GROUP_DEPTH = 5;
const GROUPING_CONTEXT_LIMIT = 8;
const DEFAULT_VIOLATION_MIN_SUPPORT = 2;

// Relative cost of each generation phase, used to weight the progress fraction.
// Value-rule mining and field inference dominate on wide files, so they weigh more.
const PROGRESS_WEIGHT = {
  index: 1,
  columns: 1,
  cells: 2,
  inferFields: 2,
  grouping: 2,
  analytics: 1,
  valueDeps: 2,
  intelligence: 1,
} as const;

function createAdvance(total: number, report: ProgressReporter | undefined): ProgressAdvance {
  let done = 0;
  return (weight, phase) => {
    done += weight;
    if (report !== undefined) {
      report(total <= 0 ? 1 : Math.min(1, done / total), phase);
    }
  };
}

export function defaultGroupDepth(): number {
  return DEFAULT_GROUP_DEPTH;
}

export function maxGroupDepth(): number {
  return MAX_GROUP_DEPTH;
}

export function defaultViolationMinSupport(): number {
  return DEFAULT_VIOLATION_MIN_SUPPORT;
}

function normalizeGroupDepth(groupDepth: number): number {
  if (!Number.isFinite(groupDepth) || groupDepth <= 0) {
    return DEFAULT_GROUP_DEPTH;
  }
  return Math.min(MAX_GROUP_DEPTH, Math.floor(groupDepth));
}

export function buildCompareReport(input: BuildReportInput): CompareReport {
  const { source, target, options } = input;
  const keyField = resolveKeyField(options.keyField, source.headers, target.headers);

  if (!source.headers.includes(keyField)) {
    throw new Error(`Source CSV does not contain key field "${keyField}".`);
  }
  if (!target.headers.includes(keyField)) {
    throw new Error(`Target CSV does not contain key field "${keyField}".`);
  }

  const totalWeight =
    PROGRESS_WEIGHT.index +
    PROGRESS_WEIGHT.columns +
    (options.compareValues ? PROGRESS_WEIGHT.cells : 0) +
    PROGRESS_WEIGHT.inferFields +
    PROGRESS_WEIGHT.grouping +
    PROGRESS_WEIGHT.analytics +
    PROGRESS_WEIGHT.valueDeps +
    PROGRESS_WEIGHT.intelligence;
  const advance = createAdvance(totalWeight, input.onProgress);

  const sourceIndex = indexRowsByKey(source.rows, keyField);
  const targetIndex = indexRowsByKey(target.rows, keyField);
  const sourceKeys = [...sourceIndex.uniqueRows.keys()].sort(compareKeys);
  const targetKeys = [...targetIndex.uniqueRows.keys()].sort(compareKeys);
  const targetKeySet = new Set(targetKeys);
  const sourceKeySet = new Set(sourceKeys);
  const missingInTarget = sourceKeys.filter((key) => !targetKeySet.has(key));
  const extraInTarget = targetKeys.filter((key) => !sourceKeySet.has(key));
  const matchedKeys = sourceKeys.filter((key) => targetKeySet.has(key));
  const allColumns = unique([...source.headers, ...target.headers]).sort();
  const sourceOnlyColumns = source.headers.filter((header) => !target.headers.includes(header)).sort();
  const targetOnlyColumns = target.headers.filter((header) => !source.headers.includes(header)).sort();
  advance(PROGRESS_WEIGHT.index, "Indexing keys");

  const columnStats = allColumns.map((column) =>
    buildColumnStats(column, source, target),
  );
  advance(PROGRESS_WEIGHT.columns, "Comparing columns");

  const cellDifferences = options.compareValues
    ? buildCellDifferences(matchedKeys, sourceIndex.uniqueRows, targetIndex.uniqueRows, source.headers, target.headers, keyField)
    : [];
  if (options.compareValues) {
    advance(PROGRESS_WEIGHT.cells, "Comparing cell values");
  }
  const analysisWithoutIntelligence = buildDetailedAnalysis({
    keyField,
    requestedContextFields: options.contextFields,
    groupDepth: options.groupDepth,
    violationMinSupport: options.violationMinSupport,
    dedupeRules: options.dedupeRules,
    allColumns,
    source,
    target,
    sourceRowsByKey: sourceIndex.uniqueRows,
    targetRowsByKey: targetIndex.uniqueRows,
    missingInTarget,
    extraInTarget,
    cellDifferences,
    columnStats,
    onAdvance: advance,
  });

  const passed =
    missingInTarget.length === 0 &&
    extraInTarget.length === 0 &&
    sourceIndex.duplicates.length === 0 &&
    targetIndex.duplicates.length === 0 &&
    sourceOnlyColumns.length === 0 &&
    targetOnlyColumns.length === 0 &&
    columnStats.every((stats) => columnStatsMatch(stats)) &&
    cellDifferences.length === 0;
  const analysis: DetailedAnalysis = {
    ...analysisWithoutIntelligence,
    intelligence: buildIntelligenceLayer({
      passed,
      keyField,
      sourceRows: source.rows.length,
      targetRows: target.rows.length,
      matchedRows: matchedKeys.length,
      missingInTarget,
      extraInTarget,
      duplicateKeysInSource: sourceIndex.duplicates,
      duplicateKeysInTarget: targetIndex.duplicates,
      sourceOnlyColumns,
      targetOnlyColumns,
      columnStats,
      cellDifferences,
      analysis: analysisWithoutIntelligence,
    }),
  };
  advance(PROGRESS_WEIGHT.intelligence, "Scoring intelligence");

  return {
    sourcePath: input.sourcePath,
    targetPath: input.targetPath,
    keyField,
    generatedAt: new Date().toISOString(),
    sourceRows: source.rows.length,
    targetRows: target.rows.length,
    matchedRows: matchedKeys.length,
    missingInTarget,
    extraInTarget,
    duplicateKeysInSource: sourceIndex.duplicates,
    duplicateKeysInTarget: targetIndex.duplicates,
    sourceOnlyColumns,
    targetOnlyColumns,
    columnStats,
    cellDifferences,
    analysis,
    passed,
  };
}

interface BuildProfileInput {
  sourcePath: string;
  source: ParsedCsv;
  options: Pick<CompareOptions, "keyField" | "contextFields" | "groupDepth" | "dedupeRules">;
  onProgress?: ProgressReporter;
}

export function buildCsvProfileReport(input: BuildProfileInput): CsvProfileReport {
  const totalWeight =
    PROGRESS_WEIGHT.inferFields +
    PROGRESS_WEIGHT.grouping +
    PROGRESS_WEIGHT.columns +
    PROGRESS_WEIGHT.valueDeps;
  const advance = createAdvance(totalWeight, input.onProgress);

  const provisionalFields = input.source.headers.map((column) =>
    inferField(column, "", input.source.rows, input.source.rows),
  );
  const keyField = resolveProfileKeyField(input.options.keyField, input.source.headers, provisionalFields);
  const inferredFields = input.source.headers.map((column) =>
    inferField(column, keyField, input.source.rows, input.source.rows),
  );
  advance(PROGRESS_WEIGHT.inferFields, "Inferring field roles");
  const contextColumns = chooseContextColumns(keyField, inferredFields, input.options.contextFields);
  const groupingColumns = contextColumns.filter((column) => column !== keyField);
  const groupDepth = normalizeGroupDepth(input.options.groupDepth);
  const timestampColumns = new Set(
    inferredFields
      .filter((field) => field.roles.includes("timestamp"))
      .map((field) => field.column),
  );
  const profileRows = buildProfileRows(input.source.rows, keyField, contextColumns);
  const rowGroups = buildGroups("row_group", profileRows, groupingColumns, timestampColumns, groupDepth);
  advance(PROGRESS_WEIGHT.grouping, "Grouping rows");
  const columnStats = input.source.headers.map((column) =>
    buildColumnStats(column, input.source, input.source),
  );
  const columnFamilies = buildColumnFamilies(input.source.headers, inferredFields);
  const ruleColumns = ruleEligibleColumns(input.source.headers, inferredFields, keyField);
  advance(PROGRESS_WEIGHT.columns, "Profiling columns");
  const valueDependencyRules = maybeDedupeRules(buildValueDependencyRules(input.source.rows, ruleColumns), input.options.dedupeRules);
  advance(PROGRESS_WEIGHT.valueDeps, "Mining value rules");

  return {
    mode: "profile",
    sourcePath: input.sourcePath,
    generatedAt: new Date().toISOString(),
    rows: input.source.rows.length,
    columns: input.source.headers.length,
    keyField,
    duplicateKeys: keyField === "" ? [] : indexRowsByKey(input.source.rows, keyField).duplicates,
    columnStats,
    analysis: {
      inferredFields,
      contextColumns,
      rowGroups,
      groupInsights: buildGroupInsights(rowGroups, 0, 0, 0, input.source.rows.length),
      linkColumns: buildLinkColumnSummaries(columnStats, inferredFields),
      columnFamilies,
      valueDependencies: {
        eligibleColumns: ruleColumns,
        rules: valueDependencyRules,
        violations: [],
      },
      profile: buildCsvProfileSummary(input.source, inferredFields),
    },
  };
}

function resolveKeyField(requested: string, sourceHeaders: string[], targetHeaders: string[]): string {
  if (requested !== "") {
    return requested;
  }

  const candidate = ["ID", "Id", "id"].find(
    (field) => sourceHeaders.includes(field) && targetHeaders.includes(field),
  );

  if (candidate === undefined) {
    throw new Error('No key field was provided and no shared "ID" column was found. Use --key <field>.');
  }

  return candidate;
}

function resolveProfileKeyField(requested: string, headers: string[], fields: InferredField[]): string {
  if (requested !== "") {
    if (!headers.includes(requested)) {
      throw new Error(`CSV does not contain key field "${requested}".`);
    }
    return requested;
  }

  const scoredIdentifiers = headers
    .map((header) => ({
      header,
      score: scoreIdentifierColumn(header),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || compareKeys(left.header, right.header));
  if (scoredIdentifiers[0] !== undefined) {
    return scoredIdentifiers[0].header;
  }

  const inferredCandidate = fields.find((field) => field.roles.includes("candidate_key"));
  return inferredCandidate?.column ?? "";
}

function indexRowsByKey(rows: CsvRow[], keyField: string): {
  uniqueRows: Map<string, IndexedRow>;
  duplicates: DuplicateKey[];
} {
  const rowsByKey = new Map<string, Array<{ row: CsvRow; rowNumber: number }>>();

  rows.forEach((row, index) => {
    const key = row[keyField] ?? "";
    const entries = rowsByKey.get(key) ?? [];
    entries.push({ row, rowNumber: index + 2 });
    rowsByKey.set(key, entries);
  });

  const uniqueRows = new Map<string, IndexedRow>();
  const duplicates: DuplicateKey[] = [];

  for (const [key, entries] of rowsByKey.entries()) {
    if (entries.length === 1) {
      uniqueRows.set(key, entries[0]);
    } else {
      duplicates.push({ key, rows: entries.map((entry) => entry.rowNumber) });
    }
  }

  duplicates.sort((left, right) => compareKeys(left.key, right.key));
  return { uniqueRows, duplicates };
}

function buildColumnStats(column: string, source: ParsedCsv, target: ParsedCsv): ColumnStats {
  const existsInSource = source.headers.includes(column);
  const existsInTarget = target.headers.includes(column);
  const sourceValues = existsInSource ? source.rows.map((row) => row[column] ?? "") : [];
  const targetValues = existsInTarget ? target.rows.map((row) => row[column] ?? "") : [];
  const sourceOptions = countOptions(sourceValues);
  const targetOptions = countOptions(targetValues);
  const sourceOptionSet = new Set(Object.keys(sourceOptions));
  const targetOptionSet = new Set(Object.keys(targetOptions));
  const sharedOptions = [...sourceOptionSet].filter((option) => targetOptionSet.has(option));

  return {
    column,
    existsInSource,
    existsInTarget,
    sourceFilled: countFilled(sourceValues),
    sourceBlank: sourceValues.length - countFilled(sourceValues),
    targetFilled: countFilled(targetValues),
    targetBlank: targetValues.length - countFilled(targetValues),
    sourceOptions,
    targetOptions,
    missingOptionsInTarget: [...sourceOptionSet].filter((option) => !targetOptionSet.has(option)).sort(compareKeys),
    extraOptionsInTarget: [...targetOptionSet].filter((option) => !sourceOptionSet.has(option)).sort(compareKeys),
    optionCountDifferences: sharedOptions
      .filter((option) => sourceOptions[option] !== targetOptions[option])
      .sort(compareKeys)
      .map((option) => ({
        option,
        source: sourceOptions[option],
        target: targetOptions[option],
      })),
  };
}

function buildCellDifferences(
  matchedKeys: string[],
  sourceRows: Map<string, IndexedRow>,
  targetRows: Map<string, IndexedRow>,
  sourceHeaders: string[],
  targetHeaders: string[],
  keyField: string,
): CellDifference[] {
  const sharedColumns = sourceHeaders
    .filter((header) => targetHeaders.includes(header) && header !== keyField)
    .sort();
  const differences: CellDifference[] = [];

  for (const key of matchedKeys) {
    const sourceEntry = sourceRows.get(key);
    const targetEntry = targetRows.get(key);
    if (sourceEntry === undefined || targetEntry === undefined) {
      continue;
    }

    for (const column of sharedColumns) {
      const source = sourceEntry.row[column] ?? "";
      const target = targetEntry.row[column] ?? "";
      if (source !== target) {
        differences.push({
          key,
          column,
          source,
          target,
          sourceContext: {},
          targetContext: {},
        });
      }
    }
  }

  return differences;
}

interface IndexedRow {
  row: CsvRow;
  rowNumber: number;
}

type DetailedAnalysisWithoutIntelligence = Omit<DetailedAnalysis, "intelligence">;

interface DetailedAnalysisInput {
  keyField: string;
  requestedContextFields: string[];
  groupDepth: number;
  violationMinSupport: number;
  dedupeRules: boolean;
  allColumns: string[];
  source: ParsedCsv;
  target: ParsedCsv;
  sourceRowsByKey: Map<string, IndexedRow>;
  targetRowsByKey: Map<string, IndexedRow>;
  missingInTarget: string[];
  extraInTarget: string[];
  cellDifferences: CellDifference[];
  columnStats: ColumnStats[];
  onAdvance?: ProgressAdvance;
}

function buildDetailedAnalysis(input: DetailedAnalysisInput): DetailedAnalysisWithoutIntelligence {
  const inferredFields = input.allColumns.map((column) =>
    inferField(column, input.keyField, input.source.rows, input.target.rows),
  );
  input.onAdvance?.(PROGRESS_WEIGHT.inferFields, "Inferring field roles");
  const contextColumns = chooseContextColumns(input.keyField, inferredFields, input.requestedContextFields);
  const groupingColumns = contextColumns.filter((column) => column !== input.keyField);
  const groupDepth = normalizeGroupDepth(input.groupDepth);
  const missingRows = buildProblemRows(input.missingInTarget, input.sourceRowsByKey, contextColumns);
  const extraRows = buildProblemRows(input.extraInTarget, input.targetRowsByKey, contextColumns);
  const enrichedCellDifferences = input.cellDifferences.map((difference) => {
    const sourceEntry = input.sourceRowsByKey.get(difference.key);
    const targetEntry = input.targetRowsByKey.get(difference.key);
    return {
      ...difference,
      sourceContext: sourceEntry === undefined ? {} : pickContext(sourceEntry.row, contextColumns),
      targetContext: targetEntry === undefined ? {} : pickContext(targetEntry.row, contextColumns),
    };
  });

  input.cellDifferences.splice(0, input.cellDifferences.length, ...enrichedCellDifferences);
  const timestampColumns = new Set(
    inferredFields
      .filter((field) => field.roles.includes("timestamp"))
      .map((field) => field.column),
  );
  const problemGroups = [
    ...buildGroups("missing_in_target", missingRows, groupingColumns, timestampColumns, groupDepth),
    ...buildGroups("extra_in_target", extraRows, groupingColumns, timestampColumns, groupDepth),
    ...buildCellDifferenceGroups(enrichedCellDifferences, groupingColumns, timestampColumns, groupDepth),
  ];
  const changedColumns = buildChangedColumnSummaries(enrichedCellDifferences);
  const linkColumns = buildLinkColumnSummaries(input.columnStats, inferredFields);
  const columnFamilies = buildColumnFamilies(input.allColumns, inferredFields);
  input.onAdvance?.(PROGRESS_WEIGHT.grouping, "Grouping rows");

  return {
    inferredFields,
    contextColumns,
    missingRows,
    extraRows,
    problemGroups,
    changedColumns,
    linkColumns,
    columnFamilies,
    analytics: buildAnalyticsLayer({
      keyField: input.keyField,
      violationMinSupport: input.violationMinSupport,
      dedupeRules: input.dedupeRules,
      source: input.source,
      target: input.target,
      allColumns: input.allColumns,
      inferredFields,
      missingRows,
      extraRows,
      problemGroups,
      changedColumns,
      linkColumns,
      columnStats: input.columnStats,
      cellDifferences: enrichedCellDifferences,
      onAdvance: input.onAdvance,
    }),
  };
}

interface AnalyticsInput {
  keyField: string;
  violationMinSupport: number;
  dedupeRules: boolean;
  source: ParsedCsv;
  target: ParsedCsv;
  allColumns: string[];
  inferredFields: InferredField[];
  missingRows: ProblemRow[];
  extraRows: ProblemRow[];
  problemGroups: ProblemGroup[];
  changedColumns: ChangedColumnSummary[];
  linkColumns: LinkColumnSummary[];
  columnStats: ColumnStats[];
  cellDifferences: CellDifference[];
  onAdvance?: ProgressAdvance;
}

function buildAnalyticsLayer(input: AnalyticsInput): AnalyticsLayer {
  const layer = {
    dataProfile: buildDataProfile(input),
    issueLayers: buildIssueLayers(input),
    groupInsights: buildGroupInsights(input.problemGroups, input.missingRows.length, input.extraRows.length, input.cellDifferences.length),
    nearMatches: buildNearMatches(input.missingRows, input.extraRows, input.keyField),
    columnImpact: buildColumnImpact(input.columnStats, input.changedColumns, input.inferredFields),
    relationshipInsights: buildRelationshipInsights(input.linkColumns, input.inferredFields),
  };
  input.onAdvance?.(PROGRESS_WEIGHT.analytics, "Scoring analytics");

  const valueDependencies = buildValueDependencyLayer({
    keyField: input.keyField,
    violationMinSupport: input.violationMinSupport,
    dedupeRules: input.dedupeRules,
    sourceHeaders: input.source.headers,
    targetHeaders: input.target.headers,
    allColumns: input.allColumns,
    inferredFields: input.inferredFields,
    sourceRows: input.source.rows,
    targetRows: input.target.rows,
  });
  input.onAdvance?.(PROGRESS_WEIGHT.valueDeps, "Mining value rules");
  return {
    ...layer,
    valueDependencies,
  };
}

function buildDataProfile(input: AnalyticsInput): DataProfile {
  const roleCounts: Record<string, number> = {};
  for (const field of input.inferredFields) {
    for (const role of field.roles) {
      roleCounts[role] = (roleCounts[role] ?? 0) + 1;
    }
  }

  const changedMatchedRows = unique(input.cellDifferences.map((difference) => difference.key)).length;
  return {
    sourceColumns: input.source.headers.length,
    targetColumns: input.target.headers.length,
    sharedColumns: input.source.headers.filter((header) => input.target.headers.includes(header)).length,
    matchCoverageSource: ratio(input.source.rows.length - input.missingRows.length, input.source.rows.length),
    matchCoverageTarget: ratio(input.target.rows.length - input.extraRows.length, input.target.rows.length),
    changedMatchedRows,
    inferredRoleCounts: sortRecord(roleCounts),
    candidateKeyColumns: input.inferredFields
      .filter((field) => field.roles.includes("candidate_key") || field.roles.includes("match_key"))
      .map((field) => field.column),
    highBlankColumns: input.inferredFields
      .filter((field) => field.sourceCompleteness < 0.8 || field.targetCompleteness < 0.8)
      .map((field) => field.column),
    highCardinalityColumns: input.inferredFields
      .filter((field) => field.sourceUniqueness >= 0.8 || field.targetUniqueness >= 0.8)
      .map((field) => field.column),
  };
}

function buildIssueLayers(input: AnalyticsInput): IssueLayer[] {
  const layers: IssueLayer[] = [];
  const schemaDiffs = input.columnStats.filter((stats) => stats.existsInSource !== stats.existsInTarget);
  const valueDiffColumns = input.changedColumns.map((column) => column.column);
  const relationshipColumns = input.linkColumns
    .filter((column) =>
      column.missingValuesInTarget.length > 0 ||
      column.extraValuesInTarget.length > 0 ||
      column.countDifferences.length > 0,
    )
    .map((column) => column.column);
  const auditColumns = relationshipColumns.filter((column) =>
    input.inferredFields.some((field) => field.column === column && field.roles.includes("audit_actor")),
  );
  const timeColumns = input.changedColumns
    .filter((column) =>
      input.inferredFields.some((field) => field.column === column.column && field.roles.includes("timestamp")),
    )
    .map((column) => column.column);

  layers.push({
    layer: "completeness",
    severity: input.missingRows.length > 0 || input.extraRows.length > 0 ? "high" : "info",
    summary: `${input.missingRows.length} missing source row(s), ${input.extraRows.length} extra target row(s).`,
    evidence: [
      `Source match coverage: ${percent(ratio(input.source.rows.length - input.missingRows.length, input.source.rows.length))}`,
      `Target match coverage: ${percent(ratio(input.target.rows.length - input.extraRows.length, input.target.rows.length))}`,
    ],
    relatedColumns: [input.keyField],
  });

  layers.push({
    layer: "schema",
    severity: schemaDiffs.length > 0 ? "high" : "info",
    summary: schemaDiffs.length === 0 ? "No schema-only differences found." : `${schemaDiffs.length} column(s) exist in only one file.`,
    evidence: schemaDiffs.map((stats) => `${stats.column}: source=${stats.existsInSource}, target=${stats.existsInTarget}`),
    relatedColumns: schemaDiffs.map((stats) => stats.column),
  });

  layers.push({
    layer: "values",
    severity: valueDiffColumns.length > 0 ? "high" : "info",
    summary: `${input.cellDifferences.length} cell difference(s) across ${valueDiffColumns.length} column(s).`,
    evidence: input.changedColumns.slice(0, 8).map((column) => `${column.column}: ${column.changedCells} changed cell(s).`),
    relatedColumns: valueDiffColumns,
  });

  layers.push({
    layer: "relationships",
    severity: relationshipColumns.length > 0 ? "high" : "info",
    summary: relationshipColumns.length === 0 ? "No relationship/link drift found." : `${relationshipColumns.length} likely link or actor column(s) drifted.`,
    evidence: input.linkColumns
      .filter((column) => relationshipColumns.includes(column.column))
      .slice(0, 8)
      .map((column) => `${column.column}: ${column.missingValuesInTarget.length} missing value(s), ${column.extraValuesInTarget.length} extra value(s), ${column.countDifferences.length} count diff(s)`),
    relatedColumns: relationshipColumns,
  });

  layers.push({
    layer: "audit",
    severity: auditColumns.length > 0 ? "medium" : "info",
    summary: auditColumns.length === 0 ? "No audit actor drift found." : `${auditColumns.length} audit actor column(s) changed distribution.`,
    evidence: auditColumns.map((column) => `${column} has changed actor distribution`),
    relatedColumns: auditColumns,
  });

  layers.push({
    layer: "time",
    severity: timeColumns.length > 0 ? "low" : "info",
    summary: timeColumns.length === 0 ? "No changed timestamp fields found." : `${timeColumns.length} timestamp column(s) changed on matched rows.`,
    evidence: timeColumns.map((column) => `${column} changed on matched rows`),
    relatedColumns: timeColumns,
  });

  return layers;
}

function buildGroupInsights(
  groups: ProblemGroup[],
  missingCount: number,
  extraCount: number,
  cellDifferenceCount: number,
  rowCount = 0,
): GroupInsight[] {
  return groups
    .map((group) => {
      const total = group.problem === "missing_in_target"
        ? missingCount
        : group.problem === "extra_in_target"
          ? extraCount
          : group.problem === "cell_difference"
            ? cellDifferenceCount
            : rowCount;
      const share = ratio(group.count, total);
      return {
        problem: group.problem,
        groupBy: group.column,
        value: group.value,
        depth: group.depth,
        count: group.count,
        shareOfProblem: share,
        interpretation: interpretGroup(group, share),
        sampleKeys: group.sampleKeys,
      };
    })
    .filter((group) => group.count > 0)
    .sort((left, right) =>
      right.shareOfProblem - left.shareOfProblem ||
      right.count - left.count ||
      right.depth - left.depth ||
      compareKeys(left.groupBy, right.groupBy)
    );
}

function buildNearMatches(missingRows: ProblemRow[], extraRows: ProblemRow[], keyField: string): NearMatch[] {
  const matches: NearMatch[] = [];

  for (const missing of missingRows.slice(0, 100)) {
    for (const extra of extraRows.slice(0, 100)) {
      const comparableColumns = Object.keys(missing.context)
        .filter((column) => column !== keyField && extra.context[column] !== undefined);
      if (comparableColumns.length === 0) {
        continue;
      }

      const matchedFields = comparableColumns.filter((column) =>
        missing.context[column] !== "" && missing.context[column] === extra.context[column],
      );
      const differentFields = comparableColumns
        .filter((column) => missing.context[column] !== extra.context[column])
        .map((column) => ({
          column,
          source: missing.context[column] ?? "",
          target: extra.context[column] ?? "",
        }));
      const score = Math.round(ratio(matchedFields.length, comparableColumns.length) * 100);

      if (score >= 50) {
        matches.push({
          sourceKey: missing.key,
          targetKey: extra.key,
          score,
          matchedFields,
          differentFields: differentFields.slice(0, 8),
        });
      }
    }
  }

  return matches.sort((left, right) => right.score - left.score).slice(0, 25);
}

function buildColumnImpact(
  columnStats: ColumnStats[],
  changedColumns: ChangedColumnSummary[],
  inferredFields: InferredField[],
): ColumnImpact[] {
  return columnStats
    .map((stats) => {
      const reasons: string[] = [];
      let score = 0;
      const changed = changedColumns.find((column) => column.column === stats.column);
      const field = inferredFields.find((item) => item.column === stats.column);

      if (stats.existsInSource !== stats.existsInTarget) {
        score += 40;
        reasons.push("column exists in only one file");
      }
      if (stats.sourceFilled !== stats.targetFilled || stats.sourceBlank !== stats.targetBlank) {
        score += 20;
        reasons.push("filled/blank counts differ");
      }
      if (stats.missingOptionsInTarget.length > 0) {
        score += 15;
        reasons.push(`${stats.missingOptionsInTarget.length} source option(s) missing in target`);
      }
      if (stats.extraOptionsInTarget.length > 0) {
        score += 15;
        reasons.push(`${stats.extraOptionsInTarget.length} extra target option(s)`);
      }
      if (stats.optionCountDifferences.length > 0) {
        score += 10;
        reasons.push(`${stats.optionCountDifferences.length} option count difference(s)`);
      }
      if (changed !== undefined) {
        score += Math.min(30, changed.changedCells * 10);
        reasons.push(`${changed.changedCells} matched-row cell change(s)`);
      }
      if (field?.roles.includes("link") === true || field?.roles.includes("audit_actor") === true) {
        score += 10;
        reasons.push(`important ${field.roles.includes("link") ? "link" : "audit"} field`);
      }
      if (field?.roles.includes("timestamp") === true) {
        score += 5;
        reasons.push("timestamp field");
      }

      return { column: stats.column, score: Math.min(100, score), reasons };
    })
    .filter((impact) => impact.score > 0)
    .sort((left, right) => right.score - left.score || compareKeys(left.column, right.column))
    .slice(0, 30);
}

function buildRelationshipInsights(linkColumns: LinkColumnSummary[], fields: InferredField[]): RelationshipInsight[] {
  return linkColumns
    .filter((column) =>
      column.missingValuesInTarget.length > 0 ||
      column.extraValuesInTarget.length > 0 ||
      column.countDifferences.length > 0,
    )
    .map((column) => {
      const field = fields.find((item) => item.column === column.column);
      const role: RelationshipInsight["role"] = field?.roles.includes("audit_actor") === true
        ? "audit_actor"
        : field?.roles.includes("actor") === true
          ? "actor"
          : "link";
      return {
        column: column.column,
        role,
        summary: role === "audit_actor" || role === "actor"
          ? `${column.column} indicates who touched records. Its distribution changed between source and target.`
          : `${column.column} looks like a relationship/link field. Its target distribution does not match source.`,
        evidence: [
          `Missing values: ${formatList(column.missingValuesInTarget)}.`,
          `Extra values: ${formatList(column.extraValuesInTarget)}.`,
          `Count differences: ${column.countDifferences.length}.`,
        ],
        nextChecks: role === "audit_actor" || role === "actor"
          ? ["Check whether target import overwrote audit metadata.", "Identify whether extra actors are migration users or expected business users."]
          : [`Trace missing and extra ${column.column} values to parent records.`, "Confirm related records loaded before dependent rows."],
      };
    });
}

interface ValueDependencyInput {
  keyField: string;
  violationMinSupport: number;
  dedupeRules: boolean;
  sourceHeaders: string[];
  targetHeaders: string[];
  allColumns: string[];
  inferredFields: InferredField[];
  sourceRows: CsvRow[];
  targetRows: CsvRow[];
}

// Columns that carry meaningful "values" to reason about. Identity keys and free
// text are skipped because a rule like "Name=Ada => ..." just restates one row.
function ruleEligibleColumns(columns: string[], inferredFields: InferredField[], keyField: string): string[] {
  const byColumn = new Map(inferredFields.map((field) => [field.column, field]));
  return columns.filter((column) => {
    if (column === keyField) {
      return false;
    }
    const field = byColumn.get(column);
    if (field === undefined) {
      return false;
    }
    if (field.roles.includes("match_key") || field.roles.includes("candidate_key")) {
      return false;
    }
    if (field.valuePattern === "long_text") {
      return false;
    }
    if (field.averageLength > 80) {
      return false;
    }
    return true;
  });
}

// For every eligible (antecedent column, value) the dominant value of each other
// eligible column is reported as a rule, with no support/confidence floor so the
// full picture is visible. Rules are ranked by support then confidence.
function buildValueDependencyRules(rows: CsvRow[], columns: string[]): ValueDependencyRule[] {
  const rules: ValueDependencyRule[] = [];

  for (const antecedentColumn of columns) {
    const rowsByValue = new Map<string, CsvRow[]>();
    for (const row of rows) {
      const value = row[antecedentColumn] ?? "";
      const entries = rowsByValue.get(value) ?? [];
      entries.push(row);
      rowsByValue.set(value, entries);
    }

    for (const [antecedentValue, groupRows] of rowsByValue.entries()) {
      const support = groupRows.length;
      for (const consequentColumn of columns) {
        if (consequentColumn === antecedentColumn) {
          continue;
        }
        const dominant = topOptions(groupRows.map((row) => row[consequentColumn] ?? ""), 1)[0];
        if (dominant === undefined) {
          continue;
        }
        rules.push({
          antecedentColumn,
          antecedentValue,
          consequentColumn,
          consequentValue: dominant.value,
          support,
          matches: dominant.count,
          confidence: ratio(dominant.count, support),
          strict: dominant.count === support,
        });
      }
    }
  }

  return rules.sort(sortValueDependencyRules);
}

// A strict source rule backed by at least `minSupport` rows is an expectation. Any
// target row whose antecedent matches but whose consequent differs breaks it.
function buildRuleViolations(
  sourceRules: ValueDependencyRule[],
  targetRows: CsvRow[],
  targetHeaders: string[],
  keyField: string,
  minSupport: number,
): RuleViolation[] {
  const threshold = Math.max(1, Math.floor(minSupport));
  const violations: RuleViolation[] = [];

  for (const rule of sourceRules) {
    if (!rule.strict || rule.support < threshold) {
      continue;
    }
    if (!targetHeaders.includes(rule.antecedentColumn) || !targetHeaders.includes(rule.consequentColumn)) {
      continue;
    }

    const affected = targetRows.filter((row) => (row[rule.antecedentColumn] ?? "") === rule.antecedentValue);
    const breaking = affected.filter((row) => (row[rule.consequentColumn] ?? "") !== rule.consequentValue);
    if (breaking.length === 0) {
      continue;
    }

    violations.push({
      antecedentColumn: rule.antecedentColumn,
      antecedentValue: rule.antecedentValue,
      consequentColumn: rule.consequentColumn,
      expectedValue: rule.consequentValue,
      sourceSupport: rule.support,
      violatingKeys: breaking.map((row) => row[keyField] ?? "").slice(0, 10),
      observedValues: topOptions(breaking.map((row) => row[rule.consequentColumn] ?? ""), 5),
    });
  }

  return violations.sort((left, right) =>
    right.violatingKeys.length - left.violatingKeys.length ||
    right.sourceSupport - left.sourceSupport ||
    compareKeys(left.antecedentColumn, right.antecedentColumn) ||
    compareKeys(left.consequentColumn, right.consequentColumn)
  );
}

function buildValueDependencyLayer(input: ValueDependencyInput): ValueDependencyLayer {
  const eligibleColumns = ruleEligibleColumns(input.allColumns, input.inferredFields, input.keyField)
    .filter((column) => input.sourceHeaders.includes(column));
  // Violations are derived from the full rule set, before any display dedupe, so
  // collapsing reverse-direction rules can never hide a real broken relationship.
  const rules = buildValueDependencyRules(input.sourceRows, eligibleColumns);
  return {
    eligibleColumns,
    rules: maybeDedupeRules(rules, input.dedupeRules),
    violations: buildRuleViolations(rules, input.targetRows, input.targetHeaders, input.keyField, input.violationMinSupport),
  };
}

// When enabled, keep only the stronger of each reverse-direction pair: rules that
// link the same two `column=value` endpoints (A=x => B=y vs B=y => A=x) collapse to
// the one with the higher support/confidence. Rules input is already sorted
// strongest-first, so the first seen for an endpoint pair is the one to keep.
function maybeDedupeRules(rules: ValueDependencyRule[], dedupe: boolean): ValueDependencyRule[] {
  if (!dedupe) {
    return rules;
  }

  const seen = new Set<string>();
  const kept: ValueDependencyRule[] = [];
  for (const rule of rules) {
    const antecedent = serializeGroupKey(rule.antecedentColumn, rule.antecedentValue);
    const consequent = serializeGroupKey(rule.consequentColumn, rule.consequentValue);
    const key = antecedent < consequent ? `${antecedent}${consequent}` : `${consequent}${antecedent}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    kept.push(rule);
  }
  return kept;
}

function sortValueDependencyRules(left: ValueDependencyRule, right: ValueDependencyRule): number {
  return right.support - left.support ||
    right.confidence - left.confidence ||
    Number(right.strict) - Number(left.strict) ||
    compareKeys(left.antecedentColumn, right.antecedentColumn) ||
    compareKeys(left.antecedentValue, right.antecedentValue) ||
    compareKeys(left.consequentColumn, right.consequentColumn);
}

function interpretGroup(group: ProblemGroup, share: number): string {
  const shareText = percent(share);
  const value = showBlank(group.value);

  if (group.problem === "row_group") {
    return `${shareText} of rows share ${group.column}=${value}. Use this as an expected target slice for row counts, filters, and load validation.`;
  }
  if (group.problem === "missing_in_target") {
    return `${shareText} of missing rows share ${group.column}=${value}. This points to a possible filtered, rejected, or unmigrated slice of source data.`;
  }
  if (group.problem === "extra_in_target") {
    return `${shareText} of extra target rows share ${group.column}=${value}. This may indicate new target activity, another load batch, or a source export filter.`;
  }

  return `${shareText} of cell differences are linked to ${group.column}=${value}. Review this slice first because it concentrates changed values.`;
}

interface IntelligenceInput {
  passed: boolean;
  keyField: string;
  sourceRows: number;
  targetRows: number;
  matchedRows: number;
  missingInTarget: string[];
  extraInTarget: string[];
  duplicateKeysInSource: DuplicateKey[];
  duplicateKeysInTarget: DuplicateKey[];
  sourceOnlyColumns: string[];
  targetOnlyColumns: string[];
  columnStats: ColumnStats[];
  cellDifferences: CellDifference[];
  analysis: DetailedAnalysisWithoutIntelligence;
}

function buildIntelligenceLayer(input: IntelligenceInput): IntelligenceLayer {
  const findings: IntelligenceFinding[] = [];

  if (input.passed) {
    findings.push({
      severity: "info",
      confidence: "high",
      title: "No material differences detected",
      summary: "The files match on row presence, schema, column distributions, and matched cell values.",
      evidence: [
        `${input.sourceRows} source rows compared with ${input.targetRows} target rows.`,
        `${input.matchedRows} rows matched on ${input.keyField}.`,
      ],
      likelyCauses: ["No mismatch found by the enabled checks."],
      nextChecks: ["Keep this report with the export batch or migration run for audit evidence."],
      relatedColumns: [input.keyField],
      affectedKeys: [],
    });
  }

  addDuplicateFindings(findings, input);
  addSchemaFindings(findings, input);
  addRowPresenceFindings(findings, input);
  addChangeFindings(findings, input);
  addLinkAndAuditFindings(findings, input);
  addRuleViolationFindings(findings, input);
  addPatternFindings(findings, input);

  const rankedFindings = findings.sort(sortFindings);
  const riskScore = calculateRiskScore(rankedFindings);
  return {
    riskScore,
    verdict: buildVerdict(input.passed, riskScore, rankedFindings),
    findings: rankedFindings,
  };
}

function addDuplicateFindings(findings: IntelligenceFinding[], input: IntelligenceInput): void {
  if (input.duplicateKeysInSource.length > 0) {
    findings.push({
      severity: "critical",
      confidence: "high",
      title: "Duplicate match keys in source",
      summary: "The source file has repeated keys, so row matching can hide or misattribute data.",
      evidence: [
        `${input.duplicateKeysInSource.length} duplicate ${input.keyField} value(s) in source.`,
        `Sample keys: ${input.duplicateKeysInSource.slice(0, 10).map((item) => showBlank(item.key)).join(", ")}`,
      ],
      likelyCauses: ["Export join created duplicate records.", "The selected key is not unique for this data.", "Source contains historical or versioned rows."],
      nextChecks: [`Confirm whether ${input.keyField} is the correct unique key.`, "Inspect duplicate rows before trusting row-level differences."],
      relatedColumns: [input.keyField],
      affectedKeys: input.duplicateKeysInSource.slice(0, 10).map((item) => item.key),
    });
  }

  if (input.duplicateKeysInTarget.length > 0) {
    findings.push({
      severity: "critical",
      confidence: "high",
      title: "Duplicate match keys in target",
      summary: "The target file has repeated keys, so the comparison cannot prove a one-to-one match.",
      evidence: [
        `${input.duplicateKeysInTarget.length} duplicate ${input.keyField} value(s) in target.`,
        `Sample keys: ${input.duplicateKeysInTarget.slice(0, 10).map((item) => showBlank(item.key)).join(", ")}`,
      ],
      likelyCauses: ["Target load duplicated rows.", "The selected key is not unique for this target data.", "Target contains snapshots or versioned rows."],
      nextChecks: [`Deduplicate or choose a stronger key than ${input.keyField}.`, "Check load logs for repeated inserts or appended batches."],
      relatedColumns: [input.keyField],
      affectedKeys: input.duplicateKeysInTarget.slice(0, 10).map((item) => item.key),
    });
  }
}

function addSchemaFindings(findings: IntelligenceFinding[], input: IntelligenceInput): void {
  const changedColumns = [...input.sourceOnlyColumns, ...input.targetOnlyColumns];
  if (changedColumns.length === 0) {
    return;
  }

  findings.push({
    severity: "high",
    confidence: "high",
    title: "Schema differs between files",
    summary: "Columns exist in only one file. That can mean data was dropped, renamed, or added after the source export.",
    evidence: [
      `Source-only columns: ${formatList(input.sourceOnlyColumns)}`,
      `Target-only columns: ${formatList(input.targetOnlyColumns)}`,
    ],
    likelyCauses: ["Column rename between systems.", "Different export templates.", "Target transformation dropped or added fields."],
    nextChecks: ["Map source-only and target-only columns to confirm whether they are intended renames.", "Check whether missing columns are required downstream."],
    relatedColumns: changedColumns,
    affectedKeys: [],
  });
}

function addRowPresenceFindings(findings: IntelligenceFinding[], input: IntelligenceInput): void {
  const sourceMissingRatio = ratio(input.missingInTarget.length, input.sourceRows);
  const targetExtraRatio = ratio(input.extraInTarget.length, input.targetRows);

  if (input.missingInTarget.length > 0) {
    const strongestGroup = strongestProblemGroup(input.analysis.problemGroups, "missing_in_target");
    findings.push({
      severity: sourceMissingRatio >= 0.05 ? "high" : "medium",
      confidence: "high",
      title: "Rows are missing from target",
      summary: `${input.missingInTarget.length} source row(s) do not have a matching target row.`,
      evidence: [
        `${percent(sourceMissingRatio)} of source rows are missing in target.`,
        strongestGroup === undefined ? `Sample keys: ${input.missingInTarget.slice(0, 10).join(", ")}` : `Largest group: ${strongestGroup.column}=${showBlank(strongestGroup.value)} (${strongestGroup.count} row(s)).`,
      ],
      likelyCauses: ["Filtering during export or import.", "Target load rejected records.", "Different date/window criteria.", "Rows were deleted or not migrated."],
      nextChecks: ["Search target load or validation logs for the sample keys.", "Check whether the largest grouped field points to a user, account, status, or time window.", "Confirm both CSVs were exported from the same population and time range."],
      relatedColumns: strongestGroup === undefined ? [input.keyField] : [input.keyField, strongestGroup.column],
      affectedKeys: input.missingInTarget.slice(0, 10),
    });
  }

  if (input.extraInTarget.length > 0) {
    const strongestGroup = strongestProblemGroup(input.analysis.problemGroups, "extra_in_target");
    findings.push({
      severity: targetExtraRatio >= 0.05 ? "high" : "medium",
      confidence: "high",
      title: "Target has extra rows",
      summary: `${input.extraInTarget.length} target row(s) do not exist in source.`,
      evidence: [
        `${percent(targetExtraRatio)} of target rows are extra compared with source.`,
        strongestGroup === undefined ? `Sample keys: ${input.extraInTarget.slice(0, 10).join(", ")}` : `Largest group: ${strongestGroup.column}=${showBlank(strongestGroup.value)} (${strongestGroup.count} row(s)).`,
      ],
      likelyCauses: ["Target contains new records created after source export.", "Source export was filtered.", "Target load merged data from another batch."],
      nextChecks: ["Check created/updated timestamps and audit actor fields for the extra keys.", "Confirm whether extra rows are expected post-migration activity."],
      relatedColumns: strongestGroup === undefined ? [input.keyField] : [input.keyField, strongestGroup.column],
      affectedKeys: input.extraInTarget.slice(0, 10),
    });
  }
}

function addChangeFindings(findings: IntelligenceFinding[], input: IntelligenceInput): void {
  if (input.cellDifferences.length === 0) {
    return;
  }

  const changedKeys = unique(input.cellDifferences.map((difference) => difference.key));
  const topChangedColumns = input.analysis.changedColumns.slice(0, 5);
  findings.push({
    severity: ratio(changedKeys.length, Math.max(input.matchedRows, 1)) >= 0.05 ? "high" : "medium",
    confidence: "high",
    title: "Matched rows have changed values",
    summary: `${input.cellDifferences.length} cell difference(s) were found across ${changedKeys.length} matched row(s).`,
    evidence: topChangedColumns.map((column) => `${column.column}: ${column.changedCells} change(s), sample keys ${column.sampleKeys.join(", ")}`),
    likelyCauses: ["Target transformation changed values.", "Records were updated between exports.", "Normalization or mapping rules differ between systems."],
    nextChecks: ["Review the changed columns first, especially audit, status, link, and timestamp fields.", "Confirm whether the target system is allowed to mutate these fields during load."],
    relatedColumns: topChangedColumns.map((column) => column.column),
    affectedKeys: changedKeys.slice(0, 10),
  });

  const statusLike = topChangedColumns.filter((column) => /status|state|stage/i.test(column.column));
  for (const column of statusLike) {
    findings.push({
      severity: "high",
      confidence: "medium",
      title: `Status-like field changed: ${column.column}`,
      summary: "A status/state field changed on matched records, which often affects workflow, access, or reporting behavior.",
      evidence: [
        `${column.changedCells} changed cell(s).`,
        `Source values: ${formatTopValueCounts(column.sourceTopValues)}.`,
        `Target values: ${formatTopValueCounts(column.targetTopValues)}.`,
      ],
      likelyCauses: ["Workflow automation changed records after import.", "Status mapping rules are incorrect.", "The two files were exported at different lifecycle moments."],
      nextChecks: ["Validate allowed status transitions.", "Compare with business rules or migration mapping for this field."],
      relatedColumns: [column.column],
      affectedKeys: column.sampleKeys,
    });
  }
}

function addLinkAndAuditFindings(findings: IntelligenceFinding[], input: IntelligenceInput): void {
  for (const linkColumn of input.analysis.linkColumns) {
    const hasValueDrift =
      linkColumn.missingValuesInTarget.length > 0 ||
      linkColumn.extraValuesInTarget.length > 0 ||
      linkColumn.countDifferences.length > 0;

    if (!hasValueDrift) {
      continue;
    }

    const field = input.analysis.inferredFields.find((item) => item.column === linkColumn.column);
    const isAudit = field?.roles.includes("audit_actor") ?? false;
    findings.push({
      severity: isAudit ? "medium" : "high",
      confidence: "medium",
      title: `${isAudit ? "Audit actor" : "Link"} distribution changed: ${linkColumn.column}`,
      summary: `${linkColumn.column} points to a different set or count of values in the target.`,
      evidence: [
        `Missing values: ${formatList(linkColumn.missingValuesInTarget)}`,
        `Extra values: ${formatList(linkColumn.extraValuesInTarget)}`,
        `Count differences: ${linkColumn.countDifferences.length}`,
      ],
      likelyCauses: isAudit
        ? ["Records were updated by a different user/process in target.", "Audit metadata was overwritten during load.", "The files were exported at different times."]
        : ["Foreign key or relationship mapping is incomplete.", "Records were linked to different parent entities.", "Some related records are missing from target."],
      nextChecks: isAudit
        ? ["Identify whether extra audit actors are migration users or real users.", "Check if changed audit fields are expected to be preserved."]
        : [`Trace sample ${linkColumn.column} values back to their parent records.`, "Confirm related entities were loaded before dependent data."],
      relatedColumns: [linkColumn.column],
      affectedKeys: [],
    });
  }
}

function addRuleViolationFindings(findings: IntelligenceFinding[], input: IntelligenceInput): void {
  const violations = input.analysis.analytics.valueDependencies.violations;
  if (violations.length === 0) {
    return;
  }

  const relatedColumns = unique(
    violations.flatMap((violation) => [violation.antecedentColumn, violation.consequentColumn]),
  );
  const affectedKeys = unique(violations.flatMap((violation) => violation.violatingKeys)).slice(0, 10);

  findings.push({
    severity: "high",
    confidence: "medium",
    title: "Target breaks value rules that held in source",
    summary: `${violations.length} field relationship(s) that were always true in source no longer hold in target.`,
    evidence: violations.slice(0, 6).map((violation) =>
      `${violation.antecedentColumn}=${showBlank(violation.antecedentValue)} implied ${violation.consequentColumn}=${showBlank(violation.expectedValue)} in source (${violation.sourceSupport}/${violation.sourceSupport}); target key(s) ${violation.violatingKeys.join(", ")} show ${formatTopValueCounts(violation.observedValues)}`,
    ),
    likelyCauses: [
      "A transformation changed a dependent field without updating its related field.",
      "A mapping rule was applied to one column but not to a column it controls.",
      "Records were edited after the related field was set, so the fields drifted apart.",
    ],
    nextChecks: [
      "Confirm whether each broken relationship is a business rule the target must preserve.",
      "Inspect the listed keys to decide which of the two related fields is wrong.",
    ],
    relatedColumns,
    affectedKeys,
  });
}

function addPatternFindings(findings: IntelligenceFinding[], input: IntelligenceInput): void {
  if (input.missingInTarget.length > 0 && input.missingInTarget.length === input.extraInTarget.length) {
    findings.push({
      severity: "medium",
      confidence: "low",
      title: "Missing and extra row counts are balanced",
      summary: "The same number of rows are missing and extra. This can happen when records were replaced, remapped, or compared across different export windows.",
      evidence: [`${input.missingInTarget.length} missing row(s) and ${input.extraInTarget.length} extra row(s).`],
      likelyCauses: ["Keys changed between systems.", "One batch was compared against a different batch.", "Rows were deleted and recreated."],
      nextChecks: ["Compare non-key context fields for missing and extra rows to find possible near-matches.", "Check whether the chosen key is stable across both files."],
      relatedColumns: input.analysis.contextColumns,
      affectedKeys: [...input.missingInTarget, ...input.extraInTarget].slice(0, 10),
    });
  }

  const timestampChanges = input.analysis.changedColumns.filter((column) =>
    input.analysis.inferredFields.some((field) => field.column === column.column && field.roles.includes("timestamp")),
  );
  if (timestampChanges.length > 0) {
    findings.push({
      severity: "low",
      confidence: "medium",
      title: "Timestamp fields changed",
      summary: "Timestamp differences may be harmless if target records were touched during import, but they can also explain audit/user drift.",
      evidence: timestampChanges.map((column) => `${column.column}: ${column.changedCells} change(s)`),
      likelyCauses: ["Import process updated records.", "Target system auto-maintained timestamps.", "Files were exported at different times."],
      nextChecks: ["Decide whether timestamp preservation matters for this comparison.", "If timestamps should match, inspect target update triggers or import settings."],
      relatedColumns: timestampChanges.map((column) => column.column),
      affectedKeys: unique(timestampChanges.flatMap((column) => column.sampleKeys)).slice(0, 10),
    });
  }
}

function inferField(column: string, keyField: string, sourceRows: CsvRow[], targetRows: CsvRow[]): InferredField {
  const sourceValues = sourceRows.map((row) => row[column] ?? "");
  const targetValues = targetRows.map((row) => row[column] ?? "");
  const allValues = [...sourceValues, ...targetValues];
  const filledValues = allValues.filter((value) => value !== "");
  const sourceFilled = countFilled(sourceValues);
  const targetFilled = countFilled(targetValues);
  const sourceDistinct = distinctCount(sourceValues);
  const targetDistinct = distinctCount(targetValues);
  const sourceCompleteness = ratio(sourceFilled, sourceValues.length);
  const targetCompleteness = ratio(targetFilled, targetValues.length);
  const sourceUniqueness = ratio(sourceDistinct, sourceFilled);
  const targetUniqueness = ratio(targetDistinct, targetFilled);
  const roleScores: Record<string, number> = {};
  const signals: string[] = [];
  const normalized = normalizeColumnName(column);
  const tokens = tokenizeColumnName(column);
  const valuePattern = inferValuePattern(filledValues);

  if (column === keyField) {
    addRoleScore(roleScores, signals, "match_key", 1, "selected comparison key");
  }
  if (isAuditActorColumn(normalized, tokens)) {
    addRoleScore(roleScores, signals, "audit_actor", 0.86, "column name looks like user/owner/actor metadata");
  }
  if (tokens.some((token) => ["owner", "user", "assignee", "actor", "agent", "operator"].includes(token))) {
    addRoleScore(roleScores, signals, "actor", 0.72, "column name contains an actor-like token");
  }
  if (tokens.some((token) => ["status", "state", "stage", "type", "category", "class", "segment", "group"].includes(token))) {
    addRoleScore(roleScores, signals, "category", 0.82, "column name looks categorical");
  }
  if (tokens.some((token) => ["name", "title", "label", "subject"].includes(token))) {
    addRoleScore(roleScores, signals, "label", 0.78, "column name looks like a human-readable label");
  }
  if (tokens.some((token) => ["description", "note", "notes", "comment", "comments", "body", "message", "text"].includes(token))) {
    addRoleScore(roleScores, signals, "text", 0.78, "column name looks like long text");
  }
  if (tokens.some((token) => ["amount", "price", "cost", "total", "subtotal", "balance", "revenue", "qty", "quantity", "count", "score", "rate", "percent"].includes(token))) {
    addRoleScore(roleScores, signals, "measure", 0.82, "column name looks like a numeric measure");
  }
  if (tokens.some((token) => ["email", "mail"].includes(token)) || mostlyMatches(filledValues, isEmailLike)) {
    addRoleScore(roleScores, signals, "email", 0.92, "values or name look like email addresses");
  }
  if (tokens.some((token) => ["phone", "mobile", "tel", "telephone"].includes(token)) || mostlyMatches(filledValues, isPhoneLike)) {
    addRoleScore(roleScores, signals, "phone", 0.82, "values or name look like phone numbers");
  }
  if (tokens.some((token) => ["url", "uri", "website", "link"].includes(token)) || mostlyMatches(filledValues, isUrlLike)) {
    addRoleScore(roleScores, signals, "url", 0.9, "values or name look like URLs");
  }
  if (isTimestampColumn(normalized) || mostlyMatches(allValues, isDateLike)) {
    addRoleScore(roleScores, signals, "timestamp", 0.9, "values or name look date/time-like");
  }
  if (column !== keyField && isLinkColumn(normalized, allValues)) {
    addRoleScore(roleScores, signals, "link", 0.84, "name or values look like IDs/references");
  }
  if (
    column !== keyField &&
    sourceCompleteness >= 0.95 &&
    targetCompleteness >= 0.95 &&
    sourceUniqueness >= 0.98 &&
    targetUniqueness >= 0.98 &&
    looksLikeCandidateKey(tokens, normalized, valuePattern, allValues)
  ) {
    addRoleScore(roleScores, signals, "candidate_key", 0.88, "nearly every filled value is unique and the field looks identifier-like");
  }
  if (mostlyMatches(allValues, isNumericLike)) {
    addRoleScore(roleScores, signals, "numeric", 0.86, "most filled values are numeric");
  }
  if (mostlyMatches(allValues, isCurrencyLike)) {
    addRoleScore(roleScores, signals, "currency", 0.86, "most filled values look like currency");
  }
  if (mostlyMatches(allValues, isPercentLike)) {
    addRoleScore(roleScores, signals, "percentage", 0.84, "most filled values look like percentages");
  }
  if (mostlyMatches(allValues, isBooleanLike)) {
    addRoleScore(roleScores, signals, "boolean", 0.9, "most filled values are boolean-like");
  }
  if (mostlyMatches(allValues, isJsonLike)) {
    addRoleScore(roleScores, signals, "structured_json", 0.82, "most filled values look like JSON");
  }
  if (mostlyMatches(allValues, isMultiValueLike)) {
    addRoleScore(roleScores, signals, "multi_value", 0.72, "most filled values look like lists");
  }

  const distinct = new Set(filledValues).size;
  const filled = filledValues.length;
  const averageLength = filled === 0
    ? 0
    : Math.round((filledValues.reduce((total, value) => total + value.length, 0) / filled) * 10) / 10;
  if (filled === 0) {
    addRoleScore(roleScores, signals, "empty", 1, "no filled values found");
  } else if (distinct <= Math.max(20, Math.ceil(filled * 0.2)) && averageLength <= 80) {
    addRoleScore(roleScores, signals, "category", 0.72, "low distinct count compared with filled values");
  }
  if (averageLength > 80) {
    addRoleScore(roleScores, signals, "text", 0.76, "average value length is high");
  }
  if (Object.keys(roleScores).length === 0) {
    addRoleScore(roleScores, signals, "text", 0.45, "fallback when no stronger local pattern matched");
  }
  const roles = Object.entries(roleScores)
    .sort((left, right) => right[1] - left[1] || compareKeys(left[0], right[0]))
    .map(([role]) => role);

  return {
    column,
    roles,
    roleConfidence: sortNumericRecord(roleScores),
    valuePattern,
    signals: unique(signals),
    sourceFilled,
    targetFilled,
    sourceDistinct,
    targetDistinct,
    sourceCompleteness,
    targetCompleteness,
    sourceUniqueness,
    targetUniqueness,
    averageLength,
    sourceTopOptions: topOptions(sourceValues, 5),
    targetTopOptions: topOptions(targetValues, 5),
  };
}

function chooseContextColumns(keyField: string, fields: InferredField[], requestedFields: string[]): string[] {
  const scored = fields.map((field) => ({
    column: field.column,
    score: scoreContextField(field, keyField),
  }));
  const knownColumns = new Set(fields.map((field) => field.column));
  const requested = requestedFields.filter((field) => knownColumns.has(field));
  const inferred = scored
    .filter((field) => field.score > 0 && !requested.includes(field.column))
    .sort((left, right) => right.score - left.score || compareKeys(left.column, right.column))
    .map((field) => field.column);

  return unique([keyField, ...requested, ...inferred]).slice(0, 12);
}

function scoreContextField(field: InferredField, keyField: string): number {
  if (field.column === keyField) {
    return 100;
  }

  let score = 0;
  if (field.roles.includes("candidate_key")) {
    score += 70;
  }
  if (field.roles.includes("audit_actor")) {
    score += 80;
  }
  if (field.roles.includes("actor")) {
    score += 65;
  }
  if (field.roles.includes("link")) {
    score += 60;
  }
  if (field.roles.includes("timestamp")) {
    score += 45;
  }
  if (field.roles.includes("label")) {
    score += 40;
  }
  if (field.roles.includes("category")) {
    score += 25;
  }
  if (/status|state|type|category|owner|user|name|title|label/i.test(field.column)) {
    score += 20;
  }
  if (field.roles.includes("text")) {
    score -= 20;
  }
  return score;
}

function buildProblemRows(keys: string[], rowsByKey: Map<string, IndexedRow>, contextColumns: string[]): ProblemRow[] {
  return keys.map((key) => {
    const entry = rowsByKey.get(key);
    return {
      key,
      rowNumber: entry?.rowNumber ?? 0,
      context: entry === undefined ? {} : pickContext(entry.row, contextColumns),
    };
  });
}

function buildProfileRows(rows: CsvRow[], keyField: string, contextColumns: string[]): ProblemRow[] {
  return rows.map((row, index) => ({
    key: keyField === "" ? `row ${index + 2}` : row[keyField] ?? "",
    rowNumber: index + 2,
    context: pickContext(row, contextColumns),
  }));
}

function buildGroups(
  problem: ProblemGroup["problem"],
  rows: ProblemRow[],
  contextColumns: string[],
  timestampColumns: Set<string>,
  groupDepth: number,
): ProblemGroup[] {
  const groups: ProblemGroup[] = [];
  const limitedContextColumns = contextColumns.slice(0, GROUPING_CONTEXT_LIMIT);
  const rowsByValue = new Map<string, string[]>();

  for (const row of rows) {
    for (const group of buildGroupingCombinations(row.context, limitedContextColumns, timestampColumns, groupDepth)) {
      const groupKey = serializeGroupKey(group.column, group.value);
      const keys = rowsByValue.get(groupKey) ?? [];
      keys.push(row.key);
      rowsByValue.set(groupKey, keys);
    }
  }

  for (const [groupKey, keys] of rowsByValue.entries()) {
    if (keys.length > 0) {
      const group = parseGroupKey(groupKey);
      groups.push({
        problem,
        column: group.column,
        value: group.value,
        depth: group.depth,
        count: keys.length,
        sampleKeys: keys,
      });
    }
  }

  return groups.sort(sortProblemGroups);
}

function buildCellDifferenceGroups(
  differences: CellDifference[],
  contextColumns: string[],
  timestampColumns: Set<string>,
  groupDepth: number,
): ProblemGroup[] {
  const groups: ProblemGroup[] = [];
  const limitedContextColumns = contextColumns.slice(0, GROUPING_CONTEXT_LIMIT);
  const rowsByValue = new Map<string, string[]>();

  for (const difference of differences) {
    const context = mergeContexts(difference.sourceContext, difference.targetContext);
    for (const group of buildGroupingCombinations(context, limitedContextColumns, timestampColumns, groupDepth)) {
      const groupKey = serializeGroupKey(group.column, group.value);
      const keys = rowsByValue.get(groupKey) ?? [];
      keys.push(difference.key);
      rowsByValue.set(groupKey, keys);
    }
  }

  for (const [groupKey, keys] of rowsByValue.entries()) {
    const group = parseGroupKey(groupKey);
    groups.push({
      problem: "cell_difference",
      column: group.column,
      value: group.value,
      depth: group.depth,
      count: keys.length,
      sampleKeys: [...new Set(keys)],
    });
  }

  return groups.sort(sortProblemGroups);
}

function buildGroupingBuckets(
  column: string,
  value: string,
  timestampColumns: Set<string>,
): Array<{ baseColumn: string; column: string; value: string }> {
  if (!timestampColumns.has(column)) {
    return [{ baseColumn: column, column, value }];
  }

  const date = extractDateParts(value);
  if (date === undefined) {
    return [{ baseColumn: column, column: `${column} date`, value }];
  }

  // Group date/datetime columns by calendar day only; the time part is ignored.
  return [{ baseColumn: column, column: `${column} date`, value: `${date.year}-${date.month}-${date.day}` }];
}

function buildGroupingCombinations(
  context: Record<string, string>,
  contextColumns: string[],
  timestampColumns: Set<string>,
  groupDepth: number,
): Array<{ column: string; value: string; depth: number }> {
  const bucketGroups = contextColumns
    .filter((column) => column !== "")
    .map((column) => buildGroupingBuckets(column, context[column] ?? "", timestampColumns));
  const groups: Array<{ column: string; value: string; depth: number }> = [];

  function visit(startIndex: number, selected: Array<{ baseColumn: string; column: string; value: string }>): void {
    if (selected.length > 0) {
      groups.push({
        column: selected.map((entry) => entry.column).join(" > "),
        value: selected.map((entry) => showBlank(entry.value)).join(" > "),
        depth: selected.length,
      });
    }
    if (selected.length >= groupDepth) {
      return;
    }

    for (let index = startIndex; index < bucketGroups.length; index += 1) {
      for (const bucket of bucketGroups[index]) {
        visit(index + 1, [...selected, bucket]);
      }
    }
  }

  visit(0, []);
  return groups;
}

function mergeContexts(sourceContext: Record<string, string>, targetContext: Record<string, string>): Record<string, string> {
  return {
    ...targetContext,
    ...sourceContext,
  };
}

function extractDateParts(value: string): { year: string; month: string; day: string } | undefined {
  const isoLike = value.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?!\d)/);
  if (isoLike !== null) {
    return normalizeDateParts(isoLike[1], isoLike[2], isoLike[3]);
  }

  const slashDate = value.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (slashDate === null) {
    return undefined;
  }

  const first = Number(slashDate[1]);
  const second = Number(slashDate[2]);
  const year = slashDate[3].length === 2 ? `20${slashDate[3]}` : slashDate[3];
  const month = first > 12 ? second : first;
  const day = first > 12 ? first : second;
  return normalizeDateParts(year, String(month), String(day));
}

function normalizeDateParts(yearValue: string, monthValue: string, dayValue: string): { year: string; month: string; day: string } | undefined {
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1000 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return undefined;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return {
    year: String(year).padStart(4, "0"),
    month: String(month).padStart(2, "0"),
    day: String(day).padStart(2, "0"),
  };
}

function serializeGroupKey(column: string, value: string): string {
  return `${JSON.stringify(column)}\n${JSON.stringify(value)}`;
}

function parseGroupKey(groupKey: string): { column: string; value: string; depth: number } {
  const [column, value] = groupKey.split("\n", 2);
  const parsedColumn = JSON.parse(column) as string;
  return {
    column: parsedColumn,
    value: JSON.parse(value) as string,
    depth: parsedColumn.split(" > ").length,
  };
}

function buildChangedColumnSummaries(differences: CellDifference[]): ChangedColumnSummary[] {
  const byColumn = new Map<string, CellDifference[]>();

  for (const difference of differences) {
    const entries = byColumn.get(difference.column) ?? [];
    entries.push(difference);
    byColumn.set(difference.column, entries);
  }

  return [...byColumn.entries()]
    .map(([column, entries]) => ({
      column,
      changedCells: entries.length,
      sampleKeys: entries.map((entry) => entry.key).slice(0, 10),
      sourceTopValues: topOptions(entries.map((entry) => entry.source), 5),
      targetTopValues: topOptions(entries.map((entry) => entry.target), 5),
    }))
    .sort((left, right) => right.changedCells - left.changedCells || compareKeys(left.column, right.column));
}

function buildLinkColumnSummaries(columnStats: ColumnStats[], fields: InferredField[]): LinkColumnSummary[] {
  const linkColumns = new Set(
    fields
      .filter((field) => field.roles.includes("link") || field.roles.includes("audit_actor") || field.roles.includes("actor"))
      .map((field) => field.column),
  );

  return columnStats
    .filter((stats) => linkColumns.has(stats.column))
    .map((stats) => ({
      column: stats.column,
      sourceDistinct: Object.keys(stats.sourceOptions).filter((value) => value !== "").length,
      targetDistinct: Object.keys(stats.targetOptions).filter((value) => value !== "").length,
      missingValuesInTarget: stats.missingOptionsInTarget,
      extraValuesInTarget: stats.extraOptionsInTarget,
      countDifferences: stats.optionCountDifferences
        .map((difference) => ({
          value: difference.option,
          source: difference.source,
          target: difference.target,
        })),
    }))
    .sort((left, right) => compareKeys(left.column, right.column));
}

function buildCsvProfileSummary(source: ParsedCsv, fields: InferredField[]): CsvProfileSummary {
  const roleCounts: Record<string, number> = {};
  for (const field of fields) {
    for (const role of field.roles) {
      roleCounts[role] = (roleCounts[role] ?? 0) + 1;
    }
  }

  return {
    rows: source.rows.length,
    columns: source.headers.length,
    inferredRoleCounts: sortRecord(roleCounts),
    candidateKeyColumns: fields
      .filter((field) => field.roles.includes("candidate_key") || field.roles.includes("match_key"))
      .map((field) => field.column),
    highBlankColumns: fields
      .filter((field) => field.sourceCompleteness < 0.8)
      .map((field) => field.column),
    highCardinalityColumns: fields
      .filter((field) => field.sourceUniqueness >= 0.8)
      .map((field) => field.column),
    likelyLinkColumns: fields
      .filter((field) => field.roles.includes("link"))
      .map((field) => field.column),
    likelyAuditColumns: fields
      .filter((field) => field.roles.includes("audit_actor") || field.roles.includes("actor"))
      .map((field) => field.column),
    likelyTimestampColumns: fields
      .filter((field) => field.roles.includes("timestamp"))
      .map((field) => field.column),
  };
}

function buildColumnFamilies(columns: string[], fields: InferredField[]): ColumnFamily[] {
  const fieldsByColumn = new Map(fields.map((field) => [field.column, field]));
  const groups = new Map<string, string[]>();

  for (const column of columns) {
    const family = inferColumnFamily(column);
    const entries = groups.get(family) ?? [];
    entries.push(column);
    groups.set(family, entries);
  }

  return [...groups.entries()]
    .map(([family, familyColumns]) => {
      const sortedColumns = familyColumns.sort(compareKeys);
      return {
        family,
        label: labelColumnFamily(family),
        columnCount: sortedColumns.length,
        columns: sortedColumns,
        identifierColumns: sortedColumns.filter(isIdentifierColumn),
        statusColumns: sortedColumns.filter((column) => isStatusLikeColumn(column, fieldsByColumn.get(column))),
        dateColumns: sortedColumns.filter((column) => isDateFamilyColumn(column, fieldsByColumn.get(column))),
        unknownMarkerColumns: sortedColumns.filter(isUnknownMarkerColumn),
        flagColumns: sortedColumns.filter((column) => isFlagLikeColumn(column, fieldsByColumn.get(column))),
        measureColumns: sortedColumns.filter((column) => isMeasureLikeColumn(column, fieldsByColumn.get(column))),
        textColumns: sortedColumns.filter(isTextLikeColumn),
      };
    })
    .sort((left, right) => familySortKey(left.family).localeCompare(familySortKey(right.family), undefined, { numeric: true, sensitivity: "base" }));
}

function inferColumnFamily(column: string): string {
  const section = column.match(/^([A-Z]{1,4}\d{1,3})(?=[A-Z_])/);
  if (section !== null) {
    return section[1];
  }

  if (/^(case|import|created|updated|locked|record|site|proclin)/i.test(column)) {
    return "Core metadata";
  }

  const tokens = tokenizeColumnName(column);
  if (tokens.length > 0) {
    return titleCase(tokens[0]);
  }

  return "Other";
}

function labelColumnFamily(family: string): string {
  if (/^[A-Z]{1,4}\d{1,3}$/.test(family)) {
    return `${family} form section`;
  }
  return family;
}

function scoreIdentifierColumn(column: string): number {
  const normalized = normalizeColumnName(column);
  const tokens = tokenizeColumnName(column);

  if (/^id$/.test(normalized)) {
    return 100;
  }
  if (/^patientid$/.test(normalized)) {
    return 99;
  }
  if (/^caseid$/.test(normalized)) {
    return 98;
  }
  if (/^importidentifier$/.test(normalized)) {
    return 94;
  }
  if (/^(importid|proclinid|patientid|personid|recordid)$/.test(normalized)) {
    return 90;
  }
  if (tokens.some((token) => ["id", "identifier", "uuid", "guid", "key"].includes(token))) {
    return 82;
  }
  if (/(id|identifier|uuid|guid|key)$/.test(normalized)) {
    return 78;
  }

  return 0;
}

function isIdentifierColumn(column: string): boolean {
  return scoreIdentifierColumn(column) > 0;
}

function isStatusLikeColumn(column: string, field: InferredField | undefined): boolean {
  const normalized = normalizeColumnName(column);
  return field?.roles.includes("category") === true ||
    /(status|state|type|route|country|sex|speciality|score|risk|indicator|diagnosis|finding|careplan|order)$/.test(normalized);
}

function isDateFamilyColumn(column: string, field: InferredField | undefined): boolean {
  const tokens = tokenizeColumnName(column);
  return field?.roles.includes("timestamp") === true ||
    tokens.some((token) => ["date", "datetime", "time", "timestamp"].includes(token));
}

function isUnknownMarkerColumn(column: string): boolean {
  const normalized = normalizeColumnName(column);
  return /(notknown|unknown|datenotknown|tnk|_nk|notseen|notperformed|notapplicable|none)$/.test(normalized) ||
    /(_TNK|_NK|NotKnown|Unknown|NotSeen|NotPerformed|None)$/.test(column);
}

function isFlagLikeColumn(column: string, field: InferredField | undefined): boolean {
  if (field?.roles.includes("boolean") === true || isUnknownMarkerColumn(column)) {
    return true;
  }

  const normalized = normalizeColumnName(column);
  if (isIdentifierColumn(column) || isDateFamilyColumn(column, field) || isMeasureLikeColumn(column, field) || isTextLikeColumn(column)) {
    return false;
  }

  return /(locked|confirm|planned|considered|warning|scan|reported|performed|documented|declined|care|plan|palliative|oncology|critical|emergency|other|ind_|ind|cpr|adrt|respect|escalation|nomination|avoidance|malignancy|frailty|soiling|obstruction|hernia|peritonitis|perforation|abscess|fistula|necrosis|ischaemia|colitis|acidosis)/i.test(column) ||
    /(yes|no|has|is|was|did|done|seen)$/.test(normalized);
}

function isMeasureLikeColumn(column: string, field: InferredField | undefined): boolean {
  const normalized = normalizeColumnName(column);
  return field?.roles.includes("measure") === true ||
    field?.roles.includes("numeric") === true ||
    /(age|score|risk|creatinine|albumin|urea|count|pulse|blood|scale|rate|concentration|mortality|frailty|asa)/.test(normalized);
}

function isTextLikeColumn(column: string): boolean {
  return /(specify|message|statement|description|comment|note|othertext|aspects|reason|plan)$/i.test(column);
}

function familySortKey(family: string): string {
  return family === "Core metadata" ? "0000" : family;
}

function titleCase(value: string): string {
  if (value === "") {
    return value;
  }
  return `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}`;
}

function pickContext(row: CsvRow, contextColumns: string[]): Record<string, string> {
  return Object.fromEntries(
    contextColumns.map((column) => [column, row[column] ?? ""]),
  );
}

function countOptions(values: string[]): Record<string, number> {
  const options: Record<string, number> = {};
  for (const value of values) {
    options[value] = (options[value] ?? 0) + 1;
  }
  return sortRecord(options);
}

function countFilled(values: string[]): number {
  return values.filter((value) => value !== "").length;
}

function columnStatsMatch(stats: ColumnStats): boolean {
  return (
    stats.existsInSource === stats.existsInTarget &&
    stats.sourceFilled === stats.targetFilled &&
    stats.sourceBlank === stats.targetBlank &&
    stats.missingOptionsInTarget.length === 0 &&
    stats.extraOptionsInTarget.length === 0 &&
    stats.optionCountDifferences.length === 0
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function sortRecord(input: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(input).sort(([left], [right]) => compareKeys(left, right)),
  );
}

function sortNumericRecord(input: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(input)
      .sort((left, right) => right[1] - left[1] || compareKeys(left[0], right[0]))
      .map(([key, value]) => [key, Math.round(value * 100) / 100]),
  );
}

function addRoleScore(
  roleScores: Record<string, number>,
  signals: string[],
  role: string,
  score: number,
  signal: string,
): void {
  roleScores[role] = Math.max(roleScores[role] ?? 0, score);
  signals.push(signal);
}

function normalizeColumnName(column: string): string {
  return column.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function tokenizeColumnName(column: string): string[] {
  const spaced = column
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .toLowerCase();
  return spaced.split(/\s+/).filter(Boolean);
}

function inferValuePattern(values: string[]): string {
  if (values.length === 0) {
    return "empty";
  }
  const checks: Array<[string, (value: string) => boolean]> = [
    ["email", isEmailLike],
    ["url", isUrlLike],
    ["uuid", isUuidLike],
    ["timestamp", isDateLike],
    ["currency", isCurrencyLike],
    ["percentage", isPercentLike],
    ["numeric", isNumericLike],
    ["boolean", isBooleanLike],
    ["json", isJsonLike],
    ["multi_value", isMultiValueLike],
    ["phone", isPhoneLike],
  ];

  for (const [pattern, predicate] of checks) {
    if (mostlyMatches(values, predicate)) {
      return pattern;
    }
  }

  const averageLength = values.reduce((total, value) => total + value.length, 0) / values.length;
  return averageLength > 80 ? "long_text" : "text";
}

function isAuditActorColumn(column: string, tokens = tokenizeColumnName(column)): boolean {
  return /^(createdby|updatedby|modifiedby|deletedby|createdbyid|updatedbyid|modifiedbyid|deletedbyid)$/.test(column) ||
    /(created|updated|modified|deleted)(by|byid|user|userid)$/.test(column) ||
    /^(owner|ownerid|user|userid|assignee|assigneeid)$/.test(column) ||
    (
      tokens.some((token) => ["created", "updated", "modified", "deleted", "changed", "approved", "submitted"].includes(token)) &&
      tokens.some((token) => ["by", "user", "userid", "owner", "actor", "agent"].includes(token))
    );
}

function isTimestampColumn(column: string): boolean {
  return /(createdat|createddate|updatedat|updateddate|modifiedat|modifieddate|deletedat|deleteddate|timestamp|datetime|date|time|startdate|enddate|duedate|expiry|expiresat)$/.test(column);
}

function isLinkColumn(column: string, values: string[]): boolean {
  const nameLooksLinked = column.endsWith("id") ||
    column.endsWith("ids") ||
    column.includes("uuid") ||
    column.includes("guid") ||
    column.endsWith("key") ||
    column.endsWith("ref") ||
    column.endsWith("reference") ||
    column.includes("foreignkey") ||
    column.includes("parent");

  if (nameLooksLinked) {
    return true;
  }

  const filledValues = values.filter((value) => value !== "");
  if (filledValues.length === 0) {
    return false;
  }

  const idLikeCount = filledValues.filter((value) =>
    isUuidLike(value) ||
    /^[a-z]{2,}_[a-zA-Z0-9]+$/.test(value) ||
    /^[A-Z]{2,}-?\d{3,}$/i.test(value) ||
    /^[a-zA-Z0-9]{12,}$/.test(value),
  ).length;

  return idLikeCount / filledValues.length >= 0.8;
}

function looksLikeCandidateKey(tokens: string[], normalized: string, valuePattern: string, values: string[]): boolean {
  if (["uuid", "email", "url"].includes(valuePattern)) {
    return true;
  }
  if (tokens.some((token) => ["id", "key", "code", "number", "no", "ref", "reference", "uuid", "guid"].includes(token))) {
    return true;
  }
  if (/(^id$|id$|key$|code$|ref$|uuid|guid)/.test(normalized)) {
    return true;
  }

  const filledValues = values.filter((value) => value !== "");
  if (filledValues.length === 0) {
    return false;
  }
  return filledValues.filter((value) =>
    isUuidLike(value) ||
    /^[a-z]{2,}_[a-zA-Z0-9]+$/.test(value) ||
    /^[A-Z]{2,}-?\d{3,}$/i.test(value),
  ).length / filledValues.length >= 0.8;
}

function mostlyMatches(values: string[], predicate: (value: string) => boolean): boolean {
  const filledValues = values.filter((value) => value !== "");
  if (filledValues.length === 0) {
    return false;
  }

  return filledValues.filter(predicate).length / filledValues.length >= 0.8;
}

function isDateLike(value: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(value)) {
    return !Number.isNaN(Date.parse(value));
  }
  return false;
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isEmailLike(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUrlLike(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value) || /^www\.\S+\.\S+$/i.test(value);
}

function isPhoneLike(value: string): boolean {
  if (isDateLike(value)) {
    return false;
  }
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^[+()\-\s.\d]+$/.test(value);
}

function isNumericLike(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value.replaceAll(",", ""));
}

function isCurrencyLike(value: string): boolean {
  return /^[£$€]\s?-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(value) ||
    /^-?\d{1,3}(,\d{3})*(\.\d+)?\s?(usd|gbp|eur)$/i.test(value);
}

function isPercentLike(value: string): boolean {
  return /^-?\d+(\.\d+)?%$/.test(value);
}

function isBooleanLike(value: string): boolean {
  return /^(true|false|yes|no|y|n|0|1)$/i.test(value);
}

function isJsonLike(value: string): boolean {
  const trimmed = value.trim();
  if (!((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]")))) {
    return false;
  }
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

function isMultiValueLike(value: string): boolean {
  return value.includes(";") || value.includes("|") || /^\s*\w+(\s*,\s*\w+){2,}\s*$/.test(value);
}

function distinctCount(values: string[]): number {
  return new Set(values.filter((value) => value !== "")).size;
}

function topOptions(values: string[], limit: number): Array<{ value: string; count: number }> {
  return Object.entries(countOptions(values))
    .sort((left, right) => right[1] - left[1] || compareKeys(left[0], right[0]))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function sortProblemGroups(left: ProblemGroup, right: ProblemGroup): number {
  return right.count - left.count ||
    right.depth - left.depth ||
    compareKeys(left.problem, right.problem) ||
    compareKeys(left.column, right.column) ||
    compareKeys(left.value, right.value);
}

function strongestProblemGroup(
  groups: ProblemGroup[],
  problem: ProblemGroup["problem"],
): ProblemGroup | undefined {
  return groups
    .filter((group) => group.problem === problem)
    .sort(sortProblemGroups)[0];
}

function calculateRiskScore(findings: IntelligenceFinding[]): number {
  const weights: Record<FindingSeverity, number> = {
    critical: 100,
    high: 75,
    medium: 45,
    low: 20,
    info: 0,
  };
  const confidenceMultiplier: Record<IntelligenceFinding["confidence"], number> = {
    high: 1,
    medium: 0.8,
    low: 0.55,
  };

  const score = findings.reduce(
    (total, finding) => total + weights[finding.severity] * confidenceMultiplier[finding.confidence],
    0,
  );
  return Math.min(100, Math.round(score));
}

function buildVerdict(passed: boolean, riskScore: number, findings: IntelligenceFinding[]): string {
  if (passed) {
    return "No material data risk detected by the enabled checks.";
  }
  if (findings.some((finding) => finding.severity === "critical")) {
    return "Critical risk: fix duplicate keys or schema blockers before trusting row-level results.";
  }
  if (riskScore >= 80) {
    return "High risk: differences likely affect data completeness, relationships, or important business fields.";
  }
  if (riskScore >= 45) {
    return "Medium risk: differences need review, with priority on grouped rows and changed key context.";
  }
  return "Low risk: differences appear limited, but review the findings before accepting the files.";
}

function sortFindings(left: IntelligenceFinding, right: IntelligenceFinding): number {
  return severityRank(right.severity) - severityRank(left.severity) ||
    confidenceRank(right.confidence) - confidenceRank(left.confidence) ||
    compareKeys(left.title, right.title);
}

function severityRank(severity: FindingSeverity): number {
  const ranks: Record<FindingSeverity, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    info: 1,
  };
  return ranks[severity];
}

function confidenceRank(confidence: IntelligenceFinding["confidence"]): number {
  const ranks: Record<IntelligenceFinding["confidence"], number> = {
    high: 3,
    medium: 2,
    low: 1,
  };
  return ranks[confidence];
}

function ratio(value: number, total: number): number {
  return total === 0 ? 0 : value / total;
}

function percent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

function formatList(values: string[]): string {
  return values.length === 0 ? "none" : values.map(showBlank).join(", ");
}

function formatTopValueCounts(values: Array<{ value: string; count: number }>): string {
  return values.map((value) => `${showBlank(value.value)} (${value.count})`).join(", ");
}

function showBlank(value: string): string {
  return value === "" ? "(blank)" : value;
}

function compareKeys(left: string, right: string): number {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}
