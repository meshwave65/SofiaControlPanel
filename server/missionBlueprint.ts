const REQUIRED_BLUEPRINT_SECTIONS = [
  "Objetivo operacional",
  "Escopo executável",
  "Exclusões e premissas",
  "Etapas e unidades de trabalho",
  "Dependências e paralelismo",
  "Perfil/capacidade do executor",
  "Entradas e contexto autorizado",
  "Restrições e riscos",
  "Critérios objetivos de aceite",
  "Evidências exigidas",
  "Validação e consolidação",
  "Contingência",
  "Bloqueios e gates pendentes",
] as const;

const NO_SCOPE_BLOCKERS_DECLARATION = "BLOQUEIOS NÃO RESOLVIDOS: NENHUM";

function normalizeHeading(line: string) {
  return line
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/^\*\*(.*)\*\*$/, "$1")
    .replace(/:$/, "")
    .trim()
    .toLocaleLowerCase();
}

/**
 * Validates the minimum structure required before a mission Blueprint can
 * become READY. This is a structural fail-closed check, not a policy engine.
 */
export function validateMissionBlueprintContent(content: string): string {
  const normalizedContent = content.trim();
  if (!normalizedContent) throw new Error("A SOFIA não retornou conteúdo para o Blueprint.");

  const lines = normalizedContent.split(/\r?\n/).map((line) => line.trim());
  const headingIndexes = REQUIRED_BLUEPRINT_SECTIONS.map((section) =>
    lines.findIndex((line) => normalizeHeading(line) === section.toLocaleLowerCase())
  );
  const missingSections = REQUIRED_BLUEPRINT_SECTIONS.filter((_, index) => headingIndexes[index] < 0);
  if (missingSections.length > 0) {
    throw new Error("Blueprint incompleto; faltam títulos de seção próprios: " + missingSections.join(", "));
  }
  if (headingIndexes.some((headingIndex, index) => index > 0 && headingIndex <= headingIndexes[index - 1])) {
    throw new Error("Blueprint incompleto; as seções obrigatórias precisam respeitar a ordem operacional definida.");
  }

  for (let index = 0; index < REQUIRED_BLUEPRINT_SECTIONS.length; index++) {
    const start = headingIndexes[index] + 1;
    const nextHeading = headingIndexes
      .filter((headingIndex) => headingIndex > headingIndexes[index])
      .sort((a, b) => a - b)[0] ?? lines.length;
    if (!lines.slice(start, nextHeading).some((line) => line.length > 0)) {
      throw new Error("Blueprint incompleto; seção sem conteúdo: " + REQUIRED_BLUEPRINT_SECTIONS[index]);
    }
  }

  const blockersIndex = headingIndexes[REQUIRED_BLUEPRINT_SECTIONS.length - 1];
  const blockersEnd = headingIndexes
    .filter((headingIndex) => headingIndex > blockersIndex)
    .sort((a, b) => a - b)[0] ?? lines.length;
  const blockerLines = lines.slice(blockersIndex + 1, blockersEnd);
  const declaresNoScopeBlockers = blockerLines.some(
    (line) => line.toLocaleUpperCase() === NO_SCOPE_BLOCKERS_DECLARATION
  );
  const contradictoryBlockerLines = lines.filter((line) =>
    line.length > 0
    && line.toLocaleUpperCase() !== NO_SCOPE_BLOCKERS_DECLARATION
    && normalizeHeading(line) !== "bloqueios e gates pendentes"
    && /(BLOQUEIO|PENDÊNCIA|PENDENTE|NÃO RESOLVIDO)/i.test(line)
  );
  if (!declaresNoScopeBlockers || contradictoryBlockerLines.length > 0) {
    throw new Error("Blueprint contém bloqueios não resolvidos ou não declarou explicitamente a ausência deles em linha própria; execução permanece bloqueada.");
  }

  return normalizedContent;
}
