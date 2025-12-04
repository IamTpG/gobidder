const Logo = () => {
  return (
    <a href="/" className="shrink-0">
      <div className="flex items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-gray-900">GO</span>
          <span className="relative ml-1">
            <span className="bg-primary text-white px-2 py-1 rounded-md inline-block font-bold">
              BIDDER
            </span>
          </span>
        </h1>
      </div>
      <p className="text-xs text-gray-500 mt-0.5 block">
        Bid High, Win Big, Smile Bigger
      </p>
    </a>
  );
};

export default Logo;
