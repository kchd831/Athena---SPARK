import type { ModelProvider } from '../store'

export interface CrossIndustryResult {
  industry: string
  ideaTitle: string
  referenceCase: string
  corePrinciple: string
  concept: string
  executionFormat: string
  executionSteps: string[]
  riskNote?: string
}

export interface CoBrandingResult {
  brandName: string
  dnaOverlap: string
  collaborationConcept: string
  productIdea: string
  campaignAngle: string
  riskNote?: string
}

export interface CampaignResult {
  riskLevel: 1 | 2 | 3 | 4 | 5
  riskLabel: string
  title: string
  insight: string
  concept: string
  executionPhases: { phase: string; actions: string[] }[]
  kpi: string[]
  riskNote?: string
}

export const callAI = async (prompt: string, apiKey: string, provider: ModelProvider): Promise<string> => {
  try {
    const endpoint = provider === 'qwen'
      ? 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
      : 'https://api.deepseek.com/v1/chat/completions'
    
    const model = provider === 'qwen' ? 'qwen-plus' : 'deepseek-chat'

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `API Error ${res.status}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
  } catch (err: any) {
    throw new Error(err.message || '请求 API 失败')
  }
}

const safeParseJSON = (raw: string): any => {
  try {
    // 尝试提取 markdown json 块
    const match = raw.match(/```json\n([\s\S]*?)\n```/)
    if (match && match[1]) {
      return JSON.parse(match[1].trim())
    }
    // 提取不带 json 标签的代码块
    const match2 = raw.match(/```\n([\s\S]*?)\n```/)
    if (match2 && match2[1]) {
      return JSON.parse(match2[1].trim())
    }
    // 最后尝试直接解析
    return JSON.parse(raw.trim())
  } catch (e) {
    console.error('Failed to parse JSON:', raw)
    throw new Error('AI返回格式异常，请重试')
  }
}

export const generateCrossIndustry = async (
  brand: string,
  industry: string,
  goal: string,
  constraints: string,
  apiKey: string,
  provider: ModelProvider,
  creativeHint?: string
): Promise<CrossIndustryResult[]> => {
  const prompt = `你是一位顶尖的PR和跨行业创意策略师。请从3个完全不同的行业中提炼创意逻辑，嫁接到以下品牌场景。
品牌：${brand}
所属行业：${industry}
传播目标：${goal}
限制条件：${constraints || '无'}${creativeHint ? `\n用户创意方向偏好：${creativeHint}（请优先围绕此方向寻找跨界行业，但仍需保持创意多样性）` : ''}

请严格返回 JSON 数组格式，包含3个创意，格式如下：
\`\`\`json
[
  {
    "industry": "行业名称",
    "ideaTitle": "创意标题",
    "referenceCase": "参考案例",
    "corePrinciple": "核心原理",
    "concept": "创意概念",
    "executionFormat": "执行形式",
    "executionSteps": ["步骤1", "步骤2"],
    "riskNote": "风险提示"
  }
]
\`\`\`
内容必须专业有深度，PR视角。`

  const res = await callAI(prompt, apiKey, provider)
  return safeParseJSON(res)
}

export const extractInsight = async (
  rawInput: string,
  brand: string,
  apiKey: string,
  provider: ModelProvider
): Promise<string> => {
  const prompt = `你是一位顶级PR策略师，擅长从品牌信息中提炼深刻的消费者洞察。

品牌：${brand || '待定'}
原始输入（可能是品牌信息、消费者调研、市场数据、竞品分析等）：
${rawInput}

请提炼出1个核心消费者洞察，要求：
- 揭示消费者深层动机或矛盾
- 有张力，能驱动创意
- 15-40字，一句话表达
- 格式：直接输出洞察句子，不要任何前缀或解释`

  return await callAI(prompt, apiKey, provider)
}

export const generateCoBranding = async (
  brandA: string,
  brandB: string,
  goal: string,
  apiKey: string,
  provider: ModelProvider,
  creativeHint?: string
): Promise<CoBrandingResult[]> => {
  const prompt = `你是一位顶尖的PR和联名策划专家。请为以下两个品牌生成3个联名方案。
品牌A：${brandA}
品牌B：${brandB}
合作目标：${goal}${creativeHint ? `\n用户创意方向偏好：${creativeHint}（请优先围绕此方向寻找联名角度，但仍需保持创意多样性）` : ''}

请严格返回 JSON 数组格式，包含3个方案，格式如下：
\`\`\`json
[
  {
    "brandName": "联名主题名称",
    "dnaOverlap": "品牌基因交集分析",
    "collaborationConcept": "合作概念",
    "productIdea": "产品/内容构想",
    "campaignAngle": "传播切入点",
    "riskNote": "风险提示"
  }
]
\`\`\`
内容必须专业有深度，PR视角。`

  const res = await callAI(prompt, apiKey, provider)
  return safeParseJSON(res)
}

export const generateCampaign = async (
  brand: string,
  insight: string,
  concept: string,
  riskAppetite: number,
  apiKey: string,
  provider: ModelProvider,
  creativeHint?: string
): Promise<CampaignResult[]> => {
  const prompt = `你是一位顶尖的PR策略师。请基于以下信息生成5个不同风险等级（1保守到5激进）的Campaign创意。
品牌：${brand}
核心洞察：${insight}
创意概念：${concept}
当前客户风险偏好：${riskAppetite}/5${creativeHint ? `\n用户创意方向偏好：${creativeHint}（请优先围绕此方向发散，但仍需保持创意多样性）` : ''}

请严格返回 JSON 数组格式，包含5个方案（风险等级分别为 1, 2, 3, 4, 5），格式如下：
\`\`\`json
[
  {
    "riskLevel": 1,
    "riskLabel": "保守/稳健/激进等标签",
    "title": "Campaign标题",
    "insight": "洞察说明",
    "concept": "创意概念详细",
    "executionPhases": [
      { "phase": "阶段一名称", "actions": ["动作1", "动作2"] }
    ],
    "kpi": ["指标1", "指标2"],
    "riskNote": "风险提示"
  }
]
\`\`\`
内容必须专业有深度，PR视角。`

  const res = await callAI(prompt, apiKey, provider)
  return safeParseJSON(res)
}

export interface Score5DResult {
  scores: {
    innovation: number;
    spread: number;
    feasibility: number;
    brandFit: number;
    businessValue: number;
  };
  overall: number;
  comment: string;
}

export const scoreIdea5D = async (
  ideaTitle: string,
  concept: string,
  brand: string,
  apiKey: string,
  provider: ModelProvider
): Promise<Score5DResult> => {
  const prompt = `你是一位资深PR创意评审，请对以下创意进行专业评估。

品牌：${brand}
创意标题：${ideaTitle}
创意概念：${concept}

请从以下5个维度各打0-10分，并给出综合评语：
- innovation（创新性）：创意的独特程度和突破性
- spread（传播力）：在社交媒体的扩散潜力
- feasibility（执行可行性）：落地执行的难易程度
- brandFit（品牌契合度）：与品牌调性的匹配程度
- businessValue（商业价值）：对品牌商业目标的贡献

严格只返回如下 JSON，不要任何其他文字或 markdown：
{"scores":{"innovation":8.0,"spread":7.5,"feasibility":6.5,"brandFit":8.5,"businessValue":7.0},"overall":7.5,"comment":"综合评语2-3句"}`

  const raw = await callAI(prompt, apiKey, provider)
  return safeParseJSON(raw)
}

export const extractCaseFromContent = async (
  content: string, sourceUrl: string, apiKey: string, provider: ModelProvider
): Promise<any> => {
  const prompt = `从内容中提炼创意案例结构化信息。
内容：${content.slice(0, 4000)}

请严格返回 JSON 格式：
\`\`\`json
{
  "title": "标题",
  "brand": "品牌",
  "industry": "行业",
  "creativeType": "创意类型",
  "platform": "平台",
  "concept": "核心概念",
  "highlights": ["亮点1", "亮点2"],
  "reusablePattern": "可复用模式",
  "tags": ["标签1", "标签2"],
  "sourceUrl": "${sourceUrl}"
}
\`\`\``
  const res = await callAI(prompt, apiKey, provider)
  return safeParseJSON(res)
}
