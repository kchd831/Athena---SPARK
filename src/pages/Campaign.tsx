import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, ChevronDown, BarChart2, CheckCircle, Lightbulb } from 'lucide-react'
import { Layout, Field, Input, Textarea, Btn, ErrorBanner, Empty, Spinner, ResultToolbar, SaveButton } from '../components/UI'
import { ScorePanel } from '../components/ScorePanel'
import { generateCampaign, extractInsight } from '../utils/prompts'
import type { CampaignResult } from '../utils/prompts'
import { useSparkStore } from '../store'
import { exportCampaignDoc } from '../utils/exportDoc'
import { loadState } from '../utils/storage'

const RISK_CONFIG: Record<number, { color: string; bg: string; border: string; emoji: string }> = {
  1: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', emoji: '🛡️' },
  2: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', emoji: '🚀' },
  3: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', emoji: '⚡' },
  4: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.2)', emoji: '🔥' },
  5: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)', emoji: '💥' },
}

export default function Campaign() {
  const { apiKey, qwenApiKey, model } = useSparkStore()
  const location = useLocation()
  const [form, setForm] = useState({ brand: '', insight: '', concept: '', riskAppetite: 3, creativeHint: '' })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CampaignResult[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [scoringData, setScoringData] = useState<{title: string, concept: string} | null>(null)
  const [insightRaw, setInsightRaw] = useState('')
  const [extractingInsight, setExtractingInsight] = useState(false)

  useEffect(() => {
    const state = location.state as any
    if (state?.fromCross) {
      const r = state.fromCross
      setForm(f => ({ ...f, concept: `${r.ideaTitle}：${r.concept}` }))
    } else {
      const stored = loadState('campaign')
      if (stored?.data?.form) setForm(stored.data.form)
      if (stored?.data?.results?.length) {
        setResults(stored.data.results)
        setExpanded(null)
      }
    }
  }, [location.state])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const run = async () => {
    const currentKey = model === 'deepseek' ? apiKey : qwenApiKey
    if (!currentKey) { setError(`请先设置 ${model === 'deepseek' ? 'DeepSeek' : '通义千问'} API Key`); return }
    if (!form.brand || !form.concept) { setError('请填写品牌和创意概念'); return }
    setLoading(true); setError(''); setResults([])
    try {
      const res = await generateCampaign(form.brand, form.insight, form.concept, form.riskAppetite, currentKey, model, form.creativeHint)
      setResults(res); setExpanded(null)
    } catch (e: any) { setError(e.message || '生成失败') }
    finally { setLoading(false) }
  }

  return (
    <Layout title="Campaign 创意" subtitle="输入核心洞察和风险偏好，生成5个不同风险级别的创意谱系" icon={Megaphone}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(124,110,245,0.15)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="品牌 / 客户" required><Input placeholder="如：某汽车品牌" value={form.brand} onChange={set('brand')} /></Field>
            
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(124,110,245,0.06)',
              border: '1px solid rgba(124,110,245,0.12)',
              marginBottom: '0',
            }}>
              <p style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 500, marginBottom: '8px' }}>
                ✦ AI 洞察提炼器
              </p>
              <Textarea
                rows={2}
                placeholder="粘贴品牌简报、消费者调研、市场数据等原始资料，AI 帮你提炼核心洞察..."
                value={insightRaw}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInsightRaw(e.target.value)}
              />
              <div style={{ marginTop: '8px' }}>
                <Btn
                  size="sm"
                  variant="ghost"
                  loading={extractingInsight}
                  onClick={async () => {
                    if (!insightRaw.trim()) return
                    const currentKey = model === 'deepseek' ? apiKey : qwenApiKey
                    if (!currentKey) { setError('请先设置 API Key'); return }
                    setExtractingInsight(true)
                    try {
                      const insight = await extractInsight(insightRaw, form.brand, currentKey, model)
                      setForm(f => ({ ...f, insight: insight.trim() }))
                    } catch (e: any) {
                      setError(e.message || '提炼失败')
                    } finally {
                      setExtractingInsight(false)
                    }
                  }}
                >
                  {extractingInsight ? '提炼中...' : '⚡ 一键提炼洞察'}
                </Btn>
              </div>
            </div>

            <Field label="核心洞察" required hint="可直接填写，或用上方提炼器自动生成"><Textarea rows={2} placeholder="如：年轻人不再追求传统的拥有感，而是体验感..." value={form.insight} onChange={set('insight')} /></Field>
            <Field label="创意概念" required><Textarea rows={3} placeholder="如：不买车，买地球通行证..." value={form.concept} onChange={set('concept')} /></Field>
            <Field label={`风险偏好 (${form.riskAppetite}/5)`}>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs" style={{ color: '#10b981' }}>保守</span>
                <input 
                  type="range" min="1" max="5" step="1" 
                  value={form.riskAppetite} 
                  onChange={(e) => setForm(f => ({ ...f, riskAppetite: Number(e.target.value) }))}
                  className="flex-1 accent-[#7c6ef5]" 
                />
                <span className="text-xs" style={{ color: '#ef4444' }}>激进</span>
              </div>
            </Field>
            <div style={{ borderTop: '1px solid rgba(124,110,245,0.1)', paddingTop: '1rem' }}>
              <Field label="创意方向提示（可选）">
                <Textarea
                  rows={2}
                  placeholder="如：希望跨界冰淇淋或新能源汽车，打造年轻化联名体验..."
                  value={form.creativeHint}
                  onChange={set('creativeHint')}
                />
              </Field>
            </div>
            <AnimatePresence>{error && <ErrorBanner message={error} onDismiss={() => setError('')} />}</AnimatePresence>
            <Btn onClick={run} loading={loading} className="w-full" size="lg" variant="spark">
              <Megaphone size={16} />{loading ? '生成创意谱系中...' : '生成创意谱系'}
            </Btn>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading && <div className="flex items-center justify-center py-20 text-slate-500 gap-3"><Spinner size={24} /><span>正在构建多风险级别的创意谱系...</span></div>}
          {!loading && results.length === 0 && <Empty icon={Megaphone} message="填写左侧信息，生成从保守到颠覆的5个创意方向" />}
          {results.map((r, i) => {
            const cfg = RISK_CONFIG[r.riskLevel] || RISK_CONFIG[3]
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(124,110,245,0.15)', borderRadius: '16px', overflow: 'hidden' }}>
                  <button className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors border-b" style={{ borderColor: expanded === i ? 'rgba(255,255,255,0.08)' : 'transparent' }} onClick={() => setExpanded(expanded === i ? null : i)}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{cfg.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full border" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>{r.riskLabel}</span>
                          <h3 className="font-semibold text-white text-sm">{r.title}</h3>
                        </div>
                        <p className="text-xs mt-1 line-clamp-1" style={{ color: '#94a3b8' }}>{r.insight}</p>
                      </div>
                    </div>
                    <ChevronDown size={16} className={`transition-transform shrink-0 ${expanded === i ? 'rotate-180' : ''}`} style={{ color: '#64748b' }} />
                  </button>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-5 pb-5 space-y-4 pt-4">
                          <div className="rounded-xl p-3 border" style={{ background: cfg.bg, borderColor: cfg.border }}>
                            <p className="text-xs font-medium mb-1" style={{ color: cfg.color }}>核心概念</p>
                            <p className="text-sm font-medium text-white">{r.concept}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>执行阶段</p>
                            <div className="space-y-3">
                              {r.executionPhases.map((phase, j) => (
                                <div key={j}>
                                  <p className="text-xs font-medium text-white mb-1.5 flex items-center gap-1.5"><CheckCircle size={12} style={{ color: cfg.color }} />{phase.phase}</p>
                                  <ul className="space-y-1 pl-4 border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                    {phase.actions.map((action, k) => (
                                      <li key={k} className="text-xs" style={{ color: '#94a3b8' }}>{action}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <div>
                              <p className="mb-1 flex items-center gap-1" style={{ color: '#64748b' }}><Lightbulb size={11} />核心 KPI</p>
                              <ul className="space-y-0.5">
                                {r.kpi.map((k, j) => <li key={j} style={{ color: '#94a3b8' }}>- {k}</li>)}
                              </ul>
                            </div>
                            {r.riskNote && (
                              <div>
                                <p className="mb-1" style={{ color: '#64748b' }}>潜在风险</p>
                                <p style={{ color: '#ef4444' }}>{r.riskNote}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="px-5 pb-4">
                          <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <Btn size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setScoringData({title: r.title, concept: r.concept}); }}><BarChart2 size={13} />评估</Btn>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
          {!loading && results.length > 0 && (
            <>
              <ResultToolbar
                onExportZh={() => exportCampaignDoc(form.brand, results, 'zh')}
                onExportEn={() => exportCampaignDoc(form.brand, results, 'en')}
                onCopy={() => navigator.clipboard.writeText(
                  results.map((r, i) =>
                    `${i+1}. [${r.riskLabel}] ${r.title}\n洞察：${r.insight}\n概念：${r.concept}`
                  ).join('\n\n')
                )}
              />
              <SaveButton pageKey="campaign" data={{ form, results }} />
            </>
          )}
        </div>
      </div>
      {scoringData && (
        <ScorePanel ideaTitle={scoringData.title} concept={scoringData.concept} brand={form.brand} onClose={() => setScoringData(null)} />
      )}
    </Layout>
  )
}