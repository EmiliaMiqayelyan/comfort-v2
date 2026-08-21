"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { PageHeader } from "@/features/admin/page-header";
import { Field, Section, adminFieldClass } from "@/features/admin/form-ui";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Button } from "@/components/atoms/button";
import { adminApi, catalogApi } from "@/lib/api";
import type { ContactMessage, ContactSettings } from "@/types";

const emptySettings = (): ContactSettings => ({
  phones: [""],
  emails: [""],
  address: { en: "", ru: "", am: "" },
  hours: { en: "", ru: "", am: "" },
  socials: [{ id: "instagram", label: "Instagram", href: "" }],
  showrooms: [{ id: "main", name: "", address: "", hours: "", phone: "" }],
});

export default function AdminContactPage() {
  const t = useTranslations("admin");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<ContactSettings>(emptySettings());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.contactMessages().then((items) => setMessages(items)).catch(() => setMessages([]));
    catalogApi.contactSettings().then((next) => {
      if (next) setSettings(next);
    });
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    await adminApi.updateContactSettings(settings);
    setSaving(false);
    setSaved(true);
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader title={t("contactInbox")} description={t("contactInboxDesc")} />

        <Section title={t("contactRequests")}>
          <div className="space-y-3">
            {messages.length === 0 && <p className="text-sm text-foreground0">{t("noResults")}</p>}
            {messages.map((message) => (
              <article
                key={message.id}
                className="rounded-2xl border border-border bg-white p-4 text-sm text-foreground"
              >
                <p className="font-medium text-foreground">
                  {message.name} · {message.email}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {[message.phone, message.company].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-foreground/80">{message.message}</p>
              </article>
            ))}
          </div>
        </Section>

        <div className="mt-8">
          <Section title={t("contactDetails")}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("phones")}>
                <Input
                  value={settings.phones.join(", ")}
                  onChange={(e) =>
                    setSettings({ ...settings, phones: e.target.value.split(",").map((item) => item.trim()) })
                  }
                  className={adminFieldClass}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={settings.emails.join(", ")}
                  onChange={(e) =>
                    setSettings({ ...settings, emails: e.target.value.split(",").map((item) => item.trim()) })
                  }
                  className={adminFieldClass}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(["am", "ru", "en"] as const).map((locale) => (
                <Field key={locale} label={`${t("address")} (${locale})`}>
                  <Input
                    value={settings.address[locale]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        address: { ...settings.address, [locale]: e.target.value },
                      })
                    }
                    className={adminFieldClass}
                  />
                </Field>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(["am", "ru", "en"] as const).map((locale) => (
                <Field key={locale} label={`${t("hours")} (${locale})`}>
                  <Input
                    value={settings.hours[locale]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hours: { ...settings.hours, [locale]: e.target.value },
                      })
                    }
                    className={adminFieldClass}
                  />
                </Field>
              ))}
            </div>
            <Field label={t("socials")}>
              <Textarea
                value={settings.socials.map((item) => `${item.label}|${item.href}`).join("\n")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socials: e.target.value.split("\n").filter(Boolean).map((line, index) => {
                      const [label, href] = line.split("|");
                      return {
                        id: settings.socials[index]?.id || `s-${index}`,
                        label: (label || "").trim(),
                        href: (href || "").trim(),
                      };
                    }),
                  })
                }
                className={adminFieldClass}
              />
              <p className="mt-2 text-xs text-foreground0">{t("socialsHint")}</p>
            </Field>
            <Field label={t("showrooms")}>
              <Textarea
                value={settings.showrooms
                  .map((item) => [item.name, item.address, item.hours, item.phone].join(" | "))
                  .join("\n")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showrooms: e.target.value.split("\n").filter(Boolean).map((line, index) => {
                      const [name, address, hours, phone] = line.split("|").map((part) => part.trim());
                      return {
                        id: settings.showrooms[index]?.id || `room-${index}`,
                        name: name || "",
                        address: address || "",
                        hours: hours || "",
                        phone: phone || "",
                      };
                    }),
                  })
                }
                className={adminFieldClass}
              />
              <p className="mt-2 text-xs text-foreground0">{t("showroomsHint")}</p>
            </Field>
            <Button type="button" onClick={saveSettings} disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
            {saved && <p className="mt-3 text-sm text-accent">{t("saved")}</p>}
          </Section>
        </div>
      </AdminShell>
    </AuthGate>
  );
}
