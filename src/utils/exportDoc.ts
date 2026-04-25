import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

const h1 = (text: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 32 })],
    spacing: { before: 400, after: 200 },
  })

const h2 = (text: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 26 })],
    spacing: { before: 300, after: 150 },
  })

const p = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 120 },
  })

const bullet = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 22 })],
    spacing: { after: 80 },
  })

const divider = () =>
  new Paragraph({
    border: { bottom: { color: 'cccccc', size: 6, space: 1, style: 'single' } },
    spacing: { before: 200, after: 200 },
  })

const footer = (lang: 'zh' | 'en') =>
  new Paragraph({
    children: [new TextRun({
      text: lang === 'zh'
        ? `© ${new Date().getFullYear()} PR智能中心 · Developed by Kevin · Powered by DeepSeek`
        : `© ${new Date().getFullYear()} PR Intelligence Center · Developed by Kevin · Powered by DeepSeek`,
      size: 16, color: '999999',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 600 },
  })

export const exportCrossIndustryDoc = (brand: string, results: any[], lang: 'zh' | 'en') => {
  const zh = lang === 'zh'
  const children: Paragraph[] = [
    h1(zh ? `跨界碰撞创意报告 · ${brand}` : `Cross-Industry Creative Report · ${brand}`),
    p(zh ? `生成时间：${new Date().toLocaleString('zh-CN')}` : `Generated: ${new Date().toLocaleString('en-US')}`),
    divider(),
    ...results.flatMap((r, i) => [
      h2(`${i + 1}. ${r.ideaTitle}`),
      p(zh ? `来源行业：${r.industry}` : `Source Industry: ${r.industry}`),
      p(zh ? `参考案例：${r.referenceCase}` : `Reference Case: ${r.referenceCase}`),
      p(zh ? `底层逻辑：${r.corePrinciple}` : `Core Principle: ${r.corePrinciple}`),
      p(zh ? `创意概念：${r.concept}` : `Creative Concept: ${r.concept}`),
      p(zh ? `执行形式：${r.executionFormat}` : `Execution Format: ${r.executionFormat}`),
      ...(r.executionSteps || []).map((s: string) => bullet(s)),
      r.riskNote ? p(zh ? `⚠️ 风险提示：${r.riskNote}` : `⚠️ Risk Note: ${r.riskNote}`) : new Paragraph({}),
      divider(),
    ]),
    footer(lang),
  ]
  const doc = new Document({ sections: [{ children }] })
  Packer.toBlob(doc).then(blob =>
    saveAs(blob, `SPARK_CrossIndustry_${brand}_${lang === 'zh' ? 'ZH' : 'EN'}.docx`)
  )
}

export const exportCoBrandingDoc = (brandA: string, brandB: string, results: any[], lang: 'zh' | 'en') => {
  const zh = lang === 'zh'
  const children: Paragraph[] = [
    h1(zh ? `联名策划方案 · ${brandA} × ${brandB}` : `Co-Branding Strategy · ${brandA} × ${brandB}`),
    p(zh ? `生成时间：${new Date().toLocaleString('zh-CN')}` : `Generated: ${new Date().toLocaleString('en-US')}`),
    divider(),
    ...results.flatMap((r, i) => [
      h2(`${i + 1}. ${r.brandName}`),
      p(zh ? `合作概念：${r.collaborationConcept}` : `Collaboration Concept: ${r.collaborationConcept}`),
      p(zh ? `品牌基因交集：${r.dnaOverlap}` : `Brand DNA Overlap: ${r.dnaOverlap}`),
      p(zh ? `产品构想：${r.productIdea}` : `Product Idea: ${r.productIdea}`),
      p(zh ? `传播角度：${r.campaignAngle}` : `Campaign Angle: ${r.campaignAngle}`),
      r.riskNote ? p(zh ? `⚠️ 风险：${r.riskNote}` : `⚠️ Risk: ${r.riskNote}`) : new Paragraph({}),
      divider(),
    ]),
    footer(lang),
  ]
  const doc = new Document({ sections: [{ children }] })
  Packer.toBlob(doc).then(blob =>
    saveAs(blob, `SPARK_CoBranding_${brandA}_${brandB}_${lang === 'zh' ? 'ZH' : 'EN'}.docx`)
  )
}

export const exportCampaignDoc = (brand: string, results: any[], lang: 'zh' | 'en') => {
  const zh = lang === 'zh'
  const children: Paragraph[] = [
    h1(zh ? `Campaign 创意谱系 · ${brand}` : `Campaign Creative Spectrum · ${brand}`),
    p(zh ? `生成时间：${new Date().toLocaleString('zh-CN')}` : `Generated: ${new Date().toLocaleString('en-US')}`),
    divider(),
    ...results.flatMap((r, i) => [
      h2(`${i + 1}. [${r.riskLabel}] ${r.title}`),
      p(zh ? `核心洞察：${r.insight}` : `Core Insight: ${r.insight}`),
      p(zh ? `创意概念：${r.concept}` : `Creative Concept: ${r.concept}`),
      ...(r.executionPhases || []).flatMap((ph: any) => [
        new Paragraph({
          children: [new TextRun({ text: `▸ ${ph.phase}`, bold: true, size: 22 })],
          spacing: { before: 160, after: 80 },
        }),
        ...(ph.actions || []).map((a: string) =>
          new Paragraph({
            children: [new TextRun({ text: `    · ${a}`, size: 20 })],
            spacing: { after: 60 },
          })
        ),
      ]),
      p(zh ? `KPI：${(r.kpi || []).join(' / ')}` : `KPI: ${(r.kpi || []).join(' / ')}`),
      r.riskNote ? p(zh ? `⚠️ 风险：${r.riskNote}` : `⚠️ Risk: ${r.riskNote}`) : new Paragraph({}),
      divider(),
    ]),
    footer(lang),
  ]
  const doc = new Document({ sections: [{ children }] })
  Packer.toBlob(doc).then(blob =>
    saveAs(blob, `SPARK_Campaign_${brand}_${lang === 'zh' ? 'ZH' : 'EN'}.docx`)
  )
}