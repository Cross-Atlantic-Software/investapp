import { Header, Footer } from "@/components/layouts";
import { ScrollToTop } from "@/components/subcomponents";

export const metadata = { title: "InvestAPP" };

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ScrollToTop />
    </>
  );
}
