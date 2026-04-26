import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitMerge, Link2, Megaphone, BookOpen, Zap, ArrowRight } from 'lucide-react'
import { GlobalLayout, Navbar } from '../components/UI'
import { useSparkStore } from '../store'

const modules = [
  { to: '/cross', icon: GitMerge, title: '跨界碰撞', subtitle: 'Cross-Industry Collision', desc: '从3个不相关行业提炼创意逻辑，嫁接到你的品牌场景', color: '#7c6ef5', tag: '打破行业壁垒' },
  { to: '/cobrand', icon: Link2, title: '联名策划', subtitle: 'Co-Branding Planner', desc: '分析两个品牌的DNA交集，生成差异化联名合作方案', color: '#a78bfa', tag: '品牌基因分析' },
  { to: '/campaign', icon: Megaphone, title: 'Campaign创意', subtitle: 'Campaign Ideation', desc: '一次生成5个创意——从稳健到颠覆，找到你敢用的那个', color: '#f59e0b', tag: '五级风险谱系' },
  { to: '/cases', icon: BookOpen, title: '案例库', subtitle: 'Case Library', desc: '收藏和管理创意灵感案例，用 URL 一键智能提炼', color: '#10b981', tag: 'URL 智能提炼' },
]

export default function Home() {
  const { caseLibrary } = useSparkStore()

  return (
    <GlobalLayout>
      <Navbar showBack={false} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 mt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '48px 0 40px', position: 'relative' }}
        >
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
          }}>
            <button
              onClick={() => window.location.href = 'https://athena-hub-app.vercel.app'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#64748b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                transition: 'color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              返回导航主页
            </button>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: '99px', padding: '5px 14px', fontSize: '12px',
            color: '#f59e0b', fontWeight: 500, marginBottom: '20px',
          }}>
            <Zap size={13} />Strategic Playbook for Agile & Radical Kreative
          </div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '56px', lineHeight: 1, color: '#fff', marginBottom: '14px',
            background: 'linear-gradient(135deg, #a78bfa, #7c6ef5, #f59e0b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            SPARK
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '420px', margin: '0 auto' }}>
            AI 驱动的创意工作台，专为 PR 人打造的灵感加速引擎
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {modules.map(({ to, icon: Icon, title, subtitle, desc, color, tag }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={to}
                style={{
                  display: 'block', background: '#0f0f1a', borderRadius: '16px',
                  padding: '24px', textDecoration: 'none',
                  border: '1px solid rgba(124,110,245,0.15)',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#141428'
                  e.currentTarget.style.borderColor = 'rgba(124,110,245,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 10px 30px -10px ${color}30`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#0f0f1a'
                  e.currentTarget.style.borderColor = 'rgba(124,110,245,0.15)'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: `${color}15` }}>
                    <Icon size={24} style={{ color, display: 'block' }} />
                  </div>
                  <span style={{
                    fontSize: '11px', padding: '4px 12px', borderRadius: '99px',
                    border: `1px solid ${color}30`, background: `${color}10`, color,
                    fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}>
                    {tag}
                  </span>
                </div>

                <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '20px', color: '#f8fafc', marginBottom: '4px' }}>
                  {title}
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                  {subtitle}
                </div>
                <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
                  {desc}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color }}>
                  开始使用 <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {caseLibrary.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}
          >
            <BookOpen size={14} />
            案例库中已有 <span style={{ color: '#a78bfa', fontWeight: 600 }}>{caseLibrary.length}</span> 个收藏案例
          </motion.div>
        )}
      </main>
    </GlobalLayout>
  )
}
