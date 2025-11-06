import React from "react";

const links = {
  category: [
    "Gadget",
    "Antiques",
    "Digital Art",
    "Automotive",
    "Decorative Art",
    "Books & Comic",
  ],
  company: [
    "How to bid with us",
    "How to sell with us",
    "About Us",
    "F.A.Q",
    "Our Brand",
  ],
  support: [
    "Help & Support",
    "FAQ Probid",
    "Contact Us",
    "Terms of Service",
    "Our Policy",
    "Sell Support",
  ],
};

const ArrowRight = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
);

const ChevronUp = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M6 15l6-6 6 6" />
  </svg>
);

const Footer = () => {
  const onSubmit = (e) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    alert(`Đã đăng ký: ${email}`);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      className="
        relative mt-28 overflow-hidden text-slate-800
        before:content-[''] before:absolute before:inset-0 before:-z-10
        before:bg-gradient-to-br before:from-[#18A5A7] before:via-[#5fd7c0] before:to-[#BFFFC7]
      "
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_380px_at_50%_0%,rgba(236,245,241,0.9),rgba(255,255,255,0))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 -z-10 h-56 w-[1600px] -translate-x-1/2 rounded-b-[80px] bg-gradient-to-b from-[#f0f7f3] to-transparent"
      />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 gap-12 border-slate-200/70 pt-16 md:grid-cols-12">
          {/* Cột trái: Logo + slogan + social */}
          <div className="md:col-span-4 md:border-r md:border-slate-200/80">
            <div className="flex items-end gap-3">
              <div className="text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                  PRO
                </span>
                <span className="inline-block rounded-md bg-slate-900 px-2 py-1 text-white">
                  BID
                </span>
              </div>
            </div>
            <p className="mt-2 text-[13px] text-slate-700/90">
              Bid High, Win Big, Smile Bigger
            </p>

            <div className="mt-10">
              <h3 className="text-2xl font-bold tracking-wide">
                Social Just You Connected Us!
              </h3>
              <p className="mt-1 text-sm text-slate-700/90">
                All of update in social
              </p>

              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                <a
                  href="/"
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 bg-white/70 shadow-sm transition hover:text-primary"
                >
                  <i className="fab fa-linkedin" />
                </a>
                <a
                  href="/"
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 bg-white/70 shadow-sm transition hover:text-primary"
                >
                  <i className="fab fa-facebook" />
                </a>
                <a
                  href="/"
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 bg-white/70 shadow-sm transition hover:text-primary"
                >
                  <i className="fab fa-twitter" />
                </a>
                <a
                  href="/"
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 bg-white/70 shadow-sm transition hover:text-primary"
                >
                  <i className="fab fa-instagram" />
                </a>
              </div>
            </div>
          </div>

          {/* Cột giữa: 3 nhóm liên kết */}
          <div className="md:col-span-5 md:border-r md:border-slate-200/80">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="relative text-2xl font-bold tracking-wide pb-2 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-[85%] after:rounded-full after:bg-gradient-to-r after:from-[#01AA85] after:to-transparent">
                  Category
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {links.category.map((item) => (
                    <li
                      key={item}
                      className="transition-all duration-300 hover:translate-x-1"
                    >
                      <a className="transition hover:text-primary" href="/">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="relative text-2xl font-bold tracking-wide pb-2 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-[85%] after:rounded-full after:bg-gradient-to-r after:from-[#01AA85] after:to-transparent">
                  Company
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {links.company.map((item) => (
                    <li
                      key={item}
                      className="transition-all duration-300 hover:translate-x-1"
                    >
                      <a className="transition hover:text-primary" href="/">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="relative text-2xl font-bold tracking-wide pb-2 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-[85%] after:rounded-full after:bg-gradient-to-r after:from-[#01AA85] after:to-transparent">
                  Support
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {links.support.map((item) => (
                    <li
                      key={item}
                      className="transition-all duration-300 hover:translate-x-1"
                    >
                      <a className="transition hover:text-primary" href="/">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Cột phải: Newsletter + Payment */}
          <div className="md:col-span-3">
            <h4 className="text-2xl font-semibold leading-snug">
              Join Our Newsletter &<br /> More information.
            </h4>

            <form onSubmit={onSubmit} className="mt-6 flex">
              <input
                type="email"
                name="email"
                required
                placeholder="Email Address"
                className="w-full rounded-l-xl border border-slate-300 bg-white/80 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="grid w-14 place-items-center rounded-r-xl border border-l-0 border-slate-300 bg-white/90 hover:bg-primary/30 hover:text-white"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-5 w-5 " />
              </button>
            </form>

            <div className="mt-8">
              <p className="text-sm font-medium text-slate-800">
                Secured Payment Gateways
              </p>
              <div className="mt-3 flex items-center gap-3">
                <img
                  src="https://probid-wp.egenstheme.com/multipurpose-auction/wp-content/uploads/sites/12/2024/11/payment-trans.png"
                  alt="Payment"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200/80 pt-6" />

        <div className="flex flex-col items-center justify-between gap-4 pb-8 text-sm text-slate-700 md:flex-row">
          <p className="text-center md:text-left">
            ©Copyright 2024{" "}
            <span className="font-semibold text-slate-900">Probid</span> |
            Design By{" "}
            <a
              className="font-semibold text-slate-900 hover:underline"
              href="/"
            >
              Egens Lab
            </a>
          </p>

          <nav className="flex items-center gap-8">
            <a href="/" className="hover:text-primary">
              Support Center
            </a>
            <a href="/" className="hover:text-primary">
              Terms &amp; Conditions
            </a>
            <a href="/" className="hover:text-primary">
              Privacy Policy
            </a>
          </nav>
        </div>
      </div>

      <button
        onClick={scrollTop}
        className="fixed bottom-6 right-6 grid h-12 w-12 place-items-center rounded-full border border-slate-300 bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:shadow-xl"
        aria-label="Back to top"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </footer>
  );
};

export default Footer;
