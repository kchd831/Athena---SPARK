# SPARK · 创意引擎 — Solo Coder 完整部署命令

**共 6 步。每步发送一条命令，等回复「完成，等待下一步」后再发下一步。**

---

## 第 1 步 / 共 6 步：项目初始化 + 配置文件

```
这是SPARK创意引擎的第1步，共6步。请只执行本步骤，完成后回复「完成，等待下一步」。

在雅典娜项目根目录（和 CARE、SMART 同级）新建文件夹 "6. SPARK"，在其中执行以下操作：

【1】初始化项目
在终端执行：
cd "6. SPARK"
npm create vite@latest . -- --template react-ts
npm install
npm install framer-motion lucide-react tailwind-merge clsx zustand react-router-dom @types/react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

【2】创建 tailwind.config.js（覆盖生成的文件）
内容：
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080d1a',
        surface: '#0e1628',
        border: '#1e2a45',
        accent: '#6366f1',
        'accent-2': '#a78bfa',
        spark: '#f59e0b',
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

【3】创建 vite.config.ts（覆盖生成的文件）
内容：
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5178,
    proxy: {
      '/jina': {
        target: 'https://r.jina.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jina/, ''),
      },
    },
  },
})

【4】修改 package.json 的 scripts 部分为：
"scripts": {
  "dev": "vite --port 5178",
  "build": "tsc -b && vite build",
  "preview": "vite preview --port 5178"
},

【5】替换 index.html 内容为：
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SPARK · 创意引擎</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

【6】创建目录结构：
src/components/
src/pages/
src/utils/
src/store/

完成后回复「完成，等待下一步」
```

---

## 第 2 步 / 共 6 步：全局样式 + 工具函数 + Store

```
这是SPARK创意引擎的第2步，共6步。请只执行本步骤，完成后回复「完成，等待下一步」。

【1】替换 src/index.css 内容为：
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #080d1a;
    color: #e2e8f0;
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  * { box-sizing: border-box; }
}

@layer utilities {
  .font-display { font-family: 'Syne', sans-serif; }
  .gradient-text {
    background: linear-gradient(135deg, #a78bfa, #6366f1, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .card-glow {
    box-shadow: 0 0 0 1px rgba(99,102,241,0.15), 0 4px 24px rgba(99,102,241,0.08);
  }
  .card-glow:hover {
    box-shadow: 0 0 0 1px rgba(99,102,241,0.4), 0 8px 40px rgba(99,102,241,0.2);
  }
  .spark-glow {
    box-shadow: 0 0 0 1px rgba(245,158,11,0.2), 0 4px 24px rgba(245,158,11,0.1);
  }
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0e1628; }
::-webkit-scrollbar-thumb { background: #1e2a45; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #2d3f66; }

【2】替换 src/main.tsx 内容为：
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

【3】新建 src/utils/api.ts 内容为：
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

【4】新建 src/store/index.ts 内容为：
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CaseItem {
  id: string
  title: string
  brand: string
  industry: string
  creativeType: string
  platform: string
  concept: string
  highlights: string[]
  reusablePattern: string
  tags: string[]
  sourceUrl?: string
  addedAt: string
}

interface SparkStore {
  apiKey: string
  setApiKey: (key: string) => void
  caseLibrary: CaseItem[]
  addCase: (item: CaseItem) => void
  removeCase: (id: string) => void
}

export const useSparkStore = create<SparkStore>()(
  persist(
    (set) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      caseLibrary: [],
      addCase: (item) =>
        set((state) => ({ caseLibrary: [item, ...state.caseLibrary] })),
      removeCase: (id) =>
        set((state) => ({
          caseLibrary: state.caseLibrary.filter((c) => c.id !== id),
        })),
    }),
    { name: 'spark-store' }
  )
)

完成后回复「完成，等待下一步」
```

---

## 第 3 步 / 共 6 步：AI Prompt 函数

