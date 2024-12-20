const ProcessingLoader = ({ step }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="max-w-sm w-full mx-auto p-6">
        <div className="flex flex-col items-center gap-6">
          {/* Book Animation */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full animate-pulse"
              >
                <rect
                  x="20"
                  y="20"
                  width="60"
                  height="60"
                  rx="4"
                  className="fill-zinc-200"
                />
                <path d="M30 30H70V70H30V30Z" className="fill-zinc-100" />
                <path
                  d="M35 40H65M35 50H65M35 60H55"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-zinc-300"
                />
              </svg>
            </div>
            <div className="absolute inset-0 animate-spin">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  className="text-zinc-400"
                />
              </svg>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-3 text-center">
            <h3 className="text-lg font-medium text-zinc-900">
              Processing Your Order
            </h3>
            <div className="flex flex-col gap-2">
              <div
                className={`text-sm ${
                  step >= 1 ? "text-zinc-900" : "text-zinc-400"
                } transition-colors duration-300`}
              >
                Validating Cart Items...
                {step >= 1 && <span className="ml-2 text-emerald-500">✓</span>}
              </div>
              <div
                className={`text-sm ${
                  step >= 2 ? "text-zinc-900" : "text-zinc-400"
                } transition-colors duration-300`}
              >
                Creating Order...
                {step >= 2 && <span className="ml-2 text-emerald-500">✓</span>}
              </div>
              <div
                className={`text-sm ${
                  step >= 3 ? "text-zinc-900" : "text-zinc-400"
                } transition-colors duration-300`}
              >
                Preparing Shipment...
                {step >= 3 && <span className="ml-2 text-emerald-500">✓</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderConfirmedAnimation = () => {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Background Circle */}
      <div className="absolute inset-0 animate-pulse">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <circle cx="50" cy="50" r="48" className="fill-emerald-50" />
        </svg>
      </div>

      {/* Success Checkmark */}
      <div className="absolute inset-0 animate-bounce-slow">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M30 50L45 65L70 35"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-500"
          />
        </svg>
      </div>

      {/* Book Icon */}
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect
            x="35"
            y="30"
            width="30"
            height="40"
            rx="2"
            className="fill-emerald-200"
          />
          <path
            d="M40 40H60M40 50H60M40 60H55"
            stroke="currentColor"
            strokeWidth="2"
            className="text-emerald-500"
          />
        </svg>
      </div>
    </div>
  );
};

export { ProcessingLoader, OrderConfirmedAnimation };
