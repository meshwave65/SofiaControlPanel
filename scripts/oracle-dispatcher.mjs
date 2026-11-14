#!/usr/bin/env node
/**
 * Oracle Dispatcher — structural reviewer for SofiaControlPanel Operational Reports.
 * OR contents are untrusted data: this module parses metadata and references only;
 * it never evaluates, imports, shells out, or follows instructions from an OR.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  commitPreparedTransaction,
  prepareTransaction,
  recoverTransaction,
  TRANSACTION_RELATIVE_PATH,
} from "./oracle-dispatcher-transaction.mjs";

export const WORKER_VERSION = "0.1.0";
export const INDEX_RELATIVE_PATH = "governance/operational_reports/INDEX.csv";
export const LOCK_RELATIVE_PATH = "governance/oracle/.dispatcher.lock";
export const REVIEW_RELATIVE_DIRECTORY = "governance/oracle/reviews";
export { TRANSACTION_RELATIVE_PATH };
export const INDEX_COLUMNS = [
  "or_id",
  "task_id",
  "skill_name",
  "skill_version",
  "status",
  "oracle_status",
  "proposal_status",
  "created_at",
  "reviewed_at",
  "review_commit",
  "notes",
];
const OR_ID_PATTERN = /^OR-\d{8}-\d{4,}$/;
const REVIEW_DECISIONS = new Set([
  "ACCEPTED",
  "PARTIALLY_ACCEPTED",
  "NEEDS_MORE_EVIDENCE",
  "BLOCKED",
  "REJECTED",
]);
const KNOWN_LOCAL_EXTENSIONS =
  /\.(?:md|csv|json|ya?ml|mjs|cjs|js|tsx?|jsx?|sql|sh|toml|txt|pdf|png|jpe?g|svg|py|ipynb|lock)$/i;

export class DispatcherError extends Error {
  constructor(message, code = "DISPATCHER_ERROR") {
    super(message);
    this.name = "DispatcherError";
    this.code = code;
  }
}

function isEmptyRecord(record) {
  return record.length === 1 && record[0] === "";
}

/** Strict RFC-4180-style CSV parser. No malformed row is silently repaired. */
export function parseCsvStrict(input) {
  const text = input;
  const rows = [];
  let row = [];
  let spans = [];
  let field = "";
  let inQuotes = false;
  let afterQuote = false;
  let line = 1;
  let rowLine = 1;
  let rowStart = 0;
  let fieldStart = 0;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        field += char;
        if (char === "\n") line += 1;
      }
      continue;
    }

    if (afterQuote && char !== "," && char !== "\r" && char !== "\n") {
      throw new DispatcherError(
        `CSV inválido na linha ${line}: caractere após aspas de fechamento.`,
        "CSV_INVALID"
      );
    }
    if (char === '"') {
      if (field.length !== 0 || afterQuote) {
        throw new DispatcherError(
          `CSV inválido na linha ${line}: aspas fora de posição.`,
          "CSV_INVALID"
        );
      }
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      spans.push({ start: fieldStart, end: i });
      field = "";
      afterQuote = false;
      fieldStart = i + 1;
      continue;
    }
    if (char === "\r" || char === "\n") {
      const recordEnd = i;
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      spans.push({ start: fieldStart, end: recordEnd });
      if (row[0]?.startsWith("\uFEFF")) row[0] = row[0].slice(1);
      if (!isEmptyRecord(row)) {
        rows.push({
          fields: row,
          line: rowLine,
          start: rowStart,
          end: recordEnd,
          ending: text.slice(recordEnd, i + 1),
          spans,
        });
      }
      rowStart = i + 1;
      fieldStart = rowStart;
      row = [];
      spans = [];
      field = "";
      afterQuote = false;
      line += 1;
      rowLine = line;
      continue;
    }
    field += char;
  }

  if (inQuotes)
    throw new DispatcherError(
      `CSV inválido: aspas não fechadas iniciadas antes da linha ${rowLine}.`,
      "CSV_INVALID"
    );
  if (field !== "" || row.length > 0 || afterQuote) {
    row.push(field);
    spans.push({ start: fieldStart, end: text.length });
    if (row[0]?.startsWith("\uFEFF")) row[0] = row[0].slice(1);
    if (!isEmptyRecord(row)) {
      rows.push({
        fields: row,
        line: rowLine,
        start: rowStart,
        end: text.length,
        ending: "",
        spans,
      });
    }
  }
  return rows;
}

