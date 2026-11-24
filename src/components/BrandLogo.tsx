import React from "react";

interface BrandLogoProps {
  size?: number;
  color?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 24,
  color = "#007AFF",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ flexShrink: 0, display: "block" }}
  >
    <rect width="64" height="64" rx="16" fill={color} />
    <path
      d="M32 13L49 22.8V41.2L32 51L15 41.2V22.8L32 13Z"
      stroke="#FFFFFF"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path
      d="M32 31.5L48.5 22.5M32 31.5L15.5 22.5M32 31.5V50.5"
      stroke="#FFFFFF"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="31.5" r="3.5" fill="#FFFFFF" />
  </svg>
);

export default BrandLogo;
