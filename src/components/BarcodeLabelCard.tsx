import React, { useMemo } from "react";
import { Button, message, Tooltip } from "antd";
import { CopyOutlined, LinkOutlined, PrinterOutlined } from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";
import styled from "styled-components";
import {
  copyToClipboard,
  encodeCode128B,
  getItemDeepLink,
  printAssetLabels,
} from "../utils/barcode";

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
  flex-wrap: wrap;
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
  padding: 14px 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
`;

const BarcodeColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const QrColumn = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-left: 12px;
  border-left: 1px dashed rgba(0, 0, 0, 0.14);
`;

const QrCaption = styled.span`
  font-size: 10px;
  color: #6e6e73;
  font-weight: 500;
`;

const BarcodeText = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11.5px;
  letter-spacing: 0.12em;
  color: #1d1d1f;
  font-weight: 600;
  word-break: break-all;
  text-align: center;
`;

interface BarcodeLabelCardProps {
  itemId?: string;
  barcode?: string;
  itemName?: string;
  brand?: string;
  category?: string;
  price?: string;
}

const BarcodeLabelCard: React.FC<BarcodeLabelCardProps> = ({
  itemId,
  barcode,
  itemName,
  brand,
  category,
  price,
}) => {
  const codeValue = barcode || itemId;

  const encoded = useMemo(() => {
    if (!codeValue) return null;
    return encodeCode128B(codeValue);
  }, [codeValue]);

  if (!codeValue || !encoded) {
    return null;
  }

  const deepLink = itemId ? getItemDeepLink(itemId) : codeValue;

  const handleCopyBarcode = async () => {
    const ok = await copyToClipboard(codeValue);
    if (ok) {
      message.success("Barcode copied to clipboard");
    } else {
      message.error("Could not copy barcode");
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(deepLink);
    if (ok) {
      message.success("Item deep-link copied");
    } else {
      message.error("Could not copy link");
    }
  };

  const handlePrint = () => {
    const ok = printAssetLabels([
      {
        itemId: itemId || codeValue,
        name: itemName || "Inventory Asset",
        brand,
        category,
        price,
        barcode: codeValue,
      },
    ]);
    if (!ok) {
      message.error("Unable to open print dialog");
    }
  };

  return (
    <Container>
      <HeaderRow>
        <SectionLabel>Asset Tag · Barcode & QR</SectionLabel>
        <Actions>
          <Tooltip title="Copy barcode">
            <Button size="small" icon={<CopyOutlined />} onClick={handleCopyBarcode} />
          </Tooltip>
          {itemId && (
            <Tooltip title="Copy QR deep-link">
              <Button size="small" icon={<LinkOutlined />} onClick={handleCopyLink} />
            </Tooltip>
          )}
          <Button
            size="small"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Print Label
          </Button>
        </Actions>
      </HeaderRow>

      <StickerSurface>
        <BarcodeColumn>
          <svg
            viewBox={`0 0 ${encoded.width} 48`}
            style={{ width: "100%", maxWidth: 220, height: 50 }}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Barcode ${codeValue}`}
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
          <BarcodeText>{codeValue}</BarcodeText>
        </BarcodeColumn>

        {itemId && (
          <QrColumn>
            <QRCodeSVG
              value={deepLink}
              size={60}
              level="M"
              bgColor="#ffffff"
              fgColor="#1D1D1F"
            />
            <QrCaption>Scan Link</QrCaption>
          </QrColumn>
        )}
      </StickerSurface>
    </Container>
  );
};

export default BarcodeLabelCard;
