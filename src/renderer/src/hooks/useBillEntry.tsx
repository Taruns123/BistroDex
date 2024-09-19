import { MDXEditorMethods } from '@mdxeditor/editor';
import { saveBillAtom, selectedBillAtom } from '@renderer/store';
import { autoSavingTime } from '@shared/constants';
import { BillContent } from '@shared/models';
import { useAtomValue, useSetAtom } from 'jotai';
import { throttle } from 'lodash';
import { useRef } from 'react';

export const useBillEntry = () => {

    const selectedBill = useAtomValue(selectedBillAtom);
    const saveBill = useSetAtom(saveBillAtom);

    const editorRef = useRef<MDXEditorMethods>(null);

    const handleAutoSaving = throttle(async (content: BillContent) => {
        if (!selectedBill) return;
        console.info('Auto saving note', selectedBill.bill_no);

        await saveBill(content);
    }, autoSavingTime, { leading: false, trailing: true })

    const handleBlur = async () => {
        if (!selectedBill) return;
        console.info('Auto saving note', selectedBill?.bill_no);

        handleAutoSaving.cancel();

        const content = editorRef.current?.getMarkdown();

        if (content) {
            await saveBill(content);
        }
    }

    return {
        editorRef,
        selectedBill,
        handleAutoSaving,
        handleBlur
    }
}
