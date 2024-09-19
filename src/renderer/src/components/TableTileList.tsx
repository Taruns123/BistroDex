import { useTablesList } from "@renderer/hooks/useTablesList";
import { isEmpty } from 'lodash';
import { twMerge } from "tailwind-merge";
import { TableTile } from "./TableTile";

export const TableTileList = ({ onSelect, className, ...props }) => {

    /////////////////////////////////////////

    const { bills, selectedBillIndex, handleBillSelect } = useTablesList({ onSelect })
    if (!bills) return null
    console.log(bills);
    if (isEmpty(bills)) {

        return <div className={twMerge('pt-4 text-center', className)}>No tables found</div>
    }









    ///////////////////////////////////
    let total = 40000;
    let totalVisible = false;

    function tableNameFromBillNo(billNo: string) {
        let tableName = "";

        for (let index = 0; index < billNo.length; index++) {
            const element = billNo[index];
            if (element === '#') break;
            tableName += element;
        }
        return tableName;
    }
    // const [total, setTotal] = useState(40000);
    // const [totalVisible, setTotalVisible] = useState(false);
    return (
        <div className="w-full h-full  flex-col relative pb-12 ">
            <div className="table-type flex gap-2 overflow-auto">
                <button className="bg-green-600 p-2 rounded-md hover:bg-green-700">All</button>
                <button className="bg-green-600 p-2 rounded-md hover:bg-green-700">Paid</button>
                <button className="bg-green-600 p-2 rounded-md hover:bg-green-700">Unpaid</button>
            </div>
            <div className="h-[85%]  overflow-y-auto overflow-x-hidden relative pb-12 mb-4 mt-4">

                {bills.map((bill, index) => (


                    <TableTile
                        key={bill.bill_no + bill.total_amount}
                        {...bill}
                        tableName={tableNameFromBillNo(bill.bill_no)}
                        amount={bill.total_amount}
                        status={bill.status.toString()}
                        isActive={selectedBillIndex === index}
                        onClick={handleBillSelect(index)}
                    />
                ))
                }





            </div>
            <div onClick={() => { }} className="drop-shadow-xl text-center rounded-md  mt-6 bg-emerald-950 p-3 w-full text-md text-white">
                {`Total :${totalVisible ? total : ''}`}

            </div>
        </div>
    )
}
