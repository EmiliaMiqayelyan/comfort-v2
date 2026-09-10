"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { PageHeader } from "@/features/admin/page-header";
import {
  Field,
  LocalizedInputs,
  Section,
  adminFieldClass,
  emptyLocalized,
} from "@/features/admin/form-ui";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { adminApi, catalogApi } from "@/lib/api";
import type { ContactMessage, ContactSettings, ContactShowroom, ContactSocial } from "@/types";

const emptyShowroom = (index = 0): ContactShowroom => ({
  id: `room-${Date.now()}-${index}`,
  name: "",
  address: "",
  hours: "",
  phone: "",
  mapEmbedUrl: "",
});

const emptySocial = (index = 0): ContactSocial => ({
  id: `social-${Date.now()}-${index}`,
  label: "",
  href: "",
});

const emptySettings = (): ContactSettings => ({
  title: emptyLocalized(),
  subtitle: emptyLocalized(),
  phones: [""],
  emails: [""],
  address: emptyLocalized(),
  hours: emptyLocalized(),
  socials: [emptySocial(0)],
  showrooms: [emptyShowroom(0)],
  mapEmbedUrl: "",
});

function normalizeLoaded(settings: ContactSettings): ContactSettings {
  return {
    title: settings.title ?? emptyLocalized(),
    subtitle: settings.subtitle ?? emptyLocalized(),
    phones: settings.phones?.length ? settings.phones : [""],
    emails: settings.emails?.length ? settings.emails : [""],
    address: settings.address ?? emptyLocalized(),
    hours: settings.hours ?? emptyLocalized(),
    socials: settings.socials?.length ? settings.socials : [emptySocial(0)],
    showrooms: settings.showrooms?.length
      ? settings.showrooms.map((room) => ({
          ...room,
          mapEmbedUrl: room.mapEmbedUrl ?? "",
        }))
      : [emptyShowroom(0)],
    mapEmbedUrl: settings.mapEmbedUrl ?? "",
  };
}