```
这是SPARK创意引擎的第3步，共6步。请只执行本步骤，完成后回复「完成，等待下一步」。

新建 src/utils/prompts.ts 内容为：
import { callDeepSeek, parseJSON } from './api'

export interface CrossIndustryResult {
  industry: string
  referenceCase: string
  corePrinciple: string
  ideaTitle: string
  concept: string
  executionFormat: string
  executionSteps: string[]
  riskNote: string
}

export const generateCrossIndustry = async (
  brand: string, brandIndustry: string, goal: string, constraints: string, apiKey: string
): Promise<CrossIndustryResult[]> => {
  const raw = await callDeepSeek([
    { role: 'system', content: `你是一位顶尖的跨行业创意策略师，擅长从完全不相关的行业中提炼创意灵感，嫁接到目标品牌场景。必须从3个完全不同行业各找1个成功案例，提炼底层创意逻辑后嫁接到客户场景。\n\n输出JSON格式：\n[{"industry":"参考行业","referenceCase":"具体参考案例","corePrinciple":"底层创意逻辑","ideaTitle":"创意方向标题","concept":"创意概念（100字内）","executionFormat":"活动/传播形式","executionSteps":["步骤1","步骤2","步骤3"],"riskNote":"潜在风险"}]\n输出3个，只输出JSON数组。` },
    { role: 'user', content: `品牌：${brand}\n行业：${brandIndustry}\n目标：${goal}\n限制：${constraints || '无'}` }
  ], apiKey, { temperature: 0.9 })
  return parseJSON(raw)
}

export interface CoBrandResult {
  conceptTitle: string
  chemistry: string
  audienceOverlap: string
  activityFormat: string
  campaignIdea: string
  distributionStrategy: string
  referenceCase: string
  potentialObstacles: string
}

export const generateCoBranding = async (
  brand1: string, brand2: string, goal: string, apiKey: string
): Promise<CoBrandResult[]> => {
  const raw = await callDeepSeek([
    { role: 'system', content: `你是品牌联名策划专家，深谙品牌基因分析与跨界合作策划。\n\n输出JSON格式：\n[{"conceptTitle":"联名方案标题","chemistry":"品牌化学反应分析","audienceOverlap":"受众交集","activityFormat":"联名活动形式","campaignIdea":"核心Big Idea","distributionStrategy":"传播策略","referenceCase":"历史参考案例","potentialObstacles":"风险与规避"}]\n输出3个方案，只输出JSON数组。` },
    { role: 'user', content: `品牌A：${brand1}\n品牌B：${brand2}\n合作目标：${goal}` }
  ], apiKey, { temperature: 0.85 })
  return parseJSON(raw)
}

export type RiskLevel = '稳健' | '进取' | '创新' | '大胆' | '颠覆'

export interface CampaignIdea {
  riskLevel: RiskLevel
  title: string
  bigIdea: string
  concept: string
  executionFormat: string
  executionSteps: string[]
  inspirationSource: string
  estimatedImpact: string
}

export const generateCampaign = async (
  goal: string, audience: string, budget: string, brand: string, apiKey: string
): Promise<CampaignIdea[]> => {
  const raw = await callDeepSeek([
    { role: 'system', content: `你是顶级创意策略师，为PR/营销campaign提供从保守到颠覆的完整创意谱系。\n\n输出JSON格式：\n[{"riskLevel":"稳健|进取|创新|大胆|颠覆","title":"方案标题","bigIdea":"Big Idea一句话","concept":"核心概念（100字内）","executionFormat":"执行形式","executionSteps":["步骤1","步骤2","步骤3"],"inspirationSource":"灵感来源","estimatedImpact":"预估效果"}]\n必须输出5个，对应稳健/进取/创新/大胆/颠覆，只输出JSON数组。` },
    { role: 'user', content: `品牌：${brand || '待定'}\n目标：${goal}\n受众：${audience}\n预算：${budget}` }
  ], apiKey, { temperature: 0.9 })
  return parseJSON(raw)
}

export interface ScoreResult {
  clientScore: number
  clientRationale: string
  spreadScore: number
  spreadRationale: string
  topRisk: string
  suggestion: string
}

export const scoreIdea = async (
  ideaTitle: string, concept: string, brand: string, apiKey: string
): Promise<ScoreResult> => {
  const raw = await callDeepSeek([
    { role: 'system', content: `你是资深PR顾问。对创意方案进行专业评估。\n输出JSON：{"clientScore":75,"clientRationale":"依据","spreadScore":68,"spreadRationale":"依据","topRisk":"最大风险","suggestion":"改进建议"}\n评分0-100，只输出JSON。` },
    { role: 'user', content: `品牌：${brand || '待定'}\n创意：${ideaTitle}\n概念：${concept}` }
  ], apiKey, { temperature: 0.3 })
  return parseJSON(raw)
}

export const extractCaseFromContent = async (
  content: string, sourceUrl: string, apiKey: string
): Promise<any> => {
  const raw = await callDeepSeek([
    { role: 'system', content: `从内容中提炼创意案例结构化信息。\n输出JSON：{"title":"标题","brand":"品牌","industry":"行业","creativeType":"创意类型","platform":"平台","concept":"核心概念","highlights":["亮点1","亮点2"],"reusablePattern":"可复用模式","tags":["标签1","标签2"],"sourceUrl":"${sourceUrl}"}\n只输出JSON。` },
    { role: 'user', content: content.slice(0, 4000) }
  ], apiKey, { temperature: 0.2 })
  return parseJSON(raw)
}

完成后回复「完成，等待下一步」
```

---

## 第 4 步 / 共 6 步：共用 UI 组件 + ScorePanel

