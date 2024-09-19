import { BiSolidFoodMenu } from "react-icons/bi";
import { BsFileEarmarkBarGraphFill } from "react-icons/bs";
import { MdOutlineCommentBank } from "react-icons/md";
import { RiContactsBookFill, RiMoneyRupeeCircleFill } from "react-icons/ri";

export const UtilitySection = () => {
    return (
        <div className="flex gap-8 ml-8 mt-6">
            <button className="relative bg-green-600 drop-shadow-xl rounded-md p-4 px-6 hover:bg-green-700">
                <div className="icon"><BiSolidFoodMenu className="text-zinc-100 h-8 w-8" /></div>
                <div className="title text-[0.6em] text-center">Menu</div>
            </button>
            <button className="relative bg-green-600 drop-shadow-xl rounded-md p-4 px-6 hover:bg-green-700">
                <div className="icon"><RiMoneyRupeeCircleFill className="text-zinc-100 h-8 w-8" /></div>
                <div className="title text-[0.6em] text-center">Kharcha</div>
            </button>
            <button className="relative bg-green-600 drop-shadow-xl rounded-md p-4 px-6 hover:bg-green-700">
                <div className="icon"><MdOutlineCommentBank className="text-zinc-100 h-8 w-8" /></div>
                <div className="title text-[0.6em] text-center">Udhaar</div>
            </button>
            <button className="relative bg-green-600 drop-shadow-xl rounded-md p-4 px-6 hover:bg-green-700">
                <div className="icon"><RiContactsBookFill className="text-zinc-100 h-8 w-8" /></div>
                <div className="title text-[0.6em] text-center">Salary</div>
            </button>
            <button className="relative bg-green-600 drop-shadow-xl rounded-md p-4 px-6 hover:bg-green-700">
                <div className="icon"><BsFileEarmarkBarGraphFill className="text-zinc-100 h-8 w-8" /></div>
                <div className="title text-[0.6em] text-center">Sales</div>
            </button>
        </div>
    )
}
