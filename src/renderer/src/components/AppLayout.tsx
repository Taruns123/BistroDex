import { ComponentProps, forwardRef, ReactNode } from "react";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

// export const RootLayout = ({ children, className, ...props }): ComponentProps<'main'> => (
//     <main className={twMerge('flex flex-row h-screen', className)} {...props}>
//         {children}
//     </main>
// )


export const RootLayout = ({ children, className, ...props }): ReactNode => (
    <main className={twMerge('flex flex-row h-screen bg-emerald-800 ', className)} {...props}>
        {children}
    </main>
)


// export const Sidebar = ({ className, children, ...props }): ComponentProps<'aside'> =>
// (
//     <aside className={twMerge('w-[250px] mt-10 h-[100vh + 10px] overflow-auto', className)}
//         {...props}
//     >
//         {children}
//     </aside>

// )
export const Sidebar = ({ className, children, ...props }): ReactNode => (
    <aside className={twMerge('w-[250px] mt-[60px] h-[80vh] overflow-auto bg-emerald-600 pb-8  ', className)}
        {...props}
    >
        {children}
    </aside>
)



export const TitleBar = ({ className }): ReactNode => (
    <div className={twMerge('relative w-full h-[30px]  flex justify-center items-center bg-gradient-to-r from-cyan-900 via-emerald-900 to-emerald-950 ', className)}
    >
        <span className="text-xl text-gray-100 font-extrabold font-mono"> Bistro Dex </span>
        <IoClose className="absolute right-0 top-0 p-1 mr-1 h-7 w-7 text-zinc-500" />
    </div>
)
export const ControlBar = ({ children, className, ...props }): ReactNode => (
    <div className={twMerge('w-full h-[60px] bg-emerald-800 ', className)}
    >
        {children}
    </div>
)
export const BillSection = ({ children, className }): ReactNode => (
    <div className={twMerge('w-full h-[70vh] p-2 bg-emerald-600 ', className)}
    >
        {children}
    </div>
)
export const UtilityBar = ({ children, className }): ReactNode => (
    <div className={twMerge('w-full h-[80px] bg-emerald ', className)}
    >
        {children}
    </div>
)



export const Content = forwardRef<HTMLDivElement, ComponentProps<'div'>>(({ children, className, ...props }, ref) => (
    <div ref={ref} className={twMerge('flex-1 overflow-auto', className)} {...props}>
        {children}
    </div>
))

Content.displayName = 'Content'