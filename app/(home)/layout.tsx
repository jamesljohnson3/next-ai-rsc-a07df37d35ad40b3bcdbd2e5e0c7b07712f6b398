  import { SidebarDesktop } from '@/components/sidebar-desktop'

import { AI } from '../action';
 
export default function RootLayout({
  children,
 
}: Readonly<{
  children: React.ReactNode;
  authModal: React.ReactNode

}>) {
  return ( 
        <AI>
            <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop />
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        {children}
      </div>
    </div>
             
        </AI>
      
  );
}

export const runtime = 'edge';
