import Link from 'next/link'

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">
            <h3 className="font-medium mb-2">Error de autenticación</h3>
            <p>Hubo un problema al confirmar tu cuenta. Por favor intenta de nuevo o contacta al soporte.</p>
          </div>
        </div>
        <div className="text-center">
          <Link href="/auth/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}