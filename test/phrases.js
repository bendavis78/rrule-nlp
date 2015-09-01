/* exported phrases */
/* globals rrule */
var phrases = [
  [
    'daily', 
    {
      'freq': rrule.DAILY, 
      'interval': 1
    }
  ], 
  [
    'each day', 
    {
      'freq': rrule.DAILY, 
      'interval': 1
    }
  ], 
  [
    'everyday', 
    {
      'freq': rrule.DAILY, 
      'interval': 1
    }
  ], 
  [
    'every other day', 
    {
      'freq': rrule.DAILY, 
      'interval': 2
    }
  ], 
  [
    'tuesdays', 
    {
      'byweekday': [rrule.TU], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'weekends', 
    {
      'byweekday': rrule.WEEKENDS,
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'weekdays', 
    {
      'byweekday': rrule.WEEKDAYS,
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every weekday', 
    {
      'byweekday': rrule.WEEKDAYS, 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'tuesdays and thursdays', 
    {
      'byweekday': [rrule.TU, rrule.TH], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'weekly on wednesdays', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'weekly on wednesdays and fridays', 
    {
      'byweekday': [rrule.WE, rrule.FR], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every sunday and saturday', 
    {
      'byweekday': rrule.WEEKENDS, 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every wed', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every wed.', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every wednsday', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every week on tues', 
    {
      'byweekday': [rrule.TU], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'once a week on sunday', 
    {
      'byweekday': [rrule.SU], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every 3 weeks on mon', 
    {
      'byweekday': [rrule.MO], 
      'interval': 3, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every 3 days', 
    {
      'freq': rrule.DAILY, 
      'interval': 3
    }
  ], 
  [
    'every 4th of the month', 
    {
      'freq': rrule.MONTHLY, 
      'interval': 1, 
      'bymonthday': [4] 
    }
  ], 
  [
    'every 4th and 10th of the month', 
    {
      'freq': rrule.MONTHLY, 
      'interval': 1, 
      'bymonthday': [4, 10]
    }
  ], 
  [
    'every first friday of the month', 
    {
      'byweekday': [rrule.FR.nth(1)], 
      'interval': 1, 
      'freq': rrule.MONTHLY
    }
  ], 
  [
    'first friday of every month', 
    {
      'byweekday': [rrule.FR.nth(1)], 
      'interval': 1, 
      'freq': rrule.MONTHLY
    }
  ], 
  [
    'first friday of each month', 
    {
      'byweekday': [rrule.FR.nth(1)], 
      'interval': 1, 
      'freq': rrule.MONTHLY
    }
  ], 
  [
    'first and third friday of each month', 
    {
      'byweekday': [rrule.FR.nth(1), rrule.FR.nth(3)],
      'interval': 1, 
      'freq': rrule.MONTHLY
    }
  ], 
  [
    'yearly on the fourth thursday in november', 
    {
      'bymonth': [11], 
      'byweekday': [rrule.TH.nth(4)], 
      'interval': 1, 
      'freq': rrule.YEARLY
    }
  ], 
  [
    'every year on the fourth thursday in november', 
    {
      'bymonth': [11], 
      'byweekday': [rrule.TH.nth(4)], 
      'interval': 1, 
      'freq': rrule.YEARLY
    }
  ], 
  [
    'once a year on december 25th', 
    {
      'bymonth': [12], 
      'freq': rrule.YEARLY, 
      'interval': 1, 
      'bymonthday': [25]
    }
  ], 
  [
    'every july 4th', 
    {
      'bymonth': [7], 
      'freq': rrule.YEARLY, 
      'interval': 1, 
      'bymonthday': [4]
    }
  ], 
  [
    'daily starting march 3rd', 
    {
      'freq': rrule.DAILY, 
      'dtstart': '20150303', 
      'interval': 1
    }
  ], 
  [
    'starting tomorrow on weekends', 
    {
      'byweekday': rrule.WEEKENDS, 
      'dtstart': '20150102', 
      'freq': rrule.WEEKLY, 
      'interval': 1
    }
  ], 
  [
    'daily starting march 3rd until april 5th', 
    {
      'freq': rrule.DAILY, 
      'dtstart': '20150303', 
      'until': '20150405', 
      'interval': 1
    }
  ], 
  [
    'every wed until november', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY, 
      'until': '20151101'
    }
  ], 
  [
    'every 4th of the month starting next tuesday', 
    {
      'freq': rrule.MONTHLY, 
      'dtstart': '20150106', 
      'bymonthday': [4], 
      'interval': 1
    }
  ], 
  [
    'mondays and thursdays from jan 1 to march 25th', 
    {
      'byweekday': [rrule.MO, rrule.TH], 
      'dtstart': '20150101', 
      'until': '20150325', 
      'freq': rrule.WEEKLY, 
      'interval': 1
    }
  ], 
  [
    'every 5 minutes', 
    {
      'freq': rrule.MINUTELY, 
      'interval': 5
    }
  ], 
  [
    'every 30 seconds', 
    {
      'freq': rrule.SECONDLY, 
      'interval': 30
    }
  ], 
  [
    'every other hour', 
    {
      'freq': rrule.HOURLY, 
      'interval': 2
    }
  ], 
  [
    'every 2 hours', 
    {
      'freq': rrule.HOURLY, 
      'interval': 2
    }
  ], 
  [
    'every 20 min', 
    null
  ], 
  [
    'daily at 3pm', 
    {
      'byminute': [0], 
      'freq': rrule.DAILY, 
      'byhour': [15], 
      'interval': 1
    }
  ], 
  [
    'daily at 3', 
    {
      'byminute': [0], 
      'freq': rrule.DAILY, 
      'byhour': [15], 
      'interval': 1
    }
  ],
  [
    'daily at 3:00pm', 
    {
      'byminute': [0], 
      'freq': rrule.DAILY, 
      'byhour': [15], 
      'interval': 1
    }
  ], 
  [
    'march 3rd', 
    {'dtstart': '20150303'}
  ], 
  [
    'tomorrow', 
    {'dtstart': '20150102'}
  ], 
  [
    'mar 2 2012', 
    {'dtstart': '20120302'}
  ], 
  [
    'this sunday', 
    {'dtstart': '20150104'}
  ], 
  [
    'this sunday at 3:00pm',
    {'dtstart': '20150104T150000'}
  ],
  [
    'this sunday at 3',
    {'dtstart': '20150104T150000'}
  ],
  [
    'thursday, february 18th', 
    null
  ], 
  [
    'march 3rd at 12:15am', 
    {'dtstart': '20150303T001500'}
  ], 
  [
    'tomorrow at 3:30', 
    {'dtstart': '20150102T153000'}
  ], 
  [
    'in 30 minutes', 
    {'dtstart': '20150101T123000'}
  ], 
  [
    'at 4', 
    {'dtstart': '20150101T160000'}
  ], 
  [
    '2 hours from now', 
    {'dtstart': '20150101T140000'}
  ], 
  [
    '2 hours and 30 minutes from now', 
    {'dtstart': '20150101T143000'}
  ], 
  [
    '2 hours 30 minutes from now', 
    {'dtstart': '20150101T143000'}
  ], 
  [
    'sunday at 2', 
    {'dtstart': '20150104T140000'}
  ]
];
