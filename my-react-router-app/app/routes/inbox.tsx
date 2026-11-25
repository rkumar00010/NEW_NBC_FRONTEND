import { useEffect, useState } from "react";
import { Link } from "react-router";
import { TopBar } from "~/components/TopBar";
import { formatWhen } from "~/lib/data";
import { cx } from "~/lib/cx";
import { usePortal } from "~/lib/store";

export function meta() {
  return [{ title: "Mailbox · National Bonds Vendor Portal" }];
}

export default function Inbox() {
  const { state, markMailRead } = usePortal();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = state.mails.find((mail) => mail.id === selectedId) ?? state.mails[0] ?? null;

  useEffect(() => {
    if (selected) markMailRead(selected.id);
  }, [selected, markMailRead]);

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <TopBar active="mail" />
      <main className="mx-auto grid max-w-[1100px] gap-4 px-4 py-6 lg:grid-cols-[320px_1fr] lg:px-6">
        <section className="nb-card overflow-hidden">
          <div className="border-b border-[#eef2f6] px-4 py-3">
            <h1 className="text-base font-semibold">Portal mailbox</h1>
            <p className="text-xs text-[#8b95a8]">Messages created by this demo stay in the browser.</p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {state.mails.length === 0 && (
              <p className="px-4 py-8 text-sm text-[#6d7890]">
                No messages yet. Invite a vendor and the registration email will appear here.
              </p>
            )}
            {state.mails.map((mail) => (
              <button
                key={mail.id}
                className={cx(
                  "block w-full border-b border-[#f2f5f8] px-4 py-3 text-left",
                  selected?.id === mail.id ? "bg-[#fbf6e9]" : "hover:bg-[#f8fafc]",
                )}
                onClick={() => setSelectedId(mail.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cx("truncate text-sm", !mail.read && "font-semibold")}>{mail.toName}</span>
                  <span className="shrink-0 text-[11px] text-[#8b95a8]">{formatWhen(mail.createdAt)}</span>
                </div>
                <div className="truncate text-sm text-[#1c2740]">{mail.subject}</div>
                <div className="truncate text-xs text-[#8b95a8]">{mail.to}</div>
              </button>
            ))}
          </div>
        </section>
        <section className="nb-card min-h-[420px] p-6">
          {selected ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#a6853f]">
                From {selected.fromName}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{selected.subject}</h2>
              <p className="mt-1 text-sm text-[#6d7890]">
                To {selected.toName} &lt;{selected.to}&gt; · {formatWhen(selected.createdAt)}
              </p>
              <div className="mt-5 space-y-3 text-sm leading-6 text-[#24324d]">
                {selected.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {selected.link && (
                <Link to={selected.link} className="nb-gold mt-6">
                  {selected.linkLabel ?? "Open link"}
                </Link>
              )}
            </>
          ) : (
            <p className="text-sm text-[#6d7890]">Select a message to read it.</p>
          )}
        </section>
      </main>
    </div>
  );
}
