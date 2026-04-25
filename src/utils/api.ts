const API_URL = 'https://api.deepseek.com/v1/chat/completions'

export const callDeepSeek = async (
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  apiKey: string,
  opts: { temperature?: number; max_tokens?: number } = {}
): Promise<string> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: opts.temperature ?? 0.8,
      max_tokens: opts.max_tokens ?? 6000,
      stream: false,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error?.message || `API Error ${res.status}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

export const parseJSON = (raw: string): any => {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim()
  return JSON.parse(cleaned)
}

export const fetchURL = async (url: string): Promise<string> => {
  const jinaUrl = `https://r.jina.ai/${url}`
  const res = await fetch(jinaUrl, {
    headers: { Accept: 'text/plain', 'X-Return-Format': 'text' },
  })
  if (!res.ok) throw new Error('无法抓取该链接内容，请手动粘贴')
  const text = await res.text()
  return text.slice(0, 6000)
}