```
这是SPARK创意引擎的第4步，共6步。请只执行本步骤，完成后回复「完成，等待下一步」。

【1】新建 src/components/UI.tsx 内容为：
import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, GitMerge, Link2, Megaphone, BookOpen, Key, X, CheckCircle2 } from 'lucide-react'
import { useSparkStore } from '../store'

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-bg text-slate-200 flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
  </div>
)

const navItems = [
  { to: '/cross', icon: GitMerge, label: '跨界碰撞' },
  { to: '/cobrand', icon: Link2, label: '联名策划' },
  { to: '/campaign', icon: Megaphone, label: 'Campaign' },
  { to: '/cases', icon: BookOpen, label: '案例库' },
]

export const Navbar = () => {
  const { pathname } = useLocation()
  const [showKey, setShowKey] = useState(false)
  return (
    <>
      <header className="border-b border-border sticky top-0 z-30 backdrop-blur-md bg-bg/80">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <Zap size={20} className="text-spark" />
            <span className="gradient-text">SPARK</span>
            <span className="text-slate-500 text-sm font-normal font-body ml-1">创意引擎</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  pathname === to ? 'bg-accent/20 text-accent-2 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}>
                <Icon size={14} />{label}
              </Link>
            ))}
          </nav>
          <button onClick={() => setShowKey(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            <Key size={14} /><span className="hidden md:inline">API Key</span>
          </button>
        </div>
      </header>
      <AnimatePresence>{showKey && <ApiKeyModal onClose={() => setShowKey(false)} />}</AnimatePresence>
    </>
  )
}

export const ApiKeyModal = ({ onClose }: { onClose: () => void }) => {
  const { apiKey, setApiKey } = useSparkStore()
  const [val, setVal] = useState(apiKey)
  const [saved, setSaved] = useState(false)
  const save = () => { setApiKey(val.trim()); setSaved(true); setTimeout(onClose, 700) }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-lg">DeepSeek API Key</h3>
            <p className="text-slate-500 text-sm mt-0.5">Key 仅保存在本地浏览器</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={18} /></button>
        </div>
        <input type="password" value={val} onChange={e => setVal(e.target.value)}
          placeholder="sk-..." onKeyDown={e => e.key === 'Enter' && save()}
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent transition-colors" />
        <button onClick={save}
          className="mt-4 w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
          {saved ? <><CheckCircle2 size={16} />已保存</> : '保存 Key'}
        </button>
      </motion.div>
    </motion.div>
  )
}

export const Btn = ({ onClick, disabled, loading, variant = 'primary', size = 'md', children, className = '', type = 'button' }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; variant?: 'primary'|'secondary'|'ghost'|'spark'; size?: 'sm'|'md'|'lg'; children: ReactNode; className?: string; type?: 'button'|'submit'
}) => {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }
  const variants = {
    primary: 'bg-accent hover:bg-accent/90 text-white',
    secondary: 'bg-white/8 hover:bg-white/12 text-slate-200 border border-border',
    ghost: 'hover:bg-white/8 text-slate-400 hover:text-slate-200',
    spark: 'bg-spark hover:bg-amber-400 text-black font-semibold',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}>
      {loading && <Spinner size={14} />}{children}
    </button>
  )
}

export const Spinner = ({ size = 20 }: { size?: number }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle className="opacity-25" cx="12" cy="12" r="10" />
    <path className="opacity-75" d="M4 12a8 8 0 018-8" />
  </svg>
)

export const Card = ({ children, className = '', style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`bg-surface border border-border rounded-2xl card-glow transition-all ${className}`} style={style}>{children}</div>
)

export const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: any }) => (
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon size={20} className="text-accent-2" />}
      <h1 className="font-display font-bold text-2xl text-white">{title}</h1>
    </div>
    {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
  </div>
)

export const Field = ({ label, required, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
    {children}
    {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
  </div>
)

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent transition-colors ${props.className || ''}`} />
)

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent transition-colors resize-none ${props.className || ''}`} />
)

export const Empty = ({ icon: Icon, message }: { icon: any; message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-600">
    <Icon size={36} className="mb-3 opacity-40" /><p className="text-sm">{message}</p>
  </div>
)

export const ErrorBanner = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">
    <span className="flex-1">{message}</span>
    <button onClick={onDismiss} className="text-red-400 hover:text-red-200 mt-0.5"><X size={14} /></button>
  </motion.div>
)

【2】新建 src/components/ScorePanel.tsx 内容为：
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, AlertTriangle, Lightbulb, X } from 'lucide-react'
import { scoreIdea, ScoreResult } from '../utils/prompts'
import { useSparkStore } from '../store'
import { Btn, Spinner } from './UI'

interface Props {
  ideaTitle: string
  concept: string
  brand?: string
  onClose: () => void
}

const ScoreBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div className="flex justify-between text-sm mb-1.5">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono font-medium text-white">{value}</span>
    </div>
    <div className="h-2 bg-bg rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  </div>
)

export const ScorePanel = ({ ideaTitle, concept, brand = '', onClose }: Props) => {
  const { apiKey } = useSparkStore()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [error, setError] = useState('')

  const run = async () => {
    if (!apiKey) { setError('请先设置 API Key'); return }
    setLoading(true); setError('')
    try {
      const res = await scoreIdea(ideaTitle, concept, brand, apiKey)
      setResult(res)
    } catch (e: any) {
      setError(e.message || '评估失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-accent-2" />
            <h3 className="font-display font-semibold">创意评估</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <div className="bg-bg rounded-xl p-3 mb-5">
            <p className="text-sm font-medium text-slate-300">{ideaTitle}</p>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{concept}</p>
          </div>
          {!result && !loading && (
            <Btn onClick={run} className="w-full" size="lg">
              <BarChart2 size={16} />开始评估
            </Btn>
          )}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-3 text-slate-500">
              <Spinner size={18} /><span className="text-sm">AI 评估中...</span>
            </div>
          )}
          {error && <p className="text-sm text-red-400 text-center py-4">{error}</p>}
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="space-y-3">
                <ScoreBar label="客户接受度" value={result.clientScore} color="linear-gradient(90deg,#6366f1,#a78bfa)" />
                <p className="text-xs text-slate-500">{result.clientRationale}</p>
                <ScoreBar label="传播可行性" value={result.spreadScore} color="linear-gradient(90deg,#f59e0b,#fcd34d)" />
                <p className="text-xs text-slate-500">{result.spreadRationale}</p>
              </div>
              <div className="flex items-start gap-2 bg-red-500/8 border border-red-500/15 rounded-xl p-3">
                <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-300 mb-0.5">最大风险</p>
                  <p className="text-xs text-slate-400">{result.topRisk}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-accent/8 border border-accent/15 rounded-xl p-3">
                <Lightbulb size={14} className="text-accent-2 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-accent-2 mb-0.5">改进建议</p>
                  <p className="text-xs text-slate-400">{result.suggestion}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

完成后回复「完成，等待下一步」
```

