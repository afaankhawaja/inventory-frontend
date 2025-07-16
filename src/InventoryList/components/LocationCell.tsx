import { Spin } from "antd";
import { useQuery } from "@apollo/client";
import { GET_LOCATION_PATH } from "../graphql/queries";

interface LocationCellProps {
  locationId: string;
}
interface LocationName {
    location_name: string;
}

export function LocationCell({ locationId }: LocationCellProps) {
  const { data, loading, error } = useQuery(GET_LOCATION_PATH, {
    variables: { locationID: locationId },
  });

  if (loading) return <Spin size="small" />;
  if (error) return <span style={{ color: "red" }}>Error</span>;

  const path = data.locationPath
    .map((l: LocationName) => l.location_name)
    .join(" > ");
  return <span>{path}</span>;
}
