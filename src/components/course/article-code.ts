export type ArticleTextSegment = { type: 'text'; text: string } | { type: 'code'; code: string; language: string }
export type ArticleHtmlSegment = { type: 'html'; html: string } | { type: 'code'; code: string; language: string }

export type CodeTokenKind = 'plain' | 'keyword' | 'string' | 'comment' | 'number' | 'preprocessor'
export type CodeToken = { text: string; kind: CodeTokenKind }

type LanguageConfig = {
  keywords: string
  lineComment?: string
  blockComments?: boolean
  preprocessor?: boolean
  quotes: string
  caseInsensitive?: boolean
}

type CompiledLanguage = { pattern: RegExp; keywords: Set<string>; config: LanguageConfig }

const cFamilyKeywords = 'alignas alignof auto bool break case catch char class const constexpr continue default delete do double else enum explicit export extern false final float for friend goto if inline int long mutable namespace new noexcept nullptr operator override private protected public register return short signed sizeof static struct switch template this throw true try typedef typename union unsigned using virtual void volatile while'
const javaScriptKeywords = 'async await break case catch class const continue debugger default delete do else export extends false finally for function if import in instanceof let new null return super switch this throw true try typeof undefined var void while yield'
const typeScriptKeywords = `${javaScriptKeywords} as implements interface type enum private public protected readonly namespace declare any never unknown string number boolean`
const javaKeywords = 'abstract boolean break byte case catch char class const continue default do double else enum extends false final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws true try void volatile while var'
const cSharpKeywords = 'abstract as base bool break byte case catch char class const continue decimal default delegate do double else enum event explicit false finally float for foreach if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed short sizeof static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using var virtual void volatile while async await'
const pythonKeywords = 'and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield'
const sqlKeywords = 'select from where insert into update delete create table drop alter join left right inner outer on group by order having limit values set and or not null primary key foreign references as distinct union'
const bashKeywords = 'if then else elif fi for while do done case esac function return echo export local in'

const languageConfigs = new Map<string, LanguageConfig>([
  ['cpp', { keywords: cFamilyKeywords, lineComment: '//', blockComments: true, preprocessor: true, quotes: `"'` }],
  ['c', { keywords: cFamilyKeywords, lineComment: '//', blockComments: true, preprocessor: true, quotes: `"'` }],
  ['csharp', { keywords: cSharpKeywords, lineComment: '//', blockComments: true, quotes: `"'` }],
  ['java', { keywords: javaKeywords, lineComment: '//', blockComments: true, quotes: `"'` }],
  ['javascript', { keywords: javaScriptKeywords, lineComment: '//', blockComments: true, quotes: `"'\`` }],
  ['typescript', { keywords: typeScriptKeywords, lineComment: '//', blockComments: true, quotes: `"'\`` }],
  ['python', { keywords: pythonKeywords, lineComment: '#', quotes: `"'` }],
  ['sql', { keywords: sqlKeywords, lineComment: '--', quotes: `"'`, caseInsensitive: true }],
  ['bash', { keywords: bashKeywords, lineComment: '#', quotes: `"'` }],
])

export const languageLabels: Record<string, string> = {
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  java: 'Java',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  sql: 'SQL',
  bash: 'Bash',
  text: 'Code',
}

const languageAliases = new Map<string, string>([
  ['c++', 'cpp'], ['cpp', 'cpp'], ['cxx', 'cpp'], ['cc', 'cpp'],
  ['c', 'c'], ['h', 'c'],
  ['c#', 'csharp'], ['cs', 'csharp'], ['csharp', 'csharp'],
  ['java', 'java'],
  ['js', 'javascript'], ['javascript', 'javascript'], ['jsx', 'javascript'],
  ['ts', 'typescript'], ['typescript', 'typescript'], ['tsx', 'typescript'],
  ['py', 'python'], ['python', 'python'],
  ['sql', 'sql'],
  ['sh', 'bash'], ['bash', 'bash'], ['shell', 'bash'], ['zsh', 'bash'],
])

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const compileLanguage = (config: LanguageConfig): CompiledLanguage => {
  const alternatives = [
    config.lineComment ? `${escapeRegExp(config.lineComment)}[^\\n]*` : '',
    config.blockComments ? '\\/\\*[\\s\\S]*?\\*\\/' : '',
    ...config.quotes.split('').map((quote) => `${quote}(?:\\\\[\\s\\S]|[^${quote}\\\\\\n])*${quote}`),
    '\\b0x[\\da-fA-F]+\\b|\\b\\d+(?:\\.\\d+)?\\b',
    config.preprocessor ? '#[A-Za-z_]\\w*' : '',
    '[A-Za-z_]\\w*',
  ].filter(Boolean)
  return { pattern: new RegExp(alternatives.join('|'), 'g'), keywords: new Set(config.keywords.split(' ')), config }
}

const compiledLanguages = new Map([...languageConfigs].map(([name, config]) => [name, compileLanguage(config)]))

const classifyToken = (text: string, { config, keywords }: CompiledLanguage): CodeTokenKind => {
  if ((config.lineComment && text.startsWith(config.lineComment)) || (config.blockComments && text.startsWith('/*'))) return 'comment'
  if (config.quotes.includes(text[0])) return 'string'
  if (config.preprocessor && text.startsWith('#')) return 'preprocessor'
  if (/^\d/.test(text)) return 'number'
  if (/^[A-Za-z_]/.test(text) && keywords.has(config.caseInsensitive ? text.toLowerCase() : text)) return 'keyword'
  return 'plain'
}