---

## 第 5 步 / 共 6 步：首页 + 跨界碰撞 + 联名策划页面

```
这是SPARK创意引擎的第5步，共6步。请只执行本步骤，完成后回复「完成，等待下一步」。

【1】新建 src/pages/Home.tsx 内容为：
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitMerge, Link2, Megaphone, BookOpen, Zap, ArrowRight } from 'lucide-react'
import { Layout } from '../components/UI'
import { useSparkStore } from '../store'

const modules = [
  { to: '/cross', icon: GitMerge, title: '跨界碰撞', subtitle: 'Cross-Industry Collision', desc: '从3个不相关行业提炼创意逻辑，嫁接到你的品牌场景', color: '#6366f1', tag: '打破行业壁垒' },
  { to: '/cobrand', icon: Link2, title: '联名策划', subtitle: 'Co-Branding Planner', desc: '分析两个品牌的DNA交集，生成差异化联名合作方案', color: '#a78bfa', tag: '品牌基因分析' },
  { to: '/campaign', icon: Megaphone, title: 'Campaign创意', subtitle: 'Campaign Ideation', desc: '一次生成5个创意——从稳健到颠覆，找到你敢用的那个', color: '#f59e0b', tag: '五级风险谱系' },
  { to: '/cases', icon: BookOpen, title: '案例库', subtitle: 'Case Library', desc: '收藏和管理创意灵感案例，用 URL 一键智能提炼', color: '#34d399', tag: 'URL 智能提炼' },
]

export default function Home() {
  const { caseLibrary } = useSparkStore()
  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 mb-10">
        <div className="inline-flex items-center gap-2 bg-spark/10 border border-spark/20 rounded-full px-4 py-1.5 text-sm text-spark font-medium mb-6">
          <Zap size={14} />Strategic Playbook for Agile & Radical Kreative
        </div>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-white mb-4">
          <span className="gradient-text">SPARK</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">AI 驱动的创意工作台，专为 PR 人打造的灵感加速引擎</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-4">
        {modules.map(({ to, icon: Icon, title, subtitle, desc, color, tag }, i) => (
          <motion.div key={to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={to} className="group block bg-surface border border-border rounded-2xl p-6 hover:border-opacity-60 transition-all card-glow" style={{ '--glow-color': color } as any}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: `${color}18` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full border font-mono" style={{ color, borderColor: `${color}30`, background: `${color}0d` }}>{tag}</span>
              </div>
              <h2 className="font-display font-bold text-xl text-white mb-0.5">{title}</h2>
              <p className="text-xs text-slate-600 font-mono mb-3">{subtitle}</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{desc}</p>
              <div className="flex items-center gap-1 text-sm font-medium transition-all" style={{ color }}>
                开始使用 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      {caseLibrary.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
          <BookOpen size={14} />案例库中已有 <span className="text-accent-2 font-medium">{caseLibrary.length}</span> 个收藏案例
        </motion.div>
      )}
    </Layout>
  )
}

【2】新建 src/pages/CrossIndustry.tsx 内容为：
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitMerge, ChevronDown, BarChart2, Megaphone, AlertCircle, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Layout, SectionHeader, Card, Field, Input, Textarea, Btn, ErrorBanner, Empty, Spinner } from '../components/UI'
import { ScorePanel } from '../components/ScorePanel'
import { generateCrossIndustry, CrossIndustryResult } from '../utils/prompts'
import { useSparkStore } from '../store'

export default function CrossIndustry() {
  const { apiKey } = useSparkStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ brand: '', industry: '', goal: '', constraints: '' })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CrossIndustryResult[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(0)
  const [scoring, setScoring] = useState<number | null>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const run = async () => {
    if (!apiKey) { setError('请先点击右上角设置 API Key'); return }
    if (!form.brand || !form.goal) { setError('请填写品牌和传播目标'); return }
    setLoading(true); setError(''); setResults([])
    try {
      const res = await generateCrossIndustry(form.brand, form.industry, form.goal, form.constraints, apiKey)
      setResults(res); setExpanded(0)
    } catch (e: any) { setError(e.message || '生成失败，请重试') }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <SectionHeader title="跨界碰撞" subtitle="从3个完全不相关行业提炼创意逻辑，嫁接到你的品牌场景" icon={GitMerge} />
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-5 h-fit">
          <div className="space-y-4">
            <Field label="品牌 / 客户" required><Input placeholder="如：某快消品牌" value={form.brand} onChange={set('brand')} /></Field>
            <Field label="所属行业"><Input placeholder="如：食品饮料" value={form.industry} onChange={set('industry')} /></Field>
            <Field label="传播目标" required><Textarea rows={3} placeholder="如：提升品牌在年轻群体中的好感度，结合春节节点..." value={form.goal} onChange={set('goal')} /></Field>
            <Field label="限制条件"><Textarea rows={2} placeholder="如：预算有限，不能明星代言，需要适合微博传播..." value={form.constraints} onChange={set('constraints')} /></Field>
            <AnimatePresence>{error && <ErrorBanner message={error} onDismiss={() => setError('')} />}</AnimatePresence>
            <Btn onClick={run} loading={loading} className="w-full" size="lg" variant="spark">
              <GitMerge size={16} />{loading ? '跨界碰撞中...' : '生成跨界创意'}
            </Btn>
          </div>
        </Card>
        <div className="lg:col-span-3 space-y-3">
          {loading && <div className="flex items-center justify-center py-20 text-slate-500"><Spinner size={24} /><span className="ml-3">正在跨越行业边界，寻找灵感...</span></div>}
          {!loading && results.length === 0 && <Empty icon={GitMerge} message="填写左侧表单，生成3个跨界创意方向" />}
          {results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors" onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 bg-accent/15 text-accent-2 rounded-full border border-accent/20">FROM {r.industry}</span>
                    <h3 className="font-display font-semibold text-white">{r.ideaTitle}</h3>
                  </div>
                  <ChevronDown size={16} className={`text-slate-500 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                        <div className="bg-accent/5 rounded-xl p-3 border border-accent/10">
                          <p className="text-xs text-accent-2 font-medium mb-1">参考案例</p>
                          <p className="text-sm text-slate-300">{r.referenceCase}</p>
                          <p className="text-xs text-slate-500 mt-1">底层逻辑：{r.corePrinciple}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1.5">创意概念</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{r.concept}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1.5">执行形式：<span className="text-slate-400">{r.executionFormat}</span></p>
                          <ul className="space-y-1">
                            {r.executionSteps.map((s, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-slate-400"><CheckCircle size={13} className="text-accent-2 mt-0.5 shrink-0" />{s}</li>
                            ))}
                          </ul>
                        </div>
                        {r.riskNote && <div className="flex items-start gap-2 text-xs text-amber-400/80"><AlertCircle size={12} className="mt-0.5 shrink-0" />{r.riskNote}</div>}
                        <div className="flex items-center gap-2 pt-1">
                          <Btn size="sm" variant="ghost" onClick={() => setScoring(i)}><BarChart2 size={13} />评估</Btn>
                          <Btn size="sm" variant="ghost" onClick={() => navigate('/campaign', { state: { fromCross: r } })}><Megaphone size={13} />深化为Campaign</Btn>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {scoring !== null && results[scoring] && (
          <ScorePanel ideaTitle={results[scoring].ideaTitle} concept={results[scoring].concept} brand={form.brand} onClose={() => setScoring(null)} />
        )}
      </AnimatePresence>
    </Layout>
  )
}

