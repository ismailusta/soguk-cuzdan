export function CryptoBackdrop() {
  return (
    <div className="crypto-backdrop" aria-hidden>
      <svg className="crypto-mesh" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="meshStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(95,212,201,0.35)" />
            <stop offset="50%" stopColor="rgba(201,162,39,0.28)" />
            <stop offset="100%" stopColor="rgba(139,123,240,0.3)" />
          </linearGradient>
        </defs>
        <g className="crypto-lines" stroke="url(#meshStroke)" strokeWidth="1" fill="none">
          <path d="M80 120 L220 180 L340 90 L520 160 L680 70 L860 140 L1040 100 L1140 200" />
          <path d="M120 320 L280 280 L420 360 L580 300 L760 380 L940 320 L1100 400" />
          <path d="M60 520 L240 480 L400 560 L560 500 L740 580 L920 520 L1120 600" />
          <path d="M200 700 L380 640 L540 720 L720 660 L900 740 L1080 680" />
          <path d="M220 180 L280 280 L400 560" />
          <path d="M520 160 L580 300 L560 500 L720 660" />
          <path d="M860 140 L760 380 L920 520" />
          <path d="M1040 100 L940 320 L1100 400 L1080 680" />
          <path d="M340 90 L420 360 L540 720" />
        </g>
        <g className="crypto-nodes" fill="rgba(201,162,39,0.55)">
          <circle cx="80" cy="120" r="3" />
          <circle cx="220" cy="180" r="4" />
          <circle cx="340" cy="90" r="3" />
          <circle cx="520" cy="160" r="5" />
          <circle cx="680" cy="70" r="3" />
          <circle cx="860" cy="140" r="4" />
          <circle cx="1040" cy="100" r="3" />
          <circle cx="280" cy="280" r="4" />
          <circle cx="580" cy="300" r="5" />
          <circle cx="760" cy="380" r="3" />
          <circle cx="940" cy="320" r="4" />
          <circle cx="400" cy="560" r="4" />
          <circle cx="560" cy="500" r="3" />
          <circle cx="920" cy="520" r="5" />
          <circle cx="720" cy="660" r="4" />
          <circle cx="1080" cy="680" r="3" />
        </g>
        <g className="crypto-hex" fill="none" stroke="rgba(95,212,201,0.12)" strokeWidth="1">
          <path d="M980 220 l28 16 v32 l-28 16 l-28-16 v-32 z" />
          <path d="M160 440 l22 13 v26 l-22 13 l-22-13 v-26 z" />
          <path d="M640 480 l18 10 v20 l-18 10 l-18-10 v-20 z" />
        </g>
      </svg>
      <div className="crypto-scan" />
    </div>
  );
}
