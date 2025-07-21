import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
  credentials: "include",
});

const isTokenExpiring = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now < 60;
  } catch {
    return true;
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const response = await fetch("http://localhost:3000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation RefreshToken($refresh_token: String!) {
            refreshToken(refresh_token: $refresh_token) {
              access_token
              refresh_token
            }
          }`,
        variables: { refresh_token: refreshToken },
      }),
    });

    const { data } = await response.json();
    const { access_token, refresh_token } = data.refreshToken;

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    return access_token;
  } catch (error) {
    console.log("error.message", error);
    localStorage.clear();
    window.location.href = "/signin";
    return null;
  }
};

const authLink = setContext(async (_, { headers }) => {
  let token = localStorage.getItem("access_token");

  if (token && isTokenExpiring(token)) {
    token = await refreshAccessToken();
  }
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
