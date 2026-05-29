export type CsvValue = string;

export type CsvRow = Record<string, CsvValue>;

export interface ParsedCsv {
  headers: string[];
  rows: CsvRow[];
}

export interface ParseOptions {
  trimValues: boolean;
}

export function parseCsv(input: string, options: ParseOptions): ParsedCsv {
  const records = parseRecords(input);

  if (records.length === 0) {
    throw new Error("CSV is empty.");
  }

  const headers = records[0].map((header) => normalizeCell(header, options));
  if (headers.length === 0 || headers.every((header) => header === "")) {
    throw new Error("CSV header row is empty.");
  }

  const seenHeaders = new Set<string>();
  for (const header of headers) {
    if (header === "") {
      throw new Error("CSV contains an empty header name.");
    }
    if (seenHeaders.has(header)) {
      throw new Error(`CSV contains duplicate header "${header}".`);
    }
    seenHeaders.add(header);
  }

  const rows: CsvRow[] = [];
  for (const record of records.slice(1)) {
    if (record.length === 1 && record[0] === "") {
      continue;
    }

    const row: CsvRow = {};
    for (const header of headers) {
      row[header] = "";
    }

    for (let index = 0; index < record.length; index += 1) {
      const header = headers[index];
      if (header !== undefined) {
        row[header] = normalizeCell(record[index], options);
      }
    }
    rows.push(row);
  }

  return { headers, rows };
}

function normalizeCell(value: string, options: ParseOptions): string {
  return options.trimValues ? value.trim() : value;
}

function parseRecords(input: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inQuotes) {
      if (char === '"') {
        const next = input[index + 1];
        if (next === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      record.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      record.push(stripTrailingCarriageReturn(field));
      records.push(record);
      record = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (inQuotes) {
    throw new Error("CSV has an unterminated quoted field.");
  }

  if (field.length > 0 || record.length > 0) {
    record.push(stripTrailingCarriageReturn(field));
    records.push(record);
  }

  return records;
}

function stripTrailingCarriageReturn(value: string): string {
  return value.endsWith("\r") ? value.slice(0, -1) : value;
}
