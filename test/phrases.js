/* exported phrases */
var phrases = [
  [
    'daily', 
    {
      'freq': 'daily', 
      'interval': 1
    }
  ], 
  [
    'each day', 
    {
      'freq': 'daily', 
      'interval': 1
    }
  ], 
  [
    'everyday', 
    {
      'freq': 'daily', 
      'interval': 1
    }
  ], 
  [
    'every other day', 
    {
      'freq': 'daily', 
      'interval': 2
    }
  ], 
  [
    'tuesdays', 
    {
      'byday': 'TU', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'weekends', 
    {
      'byday': 'SA,SU', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'weekdays', 
    {
      'byday': 'MO,TU,WE,TH,FR', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'every weekday', 
    {
      'byday': 'MO,TU,WE,TH,FR', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'tuesdays and thursdays', 
    {
      'byday': 'TU,TH', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'weekly on wednesdays', 
    {
      'byday': 'WE', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'weekly on wednesdays and fridays', 
    {
      'byday': 'WE,FR', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'every sunday and saturday', 
    {
      'byday': 'SU,SA', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'every wed', 
    {
      'byday': 'WE', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'every wed.', 
    {
      'byday': 'WE', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'every wednsday', 
    {
      'byday': 'WE', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'every week on tues', 
    {
      'byday': 'TU', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'once a week on sunday', 
    {
      'byday': 'SU', 
      'interval': 1, 
      'freq': 'weekly'
    }
  ], 
  [
    'every 3 weeks on mon', 
    {
      'byday': 'MO', 
      'interval': 3, 
      'freq': 'weekly'
    }
  ], 
  [
    'every 3 days', 
    {
      'freq': 'daily', 
      'interval': 3
    }
  ], 
  [
    'every 4th of the month', 
    {
      'freq': 'monthly', 
      'interval': 1, 
      'bymonthday': '4'
    }
  ], 
  [
    'every 4th and 10th of the month', 
    {
      'freq': 'monthly', 
      'interval': 1, 
      'bymonthday': '4,10'
    }
  ], 
  [
    'every first friday of the month', 
    {
      'byday': '1FR', 
      'interval': 1, 
      'freq': 'monthly'
    }
  ], 
  [
    'first friday of every month', 
    {
      'byday': '1FR', 
      'interval': 1, 
      'freq': 'monthly'
    }
  ], 
  [
    'first friday of each month', 
    {
      'byday': '1FR', 
      'interval': 1, 
      'freq': 'monthly'
    }
  ], 
  [
    'first and third friday of each month', 
    {
      'byday': '1FR,3FR', 
      'interval': 1, 
      'freq': 'monthly'
    }
  ], 
  [
    'yearly on the fourth thursday in november', 
    {
      'bymonth': '11', 
      'byday': '4TH', 
      'interval': 1, 
      'freq': 'yearly'
    }
  ], 
  [
    'every year on the fourth thursday in november', 
    {
      'bymonth': '11', 
      'byday': '4TH', 
      'interval': 1, 
      'freq': 'yearly'
    }
  ], 
  [
    'once a year on december 25th', 
    {
      'bymonth': '12', 
      'freq': 'yearly', 
      'interval': 1, 
      'bymonthday': '25'
    }
  ], 
  [
    'every july 4th', 
    {
      'bymonth': '7', 
      'freq': 'yearly', 
      'interval': 1, 
      'bymonthday': '4'
    }
  ], 
  [
    'daily starting march 3rd', 
    {
      'freq': 'daily', 
      'dtstart': new Date(2015, 2, 3), 
      'interval': 1
    }
  ], 
  [
    'starting tomorrow on weekends', 
    {
      'byday': 'SA,SU', 
      'dtstart': new Date(2015, 0, 2), 
      'freq': 'weekly', 
      'interval': 1
    }
  ], 
  [
    'daily starting march 3rd until april 5th', 
    {
      'freq': 'daily', 
      'dtstart': new Date(2015, 2, 3), 
      'until': new Date(2015, 3, 5), 
      'interval': 1
    }
  ], 
  [
    'every wed until november', 
    {
      'byday': 'WE', 
      'interval': 1, 
      'freq': 'weekly', 
      'until': new Date(2015, 10, 1)
    }
  ], 
  [
    'every 4th of the month starting next tuesday', 
    {
      'freq': 'monthly', 
      'dtstart': new Date(2015, 0, 6), 
      'bymonthday': '4', 
      'interval': 1
    }
  ], 
  [
    'mondays and thursdays from jan 1 to march 25th', 
    {
      'byday': 'MO,TH', 
      'dtstart': new Date(2015, 0, 1), 
      'until': new Date(2015, 2, 25), 
      'freq': 'weekly', 
      'interval': 1
    }
  ], 
  [
    'every 5 minutes', 
    {
      'freq': 'minutely', 
      'interval': 5
    }
  ], 
  [
    'every 30 seconds', 
    {
      'freq': 'secondly', 
      'interval': 30
    }
  ], 
  [
    'every other hour', 
    {
      'freq': 'hourly', 
      'interval': 2
    }
  ], 
  [
    'every 2 hours', 
    {
      'freq': 'hourly', 
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
      'byminute': '0', 
      'freq': 'daily', 
      'byhour': '15', 
      'interval': 1
    }
  ], 
  [
    'daily at 3:00pm', 
    {
      'byminute': '0', 
      'freq': 'daily', 
      'byhour': '15', 
      'interval': 1
    }
  ], 
  [
    'march 3rd', 
    {'dtstart': new Date(2015, 2, 3)}
  ], 
  [
    'tomorrow', 
    {'dtstart': new Date(2015, 0, 2)}
  ], 
  [
    'mar 2 2012', 
    {'dtstart': new Date(2012, 2, 2)}
  ], 
  [
    'this sunday', 
    {'dtstart': new Date(2015, 0, 3)}
  ], 
  [
    'thursday, february 18th', 
    null
  ], 
  [
    'march 3rd at 12:15am', 
    {'dtstart': new Date(2015, 2, 3, 0, 15, 0)}
  ], 
  [
    'tomorrow at 3:30', 
    {'dtstart': new Date(2015, 0, 2, 15, 30, 0)}
  ], 
  [
    'in 30 minutes', 
    {'dtstart': new Date(2015, 0, 1, 0, 30, 0)}
  ], 
  [
    'at 4', 
    {'dtstart': new Date(2015, 0, 1, 16, 0, 0)}
  ], 
  [
    '2 hours from now', 
    {'dtstart': new Date(2015, 0, 1, 2, 0, 0)}
  ], 
  [
    'sunday at 2', 
    {'dtstart': new Date(2015, 0, 3, 14, 0, 0)}
  ]
];
