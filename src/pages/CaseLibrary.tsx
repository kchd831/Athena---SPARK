import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Tag, Trash2, X, Search, ExternalLink, ChevronDown } from 'lucide-react'
import { Layout, Card, Btn, ErrorBanner, Empty, Spinner } from '../components/UI'
import { extractCaseFromContent } from '../utils/prompts'
import { useSparkStore } from '../store'
import { extractFromFile } from '../utils/fileExtract'
import type { CaseItem } from '../store'

type Tab = 'url' | 'manual'

export default function CaseLibrary() {
  const { apiKey, qwenApiKey, model, caseLibrary, addCase, removeCase } = useSparkStore()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')

  const filtered = caseLibrary.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      c.tags.some((t) => t.includes(q))
    const matchTag = !filterTag || c.tags.includes(filterTag)
    return matchSearch && matchTag
  })

  const allTags = Array.from(new Set(caseLibrary.flatMap((c) => c.tags))).slice(0, 12)

  return (
    <Layout title="案例库" subtitle={`已收藏 ${caseLibrary.length} 个创意案例`} icon={BookOpen}>
      <div className="flex items-start justify-between mb-8 -mt-2">
        <Btn onClick={() => setShowAdd(true)} variant="spark" size="sm" className="ml-auto">
          <Plus size={14} />
          添加案例
        </Btn>
      </div>
      {caseLibrary.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: '#64748b' }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索品牌、标题、标签..."
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm transition-colors focus:outline-none"
              style={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#7c6ef5'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                  className="text-xs px-2.5 py-1 rounded-full border transition-all"
                  style={
                    filterTag === tag
                      ? { backgroundColor: 'rgba(124, 110, 245, 0.15)', color: '#a78bfa', borderColor: 'rgba(124, 110, 245, 0.3)' }
                      : { backgroundColor: 'transparent', color: '#64748b', borderColor: 'rgba(255,255,255,0.08)' }
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {caseLibrary.length === 0 ? (
        <Empty icon={BookOpen} message="还没有收藏案例，点击右上角「添加案例」开始收藏" />
      ) : filtered.length === 0 ? (
        <Empty icon={Search} message="没有找到匹配的案例" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <CaseCard key={c.id} item={c} onRemove={() => removeCase(c.id)} delay={i * 0.04} />
          ))}
        </div>
      )}
      <AnimatePresence>
        {showAdd && (
          <AddCaseModal
            onClose={() => setShowAdd(false)}
            apiKey={model === 'deepseek' ? apiKey : qwenApiKey}
            model={model}
            onAdd={addCase}
          />
        )}
      </AnimatePresence>
    </Layout>
  )
}

