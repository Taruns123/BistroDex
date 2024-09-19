import { notesMock } from "@renderer/store/mocks"
import { ComponentProps } from "react"
import { NotePreview } from "@/components/NotePreview"
import { twMerge } from "tailwind-merge"
import { useNotesList } from "@/hooks/useNotesList"
import { isEmpty } from 'lodash'

export type NotePreviewListProps = ComponentProps<'ul'> & {
    onSelect?: () => void
}

export const NotePreviewList = ({ onSelect, className, ...props }: NotePreviewListProps) => {

    const { notes, selectedNoteIndex, handleNoteSelect } = useNotesList({ onSelect })
    if (!notes) return null
    if (isEmpty(notes)) {
        return <div className={twMerge('pt-4 text-center', className)}>No notes found</div>
    }
    return <ul {...props} className={className}>
        {notes.map((note, index) => (
            <NotePreview key={note.title + note.lastEditTime} {...note}
                isActive={selectedNoteIndex === index}
                onClick={handleNoteSelect(index)}
            />
        ))}
    </ul>
}