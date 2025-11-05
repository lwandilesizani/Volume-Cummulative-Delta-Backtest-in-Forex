import '@/styles/globals.css'
import { AnimatedSidebarDemo } from '@/components/AnimatedSidebar'

export default function App({ Component, pageProps }) {
  return (
    <AnimatedSidebarDemo>
      <Component {...pageProps} />
    </AnimatedSidebarDemo>
  )
}
