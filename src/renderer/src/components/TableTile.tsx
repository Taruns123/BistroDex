
export const TableTile = ({ tableName, amount, status, isActive = false, ...props }) => {
    return (
        <div {...props} className={`drop-shadow-xl rounded-md w-full mr-2 mt-2 bg-emerald-600 flex p-[7px] px-4 justify-between  hover:bg-emerald-700`} >
            <div className="text-sm">{tableName}</div>
            <div className={`text-xs ${status === 'paid' ? 'text-white' : 'text-yellow-500'}`}>{amount} Rs</div>
        </div>
    )
}
