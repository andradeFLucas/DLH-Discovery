import JSZip from 'jszip';
import pptxgen from 'pptxgenjs';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';
import { GeneratedAssets } from './types';

export interface ExportZipOptions {
  title: string;
  area: string;
  problem: string;
  solution: string;
  answers: Record<string, string>;
  assets: GeneratedAssets;
}

/**
 * Gera o arquivo PPTX binário em ArrayBuffer
 */
async function generatePptxBuffer(title: string, slides: any[]): Promise<ArrayBuffer> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Dealer Hub • Mape.ia';
  pptx.company = 'Dealer Hub Innovation';
  pptx.title = title;

  // Slide 1: Capa Executiva
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: '0A0E17' };

  coverSlide.addText('BANCO DE IDEIAS COM IA · DEALER HUB', {
    x: 1.0,
    y: 1.5,
    w: 11.3,
    fontSize: 12,
    color: '38BDF8',
    bold: true,
    fontFace: 'Arial',
  });

  coverSlide.addText(title, {
    x: 1.0,
    y: 2.3,
    w: 11.3,
    fontSize: 32,
    color: 'FFFFFF',
    bold: true,
    fontFace: 'Arial',
    lineSpacing: 38,
  });

  coverSlide.addText('Proposta Estratégica de Inovação e Transformação Operacional', {
    x: 1.0,
    y: 4.2,
    w: 11.3,
    fontSize: 16,
    color: '94A3B8',
    fontFace: 'Arial',
  });

  coverSlide.addText('Apresentação para o Comitê de Inovação & Diretoria Executiva', {
    x: 1.0,
    y: 6.2,
    w: 11.3,
    fontSize: 11,
    color: '64748B',
    fontFace: 'Arial',
  });

  // Slides de Conteúdo (2..N)
  slides.forEach((slide, idx) => {
    const s = pptx.addSlide();
    s.background = { color: '0F172A' };

    s.addText(`PITCH EXECUTIVO · SLIDE ${idx + 1}/${slides.length}`, {
      x: 1.0,
      y: 0.6,
      w: 11.3,
      fontSize: 10,
      color: '38BDF8',
      bold: true,
      fontFace: 'Arial',
    });

    s.addText(slide.title, {
      x: 1.0,
      y: 1.1,
      w: 11.3,
      fontSize: 24,
      color: 'FFFFFF',
      bold: true,
      fontFace: 'Arial',
    });

    if (slide.subtitle) {
      s.addText(slide.subtitle, {
        x: 1.0,
        y: 1.8,
        w: 11.3,
        fontSize: 13,
        color: '94A3B8',
        fontFace: 'Arial',
      });
    }

    const startY = slide.subtitle ? 2.5 : 2.0;
    const bulletObjects = slide.bullets.map((bullet: string) => ({
      text: bullet,
      options: {
        bullet: true,
        fontSize: 14,
        color: 'F1F5F9',
        fontFace: 'Arial',
        spaceAfter: 14,
        lineSpacing: 22,
      },
    }));

    s.addText(bulletObjects, {
      x: 1.0,
      y: startY,
      w: 11.3,
      h: 4.2,
      valign: 'top',
    });

    s.addText(`${title} • Dealer Hub`, {
      x: 1.0,
      y: 6.8,
      w: 9.0,
      fontSize: 9,
      color: '64748B',
      fontFace: 'Arial',
    });

    s.addText(`Confidencial`, {
      x: 10.5,
      y: 6.8,
      w: 2.0,
      fontSize: 9,
      color: '64748B',
      align: 'right',
      fontFace: 'Arial',
    });
  });

  const output = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;
  return output;
}

/**
 * Gera o documento Microsoft Word (.docx) do PRD Técnico
 */
