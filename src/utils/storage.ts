export const saveState = (key: string, data: any) => {
  try {
    localStorage.setItem(`spark_state_${key}`, JSON.stringify({
      data,
      savedAt: new Date().toISOString()
    }))
    return true
  } catch { return false }
}

export const loadState = (key: string) => {
  try {
    const raw = localStorage.getItem(`spark_state_${key}`)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

export const formatSavedTime = (isoString: string) => {
  const d = new Date(isoString)
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
}