【3】新建 src/pages/CoBranding.tsx 内容为：
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, ChevronDown, BarChart2, Users, Shuffle, AlertTriangle, CheckCircle } from 'lucide-react'
import { Layout, SectionHeader, Card, Field, Input, Textarea, Btn, ErrorBanner, Empty, Spinner } from '../components/UI'
import { ScorePanel } from '../components/ScorePanel'
import { generateCoBranding, CoBrandResult } from '../utils/prompts'
import { useSparkStore } from '../store'

export default function CoBranding() {
  const { apiKey } = useSparkStore()
  const [form, setForm] = useState({ brand1: '', brand2: '', goal: '' })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CoBrandResult[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(0)
  const [scoring, setScoring] = useState<number | null>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const run = async () => {
    if (!apiKey) { setError('请先设置 API Key'); return }
    if (!form.brand1 || !form.brand2 || !form.goal) { setError('请填写两个品牌名称和合作目标'); return }
    setLoading(true); setError(''); setResults([])
    try {
      const res = await generateCoBranding(form.brand1, form.brand2, form.goal, apiKey)
      setResults(res); setExpanded(0)
    } catch (e: any) { setError(e.message || '生成失败') }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <SectionHeader title="联名策划" subtitle="分析两个品牌的DNA，生成3个差异化联名合作方案" icon={Link2} />
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-5 h-fit">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="品牌 A" required><Input placeholder="如：可口可乐" value={form.brand1} onChange={set('brand1')} /></Field>
              <Field label="品牌 B" required><Input placeholder="如：故宫文创" value={form.brand2} onChange={set('brand2')} /></Field>
            </div>
            {form.brand1 && form.brand2 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 py-2">
                <span className="text-sm font-medium text-accent-2">{form.brand1}</span>
                <Shuffle size={14} className="text-spark" />
                <span className="text-sm font-medium text-accent-2">{form.brand2}</span>
              </motion.div>
            )}
            <Field label="合作目标" required><Textarea rows={3} placeholder="如：借助故宫IP提升年轻消费者好感度，打造限定联名款..." value={form.goal} onChange={set('goal')} /></Field>
            <AnimatePresence>{error && <ErrorBanner message={error} onDismiss={() => setError('')} />}</AnimatePresence>
            <Btn onClick={run} loading={loading} className="w-full" size="lg" variant="spark">
              <Link2 size={16} />{loading ? '分析品牌DNA...' : '生成联名方案'}
            </Btn>
          </div>
        </Card>
        <div className="lg:col-span-3 space-y-3">
          {loading && <div className="flex items-center justify-center py-20 text-slate-500"><Spinner size={24} /><span className="ml-3">解析品牌基因，探索合作可能性...</span></div>}
          {!loading && results.length === 0 && <Empty icon={Link2} message="输入两个品牌，生成联名策划方案" />}
          {results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors" onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div>
                    <h3 className="font-display font-semibold text-white">{r.conceptTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{r.activityFormat}</p>
                  </div>
                  <ChevronDown size={16} className={`text-slate-500 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expanded === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                        <div className="bg-spark/5 border border-spark/15 rounded-xl p-3">
                          <p className="text-xs text-spark font-medium mb-1">Big Idea</p>
                          <p className="text-sm text-slate-200 font-medium leading-relaxed">{r.campaignIdea}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1"><CheckCircle size={11} className="text-accent-2" />品牌化学反应</p>
                            <p className="text-xs text-slate-400 leading-relaxed">{r.chemistry}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1"><Users size={11} className="text-accent-2" />受众交集</p>
                            <p className="text-xs text-slate-400 leading-relaxed">{r.audienceOverlap}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">传播策略</p>
                          <p className="text-sm text-slate-400">{r.distributionStrategy}</p>
                        </div>
                        {r.referenceCase && <div className="text-xs text-slate-500"><span className="text-slate-600">参考先例：</span>{r.referenceCase}</div>}
                        {r.potentialObstacles && (
                          <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/5 rounded-xl p-3">
                            <AlertTriangle size={12} className="mt-0.5 shrink-0" />{r.potentialObstacles}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <Btn size="sm" variant="ghost" onClick={() => setScoring(i)}><BarChart2 size={13} />评估</Btn>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {scoring !== null && results[scoring] && (
          <ScorePanel ideaTitle={results[scoring].conceptTitle} concept={results[scoring].campaignIdea} brand={`${form.brand1} × ${form.brand2}`} onClose={() => setScoring(null)} />
        )}
      </AnimatePresence>
    </Layout>
  )
}

完成后回复「完成，等待下一步」
```

---

## 第 6 步 / 共 6 步：Campaign页 + 案例库页 + App路由 + 启动验证

```
这是SPARK创意引擎的第6步，共6步。请只执行本步骤，完成后回复「完成，等待下一步」。

【1】新建 src/pages/Campaign.tsx 内容为：
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, ChevronDown, BarChart2, CheckCircle, Lightbulb } from 'lucide-react'
import { Layout, SectionHeader, Card, Field, Input, Textarea, Btn, ErrorBanner, Empty, Spinner } from '../components/UI'
import { ScorePanel } from '../components/ScorePanel'
import { generateCampaign, CampaignIdea, RiskLevel } from '../utils/prompts'
import { useSparkStore } from '../store'

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; emoji: string }> = {
  '稳健': { color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.2)', emoji: '🛡️' },
  '进取': { color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', emoji: '🚀' },
  '创新': { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', emoji: '⚡' },
  '大胆': { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', emoji: '🔥' },
  '颠覆': { color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', emoji: '💥' },
}

export default function Campaign() {
  const { apiKey } = useSparkStore()
  const location = useLocation()
  const [form, setForm] = useState({ brand: '', goal: '', audience: '', budget: '中等（50-200万）' })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CampaignIdea[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [scoring, setScoring] = useState<number | null>(null)

  useEffect(() => {
    const state = location.state as any
    if (state?.fromCross) {
      const r = state.fromCross
      setForm(f => ({ ...f, goal: `${r.ideaTitle}：${r.concept}` }))
    }
  }, [location.state])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const run = async () => {
    if (!apiKey) { setError('请先设置 API Key'); return }
    if (!form.goal || !form.audience) { setError('请填写Campaign目标和目标受众'); return }
    setLoading(true); setError(''); setResults([])
    try {
      const res = await generateCampaign(form.goal, form.audience, form.budget, form.brand, apiKey)
      setResults(res); setExpanded(null)
    } catch (e: any) { setError(e.message || '生成失败') }
    finally { setLoading(false) }
  }

  return (
    <Layout>
      <SectionHeader title="Campaign 创意" subtitle="一次生成5个创意方向——从稳健到颠覆，找到你敢用的那个" icon={Megaphone} />
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-5 h-fit">
          <div className="space-y-4">
            <Field label="品牌 / 客户"><Input placeholder="如：某银行品牌" value={form.brand} onChange={set('brand')} /></Field>
            <Field label="Campaign 目标" required><Textarea rows={3} placeholder="如：双十一节点，提升品牌在25-35岁女性中的认知度..." value={form.goal} onChange={set('goal')} /></Field>
            <Field label="目标受众" required><Input placeholder="如：一线城市25-35岁职场女性" value={form.audience} onChange={set('audience')} /></Field>
            <Field label="预算级别">
              <select value={form.budget} onChange={set('budget')} className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent transition-colors">
                {['极小（<10万）', '小（10-50万）', '中等（50-200万）', '大（200-500万）', '旗舰级（>500万）'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
            <AnimatePresence>{error && <ErrorBanner message={error} onDismiss={() => setError('')} />}</AnimatePresence>
            <Btn onClick={run} loading={loading} className="w-full" size="lg" variant="spark">
              <Megaphone size={16} />{loading ? '生成5个创意中...' : '生成创意谱系'}
            </Btn>
          </div>
        </Card>
        <div className="lg:col-span-3 space-y-3">
          {loading && <div className="flex items-center justify-center py-20 text-slate-500 gap-3"><Spinner size={24} /><span>正在构建创意谱系...</span></div>}
          {!loading && results.length === 0 && <Empty icon={Megaphone} message="填写左侧信息，生成从稳健到颠覆的5个创意方向" />}
          {results.map((r, i) => {
            const cfg = RISK_CONFIG[r.riskLevel] || RISK_CONFIG['创新']
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="overflow-hidden">
                  <button className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors" onClick={() => setExpanded(expanded === i ? null : i)}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{cfg.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full border" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>{r.riskLevel}</span>
                          <h3 className="font-display font-semibold text-white text-sm">{r.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.bigIdea}</p>
                      </div>
                    </div>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform shrink-0 ${expanded === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                          <div className="rounded-xl p-3 border" style={{ background: cfg.bg, borderColor: cfg.border }}>
                            <p className="text-xs font-medium mb-1" style={{ color: cfg.color }}>Big Idea</p>
                            <p className="text-sm text-slate-200 font-medium">{r.bigIdea}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1.5">核心概念</p>
                            <p className="text-sm text-slate-400 leading-relaxed">{r.concept}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-1.5">执行形式：<span className="text-slate-400">{r.executionFormat}</span></p>
                            <ul className="space-y-1.5">
                              {r.executionSteps.map((s, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                                  <CheckCircle size={13} className="mt-0.5 shrink-0" style={{ color: cfg.color }} />{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-slate-500 mb-1 flex items-center gap-1"><Lightbulb size={11} />灵感来源</p>
                              <p className="text-slate-400">{r.inspirationSource}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">预估效果</p>
                              <p className="text-slate-400">{r.estimatedImpact}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Btn size="sm" variant="ghost" onClick={() => setScoring(i)}><BarChart2 size={13} />评估</Btn>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
      <AnimatePresence>
        {scoring !== null && results[scoring] && (
          <ScorePanel ideaTitle={results[scoring].title} concept={results[scoring].concept} brand={form.brand} onClose={() => setScoring(null)} />
        )}
      </AnimatePresence>
    </Layout>
  )
}

【2】新建 src/pages/CaseLibrary.tsx 内容为：
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Link, FileText, Tag, Trash2, X, Search, ExternalLink, ChevronDown } from 'lucide-react'
import { Layout, SectionHeader, Card, Field, Input, Textarea, Btn, ErrorBanner, Empty, Spinner } from '../components/UI'
import { extractCaseFromContent } from '../utils/prompts'
import { fetchURL } from '../utils/api'
import { useSparkStore, CaseItem } from '../store'

type Tab = 'url' | 'manual'

export default function CaseLibrary() {
  const { apiKey, caseLibrary, addCase, removeCase } = useSparkStore()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')

  const filtered = caseLibrary.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q) || c.tags.some(t => t.includes(q))
    const matchTag = !filterTag || c.tags.includes(filterTag)
    return matchSearch && matchTag
  })

  const allTags = Array.from(new Set(caseLibrary.flatMap(c => c.tags))).slice(0, 12)

  return (
    <Layout>
      <div className="flex items-start justify-between mb-8">
        <SectionHeader title="案例库" subtitle={`已收藏 ${caseLibrary.length} 个创意案例`} icon={BookOpen} />
        <Btn onClick={() => setShowAdd(true)} variant="spark" size="sm" className="mt-1"><Plus size={14} />添加案例</Btn>
      </div>
      {caseLibrary.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索品牌、标题、标签..."
              className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent transition-colors" />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(tag => (
                <button key={tag} onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${filterTag === tag ? 'bg-accent/20 text-accent-2 border-accent/30' : 'text-slate-500 border-border hover:border-slate-600 hover:text-slate-400'}`}>
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
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => <CaseCard key={c.id} item={c} onRemove={() => removeCase(c.id)} delay={i * 0.04} />)}
        </div>
      )}
      <AnimatePresence>{showAdd && <AddCaseModal onClose={() => setShowAdd(false)} apiKey={apiKey} onAdd={addCase} />}</AnimatePresence>
    </Layout>
  )
}