async function generateDocxBuffer(options: ExportZipOptions): Promise<ArrayBuffer> {
  const { title, area, problem, solution, assets } = options;
  const docAsset = assets.technical_doc;

  const docSections: any[] = [];

  // Título e Cabeçalho
  docSections.push(
    new Paragraph({
      text: 'BANCO DE IDEIAS COM IA · DEALER HUB',
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: `PRD: ${title.toUpperCase()}`,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Área Operacional: ', bold: true }),
        new TextRun(area),
        new TextRun({ text: ' | Versão: ', bold: true }),
        new TextRun(docAsset?.document_version || '1.0.0-PROD'),
        new TextRun({ text: ' | Data: ', bold: true }),
        new TextRun(new Date().toLocaleDateString('pt-BR')),
      ],
      spacing: { after: 300 },
    })
  );

  // 1. Resumo Executivo
  docSections.push(
    new Paragraph({
      text: '1. Resumo Executivo',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    }),
    new Paragraph({
      text: docAsset?.executive_summary || `Solução desenvolvida para mitigar o gargalo: "${problem}". Proposta: "${solution}".`,
      spacing: { after: 240 },
    })
  );

  // 2. Objetivos do Produto
  docSections.push(
    new Paragraph({
      text: '2. Objetivos do Produto',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    })
  );

  docAsset?.product_objectives?.forEach((obj) => {
    docSections.push(
      new Paragraph({
        text: `• ${obj}`,
        spacing: { after: 80 },
      })
    );
  });

  // 2.1 OKRs
  if (docAsset?.success_metrics_okrs && docAsset.success_metrics_okrs.length > 0) {
    docSections.push(
      new Paragraph({
        text: '2.1 Métricas de Sucesso e OKRs',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );
    docAsset.success_metrics_okrs.forEach((okr, idx) => {
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `OKR ${idx + 1}: ${okr.objective} `, bold: true }),
            new TextRun({ text: `(Prazo: ${okr.target_timeline} | ROI: ${okr.target_roi})`, italics: true }),
          ],
          spacing: { before: 100, after: 60 },
        })
      );
      okr.key_results.forEach((kr) => {
        docSections.push(
          new Paragraph({
            text: `   - ${kr}`,
            spacing: { after: 40 },
          })
        );
      });
    });
  }

  // 3. Personas
  docSections.push(
    new Paragraph({
      text: '3. Personas da Solução',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    })
  );
  docAsset?.personas?.forEach((p) => {
    docSections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• ${p.persona} `, bold: true }),
          new TextRun({ text: `(${p.role}): `, italics: true }),
          new TextRun(p.needs),
        ],
        spacing: { after: 80 },
      })
    );
  });

  // 4. Módulos do Sistema
  docSections.push(
    new Paragraph({
      text: '4. Módulos do Sistema (Macro-Funcionalidades)',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    })
  );

  docAsset?.macro_modules?.forEach((mod) => {
    docSections.push(
      new Paragraph({
        text: `Módulo 0${mod.module_number}: ${mod.title}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Objetivo: ', bold: true }),
          new TextRun(mod.objective),
        ],
        spacing: { after: 100 },
      })
    );
    mod.sub_features.forEach((sf) => {
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `• ${sf.name}: `, bold: true }),
            new TextRun(`${sf.description} (Manipula: ${sf.input_or_extraction || 'Dados'})`),
          ],
          spacing: { after: 60 },
        })
      );
    });
  });

  // 5. Histórias de Usuário
  docSections.push(
    new Paragraph({
      text: '5. Histórias de Usuário & Critérios de Aceite (Gherkin)',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    })
  );

  docAsset?.user_stories?.forEach((us) => {
    docSections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${us.id} - ${us.title} `, bold: true }),
          new TextRun({ text: `(Ator: ${us.actor})`, italics: true }),
        ],
        spacing: { before: 140, after: 60 },
      }),
      new Paragraph({
        text: us.description,
        spacing: { after: 80 },
      })
    );

    if (us.acceptance_criteria_gherkin) {
      us.acceptance_criteria_gherkin.forEach((c) => {
        docSections.push(
          new Paragraph({
            text: `   ✔ ${c}`,
            spacing: { after: 40 },
          })
        );
      });
    }
  });

  // 6. Modelo de Banco de Dados SQL
  docSections.push(
    new Paragraph({
      text: '6. Modelo de Dados SQL (PostgreSQL / Supabase)',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    }),
    new Paragraph({
      text: docAsset?.data_model_sql || '-- Schema SQL indisponível',
      spacing: { after: 200 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docSections,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer.buffer as ArrayBuffer;
}

/**
 * Cria o pacote ZIP completo com todos os artefatos
 */
export async function generateFullZipPackage(options: ExportZipOptions): Promise<Blob> {
  const { title, area, problem, solution, answers, assets } = options;
  const zip = new JSZip();

  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);

  // 1. Protótipo Interativo em HTML
  const prototypeHtml = assets.prototype?.html_content || '<!DOCTYPE html><html><body><h1>Protótipo não disponível</h1></body></html>';
  zip.file(`1_Prototipo_Interativo_${sanitizedTitle}.html`, prototypeHtml);

  // 2. Apresentação Comercial em PowerPoint (.pptx)
  if (assets.commercial_deck?.slides && assets.commercial_deck.slides.length > 0) {
    try {
      const pptxBuffer = await generatePptxBuffer(title, assets.commercial_deck.slides);
      zip.file(`3_Apresentacao_Comercial_${sanitizedTitle}.pptx`, pptxBuffer);
    } catch (err) {
      console.error('Erro ao adicionar PPTX ao ZIP:', err);
    }
  }

  // 3. Documento Técnico em Word (.docx)
  try {
    const docxBuffer = await generateDocxBuffer(options);
    zip.file(`2_Documento_Tecnico_PRD_${sanitizedTitle}.docx`, docxBuffer);
  } catch (err) {
    console.error('Erro ao adicionar DOCX ao ZIP:', err);
  }

  // 4. Documento Técnico em Markdown (.md)
  let mdContent = `# PACOTE OFICIAL DE DISCOVERY · DEALER HUB\n`;
  mdContent += `**Projeto:** ${title}\n`;
  mdContent += `**Área:** ${area}\n`;
  mdContent += `**Data:** ${new Date().toLocaleDateString('pt-BR')}\n\n`;

  mdContent += `## 1. Desafio & Proposta\n- **Problema:** ${problem}\n- **Solução:** ${solution}\n\n`;

  mdContent += `## 2. Respostas do Discovery (16 Perguntas)\n`;
  Object.entries(answers).forEach(([k, v]) => {
    mdContent += `**[${k}]:** ${v}\n\n`;
  });

  if (assets.technical_doc) {
    const td = assets.technical_doc;
    mdContent += `## 3. Resumo Executivo do PRD\n${td.executive_summary || ''}\n\n`;
    if (td.architecture_diagram_mermaid) {
      mdContent += `## 4. Diagrama Arquitetural (Mermaid)\n\`\`\`mermaid\n${td.architecture_diagram_mermaid}\n\`\`\`\n\n`;
    }
    if (td.data_model_sql) {
      mdContent += `## 5. Schema SQL Oficial\n\`\`\`sql\n${td.data_model_sql}\n\`\`\`\n\n`;
    }
  }

  zip.file(`2_Documento_Tecnico_PRD_${sanitizedTitle}.md`, mdContent);

  // 5. Roteiro dos Slides em Markdown (.md)
  if (assets.commercial_deck?.slides) {
    let slidesMd = `# APRESENTAÇÃO EXECUTIVA (ROTEIRO) · ${title}\n\n`;
    assets.commercial_deck.slides.forEach((s, idx) => {
      slidesMd += `### Slide ${idx + 1}: ${s.title}\n`;
      if (s.subtitle) slidesMd += `*${s.subtitle}*\n\n`;
      s.bullets.forEach((b: string) => {
        slidesMd += `- ${b}\n`;
      });
      slidesMd += `\n`;
    });
    zip.file(`3_Apresentacao_Comercial_Roteiro_${sanitizedTitle}.md`, slidesMd);
  }

  // 6. Readme explicativo
  const readmeContent = `================================================================================
PACOTE DE ARTEFATOS DO DISCOVERY — DEALER HUB (MAPE.IA)
================================================================================

Projeto: ${title}
Área: ${area}
Data de Criação: ${new Date().toLocaleDateString('pt-BR')}

CONTEÚDO DO PACOTE (.ZIP):

1. [HTML] 1_Prototipo_Interativo_${sanitizedTitle}.html
   -> Protótipo navegável em tela única com design Dark-First UI-UX Pro Max.
   -> Dê dois cliques para abrir diretamente em qualquer navegador (Chrome, Edge, Safari).

2. [DOCX] 2_Documento_Tecnico_PRD_${sanitizedTitle}.docx
   -> Documento de Engenharia oficial formatado para Microsoft Word.
   -> Contém Resumo Executivo, OKRs, Matriz RACI, Módulos, Histórias Gherkin e Schema SQL.

3. [PPTX] 3_Apresentacao_Comercial_${sanitizedTitle}.pptx
   -> Apresentação oficial 16:9 formatada para o Microsoft PowerPoint / Google Slides.
   -> Contém Capa Executiva e slides com bullet points prontos para o Comitê de Inovação.

4. [MD] 2_Documento_Tecnico_PRD_${sanitizedTitle}.md & 3_Apresentacao_Comercial_Roteiro_${sanitizedTitle}.md
   -> Cópias em Markdown para documentação em repositórios Git, Notion ou Jira.

================================================================================
Dealer Hub • Mape.ia — Todos os direitos reservados.
================================================================================
`;
  zip.file('0_README_DO_PACOTE.txt', readmeContent);

  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}
