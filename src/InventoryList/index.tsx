import { useMutation, useQuery } from "@apollo/client";
import { FETCH_ALL_ITEMS, GET_TRANSACTIONS } from "./graphql/queries";
import ItemsTable from "./components/ItemsTable";
import styled from "styled-components";
import { Button, Card, Modal, Skeleton, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import CreateNewItem from "./components/CreateNewItem";
import { DELETE_ITEM } from "./graphql/mutations";
import CheckInOutForm, { type CheckMode } from "./components/CheckInOutForm";
import DeleteItem from "./components/DeleteItem";
import UpdateItem from "./components/UpdateItem";
import CreatePurchaseHistory from "./components/CreatePurchaseHistory";
import PageStatsCards, { type PageStatItem } from "../components/PageStatsCards";
import { palette } from "../theme/tokens";
import { useAtom } from "jotai";
import { currentUserDataAtom } from "../store/atoms";

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
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 15px;
  }
`;

const AddNewItem = styled(Button)`
  font-size: 14px;
  height: 36px;
  padding: 0 15px;
  width: auto;
  border: none;
  box-shadow: none;
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data, loading, error } = useQuery(FETCH_ALL_ITEMS, {
    variables: {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    },
  });

  const { data: allStatsData, loading: statsLoading } = useQuery(
    FETCH_ALL_ITEMS,
    {
      variables: { skip: 0, take: 500 },
    },
  );

  const stats: PageStatItem[] = useMemo(() => {
    const allItems: StatItemRow[] = allStatsData?.items?.items || [];
    const totalCount = allStatsData?.items?.total ?? allItems.length;
    const totalValuation = allItems.reduce(
      (acc, item) =>
        acc + Number(item.price || 0) * Number(item.quantity_in_stock || 0),
      0,
    );
    const highValueCount = allItems.filter((i) => i.is_high_value).length;
    const lowStockCount = allItems.filter(
      (i) =>
        i.quantity_in_stock !== undefined &&
        i.reorder_threshold !== undefined &&
        Number(i.quantity_in_stock) <= Number(i.reorder_threshold),
    ).length;
    const damagedCount = allItems.filter(
      (i) => i.condition === "DAMAGED",
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
  }, [allStatsData]);

  const [removeItem] = useMutation(DELETE_ITEM);
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
  const selectedItem = (data?.items?.items || []).find(
    (i: { itemId: string }) => i.itemId === selectedItemId,
  );
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
      <PageStatsCards stats={stats} loading={statsLoading} />

      <ActionRow>
        <AddNewItem type="primary" onClick={() => setOpen(true)}>
          Add new Item <PlusOutlined />
        </AddNewItem>
      </ActionRow>

      {error ? (
        <>{error.message}</>
      ) : (
        <>
          {loading ? (
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          ) : (
            <TableWrapper>
              <ItemsTable
                dataSource={data?.items.items || []}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: data?.items.total,
                  onChange: (page, pageSize) => {
                    setPagination({ ...pagination, current: page, pageSize });
                  },
                }}
                onEditItem={handleEditItemClick}
                onDeleteItem={handleDeleteItem}
                onRestockItem={handleRestockItem}
                onCheck={handleCheck}
                outstandingByItem={outstandingByItem}
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
        onCancel={() => setOpen(false)}
        width="min(760px, 94vw)"
        styles={{ body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 5 } }}
      >
        <CreateNewItem setOpen={setOpen} />
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
      </Modal>      <Modal
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
      </Modal>      <Modal
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
      </Modal>    </UsersContainer>
  );
};

export default Index;
