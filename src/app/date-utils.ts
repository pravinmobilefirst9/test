import { DateOffset } from './sb-form-configuration/sb-form-context';
import * as moment from 'moment-business-days';
import { unitOfTime } from 'moment';

// ISO 8601 - JSON parsed version of JS datetime.
const dateFormat = new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);

function getBusinessDate(date: Date, nDays) {
  const newDate = moment(date).businessAdd(nDays);
  return newDate.toDate();
}

function getDateFromOffset(dateOffset: DateOffset, date: Date): Date {
  if (dateOffset.startOfUnit) {
    return getStartDateOfUnit(date, dateOffset.unit as unitOfTime.StartOf);
  } else if (dateOffset.endOfUnit) {
    return getEndDateOfUnit(date, dateOffset.unit as unitOfTime.StartOf);
  } else {
    return getDeltaOfUnit(date, dateOffset.unit as unitOfTime.DurationConstructor, dateOffset.offset);
  }
}

function getDeltaOfUnit(date: Date, unit: unitOfTime.DurationConstructor, offset: number): Date {
  return offset < 0 ? moment(date).subtract(unit, -offset).toDate() : moment(date).add(unit, offset).toDate();
}

function getStartDateOfUnit(date: Date, unit: unitOfTime.StartOf): Date {
  return moment(date).startOf(unit).toDate();
}

function getEndDateOfUnit(date: Date, unit: unitOfTime.StartOf) {
  return moment(date).endOf(unit).toDate();
}

// Handles JSON date string to DateTime JS object conversion.
function jsonParseDateSerializer(key, value) {

  if (typeof value === 'string' && dateFormat.test(value)) {
    return new Date(value);
  }

  return value;
}

export {
  getDateFromOffset,
  getDeltaOfUnit,
  getStartDateOfUnit,
  getEndDateOfUnit,
  jsonParseDateSerializer
};
