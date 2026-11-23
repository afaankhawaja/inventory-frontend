import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Modal,
  Segmented,
  Select,
  Space,
  Typography,
  type InputRef,
} from "antd";
import {
  CameraOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  type CameraDevice,
} from "html5-qrcode";
import styled from "styled-components";
import { parseScannedCode } from "../../utils/barcode";

export type ScanActionMode = "lookup" | "out" | "in";

export interface ScannableItem {
  itemId: string;
  name: string;
  barcode?: string;
  quantity_in_stock?: number;
}

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  items: ScannableItem[];
  outstandingByItem: Map<string, number>;
  onLookupItem: (itemId: string) => void;
  onCheckItem: (itemId: string, mode: "in" | "out") => void;
  onCreateWithBarcode: (barcode: string) => void;
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 6px;
`;

const TopControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

const ViewfinderShell = styled.div`
  position: relative;
  width: 100%;
  min-height: 250px;
  border-radius: 14px;
  overflow: hidden;
  background: #111113;
  border: 1px solid rgba(128, 128, 128, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;

  #inventory-qr-barcode-reader {
    width: 100%;
  }

  #inventory-qr-barcode-reader video {
    width: 100% !important;
    max-height: 300px;
    object-fit: cover;
    border-radius: 12px;
  }
`;

const ManualBox = styled.div`
  padding: 20px 16px;
  border-radius: 14px;
  border: 1px dashed rgba(128, 128, 128, 0.3);
  background: rgba(128, 128, 128, 0.04);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SCANNER_ELEMENT_ID = "inventory-qr-barcode-reader";

const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.QR_CODE,
];