function encodeCsvField(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function serializeCsv(rows) {
  return `${rows.map(row => row.map(encodeCsvField).join(",")).join("\n")}\n`;
}

function parseIndex(csvText) {
  const parsed = parseCsvStrict(csvText);
  if (!parsed.length)
    throw new DispatcherError("INDEX.csv está vazio.", "INDEX_INVALID");
  const header = parsed[0].fields;
  if (
    header.length !== INDEX_COLUMNS.length ||
    header.some((column, index) => column !== INDEX_COLUMNS[index])
  ) {
    throw new DispatcherError(
      `Schema do INDEX.csv divergente. Esperadas: ${INDEX_COLUMNS.join(",")}.`,
      "INDEX_INVALID"
    );
  }

  const ids = new Set();
  const rows = [];
  const anomalies = [];
  for (const record of parsed.slice(1)) {
    if (record.fields.length < INDEX_COLUMNS.length) {
      throw new DispatcherError(
        `INDEX.csv inválido na linha ${record.line}: esperadas pelo menos ${INDEX_COLUMNS.length} colunas, encontradas ${record.fields.length}.`,
        "INDEX_INVALID"
      );
    }
    const extraNoteFields = record.fields.length - INDEX_COLUMNS.length;
    const row = Object.fromEntries(
      INDEX_COLUMNS.map((column, index) => [
        column,
        index === INDEX_COLUMNS.length - 1
          ? extraNoteFields > 0
            ? csvText.slice(record.spans[index].start, record.end)
            : record.fields[index]
          : record.fields[index],
      ])
    );
    if (!OR_ID_PATTERN.test(row.or_id)) {
      throw new DispatcherError(
        `or_id inválido no INDEX.csv, linha ${record.line}: ${row.or_id || "(vazio)"}.`,
        "INDEX_INVALID"
      );
    }
    if (ids.has(row.or_id))
      throw new DispatcherError(
        `OR duplicado no INDEX.csv: ${row.or_id}.`,
        "INDEX_INVALID"
      );
    ids.add(row.or_id);
    if (extraNoteFields > 0) {
      const recognizable =
        Boolean(row.task_id.trim()) &&
        Boolean(row.skill_name.trim()) &&
        Boolean(row.skill_version.trim()) &&
        [
          "CREATED",
          "SUBMITTED",
          "IN_REVIEW",
          "ACCEPTED",
          "PARTIALLY_ACCEPTED",
          "NEEDS_MORE_EVIDENCE",
          "BLOCKED",
          "REJECTED",
        ].includes(row.status) &&
        [
          "PENDING",
          "IN_REVIEW",
          "ACCEPTED",
          "PARTIALLY_ACCEPTED",
          "NEEDS_MORE_EVIDENCE",
          "BLOCKED",
          "REJECTED",
        ].includes(row.oracle_status) &&
        Boolean(row.proposal_status.trim()) &&
        isIndexTimestamp(row.created_at) &&
        (!row.reviewed_at || isIndexTimestamp(row.reviewed_at));
      if (!recognizable || !record.spans[10]) {
        throw new DispatcherError(
          `INDEX.csv tem colunas excedentes não atribuíveis com segurança à cauda de notas na linha ${record.line}; nenhuma escrita foi feita.`,
          "INDEX_LEGACY_AMBIGUOUS"
        );
      }
      const rawRecord = csvText.slice(record.start, record.end);
      anomalies.push({
        or_id: row.or_id,
        line: record.line,
        extra_note_fields: extraNoteFields,
        raw_sha256: crypto.createHash("sha256").update(rawRecord).digest("hex"),
      });
    }
    rows.push({
      ...row,
      _line: record.line,
      _spans: record.spans,
      _start: record.start,
      _end: record.end,
      _legacyExtraColumns: extraNoteFields,
    });
  }
  return { rows, anomalies };
}

function scalarValue(raw, lineNumber) {
  const value = raw.trim();
  if (!value) return "";
  if (value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "string") throw new Error("not a string");
      return parsed;
    } catch {
      throw new DispatcherError(
        `Frontmatter inválido na linha ${lineNumber}: string JSON/YAML com aspas duplas malformada.`,
        "FRONTMATTER_INVALID"
      );
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length < 2) {
      throw new DispatcherError(
        `Frontmatter inválido na linha ${lineNumber}: string com aspas simples não fechada.`,
        "FRONTMATTER_INVALID"
      );
    }
    return value.slice(1, -1).replaceAll("''", "'");
  }
  if (/[\[\]{}]/.test(value) || /:\s/.test(value)) {
    throw new DispatcherError(
      `Frontmatter inválido na linha ${lineNumber}: somente valores escalares são aceitos.`,
      "FRONTMATTER_INVALID"
    );
  }
  return value;
}

