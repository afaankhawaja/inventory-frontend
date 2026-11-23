import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";

/**
 * Standard Code 128B encoding patterns (indices 0-106).
 * Each string represents alternating bar/space module widths.
 */
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

export function encodeCode128B(text: string): {
  bars: Array<{ x: number; w: number }>;
  width: number;
} {
  const sanitized = text.replace(/[^\x20-\x7E]/g, "?");
  const codes: number[] = [104]; // Start Code B
  let checksum = 104;

  for (let i = 0; i < sanitized.length; i++) {
    const val = sanitized.charCodeAt(i) - 32;
    codes.push(val);
    checksum += val * (i + 1);
  }

  codes.push(checksum % 103); // Check digit
  codes.push(106); // Stop pattern

  const quietZone = 10;
  let x = quietZone;
  const bars: Array<{ x: number; w: number }> = [];

  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    for (let i = 0; i < pattern.length; i++) {
      const moduleWidth = Number(pattern[i]);
      if (i % 2 === 0) {
        bars.push({ x, w: moduleWidth });
      }
      x += moduleWidth;
    }
  }

  return { bars, width: x + quietZone };
}

export function getItemDeepLink(itemId: string): string {
  if (typeof window === "undefined") return `/inventory-list?item=${encodeURIComponent(itemId)}`;
  return `${window.location.origin}/inventory-list?item=${encodeURIComponent(itemId)}`;
}

/**
 * Parses a scanned string. Supports either raw barcodes or deep-link QR URLs
 * such as `https://host/inventory-list?item=<itemId>`.
 */
export function parseScannedCode(raw: string): { code: string; itemIdFromUrl?: string } {
  const trimmed = raw.trim();
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      const itemParam = url.searchParams.get("item");
      if (itemParam) {
        return { code: trimmed, itemIdFromUrl: itemParam };
      }
    }
  } catch {
    // Not a valid URL; treat as raw barcode
  }
  return { code: trimmed };
}

/**
 * Safari-safe clipboard copy with textarea fallback for non-HTTPS or older contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy execCommand fallback
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export interface PrintableLabelItem {
  itemId: string;
  name: string;
  brand?: string;
  category?: string;
  price?: string;
  barcode?: string;
}

const escHtml = (s?: string) =>
  (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
  );

/**
 * Prints via a hidden iframe rather than window.open() so Safari's pop-up blocker
 * never blocks asset label printing.
 */
export function printHtmlDocument(html: string): boolean {
  try {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      return false;
    }

    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(cleanup, 1500);
      }
    };

    if (iframe.contentWindow.document.readyState === "complete") {
      setTimeout(triggerPrint, 80);
    } else {
      iframe.onload = () => setTimeout(triggerPrint, 80);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Generates and prints one or more asset labels (Code 128B barcode + QR deep-link)
 * formatted for standard thermal / Avery label sheets.
 */
export function printAssetLabels(items: PrintableLabelItem[]): boolean {
  if (items.length === 0) return false;

  const cardsHtml = items
    .map((item) => {
      const codeValue = item.barcode || item.itemId;
      const encoded = encodeCode128B(codeValue);
      const svgBars = encoded.bars
        .map((b) => `<rect x="${b.x}" y="0" width="${b.w}" height="44" fill="#000" />`)
        .join("");

      const qrSvg = renderToStaticMarkup(
        React.createElement(QRCodeSVG, {
          value: getItemDeepLink(item.itemId),
          size: 58,
          level: "M",
          bgColor: "#ffffff",
          fgColor: "#111111",
        }),
      );

      return `
        <div class="label">
          <div class="top">
            <div class="info">
              <p class="title">${escHtml(item.name || "Inventory Asset")}</p>
              <div class="meta">
                <span>${escHtml([item.brand, item.category].filter(Boolean).join(" • ") || "Asset Tag")}</span>
                <strong>${escHtml(item.price)}</strong>
              </div>
            </div>
            <div class="qr">${qrSvg}</div>
          </div>
          <div class="barcode-wrap">
            <svg viewBox="0 0 ${encoded.width} 44" width="100%" height="44" preserveAspectRatio="none">
              ${svgBars}
            </svg>
            <div class="code">${escHtml(codeValue)}</div>
          </div>
        </div>
      `;
    })
    .join("");

  const isSingle = items.length === 1;
  const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Asset Labels (${items.length})</title>
    <style>
      @page { margin: 10mm; }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        margin: 0;
        padding: 12px;
        color: #111;
        background: #fff;
      }
      .grid {
        display: grid;
        grid-template-columns: ${isSingle ? "320px" : "repeat(2, minmax(0, 1fr))"};
        gap: 12px;
        justify-content: ${isSingle ? "center" : "stretch"};
      }
      .label {
        border: 1.25px solid #111;
        border-radius: 8px;
        padding: 10px 12px;
        break-inside: avoid;
        page-break-inside: avoid;
        background: #fff;
      }
      .top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 8px;
      }
      .info { min-width: 0; flex: 1; }
      .title {
        font-size: 13px;
        font-weight: 700;
        margin: 0 0 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .meta {
        font-size: 10.5px;
        color: #444;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .qr {
        flex-shrink: 0;
        line-height: 0;
      }
      .barcode-wrap {
        text-align: center;
        padding-top: 6px;
        border-top: 1px dashed #ccc;
      }
      .code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10.5px;
        letter-spacing: 0.12em;
        font-weight: 600;
        margin-top: 3px;
      }
    </style>
  </head>
  <body>
    <div class="grid">${cardsHtml}</div>
  </body>
</html>`;

  return printHtmlDocument(html);
}
