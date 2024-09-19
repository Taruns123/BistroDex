import { BillEntry, BillSection, Content, ControlBar, RootLayout, ShortcutButton, Sidebar, TableTileList, TitleBar, UtilityBar, UtilitySection } from "@/components"
import DraggableTopBar from "@/components/DraggableTopBar"
import { useRef } from "react"

const App = () => {

  const contentContainerRef = useRef<HTMLDivElement>(null)

  const resetScroll = () => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTo(0, 0)
    }
  }


  return (
    <>
      <DraggableTopBar />
      <TitleBar className='' />
      <RootLayout className=''>
        <Content ref={contentContainerRef} className='border-l bg-emerald-800  '>
          <ControlBar className='flex pl-4 justify-left items-center gap-4 mt-2' >
            <ShortcutButton title={"New Table"} shortcut={'F2'} />
            <ShortcutButton title={"Transfer Table"} shortcut={'F3'} />
            <ShortcutButton title={"Receive Bill"} shortcut={'F4'} />
            <ShortcutButton title={"Print Bill"} shortcut={'F5'} />
            <ShortcutButton title={"Print KOT"} shortcut={'F8'} />
          </ControlBar>
          <BillSection className='rounded-md shadow-2xl shadow-emerald-950 drop-shadow-2xl w-[95%]'>
            <BillEntry />
          </BillSection>
          <UtilityBar className=''>
            <UtilitySection />
          </UtilityBar>
          {/* <FloatingNoteTitle />
          <MarkdownEditor /> */}

        </Content>
        <Sidebar className='p-2 bg-emerald-800'>
          <TableTileList className='' onSelect={() => { }} />
          {/* <ActionButtonsRow className="flex justify-between mt-1" />
          <NotePreviewList className='mt-3 space-y-1 text-black' onSelect={resetScroll} /> */}
        </Sidebar>
      </RootLayout>
    </>
  )
}

export default App
