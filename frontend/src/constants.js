export const COLORS = [
  { label: '紫罗兰', value: 'violet', css: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 30%, #6366f1 100%)' },
  { label: '蜜桃粉', value: 'pink', css: 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 30%, #f472b6 100%)' },
  { label: '天空蓝', value: 'blue', css: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 30%, #38bdf8 100%)' },
  { label: '薄荷绿', value: 'green', css: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 30%, #4ade80 100%)' },
  { label: '暖橘', value: 'orange', css: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 30%, #fb923c 100%)' },
  { label: '暗夜', value: 'dark', css: 'linear-gradient(135deg, #94a3b8 0%, #64748b 30%, #475569 100%)' },
  { label: '日落', value: 'sunset', css: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 40%, #f472b6 100%)' },
  { label: '海洋', value: 'ocean', css: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #6366f1 100%)' },
  { label: '极光', value: 'aurora', css: 'linear-gradient(135deg, #34d399 0%, #818cf8 50%, #c084fc 100%)' },
  { label: '玫瑰金', value: 'rosegold', css: 'linear-gradient(135deg, #fda4af 0%, #fb7185 40%, #fbbf24 100%)' },
  { label: '银河', value: 'galaxy', css: 'linear-gradient(135deg, #6366f1 0%, #a855f7 40%, #ec4899 100%)' },
  { label: '森林', value: 'forest', css: 'linear-gradient(135deg, #86efac 0%, #22c55e 30%, #0d9488 100%)' },
  { label: '彩虹', value: 'rainbow', css: 'linear-gradient(135deg, #fca5a5 0%, #fde047 25%, #86efac 50%, #7dd3fc 75%, #c084fc 100%)' },
]

export const SHAPES = [
  { label: '团子', value: 'blob', radius: '50% 50% 50% 50% / 40% 40% 60% 60%' },
  { label: '猫猫', value: 'cat', radius: '50% 50% 50% 50% / 55% 55% 45% 45%' },
  { label: '圆圆', value: 'round', radius: '50%' },
  { label: '鸡蛋', value: 'egg', radius: '45% 45% 55% 55% / 55% 55% 45% 45%' },
  { label: '水滴', value: 'drop', radius: '50% 0 50% 50% / 30% 0 70% 70%' },
  { label: '软糖', value: 'soft', radius: '40% 60% 55% 45% / 55% 45% 50% 50%' },
  { label: '云朵', value: 'cloud', radius: '55% 55% 30% 30% / 65% 65% 35% 35%' },
  { label: '豆子', value: 'bean', radius: '60% 40% 50% 50% / 40% 40% 60% 60%' },
  { label: '方形', value: 'square', radius: '22%' },
  { label: '胶囊', value: 'pill', radius: '99px' },
]

export const SIZES = [
  { label: '小', value: 'sm', scale: 0.75 },
  { label: '中', value: 'md', scale: 1 },
  { label: '大', value: 'lg', scale: 1.35 },
]

export const LANGS = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
  { label: '日本語', value: 'ja-JP' },
  { label: '한국어', value: 'ko-KR' },
  { label: 'Français', value: 'fr-FR' },
  { label: 'Deutsch', value: 'de-DE' },
  { label: 'Español', value: 'es-ES' },
  { label: 'Italiano', value: 'it-IT' },
  { label: 'Português', value: 'pt-BR' },
  { label: 'Русский', value: 'ru-RU' },
]

export const PRESETS = [
  { label: '默认', prompt: '' },
  { label: '代码助手', prompt: '你是一个资深的编程专家，用简洁清晰的方式回答技术问题，给出可运行的代码示例。' },
  { label: '翻译官', prompt: '你是一个专业翻译，用户输入中文你翻译成英文，输入英文翻译成中文，只输出翻译结果。' },
  { label: '段子手', prompt: '你是一个幽默风趣的段子手，回答要轻松搞笑，多用梗和俏皮话。' },
  { label: '知识讲师', prompt: '你是一个耐心的老师，用通俗易懂的方式解释复杂概念，多用比喻和例子。' },
]

export const MASCOT_MESSAGES = [
  '你好呀！', '我在呢~', '有什么想问的吗？', '嘿嘿~', '戳我干嘛！', '❤', '✨', '今天天气真好~',
]

export function earColor(color) {
  if (color === 'pink') return '#f472b6'
  if (color === 'blue') return '#38bdf8'
  if (color === 'green') return '#4ade80'
  if (color === 'orange') return '#fb923c'
  if (color === 'dark') return '#64748b'
  return '#818cf8'
}

export function findByValue(arr, value, fallback) {
  return arr.find((x) => x.value === value) || arr[fallback]
}
