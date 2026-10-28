import { Spin } from "antd";
import { useQuery } from "@apollo/client";
import { GET_LOCATION_PATH } from "../graphql/queries";
import { SingleLineCell } from "../../components/ExpandedRowDetail";

interface LocationCellProps {
  locationId: string;
  /** Show the full hierarchy wrapped over multiple lines (for detail views). */
  wrap?: boolean;
}
interface LocationName {
  location_name: string;
}

export function LocationCell({ locationId, wrap }: LocationCellProps) {
  const { data, loading, error } = useQuery(GET_LOCATION_PATH, {
    variables: { locationID: locationId },
  });

  if (loading) return <Spin size="small" />;
  if (error) return <span style={{ color: "red" }}>Error</span>;

  const path = data?.locationPath
    ?.map((l: LocationName) => l.location_name)
    .join(" > ");

  if (wrap) {
    return (
      <span
        style={{
          display: "block",
          minWidth: 0,
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          lineHeight: 1.5,
        }}
      >
        {data?.locationPath
          ?.map((l: LocationName) => l.location_name)
          .join(" › ") || "-"}
      </span>
    );
  }

  return <SingleLineCell title={path}>{path || "—"}</SingleLineCell>;
}
