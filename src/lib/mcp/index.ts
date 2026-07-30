import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCarsTool from "./tools/list-cars";
import checkAvailabilityTool from "./tools/check-availability";
import listReservationsTool from "./tools/list-reservations";
import fleetCalendarTool from "./tools/fleet-calendar";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "carbonus",
  title: "carbonus",
  version: "0.1.0",
  instructions:
    "Tools for Carbonus car rental. Use `list_cars` for the fleet and pricing, `check_availability` for a single car and date range, `fleet_calendar` for booked and blocked periods across the fleet, and `list_reservations` for booking records. All dates are YYYY-MM-DD local time.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCarsTool, checkAvailabilityTool, fleetCalendarTool, listReservationsTool],
});
