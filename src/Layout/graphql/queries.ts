import { gql } from "@apollo/client";

export const FETCH_USER_BY_USERNAME = gql`
  query me {
    me {
      userId
      image_path
      email
      username
      role {
        name
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;
