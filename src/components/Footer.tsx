import { Container } from "@/components/Containers";
import Link from "next/link";
import {
  NextIntlClientProvider,
  useMessages,
  useTranslations,
} from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ModeToggle } from "@/components/ModeToggle";
import pick from "lodash/pick";
import { SectionStylesClient } from "@/app/[locale]/SectionStylesClient";
import React from "react";
import { TrackLink } from "@/components/TrackComponents";

export function Footer() {
  const t = useTranslations("footer");
  const messages = useMessages();

  return <></>;
}
