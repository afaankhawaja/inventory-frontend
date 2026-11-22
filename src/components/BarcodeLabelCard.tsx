import React, { useMemo } from "react";
import { Button, message, Tooltip } from "antd";
import { CopyOutlined, PrinterOutlined } from "@ant-design/icons";
import styled from "styled-components";

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

function encodeCode128B(text: string): { bars: Array<{ x: number; w: number }>; width: number } {
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

const Container = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background: rgba(128, 128, 128, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SectionLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.65;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StickerSurface = styled.div`
  background: #ffffff;
  color: #1d1d1f;
  border-radius: 10px;
  padding: 14px 16px 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const BarcodeText = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.14em;
  color: #1d1d1f;
  font-weight: 600;
`;

interface BarcodeLabelCardProps {
  barcode?: string;
  itemName?: string;
  brand?: string;
  category?: string;
  price?: string;
}

const BarcodeLabelCard: React.FC<BarcodeLabelCardProps> = ({
  barcode,
  itemName,
  brand,
  category,
  price,
}) => {
  const encoded = useMemo(() => {
    if (!barcode) return null;
    return encodeCode128B(barcode);
  }, [barcode]);

  if (!barcode || !encoded) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(barcode);
      message.success("Barcode copied to clipboard");
    } catch {
      message.error("Could not copy barcode");
    }
  };

  const handlePrint = () => {
    const svgBars = encoded.bars
      .map((b) => `<rect x="${b.x}" y="0" width="${b.w}" height="48" fill="#000" />`)
      .join("");

    const printWindow = window.open("", "_blank", "width=460,height=340");
    if (!printWindow) {
      message.warning("Please allow pop-ups to print the asset label");
      return;
    }

    const esc = (s?: string) =>
      (s || "").replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
      );

    printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Asset Label — ${esc(itemName || barcode)}</title>
    <style>
      @page { margin: 12mm; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
        margin: 0;
        padding: 24px;
        display: flex;
        justify-content: center;
        color: #111;
      }
      .label {
        width: 320px;
        border: 1.5px solid #111;
        border-radius: 10px;
        padding: 14px 16px;
        box-sizing: border-box;
      }
      .title {
        font-size: 14px;
        font-weight: 700;
        margin: 0 0 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .meta {
        font-size: 11px;
        color: #555;
        margin: 0 0 10px;
        display: flex;
        justify-content: space-between;
      }
      .barcode-wrap {
        text-align: center;
        padding-top: 6px;
        border-top: 1px dashed #ccc;
      }
      .code {
        font-family: ui-monospace, monospace;
        font-size: 11px;
        letter-spacing: 0.14em;
        font-weight: 600;
        margin-top: 4px;
      }
    </style>
  </head>
  <body>
    <div class="label">
      <p class="title">${esc(itemName || "Inventory Asset")}</p>
      <div class="meta">
        <span>${esc([brand, category].filter(Boolean).join(" • ") || "Asset Tag")}</span>
        <strong>${esc(price)}</strong>
      </div>
      <div class="barcode-wrap">
        <svg viewBox="0 0 ${encoded.width} 48" width="100%" height="56" preserveAspectRatio="none">
          ${svgBars}
        </svg>
        <div class="code">${esc(barcode)}</div>
      </div>
    </div>
    <script>
      window.onload = function () {
        window.print();
        window.onafterprint = function () { window.close(); };
      };
    </script>
  </body>
</html>`);
    printWindow.document.close();
  };

  return (
    <Container>
      <HeaderRow>
        <SectionLabel>Asset Barcode (Code 128)</SectionLabel>
        <Actions>
          <Tooltip title="Copy barcode">
            <Button size="small" icon={<CopyOutlined />} onClick={handleCopy} />
          </Tooltip>
          <Button
            size="small"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Print Asset Label
          </Button>
        </Actions>
      </HeaderRow>

      <StickerSurface>
        <svg
          viewBox={`0 0 ${encoded.width} 48`}
          style={{ width: "100%", maxWidth: 280, height: 54 }}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Barcode ${barcode}`}
        >
          {encoded.bars.map((bar, idx) => (
            <rect
              key={idx}
              x={bar.x}
              y={0}
              width={bar.w}
              height={48}
              fill="#1D1D1F"
            />
          ))}
        </svg>
        <BarcodeText>{barcode}</BarcodeText>
      </StickerSurface>
    </Container>
  );
};

export default BarcodeLabelCard;
