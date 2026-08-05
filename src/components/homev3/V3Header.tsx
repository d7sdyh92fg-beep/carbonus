import logoDark from "@/assets/logo-dark.png.asset.json";

const NAV = ["Nuoma", "Ilgalaikė", "Vairuotojas", "Paslaugos"];

export function V3Header() {
  return (
    <header className="bg-[hsl(210_20%_96%)]">
      <div className="mx-auto flex h-[88px] max-w-[1180px] items-center justify-between px-6">
        <a href="/" className="flex items-center">
          <img src={logoDark.url} alt="Carbonus" className="h-7 w-auto" />
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item, i) => (
            <button
              key={item}
              className="relative pb-1 text-[15px] font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {item}
              {i === 0 && (
                <span className="absolute -bottom-0.5 left-0 h-[3px] w-6 rounded-full bg-[hsl(var(--carbonus-green))]" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button className="hidden text-[15px] font-medium text-foreground sm:block">
            Registruotis
          </button>
          <button className="rounded-lg bg-[hsl(var(--carbonus-green-dark))] px-6 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[hsl(var(--carbonus-green-deep))]">
            Prisijungti
          </button>
        </div>
      </div>
    </header>
  );
}
