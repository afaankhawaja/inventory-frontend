import { gql } from "@apollo/client";

export const FETCH_ALL_ITEMS = gql`
  query findItems($skip: Int, $take: Int) {
    items(skip: $skip, take: $take) {
      items {
        itemId
        name
        expiry_date
        price
        condition
        quantity_in_stock
        reorder_threshold
        is_high_value
        brand
        barcode
        manufacturing_date
        category {
          name
        }
        location {
          location_name
          locationId
        }
      }
      total
    }
  }
`;

export const FETCH_ITEM_BY_ID = gql`
  query item($itemID: String!) {
    item(itemID: $itemID) {
      name
      condition
      quantity_in_stock
      reorder_threshold
      is_high_value
      brand
      price
      barcode
      expiry_date
      manufacturing_date
      category {
        name
        categoryId
      }
      location {
        location_name
        locationId
      }
    }
  }
`;

export const FETCH_ALL_CATEGORIES = gql`
  query categories {
    categories {
      categoryId
      name
    }
  }
`;

export const FETCH_ALL_LOCATIONS = gql`
  query LocationsRoot {
    locations(rootsOnly: true) {
      locationId
      location_name
      subLocations {
        locationId
        location_name
        subLocations {
          locationId
          location_name
        }
      }
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query {
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
          }
        }
      }
    }
  }
`;
export const GET_LOCATION_PATH = gql`
  query GetLocationPath($locationID: String!) {
    locationPath(locationID: $locationID) {
      location_name
      locationId
    }
  }
`;
export const FETCH_ALL_VENDORS = gql`
  query vendors {
    vendors {
      name
      vendorId
    }
  }
`;
export const FETCH_LATEST_PURCHASE_BY_ITEM = gql`
  query purchaseHistory($itemID: String!) {
    purchaseHistory(itemID: $itemID) {
      item {
        name
        brand
      }
      quantity
      purchase_date
      unit_price
      total_cost
      vendorId
      vendor {
        name
      }
    }
  }
`;
