import { describe, it, expect, beforeEach } from 'vitest'
import { useNotesStore, SAMPLE_NOTES } from './notesStore'

describe('notesStore', () => {
  beforeEach(() => {
    useNotesStore.setState({ notes: [...SAMPLE_NOTES] })
  })

  it('derives title from the first line of the body on update', () => {
    const note = useNotesStore.getState().notes[0]
    useNotesStore.getState().updateNote(note.id, 'My New Title\nSecond line')
    const updated = useNotesStore.getState().notes.find(n => n.id === note.id)
    expect(updated?.title).toBe('My New Title')
    expect(updated?.body).toBe('My New Title\nSecond line')
  })

  it('newNote prepends an Untitled note and returns its id', async () => {
    const before = useNotesStore.getState().notes.length
    const id = await useNotesStore.getState().newNote()
    const notes = useNotesStore.getState().notes
    expect(notes.length).toBe(before + 1)
    expect(notes[0].title).toBe('Untitled')
    expect(typeof id).toBe('string')
  })

  it('deleteNote removes the note by id', async () => {
    const id = await useNotesStore.getState().newNote()
    useNotesStore.getState().deleteNote(id)
    expect(useNotesStore.getState().notes.find(n => n.id === id)).toBeUndefined()
  })
})
