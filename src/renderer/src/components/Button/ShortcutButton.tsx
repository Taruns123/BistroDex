
export const ShortcutButton = ({ title, shortcut, ...props }) => {
    return (
        <div className="">
            <button type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 flex flex-col relative ">
                <div>{title}</div>

                <div className=" text-[0.8em] absolute right-1 bottom-0 mr-1">{shortcut}</div>

            </button>
        </div>
    )
}
