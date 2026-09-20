// Small illustrations for each project card. Plain SVG, so they are sharp at any
// size and weigh almost nothing. Chosen by the project's number.

export function ProjectArt({ num }: { num: string }) {
  switch (num) {
    case '01': return <FraudArt />;
    case '02': return <SeatArt />;
    case '03': return <TriageArt />;
    case '05': return <QueueArt />;
    case '06': return <DnsArt />;
    default: return <ChipArt />;
  }
}

// 'slice' fills the frame (cropping a little if needed) instead of leaving empty bands.
const box = { viewBox: '0 0 320 200', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': true, focusable: false } as const;

function FraudArt() {
  return (
    <svg {...box}>
      <rect width="320" height="200" fill="#161a33" />
      <g stroke="#26324f">
        <path d="M0 50H320M0 100H320M0 150H320M80 0V200M160 0V200M240 0V200" />
      </g>
      <polyline points="20,140 60,128 100,134 140,96 170,110 200,60" stroke="#ff4fa0" strokeWidth="3" fill="none" />
      <circle cx="200" cy="60" r="6" fill="#ff4fa0" />
      <rect x="212" y="42" width="64" height="24" fill="#ff4fa0" />
      <text x="244" y="59" textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontSize="13" fontWeight="600" fill="#161a33">BLOCK</text>
      <g fill="#3ee6d8">
        <rect x="226" y="120" width="14" height="60" /><rect x="246" y="100" width="14" height="80" /><rect x="286" y="130" width="14" height="50" />
      </g>
      <rect x="266" y="80" width="14" height="100" fill="#ff4fa0" />
    </svg>
  );
}

function SeatArt() {
  // 4 rows x 8 seats; a few are taken (pink), one is being locked (cyan, outlined).
  const taken = new Set(['1-1', '2-0', '2-6', '3-2', '3-5']);
  const seats = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const x = 44 + c * 28 + (c >= 4 ? 16 : 0);
      const y = 54 + r * 30;
      const key = `${r}-${c}`;
      const fill = key === '1-5' ? '#3ee6d8' : taken.has(key) ? '#ff4fa0' : '#2f5c60';
      seats.push(<rect key={key} x={x} y={y} width="20" height="20" fill={fill} />);
    }
  }
  return (
    <svg {...box}>
      <rect width="320" height="200" fill="#0f2a2e" />
      <rect x="80" y="22" width="160" height="10" fill="#3ee6d8" opacity="0.6" />
      {seats}
      <rect x="192" y="79" width="30" height="30" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

function TriageArt() {
  const rows = [180, 150, 170, 130, 160];
  const tags = ['#3ee6d8', '#ffd9b0', '#3ee6d8', '#ff4fa0', '#ffd9b0'];
  return (
    <svg {...box}>
      <rect width="320" height="200" fill="#211a2e" />
      {rows.map((w, i) => (
        <g key={i}>
          <rect x="28" y={30 + i * 32} width={w} height="16" fill="#4d4466" />
          <rect x="228" y={30 + i * 32} width="64" height="16" fill={tags[i]} />
        </g>
      ))}
    </svg>
  );
}

function ChipArt() {
  const pins = [110, 130, 150, 170, 190];
  return (
    <svg {...box}>
      <rect width="320" height="200" fill="#16201c" />
      <rect x="100" y="50" width="120" height="100" fill="#2e2e33" stroke="#8a8a90" strokeWidth="3" />
      <g fill="#8a8a90">
        {pins.map((x) => <rect key={`t${x}`} x={x} y="36" width="8" height="14" />)}
        {pins.map((x) => <rect key={`b${x}`} x={x} y="150" width="8" height="14" />)}
      </g>
      <text x="160" y="110" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontStyle="italic" fontWeight="800" fontSize="34" fill="#7ee0b0">8085</text>
    </svg>
  );
}

function QueueArt() {
  // Three queues of job blocks flowing right into a worker; one failed job drops into the dead-letter tray.
  const lanes = [
    { y: 44, jobs: 5, c: '#b69cff' },
    { y: 88, jobs: 3, c: '#3ee6d8' },
    { y: 132, jobs: 4, c: '#ffd9b0' },
  ];
  return (
    <svg {...box}>
      <rect width="320" height="200" fill="#1c1830" />
      {lanes.map((l) => (
        <g key={l.y}>
          <rect x="20" y={l.y - 2} width="190" height="28" fill="#2a2446" />
          {Array.from({ length: l.jobs }, (_, i) => (
            <rect key={i} x={182 - i * 34} y={l.y + 3} width="24" height="18" fill={l.c} opacity={1 - i * 0.14} />
          ))}
        </g>
      ))}
      <rect x="228" y="40" width="72" height="118" fill="none" stroke="#b69cff" strokeWidth="3" />
      <text x="264" y="104" textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontSize="13" fontWeight="600" fill="#b69cff">WORKER</text>
      <rect x="228" y="170" width="72" height="18" fill="#ff4fa0" />
      <text x="264" y="183" textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontSize="11" fontWeight="600" fill="#1c1830">DLQ</text>
    </svg>
  );
}

function DnsArt() {
  // The chain of trust: root → lab. → example.lab., each link signed twice (classical + post-quantum).
  const nodes = [
    { x: 160, y: 36, label: '.' },
    { x: 160, y: 100, label: 'lab.' },
    { x: 160, y: 164, label: 'example.lab.' },
  ];
  return (
    <svg {...box}>
      <rect width="320" height="200" fill="#2a1a14" />
      <path d="M160 50V86M160 114V150" stroke="#ff9a62" strokeWidth="3" />
      <path d="M170 50V86M170 114V150" stroke="#3ee6d8" strokeWidth="3" strokeDasharray="4 4" />
      {nodes.map((n) => (
        <g key={n.label}>
          <rect x={n.x - 56} y={n.y - 14} width="120" height="28" fill="#3d261c" stroke="#ff9a62" strokeWidth="2" />
          <text x={n.x + 4} y={n.y + 5} textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontSize="13" fontWeight="600" fill="#ffd9b0">{n.label}</text>
        </g>
      ))}
      <text x="36" y="104" fontFamily="Chakra Petch, sans-serif" fontSize="11" fontWeight="600" fill="#ff9a62">RSA</text>
      <text x="236" y="104" fontFamily="Chakra Petch, sans-serif" fontSize="11" fontWeight="600" fill="#3ee6d8">ML-DSA</text>
    </svg>
  );
}