export default function AdminContactPage() {
  const t = useTranslations("admin");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<ContactSettings>(emptySettings());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.contactMessages().then((items) => setMessages(items)).catch(() => setMessages([]));
    catalogApi.contactSettings().then((next) => {
      if (next) setSettings(normalizeLoaded(next));
    });
  }, []);

  const updateShowroom = (index: number, patch: Partial<ContactShowroom>) => {
    setSettings((prev) => ({
      ...prev,
      showrooms: prev.showrooms.map((room, i) => (i === index ? { ...room, ...patch } : room)),
    }));
    setSaved(false);
  };

  const updateSocial = (index: number, patch: Partial<ContactSocial>) => {
    setSettings((prev) => ({
      ...prev,
      socials: prev.socials.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
    setSaved(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    const payload: ContactSettings = {
      ...settings,
      phones: settings.phones.map((item) => item.trim()).filter(Boolean),
      emails: settings.emails.map((item) => item.trim()).filter(Boolean),
      socials: settings.socials
        .map((item) => ({
          ...item,
          label: item.label.trim(),
          href: item.href.trim(),
        }))
        .filter((item) => item.label || item.href),
      showrooms: settings.showrooms
        .map((item) => ({
          ...item,
          name: item.name.trim(),
          address: item.address.trim(),
          hours: item.hours.trim(),
          phone: item.phone?.trim() || "",
          mapEmbedUrl: item.mapEmbedUrl?.trim() || "",
        }))
        .filter((item) => item.name || item.address),
      mapEmbedUrl: settings.mapEmbedUrl?.trim() || "",
    };
    const savedSettings = await adminApi.updateContactSettings(payload);
    setSettings(normalizeLoaded(savedSettings));
    setSaving(false);
    setSaved(true);
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader title={t("contactInbox")} description={t("contactInboxDesc")} />

        <Section title={t("contactRequests")}>
          <div className="space-y-3">
            {messages.length === 0 && <p className="text-sm text-muted-foreground">{t("noResults")}</p>}
            {messages.map((message) => (
              <article
                key={message.id}
                className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground"
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

        <div className="mt-8 space-y-8">
          <Section title={t("contactDetails")}>
            <LocalizedInputs
              label={t("pageTitle")}
              value={settings.title ?? emptyLocalized()}
              onChange={(title) => {
                setSettings({ ...settings, title });
                setSaved(false);
              }}
            />
            <div className="mt-4">
              <LocalizedInputs
                label={t("pageSubtitle")}
                value={settings.subtitle ?? emptyLocalized()}
                onChange={(subtitle) => {
                  setSettings({ ...settings, subtitle });
                  setSaved(false);
                }}
                multiline
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t("phones")}>
                <Input
                  value={settings.phones.join(", ")}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      phones: e.target.value.split(",").map((item) => item.trim()),
                    });
                    setSaved(false);
                  }}
                  className={adminFieldClass}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={settings.emails.join(", ")}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      emails: e.target.value.split(",").map((item) => item.trim()),
                    });
                    setSaved(false);
                  }}
                  className={adminFieldClass}
                />
              </Field>
            </div>

            <div className="mt-4">
              <LocalizedInputs
                label={t("address")}
                value={settings.address}
                onChange={(address) => {
                  setSettings({ ...settings, address });
                  setSaved(false);
                }}
              />
            </div>
            <div className="mt-4">
              <LocalizedInputs
                label={t("hours")}
                value={settings.hours}
                onChange={(hours) => {
                  setSettings({ ...settings, hours });
                  setSaved(false);
                }}
              />
            </div>

            <Field label={t("mapEmbedUrl")}>
              <Input
                value={settings.mapEmbedUrl ?? ""}
                onChange={(e) => {
                  setSettings({ ...settings, mapEmbedUrl: e.target.value });
                  setSaved(false);
                }}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className={adminFieldClass}
              />
              <p className="mt-2 text-xs text-muted-foreground">{t("mapEmbedHint")}</p>
            </Field>
          </Section>

          <Section title={t("socials")}>
            <div className="space-y-4">
              {settings.socials.map((item, index) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-2xl border border-border bg-muted/30 p-4 md:grid-cols-[1fr_1fr_auto]"
                >
                  <Field label={t("socialLabel")}>
                    <Input
                      value={item.label}
                      onChange={(e) => updateSocial(index, { label: e.target.value })}
                      className={adminFieldClass}
                    />
                  </Field>
                  <Field label={t("socialUrl")}>
                    <Input
                      value={item.href}
                      onChange={(e) => updateSocial(index, { href: e.target.value })}
                      className={adminFieldClass}
                    />
                  </Field>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={settings.socials.length <= 1}
                      onClick={() => {
                        setSettings((prev) => ({
                          ...prev,
                          socials: prev.socials.filter((_, i) => i !== index),
                        }));
                        setSaved(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    socials: [...prev.socials, emptySocial(prev.socials.length)],
                  }));
                  setSaved(false);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("addSocial")}
              </Button>
            </div>
          </Section>

          <Section title={t("showrooms")}>
            <p className="text-xs text-muted-foreground">{t("showroomsHint")}</p>
            <div className="mt-4 space-y-4">
              {settings.showrooms.map((room, index) => (
                <div
                  key={room.id}
                  className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {t("showrooms")} {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={settings.showrooms.length <= 1}
                      onClick={() => {
                        setSettings((prev) => ({
                          ...prev,
                          showrooms: prev.showrooms.filter((_, i) => i !== index),
                        }));
                        setSaved(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1">{t("removeShowroom")}</span>
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label={t("showroomName")}>
                      <Input
                        value={room.name}
                        onChange={(e) => updateShowroom(index, { name: e.target.value })}
                        className={adminFieldClass}
                      />
                    </Field>
                    <Field label={t("phones")}>
                      <Input
                        value={room.phone ?? ""}
                        onChange={(e) => updateShowroom(index, { phone: e.target.value })}
                        className={adminFieldClass}
                      />
                    </Field>
                    <Field label={t("address")}>
                      <Input
                        value={room.address}
                        onChange={(e) => updateShowroom(index, { address: e.target.value })}
                        className={adminFieldClass}
                      />
                    </Field>
                    <Field label={t("hours")}>
                      <Input
                        value={room.hours}
                        onChange={(e) => updateShowroom(index, { hours: e.target.value })}
                        className={adminFieldClass}
                      />
                    </Field>
                  </div>
                  <Field label={t("mapEmbedUrl")}>
                    <Input
                      value={room.mapEmbedUrl ?? ""}
                      onChange={(e) => updateShowroom(index, { mapEmbedUrl: e.target.value })}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      className={adminFieldClass}
                    />
                  </Field>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    showrooms: [...prev.showrooms, emptyShowroom(prev.showrooms.length)],
                  }));
                  setSaved(false);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("addShowroom")}
              </Button>
            </div>
          </Section>

          <div>
            <Button type="button" onClick={saveSettings} disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
            {saved && <p className="mt-3 text-sm text-accent">{t("saved")}</p>}
          </div>
        </div>
      </AdminShell>
    </AuthGate>
  );
}
