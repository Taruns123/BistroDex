import { billsAtom, selectedBillIndexAtom } from "@/store";
import { useAtom, useAtomValue } from "jotai";

export const useTablesList = ({ onSelect }: { onSelect?: () => void }) => {
    const bills = useAtomValue(billsAtom);

    const [selectedBillIndex, setSelectedBillIndex] = useAtom(selectedBillIndexAtom)

    const handleBillSelect = (index: number) => async () => {
        setSelectedBillIndex(index)

        if (bills && selectedBillIndex) {
            console.log("selected bill ", bills[selectedBillIndex]);

        }
        else {
            console.log('selected bill index not working');
        }
        if (onSelect) {
            onSelect()
        }
    }


    return {
        bills,
        selectedBillIndex,
        handleBillSelect
    }
}