import { NextResponse } from 'next/server';
import { refinePrototypeAsset } from '@/lib/gemini';
import { PrototypeAsset } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPrototype, instruction, ideaTitle } = body;

    if (!currentPrototype || !instruction) {
      return NextResponse.json(
        { error: 'Campos currentPrototype e instruction são obrigatórios' },
        { status: 400 }
      );
    }

    const updated = await refinePrototypeAsset(currentPrototype, instruction, ideaTitle || 'Solução');
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erro na rota /api/ai/refine:', error);
    return NextResponse.json(
      { error: 'Falha no refinamento do protótipo com IA', details: error?.message },
      { status: 500 }
    );
  }
}
