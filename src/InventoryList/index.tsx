import { useMutation, useQuery } from "@apollo/client";
import { FETCH_ALL_ITEMS, GET_TRANSACTIONS } from "./graphql/queries";
import ItemsTable from "./components/ItemsTable";
import styled from "styled-components";
import { Button, Card, Input, Modal, Select, Skeleton, message } from "antd";
import {
  CloseCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
  ScanOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CreateNewItem from "./components/CreateNewItem";
import { DELETE_ITEM } from "./graphql/mutations";
import CheckInOutForm, { type CheckMode } from "./components/CheckInOutForm";
import DeleteItem from "./components/DeleteItem";
import UpdateItem from "./components/UpdateItem";
import CreatePurchaseHistory from "./components/CreatePurchaseHistory";
import BarcodeScannerModal from "./components/BarcodeScannerModal";
import PageStatsCards, { type PageStatItem } from "../components/PageStatsCards";
import { palette } from "../theme/tokens";
import { useAtom } from "jotai";
import { currentUserDataAtom } from "../store/atoms";
import { printAssetLabels } from "../utils/barcode";

interface TransactionRow {
  transaction_type: string;
  quantity?: number;
  transaction_date: string;
  transactionItems: { item: { itemId: string } }[];
}

const modalTitle = (text: string) => (
  <div
    style={{
      textAlign: "center",
      color: "inherit",
      fontWeight: "bold",
      fontSize: "20px",
    }}
  >
    {text}
  </div>
);
const modalBodyStyles = {
  body: { maxHeight: "72vh", overflowY: "auto" as const, paddingTop: 5 },
};

const UsersContainer = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ActionRow = styled(Card)`
  width: 100%;

  .ant-card-body {
    padding: 12px 16px;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
`;

const SearchInput = styled(Input)`
  width: 260px;
  height: 38px;
  border-radius: 8px;

  &.ant-input-affix-wrapper {
    height: 38px;
    padding-block: 4px;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const FilterSelect = styled(Select)`
  min-width: 135px;
  height: 38px;

  .ant-select-selector {
    height: 38px !important;
    border-radius: 8px !important;
    display: flex;
    align-items: center;
  }

  @media (max-width: 640px) {
    flex: 1;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
`;

const ItemCountBadge = styled.span`
  font-size: 13px;
  color: ${palette.light.textSecondary};
  font-weight: 500;
  white-space: nowrap;
`;

const AddNewItem = styled(Button)`
  font-size: 14px;
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: none;
`;

const ResetButton = styled(Button)`
  padding: 0 4px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

interface StatItemRow {
  price?: number;
  quantity_in_stock?: number;
  reorder_threshold?: number;
  is_high_value?: boolean;
  condition?: string;
}

const Index = () => {
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [updateModal, setUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [restockModal, setRestockModal] = useState(false);
  const [checkModal, setCheckModal] = useState(false);
  const [checkMode, setCheckMode] = useState<CheckMode>("out");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [prefillBarcode, setPrefillBarcode] = useState<string | undefined>(
    undefined,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [inspectedItemId, setInspectedItemId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters state
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );
  const [selectedCondition, setSelectedCondition] = useState<
    string | undefined
  >(undefined);
  const [stockFilter, setStockFilter] = useState<string | undefined>(undefined);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data, loading, error } = useQuery(FETCH_ALL_ITEMS, {
    variables: { skip: 0, take: 500 },
  });

  const allItems = useMemo(() => {
    return data?.items?.items || [];
  }, [data?.items?.items]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item: any) => {
      // 1. Search text match across name, brand, barcode, category, location
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesBrand = item.brand?.toLowerCase().includes(q);
        const matchesBarcode = item.barcode?.toLowerCase().includes(q);
        const matchesCategory = item.category?.name?.toLowerCase().includes(q);
        const matchesLocation = item.location?.location_name
          ?.toLowerCase()
          .includes(q);
        if (
          !matchesName &&
          !matchesBrand &&
          !matchesBarcode &&
          !matchesCategory &&
          !matchesLocation
        ) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory && item.category?.name !== selectedCategory) {
        return false;
      }

      // 3. Condition filter
      if (selectedCondition && item.condition !== selectedCondition) {
        return false;
      }

      // 4. Stock status filter
      if (stockFilter === "LOW") {
        const qty = Number(item.quantity_in_stock || 0);
        const threshold = Number(item.reorder_threshold || 0);
        if (qty > threshold || qty === 0) return false;
      } else if (stockFilter === "OUT") {
        if (Number(item.quantity_in_stock || 0) > 0) return false;
      } else if (stockFilter === "HIGH_VALUE") {
        if (!item.is_high_value) return false;
      }

      return true;
    });
  }, [
    allItems,
    searchText,
    selectedCategory,
    selectedCondition,
    stockFilter,
  ]);

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    allItems.forEach((i: any) => {
      if (i.category?.name) categories.add(i.category.name);
    });
    return Array.from(categories)
      .sort()
      .map((name) => ({
        label: name,
        value: name,
      }));
  }, [allItems]);

  const hasActiveFilters = Boolean(
    searchText.trim() || selectedCategory || selectedCondition || stockFilter,
  );

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedCategory(undefined);
    setSelectedCondition(undefined);
    setStockFilter(undefined);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const stats: PageStatItem[] = useMemo(() => {
    const totalCount = data?.items?.total ?? allItems.length;
    const totalValuation = allItems.reduce(
      (acc: number, item: StatItemRow) =>
        acc + Number(item.price || 0) * Number(item.quantity_in_stock || 0),
      0,
    );
    const highValueCount = allItems.filter(
      (i: StatItemRow) => i.is_high_value,
    ).length;
    const lowStockCount = allItems.filter(
      (i: StatItemRow) =>
        i.quantity_in_stock !== undefined &&
        i.reorder_threshold !== undefined &&
        Number(i.quantity_in_stock) <= Number(i.reorder_threshold),
    ).length;
    const damagedCount = allItems.filter(
      (i: StatItemRow) => i.condition === "DAMAGED",
    ).length;

    return [
      {
        label: "Total Vault Portfolio Value",
        value: totalValuation,
        decimals: 2,
        prefix: "$",
        badgeText: `${totalCount} SKUs`,
        badgeColor: palette.light.accent,
      },
      {
        label: "High-Value Certified Assets",
        value: highValueCount,
        badgeText:
          totalCount > 0
            ? `${Math.round((highValueCount / totalCount) * 100)}% of Vault`
            : "0%",
        badgeColor: palette.status.success,
      },
      {
        label: "Low Stock / Reorder Alert",
        value: lowStockCount,
        badgeText: lowStockCount > 0 ? "Needs Restock" : "Optimal",
        badgeColor:
          lowStockCount > 0 ? palette.status.warning : palette.status.success,
      },
      {
        label: "Damaged / In Repair",
        value: damagedCount,
        badgeText: damagedCount > 0 ? "Action Required" : "All Intact",
        badgeColor:
          damagedCount > 0 ? palette.status.critical : palette.status.success,
      },
    ];
  }, [data?.items?.total, allItems]);

  const [removeItem] = useMutation(DELETE_ITEM, {
    refetchQueries: [
      { query: FETCH_ALL_ITEMS, variables: { skip: 0, take: 500 } },
    ],
    awaitRefetchQueries: true,
  });

  const [currentUser] = useAtom(currentUserDataAtom);
  const { data: transactionData } = useQuery(GET_TRANSACTIONS);

  // Units currently out per item = total checked out minus total returned.
  const outstandingByItem = useMemo(() => {
    const txs: TransactionRow[] =
      transactionData?.transactionsWithItems?.transactions || [];
    const map = new Map<string, number>();
    txs.forEach((tx) => {
      const sign =
        tx.transaction_type === "CHECK_OUT"
          ? 1
          : tx.transaction_type === "CHECK_IN"
            ? -1
            : 0;
      tx.transactionItems.forEach((ti) => {
        map.set(
          ti.item.itemId,
          (map.get(ti.item.itemId) ?? 0) + sign * (tx.quantity ?? 1),
        );
      });
    });
    map.forEach((v, k) => map.set(k, Math.max(v, 0)));
    return map;
  }, [transactionData]);

  const handleCheck = (itemId: string, mode: CheckMode) => {
    setSelectedItemId(itemId);
    setCheckMode(mode);
    setCheckModal(true);
  };

  const selectedItem = allItems.find(
    (i: { itemId: string }) => i.itemId === selectedItemId,
  );

  const inspectedItem = useMemo(
    () =>
      inspectedItemId
        ? allItems.find(
            (i: { itemId: string }) => i.itemId === inspectedItemId,
          ) || null
        : null,
    [allItems, inspectedItemId],
  );

  useEffect(() => {
    const deepItemId = searchParams.get("item");
    if (deepItemId && allItems.length > 0) {
      const exists = allItems.some(
        (i: { itemId: string }) => i.itemId === deepItemId,
      );
      if (exists) {
        setInspectedItemId(deepItemId);
      }
      const next = new URLSearchParams(searchParams);
      next.delete("item");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, allItems, setSearchParams]);

  const handleBatchPrintLabels = () => {
    const keySet = new Set(selectedRowKeys.map(String));
    const chosen = allItems.filter((i: { itemId: string }) =>
      keySet.has(i.itemId),
    );
    if (chosen.length === 0) return;

    const ok = printAssetLabels(
      chosen.map(
        (i: {
          itemId: string;
          name: string;
          brand?: string;
          category?: { name?: string };
          price?: number;
          barcode?: string;
        }) => ({
          itemId: i.itemId,
          name: i.name,
          brand: i.brand,
          category: i.category?.name,
          price:
            i.price !== undefined && i.price !== null
              ? `$${Number(i.price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : undefined,
          barcode: i.barcode,
        }),
      ),
    );
    if (!ok) {
      message.error("Unable to open print dialog");
    }
  };

  const handleEditItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setUpdateModal(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setDeleteModal(true);
  };

  const handleRestockItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setRestockModal(true);
  };

  const deleteItem = () => {
    removeItem({
      variables: {
        itemID: selectedItemId,
      },
    })
      .then(() => {
        message.success("sucessfully deleted");
        setDeleteModal(false);
      })
      .catch((error) => {
        message.error(error?.message);
      });
  };

  return (
    <UsersContainer>
      <PageStatsCards stats={stats} loading={loading} />

      <ActionRow>
        <Toolbar>
          <FilterGroup>
            <SearchInput
              placeholder="Search name, brand, barcode..."
              prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
              allowClear
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            />

            <FilterSelect
              placeholder="Category"
              allowClear
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val as string | undefined);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              options={categoryOptions}
            />

            <FilterSelect
              placeholder="Condition"
              allowClear
              value={selectedCondition}
              onChange={(val) => {
                setSelectedCondition(val as string | undefined);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              options={[
                { label: "New", value: "NEW" },
                { label: "In Use", value: "IN_USE" },
                { label: "Damaged", value: "DAMAGED" },
              ]}
            />

            <FilterSelect
              placeholder="Stock Status"
              allowClear
              value={stockFilter}
              onChange={(val) => {
                setStockFilter(val as string | undefined);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              options={[
                { label: "Low Stock (≤ Alert)", value: "LOW" },
                { label: "Out of Stock (0)", value: "OUT" },
                { label: "High-Value Certified", value: "HIGH_VALUE" },
              ]}
            />

            {hasActiveFilters && (
              <ResetButton
                type="link"
                size="small"
                onClick={handleResetFilters}
              >
                <CloseCircleOutlined /> Reset
              </ResetButton>
            )}
          </FilterGroup>

          <RightGroup>
            <ItemCountBadge>
              {hasActiveFilters
                ? `Showing ${filteredItems.length} of ${allItems.length}`
                : `${allItems.length} items`}
            </ItemCountBadge>
            {selectedRowKeys.length > 0 && (
              <Button
                icon={<PrinterOutlined />}
                onClick={handleBatchPrintLabels}
                style={{ height: 38, borderRadius: 8 }}
              >
                Print Labels ({selectedRowKeys.length})
              </Button>
            )}
            <Button
              icon={<ScanOutlined />}
              onClick={() => setScannerOpen(true)}
              style={{ height: 38, borderRadius: 8 }}
            >
              Scan
            </Button>
            <AddNewItem
              type="primary"
              onClick={() => {
                setPrefillBarcode(undefined);
                setOpen(true);
              }}
            >
              Add new Item <PlusOutlined />
            </AddNewItem>
          </RightGroup>
        </Toolbar>
      </ActionRow>

      {error ? (
        <Card style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ color: palette.status.critical, margin: 0 }}>
            Error loading inventory: {error.message}
          </p>
        </Card>
      ) : (
        <>
          {loading ? (
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          ) : (
            <TableWrapper>
              <ItemsTable
                dataSource={filteredItems}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: filteredItems.length,
                  onChange: (page, pageSize) => {
                    setPagination({ current: page, pageSize });
                  },
                }}
                onEditItem={handleEditItemClick}
                onDeleteItem={handleDeleteItem}
                onRestockItem={handleRestockItem}
                onCheck={handleCheck}
                outstandingByItem={outstandingByItem}
                isFiltered={hasActiveFilters}
                onResetFilters={handleResetFilters}
                selectedRowKeys={selectedRowKeys}
                onSelectionChange={setSelectedRowKeys}
                inspectedItem={inspectedItem}
                onInspectItem={(item) => setInspectedItemId(item?.itemId ?? null)}
              />
            </TableWrapper>
          )}
        </>
      )}
      <Modal
        title={
          <div
            style={{
              textAlign: "center",
              color: "inherit",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            Create New Item
          </div>
        }
        centered
        open={open}
        footer={null}
        destroyOnClose
        onCancel={() => {
          setOpen(false);
          setPrefillBarcode(undefined);
        }}
        width="min(760px, 94vw)"
        styles={{ body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 5 } }}
      >
        <CreateNewItem setOpen={setOpen} initialBarcode={prefillBarcode} />
      </Modal>
      <Modal
        title={modalTitle("Update Item")}
        centered
        open={updateModal}
        footer={null}
        destroyOnClose
        onCancel={() => setUpdateModal(false)}
        width="min(760px, 94vw)"
        styles={modalBodyStyles}
      >
        <UpdateItem
          selectedItemId={selectedItemId}
          setUpdateModal={setUpdateModal}
        />
      </Modal>
      <Modal
        onOk={deleteItem}
        okText="Delete"
        okButtonProps={{
          style: {
            backgroundColor: "#FF4D4F",
            borderColor: "#FF4D4F",
          },
        }}
        centered
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        height={"90%"}
      >
        <DeleteItem />
      </Modal>
      <Modal
        title={modalTitle("Restock Item")}
        centered
        open={restockModal}
        footer={null}
        destroyOnClose
        onCancel={() => setRestockModal(false)}
        width="min(640px, 94vw)"
        styles={modalBodyStyles}
      >
        <CreatePurchaseHistory
          selectedItemId={selectedItemId}
          setRestockModal={setRestockModal}
        />
      </Modal>
      <Modal
        title={modalTitle(checkMode === "out" ? "Check out item" : "Check in item")}
        centered
        open={checkModal}
        footer={null}
        destroyOnClose
        onCancel={() => setCheckModal(false)}
        width="min(560px, 94vw)"
        styles={modalBodyStyles}
      >
        {selectedItem && (
          <CheckInOutForm
            mode={checkMode}
            itemId={selectedItemId}
            itemName={selectedItem.name}
            userId={currentUser?.userID}
            stock={selectedItem.quantity_in_stock ?? 0}
            outstanding={outstandingByItem.get(selectedItemId) ?? 0}
            onClose={() => setCheckModal(false)}
          />
        )}
      </Modal>
      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        items={allItems}
        outstandingByItem={outstandingByItem}
        onLookupItem={(itemId) => setInspectedItemId(itemId)}
        onCheckItem={(itemId, mode) => handleCheck(itemId, mode)}
        onCreateWithBarcode={(barcode) => {
          setPrefillBarcode(barcode);
          setOpen(true);
        }}
      />
    </UsersContainer>
  );
};

export default Index;
