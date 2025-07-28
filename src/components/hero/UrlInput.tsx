"use client";

import { useAtom } from "jotai";
import { Input } from "@/components/ui/input";
import { urlAtom } from "@/lib/states";

export function UrlInput() {
  const [url, setUrl] = useAtom(urlAtom);

  // Get dynamic placeholder based on current domain
  const getPlaceholder = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://example.com";
  };

  return (
    <>
      <Input
        placeholder={getPlaceholder()}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
    </>
  );
}
