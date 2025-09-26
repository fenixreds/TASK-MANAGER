import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Task Management App',
  description: 'Una aplicación completa para gestión de tareas con subtareas multinivel',
  keywords: ['tasks', 'productivity', 'management', 'nextjs', 'nestjs'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    Task Manager
                  </h1>
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    v1.0
                  </span>
                </div>

                <nav className="flex items-center space-x-4">
                  <a 
                    href="/" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Tareas
                  </a>
                  
                </nav>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="bg-white border-t mt-12">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center text-gray-600 text-sm">
                <p>© 2025 Task Management App. Desarrollado con Next.js y NestJS.</p>
                <p className="mt-1">
                  <a 
                    href="https://github.com/yourusername/task-management" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver código en GitHub
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>

        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
