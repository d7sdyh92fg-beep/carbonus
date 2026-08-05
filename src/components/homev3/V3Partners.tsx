const PARTNERS = ["Hertz", "Europcar", "National", "Thrifty", "SIXT", "CarRentals"];

export function V3Partners() {
  return (
    <section className="bg-white py-16 lg:pt-24">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-12 gap-y-6 px-6">
        {PARTNERS.map((p) => (
          <span
            key={p}
            className="text-[22px] font-bold italic tracking-tight text-muted-foreground/60"
          >
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
