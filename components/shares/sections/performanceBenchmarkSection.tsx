import Image from "next/image";

export default function PerformanceBenchmarkSection() {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
    <Image src='/images/chart-small.png' alt="" width={2100} height={1224} className="object-contain" />
    <Image src='/images/chart-small.png' alt="" width={2100} height={1224} className="object-contain" />
    <Image src='/images/chart-small.png' alt="" width={2100} height={1224} className="object-contain" />
    <Image src='/images/chart-small.png' alt="" width={2100} height={1224} className="object-contain" />
    <Image src='/images/chart-small.png' alt="" width={2100} height={1224} className="object-contain" />
    <Image src='/images/chart-small.png' alt="" width={2100} height={1224} className="object-contain" />
  </div>;
}
