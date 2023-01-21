const nlp = require("compromise");
nlp.extend(require("compromise-dates"));

const { RRule } = require("rrule");

const isValidDate = (d) => {
  return d instanceof Date && !isNaN(Number(d));
};

function parseTime(t, startDate) {
  var d = new Date(startDate);
  var time = t.match(/(\d+)(?::(\d\d))?\s*(p?)/);
  d.setHours(parseInt(time[1]) + (time[3] ? 12 : 0));
  d.setMinutes(parseInt(time[2]) || 0);
  return d;
}

// format

// interface Reminder extends RRuleParams {
//   id: string;
//   text: string; // images and voice notes
//   stream: Stream[];
// }

// remind me to  {task} (every)? (on)? (at)? (until)? (times)?

// 1 Remind me to do this on 6th June -- done
// 2 Remind me to do this on 16th June every year 16 times
// 3 Remind me to do this on 16th June every year -- done
// 4 Remind me to do this every friday
// 5 Remind me to do this next Friday -- done
// 6 Remind me to do this on every
// 7 Remind me to do this day after tomorrow -- done
// 8 Remind me to do this three days from today -- done
// 9 Remind me to do this three days after 2nd June every year -- done
// 10 Remind me to do this every year on 5th March -- done
// 11 Remind me to do this third day of next week
// 12 Remind me to do this friday next week -- done
// 13 Remind me to do this everyday next week -- works when 'from' is not there
// 14 Remind me to do this everyday next month -- done
// 14 Remind me to do this everyday from next friday until next month
// 16 Remind me to do this three days from today at 10.00 AM
// 17 Remind me to do this on 7th June at 8PM -- done
// 18 Remind me to do this everyday next week at 7AM -- done
// 19 Remind me to do this everyday next week at 7AM until Sunday
// 20 Remind me to do this every three days next month at 7AM -- done
// 21 Remind me to do this every year on 5th March at 10.00AM  -- done
// 22 Remind me to do call popa in May,June and July -- nope
// 23 Remind me to do this every month on 13th
// 24 Remind me to tell Vaidehi that I'll see her on 3rd June on 1st June -- no way

// add support for everyday (next month/year/week)

let doc = nlp("Remind me to do this every month");

console.log(doc.dates().get());

let repeat = "";

let options;

let interval = 1;
if (doc.has("everyday")) {
  repeat = RRule.DAILY;
} else if (doc.has("every (#NumericValue | #TextValue) days")) {
  repeat = RRule.DAILY;
  interval = doc
    .match("every (#NumericValue | #TextValue) days")
    .numbers()
    .get()[0];
} else if (doc.has("every (#TextValue | #NumericValue)? (month | months)")) {
  repeat = RRule.MONTHLY;
  interval = doc
    .match("every (#TextValue | #NumericValue)? (month | months)")
    .numbers()
    .get()[0];
} else if (doc.has("every (#TextValue | #NumericValue)? (year | years)")) {
  repeat = RRule.YEARLY;
  interval = doc
    .match("every (#TextValue | #NumericValue)? (year | years)")
    .numbers()
    .get()[0];
} else if (doc.has("every (#TextValue | #NumericValue)? (second | seconds)")) {
  repeat = RRule.SECONDLY;
  interval = doc
    .match("every (#TextValue | #NumericValue)? (second | seconds)")
    .numbers()
    .get()[0];
} else if (doc.has("every (#TextValue | #NumericValue)? (hour | hours)")) {
  repeat = RRule.HOURLY;
  interval = doc
    .match("every (#TextValue | #NumericValue)? (hour | hours)")
    .numbers()
    .get()[0];
} else if (doc.has("every (#TextValue | #NumericValue)? (week | weeks)")) {
  repeat = RRule.WEEKLY;
  interval = doc
    .match("every (#TextValue | #NumericValue)? (week | weeks)")
    .numbers()
    .get()[0];
} else if (doc.has("every (#TextValue | #NumericValue)? (minute | minutes)")) {
  repeat = RRule.MINUTELY;
  interval = doc
    .match("every (#TextValue | #NumericValue)? (minute | minutes)")
    .numbers()
    .get()[0];
}

let startDate = new Date(doc.match("from .*").dates().get()[0]?.start);
let endDate = new Date(doc.match("until .*").dates().get()[0]?.start);

let time = new Date(doc.match("at .*").dates().get()[0]?.start);

if (!isValidDate(startDate)) {
  startDate = new Date();
}

let remDate = new Date(doc.match("(on .*)").dates().get()[0]?.start); // reminder date

if (!isValidDate(remDate)) {
  remDate = new Date();
}

if (remDate >= startDate) {
  startDate = remDate;
}

if (!interval) {
  interval = 1;
}

console.log(remDate);
console.log(interval);

const count = doc
  .match("(#NumericValue | #TextValue) times")
  .numbers()
  .get()[0];

options = {
  freq: repeat,
  interval: interval,
  dtstart: startDate,
};

if (endDate) options = { ...options, until: endDate };

if (count) options = { ...options, count };

console.log(options);
