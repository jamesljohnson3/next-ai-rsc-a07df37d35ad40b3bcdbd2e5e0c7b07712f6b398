


import { AI } from "./actions";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
     
     
        <AI>
          {children}
        </AI>
    
    
    </div>
  );
}