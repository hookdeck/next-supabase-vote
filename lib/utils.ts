import { type ClassValue, clsx } from "clsx";
import { parsePhoneNumber } from "libphonenumber-js";
import { twMerge } from "tailwind-merge";
import { IVoteOptions } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function nextWeek() {
  let currentDate = new Date();
  let nextWeekDate = new Date();
  nextWeekDate.setDate(currentDate.getDate() + 7);
  return nextWeekDate;
}

export function sortVoteOptionsBy(
  object: IVoteOptions,
  sortBy: "position" | "vote_count" = "position",
) {
  const sortedKeys = Object.keys(object).sort((a, b) => {
    if (sortBy === "position") {
      return object[a].position - object[b].position;
    } else {
      return object[b].vote_count - object[a].vote_count;
    }
  });

  // Create a new object with sorted keys
  const sortedVote: IVoteOptions = {};
  sortedKeys.forEach((key) => {
    sortedVote[key] = object[key];
  });
  return sortedVote;
}

export function getHighestVotedObjectKey(object: IVoteOptions) {
  let maxValue = -Infinity;
  let highestKey = "";
  for (const [key, value] of Object.entries(object)) {
    if (value.vote_count > maxValue) {
      highestKey = key;
      maxValue = value.vote_count;
    } else if (value.vote_count === maxValue) {
      highestKey = "";
    }
  }
  return highestKey;
}

export function getFromAndTo(page: number, itemPerPage = 3) {
  let from = page * itemPerPage;
  let to = from + itemPerPage;

  if (page > 0) {
    from += 1;
  }

  return { from, to };
}

export { parsePhoneNumber } from "libphonenumber-js";

export function toStoredPhoneNumberFormat(phoneNumber: string) {
  const parseNumber = parsePhoneNumber(phoneNumber);
  return parseNumber.format("E.164");
}

export function toDisplayedPhoneNumberFormat(phoneNumber: string) {
  const parseNumber = parsePhoneNumber(phoneNumber);
  return parseNumber.formatInternational();
}
