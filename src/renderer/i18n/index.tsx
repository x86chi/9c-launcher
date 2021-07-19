import { tx } from "@transifex/native";
import { useLanguages } from "@transifex/react";
import React, { createContext, useEffect, useState } from "react";
import { configStore, TRANSIFEX_TOKEN } from "../../config";

interface LocaleContext {
  locale: string;
}

const context = createContext<LocaleContext>({
  locale: "en",
});

const { Provider } = context;

export function LocaleProvider({ children }: React.PropsWithChildren<{}>) {
  const [locale, setLocale] = useState(() => configStore.get("Locale"));

  useEffect(() => {
    const unsubscribe = configStore.onDidChange("Locale", (v) =>
      setLocale(v ?? "en")
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!tx.token)
      tx.init({
        token: TRANSIFEX_TOKEN,
      });
    tx.setCurrentLocale(locale);

    validateLocale(locale).then((valid) => valid || setLocale("en"));

    configStore.set("Locale", locale);
  }, [locale]);

  return <Provider value={{ locale }}>{children}</Provider>;
}

export async function validateLocale(locale: string): Promise<boolean> {
  const languages = await tx.getLanguages();
  return languages.some((lang: Record<"code", string>) => {
    return locale.startsWith(lang.code.replace('_', '-'));
  });
}
