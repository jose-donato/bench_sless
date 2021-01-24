import { abbreviateNumber } from "lib/mathUtils";

function BarGroup({ name, value, barHeight, isNPM }: any) {
  let barPadding = 2;
  let barColour = "#348AA7";
  let widthScale = (d: number) => (isNPM ? Math.cbrt(d) : Math.sqrt(d));
  let width = widthScale(value);
  if (width > 1500) width = 1500;
  let yMid = barHeight * 0.5;

  return (
    <g className="bar-group">
      <text className="name-label" x="-6" y={yMid} alignmentBaseline="middle">
        {name}
      </text>
      <rect
        y={barPadding * 0.5}
        width={width}
        height={barHeight - barPadding}
        fill={barColour}
      />
      <text
        className="value-label"
        x={width - 8}
        y={yMid}
        alignmentBaseline="middle"
      >
        {abbreviateNumber(value)}
      </text>
    </g>
  );
}

export default function TechnologiesBarChart({
  frameworks,
  label,
  isNPM = false,
}: any) {
  /*  const [data, setData] = useState([
    { name: "Mon", value: 20 },
    { name: "Tue", value: 40 },
    { name: "Wed", value: 35 },
    { name: "Thu", value: 50 },
    { name: "Fri", value: 55 },
    { name: "Sat", value: 40 },
    { name: "Sun", value: 30 },
  ]);*/
  let barHeight = 30;

  let barGroups = frameworks.map((d: any, i: any) => (
    <g transform={`translate(0, ${i * barHeight})`}>
      <BarGroup
        name={d.name}
        value={d.value}
        barHeight={barHeight}
        isNPM={isNPM}
      />
    </g>
  ));

  return (
    <svg className="w-full" height="700">
      <g className="container">
        <text className="title" x="10" y="30">
          {label}
        </text>
        <g className="chart" transform="translate(100,60)">
          {barGroups}
        </g>
      </g>
    </svg>
  );
}
