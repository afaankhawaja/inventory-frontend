import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input, Modal, Tag, Typography, theme, type InputRef } from "antd";
import {
  BgColorsOutlined,
  EditOutlined,
  FileDoneOutlined,
  HomeOutlined,
  LogoutOutlined,
  PlusOutlined,
  ScanOutlined,
  SearchOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { useAtom } from "jotai";
import styled from "styled-components";
import { FETCH_ALL_ITEMS } from "../InventoryList/graphql/queries";
import { selectedTheme } from "../store/themeAtom";

export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(
    navigator.platform || navigator.userAgent || "",
  );
}

interface CommandItem {
  id: string;
  group: "Actions" | "Navigation" | "Inventory";
  title: string;
  subtitle?: string;
  keywords?: string;
  badge?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

interface InventorySearchRow {
  itemId: string;
  name: string;
  brand?: string;
  barcode?: string;
  quantity_in_stock?: number;
  category?: { name?: string };
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  userRole: string | null;
  onLogout: () => void;
}

const SearchWrap = styled.div`
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.16);
`;

const ResultsList = styled.div`
  max-height: 360px;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const GroupHeader = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.55;
  padding: 8px 10px 4px;
`;

const CommandRow = styled.button<{ $active: boolean; $activeBg: string }>`
  width: 100%;
  border: none;
  background: ${(p) => (p.$active ? p.$activeBg : "transparent")};
  color: inherit;
  border-radius: 10px;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: background-color 100ms ease;

  &:hover {
    background: ${(p) => p.$activeBg};
  }
`;

const RowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const RowIcon = styled.span`
  font-size: 15px;
  opacity: 0.78;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`;

const RowText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const RowTitle = styled.span`
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowSubtitle = styled.span`
  font-size: 11.5px;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FooterBar = styled.div`
  padding: 8px 14px;
  border-top: 1px solid rgba(128, 128, 128, 0.16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  opacity: 0.65;
  flex-wrap: wrap;
  gap: 8px;
`;

const Kbd = styled.kbd`
  display: inline-block;
  padding: 1px 5px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  border-radius: 5px;
  border: 1px solid rgba(128, 128, 128, 0.3);
  background: rgba(128, 128, 128, 0.08);
`;

const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  userRole,
  onLogout,
}) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useAtom(selectedTheme);
  const { token } = theme.useToken();
  const inputRef = useRef<InputRef>(null);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const { data } = useQuery(FETCH_ALL_ITEMS, {
    variables: { skip: 0, take: 500 },
    skip: !open,
    fetchPolicy: "cache-first",
  });

  const staticCommands: CommandItem[] = useMemo(() => {
    const go = (path: string) => {
      onClose();
      navigate(path);
    };

    const list: CommandItem[] = [
      {
        id: "act-scan",
        group: "Actions",
        title: "Scan Barcode or QR Tag",
        subtitle: "Open camera or USB scanner to lookup, check in, or check out",
        keywords: "scan qr barcode camera lookup",
        icon: <ScanOutlined />,
        onSelect: () => go("/inventory-list?action=scan"),
      },
      {
        id: "act-create-item",
        group: "Actions",
        title: "Add New Inventory Item",
        subtitle: "Register a new SKU in the vault",
        keywords: "create add new item sku",
        icon: <PlusOutlined />,
        onSelect: () => go("/inventory-list?action=create"),
      },
      {
        id: "act-theme",
        group: "Actions",
        title: currentTheme.isDark
          ? "Switch to Light Mode"
          : "Switch to Dark Mode",
        subtitle: "Toggle interface appearance",
        keywords: "theme dark light mode appearance",
        icon: <BgColorsOutlined />,
        onSelect: () => {
          setCurrentTheme({ isDark: !currentTheme.isDark });
          onClose();
        },
      },
      {
        id: "nav-home",
        group: "Navigation",
        title: "Overview",
        subtitle: "Dashboard, alerts, and valuation charts",
        keywords: "home dashboard overview charts",
        icon: <HomeOutlined />,
        onSelect: () => go("/"),
      },
      {
        id: "nav-inventory",
        group: "Navigation",
        title: "Inventory List",
        subtitle: "Search, filter, check in/out, and print labels",
        keywords: "inventory items stock catalog",
        icon: <UnorderedListOutlined />,
        onSelect: () => go("/inventory-list"),
      },
      {
        id: "nav-purchases",
        group: "Navigation",
        title: "Purchase History",
        subtitle: "Procurement orders and vendor spend",
        keywords: "purchase history orders vendors",
        icon: <ShoppingCartOutlined />,
        onSelect: () => go("/purchase-history"),
      },
      {
        id: "nav-reports",
        group: "Navigation",
        title: "Reports & Analytics",
        subtitle: "Category valuation, reorder risk, and CSV export",
        keywords: "reports analytics csv export valuation",
        icon: <FileDoneOutlined />,
        onSelect: () => go("/reports"),
      },
      {
        id: "nav-maintenance",
        group: "Navigation",
        title: "Maintenance Schedules",
        subtitle: "Due inspections and service logs",
        keywords: "maintenance service schedule",
        icon: <SettingOutlined />,
        onSelect: () => go("/maintenance"),
      },
    ];

    if (userRole === "admin" || userRole === "super-admin") {
      list.push({
        id: "nav-users",
        group: "Navigation",
        title: "Users & Roles",
        subtitle: "Manage team accounts and access levels",
        keywords: "users roles admin team",
        icon: <UserOutlined />,
        onSelect: () => go("/users"),
      });
    }

    list.push(
      {
        id: "nav-profile",
        group: "Navigation",
        title: "Edit Profile",
        subtitle: "Update your account details",
        keywords: "profile account settings",
        icon: <EditOutlined />,
        onSelect: () => go("/edit-user-details"),
      },
      {
        id: "act-logout",
        group: "Actions",
        title: "Sign Out",
        subtitle: "Log out of your current session",
        keywords: "logout signout exit",
        icon: <LogoutOutlined />,
        onSelect: () => {
          onClose();
          onLogout();
        },
      },
    );

    return list;
  }, [currentTheme.isDark, navigate, onClose, onLogout, setCurrentTheme, userRole]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchedStatic = staticCommands.filter((cmd) => {
      if (!q) return true;
      return (
        cmd.title.toLowerCase().includes(q) ||
        (cmd.subtitle?.toLowerCase().includes(q) ?? false) ||
        (cmd.keywords?.toLowerCase().includes(q) ?? false)
      );
    });

    const items: InventorySearchRow[] = data?.items?.items || [];
    const matchedItems: CommandItem[] = q
      ? items
          .filter(
            (i) =>
              i.name?.toLowerCase().includes(q) ||
              i.brand?.toLowerCase().includes(q) ||
              i.barcode?.toLowerCase().includes(q) ||
              i.category?.name?.toLowerCase().includes(q),
          )
          .slice(0, 8)
          .map((i) => ({
            id: `item-${i.itemId}`,
            group: "Inventory",
            title: i.name,
            subtitle: [i.brand, i.category?.name, i.barcode]
              .filter(Boolean)
              .join(" · "),
            badge:
              i.quantity_in_stock !== undefined
                ? `${i.quantity_in_stock} in stock`
                : undefined,
            icon: <TagOutlined />,
            onSelect: () => {
              onClose();
              navigate(`/inventory-list?item=${encodeURIComponent(i.itemId)}`);
            },
          }))
      : [];

    return [...matchedStatic, ...matchedItems];
  }, [data?.items?.items, navigate, onClose, query, staticCommands]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
  }, [open]);

  useEffect(() => {
    const el = rowRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (filteredCommands.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      filteredCommands[activeIndex]?.onSelect();
    }
  };

  const activeBg = currentTheme.isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(0, 0, 0, 0.05)";

  let lastGroup: string | null = null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width="min(580px, 94vw)"
      styles={{ body: { padding: 0 } }}
      style={{ top: "14vh" }}
      afterOpenChange={(isOpen) => {
        if (isOpen) {
          setTimeout(() => inputRef.current?.focus(), 40);
        }
      }}
    >
      <SearchWrap>
        <Input
          ref={inputRef}
          variant="borderless"
          size="large"
          prefix={<SearchOutlined style={{ opacity: 0.55, fontSize: 16 }} />}
          placeholder="Search items, pages, or actions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          allowClear
        />
      </SearchWrap>

      <ResultsList role="listbox" aria-label="Command palette results">
        {filteredCommands.length === 0 ? (
          <div style={{ padding: "28px 16px", textAlign: "center" }}>
            <Typography.Text type="secondary">
              No matching commands or items for "{query}"
            </Typography.Text>
          </div>
        ) : (
          filteredCommands.map((cmd, idx) => {
            const showGroup = cmd.group !== lastGroup;
            lastGroup = cmd.group;
            return (
              <React.Fragment key={cmd.id}>
                {showGroup && <GroupHeader>{cmd.group}</GroupHeader>}
                <CommandRow
                  ref={(el) => {
                    rowRefs.current[idx] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={idx === activeIndex}
                  $active={idx === activeIndex}
                  $activeBg={activeBg}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={cmd.onSelect}
                >
                  <RowLeft>
                    <RowIcon style={{ color: token.colorPrimary }}>
                      {cmd.icon}
                    </RowIcon>
                    <RowText>
                      <RowTitle>{cmd.title}</RowTitle>
                      {cmd.subtitle && <RowSubtitle>{cmd.subtitle}</RowSubtitle>}
                    </RowText>
                  </RowLeft>
                  {cmd.badge && (
                    <Tag style={{ margin: 0, fontSize: 11 }}>{cmd.badge}</Tag>
                  )}
                </CommandRow>
              </React.Fragment>
            );
          })
        )}
      </ResultsList>

      <FooterBar>
        <span>
          <Kbd>↑↓</Kbd> Navigate &nbsp; <Kbd>↵</Kbd> Open &nbsp; <Kbd>Esc</Kbd> Close
        </span>
        <span>
          Tip: Press <Kbd>{isApplePlatform() ? "⌘K" : "Ctrl K"}</Kbd> or <Kbd>/</Kbd> anytime
        </span>
      </FooterBar>
    </Modal>
  );
};

export default CommandPalette;
