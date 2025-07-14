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
        category {
          name
        }
        location {
          location_name
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
      barcode
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
  query locations {
    locations {
      locationId
      location_name
    }
  }
`;
