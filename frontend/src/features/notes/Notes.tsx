import { useState, useEffect, useRef } from 'react'
import {
  useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer,
  type Editor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import ImageExt from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import LinkExt from '@tiptap/extension-link'
import { useNotesStore } from '../../store/notesStore'
import { I } from '../../components/ui/Icon'

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim()
}

function toEditorContent(body: string): string {
  if (!body) return ''
  if (body.trimStart().startsWith('<')) return body
  return body.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')
}

// ---- Resizable image node ----
interface ImgAttrs { src: string; width?: number; alt?: string }
interface ImgViewProps {
  node: { attrs: ImgAttrs }
  updateAttributes: (attrs: Partial<ImgAttrs>) => void
  selected: boolean
}

function ImageResizeView({ node, updateAttributes, selected }: ImgViewProps) {
  const imgRef = useRef<HTMLImageElement>(null)

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = node.attrs.width || imgRef.current?.offsetWidth || 400
    const move = (ev: MouseEvent) => {
      updateAttributes({ width: Math.max(80, startW + ev.clientX - startX) })
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return (
    <NodeViewWrapper className="img-node">
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        style={{
          width: node.attrs.width ? `${node.attrs.width}px` : 'auto',
          maxWidth: '100%', display: 'block', borderRadius: 8,
          outline: selected ? '2.5px solid var(--blue)' : 'none',
          outlineOffset: 2,
        }}
        draggable={false}
      />
      {selected && <div className="img-resize-handle" onMouseDown={startDrag} />}
    </NodeViewWrapper>
  )
}

const ResizableImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attrs) => attrs.width ? { width: attrs.width } : {},
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeView)
  },
}).configure({ allowBase64: true })

// ---- Toolbar button ----
type BtnProps = { active: boolean; onAction: () => void; title: string; children: React.ReactNode }
function TBBtn({ active, onAction, title, children }: BtnProps) {
  return (
    <button
      type="button"
      className={`tb-btn${active ? ' on' : ''}`}
      onMouseDown={e => { e.preventDefault(); onAction() }}
      title={title}
    >
      {children}
    </button>
  )
}

