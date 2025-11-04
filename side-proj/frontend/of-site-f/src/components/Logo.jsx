export default function Logo({ size = 96, showLabel = true, className = "" }) {
  return (
    <div
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      style={{ color: "#0F172A" }}
    >
      <svg
        width={size}
        height={size * 0.75}
        viewBox="0 0 200 150"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="of-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* O (돋보기) */}
        <circle
          cx="70"
          cy="70"
          r="38"
          stroke="url(#of-gradient)"
          strokeWidth="14"
          fill="none"
        />
        {/* 손잡이 */}
        <rect
          x="94"
          y="94"
          width="12"
          height="38"
          rx="6"
          ry="6"
          transform="rotate(45 100 100)"
          fill="url(#of-gradient)"
        />

        {/* F */}
        <path
          d="M130 35 h40 M130 75 h30 M130 35 v80"
          stroke="url(#of-gradient)"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>

 
    </div>
  );
}



