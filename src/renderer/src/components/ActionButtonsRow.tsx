import React, { ComponentProps } from 'react'
import { NewNoteButton } from './Button'
import { DeleteNoteButton } from './Button/DeleteNoteButton'

export const ActionButtonsRow = ({ ...props }: ComponentProps<'div'>) => {

    return (
        <div {...props}>
            <NewNoteButton />
            <DeleteNoteButton />
        </div>
    )
}

