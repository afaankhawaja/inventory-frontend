import { gql } from "@apollo/client";

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
      image_path
      role {
        name
      }
    }
  }
`;
