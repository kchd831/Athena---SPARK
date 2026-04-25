import { useEffect, useState } from 'react'
import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle2,
  ChevronDown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSparkStore } from '../store'

import type { ModelProvider } from '../store'

import { loadState, saveState, formatSavedTime } from '../utils/storage'

export const GlobalLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#07070f', color: '#94a3b8' }}>
      {children}
    </div>
  )
}

export const Navbar = ({ showBack = false }: { showBack?: boolean }) => {
  const [showKey, setShowKey] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl border-b h-14" style={{ backgroundColor: 'rgba(7, 7, 15, 0.85)', borderColor: 'rgba(124, 110, 245, 0.12)' }}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {showBack ? (
              <button
                onClick={() => navigate('/')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                  gap: '1px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(124,110,245,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(124,110,245,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3, letterSpacing: '0.05em' }}>返回</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3, letterSpacing: '0.05em' }}>主页</span>
              </button>
            ) : (
              <button
                onClick={() => window.location.href = 'http://localhost:5173'}
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
            )}
          </div>
          
          <div style={{ flex: 1 }} />
          
          <div className="flex items-center justify-end gap-3 flex-1">
            <ModelSelector />
          </div>
        </div>
      </header>
      <AnimatePresence>
        {showKey && <ApiKeyModal onClose={() => setShowKey(false)} />}
      </AnimatePresence>
    </>
  )
}

