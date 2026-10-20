import { gql } from "@apollo/client";

export const SIGNIN_MUTATION = gql`
  mutation SignIn($username: String!, $password: String!) {
    signin(username: $username, password: $password)
  }
`;