export const highlightCode = (code: string, language: string): CodeToken[][] => {
  const compiled = compiledLanguages.get(language)
  const tokens: CodeToken[] = []
  let cursor = 0
  if (compiled) {
    for (const match of code.matchAll(compiled.pattern)) {
      const start = match.index ?? 0
      if (start > cursor) tokens.push({ text: code.slice(cursor, start), kind: 'plain' })
      tokens.push({ text: match[0], kind: classifyToken(match[0], compiled) })
      cursor = start + match[0].length
    }
  }
  if (cursor < code.length) tokens.push({ text: code.slice(cursor), kind: 'plain' })

  const lines: CodeToken[][] = [[]]
  for (const token of tokens) {
    token.text.split('\n').forEach((part, partIndex) => {
      if (partIndex > 0) lines.push([])
      if (part) lines[lines.length - 1].push({ text: part, kind: token.kind })
    })
  }
  return lines
}

export const normalizeLanguage = (value: string) => languageAliases.get(value.trim().toLowerCase()) ?? ''

const detectLanguage = (code: string) => {
  if (/#include\s*[<"]|std::|\bcout\b/.test(code)) return 'cpp'
  if (/\busing System\b|\bConsole\.Write/.test(code)) return 'csharp'
  if (/\bSystem\.out\.|\bpublic\s+(?:static\s+)?(?:class|void)\b/.test(code)) return 'java'
  if (/^\s*(?:def |from \S+ import |import \w+$)|^\s*class \w+(?:\(.*\))?:\s*$|\bprint\(/m.test(code)) return 'python'
  if (/\bSELECT\b[\s\S]*\bFROM\b/i.test(code)) return 'sql'
  if (/\bconsole\.log\b|\bconst\s|\blet\s|=>|\bfunction\b/.test(code)) return 'javascript'
  if (/^\s*(?:echo|export|fi|done)\b|^#!\/bin\/(?:ba)?sh/m.test(code)) return 'bash'
  return ''
}

export const resolveLanguage = (explicit: string, code: string) => normalizeLanguage(explicit) || detectLanguage(code) || 'text'

const isClosingFence = (line: string, fence: string) => {
  const match = line.match(/^\s*(`{3,}|~{3,})\s*$/)
  return Boolean(match && match[1][0] === fence[0] && match[1].length >= fence.length)
}

export const splitCodeFences = (text: string): ArticleTextSegment[] => {
  const lines = text.split('\n')
  const segments: ArticleTextSegment[] = []
  let prose: string[] = []
  const flushProse = () => {
    const value = prose.join('\n')
    if (value.trim()) segments.push({ type: 'text', text: value })
    prose = []
  }
  for (let index = 0; index < lines.length; index += 1) {
    const open = lines[index].match(/^\s*(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/)
    const closeIndex = open ? lines.findIndex((line, lineIndex) => lineIndex > index && isClosingFence(line, open[1])) : -1
    if (open && closeIndex !== -1) {
      flushProse()
      segments.push({ type: 'code', code: lines.slice(index + 1, closeIndex).join('\n'), language: open[2] })
      index = closeIndex
    } else {
      prose.push(lines[index])
    }
  }
  flushProse()
  return segments.length ? segments : [{ type: 'text', text }]
}

const openingFenceMarker = (line: string) => line.match(/^\s*(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/)?.[1] ?? null

export const nextOpenFence = (line: string, open: string | null) => {
  if (open) return isClosingFence(line, open) ? null : open
  return openingFenceMarker(line)
}

export const hasUnclosedCode = (text: string) => {
  const openFence = text.split('\n').reduce<string | null>((open, line) => nextOpenFence(line, open), null)
  const preOpens = text.match(/<pre\b/gi)?.length ?? 0
  const preCloses = text.match(/<\/pre>/gi)?.length ?? 0
  return openFence !== null || preOpens > preCloses
}

export const joinUnclosedSections = (sections: string[]) => {
  const joined: string[] = []
  let pending: string | null = null
  for (const section of sections) {
    pending = pending === null ? section : `${pending}\n${section}`
    if (!hasUnclosedCode(pending)) {
      joined.push(pending)
      pending = null
    }
  }
  if (pending !== null) joined.push(pending)
  return joined
}

const readCodeText = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (!(node instanceof Element)) return ''
  if (node.tagName === 'BR') return '\n'
  const inner = Array.from(node.childNodes).map(readCodeText).join('')
  if ((node.tagName === 'DIV' || node.tagName === 'P') && inner && !inner.endsWith('\n')) return `${inner}\n`
  return inner
}

export const splitHtmlCodeBlocks = (html: string): ArticleHtmlSegment[] => {
  const template = document.createElement('template')
  template.innerHTML = html
  const segments: ArticleHtmlSegment[] = []
  const splitNodes = (nodes: ChildNode[], wrapper: Element | null) => {
    const createBuffer = () => (wrapper ? wrapper.cloneNode(false) as Element : document.createElement('div'))
    let htmlBuffer = createBuffer()
    const flushHtml = () => {
      if (!htmlBuffer.childNodes.length) return
      segments.push({ type: 'html', html: wrapper ? htmlBuffer.outerHTML : htmlBuffer.innerHTML })
      htmlBuffer = createBuffer()
    }
    nodes.forEach((node) => {
      if (node instanceof Element && node.tagName === 'PRE') {
        flushHtml()
        const language = node.querySelector('code')?.className.match(/language-([\w+#-]+)/)?.[1] ?? ''
        segments.push({ type: 'code', code: readCodeText(node).replace(/\n$/, ''), language })
        return
      }
      if (node instanceof Element && node.querySelector('pre')) {
        flushHtml()
        splitNodes(Array.from(node.childNodes), node)
        return
      }
      htmlBuffer.appendChild(node)
    })
    flushHtml()
  }
  splitNodes(Array.from(template.content.childNodes), null)
  return segments
}