const ModelSelector = () => {
  const { model, setModel, apiKey, qwenApiKey, setApiKey, setQwenApiKey } = useSparkStore()
  const [open, setOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ModelProvider | null>(null)
  const [keyVal, setKeyVal] = useState('')

  const models: { id: ModelProvider, label: string, icon: string, color: string }[] = [
    { id: 'deepseek', label: 'DeepSeek', icon: '⚡', color: '#10b981' }, // 蓝绿
    { id: 'qwen', label: '通义千问', icon: '◈', color: '#f97316' } // 橙
  ]

  const current = models.find(m => m.id === model) || models[0]

  return (
    <div className="relative">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        backgroundColor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#e2e8f0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{ color: current.color }}>{current.icon}</span>
          <span>{current.label}</span>
          <ChevronDown size={12} style={{ color: '#64748b' }} />
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        <button
          onClick={() => { setOpen(false); setEditingKey(editingKey ? null : model) }}
          title="API Key 设置"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 rounded-xl py-2 z-50 shadow-2xl"
              style={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(124, 110, 245, 0.2)' }}
            >
              {models.map(m => (
                <div key={m.id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 4px',
                    }}
                  >
                    <button
                      onClick={() => { setModel(m.id); setOpen(false); setEditingKey(null) }}
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        padding: '8px 10px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: model === m.id ? 'white' : '#94a3b8',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        position: 'relative',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(124,110,245,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {model === m.id && (
                        <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '2px', backgroundColor: '#7c6ef5', borderRadius: '2px' }} />
                      )}
                      <span style={{ color: m.color }}>{m.icon}</span>
                      {m.label}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (editingKey === m.id) {
                          setEditingKey(null)
                        } else {
                          setEditingKey(m.id)
                          setKeyVal(m.id === 'deepseek' ? apiKey : qwenApiKey)
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        color: editingKey === m.id ? '#a78bfa' : '#475569',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'color 0.15s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                      onMouseLeave={e => e.currentTarget.style.color = editingKey === m.id ? '#a78bfa' : '#475569'}
                    >
                      {editingKey === m.id ? '收起' : 'Key'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {editingKey === m.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ overflow: 'hidden', padding: '0 8px 8px' }}
                      >
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="password"
                            value={keyVal}
                            onChange={e => setKeyVal(e.target.value)}
                            placeholder="sk-..."
                            onClick={e => e.stopPropagation()}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: 'white',
                              fontSize: '12px',
                              outline: 'none',
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,110,245,0.5)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              if (m.id === 'deepseek') setApiKey(keyVal.trim())
                              else setQwenApiKey(keyVal.trim())
                              setEditingKey(null)
                              setOpen(false)
                            }}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(124,110,245,0.2)',
                              border: '1px solid rgba(124,110,245,0.3)',
                              color: '#a78bfa',
                              fontSize: '12px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            保存
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export const ApiKeyModal = ({ onClose }: { onClose: () => void }) => {
  const { apiKey, qwenApiKey, setApiKey, setQwenApiKey } = useSparkStore()
  const [valDs, setValDs] = useState(apiKey)
  const [valQw, setValQw] = useState(qwenApiKey)
  const [saved, setSaved] = useState(false)
  const [showDs, setShowDs] = useState(false)
  const [showQw, setShowQw] = useState(false)

  const save = () => {
    setApiKey(valDs.trim())
    setQwenApiKey(valQw.trim())
    setSaved(true)
    setTimeout(onClose, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="rounded-2xl p-6 w-full max-w-md shadow-2xl"
        style={{ backgroundColor: '#0f0f1a', border: '1px solid rgba(124, 110, 245, 0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-white">
            API 配置
          </h3>
          <button
            onClick={onClose}
            className="transition-colors hover:text-white"
            style={{ color: '#64748b' }}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: '#e2e8f0' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
              DeepSeek API Key
            </label>
            <div className="relative">
              <Input
                type={showDs ? "text" : "password"}
                value={valDs}
                onChange={(e) => setValDs(e.target.value)}
                placeholder="sk-..."
                className="pr-16"
              />
              <button 
                onClick={() => setShowDs(!showDs)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                {showDs ? '隐藏' : '显示'}
              </button>
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: '#e2e8f0' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f97316' }} />
              通义千问 API Key
            </label>
            <div className="relative">
              <Input
                type={showQw ? "text" : "password"}
                value={valQw}
                onChange={(e) => setValQw(e.target.value)}
                placeholder="sk-..."
                onKeyDown={(e) => e.key === 'Enter' && save()}
                className="pr-16"
              />
              <button 
                onClick={() => setShowQw(!showQw)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                {showQw ? '隐藏' : '显示'}
              </button>
            </div>
          </div>
        </div>

        <Btn onClick={save} variant="spark" className="w-full">
          {saved ? (
            <>
              <CheckCircle2 size={16} />
              已保存
            </>
          ) : (
            '保存配置'
          )}
        </Btn>
      </motion.div>
    </motion.div>
  )
}

export const Card = ({
  className = '',
  children,
  hover = false,
}: {
  className?: string
  children: ReactNode
  hover?: boolean
}) => {
  const [hovered, setHovered] = useState(false)
  const base: CSSProperties = {
    backgroundColor: hovered && hover ? '#141428' : '#0f0f1a',
    border: `1px solid ${hovered && hover ? 'rgba(124,110,245,0.35)' : 'rgba(124,110,245,0.15)'}`,
    borderRadius: '16px',
    transition: 'all 0.2s',
  }
  return (
    <div
      style={base}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  )
}

export const SectionHeader = ({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string
  subtitle: string
  icon: any
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '1rem',
      paddingBottom: '1.5rem',
      borderBottom: '1px solid rgba(124,110,245,0.1)',
    }}
  >
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(124,110,245,0.2), rgba(167,139,250,0.1))',
        border: '1px solid rgba(124,110,245,0.3)',
      }}
    >
      <Icon size={20} style={{ color: '#a78bfa' }} />
    </div>
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
        {title}
      </h1>
      <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{subtitle}</p>
    </div>
  </div>
)

export const Layout = ({
  children,
  title,
  subtitle,
  icon,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: any
}) => (
  <GlobalLayout>
    <Navbar showBack={true} />
    <main style={{ marginTop: '56px', flex: 1 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1.5rem' }}>
        {icon && title && subtitle && (
          <SectionHeader title={title} subtitle={subtitle} icon={icon} />
        )}
        {children}
      </div>
    </main>
  </GlobalLayout>
)

export const Field = ({
  label,
  required,
  children,
  hint,
}: {
  label: string
  required?: boolean
  children: ReactNode
  hint?: string
}) => (
  <div className="mb-4 relative z-10">
    <label className="block text-sm font-medium mb-1.5 text-slate-300">
      {label}
      {required && <span className="ml-1" style={{ color: '#a78bfa' }}>*</span>}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
  </div>
)

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-xl px-4 py-2.5 transition-all focus:outline-none focus:ring-1 ${props.className || ''}`}
    style={{ 
      backgroundColor: 'rgba(255,255,255,0.04)', 
      border: '1px solid rgba(255,255,255,0.08)',
      color: 'white',
      ...(props.style || {})
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = 'rgba(124, 110, 245, 0.6)'
      e.currentTarget.style.boxShadow = '0 0 0 1px rgba(124, 110, 245, 0.3)'
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
      e.currentTarget.style.boxShadow = 'none'
    }}
  />
)

export const Textarea = (
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) => (
  <textarea
    {...props}
    className={`w-full rounded-xl px-4 py-2.5 transition-all resize-none focus:outline-none focus:ring-1 ${props.className || ''}`}
    style={{ 
      backgroundColor: 'rgba(255,255,255,0.04)', 
      border: '1px solid rgba(255,255,255,0.08)',
      color: 'white',
      minHeight: props.rows ? `${props.rows * 1.5 + 2}rem` : 'auto',
      ...(props.style || {})
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = 'rgba(124, 110, 245, 0.6)'
      e.currentTarget.style.boxShadow = '0 0 0 1px rgba(124, 110, 245, 0.3)'
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
      e.currentTarget.style.boxShadow = 'none'
    }}
  />
)

export const Btn = ({
  onClick,
  disabled,
  loading,
  variant = 'spark',
  size = 'md',
  children,
  className = '',
  style = {},
  type = 'button',
}: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  loading?: boolean
  variant?: 'spark' | 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
  style?: CSSProperties
  type?: 'button' | 'submit'
}) => {
  const isGhost = variant === 'ghost'
  const isDanger = variant === 'danger'
  
  let padding = 'py-2.5 px-5 text-sm rounded-lg'
  if (size === 'lg') padding = 'py-3 px-6 text-base rounded-xl'
  if (size === 'sm') padding = 'py-1.5 px-3 text-xs rounded-lg'
  
  let baseStyle: CSSProperties = {}
  
  if (isGhost) {
    baseStyle = {
      backgroundColor: 'transparent',
      border: '1px solid rgba(124, 110, 245, 0.3)',
      color: '#a78bfa'
    }
  } else if (isDanger) {
    baseStyle = {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#fca5a5'
    }
  } else {
    baseStyle = {
      background: 'linear-gradient(135deg, #7c6ef5, #6d28d9)',
      border: 'none',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(124, 110, 245, 0.25)'
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${padding} ${className}`}
      style={{ ...baseStyle, ...style }}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        if (isGhost) {
          e.currentTarget.style.backgroundColor = 'rgba(124, 110, 245, 0.1)'
        } else if (isDanger) {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'
        } else {
          e.currentTarget.style.opacity = '0.9'
        }
      }}
      onMouseLeave={(e) => {
        if (disabled || loading) return;
        if (isGhost || isDanger) {
          e.currentTarget.style.backgroundColor = (style.backgroundColor as string) || (baseStyle.backgroundColor as string)
        } else {
          e.currentTarget.style.opacity = '1'
        }
      }}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  )
}

