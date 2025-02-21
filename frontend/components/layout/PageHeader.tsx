import { AlertTriangle } from "lucide-react"

export function PageHeader() {
  return (
    <header className="mb-4 flex items-center justify-center">
      <AlertTriangle className="text-red-500 mr-4 h-12 w-12" />
      <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
        Scams in India
      </h1>
    </header>
  )
} 