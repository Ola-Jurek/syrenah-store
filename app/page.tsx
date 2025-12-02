import Logo from "/logo.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#EDE3DF] flex flex-col items-center justify-center text-center px-6">

      {/* LOGO */}
      <div className="mb-10">
        <img 
          src="/logo.png" 
          alt="Syrenah logo" 
          className="w-40 md:w-54 opacity-95"
        />
      </div>

      {/* MAIN TEXT */}
      <h1 
        className="text-2xl md:text-3xl font-serif mb-4 tracking-wide text-black"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        Sklep w przygotowaniu
      </h1>

      {/* SUBTEXT */}
      <p 
        className="text-base md:text-lg text-black/60 max-w-md leading-relaxed mb-10"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Tworzymy przestrzeń pełną stylu i pasji.  <br />
        Już wkrótce odkryjesz kolekcję Syrenah inspirowaną
        kobiecą subtelnością i ponadczasową elegancją.
      </p>



      {/* LINE */}
      <div className="w-40 h-[1px] bg-black/30 mb-8"></div>

      {/* FOOTER */}
      <p 
        className="text-xs text-black/40 tracking-wide"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        © {new Date().getFullYear()} Syrenah
      </p>

    </div>
  );
}

