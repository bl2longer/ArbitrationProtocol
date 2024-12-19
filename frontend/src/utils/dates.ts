
import moment, { Moment } from "moment";

const DATETIME_FORMAT = "YYYY/MM/DD HH:mm";
const DATETIME_WITHOUT_YEAR_FORMAT = "MM/DD HH:mm";

export const formatDatetime = (timestamp: number) =>
  moment.unix(timestamp).format(DATETIME_FORMAT);

export const formatDate = (date: Date | Moment | string, format: string = DATETIME_FORMAT) => {
  const dayjsDate = moment(date);
  if (dayjsDate.year() < 1970) {
    return "-";
  }
  return dayjsDate.format(format);
};

export const formatDateWithoutYear = (date: Date | Moment | string) =>
  formatDate(date, DATETIME_WITHOUT_YEAR_FORMAT);