function CaseCard({ item, onRemove, delay }: { item: CaseItem; onRemove: () => void; delay?: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="p-4 h-fit">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-sm text-white line-clamp-2 mb-0.5">{item.title}</h3>
            <p className="text-xs text-slate-500 font-mono">{item.brand} · {item.industry}</p>
          </div>
          <button onClick={onRemove} className="text-slate-700 hover:text-red-400 transition-colors ml-2 shrink-0"><Trash2 size={13} /></button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{item.concept}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 4).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 bg-accent/8 text-accent-2/70 rounded border border-accent/10">{t}</span>
          ))}
        </div>
        <button className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors" onClick={() => setExpanded(!expanded)}>
          <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? '收起' : '查看详情'}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 pt-3 border-t border-border space-y-2">
                {item.highlights.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">亮点</p>
                    <ul className="space-y-1">
                      {item.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5"><span className="text-accent-2 mt-0.5">·</span>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.reusablePattern && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">可复用模式</p>
                    <p className="text-xs text-slate-400">{item.reusablePattern}</p>
                  </div>
                )}
                {item.sourceUrl && (
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent-2/60 hover:text-accent-2 transition-colors">
                    <ExternalLink size={11} />查看原文
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

function AddCaseModal({ onClose, apiKey, onAdd }: { onClose: () => void; apiKey: string; onAdd: (c: CaseItem) => void }) {
  const [tab, setTab] = useState<Tab>('url')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manual, setManual] = useState({ title: '', brand: '', industry: '', creativeType: '', platform: '', concept: '', reusablePattern: '', tags: '' })

  const setM = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setManual(m => ({ ...m, [k]: e.target.value }))

  const addFromUrl = async () => {
    if (!apiKey) { setError('请先设置 API Key'); return }
    if (!url) { setError('请输入链接'); return }
    setLoading(true); setError('')
    try {
      const content = await fetchURL(url)
      const extracted = await extractCaseFromContent(content, url, apiKey)
      onAdd({ ...extracted, id: Date.now().toString(), addedAt: new Date().toISOString() })
      onClose()
    } catch (e: any) { setError(e.message || '链接抓取失败，请手动填写') }
    finally { setLoading(false) }
  }

  const addManual = () => {
    if (!manual.title || !manual.brand) { setError('标题和品牌为必填项'); return }
    onAdd({ ...manual, id: Date.now().toString(), highlights: [], tags: manual.tags.split(/[,，、]/).map(t => t.trim()).filter(Boolean), addedAt: new Date().toISOString(), sourceUrl: '' })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-surface">
          <h3 className="font-display font-semibold">添加案例</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5">
          <div className="flex gap-1 bg-bg rounded-xl p-1 mb-5">
            {([['url', Link, 'URL 智能提炼'], ['manual', FileText, '手动填写']] as const).map(([t, Icon, label]) => (
              <button key={t} onClick={() => setTab(t as Tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg transition-all ${tab === t ? 'bg-surface text-slate-200 font-medium' : 'text-slate-500 hover:text-slate-400'}`}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
          <AnimatePresence>{error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError('')} /></div>}</AnimatePresence>
          {tab === 'url' ? (
            <div className="space-y-4">
              <Field label="文章链接" hint="支持微信公众号、微博、36氪、虎嗅等平台">
                <Input placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
              </Field>
              <Btn onClick={addFromUrl} loading={loading} className="w-full" variant="spark">
                {loading ? <><Spinner size={14} />智能提炼中...</> : <><Link size={14} />一键提炼</>}
              </Btn>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="案例标题" required><Input placeholder="标题" value={manual.title} onChange={setM('title')} /></Field>
                <Field label="品牌" required><Input placeholder="品牌名" value={manual.brand} onChange={setM('brand')} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="行业"><Input placeholder="行业" value={manual.industry} onChange={setM('industry')} /></Field>
                <Field label="平台"><Input placeholder="主要平台" value={manual.platform} onChange={setM('platform')} /></Field>
              </div>
              <Field label="核心概念"><Textarea rows={2} placeholder="创意概念..." value={manual.concept} onChange={setM('concept')} /></Field>
              <Field label="可复用模式"><Textarea rows={2} placeholder="底层逻辑..." value={manual.reusablePattern} onChange={setM('reusablePattern')} /></Field>
              <Field label="标签" hint="用逗号分隔"><Input placeholder="事件营销, 社会议题, Z世代" value={manual.tags} onChange={setM('tags')} /></Field>
              <Btn onClick={addManual} className="w-full" variant="spark"><Tag size={14} />添加到案例库</Btn>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

【3】替换 src/App.tsx 内容为：
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CrossIndustry from './pages/CrossIndustry'
import CoBranding from './pages/CoBranding'
import Campaign from './pages/Campaign'
import CaseLibrary from './pages/CaseLibrary'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cross" element={<CrossIndustry />} />
        <Route path="/cobrand" element={<CoBranding />} />
        <Route path="/campaign" element={<Campaign />} />
        <Route path="/cases" element={<CaseLibrary />} />
      </Routes>
    </BrowserRouter>
  )
}

【4】删除 src/App.css 文件（如果存在）

【5】在终端执行验证构建：
npm run build

如果构建成功（无报错），执行：
npm run dev

浏览器打开 http://localhost:5178 验证页面可正常显示。

完成后回复「完成，等待下一步」
```

---

## 附：雅典娜导航页更新

**构建成功后，在雅典娜导航项目的 `src/data/tools.ts` 中追加以下条目：**

```typescript
{
  id: 'APP-06',
  name: 'SPARK · 创意引擎',
  fullName: 'Strategic Playbook for Agile & Radical Kreative',
  description: '跨界碰撞 / 联名策划 / Campaign创意，AI 驱动的创意工作台。',
  icon: 'Zap',
  categoryId: 'content-creation',
  url: 'http://localhost:5178',
  isHot: true,
  status: 'online'
}
```

---

## 注意事项

| 项目 | 说明 |
|------|------|
| API Key | 首次使用点击右上角「API Key」输入 DeepSeek Key，保存在本地 localStorage |
| 端口 | SPARK 固定运行在 `localhost:5178`，不与其他工具冲突 |
| Jina CORS | 如果案例库 URL 提炼报错，是 CORS 问题。vite.config.ts 已配置 `/jina` 代理，但微信公众号链接仍可能失败，改用手动填写即可 |
| 构建失败 | 如果 `npm run build` 报错，先检查 node_modules 是否完整，重新执行 `npm install` |
