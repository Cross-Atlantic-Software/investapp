import Image from "next/image";

export default function PriceChartSection() {
  return <div className="text-themeTealLight">
    <Image src='/images/chart.png' alt="" width={2100} height={1224} className="object-contain" />
  </div>;
}
