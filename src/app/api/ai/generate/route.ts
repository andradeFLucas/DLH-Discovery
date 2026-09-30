import { NextResponse } from 'next/server';
import { generateWithMultiAgents } from '@/lib/agents';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, problem, solution, area, discovery_answers } = body;

    if (!problem || !solution) {
      return NextResponse.json(
        { error: 'Campos problem e solution são obrigatórios' },
        { status: 400 }
      );
    }

    const assets = await generateWithMultiAgents({
      title: title || problem.slice(0, 50),
      problem,
      solution,
      area: area || 'Geral',
      discovery_answers: discovery_answers || {},
    });

    return NextResponse.json(assets);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Falha na geração dos artefatos de IA', details: error?.message },
      { status: 500 }
    );
  }
}
