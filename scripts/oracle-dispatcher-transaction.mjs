import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const TRANSACTION_RELATIVE_PATH =
  "governance/oracle/.dispatcher.transaction.json";
const INDEX_RELATIVE_PATH = "governance/operational_reports/INDEX.csv";
const REVIEW_DIRECTORY = "governance/oracle/reviews";
const OR_ID_PATTERN = /^OR-\d{8}-\d{4,}$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;

export class TransactionError extends Error {
  constructor(message, code = "TRANSACTION_FAILED") {
    super(message);
    this.name = "TransactionError";
    this.code = code;
  }
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function writeExclusive(filePath, contents, mode) {
  const descriptor = fs.openSync(filePath, "wx", mode);
  try {
    fs.writeFileSync(descriptor, contents, "utf8");
    fs.fsyncSync(descriptor);
  } catch (error) {
    fs.closeSync(descriptor);
    try {
      fs.unlinkSync(filePath);
    } catch {}
    throw error;
  }
  fs.closeSync(descriptor);
}

function syncDirectory(directory) {
  let descriptor;
  try {
    descriptor = fs.openSync(directory, "r");
    fs.fsyncSync(descriptor);
  } catch (error) {
    if (!new Set(["EINVAL", "ENOTSUP", "EISDIR"]).has(error.code)) throw error;
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function relativePath(repoRoot, absolutePath) {
  const relative = path
    .relative(repoRoot, absolutePath)
    .split(path.sep)
    .join("/");
  if (!relative || relative.startsWith("../") || path.isAbsolute(relative)) {
    throw new TransactionError(
      "Caminho transacional fora da raiz do repositório.",
      "TRANSACTION_PATH_INVALID"
    );
  }
  const root = fs.realpathSync(repoRoot);
  const realParent = fs.realpathSync(path.dirname(absolutePath));
  const expectedParent = path.resolve(root, path.dirname(relative));
  if (realParent !== expectedParent) {
    throw new TransactionError(
      "Diretório de staging não corresponde ao caminho físico do repositório.",
      "TRANSACTION_PATH_INVALID"
    );
  }
  return relative;
}

function canonicalJournalPath(repoRoot) {
  const root = fs.realpathSync(repoRoot);
  const journalPath = path.join(root, TRANSACTION_RELATIVE_PATH);
  const realParent = fs.realpathSync(path.dirname(journalPath));
  if (realParent !== path.dirname(journalPath)) {
    throw new TransactionError(
      "Diretório do journal não corresponde ao caminho físico do repositório.",
      "TRANSACTION_PATH_INVALID"
    );
  }
  return journalPath;
}

function resolveManaged(repoRoot, relative) {
  if (
    typeof relative !== "string" ||
    !relative ||
    relative.includes("\\") ||
    path.posix.isAbsolute(relative) ||
    relative.split("/").some(part => !part || part === "." || part === "..")
  ) {
    throw new TransactionError(
      "Journal contém caminho inválido.",
      "TRANSACTION_PATH_INVALID"
    );
  }
  const absolute = path.resolve(repoRoot, ...relative.split("/"));
  const rel = path.relative(repoRoot, absolute);
  if (rel.startsWith(`..${path.sep}`) || rel === ".." || path.isAbsolute(rel)) {
    throw new TransactionError(
      "Journal tenta escapar da raiz do repositório.",
      "TRANSACTION_PATH_INVALID"
    );
  }
  const realRoot = fs.realpathSync(repoRoot);
  const parent = path.dirname(absolute);
  const realParent = fs.realpathSync(parent);
  const parentRel = path.relative(realRoot, realParent);
  const expectedParent = path.resolve(repoRoot, path.dirname(relative));
  if (
    parentRel.startsWith(`..${path.sep}`) ||
    parentRel === ".." ||
    path.isAbsolute(parentRel) ||
    realParent !== expectedParent
  ) {
    throw new TransactionError(
      "Diretório do journal resolve para fora do repositório.",
      "TRANSACTION_PATH_INVALID"
    );
  }
  return absolute;
}

function assertRegularOrMissing(filePath) {
  try {
    const stat = fs.lstatSync(filePath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new TransactionError(
        `Arquivo transacional não regular: ${filePath}.`,
        "TRANSACTION_PATH_INVALID"
      );
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function hashFile(filePath) {
  assertRegularOrMissing(filePath);
  return sha256(fs.readFileSync(filePath));
}

function writeJournalAtomic(repoRoot, journal) {
  const journalPath = canonicalJournalPath(repoRoot);
  if (fs.existsSync(journalPath)) {
    throw new TransactionError(
      "Journal de transação existente; execute --recover antes de nova escrita.",
      "RECOVERY_REQUIRED"
    );
  }
  const tempPath = `${journalPath}.tmp-${process.pid}-${crypto.randomBytes(6).toString("hex")}`;
  try {
    writeExclusive(tempPath, `${JSON.stringify(journal, null, 2)}\n`, 0o600);
    fs.linkSync(tempPath, journalPath);
    fs.unlinkSync(tempPath);
    syncDirectory(path.dirname(journalPath));
  } catch (error) {
    try {
      fs.unlinkSync(tempPath);
    } catch {}
    throw error;
  }
}

function validateJournal(repoRoot, journal) {
  if (
    !journal ||
    journal.version !== 1 ||
    !/^[0-9a-f-]{36}$/i.test(journal.transaction_id || "") ||
    !HASH_PATTERN.test(journal.index?.before_sha256 || "") ||
    !HASH_PATTERN.test(journal.index?.after_sha256 || "") ||
    journal.index?.destination !== INDEX_RELATIVE_PATH ||
    !Array.isArray(journal.reviews) ||
    journal.reviews.length < 1
  ) {
    throw new TransactionError(
      "Journal ausente ou fora do schema suportado; recuperação manual necessária.",
      "JOURNAL_INVALID"
    );
  }

  const indexDestination = resolveManaged(repoRoot, journal.index.destination);
  const indexTemp = resolveManaged(repoRoot, journal.index.temporary);
  if (
    path.dirname(indexTemp) !== path.dirname(indexDestination) ||
    !path
      .basename(indexTemp)
      .startsWith(`${path.basename(indexDestination)}.tmp-`)
  ) {
    throw new TransactionError(
      "Caminho temporário do índice inválido no journal.",
      "JOURNAL_INVALID"
    );
  }

  const seen = new Set();
  const reviews = journal.reviews.map(item => {
    if (!item || !HASH_PATTERN.test(item.sha256 || "")) {
      throw new TransactionError(
        "Entrada de review inválida no journal.",
        "JOURNAL_INVALID"
      );
    }
    const destination = resolveManaged(repoRoot, item.destination);
    const temporary = resolveManaged(repoRoot, item.temporary);
    const expectedName = new RegExp(
      `^${OR_ID_PATTERN.source.slice(1, -1)}\\.md$`
    );
    const basename = path.basename(destination);
    if (
      path
        .relative(repoRoot, destination)
        .split(path.sep)
        .join("/")
        .startsWith(`${REVIEW_DIRECTORY}/`) !== true ||
      !expectedName.test(basename) ||
      path.dirname(temporary) !== path.dirname(destination) ||
      !path.basename(temporary).startsWith(`${basename}.tmp-`) ||
      seen.has(destination)
    ) {
      throw new TransactionError(
        "Destino de review inválido ou duplicado no journal.",
        "JOURNAL_INVALID"
      );
    }
    seen.add(destination);
    return { destination, temporary, sha256: item.sha256 };
  });

  return { indexDestination, indexTemp, reviews };
}

function finishJournal(repoRoot, journal) {
  const { indexDestination, indexTemp, reviews } = validateJournal(
    repoRoot,
    journal
  );
  const journalPath = canonicalJournalPath(repoRoot);
  assertRegularOrMissing(journalPath);
  let persisted;
  try {
    persisted = JSON.parse(fs.readFileSync(journalPath, "utf8"));
  } catch (error) {
    throw new TransactionError(
      `Journal não pode ser conferido; recuperação interrompida: ${error.message}`,
      "JOURNAL_INVALID"
    );
  }
  if (
    persisted.transaction_id !== journal.transaction_id ||
    JSON.stringify(persisted) !== JSON.stringify(journal)
  ) {
    throw new TransactionError(
      "Journal mudou após o staging; nenhuma transação foi aplicada.",
      "JOURNAL_CHANGED"
    );
  }

  for (const review of reviews) {
    assertRegularOrMissing(review.destination);
    assertRegularOrMissing(review.temporary);
    if (fs.existsSync(review.destination)) {
      if (hashFile(review.destination) !== review.sha256) {
        throw new TransactionError(
          `Review instalada diverge do hash do journal: ${review.destination}.`,
          "RECOVERY_CONFLICT"
        );
      }
    } else {
      if (
        !fs.existsSync(review.temporary) ||
        hashFile(review.temporary) !== review.sha256
      ) {
        throw new TransactionError(
          `Review temporária ausente ou divergente; journal preservado para intervenção: ${review.temporary}.`,
          "RECOVERY_INCOMPLETE"
        );
      }
      fs.linkSync(review.temporary, review.destination);
      fs.unlinkSync(review.temporary);
      syncDirectory(path.dirname(review.destination));
    }
  }

  assertRegularOrMissing(indexDestination);
  assertRegularOrMissing(indexTemp);
  const currentIndexHash = hashFile(indexDestination);
  if (currentIndexHash === journal.index.before_sha256) {
    if (
      !fs.existsSync(indexTemp) ||
      hashFile(indexTemp) !== journal.index.after_sha256
    ) {
      throw new TransactionError(
        "Índice temporário ausente ou divergente; journal preservado para intervenção.",
        "RECOVERY_INCOMPLETE"
      );
    }
    fs.renameSync(indexTemp, indexDestination);
    syncDirectory(path.dirname(indexDestination));
  } else if (currentIndexHash !== journal.index.after_sha256) {
    throw new TransactionError(
      "INDEX.csv não corresponde ao estado anterior nem ao posterior registrado; journal preservado.",
      "RECOVERY_CONFLICT"
    );
  }

  if (hashFile(indexDestination) !== journal.index.after_sha256) {
    throw new TransactionError(
      "Verificação final do índice falhou; journal preservado.",
      "RECOVERY_CONFLICT"
    );
  }
  for (const review of reviews) {
    if (fs.existsSync(review.temporary)) fs.unlinkSync(review.temporary);
  }
  if (fs.existsSync(indexTemp)) fs.unlinkSync(indexTemp);
  fs.unlinkSync(journalPath);
  syncDirectory(path.dirname(journalPath));
  return {
    recovered: true,
    transaction_id: journal.transaction_id,
    review_count: reviews.length,
    index_sha256: journal.index.after_sha256,
  };
}

export function prepareTransaction(
  repoRoot,
  { indexPath, beforeIndex, afterIndex, indexMode, reviews }
) {
  const journalPath = canonicalJournalPath(repoRoot);
  if (relativePath(repoRoot, indexPath) !== INDEX_RELATIVE_PATH) {
    throw new TransactionError(
      "Destino do índice não corresponde ao caminho canônico.",
      "TRANSACTION_PATH_INVALID"
    );
  }
  const indexStat = fs.lstatSync(indexPath);
  if (!indexStat.isFile() || indexStat.isSymbolicLink()) {
    throw new TransactionError(
      "INDEX.csv deve ser arquivo regular, não symlink.",
      "TRANSACTION_PATH_INVALID"
    );
  }
  for (const review of reviews) {
    const destinationRelative = relativePath(repoRoot, review.destination);
    const filename = path.basename(review.destination);
    if (
      !destinationRelative.startsWith(`${REVIEW_DIRECTORY}/`) ||
      path.dirname(destinationRelative) !== REVIEW_DIRECTORY ||
      !new RegExp(`^${OR_ID_PATTERN.source.slice(1, -1)}\\.md$`).test(filename)
    ) {
      throw new TransactionError(
        "Destino de review fora do diretório/schema permitido.",
        "TRANSACTION_PATH_INVALID"
      );
    }
    try {
      fs.lstatSync(review.destination);
      throw new TransactionError(
        `Review já existe: ${destinationRelative}.`,
        "REVIEW_EXISTS"
      );
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  if (fs.existsSync(journalPath)) {
    throw new TransactionError(
      "Journal de transação existente; execute --recover antes de nova escrita.",
      "RECOVERY_REQUIRED"
    );
  }
  const staged = [];
  try {
    const stagedReviews = reviews.map(review => {
      const temporary = `${review.destination}.tmp-${process.pid}-${crypto.randomBytes(6).toString("hex")}`;
      const destination = relativePath(repoRoot, review.destination);
      const temporaryRelative = relativePath(repoRoot, temporary);
      writeExclusive(temporary, review.contents, review.mode ?? 0o644);
      staged.push(temporary);
      syncDirectory(path.dirname(temporary));
      return {
        destination,
        temporary: temporaryRelative,
        sha256: sha256(review.contents),
      };
    });
    const indexTemp = `${indexPath}.tmp-${process.pid}-${crypto.randomBytes(6).toString("hex")}`;
    const indexTempRelative = relativePath(repoRoot, indexTemp);
    writeExclusive(indexTemp, afterIndex, indexMode);
    staged.push(indexTemp);
    syncDirectory(path.dirname(indexTemp));
    const journal = {
      version: 1,
      transaction_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      index: {
        destination: INDEX_RELATIVE_PATH,
        temporary: indexTempRelative,
        before_sha256: sha256(beforeIndex),
        after_sha256: sha256(afterIndex),
      },
      reviews: stagedReviews,
    };
    writeJournalAtomic(repoRoot, journal);
    return { journal, staged };
  } catch (error) {
    if (!fs.existsSync(journalPath)) {
      for (const file of staged) {
        try {
          fs.unlinkSync(file);
        } catch {}
      }
    }
    throw error;
  }
}

export function commitPreparedTransaction(repoRoot, journal) {
  return finishJournal(repoRoot, journal);
}

export function recoverTransaction(repoRoot) {
  const journalPath = canonicalJournalPath(repoRoot);
  let journalStat;
  try {
    journalStat = fs.lstatSync(journalPath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (!journalStat)
    return { recovered: false, message: "Nenhum journal pendente." };
  if (!journalStat.isFile() || journalStat.isSymbolicLink()) {
    throw new TransactionError(
      "Journal transacional não é arquivo regular; recuperação automática bloqueada.",
      "JOURNAL_INVALID"
    );
  }
  let journal;
  try {
    journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
  } catch (error) {
    throw new TransactionError(
      `Journal inválido; nenhuma recuperação automática: ${error.message}`,
      "JOURNAL_INVALID"
    );
  }
  return finishJournal(repoRoot, journal);
}
