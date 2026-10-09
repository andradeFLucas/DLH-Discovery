import { DiscoveryAnswers, GeneratedAssets } from '../types';
import { runOrchestratorAgent, MasterBlueprint } from './orchestrator';
import { runPrototypeAgent } from './prototypeAgent';
import { runTechnicalDocAgent } from './technicalDocAgent';
import { runPitchAgent } from './pitchAgent';

export interface MultiAgentInput {
  title: string;
  problem: string;
  solution: string;
  area: string;
  discovery_answers: DiscoveryAnswers;
}

/**
 * Pipeline Híbrido Multi-Agentes (Claude 3.5 Sonnet + Claude 3.5 Haiku):
 * 1. O Orquestrador Master (Sonnet) analisa o Discovery e cria o Master Blueprint estratégico.
 * 2. Os 3 Agentes Especialistas (Haiku) executam em PARALELO produzindo os 3 artefatos essenciais.
 * 3. O prompt Lovable foi descontinuado, mantendo a entrega focada em Protótipo, PRD e Pitch.
 */
export async function generateWithMultiAgents(
  input: MultiAgentInput
): Promise<GeneratedAssets> {
  const { title, problem, solution, area, discovery_answers } = input;

  // No navegador não existem chaves de API: o resultado seria sempre o template genérico de contingência.
  // A geração real só pode ocorrer no servidor (rota /api/ai/generate, em etapas).
  if (typeof window !== 'undefined') {
    throw new Error(
      'A geração por IA só pode ser executada no servidor. Recarregue a página (Ctrl+F5) e tente novamente.'
    );
  }

  console.log(`[Multi-Agents] Iniciando Etapa 1: Orquestrador Master (Claude 3.5 Sonnet) para "${title}"...`);
  
  // Etapa 1: Orquestrador analisa o contexto e cria o Blueprint
  const blueprint: MasterBlueprint = await runOrchestratorAgent({
    title,
    problem,
    solution,
    area,
    discovery_answers,
  });

  console.log(`[Multi-Agents] Blueprint concluído: categoria "${blueprint.domain_category}". Iniciando Etapa 2 (3 Especialistas em Paralelo com Claude 3.5 Haiku)...`);

  // Etapa 2: Execução em Paralelo dos 3 Especialistas
  const [prototype, technical_doc, commercial_deck] = await Promise.all([
    runPrototypeAgent({
      blueprint,
      discovery_answers,
      area,
    }),
    runTechnicalDocAgent({
      blueprint,
      discovery_answers,
      area,
    }),
    runPitchAgent({
      blueprint,
      discovery_answers,
      area,
    }),
  ]);

  console.log(`[Multi-Agents] Todos os 3 artefatos gerados com sucesso!`);

  return {
    prototype,
    technical_doc,
    commercial_deck,
    version: 1,
    lastUpdated: new Date().toISOString(),
  };
}

export * from './orchestrator';
export * from './prototypeAgent';
export * from './technicalDocAgent';
export * from './pitchAgent';
export * from './claudeClient';
