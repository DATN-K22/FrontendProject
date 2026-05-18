import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChatWidgetShell from '@/components/ChatWidgetShell'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatWidgetShell>
      <Header />
      {children}
      <Footer />
    </ChatWidgetShell>
  )
}
