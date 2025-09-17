"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText, CreditCard, MapPin, Landmark, UserRoundCheck, Video, PenLine, Camera
} from "lucide-react";

type Props = { onContinue?: () => void; onBack?: () => void };

export default function KYCStep6VideoKYC({ onContinue, onBack }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // steps
  const steps = useMemo(
    () => [
      { label: "Documents", icon: FileText, href: "/kyc-process/step-1" },
      { label: "PAN Validation", icon: CreditCard, href: "/kyc-process/step-2" },
      { label: "Address Verification", icon: MapPin, href: "/kyc-process/step-3" },
      { label: "Bank Proof", icon: Landmark, href: "/kyc-process/step-4" },
      { label: "Demat Account", icon: UserRoundCheck, href: "/kyc-process/step-5" },
      { label: "Video KYC", icon: Video, href: "/kyc-process/step-6" },
      { label: "eSign & Consent", icon: PenLine, href: "/kyc-process/step-7" },
    ],
    []
  );
  const current = 5; // 0-based -> Step 6

  // camera
  const [started, setStarted] = useState(false);
  const [err, setErr] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startCamera() {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStarted(true);
    } catch (e) {
      setErr("Camera permission denied or unavailable.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStarted(false);
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

    const backHandler = onBack ? onBack : () => {
    const m = pathname.match(/step-(\d+)/);
    const curr = m ? Number(m[1]) : 6;
    router.push(`/kyc-process/step-${Math.max(1, curr - 1)}`);
    };

    const continueHandler = onContinue ? onContinue : () => {
    router.push("/kyc-process/step-7");
    };

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white p-4 sm:p-6 md:p-10 lg:p-16 rounded">
        {/* Steps */}
        <div className="-mx-4 px-4 mb-10 lg:mb-16 overflow-x-auto no-scrollbar">
          <div className="flex lg:justify-between gap-4 sm:gap-6 min-w-[680px] lg:min-w-0">
            {steps.map((s, i) => {
              const Icon = s.icon as any;
              const completed = i < current;
              const active = i === current;

              const item = (
                <div className="min-w-[88px] flex flex-col items-center text-center">
                  <div
                    className={[
                      "grid place-items-center rounded-full border-2 mb-2",
                      "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20",
                      completed
                        ? "bg-emerald-700 border-emerald-700 text-white"
                        : active
                        ? "bg-themeTeal border-themeTeal text-themeTealWhite"
                        : "bg-themeTealWhite border-themeTealLighter text-themeTealLighter opacity-50",
                    ].join(" ")}
                    aria-current={active ? "step" : undefined}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                  </div>
                  <span
                    className={[
                      "text-md",
                      completed
                        ? "text-emerald-700 font-semibold"
                        : active
                        ? "text-themeTeal font-semibold"
                        : "text-themeTealLighter opacity-50",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
                </div>
              );

              return completed ? (
                <Link key={s.label} href={s.href}>{item}</Link>
              ) : (
                <div key={s.label} aria-disabled className="pointer-events-none select-none">{item}</div>
              );
            })}
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-semibold font-serif text-center mb-2 text-themeTeal flex gap-2 items-center justify-center">
          <Video className="h-6 w-6 sm:h-7 sm:w-7 text-themeSkyBlue" />
          <span>Video KYC</span>
        </h2>
        <p className="text-center text-themeTealLighter mb-6 sm:mb-8">
          Complete your verification with a quick video call.
        </p>

        {/* Card */}
        <div className="bg-themeTealWhite border border-themeTealLighter rounded p-4 sm:p-6 md:p-8 lg:p-10">
          <h3 className="text-themeSkyBlue font-semibold text-base sm:text-lg">
            Step 6: Video Verification
          </h3>
          <p className="text-themeTealLighter text-xs sm:text-sm mb-6">
            Live verification to complete your KYC process.
          </p>

          <div className="mt-2 rounded border-2 border-dashed border-themeTealLighter bg-white p-4 sm:p-6">
            {!started ? (
              <div className="flex flex-col items-center text-center gap-4 py-10">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-themeTealWhite text-themeTeal">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-themeTeal font-semibold">Camera Setup Required</p>
                  <p className="text-themeTealLighter text-sm">
                    Ensure good lighting and a stable internet connection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-3 rounded font-medium bg-themeTeal text-themeTealWhite"
                >
                  Start Video KYC
                </button>
                {err && <p className="text-sm text-red-600">{err}</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="aspect-video w-full overflow-hidden rounded border border-themeTealLighter bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-themeTealLighter">Live preview</span>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 rounded border border-themeTealLighter text-themeTeal text-sm"
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:justify-between mt-6 sm:mt-8">
          <button
            type="button"
            onClick={backHandler}
            className="w-full sm:w-auto px-5 py-3 rounded border border-themeTealLighter text-themeTealLighter cursor-pointer hover:bg-themeTeal hover:text-themeTealWhite transition duration-500"
          >
            Back
          </button>
          <button
            type="button"
            onClick={continueHandler}
            disabled={!started}
            className={[
              "w-full sm:w-auto px-6 py-3 rounded font-medium",
              started
                ? "bg-themeSkyBlue text-themeTealWhite cursor-pointer"
                : "bg-themeTealLighter text-white cursor-not-allowed",
            ].join(" ")}
          >
            Continue to eSign & Consent
          </button>
        </div>
      </div>
    </section>
  );
}
