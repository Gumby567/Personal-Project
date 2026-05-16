import { BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-stone-900 text-stone-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <span className="font-display font-semibold">PageTurn</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} PageTurn — Online Bookstore. Personal Project.</p>
      </div>
    </footer>
  )
}
