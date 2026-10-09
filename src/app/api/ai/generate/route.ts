import { NextResponse } from 'next/server';
import {
  runOrchestratorAgent,
  runPrototypeAgent,
  runTechnicalDocAgent,
  runPitchAgent,
  MasterBlueprint,
} from '@/lib/agents';

// Cada estágio roda em sua própria invocação (cada uma com seu próprio limite de 60s),
// em vez de encadear Sonnet + 3 Haiku numa única função que estourava o limite do Vercel.
export const maxDuration = 60;

type Stage = 'blueprint' | 'prototype' | 'technical_doc' | 'pitch';

export async function POST(request: Request) {
  let stage: Stage | undefined;
  try {
    const body = await request.json();
    const { title, problem, solution, area, discovery_answers, blueprint } = body;
    stage = body.stage as Stage | undefined;

    if (!problem || !solution) {
      return NextResponse.json(
        { error: 'Campos problem e solution são obrigatórios' },
        { status: 400 }
      );
    }

    const answers = discovery_answers || {};
    const safeArea = area || 'Geral';

    if (stage === 'blueprint') {
      const result = await runOrchestratorAgent({
        title: title || problem.slice(0, 50),
        problem,
        solution,
        area: safeArea,
        discovery_answers: answers,
        strict: true,
      });
      return NextResponse.json(result);
    }

    if (!blueprint) {
      return NextResponse.json(
        { error: 'Campo blueprint é obrigatório para este estágio' },
        { status: 400 }
      );
    }
    const bp = blueprint as MasterBlueprint;
    const agentInput = { blueprint: bp, discovery_answers: answers, area: safeArea, strict: true };

    if (stage === 'prototype') {
      return NextResponse.json(await runPrototypeAgent(agentInput));
    }
    if (stage === 'technical_doc') {
      return NextResponse.json(await runTechnicalDocAgent(agentInput));
    }
    if (stage === 'pitch') {
      return NextResponse.json(await runPitchAgent(agentInput));
    }

    return NextResponse.json({ error: 'Estágio inválido' }, { status: 400 });
  } catch (error: any) {
    console.error(`[api/ai/generate] Falha no estágio "${stage}":`, error);
    return NextResponse.json(
      { error: 'Falha na geração dos artefatos de IA', stage, details: error?.message },
      { status: 500 }
    );
  }
}
