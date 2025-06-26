"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

type HeaderProps = {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold font-headline">{title}</h1>
      </div>
    </header>
  )
}
