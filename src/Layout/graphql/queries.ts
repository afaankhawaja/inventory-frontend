import { gql } from "@apollo/client";

export const FETCH_USER_BY_USERNAME = gql`
  query finduser($username: String!) {
    username(username: $username) {
      userId
      image_path
      email
    }
  }
`;
