 
import { AI } from '../action';
 
export default function RootLayout({
  children,
 
}: Readonly<{
  children: React.ReactNode;
  authModal: React.ReactNode

}>) {
  return ( 
        <AI>
           {children}
             
        </AI>
      
  );
}

export const runtime = 'edge';
