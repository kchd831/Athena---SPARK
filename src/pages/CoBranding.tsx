import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, ChevronDown, BarChart2, Shuffle, AlertTriangle } from 'lucide-react'
import { Layout, Field, Input, Textarea, Btn, ErrorBanner, Empty, Spinner, ResultToolbar, SaveButton } from '../components/UI'
import { ScorePanel } from '../components/ScorePanel'
import { generateCoBranding } from '../utils/prompts'
import type { CoBrandingResult } from '../utils/prompts'
import { useSparkStore } from '../store'
import { exportCoBrandingDoc } from '../utils/exportDoc'
import { loadState } from '../utils/storage'

export default function CoBranding() {
  const { apiKey, qwenApiKey, model } = useSparkStore()
  const [form, setForm] = useState({ brandA: '', brandB: '', goal: '', creativeHint: '' })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CoBrandingResult[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(0)
  const [scoringData, setScoringData] = useState<{title: string, concept: string} | null>(null)

  useEffect(() => {
    const stored = loadState('cobrand')
    if (stored?.data?.form) setForm(stored.data.form)
    if (stored?.data?.results?.length) {
      setResults(stored.data.results)
      setExpanded(0)
    }
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const run = async () => {
    const currentKey = model === 'deepseek' ? apiKey : qwenApiKey
    if (!currentKey) { setError(`请先设置 ${model === 'deepseek' ? 'DeepSeek' : '通义千问'} API Key`); return }
    if (!form.brandA || !form.brandB || !form.goal) { setError('请填写两个品牌名称和合作目标'); return }
    setLoading(true); setError(''); setResults([])
    try {
      const res = await generateCoBranding(form.brandA, form.brandB, form.goal, currentKey, model, form.creativeHint)
      setResults(res); setExpanded(0)
    } catch (e: any) { setError(e.message || '生成失败') }
    finally { setLoading(false) }
  }

  return (
    <Layout title="联名策划" subtitle="分析两个品牌的DNA，生成3个差异化联名合作方案" icon={Link2}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(124,110,245,0.15)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="品牌 A" required><Input placeholder="如：可口可乐" value={form.brandA} onChange={set('brandA')} /></Field>
              <Field label="品牌 B" required><Input placeholder="如：故宫文创" value={form.brandB} onChange={set('brandB')} /></Field>
            </div>
            {form.brandA && form.brandB && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 py-2">
                <span className="text-sm font-medium" style={{ color: '#a78bfa' }}>{form.brandA}</span>
                <Shuffle size={14} style={{ color: '#7c6ef5' }} />
                <span className="text-sm font-medium" style={{ color: '#a78bfa' }}>{form.brandB}</span>
              </motion.div>
            )}
            <Field label="合作目标" required><Textarea rows={3} placeholder="如：借助故宫IP提升年轻消费者好感度，打造限定联名款..." value={form.goal} onChange={set('goal')} /></Field>
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
              <Link2 size={16} />{loading ? '分析品牌DNA...' : '生成联名方案'}
            </Btn>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading && <div className="flex items-center justify-center py-20 text-slate-500"><Spinner size={24} /><span className="ml-3">解析品牌基因，探索合作可能性...</span></div>}
          {!loading && results.length === 0 && <Empty icon={Link2} message="输入两个品牌，生成联名策划方案" />}
          {!loading && results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div style={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(124,110,245,0.15)', borderRadius: '16px', overflow: 'hidden' }}>
                <button className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors border-b" style={{ borderColor: expanded === i ? 'rgba(255,255,255,0.08)' : 'transparent' }} onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div>
                    <h3 className="font-semibold text-white">{r.brandName}</h3>
                    <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{r.campaignAngle}</p>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${expanded === i ? 'rotate-180' : ''}`} style={{ color: '#64748b' }} />
                </button>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-5 pb-5 space-y-4 pt-4">
                        <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(124, 110, 245, 0.1)', border: '1px solid rgba(124, 110, 245, 0.2)' }}>
                          <p className="text-xs font-medium mb-1" style={{ color: '#a78bfa' }}>合作概念</p>
                          <p className="text-sm font-medium leading-relaxed text-white">{r.collaborationConcept}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>品牌基因交集</p>
                          <p className="text-sm leading-relaxed" style={{ color: '#e2e8f0' }}>{r.dnaOverlap}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>产品/内容构想</p>
                          <p className="text-sm" style={{ color: '#e2e8f0' }}>{r.productIdea}</p>
                        </div>
                        {r.riskNote && (
                          <div className="flex items-start gap-2 text-xs rounded-xl p-3" style={{ color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                            <AlertTriangle size={12} className="mt-0.5 shrink-0" />{r.riskNote}
                          </div>
                        )}
                      </div>
                      <div className="px-5 pb-4">
                        <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                          <Btn size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setScoringData({title: r.brandName, concept: r.collaborationConcept}); }}><BarChart2 size={13} />评估</Btn>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
          {!loading && results.length > 0 && (
            <>
              <ResultToolbar
                onExportZh={() => exportCoBrandingDoc(form.brandA, form.brandB, results, 'zh')}
                onExportEn={() => exportCoBrandingDoc(form.brandA, form.brandB, results, 'en')}
                onCopy={() => navigator.clipboard.writeText(
                  results.map((r, i) =>
                    `${i+1}. ${r.brandName}\n合作概念：${r.collaborationConcept}\n品牌基因：${r.dnaOverlap}\n产品构想：${r.productIdea}`
                  ).join('\n\n')
                )}
              />
              <SaveButton pageKey="cobrand" data={{ form, results }} />
            </>
          )}
        </div>
      </div>
      {scoringData && (
        <ScorePanel ideaTitle={scoringData.title} concept={scoringData.concept} brand={`${form.brandA} × ${form.brandB}`} onClose={() => setScoringData(null)} />
      )}
    </Layout>
  )
}