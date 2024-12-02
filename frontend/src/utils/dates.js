import { format, addDays, addBusinessDays } from "date-fns"

export const getDeliveryDate = (startDate, deliveryDays, country, options) => {
  if (!deliveryDays) return;

  let deliveryDate;

  if (country === "Canada" && options?.fullDate) {
    deliveryDate = format(addDays(startDate, deliveryDays), "MMMM d, yyyy")
  } else if (country === "Canada") {
    deliveryDate = format(addDays(startDate, deliveryDays), "eeee, MMMM d")
  } else if (country !== "Canada" && options?.fullDate) {
    deliveryDate = format(addBusinessDays(startDate, deliveryDays), "MMMM d, yyyy")
  } else if (country !== "Canada") {
    deliveryDate = format(addBusinessDays(startDate, deliveryDays), "eeee, MMMM d")
  }

  return deliveryDate;
}