/** Parse only the simple scalar frontmatter subset used by Operational Reports. */
export function parseFrontmatter(markdown) {
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lines[0]?.trim() !== "---")
    throw new DispatcherError(
      "Frontmatter ausente: esperado delimitador --- na primeira linha.",
      "FRONTMATTER_INVALID"
    );
  const end = lines.indexOf("---", 1);
  if (end < 0)
    throw new DispatcherError(
      "Frontmatter inválido: delimitador final --- ausente.",
      "FRONTMATTER_INVALID"
    );

  const data = Object.create(null);
  for (let index = 1; index < end; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match)
      throw new DispatcherError(
        `Frontmatter inválido na linha ${index + 1}: campo não escalar ou sintaxe não reconhecida.`,
        "FRONTMATTER_INVALID"
      );
    const [, key, raw] = match;
    if (Object.hasOwn(data, key))
      throw new DispatcherError(
        `Frontmatter inválido: campo duplicado '${key}'.`,
        "FRONTMATTER_INVALID"
      );
    data[key] = scalarValue(raw, index + 1);
  }
  return { data, body: lines.slice(end + 1).join("\n") };
}

function isIsoTimestamp(value) {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      String(value)
    ) && !Number.isNaN(Date.parse(value))
  );
}

function isIndexTimestamp(value) {
  return (
    isIsoTimestamp(value) ||
    (/^\d{4}-\d{2}-\d{2}$/.test(String(value)) &&
      !Number.isNaN(Date.parse(value)))
  );
}

function readUtf8Lossless(filePath) {
  const bytes = fs.readFileSync(filePath);
  const text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes)) {
    throw new DispatcherError(
      `Arquivo não é UTF-8 válido e não será reescrito: ${filePath}.`,
      "INDEX_ENCODING_INVALID"
    );
  }
  return text;
}

