import { AlertTriangle } from "lucide-react"

export function PageHeader() {
  return (
    <div className="text-center space-y-4">
      <header className="flex items-center justify-center space-x-4">
        <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 animate-pulse" />
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Scams in India
        </h1>
      </header>
      <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
        Exposing Frauds, Protecting Fortunes in investments, forex, crypto, and more
      </p>
      <div className="h-1 mb-4 w-32 bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 mx-auto rounded-full" />
    </div>
  )
} 