function getFriendlyCameraError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (lower.includes("notallowed") || lower.includes("permission")) {
    return "Camera access was denied. Allow camera permissions in your browser settings (or Safari Website Settings) and click Retry.";
  }
  if (lower.includes("notfound") || lower.includes("no camera")) {
    return "No camera was found on this device. You can still use a USB/Bluetooth barcode scanner or type the code manually.";
  }
  if (lower.includes("notreadable") || lower.includes("trackstart")) {
    return "Your camera is currently in use by another application. Close the other app and click Retry.";
  }
  if (lower.includes("overconstrained")) {
    return "Selected camera constraints are not supported by this device. Try switching cameras or using manual input.";
  }
  return msg || "Unable to start camera scanner.";
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  open,
  onClose,
  items,
  outstandingByItem,
  onLookupItem,
  onCheckItem,
  onCreateWithBarcode,
}) => {
  const [actionMode, setActionMode] = useState<ScanActionMode>("lookup");
  const [inputTab, setInputTab] = useState<"camera" | "manual">("camera");
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);
  const [statusWarning, setStatusWarning] = useState<{
    text: string;
    itemId: string;
  } | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const scanLockRef = useRef(false);
  const manualInputRef = useRef<InputRef>(null);

  const stopStreamTracks = useCallback((stream: MediaStream | null | undefined) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
      }
    });
  }, []);

  const stopCamera = useCallback(async () => {
    stopStreamTracks(activeStreamRef.current);
    activeStreamRef.current = null;

    const videoEl = document.querySelector<HTMLVideoElement>(
      `#${SCANNER_ELEMENT_ID} video`,
    );
    if (videoEl) {
      stopStreamTracks(videoEl.srcObject as MediaStream | null);
      videoEl.srcObject = null;
    }

    const instance = scannerRef.current;
    scannerRef.current = null;
    if (!instance) return;
    try {
      if (instance.isScanning) {
        await instance.stop();
      }
    } catch {
      // Ignore stop errors if already stopped
    }
    try {
      instance.clear();
    } catch {
      // Ignore clear errors
    }
  }, [stopStreamTracks]);

  const handleDecodedValue = useCallback(
    async (raw: string) => {
      if (scanLockRef.current) return;
      const trimmed = raw.trim();
      if (!trimmed) return;

      scanLockRef.current = true;
      setNotFoundCode(null);
      setStatusWarning(null);

      await stopCamera();

      const { code, itemIdFromUrl } = parseScannedCode(trimmed);
      const lowerCode = code.toLowerCase();

      const matched = items.find(
        (item) =>
          (itemIdFromUrl && item.itemId === itemIdFromUrl) ||
          (item.barcode && item.barcode.toLowerCase() === lowerCode) ||
          item.itemId.toLowerCase() === lowerCode,
      );

      if (!matched) {
        setNotFoundCode(itemIdFromUrl ? trimmed : code);
        return;
      }

      if (actionMode === "lookup") {
        onClose();
        onLookupItem(matched.itemId);
        return;
      }

      if (actionMode === "out") {
        const stock = matched.quantity_in_stock ?? 0;
        if (stock <= 0) {
          setStatusWarning({
            text: `"${matched.name}" is currently out of stock (0 available to check out).`,
            itemId: matched.itemId,
          });
          return;
        }
        onClose();
        onCheckItem(matched.itemId, "out");
        return;
      }

      const outstanding = outstandingByItem.get(matched.itemId) ?? 0;
      if (outstanding <= 0) {
        setStatusWarning({
          text: `"${matched.name}" has 0 units currently checked out.`,
          itemId: matched.itemId,
        });
        return;
      }
      onClose();
      onCheckItem(matched.itemId, "in");
    },
    [
      actionMode,
      items,
      onCheckItem,
      onClose,
      onLookupItem,
      outstandingByItem,
      stopCamera,
    ],
  );

  // Reset modal state on open/close
  useEffect(() => {
    if (!open) {
      void stopCamera();
      scanLockRef.current = false;
      setNotFoundCode(null);
      setStatusWarning(null);
      setCameraError(null);
      setManualValue("");
      return;
    }

    scanLockRef.current = false;
    setNotFoundCode(null);
    setStatusWarning(null);

    if (inputTab === "manual") {
      setTimeout(() => manualInputRef.current?.focus(), 80);
    }
  }, [open, inputTab, stopCamera]);

  // Manage camera lifecycle when Camera tab is active
  useEffect(() => {
    if (!open || inputTab !== "camera" || notFoundCode || statusWarning) {
      void stopCamera();
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      setCameraError(null);

      // Safari & iOS require a secure context (HTTPS or localhost) for mediaDevices
      if (typeof window !== "undefined" && !window.isSecureContext) {
        setCameraError(
          "Camera access requires HTTPS (or localhost) in Safari and mobile browsers. Please switch to USB / Manual input.",
        );
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera API is not available in this browser. Please use USB / Manual input.",
        );
        return;
      }

      setCameraLoading(true);
      try {
        const availableCameras = await Html5Qrcode.getCameras();
        if (cancelled) return;
        setCameras(availableCameras);

        // Prefer back/environment camera when available, without using `exact`
        let targetCamera: string | { facingMode: string } = {
          facingMode: "environment",
        };
        if (selectedCameraId) {
          targetCamera = selectedCameraId;
        } else if (availableCameras.length > 0) {
          const backCam = availableCameras.find((c) =>
            /back|rear|environment/i.test(c.label),
          );
          targetCamera = (backCam ?? availableCameras[0]).id;
        }

        const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID, {
          formatsToSupport: SUPPORTED_FORMATS,
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          targetCamera,
          {
            fps: 10,
            qrbox: { width: 240, height: 160 },
            aspectRatio: 1.5,
          },
          (decodedText) => {
            void handleDecodedValue(decodedText);
          },
          () => {
            // Frame decode miss — normal during scanning
          },
        );

        const videoEl = document.querySelector<HTMLVideoElement>(
          `#${SCANNER_ELEMENT_ID} video`,
        );
        if (videoEl?.srcObject) {
          activeStreamRef.current = videoEl.srcObject as MediaStream;
        }

        if (cancelled) {
          await stopCamera();
          return;
        }

        // Enforce playsInline & muted on the underlying <video> for iOS Safari
        if (videoEl) {
          videoEl.setAttribute("playsinline", "true");
          videoEl.setAttribute("webkit-playsinline", "true");
          videoEl.setAttribute("muted", "true");
          videoEl.muted = true;
        }
      } catch (err) {
        if (!cancelled) {
          setCameraError(getFriendlyCameraError(err));
        }
      } finally {
        if (!cancelled) {
          setCameraLoading(false);
        }
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      void stopCamera();
    };
  }, [
    open,
    inputTab,
    selectedCameraId,
    retryToken,
    notFoundCode,
    statusWarning,
    handleDecodedValue,
    stopCamera,
  ]);

  const handleResetScan = () => {
    scanLockRef.current = false;
    setNotFoundCode(null);
    setStatusWarning(null);
    setManualValue("");
    setRetryToken((t) => t + 1);
    if (inputTab === "manual") {
      setTimeout(() => manualInputRef.current?.focus(), 60);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        void stopCamera();
        onClose();
      }}
      footer={null}
      centered
      destroyOnClose
      width="min(520px, 94vw)"
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
          <ScanOutlined />
          <span>Scan Barcode or QR Tag</span>
        </div>
      }
    >
      <Body>
        <TopControls>
          <Segmented
            value={actionMode}
            onChange={(val) => setActionMode(val as ScanActionMode)}
            options={[
              { label: "Lookup", value: "lookup" },
              { label: "Check Out", value: "out" },
              { label: "Check In", value: "in" },
            ]}
          />

          <Segmented
            value={inputTab}
            onChange={(val) => {
              setNotFoundCode(null);
              setStatusWarning(null);
              scanLockRef.current = false;
              setInputTab(val as "camera" | "manual");
            }}
            options={[
              { label: "Camera", value: "camera", icon: <CameraOutlined /> },
              { label: "USB / Manual", value: "manual", icon: <KeyOutlined /> },
            ]}
          />
        </TopControls>

        {notFoundCode ? (
          <Alert
            type="warning"
            showIcon
            message={`No item found for "${notFoundCode}"`}
            description="Check the code or register a new inventory item with this barcode pre-filled."
            action={
              <Space direction="vertical" size={6}>
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    const code = notFoundCode;
                    onClose();
                    onCreateWithBarcode(code);
                  }}
                >
                  Create Item
                </Button>
                <Button size="small" icon={<ReloadOutlined />} onClick={handleResetScan}>
                  Scan Again
                </Button>
              </Space>
            }
          />
        ) : statusWarning ? (
          <Alert
            type="info"
            showIcon
            message="Action unavailable for scanned item"
            description={statusWarning.text}
            action={
              <Space direction="vertical" size={6}>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => {
                    const id = statusWarning.itemId;
                    onClose();
                    onLookupItem(id);
                  }}
                >
                  View Details
                </Button>
                <Button size="small" icon={<ReloadOutlined />} onClick={handleResetScan}>
                  Scan Again
                </Button>
              </Space>
            }
          />
        ) : inputTab === "camera" ? (
          <>
            {cameras.length > 1 && !cameraError && (
              <Select
                size="small"
                value={
                  selectedCameraId ??
                  (cameras.find((c) => /back|rear|environment/i.test(c.label)) ??
                    cameras[0])?.id
                }
                onChange={(val) => setSelectedCameraId(val)}
                options={cameras.map((c, idx) => ({
                  label: c.label || `Camera ${idx + 1}`,
                  value: c.id,
                }))}
                placeholder="Select camera"
              />
            )}

            {cameraError ? (
              <Alert
                type="error"
                showIcon
                message="Camera unavailable"
                description={cameraError}
                action={
                  <Space direction="vertical" size={6}>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => setRetryToken((t) => t + 1)}
                    >
                      Retry
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => setInputTab("manual")}
                    >
                      Use USB / Manual
                    </Button>
                  </Space>
                }
              />
            ) : (
              <ViewfinderShell>
                <div id={SCANNER_ELEMENT_ID} />
                {cameraLoading && (
                  <Typography.Text
                    style={{
                      position: "absolute",
                      color: "rgba(255,255,255,0.75)",
                      fontSize: 13,
                    }}
                  >
                    Starting camera…
                  </Typography.Text>
                )}
              </ViewfinderShell>
            )}
            <Typography.Text type="secondary" style={{ fontSize: 12, textAlign: "center" }}>
              Supports Code 128, EAN-13, UPC, Code 39 barcodes and asset QR deep-links.
            </Typography.Text>
          </>
        ) : (
          <ManualBox>
            <Typography.Text strong style={{ fontSize: 13 }}>
              USB / Bluetooth Scanner or Manual Entry
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Focus the field below and scan with a handheld scanner, or type a barcode and press Enter.
            </Typography.Text>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                ref={manualInputRef}
                placeholder="Scan or type barcode..."
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                onPressEnter={() => void handleDecodedValue(manualValue)}
                allowClear
              />
              <Button
                type="primary"
                onClick={() => void handleDecodedValue(manualValue)}
                disabled={!manualValue.trim()}
              >
                Go
              </Button>
            </Space.Compact>
          </ManualBox>
        )}
      </Body>
    </Modal>
  );
};

export default BarcodeScannerModal;
