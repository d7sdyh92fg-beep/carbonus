const PARTNERS = ["Hertz", "Europcar", "National", "Thrifty", "SIXT", "CarRentals"];

export function V3Partners() {
  return (
    <section className="bg-white pb-8 pt-14 lg:pb-5 lg:pt-14">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-center gap-x-12 gap-y-6 px-6 lg:justify-between">
        {PARTNERS.map((p) => (
          <span
            key={p}
            className="text-[22px] font-extrabold italic tracking-[-0.04em] text-muted-foreground/60"
          >
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