// ---- Toolbar ----
function Toolbar({ editor, onLinkClick }: { editor: Editor | null; onLinkClick: () => void }) {
  const imgRef = useRef<HTMLInputElement>(null)
  if (!editor) return null

  const heading = editor.isActive('heading', { level: 1 }) ? '1'
    : editor.isActive('heading', { level: 2 }) ? '2'
    : editor.isActive('heading', { level: 3 }) ? '3'
    : '0'

  const handleHeading = (val: string) => {
    if (val === '0') editor.chain().focus().setParagraph().run()
    else editor.chain().focus().setHeading({ level: parseInt(val) as 1 | 2 | 3 }).run()
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => editor.chain().focus().setImage({ src: reader.result as string }).run()
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="note-toolbar">
      {/* Heading type — no onMouseDown so dropdown opens normally */}
      <select className="tb-select" value={heading} onChange={e => handleHeading(e.target.value)}>
        <option value="0">Body</option>
        <option value="1">Title</option>
        <option value="2">Heading</option>
        <option value="3">Subheading</option>
      </select>
      <div className="tb-sep" />

      <TBBtn active={editor.isActive('bold')} onAction={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 0 8H6z"/><path d="M6 12h9a4 4 0 0 1 0 8H6z"/>
        </svg>
      </TBBtn>
      <TBBtn active={editor.isActive('italic')} onAction={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
        </svg>
      </TBBtn>
      <TBBtn active={editor.isActive('underline')} onAction={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/>
        </svg>
      </TBBtn>
      <TBBtn active={editor.isActive('strike')} onAction={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4H9a3 3 0 0 0-2.83 4M8 20h8a3 3 0 0 0 0-6H4"/><line x1="4" y1="12" x2="20" y2="12"/>
        </svg>
      </TBBtn>
      <div className="tb-sep" />

      <TBBtn active={editor.isActive('bulletList')} onAction={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
          <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      </TBBtn>
      <TBBtn active={editor.isActive('orderedList')} onAction={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
          <path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
        </svg>
      </TBBtn>
      <TBBtn active={editor.isActive('taskList')} onAction={() => editor.chain().focus().toggleTaskList().run()} title="Checklist">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="6" height="6" rx="1"/><path d="M5 8l1.5 1.5 2.5-3"/>
          <line x1="13" y1="8" x2="21" y2="8"/>
          <rect x="3" y="13" width="6" height="6" rx="1"/>
          <line x1="13" y1="16" x2="21" y2="16"/>
        </svg>
      </TBBtn>
      <div className="tb-sep" />

      <TBBtn active={editor.isActive('blockquote')} onAction={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M4.58 5.5A1.5 1.5 0 0 0 3 7v4a1.5 1.5 0 0 0 1.5 1.5H7v1A3.5 3.5 0 0 1 3.5 17v.5a.5.5 0 0 0 .5.5h1a4.5 4.5 0 0 0 4.5-4.5V7a1.5 1.5 0 0 0-1.5-1.5H4.58zm10 0A1.5 1.5 0 0 0 13 7v4a1.5 1.5 0 0 0 1.5 1.5H17v1A3.5 3.5 0 0 1 13.5 17v.5a.5.5 0 0 0 .5.5h1a4.5 4.5 0 0 0 4.5-4.5V7a1.5 1.5 0 0 0-1.5-1.5h-3.42z" opacity="0.75"/>
        </svg>
      </TBBtn>
      <TBBtn active={editor.isActive('codeBlock')} onAction={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      </TBBtn>
      <div className="tb-sep" />

      <TBBtn active={editor.isActive({ textAlign: 'left' })} onAction={() => editor.chain().focus().setTextAlign('left').run()} title="Align left">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
        </svg>
      </TBBtn>
      <TBBtn active={editor.isActive({ textAlign: 'center' })} onAction={() => editor.chain().focus().setTextAlign('center').run()} title="Align center">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
      </TBBtn>
      <TBBtn active={editor.isActive({ textAlign: 'right' })} onAction={() => editor.chain().focus().setTextAlign('right').run()} title="Align right">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
        </svg>
      </TBBtn>
      <div className="tb-sep" />

      <TBBtn active={editor.isActive('link')} onAction={onLinkClick} title="Insert / edit link">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </TBBtn>
      <TBBtn active={false} onAction={() => imgRef.current?.click()} title="Insert image (or paste)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </TBBtn>
      <TBBtn active={false} onAction={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="12" x2="21" y2="12"/>
        </svg>
      </TBBtn>

      <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
    </div>
  )
}

// ---- Main component ----
export function Notes() {
  const { notes, updateNote, newNote, deleteNote, fetchNotes } = useNotesStore()
  const [selId, setSelId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [linkModal, setLinkModal] = useState<{ url: string } | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const switching = useRef(false)
  const editorRef = useRef<Editor | null>(null)

  useEffect(() => { fetchNotes() }, [])
  useEffect(() => {
    if (!selId && notes.length > 0) setSelId(notes[0].id)
  }, [notes, selId])

  const sel = notes.find(n => n.id === selId)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      ResizableImage,
      Placeholder.configure({
        showOnlyCurrent: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        placeholder: ({ node }: any) =>
          node.type.name === 'heading' && node.attrs.level === 1
            ? 'Note title…'
            : 'Start writing…',
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      LinkExt.configure({ openOnClick: false }),
    ],
    content: toEditorContent(sel?.body || ''),
    editorProps: {
      handlePaste(_view, event) {
        const items = Array.from(event.clipboardData?.items || [])
        const img = items.find(i => i.type.startsWith('image/'))
        if (img) {
          const file = img.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = e => {
              editorRef.current?.chain().focus()
                .setImage({ src: e.target?.result as string })
                .run()
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (!sel || switching.current) return
      if (debounce.current) clearTimeout(debounce.current)
      debounce.current = setTimeout(() => updateNote(sel.id, ed.getHTML()), 600)
    },
  })

  useEffect(() => { editorRef.current = editor }, [editor])

  useEffect(() => {
    if (!editor) return
    switching.current = true
    editor.commands.setContent(toEditorContent(sel?.body || ''), false)
    switching.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId, editor])

  const handleNew = async () => {
    const id = await newNote()
    setSelId(id)
  }

  const handleDelete = (id: string) => {
    const rest = notes.filter(n => n.id !== id)
    if (id === selId) setSelId(rest[0]?.id || null)
    deleteNote(id)
  }

  const handleLinkConfirm = (url: string) => {
    if (!editor) return
    if (!url) editor.chain().focus().unsetLink().run()
    else editor.chain().focus().setLink({ href: url }).run()
    setLinkModal(null)
  }

  const openLinkModal = () => {
    if (!editor) return
    setLinkModal({ url: editor.getAttributes('link').href as string || '' })
  }

  const relTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60_000) return 'just now'
    if (diff < 3600_000) return Math.floor(diff / 60_000) + 'm ago'
    if (diff < 86400_000) return Math.floor(diff / 3600_000) + 'h ago'
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filtered = notes.filter(n =>
    !q ||
    n.title.toLowerCase().includes(q.toLowerCase()) ||
    stripHtml(n.body).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="content no-pad" style={{ padding: 0 }}>
      <div className="notes-shell">
        <aside className="notes-left">
          <button className="btn primary" onClick={handleNew} style={{ justifyContent: 'center' }}>
            <I.Plus size={14} /> New note
          </button>
          <div className="search-box" style={{ width: '100%' }}>
            <I.Search size={13} />
            <input placeholder="Search notes…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="notes-list">
            {filtered.length === 0 && (
              <div className="empty" style={{ padding: '30px 16px' }}>
                <I.Note size={26} />
                <div className="e-title">No notes</div>
                <div className="e-sub">Click "New note" to start</div>
              </div>
            )}
            {filtered.map(n => {
              const plain = stripHtml(n.body)
              const titleLen = n.title !== 'Untitled' ? plain.indexOf(n.title) === 0 ? n.title.length : 0 : 0
              const preview = plain.slice(titleLen).trim() || 'No additional text'
              return (
                <div
                  key={n.id}
                  className={`note-item ${selId === n.id ? 'active' : ''}`}
                  onClick={() => setSelId(n.id)}
                >
                  <div className="ntitle">{n.title || 'Untitled'}</div>
                  <div className="npreview">{preview}</div>
                  <div className="ndate">{relTime(n.updated)}</div>
                  <div className="ndel" onClick={e => { e.stopPropagation(); handleDelete(n.id) }}>
                    <I.X size={11} />
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        <section className="notes-right">
          {sel ? (
            <>
              <div className="note-editor-head">
                <div>
                  <div style={{
                    fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em',
                    color: sel.title === 'Untitled' ? 'var(--text-muted)' : 'var(--text)',
                  }}>
                    {sel.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    Last edited {relTime(sel.updated)}
                  </div>
                </div>
                <div className="row">
                  <span className="note-saved-tag">
                    <I.Check size={12} style={{ color: 'var(--teal)' }} /> Saved
                  </span>
                  <button className="icon-btn" onClick={() => handleDelete(sel.id)}>
                    <I.Trash size={14} />
                  </button>
                </div>
              </div>
              <Toolbar editor={editor} onLinkClick={openLinkModal} />
              <div className="note-editor-body" onClick={() => editor?.commands.focus()}>
                <EditorContent editor={editor} />
              </div>
            </>
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <I.Note size={36} />
              <div className="e-title">No note selected</div>
              <div className="e-sub">Pick a note from the sidebar or create a new one.</div>
            </div>
          )}
        </section>
      </div>

      {linkModal !== null && (
        <div className="modal-overlay" onClick={() => setLinkModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-head">
              <h3>Insert link</h3>
              <button className="icon-btn" onClick={() => setLinkModal(null)}><I.X /></button>
            </div>
            <div className="modal-body">
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="label">URL</label>
                <input
                  className="input"
                  autoFocus
                  placeholder="https://"
                  value={linkModal.url}
                  onChange={e => setLinkModal({ url: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleLinkConfirm(linkModal.url)
                    if (e.key === 'Escape') setLinkModal(null)
                  }}
                />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost" onClick={() => setLinkModal(null)}>Cancel</button>
              {linkModal.url && (
                <button className="btn ghost" onClick={() => handleLinkConfirm('')}>Remove</button>
              )}
              <button className="btn primary" onClick={() => handleLinkConfirm(linkModal.url)}>
                Set link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
