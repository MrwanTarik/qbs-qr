import { useTranslations } from "next-intl";
import {
  Container,
  SplitLeft,
  SplitRight,
  SplitView,
} from "@/components/Containers";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { cn } from "@/lib/utils";
import { GitHubButton } from "@/components/GitHubButton";
import { Badge } from "@/components/ui/badge";
import { LucideScan } from "lucide-react";
import { ScanButton } from "@/components/ScanButton";
import { Label } from "@/components/ui/label";
import { QrbtfLogo } from "@/components/Logos";
import { useState } from "react";
import { urlAtom } from "@/lib/states";
import { useAtom } from "jotai";
import { ContentSelector } from "@/components/hero/ContentSelector";
import { HeroLogo } from "@/components/Header";
import { TrackLink } from "@/components/TrackComponents";

export function SectionHero() {
  const t = useTranslations("index.hero");

  return (
    <div className="mt-10 lg:mt-16">
      <Container>
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold hidden">
            {t("title")}
          </h1>

          <HeroLogo />

          <SplitView className="gap-y-0">
            <SplitLeft>
              <div className="mt-6 w-full">
                <ContentSelector />
              </div>
            </SplitLeft>
            <SplitRight />
          </SplitView>
        </div>
      </Container>
    </div>
  );
}
