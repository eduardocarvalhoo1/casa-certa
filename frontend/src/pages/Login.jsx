
export default function Login() {
  function handleSubmit(event) {
    event.preventDefault();

    // A integração com o backend será implementada depois.
    console.log('Formulário de login enviado');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">

      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">

        {/* Identidade do sistema */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            CasaCerta
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Entre na sua conta para continuar.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              E-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Senha
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Digite sua senha"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Entrar
          </button>

        </form>

        <div className="mt-6 border-t border-neutral-100 pt-5 text-center">
          <p className="text-sm text-neutral-500">
            Ainda não tem uma conta?
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-900">
            Cadastro disponível em breve.
          </p>
        </div>

      </div>
    </div>
  );
}
