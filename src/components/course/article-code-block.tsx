import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import { alpha, type Theme } from '@mui/material/styles'
import { useMemo, useState, type FC } from 'react'
import { sanitizeArticleHtml } from '@/lib/article-content'
import { type CodeToken, type CodeTokenKind, highlightCode, languageLabels, resolveLanguage, splitHtmlCodeBlocks } from './article-code'

const codeFont = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

export const articleProseSx = (theme: Theme) => ({ lineHeight: 1.75, '& p, & div': { mb: 3, fontSize: '1.0625rem' }, '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 4.5, mb: 2, fontWeight: 700, letterSpacing: '-0.02em' }, '& blockquote': { m: '24px 0', p: { xs: 2, sm: 2.5 }, borderLeft: 4, borderColor: 'warning.main', borderRadius: 1.5, backgroundColor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.1), fontWeight: 600 }, '& ul, & ol': { pl: 3, mb: 3 }, '& li': { mb: 1 } })

const tokenColors: Record<CodeTokenKind, string> = {
  plain: '#e2e8f0',
  keyword: '#7dd3fc',
  string: '#fde68a',
  comment: '#64748b',
  number: '#fca5a5',
  preprocessor: '#f0abfc',
}

const TokenText: FC<{ token: CodeToken }> = ({ token }) => token.kind === 'plain'
  ? <>{token.text}</>
  : <Box component="span" sx={{ color: tokenColors[token.kind], fontStyle: token.kind === 'comment' ? 'italic' : 'normal' }}>{token.text}</Box>

export const ArticleCodeBlock: FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const resolvedLanguage = useMemo(() => resolveLanguage(language, code), [language, code])
  const lines = useMemo(() => highlightCode(code, resolvedLanguage), [code, resolvedLanguage])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    window.setTimeout(() => setCopyState('idle'), 2000)
  }

  return <Box component="figure" sx={{ m: '24px 0', minWidth: 0, maxWidth: '100%', borderRadius: 2.5, overflow: 'hidden', backgroundColor: '#0f172a', border: 1, borderColor: '#1e293b', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)' }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 0.5, backgroundColor: '#111c33', borderBottom: 1, borderColor: '#1e293b' }}>
      <Typography component="span" sx={{ color: '#94a3b8', fontFamily: codeFont, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{languageLabels[resolvedLanguage]}</Typography>
      <Button size="small" onClick={() => void copyCode()} startIcon={copyState === 'copied' ? <CheckOutlinedIcon /> : <ContentCopyOutlinedIcon />} sx={{ color: '#e2e8f0', textTransform: 'none', minWidth: 0 }}>
        {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy code'}
      </Button>
    </Stack>
    <Box sx={{ overflowX: 'auto', py: 1.5 }}>
      <Box sx={{ display: 'flex', minWidth: 'max-content', fontFamily: codeFont, fontSize: { xs: '0.8rem', md: '0.875rem' }, lineHeight: 1.7 }}>
        <Box aria-hidden sx={{ flexShrink: 0, px: 2, textAlign: 'right', color: '#475569', userSelect: 'none' }}>
          {lines.map((_, index) => <Box key={index} component="span" sx={{ display: 'block' }}>{index + 1}</Box>)}
        </Box>
        <Box component="code" sx={{ display: 'block', pr: 2, whiteSpace: 'pre', color: tokenColors.plain, fontFamily: 'inherit' }}>
          {lines.map((tokens, index) => <Box key={index} component="span" sx={{ display: 'block', minHeight: '1.7em' }}>
            {tokens.map((token, tokenIndex) => <TokenText key={tokenIndex} token={token} />)}
          </Box>)}
        </Box>
      </Box>
    </Box>
  </Box>
}

export const ArticleHtmlWithCode: FC<{ html: string }> = ({ html }) => {
  const segments = useMemo(() => splitHtmlCodeBlocks(sanitizeArticleHtml(html)), [html])
  return <>
    {segments.map((segment, index) => segment.type === 'html'
      ? <Box key={index} sx={articleProseSx} dangerouslySetInnerHTML={{ __html: segment.html }} />
      : <ArticleCodeBlock key={index} code={segment.code} language={segment.language} />)}
  </>
}
