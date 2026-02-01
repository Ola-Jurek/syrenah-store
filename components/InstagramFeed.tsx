export async function InstagramFeed() {
  // Beżowe placeholdery zamiast zdjęć z bazy
  const placeholderCount = 4;

  return (
    <section className="px-6 py-16 bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm uppercase tracking-[0.3em] text-center mb-12 font-serif text-neutral-600">
          INSTAGRAM
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-[#C1A88C]/10 relative overflow-hidden"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

