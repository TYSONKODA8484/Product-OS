import { describe, it, expect } from 'vitest'
import { useNotesStore } from './notesStore'

describe('notesStore', () => {
  it('derives title from the first line of the body on update', () => {
    const note = useNotesStore.getState().notes[0]
    useNotesStore.getState().updateNote(note.id, 'My New Title\nSecond line')
    const updated = useNotesStore.getState().notes.find(n => n.id === note.id)
    expect(updated?.title).toBe('My New Title')
    expect(updated?.body).toBe('My New Title\nSecond line')
  })

  it('newNote prepends an Untitled note and returns its id', () => {
    const before = useNotesStore.getState().notes.length
    const id = useNotesStore.getState().newNote()
    const notes = useNotesStore.getState().notes
    expect(notes.length).toBe(before + 1)
    expect(notes[0].id).toBe(id)
    expect(notes[0].title).toBe('Untitled')
  })

  it('deleteNote removes the note by id', () => {
    const id = useNotesStore.getState().newNote()
    useNotesStore.getState().deleteNote(id)
    expect(useNotesStore.getState().notes.find(n => n.id === id)).toBeUndefined()
  })
})
