import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/ui/theme-provider"

export const metadata: Metadata = {
  title: "bview-cashup",
  description: "Cash-up management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
