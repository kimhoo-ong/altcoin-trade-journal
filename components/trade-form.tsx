"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AL_BROOKS_SETUPS,
  STOP_LOSS_OPTIONS,
  TAKE_PROFIT_OPTIONS,
  TRADE_DIRECTIONS
} from "@/lib/types";
import { getTakeProfitLabel } from "@/lib/utils";

const initialMessage = "";

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image."));
      img.src = imageUrl;
    });

    const maxWidth = 2200;
    const ratio = Math.min(1, maxWidth / image.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * ratio);
    canvas.height = Math.round(image.height * ratio);

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not prepare image compression.");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    if (!blob) {
      throw new Error("Could not compress screenshot.");
    }

    if (blob.size >= file.size) {
      return file;
    }

    const safeName = file.name.replace(/\.[^.]+$/, "") || "trade-screenshot";
    return new File([blob], `${safeName}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function TradeForm() {
  const router = useRouter();
  const [setup, setSetup] = useState<string>(AL_BROOKS_SETUPS[0]);
  const [direction, setDirection] = useState<(typeof TRADE_DIRECTIONS)[number]>(TRADE_DIRECTIONS[0]);
  const [message, setMessage] = useState(initialMessage);
  const [fileLabel, setFileLabel] = useState("Optional: screenshot will be compressed before upload.");
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setCompressedFile(null);
      setFileLabel("Optional: screenshot will be compressed before upload.");
      return;
    }

    try {
      const optimized = await compressImage(file);
      setCompressedFile(optimized);
      const mb = (optimized.size / 1024 / 1024).toFixed(2);
      setFileLabel(`${optimized.name} ready (${mb} MB, ${optimized === file ? "original" : "optimized"})`);
    } catch (error) {
      setCompressedFile(null);
      setFileLabel(error instanceof Error ? error.message : "Screenshot compression failed.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (compressedFile) {
      formData.set("screenshot", compressedFile);
    }

    setMessage(initialMessage);

    startTransition(async () => {
      const response = await fetch("/api/trades", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Could not create trade." }));
        setMessage(payload.error || "Could not create trade.");
        return;
      }

      form.reset();
      setSetup(AL_BROOKS_SETUPS[0]);
      setDirection(TRADE_DIRECTIONS[0]);
      setCompressedFile(null);
      setInputKey((value) => value + 1);
      setFileLabel("Optional: screenshot will be compressed before upload.");
      setMessage("Trade recorded.");
      router.refresh();
    });
  }

  return (
    <section className="panel">
      <div className="sectionHeading">
        <p className="eyebrow">New</p>
        <h2>Add trade</h2>
      </div>
      <form className="tradeForm" onSubmit={handleSubmit}>
        <label>
          Setup
          <select name="setup" value={setup} onChange={(event) => setSetup(event.target.value)}>
            {AL_BROOKS_SETUPS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        {setup === "Other" ? (
          <label>
            Custom setup name
            <input name="customSetup" type="text" placeholder="e.g. Opening reversal" required />
          </label>
        ) : null}

        <label>
          Direction
          <select name="direction" value={direction} onChange={(event) => setDirection(event.target.value as (typeof TRADE_DIRECTIONS)[number])}>
            {TRADE_DIRECTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Stop loss
          <select name="stopLossType" defaultValue={STOP_LOSS_OPTIONS[0]}>
            {STOP_LOSS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Take profit
          <select name="takeProfitType" defaultValue={TAKE_PROFIT_OPTIONS[0]}>
            {TAKE_PROFIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {getTakeProfitLabel(option, direction)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Screenshot
          <input key={inputKey} name="screenshot" type="file" accept="image/*" onChange={handleFileChange} />
          <span className="fieldHint">{fileLabel}</span>
        </label>

        <label className="fullWidth">
          Notes
          <textarea name="notes" rows={4} placeholder="Why did you take the trade?" />
        </label>

        <div className="formActions">
          <button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </button>
          {message ? <p className="formMessage">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}
