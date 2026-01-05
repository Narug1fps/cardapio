import './globals.css'
import { Inter } from 'next/font/google'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/components/Toast'
import MenuThemeProvider from '@/components/MenuThemeProvider'

const inter = Inter({
  subsets: ['latin-ext'],
  weight: ['400', '700'],
  display: 'swap'
})

export const metadata = {
  title: 'Sabores & Aromas - Cardápio Digital',
  description: 'Faça seu pedido de forma rápida e fácil pelo nosso cardápio digital.',
}

function AppLayout(props: React.PropsWithChildren) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
        <ToastProvider>
          <MenuThemeProvider>
            <CartProvider>
              {props.children}
            </CartProvider>
          </MenuThemeProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

export default AppLayout
