import { gql } from "@apollo/client";

export const FETCH_ALL_USERS = gql`
  query users {
    users {
      userId
      first_name
      last_name
      username
      email
      age
      phone
      is_active
      created_at
      role {
        name
      }
    }
  }
`;