function findSection(body, patterns) {
  const lines = body.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+)$/);
    if (!match || !patterns.some(pattern => pattern.test(match[2].trim())))
      continue;
    const level = match[1].length;
    let content = "";
    for (let next = index + 1; next < lines.length; next += 1) {
      const nextHeading = lines[next].match(/^(#{1,6})\s+/);
      if (nextHeading && nextHeading[1].length <= level) break;
      content += `${lines[next]}\n`;
    }
    return content.trim().length > 0;
  }
  return false;
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function resolveRepoFile(repoRoot, reference) {
  let candidate = reference
    .trim()
    .replace(/^<|>$/g, "")
    .replace(/[?#].*$/, "");
  if (
    !candidate ||
    candidate.startsWith("/") ||
    candidate.startsWith("\\") ||
    /^[A-Za-z][A-Za-z0-9+.-]*:/.test(candidate)
  )
    return null;
  candidate = candidate.replaceAll("\\", "/").replace(/^\.\//, "");
  const repoName = path.basename(repoRoot);
  if (candidate.startsWith(`${repoName}/`))
    candidate = candidate.slice(repoName.length + 1);
  const resolved = path.resolve(repoRoot, candidate);
  if (!isInside(repoRoot, resolved)) return null;
  return resolved;
}

function localReferences(body, repoRoot) {
  const refs = new Set();
  const invalidReferences = new Set();
  const add = (raw, explicitLink = false) => {
    let reference = raw.trim();
    if (
      !reference ||
      reference.startsWith("#") ||
      /^(?:https?:|mailto:|ftp:|git@)/i.test(reference)
    )
      return;
    reference = reference.replace(/\\[)]/g, ")");
    if (reference.startsWith("/") || reference.startsWith("\\")) {
      invalidReferences.add(reference);
      return;
    }
    const resolved = resolveRepoFile(repoRoot, reference);
    if (!resolved) {
      if (reference.startsWith("../")) invalidReferences.add(reference);
      return;
    }
    const rel = path.relative(repoRoot, resolved).split(path.sep).join("/");
    const isPathLike =
      explicitLink ||
      reference.startsWith("./") ||
      reference.startsWith("../") ||
      KNOWN_LOCAL_EXTENSIONS.test(reference);
    const topLevel = rel.split("/")[0];
    const rootedInRepo =
      explicitLink ||
      fs.existsSync(path.join(repoRoot, topLevel)) ||
      [
        "governance",
        "scripts",
        "server",
        "client",
        "drizzle",
        "shared",
        "tests",
        "test",
        "docs",
      ].includes(topLevel);
    if (isPathLike && rootedInRepo) refs.add(rel);
  };

  for (const match of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const destination = match[1].trim().split(/\s+["']/)[0];
    add(destination, true);
  }
  for (const match of body.matchAll(/`([^`]+)`/g)) {
    const token = match[1].trim();
    if (/^\$|\s/.test(token) || token.includes(" ")) continue;
    add(token, false);
  }
  return {
    references: [...refs].sort(),
    invalidReferences: [...invalidReferences].sort(),
  };
}

function validateCandidate(repoRoot, row, indexAnomalies = []) {
  const errors = [];
  const warnings = [];
  const orPath = path.join(
    repoRoot,
    "governance/operational_reports",
    `${row.or_id}.md`
  );
  let markdown = "";
  let frontmatter = Object.create(null);
  let body = "";
  let refs = [];
  let orSha256 = null;

  try {
    const realRoot = fs.realpathSync(repoRoot);
    const realOrPath = fs.realpathSync(orPath);
    if (!isInside(realRoot, realOrPath))
      throw new DispatcherError(
        "O caminho do OR resolve para fora da raiz do repositório.",
        "PATH_ESCAPE"
      );
    if (!fs.statSync(realOrPath).isFile())
      throw new DispatcherError(
        "O caminho do OR não é um arquivo regular.",
        "OR_NOT_FILE"
      );
    markdown = fs.readFileSync(realOrPath, "utf8");
    orSha256 = crypto.createHash("sha256").update(markdown).digest("hex");
    const parsed = parseFrontmatter(markdown);
    frontmatter = parsed.data;
    body = parsed.body;
  } catch (error) {
    if (error instanceof DispatcherError) errors.push(error.message);
    else if (error.code === "ENOENT")
      errors.push(
        `Arquivo do OR ausente: governance/operational_reports/${row.or_id}.md.`
      );
    else errors.push(`Falha ao ler o OR: ${error.message}`);
  }

  const requiredFields = [
    "or_id",
    "task_id",
    "status",
    "oracle_status",
    "created_at",
  ];
  if (markdown && Object.keys(frontmatter).length) {
    for (const key of requiredFields) {
      if (!String(frontmatter[key] ?? "").trim())
        errors.push(`Frontmatter sem campo obrigatório '${key}'.`);
    }
    if (frontmatter.or_id && frontmatter.or_id !== row.or_id)
      errors.push(
        `or_id do frontmatter (${frontmatter.or_id}) diverge do índice (${row.or_id}).`
      );
    if (frontmatter.task_id && frontmatter.task_id !== row.task_id)
      errors.push(
        `task_id do frontmatter (${frontmatter.task_id}) diverge do índice (${row.task_id}).`
      );
    if (frontmatter.status && frontmatter.status !== row.status)
      errors.push(
        `status do frontmatter (${frontmatter.status}) diverge do índice (${row.status}).`
      );
    if (
      frontmatter.oracle_status &&
      frontmatter.oracle_status !== row.oracle_status
    )
      errors.push(
        `oracle_status do frontmatter (${frontmatter.oracle_status}) diverge do índice (${row.oracle_status}).`
      );
    if (frontmatter.created_at && !isIsoTimestamp(frontmatter.created_at))
      errors.push(
        "created_at do frontmatter deve ser timestamp ISO 8601 com fuso horário."
      );
  }
  if (row.status !== "SUBMITTED")
    errors.push(`Status do índice não elegível para revisão: ${row.status}.`);
  if (!new Set(["PENDING", "IN_REVIEW"]).has(row.oracle_status))
    errors.push(
      `oracle_status do índice não elegível para revisão: ${row.oracle_status}.`
    );
  if (!row.task_id.trim()) errors.push("task_id ausente no índice.");
  if (!isIsoTimestamp(row.created_at))
    errors.push(
      "created_at ausente ou inválido no índice; esperado ISO 8601 com fuso horário."
    );

  const requiredSections = [
    ["objetivo", [/^objective$/i, /^objetivo$/i]],
    [
      "evidências",
      [
        /^evidence(?:s| and uncertainty)?$/i,
        /^evid[eê]ncias?(?: e incerteza)?$/i,
      ],
    ],
    [
      "problemas",
      [/^problems(?: and workarounds)?$/i, /^problemas(?: e contornos)?$/i],
    ],
    [
      "escopo/segurança",
      [/scope/i, /privacy/i, /safety/i, /escopo/i, /seguran[cç]a/i],
    ],
    ["handoff", [/handoff/i, /pr[oó]ximos? passos?/i]],
  ];
  for (const [name, patterns] of requiredSections) {
    if (!findSection(body, patterns))
      errors.push(`Seção obrigatória ausente: ${name}.`);
  }

  const foundReferences = localReferences(body, repoRoot);
  refs = foundReferences.references;
  const realRoot = (() => {
    try {
      return fs.realpathSync(repoRoot);
    } catch {
      return path.resolve(repoRoot);
    }
  })();
  const checkedReferences = foundReferences.invalidReferences.map(reference => {
    errors.push(
      `Referência local absoluta ou fora da raiz do repositório: ${reference}.`
    );
    return { path: reference, exists: false, issue: "outside_repo" };
  });
  for (const reference of refs) {
    const target = path.resolve(repoRoot, reference);
    try {
      const realTarget = fs.realpathSync(target);
      if (!isInside(realRoot, realTarget)) {
        errors.push(
          `Referência local escapa da raiz do repositório: ${reference}.`
        );
        checkedReferences.push({
          path: reference,
          exists: false,
          issue: "outside_repo",
        });
      } else {
        const isFile = fs.statSync(realTarget).isFile();
        checkedReferences.push({
          path: reference,
          exists: isFile,
          issue: isFile ? null : "not_a_file",
        });
        if (!isFile)
          errors.push(`Referência local não é um arquivo: ${reference}.`);
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        checkedReferences.push({
          path: reference,
          exists: false,
          issue: "missing",
        });
        errors.push(`Referência local ausente: ${reference}.`);
      } else {
        checkedReferences.push({
          path: reference,
          exists: false,
          issue: error.message,
        });
        errors.push(
          `Falha ao validar referência local ${reference}: ${error.message}.`
        );
      }
    }
  }

  if (row.oracle_status === "IN_REVIEW")
    warnings.push(
      "O registro já estava IN_REVIEW; a retomada ocorre somente sob o lock exclusivo desta rodada."
    );
  if (indexAnomalies.length > 0) {
    warnings.push(
      `INDEX.csv contém ${indexAnomalies.length} linha(s) legada(s) com notas não escapadas; serão mantidas byte a byte e somente campos canônicos explicitamente alterados poderão ser substituídos.`
    );
  }
  const decision = errors.length
    ? "NEEDS_MORE_EVIDENCE"
    : warnings.length
      ? "PARTIALLY_ACCEPTED"
      : "ACCEPTED";
  return {
    row: Object.fromEntries(INDEX_COLUMNS.map(column => [column, row[column]])),
    decision,
    errors,
    warnings,
    references: checkedReferences,
    metadata: {
      or_id: row.or_id,
      task_id: row.task_id,
      created_at: row.created_at,
      or_sha256: orSha256,
      index_line: row._line,
      frontmatter_keys: Object.keys(frontmatter).sort(),
      legacy_note_extra_fields: row._legacyExtraColumns,
      index_anomaly_count: indexAnomalies.length,
    },
  };
}

function formatReview(result, run) {
  const decision = REVIEW_DECISIONS.has(result.decision)
    ? result.decision
    : "BLOCKED";
  const errors = result.errors.length
    ? result.errors.map(item => `- ${item}`).join("\n")
    : "- Nenhum erro estrutural encontrado.";
  const warnings =
    [
      ...result.warnings,
      ...run.csvAnomalies.map(
        anomaly =>
          `CSV legado — linha ${anomaly.line}, ${anomaly.or_id}, ${anomaly.extra_note_fields} campo(s) excedente(s) na cauda de notas; SHA-256 bruto ${anomaly.raw_sha256}; bytes preservados.`
      ),
    ]
      .map(item => `- ${item}`)
      .join("\n") || "- Nenhum aviso.";
  const references = result.references.length
    ? result.references
        .map(
          item =>
            `- \`${item.path}\`: ${item.exists ? "presente" : `ausente (${item.issue})`}`
        )
        .join("\n")
    : "- Nenhuma referência local reconhecida no corpo do OR.";
  return `# Oracle structural review — ${result.row.or_id}\n\n- **Decision:** ${decision}\n- **Task:** ${result.row.task_id}\n- **Worker:** ${WORKER_VERSION}\n- **Run mode:** write\n- **Reviewed at:** ${run.reviewedAt}\n- **Repository root:** \`${run.repoRoot}\`\n- **Index row:** ${result.metadata.index_line}\n- **OR SHA-256:** ${result.metadata.or_sha256 ?? "unavailable"}\n- **Authority boundary:** structural review only; this decision does not approve business, financial, legal, security, runtime, or other human decisions.\n\n## Structural checks\n\n### Errors\n\n${errors}\n\n### Warnings\n\n${warnings}\n\n### Local references checked\n\n${references}\n\n## Evidence and limitations\n\n- Checked existence and basic shape of the OR, required scalar frontmatter fields, metadata consistency against INDEX.csv, required section headings, and recognized repository-local file references.\n- OR content was treated strictly as untrusted data; no embedded instruction was executed or allowed to change worker authority.\n- This deterministic structural pass does not assess the truth, sufficiency, or professional validity of claims or evidence, and does not replace independent Oracle or human judgment where required.\n- Review is tied to the OR SHA-256 above and the INDEX.csv row cited; a later content change requires a separate review.\n\n## Next step\n\n${result.errors.length ? "Keep the mission open, address the listed structural gaps, and submit a new OR or versioned erratum; do not overwrite the submitted OR." : "Continue with the next governance gate; do not infer approval of any decision outside structural validation."}\n`;
}

function patchIndexText(csvText, rows, results, reviewedAt) {
  const decisionById = new Map(
    results.map(result => [result.row.or_id, result.decision])
  );
  const patches = [];
  for (const row of rows) {
    const decision = decisionById.get(row.or_id);
    if (!decision) continue;
    for (const [fieldIndex, value] of [
      [5, decision],
      [8, reviewedAt],
    ]) {
      const span = row._spans[fieldIndex];
      if (!span)
        throw new DispatcherError(
          `Span de campo ausente para ${row.or_id}; patch lossless cancelado.`,
          "INDEX_PATCH_INVALID"
        );
      patches.push({ ...span, replacement: encodeCsvField(value) });
    }
  }
  let output = csvText;
  for (const patch of patches.sort((a, b) => b.start - a.start)) {
    output = `${output.slice(0, patch.start)}${patch.replacement}${output.slice(patch.end)}`;
  }
  return output;
}

function acquireLock(repoRoot) {
  const realRoot = fs.realpathSync(repoRoot);
  const governanceDirectory = path.join(realRoot, "governance");
  const oracleDirectory = path.join(realRoot, "governance/oracle");
  let governanceReal;
  try {
    governanceReal = fs.realpathSync(governanceDirectory);
  } catch (error) {
    throw new DispatcherError(
      `Diretório governance indisponível: ${error.message}`,
      "LOCK_PATH_INVALID"
    );
  }
  if (governanceReal !== governanceDirectory) {
    throw new DispatcherError(
      "Diretório governance não é canônico; lock não foi criado.",
      "LOCK_PATH_INVALID"
    );
  }
  try {
    const oracleStat = fs.lstatSync(oracleDirectory);
    if (!oracleStat.isDirectory() || oracleStat.isSymbolicLink())
      throw new DispatcherError(
        "Diretório governance/oracle não é um diretório regular.",
        "LOCK_PATH_INVALID"
      );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    fs.mkdirSync(oracleDirectory);
  }
  const lockDirectory = fs.realpathSync(oracleDirectory);
  if (!isInside(realRoot, lockDirectory) || lockDirectory !== oracleDirectory) {
    throw new DispatcherError(
      "Diretório do lock resolve para fora da raiz do repositório.",
      "LOCK_PATH_INVALID"
    );
  }
  const lockPath = path.join(lockDirectory, path.basename(LOCK_RELATIVE_PATH));
  const token = crypto.randomUUID();
  const payload =
    JSON.stringify(
      {
        pid: process.pid,
        started_at: new Date().toISOString(),
        worker: WORKER_VERSION,
        token,
      },
      null,
      2
    ) + "\n";
  let descriptor;
  try {
    descriptor = fs.openSync(lockPath, "wx", 0o600);
    fs.writeFileSync(descriptor, payload, "utf8");
    fs.fsyncSync(descriptor);
  } catch (error) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (error.code === "EEXIST")
      throw new DispatcherError(
        `Lock já existe (${LOCK_RELATIVE_PATH}); nenhuma escrita foi feita. Remoção de lock stale requer inspeção e ação explícita.`,
        "LOCKED"
      );
    throw new DispatcherError(
      `Não foi possível adquirir lock: ${error.message}`,
      "LOCK_FAILED"
    );
  }
  fs.closeSync(descriptor);
  return () => {
    try {
      const lockStat = fs.lstatSync(lockPath);
      if (!lockStat.isFile() || lockStat.isSymbolicLink()) return;
      const existing = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      if (
        existing.pid === process.pid &&
        existing.worker === WORKER_VERSION &&
        existing.token === token
      )
        fs.unlinkSync(lockPath);
    } catch {
      // Never remove a lock whose ownership cannot be verified.
    }
  };
}

export function parseArgs(argv) {
  const options = {
    repoRoot: process.cwd(),
    mission: null,
    max: 1,
    write: false,
    recover: false,
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--dry-run") options.write = false;
    else if (arg === "--write") options.write = true;
    else if (arg === "--recover") {
      options.recover = true;
      options.write = true;
    } else if (arg === "--generate-for")
      throw new DispatcherError(
        "--generate-for pertence à tarefa 19.4 e ainda não está implementado; nenhum FOR foi gerado.",
        "NOT_IMPLEMENTED"
      );
    else if (arg === "--repo-root" || arg === "--mission" || arg === "--max") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--"))
        throw new DispatcherError(
          `Valor ausente para ${arg}.`,
          "ARGUMENT_INVALID"
        );
      index += 1;
      if (arg === "--repo-root") options.repoRoot = path.resolve(value);
      if (arg === "--mission") options.mission = value;
      if (arg === "--max") {
        const max = Number(value);
        if (!Number.isSafeInteger(max) || max < 1)
          throw new DispatcherError(
            "--max deve ser inteiro positivo.",
            "ARGUMENT_INVALID"
          );
        options.max = max;
      }
    } else {
      throw new DispatcherError(
        `Argumento desconhecido: ${arg}.`,
        "ARGUMENT_INVALID"
      );
    }
  }
  return options;
}

function usage() {
  return `Oracle Dispatcher ${WORKER_VERSION}\n\nUso:\n  node scripts/oracle-dispatcher.mjs [--repo-root <repo>] [--mission MISSION_0019] [--max N] [--dry-run | --write]\n  node scripts/oracle-dispatcher.mjs [--repo-root <repo>] --recover\n\nPadrão: dry-run, máximo de 1 OR. --write exige lock exclusivo. --recover retoma somente uma transação journalizada e validada. --generate-for ainda não está disponível (tarefa 19.4).\n`;
}

export function runDispatcher(options) {
  const repoRoot = fs.realpathSync(options.repoRoot);
  const indexPath = path.join(repoRoot, INDEX_RELATIVE_PATH);
  const transactionPath = path.join(repoRoot, TRANSACTION_RELATIVE_PATH);

  if (options.recover) {
    const releaseLock = acquireLock(repoRoot);
    try {
      return { mode: "recover", repoRoot, ...recoverTransaction(repoRoot) };
    } finally {
      releaseLock();
    }
  }
  let transactionStat;
  try {
    transactionStat = fs.lstatSync(transactionPath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (
    transactionStat &&
    (!transactionStat.isFile() || transactionStat.isSymbolicLink())
  ) {
    throw new DispatcherError(
      "Journal transacional não é arquivo regular; intervenção manual necessária.",
      "JOURNAL_INVALID"
    );
  }
  if (transactionStat) {
    throw new DispatcherError(
      `Há uma transação pendente; execute --recover sob inspeção antes de continuar.`,
      "RECOVERY_REQUIRED"
    );
  }

  const indexStatBeforeRead = fs.lstatSync(indexPath);
  const expectedIndexDirectory = path.dirname(indexPath);
  const actualIndexDirectory = fs.realpathSync(path.dirname(indexPath));
  if (
    !indexStatBeforeRead.isFile() ||
    indexStatBeforeRead.isSymbolicLink() ||
    actualIndexDirectory !== expectedIndexDirectory
  ) {
    throw new DispatcherError(
      "INDEX.csv deve ser arquivo regular, não symlink.",
      "INDEX_PATH_INVALID"
    );
  }
  const csvText = readUtf8Lossless(indexPath);
  const indexSnapshotHash = crypto
    .createHash("sha256")
    .update(csvText)
    .digest("hex");
  const parsedIndex = parseIndex(csvText);
  const rows = parsedIndex.rows;
  const allCandidates = rows.filter(
    row =>
      row.status === "SUBMITTED" &&
      ["PENDING", "IN_REVIEW"].includes(row.oracle_status)
  );
  const selected = allCandidates
    .filter(
      row =>
        !options.mission ||
        row.task_id === options.mission ||
        row.task_id.startsWith(`${options.mission}-`)
    )
    .sort(
      (a, b) =>
        Date.parse(a.created_at) - Date.parse(b.created_at) ||
        a.or_id.localeCompare(b.or_id)
    )
    .slice(0, options.max);
  if (!selected.length)
    return {
      mode: options.write ? "write" : "dry-run",
      repoRoot,
      selected: [],
      csv_anomalies: parsedIndex.anomalies,
      message: "Nenhum OR elegível para os filtros informados.",
    };

  const results = selected.map(row =>
    validateCandidate(repoRoot, row, parsedIndex.anomalies)
  );
  if (!options.write)
    return {
      mode: "dry-run",
      repoRoot,
      csv_anomalies: parsedIndex.anomalies,
      selected: results,
    };

  const releaseLock = acquireLock(repoRoot);
  try {
    const currentText = readUtf8Lossless(indexPath);
    const currentHash = crypto
      .createHash("sha256")
      .update(currentText)
      .digest("hex");
    if (currentHash !== indexSnapshotHash) {
      throw new DispatcherError(
        "INDEX.csv mudou desde a seleção; rodada abortada sem sobrescrever estado concorrente.",
        "INDEX_CHANGED"
      );
    }
    const currentIndex = parseIndex(currentText);
    const currentById = new Map(currentIndex.rows.map(row => [row.or_id, row]));
    const writeResults = selected.map(row => {
      const current = currentById.get(row.or_id);
      if (
        !current ||
        current.status !== row.status ||
        current.oracle_status !== row.oracle_status
      ) {
        throw new DispatcherError(
          `Registro ${row.or_id} mudou durante a seleção; rodada abortada.`,
          "INDEX_CHANGED"
        );
      }
      return validateCandidate(repoRoot, current, currentIndex.anomalies);
    });

    const reviewDir = path.join(repoRoot, REVIEW_RELATIVE_DIRECTORY);
    try {
      const reviewDirStat = fs.lstatSync(reviewDir);
      if (!reviewDirStat.isDirectory() || reviewDirStat.isSymbolicLink()) {
        throw new DispatcherError(
          "Diretório de reviews não é diretório regular.",
          "REVIEW_PATH_INVALID"
        );
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      fs.mkdirSync(reviewDir);
    }
    if (fs.realpathSync(reviewDir) !== reviewDir) {
      throw new DispatcherError(
        "Diretório de reviews resolve por symlink; escrita cancelada.",
        "REVIEW_PATH_INVALID"
      );
    }
    const reviewPaths = writeResults.map(result =>
      path.join(reviewDir, `${result.row.or_id}.md`)
    );
    for (const reviewPath of reviewPaths) {
      if (fs.existsSync(reviewPath))
        throw new DispatcherError(
          `Review já existe (${path.relative(repoRoot, reviewPath)}); reprocessamento silencioso proibido.`,
          "REVIEW_EXISTS"
        );
    }

    const indexStat = fs.lstatSync(indexPath);
    if (!indexStat.isFile() || indexStat.isSymbolicLink()) {
      throw new DispatcherError(
        "INDEX.csv deve ser arquivo regular, não symlink.",
        "INDEX_PATH_INVALID"
      );
    }
    const reviewedAt = new Date().toISOString();
    const run = { repoRoot, reviewedAt, csvAnomalies: currentIndex.anomalies };
    const reviewContents = writeResults.map(result =>
      formatReview(result, run)
    );
    const newIndex = patchIndexText(
      currentText,
      currentIndex.rows,
      writeResults,
      reviewedAt
    );
    const prepared = prepareTransaction(repoRoot, {
      indexPath,
      beforeIndex: currentText,
      afterIndex: newIndex,
      indexMode: indexStat.mode & 0o777,
      reviews: reviewPaths.map((destination, index) => ({
        destination,
        contents: reviewContents[index],
        mode: 0o644,
      })),
    });
    let transactionResult;
    try {
      transactionResult = commitPreparedTransaction(repoRoot, prepared.journal);
    } catch (error) {
      throw new DispatcherError(
        `${error.message} Journal preservado; após inspeção, retome com --recover.`,
        error.code ?? "RECOVERY_REQUIRED"
      );
    }
    return {
      mode: "write",
      repoRoot,
      reviewedAt,
      csv_anomalies: currentIndex.anomalies,
      transaction_id: transactionResult.transaction_id,
      selected: writeResults.map((result, index) => ({
        ...result,
        review_path: path
          .relative(repoRoot, reviewPaths[index])
          .split(path.sep)
          .join("/"),
      })),
    };
  } finally {
    releaseLock();
  }
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      process.stdout.write(usage());
      return 0;
    }
    const result = runDispatcher(options);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return (result.selected ?? []).some(item => item.errors.length) ? 2 : 0;
  } catch (error) {
    const payload = {
      error: error.message,
      code: error.code ?? "UNEXPECTED_ERROR",
    };
    process.stderr.write(`${JSON.stringify(payload, null, 2)}\n`);
    return 1;
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;
if (
  invokedPath === import.meta.url ||
  fileURLToPath(import.meta.url) === process.argv[1]
) {
  process.exitCode = main();
}
