/* exported fullPhrases */
/* globals rrule */
var fullPhrases = [
  [
    'do something daily', 
    {
      'freq': rrule.DAILY, 
      'interval': 1
    }
  ], 
  [
    'do something each day', 
    {
      'freq': rrule.DAILY, 
      'interval': 1
    }
  ], 
  [
    'do something everyday', 
    {
      'freq': rrule.DAILY, 
      'interval': 1
    }
  ], 
  [
    'do something every other day', 
    {
      'freq': rrule.DAILY, 
      'interval': 2
    }
  ], 
  [
    'do something tuesdays', 
    {
      'byweekday': [rrule.TU], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'do something weekends', 
    {
      'byweekday': rrule.WEEKENDS,
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'do something weekdays', 
    {
      'byweekday': rrule.WEEKDAYS,
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'do something every weekday', 
    {
      'byweekday': rrule.WEEKDAYS, 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'do something tuesdays and thursdays', 
    {
      'byweekday': [rrule.TU, rrule.TH], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'do something weekly on wednesdays', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'do something weekly on wednesdays and fridays', 
    {
      'byweekday': [rrule.WE, rrule.FR], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every sunday and saturday remind me to do something', 
    {
      'byweekday': rrule.WEEKENDS, 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'remind me to do something every wed', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every wed. do seomthing', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'do something every wednsday', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'every week on tues go to my appointment', 
    {
      'byweekday': [rrule.TU], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'mow the lawn once a week on sunday', 
    {
      'byweekday': [rrule.SU], 
      'interval': 1, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'read a book every 3 weeks on mon', 
    {
      'byweekday': [rrule.MO], 
      'interval': 3, 
      'freq': rrule.WEEKLY
    }
  ], 
  [
    'execercise every 3 days', 
    {
      'freq': rrule.DAILY, 
      'interval': 3
    }
  ], 
  [
    'be creative every 4th of the month', 
    {
      'freq': rrule.MONTHLY, 
      'interval': 1, 
      'bymonthday': [4] 
    }
  ], 
  [
    'on every 4th and 10th of the month I need to call mom', 
    {
      'freq': rrule.MONTHLY, 
      'interval': 1, 
      'bymonthday': [4, 10]
    }
  ], 
  [
    'do something every first friday of the month', 
    {
      'byweekday': [rrule.FR.nth(1)], 
      'interval': 1, 
      'freq': rrule.MONTHLY
    }
  ], 
  [
    'get funky on the first friday of every month', 
    {
      'byweekday': [rrule.FR.nth(1)], 
      'interval': 1, 
      'freq': rrule.MONTHLY
    }
  ], 
  [
    'get funky on the first friday of each month', 
    {
      'byweekday': [rrule.FR.nth(1)], 
      'interval': 1, 
      'freq': rrule.MONTHLY
    }
  ], 
  [
    'get funky on the first and third friday of each month', 
    {
      'byweekday': [rrule.FR.nth(1), rrule.FR.nth(3)],
      'interval': 1, 
      'freq': rrule.MONTHLY
    }
  ], 
  [
    'get funky on the first and third friday every other month', 
    {
      'byweekday': [rrule.FR.nth(1), rrule.FR.nth(3)],
      'interval': 2, 
      'freq': rrule.MONTHLY
    }
  ], 
  [
    'get funky on the first and third friday of november every other year', 
    {
      'byweekday': [rrule.FR.nth(1), rrule.FR.nth(3)],
      'bymonth': [11],
      'interval': 2, 
      'freq': rrule.YEARLY
    }
  ], 
  [
    'go to an event yearly on the fourth thursday in november', 
    {
      'bymonth': [11], 
      'byweekday': [rrule.TH.nth(4)], 
      'interval': 1, 
      'freq': rrule.YEARLY
    }
  ], 
  [
    'go to an event every year on the fourth thursday in november', 
    {
      'bymonth': [11], 
      'byweekday': [rrule.TH.nth(4)], 
      'interval': 1, 
      'freq': rrule.YEARLY
    }
  ], 
  [
    'christmas is once a year on december 25th', 
    {
      'bymonth': [12], 
      'freq': rrule.YEARLY, 
      'interval': 1, 
      'bymonthday': [25]
    }
  ], 
  [
    'I will be in Wichita every july 4th', 
    {
      'bymonth': [7], 
      'freq': rrule.YEARLY, 
      'interval': 1, 
      'bymonthday': [4]
    }
  ], 
  [
    'drink water daily starting march 3rd', 
    {
      'freq': rrule.DAILY, 
      'dtstart': '20150303', 
      'interval': 1
    }
  ], 
  [
    'clean the laundry room starting tomorrow on weekends', 
    {
      'byweekday': rrule.WEEKENDS, 
      'dtstart': '20150102', 
      'freq': rrule.WEEKLY, 
      'interval': 1
    }
  ], 
  [
    'learn something new every day starting march 3rd until april 5th', 
    {
      'freq': rrule.DAILY, 
      'dtstart': '20150303', 
      'until': '20150405', 
      'interval': 1
    }
  ], 
  [
    'prepare for the event every wed until november', 
    {
      'byweekday': [rrule.WE], 
      'interval': 1, 
      'freq': rrule.WEEKLY, 
      'until': '20151101'
    }
  ], 
  [
    'get excited every 4th of the month starting next tuesday', 
    {
      'freq': rrule.MONTHLY, 
      'dtstart': '20150106', 
      'bymonthday': [4], 
      'interval': 1
    }
  ], 
  [
    'get busy with it mondays and thursdays from jan 1 to march 25th', 
    {
      'byweekday': [rrule.MO, rrule.TH], 
      'dtstart': '20150101', 
      'until': '20150325', 
      'freq': rrule.WEEKLY, 
      'interval': 1
    }
  ], 
  [
    'every 5 minutes remind me to stretch', 
    {
      'freq': rrule.MINUTELY, 
      'interval': 5
    }
  ], 
  [
    'blink every 30 seconds', 
    {
      'freq': rrule.SECONDLY, 
      'interval': 30
    }
  ], 
  [
    'take a break every other hour', 
    {
      'freq': rrule.HOURLY, 
      'interval': 2
    }
  ], 
  [
    'take a break every 2 hours', 
    {
      'freq': rrule.HOURLY, 
      'interval': 2
    }
  ], 
  [
    'every 20 min I should log my time', 
    null
  ], 
  [
    'take medicine daily at 3pm', 
    {
      'byminute': [0], 
      'freq': rrule.DAILY, 
      'byhour': [15], 
      'interval': 1
    }
  ], 
  [
    'take medicine daily at 3', 
    {
      'byminute': [0], 
      'freq': rrule.DAILY, 
      'byhour': [15], 
      'interval': 1
    }
  ],
  [
    'take medicine daily at 3:20pm', 
    {
      'byminute': [20], 
      'freq': rrule.DAILY, 
      'byhour': [15], 
      'interval': 1
    }
  ], 
  [
    'take medicine every day at 3:20pm',
    {
      'byminute': [20], 
      'freq': rrule.DAILY, 
      'byhour': [15], 
      'interval': 1
    }
  ],
  [
    'take medicine at 3:20pm every day',
    {
      'byminute': [20], 
      'freq': rrule.DAILY, 
      'byhour': [15], 
      'interval': 1
    }
  ],
  [
    'remind me to take my medicine at 10 and 2pm daily',
    {
      'byminute': [0], 
      'freq': rrule.DAILY, 
      'byhour': [10, 14], 
      'interval': 1
    }
  ],
  [
    'remind me to take my medicine at 10 and 2pm every day',
    {
      'byminute': [0], 
      'freq': rrule.DAILY, 
      'byhour': [10, 14], 
      'interval': 1
    }
  ],
  [
    'remind me to take my medicine every day at 10 and 2pm',
    {
      'byminute': [0], 
      'freq': rrule.DAILY, 
      'byhour': [10, 14], 
      'interval': 1
    }
  ],
  [
    'remind me at 10 and 2pm every day to take my medicine',
    {
      'byminute': [0], 
      'freq': rrule.DAILY, 
      'byhour': [10, 14], 
      'interval': 1
    }
  ],
  [
    'remind me at 10 and 2:30pm to take my medicine',
    {
      'freq': rrule.DAILY,
      'byhour': [10, 14], 
      'byminute': [0, 30], 
      'bysetpos': [1, 4],
      'count': 2,
      'interval': 1
    }
  ],
  [
    'remind me to take meds at 10, 2:30, and 6',
    {
      'freq': rrule.DAILY,
      'byhour': [10, 14, 18], 
      'byminute': [0, 30],
      'bysetpos': [1, 4, 5],
      'count': 3,
      'interval': 1
    }
  ],
  [
    'remind me to take meds at 10:30, 2, and 6:15',
    {
      'freq': rrule.DAILY,
      'dtstart': '20150101T103000',
      'byhour': [10, 14, 18], 
      'byminute': [0, 15, 30],
      'bysetpos': [3, 4, 8],
      'count': 3,
      'interval': 1,
    }
  ],
  [
    'remind me to do something this sunday at 10:30, 2, and 6:15',
    {
      'dtstart': '20150104T103000',
      'freq': rrule.DAILY,
      'byhour': [10, 14, 18], 
      'byminute': [0, 15, 30],
      'bysetpos': [3, 4, 8],
      'count': 3,
      'interval': 1
    }
  ],
  [
    'do something march 3rd', 
    {'dtstart': '20150303'}
  ], 
  [
    'do something tomorrow', 
    {'dtstart': '20150102'}
  ], 
  [
    'do something mar 2 2012', 
    {'dtstart': '20120302'}
  ], 
  [
    'do something this sunday', 
    {'dtstart': '20150104'}
  ], 
  [
    'this sunday at 3:00pm is the superbowl',
    {'dtstart': '20150104T150000'}
  ],
  [
    'this sunday at 3 remind me to make nachos',
    {'dtstart': '20150104T150000'}
  ],
  [
    'do something march 3rd at 12:15am', 
    {'dtstart': '20150303T001500'}
  ], 
  [
    'be awesome tomorrow at 3:30', 
    {'dtstart': '20150102T153000'}
  ], 
  [
    'in 30 minutes remind me to drink some water', 
    {'dtstart': '20150101T123000'}
  ], 
  [
    'walk the dog at 4', 
    {'dtstart': '20150101T160000'}
  ], 
  [
    'do somethign 2 hours from now', 
    {'dtstart': '20150101T140000'}
  ], 
  [
    'do something 2 hours and 30 minutes from now', 
    {'dtstart': '20150101T143000'}
  ], 
  [
    'do something 2 hours 30 minutes from now', 
    {'dtstart': '20150101T143000'}
  ], 
  [
    'take a nap sunday at 2', 
    {'dtstart': '20150104T140000'}
  ]
];
