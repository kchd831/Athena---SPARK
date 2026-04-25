import { useState, useEffect } from 'react'
import { X, BarChart2 } from 'lucide-react'
import { scoreIdea5D } from '../utils/prompts'
import type { Score5DResult } from '../utils/prompts'
import { useSparkStore } from '../store'

interface Props {
  ideaTitle: string
  concept: string
  brand?: string
  onClose: () => void
}

const DIMENSIONS = [
  { key: 'innovation', label: '创新性', color: '#7c6ef5' },
  { key: 'spread', label: '传播力', color: '#3b82f6' },
  { key: 'feasibility', label: '执行可行性', color: '#10b981' },
  { key: 'brandFit', label: '品牌契合度', color: '#f59e0b' },
  { key: 'businessValue', label: '商业价值', color: '#ec4899' },
]

export const ScorePanel = ({ ideaTitle, concept, brand = '', onClose }: Props) => {
  const { apiKey, qwenApiKey, model } = useSparkStore()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<Score5DResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      const currentKey = model === 'deepseek' ? apiKey : qwenApiKey
      if (!currentKey) {
        setError('请先设置 API Key')
        setLoading(false)
        return
      }
      try {
        const res = await scoreIdea5D(ideaTitle, concept, brand, currentKey, model)
        setResult(res)
      } catch (e: any) {
        setError(e.message || '评估失败，请重试')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0f0f1a',
          border: '1px solid rgba(124,110,245,0.25)',
          borderRadius: '20px',
          width: '100%', maxWidth: '480px',
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} style={{ color: '#a78bfa' }} />
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>创意评估</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '30px', height: '30px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)', border: 'none',
              color: '#64748b', cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px' }}>
          {/* Idea preview */}
          <div style={{
            padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>{ideaTitle}</p>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
            }}>{concept}</p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '3px solid rgba(124,110,245,0.2)',
                borderTopColor: '#7c6ef5',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 12px',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <p style={{ fontSize: '13px', color: '#64748b' }}>AI 深度评估中...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '12px' }}>{error}</p>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {DIMENSIONS.map(dim => {
                  const score = result.scores[dim.key as keyof Score5DResult['scores']] as number
                  const pct = Math.max(0, Math.min(100, score * 10))
                  return (
                    <div key={dim.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{dim.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'white', fontFamily: 'monospace' }}>
                          {score.toFixed(1)}<span style={{ color: '#475569', fontWeight: 400 }}>/10</span>
                        </span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '999px',
                          width: `${pct}%`,
                          backgroundColor: dim.color,
                          boxShadow: `0 0 8px ${dim.color}80`,
                          transition: 'width 1s ease-out',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{
                padding: '16px', borderRadius: '14px',
                backgroundColor: 'rgba(124,110,245,0.08)',
                border: '1px solid rgba(124,110,245,0.2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 500 }}>综合评分</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>
                    {result.overall.toFixed(1)}<span style={{ fontSize: '13px', color: '#475569', fontWeight: 400 }}>/10</span>
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.7 }}>{result.comment}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}