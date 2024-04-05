'use client'

import * as React from 'react'

import { ThemeProviderProps } from 'next-themes/dist/types'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
 
export function Providers2({ children, ...props }: ThemeProviderProps) {
  return (

<SidebarProvider>
        {children} 
      </SidebarProvider>

)
}
