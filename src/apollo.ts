import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { broadcastLogout } from "./utils/authBroadcast";

const GRAPHQL_URL = "http://localhost:3000/graphql";

const isUnauthorized = async (response: Response): Promise<boolean> => {
  try {
    const body = await response.clone().json();
    return (body?.errors ?? []).some(
      (e: { message?: string; extensions?: { code?: string } }) =>
        e.message === "Unauthorized" || e.extensions?.code === "UNAUTHENTICATED",
    );
  } catch {
    return false;
  }
};

let refreshPromise: Promise<boolean> | null = null;

const refreshSession = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch(GRAPHQL_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "mutation { refreshToken }" }),
    })
      .then(async (res) => {
        const body = await res.json();
        return body?.data?.refreshToken === true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const fetchWithRefresh: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!(await isUnauthorized(response))) return response;

  const reqBody = typeof init?.body === "string" ? init.body : "";
  if (/refreshToken|signin|logout/.test(reqBody)) return response;

  if (await refreshSession()) {
    return fetch(input, init);
  }
  broadcastLogout();
  if (window.location.pathname !== "/signin") {
    window.location.href = "/signin";
  }
  return response;
};

const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  credentials: "include",
  fetch: fetchWithRefresh,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
