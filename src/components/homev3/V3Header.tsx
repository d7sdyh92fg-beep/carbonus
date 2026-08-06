import logoDark from "@/assets/logo-dark.png.asset.json";
import { Link } from "react-router-dom";

const NAV = [
  { label: "Nuoma", to: "/automobiliai" },
  { label: "Ilgalaikė", to: "/automobiliai" },
  { label: "Vairuotojas", to: "/kontaktai" },
  { label: "Paslaugos", to: "/apie-mus" },
];

export function V3Header() {
  return (
    <header className="relative z-30 bg-[hsl(210_20%_96%)]">
      <div className="mx-auto flex h-[88px] max-w-[1140px] items-center justify-between px-6">
        <Link to="/" className="flex items-center" aria-label="Carbonus pradžia">
          <img src={logoDark.url} alt="Carbonus" className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Pagrindinė navigacija">
          {NAV.map((item, index) => (
            <Link
              key={item.label}
              to={item.to}
              className="relative pb-1 text-[15px] font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
              {index === 0 && (
                <span className="absolute -bottom-0.5 left-0 h-[3px] w-6 rounded-full bg-carbonus-green" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/auth" className="hidden text-[15px] font-medium text-foreground sm:block">
            Registruotis
          </Link>
          <Link
            to="/auth"
            className="rounded-lg bg-carbonus-green-dark px-7 py-3 text-[15px] font-semibold text-white shadow-[0_12px_28px_hsl(var(--carbonus-green-dark)/0.18)] transition-colors hover:bg-carbonus-green-deep"
          >
            Prisijungti
          </Link>
        </div>
      </div>
    </header>
  );
}
