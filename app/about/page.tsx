// app/about/page.tsx
import Image from "next/image";
import { PageTitle } from "@/components/containers";
import { Button, Heading } from "@/components/ui";
import TeamGrid, { TeamMember } from "@/components/subcomponents/teamgrid";
import GalleryCarousel, { GalleryImage } from "@/components/subcomponents/galleryCarousel";

type EthosItem = { title: string; body: string };
type Journey = { img: string; alt: string; paragraphs: string[] };

const ETHOS: EthosItem[] = [
  {
    title: "Trust",
    body:
      "Learn the basics, assess your risk tolerance, understand the benefits of our nominee service and learn how seriously we take our due diligence to protect your interests.",
  },
  {
    title: "Quality Without Compromise",
    body:
      "Learn the basics, assess your risk tolerance, understand the benefits of our nominee service and learn how seriously we take our due diligence to protect your interests.",
  },
  {
    title: "Big Ideas Execution",
    body:
      "Learn the basics, assess your risk tolerance, understand the benefits of our nominee service and learn how seriously we take our due diligence to protect your interests.",
  },
  {
    title: "Markets Move—So Do We",
    body:
      "Learn the basics, assess your risk tolerance, understand the benefits of our nominee service and learn how seriously we take our due diligence to protect your interests.",
  },
];

const JOURNEY: Journey = {
  img: "/images/journey-hands.png", // change to your path
  alt: "Team collaboration",
  paragraphs: [
    "Proin quis lectus eget quam sagittis imperdiet vel a nunc. Nam quam quam, tincidunt eu sapien sed, tempus dapibus libero. Fusce finibus facilisis consectetur. Ut interdum leo enim, et aliquet turpis ullamcorper sit amet. Morbi in enim iaculis lorem volutpat cursus. In aliquam volutpat risus eget sodales. Duis feugiat consequat lorem, vitae efficitur lacus tincidunt eu. Sed sed fermentum odio.",
    "Nunc dapibus nunc in tellus dignissim, ut accumsan urna accumsan. Nullam vitae magna eu nisl ullamcorper efficitur nec id leo. Ut auctor nisi et nisi imperdiet, ac eleifend enim bibendum. Nulla vel nunc ac metus volutpat mollis.",
  ],
};

const TEAM: TeamMember[] = [
  {
    name: "Dinesh Mishra",
    role: "Co-founder & CEO",
    img: "/images/team1.webp",
    linkedin: "https://www.linkedin.com/in/username",
  },
  { name: "Priya Shah", role: "Co-founder & COO", img: "/images/team1.webp", linkedin: "https://www.linkedin.com/in/username" },
  { name: "Arjun Rao", role: "CTO", img: "/images/team1.webp", linkedin: "https://www.linkedin.com/in/username"  },
  { name: "Meera Iyer", role: "Head of Investments", img: "/images/team1.webp", linkedin: "https://www.linkedin.com/in/username"  },
];

const IMAGES: GalleryImage[] = [
  { src: "/images/gallery1.webp", alt: "Office" },
  { src: "/images/gallery2.webp", alt: "Team" },
  { src: "/images/gallery3.webp", alt: "Event" },
  { src: "/images/gallery4.webp", alt: "Event" },
  { src: "/images/gallery5.webp", alt: "Event" },
];

export default function About() {
  return (
    <>
      <PageTitle
        heading="We’re building the future of the private markets"
        description="Our mission is to bring the infrastructure and ease of public markets to the VC-backed asset class."
      />

      {/* Our Ethos */}
      <section className="appContainer py-8 md:py-14">
        <div className="md:flex md:gap-8">
            {/* left */}
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <Heading as="h2" className="mb-3 md:mb-5">Our Ethos</Heading>
            <span className="block h-px w-full -translate-y-[6px] bg-themeTealLighter" />
            </div>

            {/* right */}
            <div className="w-full md:w-2/3 min-w-0">
            <div className="grid gap-y-8 gap-x-8 sm:grid-cols-2">
                {ETHOS.map((e) => (
                <article key={e.title} className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-semibold text-themeTeal">{e.title}</h3>
                    <p className="text-themeTealLight leading-7">{e.body}</p>
                </article>
                ))}
            </div>
            </div>
        </div>
        </section>


      {/* Our Journey */}
      <section className="appContainer pb-12">
        <div className="rounded bg-themeTealWhite p-6 md:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_minmax(350px,70px)]">
            <div>
              <Heading as="h3" className="mb-5">Our Journey</Heading>
              <div className="space-y-6 text-themeTealLight leading-7 text-md">
                {JOURNEY.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/4] w-full overflow-hidden rounded">
              <Image
                src={JOURNEY.img}
                alt={JOURNEY.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="py-16 text-center">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <Heading as="h3" className="mb-3">Our Team</Heading>
                <p className="text-themeTealLight">Explore a dynamic range of top-performing unlisted stocks-from high-growth startups to established private giants. These are the companies shaping the future-now just a click away.</p>
            </div>
            <TeamGrid items={TEAM} />
        </div>

        <div className="py-16 text-center">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <Heading as="h3" className="mb-3">Life at Invest App</Heading>
                <p className="text-themeTealLight">Explore a dynamic range of top-performing unlisted stocks-from high-growth startups to established private giants. These are the companies shaping the future-now just a click away.</p>
            </div>
            <GalleryCarousel images={IMAGES}/>
            <Button text="See All Open Positions At Invest App" color="themeTeal" variant="solid" size="md" href='/' className="mt-10" />
        </div>
      </section>
    </>
  );
}
