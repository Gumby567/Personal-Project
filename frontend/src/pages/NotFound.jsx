import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="page-container flex flex-col items-center justify-center py-32 text-center gap-6">
      <p className="font-display text-8xl font-bold text-stone-200">404</p>
      <div>
        <h1 className="font-display text-3xl text-stone-800">Page Not Found</h1>
        <p className="text-stone-400 mt-2">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  )
}
