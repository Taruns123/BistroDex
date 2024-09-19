import { useBillEntry } from "@renderer/hooks/useBillEntry";
import { createEmptyBillAtom } from "@renderer/store";
import { useSetAtom } from "jotai";
import { useState } from "react";

export const BillEntry = () => {

    const { editorRef, selectedBill, handleAutoSaving, handleBlur } = useBillEntry();

    const createEmptyBill = useSetAtom(createEmptyBillAtom)
    const newTable = true;

    const handleCreation = async () => {

        console.log('creating table with table no', tableNo);
        await createEmptyBill(tableNo, "")
    }

    const [tableNo, setTableNo] = useState('')

    if (!selectedBill || !selectedBill.content) return null;
    else {
        console.log("selectedBill mera", selectedBill)
        console.info('content', selectedBill.content)
    }
    return (
        <div>
            <div className="flex gap-4 p-4 text-gray-800">
                <div className="w-1/6">
                    <input type="text" onChange={(e) => { setTableNo(e.target.value) }} value={tableNo} placeholder="Table No." onClick={() => { if (newTable) handleCreation }} className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div className="w-1/6">
                    <input type="text" placeholder="Item id" className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div className="w-3/6">
                    <input type="text" placeholder="Item Name" className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div className="w-2/6">
                    <input type="text" placeholder="Qty" className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div className="w-2/6">
                    <input type="text" placeholder="Price" className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <button type="button" className="w-1/6 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 flex flex-col relative ">
                    <div>Add</div>
                </button>
            </div>


            <div className="middle-section flex gap-6">

                <div className="h-[45vh] w-[600px] ml-12 mt-8  overflow-y-auto">
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="relative w-full text-sm text-left rtl:text-right text-gray-500" style={{ color: 'white', backgroundColor: 'zinc' }}>
                            <thead className="text-xs text-gray-700 uppercase border-b-2  ">
                                <tr>
                                    <th scope="col" className="px-6 py-3 bg-zinc-200">
                                        Item
                                    </th>
                                    <th scope="col" className="px-6 py-3 bg-zinc-300">
                                        Rate
                                    </th>
                                    <th scope="col" className="px-6 py-3 bg-zinc-200">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-3 bg-zinc-300">
                                        Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="mt-[30px]">
                                {(selectedBill.content).food_items.map((foodItem, index) => (

                                    <tr key={index} className="border-b border-gray-200 text-gray-900">

                                        <th scope="row" className="px-6 py-4 font-medium  whitespace-nowrap bg-zinc-200">
                                            {foodItem.name}
                                        </th>
                                        <td className="px-6 py-4 bg-zinc-300 ">
                                            {foodItem.rate}
                                        </td>
                                        <td className="px-6 py-4  bg-zinc-200">
                                            {foodItem.quantity}
                                        </td>
                                        <td className="px-6 py-4 bg-zinc-300">
                                            {foodItem.rate * foodItem.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="mt-6 ml-6 button-section flex flex-col gap-6 p-2 text-gray-700">
                    <input type="text" name="discount" id="discount" placeholder="Discount" className="p-2 rounded-md" />
                    <input type="text" name="cgst" id="cgst" placeholder="CGST" className="p-2 rounded-md" />
                    <input type="text" name="sgst" id="sgst" placeholder="SGST" className="p-2 rounded-md" />
                    <input type="text" name="extra" id="extra" placeholder="Extra" className="p-2 rounded-md" />
                    <span className="rounded-md drop-shadow-xl p-2 text-lg bg-zinc-300 text-gray-800">Total: 880 Rs</span>
                </div>
            </div>

            {/* {JSON.stringify(selectedBill.content)} */}

            <div className="mt-6 flex justify-center">
            </div>
        </div>
    )
}
