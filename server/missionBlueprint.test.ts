import { describe, expect, it } from "vitest";
import { validateMissionBlueprintContent } from "./missionBlueprint";

const validBlueprint = [
  "## Objetivo operacional",
  "Resultado esperado: concluir o objetivo declarado.",
  "## Escopo executável",
  "Somente as atividades descritas no TR.",
  "## Exclusões e premissas",
  "Nenhuma ampliação de escopo.",
  "## Etapas e unidades de trabalho",
  "Etapa 1: executar a análise.",
  "## Dependências e paralelismo",
  "A etapa 1 antecede a validação.",
  "## Perfil/capacidade do executor",
  "Executor autorizado, conforme política.",
  "## Entradas e contexto autorizado",
  "TR validado e artefatos vinculados.",
  "## Restrições e riscos",
  "Não presumir credenciais nem permissões.",
  "## Critérios objetivos de aceite",
  "Critério: resultado verificável.",
  "## Evidências exigidas",
  "Relatório e referências de origem.",
  "## Validação e consolidação",
  "Conferência do resultado e consolidação.",
  "## Contingência",
  "Interromper e reportar se houver falha.",
  "## Bloqueios e gates pendentes",
  "BLOQUEIOS NÃO RESOLVIDOS: NENHUM",
].join("\n");

describe("validateMissionBlueprintContent", () => {
  it("accepts a complete Blueprint with explicit no-blockers declaration", () => {
    expect(validateMissionBlueprintContent(validBlueprint)).toBe(validBlueprint);
  });

  it("rejects section names mentioned only in prose, not as headings", () => {
    const proseOnly = validBlueprint.replace("## Objetivo operacional", "Objetivo operacional: resultado esperado.");
    expect(() => validateMissionBlueprintContent(proseOnly)).toThrow("faltam títulos de seção próprios");
  });

  it("rejects a required section with no body", () => {
    const emptySection = validBlueprint.replace("Resultado esperado: concluir o objetivo declarado.\n", "");
    expect(() => validateMissionBlueprintContent(emptySection)).toThrow("seção sem conteúdo: Objetivo operacional");
  });

  it("rejects required sections in a different order", () => {
    const reordered = validBlueprint.replace(
      "## Objetivo operacional\nResultado esperado: concluir o objetivo declarado.",
      "## Escopo executável\nSomente as atividades descritas no TR.\n## Objetivo operacional\nResultado esperado: concluir o objetivo declarado.",
    ).replace("\n## Escopo executável\nSomente as atividades descritas no TR.", "");
    expect(() => validateMissionBlueprintContent(reordered)).toThrow("ordem operacional definida");
  });

  it("rejects missing no-blockers declaration", () => {
    const missingDeclaration = validBlueprint.replace("BLOQUEIOS NÃO RESOLVIDOS: NENHUM", "Sem observações.");
    expect(() => validateMissionBlueprintContent(missingDeclaration)).toThrow("execução permanece bloqueada");
  });

  it("rejects unresolved blockers declared outside the blockers section", () => {
    const blockerOutsideSection = validBlueprint.replace(
      "Não presumir credenciais nem permissões.",
      "BLOQUEIO: credencial de execução ainda não autorizada.",
    );
    expect(() => validateMissionBlueprintContent(blockerOutsideSection)).toThrow("execução permanece bloqueada");
  });

  it("rejects contradictory blocker statements even if no-blockers is also declared", () => {
    const contradictory = validBlueprint.replace(
      "BLOQUEIOS NÃO RESOLVIDOS: NENHUM",
      "BLOQUEIOS NÃO RESOLVIDOS: NENHUM\nPENDÊNCIA: credencial ainda não autorizada.",
    );
    expect(() => validateMissionBlueprintContent(contradictory)).toThrow("execução permanece bloqueada");
  });
});