export const Spinner = ({ size = 20 }: { size?: number }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    style={{ color: '#a78bfa' }}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" />
    <path className="opacity-75" d="M4 12a8 8 0 018-8" />
  </svg>
)

export const Empty = ({ icon: Icon, message }: { icon: any; message: string }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <Icon size={48} className="mb-4 text-slate-700" />
    <p className="text-slate-600 font-medium">{message}</p>
  </div>
)

export const ErrorBanner = ({
  message,
  onDismiss,
}: {
  message: string
  onDismiss: () => void
}) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3 rounded-xl px-4 py-3 text-red-400 mb-4"
      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
    >
      <span className="mt-0.5">❌</span>
      <span className="flex-1 text-sm">{message}</span>
      <button
        onClick={onDismiss}
        className="mt-0.5 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </motion.div>
  </AnimatePresence>
)

export const ResultToolbar = ({
  onExportZh,
  onExportEn,
  onCopy,
}: {
  onExportZh: () => void
  onExportEn: () => void
  onCopy: () => void
}) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.25rem',
      marginTop: '0.5rem',
      backgroundColor: '#0f0f1a',
      border: '1px solid rgba(124,110,245,0.15)',
      borderRadius: '16px',
    }}>
      <span style={{ fontSize: '12px', color: '#64748b', marginRight: '0.25rem' }}>导出 / 复制</span>
      <Btn size="sm" variant="ghost" onClick={onExportZh}>
        📄 Word 中文
      </Btn>
      <Btn size="sm" variant="ghost" onClick={onExportEn}>
        📄 Word EN
      </Btn>
      <Btn size="sm" variant="ghost" onClick={handleCopy}>
        {copied ? '✓ 已复制' : '📋 复制全文'}
      </Btn>
    </div>
  )
}

export const SaveButton = ({ pageKey, data }: { pageKey: string, data: any }) => {
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [savedTime, setSavedTime] = useState('')

  useEffect(() => {
    const stored = loadState(pageKey)
    if (stored?.savedAt) setSavedTime(formatSavedTime(stored.savedAt))
  }, [pageKey])

  const handleSave = () => {
    const ok = saveState(pageKey, data)
    if (ok) {
      const now = new Date().toISOString()
      setSavedTime(formatSavedTime(now))
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } else {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  const handleReset = () => {
    if (confirm('确定要重置当前页面的运行状态和数据吗？')) {
      localStorage.removeItem(`spark_state_${pageKey}`)
      window.location.reload()
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '1.5rem',
      padding: '10px 16px',
      backgroundColor: 'rgba(124,110,245,0.06)',
      border: '1px solid rgba(124,110,245,0.15)',
      borderRadius: '12px',
    }}>
      <button
        onClick={handleSave}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: status === 'saved' ? '#10b981' : '#a78bfa',
          backgroundColor: status === 'saved' ? 'rgba(16,185,129,0.1)' : 'rgba(124,110,245,0.1)',
          border: `1px solid ${status === 'saved' ? 'rgba(16,185,129,0.3)' : 'rgba(124,110,245,0.25)'}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {status === 'saved' ? '✓ 已保存' : status === 'error' ? '✗ 保存失败' : '💾 保存运行状态'}
      </button>
      {savedTime && status === 'idle' && (
        <span style={{ fontSize: '12px', color: '#475569' }}>
          上次保存：{savedTime}
        </span>
      )}
      <button
        onClick={handleReset}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#ef4444',
          backgroundColor: 'transparent',
          border: '1px solid rgba(239,68,68,0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginLeft: 'auto'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        🔄 重置
      </button>
    </div>
  )
}
