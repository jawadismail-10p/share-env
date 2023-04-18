"use client";

import { Fragment, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import { Title } from "../components/title";
import {
  Cog6ToothIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { encrypt } from "@/src/services/encryption";
import { toBase58 } from "@/src/lib/utils";
import { encodeCompositeKey } from "@/src/services/encode";
import { LATEST_KEY_VERSION } from "@/src/lib/constants";
import { ErrorMessage } from "../components/error";

export default function Share() {
  const [text, setText] = useState("");
  const [messageHeight, setMessageHeight] = useState(44);
  const [reads, setReads] = useState(999);
  const [ttl, setTtl] = useState(7);
  const [loading, setLoading] = useState(false);
  const [ttlMultiplier, setTtlMultiplier] = useState(60 * 60 * 24);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const onSubmit = async () => {
    try {
      setError("");
      setLink("");
      setLoading(true);
      const textCleaned = text.trim();

      const { encrypted, iv, key } = await encrypt(textCleaned);

      const { id } = (await fetch("/api/store", {
        method: "POST",
        body: JSON.stringify({
          ttl: ttl * ttlMultiplier,
          reads,
          encrypted: toBase58(encrypted),
          iv: toBase58(iv),
        }),
      }).then((r) => r.json())) as { id: string };

      const compositeKey = encodeCompositeKey(LATEST_KEY_VERSION, id, key);

      const url = new URL(window.location.href);
      url.pathname = "/unseal";
      url.hash = compositeKey;
      setCopied(false);
      setLink(url.toString());
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-8 mx-auto mt-16 lg:mt-32 ">
      {error ? <ErrorMessage message={error} /> : null}

      {link ? (
        <div className="flex flex-col items-center justify-center w-full h-full mt-8 md:mt-16 xl:mt-32">
          <Title>Share this link with others</Title>
          <div className="relative flex items-stretch flex-grow mt-16 focus-within:z-10">
            <pre className="px-4 py-3 font-mono text-center bg-transparent border rounded border-zinc-600 focus:border-zinc-100/80 focus:ring-0 sm:text-sm text-zinc-100">
              {link}
            </pre>
            <button
              type="button"
              className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium duration-150 border text-zinc-700 border-zinc-300 rounded-r-md bg-zinc-50 hover focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 hover:text-zinc-900 hover:bg-white"
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopied(true);
              }}
            >
              {copied ? (
                <ClipboardDocumentCheckIcon
                  className="w-5 h-5"
                  aria-hidden="true"
                />
              ) : (
                <ClipboardDocumentIcon className="w-5 h-5" aria-hidden="true" />
              )}{" "}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      ) : (
        <form
          className="max-w-3xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.length <= 0) return;
            onSubmit();
          }}
        >
          <Title>Encrypt and Share</Title>
          <pre className="px-4 py-3 mt-8 font-mono text-left bg-transparent border rounded border-zinc-600 focus:border-zinc-100/80 focus:ring-0 sm:text-sm text-zinc-100">
            <div className="flex items-start px-1 text-sm">
              <div
                aria-hidden="true"
                className="pr-4 font-mono border-r select-none border-zinc-300/5 text-zinc-700"
              >
                {Array.from({
                  length: text.split("\n").length,
                }).map((_, index) => (
                  <Fragment key={index}>
                    {(index + 1).toString().padStart(2, "0")}
                    <br />
                  </Fragment>
                ))}
              </div>
              <ReactTextareaAutosize
                minRows={1}
                className="w-full p-0 text-base bg-transparent border-0 appearance-none resize-none hover:resize text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
                placeholder="DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres"
                onChange={(e) => setText(e.target.value)}
                onHeightChange={(height) => setMessageHeight(height)}
              />
            </div>
          </pre>
          <div className="flex flex-col items-center justify-center w-full gap-4 mt-4 sm:flex-row">
            <div className="w-full h-16 px-3 py-2 duration-150 border rounded sm:w-1/2 hover:border-zinc-100/80 border-zinc-600 focus-within:border-zinc-100/80 focus-within:ring-0 ">
              <label
                htmlFor="reads"
                className="block text-xs font-medium text-zinc-100"
              >
                <div className="flex flex-row items-center">
                  <span>READS</span>
                  <InformationCircleIcon
                    className="w-3 h-3 ml-1"
                    onClick={() => {}}
                  />
                </div>
              </label>
              <input
                type="number"
                min={0}
                name="reads"
                id="reads"
                className="w-full p-0 text-base bg-transparent border-0 appearance-none text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
                value={reads}
                onChange={(e) => setReads(e.target.valueAsNumber)}
              />
            </div>
            <div className="relative w-full h-16 px-3 py-2 duration-150 border rounded sm:w-1/2 hover:border-zinc-100/80 border-zinc-600 focus-within:border-zinc-100/80 focus-within:ring-0 ">
              <label
                htmlFor="reads"
                className="block text-xs font-medium text-zinc-100"
              >
                <div className="flex flex-row items-center">
                  <span>TTL</span>
                  <InformationCircleIcon
                    className="w-3 h-3 ml-1"
                    onClick={() => {}}
                  />
                </div>
              </label>
              <input
                type="number"
                min={0}
                name="reads"
                id="reads"
                className="w-full p-0 text-base bg-transparent border-0 appearance-none text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
                value={ttl}
                onChange={(e) => setTtl(e.target.valueAsNumber)}
              />
              <div className="absolute inset-y-0 right-1 flex items-center">
                <label htmlFor="ttlMultiplier" className="sr-only" />
                <select
                  id="ttlMultiplier"
                  name="ttlMultiplier"
                  className="h-full py-0 pl-2 bg-transparent border-0 border-transparent rounded pr-7 text-zinc-500 focus:ring-0 sm:text-sm"
                  onChange={(e) => setTtlMultiplier(parseInt(e.target.value))}
                  defaultValue={60 * 60 * 24}
                >
                  <option value={60}>{ttl === 1 ? "Minute" : "Minutes"}</option>
                  <option value={60 * 60}>
                    {ttl === 1 ? "Hour" : "Hours"}
                  </option>
                  <option value={60 * 60 * 24}>
                    {ttl === 1 ? "Day" : "Days"}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || text.length <= 0}
            className={`mt-6 w-full h-12 inline-flex justify-center items-center  transition-all  rounded px-4 py-1.5 md:py-2 text-base font-semibold leading-7    bg-zinc-200 ring-1 ring-transparent duration-150   ${
              text.length <= 0
                ? "text-zinc-400 cursor-not-allowed"
                : "text-zinc-900 hover:text-zinc-100 hover:ring-zinc-600/80  hover:bg-zinc-900/20"
            } ${loading ? "animate-pulse" : ""}`}
          >
            <span>
              {loading ? (
                <Cog6ToothIcon className="w-5 h-5 animate-spin" />
              ) : (
                "Share"
              )}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
