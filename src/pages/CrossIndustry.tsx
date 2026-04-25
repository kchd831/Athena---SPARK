import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitMerge, ChevronDown, BarChart2, Megaphone, AlertCircle, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Layout, Field, Input, Textarea, Btn, ErrorBanner, Empty, Spinner, ResultToolbar, SaveButton } from '../components/UI'
import { ScorePanel } from '../components/ScorePanel'
import { generateCrossIndustry } from '../utils/prompts'
import type { CrossIndustryResult } from '../utils/prompts'
import { useSparkStore } from '../store'
import { exportCrossIndustryDoc } from '../utils/exportDoc'
import { loadState } from '../utils/storage'

export default function CrossIndustry() {
  const { apiKey, qwenApiKey, model } = useSparkStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ brand: '', industry: '', goal: '', constraints: '', creativeHint: '' })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CrossIndustryResult[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(0)
  const [scoringData, setScoringData] = useState<{title: string, concept: string} | null>(null)
  const [industryOpen, setIndustryOpen] = useState(false)

  useEffect(() => {
    const stored = loadState('cross')
    if (stored?.data?.form) setForm(stored.data.form)
    if (stored?.data?.results?.length) {
      setResults(stored.data.results)
      setExpanded(0)
    }
  }, [])

  const INDUSTRIES = [
    '食品饮料', '美妆个护', '服装时尚', '汽车出行', '科技电子',
    '金融保险', '医疗健康', '教育培训', '文娱传媒', '零售电商',
    '房产家居', '运动户外', '奢侈品', '餐饮连锁', '宠物',
    '新能源', '游戏', '旅游酒店', '母婴', '农业食品',
  ]

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const run = async () => {
    const currentKey = model === 'deepseek' ? apiKey : qwenApiKey
    if (!currentKey) { setError(`请先点击右上角设置 ${model === 'deepseek' ? 'DeepSeek' : '通义千问'} API Key`); return }
    if (!form.brand || !form.goal) { setError('请填写品牌和传播目标'); return }
    setLoading(true); setError(''); setResults([])
    try {
      const res = await generateCrossIndustry(form.brand, form.industry, form.goal, form.constraints, currentKey, model, form.creativeHint)
      setResults(res); setExpanded(0)
    } catch (e: any) { setError(e.message || '生成失败，请重试') }
    finally { setLoading(false) }
  }

  return (
    <Layout title="跨界碰撞" subtitle="从3个完全不相关行业提炼创意逻辑，嫁接到你的品牌场景" icon={GitMerge}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)', gap: '1.5rem', alignItems: 'start', width: '100%' }}>
        
        <div style={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(124,110,245,0.15)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="品牌 / 客户" required><Input placeholder="如：某快消品牌" value={form.brand} onChange={set('brand')} /></Field>
            <Field label="所属行业">
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIndustryOpen(!industryOpen)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: form.industry ? 'white' : '#475569',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,110,245,0.4)'}
                  onMouseLeave={e => !industryOpen && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                >
                  <span>{form.industry || '选择所属行业'}</span>
                  <ChevronDown size={14} style={{ color: '#64748b', transform: industryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                </button>

                <AnimatePresence>
                  {industryOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIndustryOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: 0,
                          right: 0,
                          zIndex: 50,
                          backgroundColor: '#0f0f1a',
                          border: '1px solid rgba(124,110,245,0.2)',
                          borderRadius: '12px',
                          padding: '6px',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                        }}
                      >
                        {INDUSTRIES.map(ind => (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => { setForm(f => ({ ...f, industry: ind })); setIndustryOpen(false) }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              color: form.industry === ind ? 'white' : '#94a3b8',
                              backgroundColor: form.industry === ind ? 'rgba(124,110,245,0.15)' : 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.1s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseEnter={e => { if (form.industry !== ind) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                            onMouseLeave={e => { if (form.industry !== ind) e.currentTarget.style.backgroundColor = 'transparent' }}
                          >
                            {form.industry === ind && <span style={{ color: '#7c6ef5', fontSize: '10px' }}>✓</span>}
                            {ind}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </Field>
            <Field label="传播目标" required><Textarea rows={3} placeholder="如：提升品牌在年轻群体中的好感度，结合春节节点..." value={form.goal} onChange={set('goal')} /></Field>
            <Field label="限制条件"><Textarea rows={2} placeholder="如：预算有限，不能明星代言，需要适合微博传播..." value={form.constraints} onChange={set('constraints')} /></Field>
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
            <Btn onClick={run} loading={loading} style={{ width: '100%' }} size="lg" variant="spark">
              <GitMerge size={16} />{loading ? '跨界碰撞中...' : '生成跨界创意'}
            </Btn>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', color: '#64748b' }}>
              <Spinner size={24} /><span style={{ marginLeft: '0.75rem' }}>正在跨越行业边界，寻找灵感...</span>
            </div>
          )}
          {!loading && results.length === 0 && <Empty icon={GitMerge} message="填写左侧表单，生成3个跨界创意方向" />}
          {!loading && results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div style={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(124,110,245,0.15)', borderRadius: '16px', overflow: 'hidden' }}>
                <button
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: expanded === i ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent' }}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(124,110,245,0.15)', color: '#a78bfa', border: '1px solid rgba(124,110,245,0.2)' }}>FROM {r.industry}</span>
                    <h3 style={{ fontWeight: 600, color: 'white', fontSize: '0.9375rem' }}>{r.ideaTitle}</h3>
                  </div>
                  <ChevronDown size={16} style={{ color: '#64748b', transform: expanded === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                </button>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '1rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ borderRadius: '12px', padding: '0.75rem', backgroundColor: 'rgba(124,110,245,0.05)', border: '1px solid rgba(124,110,245,0.1)' }}>
                          <p style={{ fontSize: '11px', fontWeight: 500, color: '#a78bfa', marginBottom: '0.25rem' }}>参考案例</p>
                          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white' }}>{r.referenceCase}</p>
                          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '0.25rem' }}>底层逻辑：{r.corePrinciple}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8', marginBottom: '0.375rem' }}>创意概念</p>
                          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#e2e8f0' }}>{r.concept}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8', marginBottom: '0.375rem' }}>执行形式：<span style={{ color: '#cbd5e1' }}>{r.executionFormat}</span></p>
                          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {r.executionSteps.map((s, j) => (
                              <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                                <CheckCircle size={13} style={{ color: '#a78bfa', marginTop: '2px', flexShrink: 0 }} />{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {r.riskNote && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '11px', color: '#fbbf24', backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: '12px', padding: '0.75rem' }}>
                            <AlertCircle size={12} style={{ marginTop: '1px', flexShrink: 0 }} />{r.riskNote}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '0 1.25rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                          <Btn size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setScoringData({title: r.ideaTitle, concept: r.concept}); }}><BarChart2 size={13} />评估</Btn>
                          <Btn size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate('/campaign', { state: { fromCross: r } }); }}><Megaphone size={13} />深化为Campaign</Btn>
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
                onExportZh={() => exportCrossIndustryDoc(form.brand, results, 'zh')}
                onExportEn={() => exportCrossIndustryDoc(form.brand, results, 'en')}
                onCopy={() => navigator.clipboard.writeText(
                  results.map((r, i) =>
                    `${i+1}. ${r.ideaTitle}\n来源行业：${r.industry}\n创意概念：${r.concept}\n执行形式：${r.executionFormat}\n步骤：${r.executionSteps.join('；')}`
                  ).join('\n\n')
                )}
              />
              <SaveButton pageKey="cross" data={{ form, results }} />
            </>
          )}
        </div>
      </div>
      {scoringData && (
        <ScorePanel
          ideaTitle={scoringData.title}
          concept={scoringData.concept}
          brand={form.brand}
          onClose={() => setScoringData(null)}
        />
      )}
    </Layout>
  )
}
