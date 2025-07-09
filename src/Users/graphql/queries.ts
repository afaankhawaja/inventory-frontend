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
export const FETCH_USER_BY_ID = gql`
  query user($userID: String!) {
    user(userID: $userID) {
      username
      first_name
      last_name
      phone
      is_active
      cnic
      email
      age
      password_hash
      role {
        name
      }
    }
  }
`;
export const FETCH_ALL_ROLES = gql`
  query findall {
    roles {
      name
      roleId
    }
  }
`;