function CaseCard({
  item,
  onRemove,
  delay,
}: {
  item: CaseItem
  onRemove: () => void
  delay?: number
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="p-4 h-fit" hover>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-white line-clamp-2 mb-0.5">
              {item.title}
            </h3>
            <p className="text-xs font-mono" style={{ color: '#64748b' }}>
              {item.brand} · {item.industry}
            </p>
          </div>
          <button
            onClick={onRemove}
            className="transition-colors ml-2 shrink-0 opacity-50 hover:opacity-100"
            style={{ color: '#ef4444' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
        <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: '#94a3b8' }}>{item.concept}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded border"
              style={{ backgroundColor: 'rgba(124, 110, 245, 0.08)', color: 'rgba(167, 139, 250, 0.8)', borderColor: 'rgba(124, 110, 245, 0.15)' }}
            >
              {t}
            </span>
          ))}
        </div>
        <button
          className="flex items-center gap-1 text-xs transition-colors hover:text-white"
          style={{ color: '#64748b' }}
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? '收起' : '查看详情'}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                {item.highlights.length > 0 && (
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#64748b' }}>亮点</p>
                    <ul className="space-y-1">
                      {item.highlights.map((h, i) => (
                        <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: '#94a3b8' }}>
                          <span className="mt-0.5" style={{ color: '#a78bfa' }}>·</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.reusablePattern && (
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#64748b' }}>可复用模式</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{item.reusablePattern}</p>
                  </div>
                )}
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: 'rgba(167, 139, 250, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(167, 139, 250, 0.7)'}
                  >
                    <ExternalLink size={11} />
                    查看原文
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

function AddCaseModal({
  onClose,
  apiKey,
  model,
  onAdd,
}: {
  onClose: () => void
  apiKey: string
  model: any
  onAdd: (c: CaseItem) => void
}) {
  const [tab, setTab] = useState<Tab>('url')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [industryOpen, setIndustryOpen] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [manual, setManual] = useState({
    title: '', brand: '', industry: '', creativeType: '',
    platform: '', concept: '', reusablePattern: '', tags: '',
  })

  const INDUSTRIES = [
    '食品饮料', '美妆个护', '服装时尚', '汽车出行', '科技电子',
    '金融保险', '医疗健康', '教育培训', '文娱传媒', '零售电商',
    '房产家居', '运动户外', '奢侈品', '餐饮连锁', '宠物',
    '新能源', '游戏', '旅游酒店', '母婴', '农业食品',
  ]

  const setM = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setManual(m => ({ ...m, [k]: e.target.value }))

  const addFromUrl = async () => {
    if (!apiKey) { setError('请先设置 API Key'); return }
    if (!url.trim()) { setError('请粘贴文章内容'); return }
    if (url.trim().length < 50) { setError('内容太短，请粘贴完整的文章或案例描述'); return }
    setLoading(true); setError('')
    try {
      const extracted = await extractCaseFromContent(url.trim(), '', apiKey, model)
      onAdd({ ...extracted, id: Date.now().toString(), addedAt: new Date().toISOString() })
      onClose()
    } catch (e: any) {
      setError(e.message || '提炼失败，请检查内容后重试')
    } finally {
      setLoading(false)
    }
  }

  const addManual = () => {
    if (!manual.title || !manual.brand) { setError('标题和品牌为必填项'); return }
    onAdd({
      ...manual,
      id: Date.now().toString(),
      highlights: [],
      tags: manual.tags.split(/[,，、]/).map(t => t.trim()).filter(Boolean),
      addedAt: new Date().toISOString(),
      sourceUrl: '',
    })
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 16, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '88vh',
          overflowY: 'auto',
          backgroundColor: '#0f0f1a',
          border: '1px solid rgba(124,110,245,0.2)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,110,245,0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 10,
          backgroundColor: '#0f0f1a',
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>添加创意案例</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>收藏优秀案例，为创意提供灵感参考</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)', border: 'none',
              color: '#64748b', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748b' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{
            display: 'flex', gap: '4px', padding: '4px',
            backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px',
          }}>
            {([['url', '📋  内容智能提炼'], ['manual', '✏️  手动填写']] as const).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '9px 12px',
                  borderRadius: '9px', border: 'none',
                  fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  color: tab === t ? 'white' : '#64748b',
                  backgroundColor: tab === t ? 'rgba(124,110,245,0.2)' : 'transparent',
                  boxShadow: tab === t ? '0 0 0 1px rgba(124,110,245,0.3)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <AnimatePresence>
            {error && <div style={{ marginBottom: '16px' }}><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}
          </AnimatePresence>

          {tab === 'url' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                  粘贴文章内容
                </label>
                <textarea
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white', fontSize: '13px', lineHeight: 1.6,
                    outline: 'none', resize: 'none', minHeight: '160px',
                    transition: 'border-color 0.15s',
                    fontFamily: 'inherit',
                  }}
                  placeholder="将文章、案例描述、新闻报道等内容粘贴到这里，AI 将自动提炼结构化案例信息..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,110,245,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '8px',
                }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setFileLoading(true)
                      setError('')
                      try {
                        const text = await extractFromFile(file)
                        setUrl(prev => prev ? prev + '\n\n' + text : text)
                      } catch (err: any) {
                        setError(err.message || '文件读取失败')
                      } finally {
                        setFileLoading(false)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: fileLoading ? '#475569' : '#a78bfa',
                      backgroundColor: 'rgba(124,110,245,0.08)',
                      border: '1px solid rgba(124,110,245,0.2)',
                      cursor: fileLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!fileLoading) e.currentTarget.style.backgroundColor = 'rgba(124,110,245,0.15)' }}
                    onMouseLeave={e => { if (!fileLoading) e.currentTarget.style.backgroundColor = 'rgba(124,110,245,0.08)' }}
                  >
                    {fileLoading ? (
                      <>
                        <div style={{
                          width: '12px', height: '12px', borderRadius: '50%',
                          border: '2px solid rgba(124,110,245,0.3)',
                          borderTopColor: '#a78bfa',
                          animation: 'spin 0.8s linear infinite',
                          flexShrink: 0,
                        }} />
                        提取中...
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        上传 PDF / Word
                      </>
                    )}
                  </button>
                  {url.length > 0 && (
                    <span style={{ fontSize: '11px', color: '#475569' }}>
                      已输入 {url.length} 字
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                  支持微信公众号、微博、小红书、Campaign Brief、行业报告等任意来源
                </p>
              </div>
              <Btn onClick={addFromUrl} loading={loading} className="w-full" size="lg" variant="spark">
                {loading ? <><Spinner size={14} /> AI 提炼中...</> : <>✨ 一键提炼案例</>}
              </Btn>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 标题 + 品牌 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                    案例标题 <span style={{ color: '#a78bfa' }}>*</span>
                  </label>
                  <input style={inputStyle} placeholder="如：耐克×NASA联名跑鞋" value={manual.title} onChange={setM('title')}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,110,245,0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                    品牌 <span style={{ color: '#a78bfa' }}>*</span>
                  </label>
                  <input style={inputStyle} placeholder="品牌名称" value={manual.brand} onChange={setM('brand')}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,110,245,0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
              </div>

              {/* 行业 + 平台 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>行业</label>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setIndustryOpen(!industryOpen)}
                      style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                        color: manual.industry ? 'white' : '#475569', borderColor: industryOpen ? 'rgba(124,110,245,0.5)' : 'rgba(255,255,255,0.08)' }}
                    >
                      <span>{manual.industry || '选择行业'}</span>
                      <ChevronDown size={13} style={{ color: '#64748b', transform: industryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    <AnimatePresence>
                      {industryOpen && (
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIndustryOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                            style={{
                              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
                              backgroundColor: '#0f0f1a', border: '1px solid rgba(124,110,245,0.2)',
                              borderRadius: '12px', padding: '4px', maxHeight: '180px', overflowY: 'auto',
                              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                            }}
                          >
                            {INDUSTRIES.map(ind => (
                              <button key={ind} type="button"
                                onClick={() => { setManual(m => ({ ...m, industry: ind })); setIndustryOpen(false) }}
                                style={{
                                  width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: '8px',
                                  fontSize: '13px', border: 'none', cursor: 'pointer', transition: 'all 0.1s',
                                  color: manual.industry === ind ? 'white' : '#94a3b8',
                                  backgroundColor: manual.industry === ind ? 'rgba(124,110,245,0.15)' : 'transparent',
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                }}
                                onMouseEnter={e => { if (manual.industry !== ind) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                                onMouseLeave={e => { if (manual.industry !== ind) e.currentTarget.style.backgroundColor = 'transparent' }}
                              >
                                {manual.industry === ind && <span style={{ color: '#7c6ef5', fontSize: '10px' }}>✓</span>}
                                {ind}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>平台</label>
                  <input style={inputStyle} placeholder="如：微博、小红书" value={manual.platform} onChange={setM('platform')}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,110,245,0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
              </div>

              {/* 核心概念 */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>核心概念</label>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                  placeholder="描述这个案例的创意核心..."
                  value={manual.concept}
                  onChange={setM('concept')}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,110,245,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* 可复用模式 */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                  可复用模式 <span style={{ color: '#475569', fontWeight: 400 }}>（底层逻辑）</span>
                </label>
                <textarea
                  rows={2}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                  placeholder="这个案例可以复用的思路或模式..."
                  value={manual.reusablePattern}
                  onChange={setM('reusablePattern')}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,110,245,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* 标签 */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                  标签 <span style={{ color: '#475569', fontWeight: 400 }}>（逗号分隔）</span>
                </label>
                <input
                  style={inputStyle}
                  placeholder="事件营销, 社会议题, Z世代, 联名..."
                  value={manual.tags}
                  onChange={setM('tags')}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,110,245,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              <Btn onClick={addManual} className="w-full" size="lg" variant="spark">
                <Tag size={14} /> 添加到案例库
              </Btn>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}