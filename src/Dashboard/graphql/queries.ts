import { gql } from "@apollo/client";

export const FETCH_ALL_ITEMS = gql`
  query findItems {
    items {
      items {
        itemId
        price
        quantity_in_stock
        is_high_value
      }
      total
    }
  }
`;

export const FETCH_ITEMS_BY_TODAY = gql`
  query todayItems {
    todayItems {
      name
      brand
      created_at
      quantity_in_stock
      is_high_value
      price
    }
  }
`;

export const FETCH_ITEMS_BY_YESTERDAY = gql`
  query yesterdayItems {
    yesterdayItems {
      name
      brand
      created_at
      quantity_in_stock
      is_high_value
      price
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query transactionsWithItems {
    transactionsWithItems {
      transactions {
        transactionId
        transaction_type
        quantity
        transaction_date
        user {
          userId
          username
        }
        transactionItems {
          item {
            itemId
            name
            price
            is_high_value
          }
        }
      }
      total
    }
  }
`;

export const GET_ALL_ALERTS = gql`
  query findAllAlerts {
    alerts {
      alerts {
        alert_type
        alert_date
        alertId
        severity
        message
        itemAlerts {
          item {
            name
          }
        }
      }
    }
  }
`;
