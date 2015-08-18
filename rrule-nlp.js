/* globals chrono */
/* exported rrule */
var rrule = (function() {

var dateParser = new chrono.Chrono();

var extend = function(obj) {
  obj = obj || {};
  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i]) {
      continue;
    }
    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        obj[key] = arguments[i][key];
      }
    }
  }
  return obj;
};

var DAYS_OF_WEEK = [
  'mon(day)?',
  'tues?(day)?',
  '(we(dnes|nds|ns|des)day)|(wed)',
  '(th(urs|ers)day)|(thur?s?)',
  'fri(day)?',
  'sat([ue]rday)?',
  'sun(day)?',
  'weekday',
  'weekend'
];

var RE_DOWS = DAYS_OF_WEEK.map(function(r) {
  return new RegExp(r);
});
var RE_DOW = new RegExp('(' + DAYS_OF_WEEK.join(')|(') + ')');
var RE_PLURAL_DOW = /(mon|tues|wednes|thurs|fri|satur|sun)days/;
var RE_PLURAL_WEEKDAY = new RegExp('weekdays|weekends|' + RE_PLURAL_DOW.source);

var weekdayCodes = ['MO','TU','WE','TH','FR', 'SA', 'SU', 'MO,TU,WE,TH,FR', 'SA,SU'];

var MONTHS = [
  'jan(uary)?',
  'feb(r?uary)?',
  'mar(ch)?',
  'apr(il)?',
  'may',
  'jun(e)?',
  'jul(y)?',
  'aug(ust)?',
  'sept?(ember)?',
  'oct(ober)?',
  'nov(ember)?',
  'dec(ember)?',
];
var RE_MONTHS = MONTHS.map(function(r) {
  return new RegExp(r + '$');
});
var RE_MONTH = new RegExp('(' + MONTHS.join(')$|(') + ')$');

var units = ['year', 'month', 'week', 'day', 'hour', 'minute', 'seconds'];
var unitsFreq = ['yearly', 'monthly', 'weekly', 'daily', 'hourly', 'minutely', 'secondly'];

var RE_UNITS = new RegExp('^(' + units.join('s?|') + '?)$');

var ordinals = [
  'first', 'second', 'third', 'fourth', 'fifth', 
  'sixth', 'seventh', 'eighth', 'ninth', 'tenth'
];

var RE_ORDINALS = ordinals.map(function(r) {
  return new RegExp(r + '$');
});
var RE_ORDINAL = new RegExp('\\d+(st|nd|rd|th)$|' + ordinals.join('$|'));

var numbers = [
  'zero', 'one', 'two', 'three', 'four', 'five', 
  'six', 'seven', 'eight', 'nine', 'ten' 
];
var RE_NUMBER = new RegExp('(' + numbers.join('|') + ')$|(\\d+)$');

var RE_EVERY = new RegExp('(every|each|once)$');
var RE_THROUGH = new RegExp('(through|thru)$');
var RE_DAILY = new RegExp('daily|everyday');
var RE_RECURRING_UNIT = new RegExp('weekly|monthly|yearly');

var RE_AT_TIME = new RegExp('at\\s(.+)'); 
var RE_STARTING = new RegExp('start(?:s|ing)?');
var RE_ENDING = new RegExp('(?:\\bend|until)(?:s|ing)?');
var RE_REPEAT = new RegExp('(?:every|each|\\bon\\b|repeat(s|ing)?)');
var RE_START = new RegExp('(' + RE_STARTING.source + ')\\s(.*)');
var RE_EVENT = new RegExp(
  '((?:every|each|\\bon\\b|repeat|' + RE_DAILY.source + '|' + 
  RE_PLURAL_WEEKDAY.source + ')(?:s|ing)?(.*))');
var RE_END = new RegExp(RE_ENDING.source + '(.*)');
var RE_START_EVENT = new RegExp(RE_START.source + '\\s' + RE_EVENT.source);
var RE_EVENT_START = new RegExp(RE_EVENT.source + '\\s' + RE_START.source);
var RE_FROM_TO = new RegExp(
  '(.*)from(.*)(to|through|thru)(.*)');
//var RE_START_END = new RegExp(RE_START.source + '\\s' + RE_END.source);
var RE_OTHER_END = new RegExp('(.*)\\s' + RE_END.source);
var RE_SEP = new RegExp(
  '(from|to|through|thru|on|at|of|in|a|an|the|and|o|both)$');
var RE_AMBIGMOD = new RegExp('(this|next|last)$');
var RE_OTHER = new RegExp('other|alternate');

var RECUR_TYPES = {
  daily: RE_DAILY,
  every: RE_EVERY,
  through: RE_THROUGH,
  unit: RE_UNITS,
  recurringUnit: RE_RECURRING_UNIT,
  ordinal: RE_ORDINAL,
  number: RE_NUMBER,
  pluralWeekday: RE_PLURAL_WEEKDAY,
  weekday: RE_DOW,
  month: RE_MONTH
};

var TYPES = extend({}, RECUR_TYPES, {
  ambigmod: RE_AMBIGMOD,
  starting: RE_STARTING,
  ending: RE_ENDING,
  repeat: RE_REPEAT,
  sep: RE_SEP,
  other: RE_OTHER,
});

// add month parser to chrono to allow for, eg, "until november"
var monthParser = new chrono.Parser();
monthParser.pattern = function() {
  return RE_MONTH;
};
monthParser.extract = function(text, ref, match) {
  return new chrono.ParsedResult({
    ref: ref,
    text: match[0],
    index: match.index,
    start: {
      month: getMonth(match[0])
    }
  });
};
dateParser.parsers = chrono.casual.parsers;
dateParser.parsers.push(monthParser);


function getNumber(s) {
  if (isNaN(parseInt(s))) {
    return numbers.indexOf(s);
  }
  return parseInt(s);
}

function getOrdinalIndex(s) {
  var n = parseInt(s.slice(0,-2));
  if (!isNaN(n)) {
    return n;
  }
  for (var i=0; i<RE_ORDINALS.length; i++) {
    if (RE_ORDINALS[i].test(s)) {
      return i + 1;
    }
  }
  return -1;
}

function getDaysOfWeek(s) {
  for (var i=0; i<RE_DOWS.length; i++) {
    if (RE_DOWS[i].test(s)) {
      return weekdayCodes[i].split(',');
    }
  }
}

function getMonth(s) {
  for (var i=0; i<RE_MONTHS.length; i++) {
    if (RE_MONTHS[i].test(s)) {
      return i + 1;
    }
  }
}

function getUnitFreq(s) {
  for (var i=0; i<units.length; i++) {
    if (s.indexOf(units[i]) !== -1) {
      return unitsFreq[i];
    }
  }
}

function normalize(s) {
  s = s.trim().toLowerCase();
  s = s.replace(/\W&\S/, '');
  return s.replace(/\s+/, ' ');
}

function dateToString(d) {
  return d.getFullYear() + d.getMonth() + d.getDate();
}

/**
 * Token class
 */
function Token(text, allText, type) {
  this.text = text;
  this.allText = allText;
  this.type = type;
}

Token.prototype.toString = function() {
  return '<Token ' + this.text + ': ' + this.type + '>';
};


/**
 * Tokenizer class
 */
function Tokenizer(text) {
  this._text = text;
  this._tokens = [];
  var type;
  var tokens = text.split(' ');
  for (var i=0; i<tokens.length; i++) {
    for (type in TYPES) {
      if (TYPES[type].test(tokens[i])) {
        this._tokens.push(new Token(tokens[i], text, type));
        break;
      }
    }
  }
} 
Tokenizer.prototype = {
  filterTypes: function(types) {
    var newTokens = [];
    var token;
    for (var i=0; i<this._tokens.length; i++) {
      token = this._tokens[i];
      if (types.indexOf(token.type) !== -1) {
        newTokens.push(token);
      }
    }
    this._tokens = newTokens;
  },
  hasType: function(type) {
    return this.types.indexOf(type) !== -1;
  },
  textContains: function(s) {
    return this._text.indexOf(s) !== -1;
  },
  get: function(index) {
    return this._tokens[index];
  },
  remove: function(index) {
    this._tokens.splice(index, 1);
  },
  removeByType: function(type) {
    var i = this.types.indexOf(type);
    if (i !== -1) {
      this.remove(i);
    }
  },
  get types() {
    if (!this._types) {
      this._types = [];
      this._tokens.forEach(function(token) {
        this._types.push(token.type);
      }.bind(this));
    }
    return this._types;
  },
  get length() {
    return this._tokens.length;
  },
  toString: function() {
    return this._tokens.map(String).join(', ');
  }
};

function RRule(params) {
  this.until = null;
  this.interval = null;
  this.freq = null;
  this.weekdays = [];
  this.ordinalWeekdays = [];
  this.bymonthday = [];
  this.byyearday = [];
  this.bymonth = [];
  this.byhour = [];
  this.byminute = [];

  // not supported currently
  this.count = null;
  this.bysetpos = null;
  this.byweekno = null;

  for (var k in params) {
    if (this.hasOwnProperty(k)) {
      this[k] = params[k];
    }
  }
}

function getParsedDate(parsed) {
  if (!parsed) {
    return null;
  }
  var date = parsed.date();
  if (!parsed.isCertain('hour')) {
    date.setHours(0);
  }
  if (!parsed.isCertain('minutes')) {
    date.setMinutes(0);
  }
  if (!parsed.isCertain('seconds')) {
    date.setSeconds(0);
  }
  if (!parsed.isCertain('milliseconds')) {
    date.setMilliseconds(0);
  }
  return date;
}

RRule.prototype = {
  get byday() {
    if (this.ordinalWeekdays.length) {
      return Array.prototype.slice.call(this.ordinalWeekdays);
    } else if (this.weekdays.length) {
      return Array.prototype.slice.call(this.weekdays);
    }
    return null;
  },

  toString: function() {
    var rrule = '';
    var v, k, rules = [];
    for (k in this) {
      v = this[k];
      if (v === null) {
        continue;
      }
      if (v instanceof Array) {
        if (!v.length) {
          continue;
        }
        v = v.join(',');
      }
      if (v instanceof chrono.ParsedComponents) {
        v = getParsedDate(v);
      }
      if (typeof(v) === 'string' || typeof(v) === 'number') {
        if (typeof(v) === 'string') {
          v = v.toUpperCase();
        }
        rules.push(k.toUpperCase() + '=' + v);
      }
    }
    return rrule + rules.join(';');
  }
};

/**
 * ParsedResult class
 */
function ParsedResult() {
  this.phrase = null;
  this.rrule = null;
  this.refDate = null;
  this.dtstart = null;
  this.dtend = null;
}
ParsedResult.prototype = {
  toString: function() {
    var lines = [];
    if (this.dtstart) {
      var dtstart = getParsedDate(this.dtstart);
      lines.push('DTSTART:' + dateToString(dtstart));
      if (this.dtend) {
        var dtend = getParsedDate(this.dtend);
        lines.push('DTEND:' + dateToString(dtend));
      }
    }
    if (this.rrule) {
      lines.push('RRULE:' + this.rrule.toString());
    }
    return lines.join('\n');
  }
};


function parse(phrase, refDate) {
  var unparsed;
  var result = new ParsedResult();
  if (!phrase) {
    return result;
  }

  result.phrase = unparsed = normalize(phrase);
  result.refDate = refDate;
  result.rrule = new RRule();

  unparsed = parseStartAndEnd(unparsed, result);

  if (!unparsed) {
    result.rrule = null;
    return result;
  }

  var recurrence = parseRecurrence(unparsed, result);
  fireOnRecurrenceParsed(result.rrule);
  if (!recurrence) {
    result.rrule = null;
  }

  if (result.rrule) {
    // get time/times if its obvious
    var match = RE_AT_TIME.exec(unparsed);
    if (match) {
      parseRecurringTime(match[1], result);
    }
  } else {
    // no recurrence, try just date/time
    var parsed = parseDateTime(unparsed, result.refDate);
    if (parsed.length && parsed[0].start) {
      result.dtstart = parsed[0].start;
      if (parsed.end) {
        result.dtend = parsed[0].end;
      }
    }
  }

  return result;
}

function parseStartAndEnd(phrase, result) {
  var start, match;

  match = RE_START_EVENT.exec(phrase);
  if (match) {
    result.dtstart = parseDate(match[2], result.refDate);
    return extractEnding(match[3], result);
  }

  match = RE_EVENT_START.exec(phrase);
  if (match) {
    start = extractEnding(match[5], result);
    result.dtstart = parseDate(start, result.refDate);
    return match[1];
  }

  match = RE_FROM_TO.exec(phrase);
  if (match) {
    // support, eg: "daily from 2pm to 5pm"
    // We need to know freq, so we do this in a callback
    // * when freq > from/to: from/to acts as recurring duration
    // * otherwise: from/to acts as the rrule bounds (rrule.until)
    onRecurrenceParsed(function(rrule) {
      var from = parseDateTime(match[2], result.refDate);
      var to = parseDateTime(match[4], result.refDate);
      from = from.length ? from[0].start : null;
      to = to.length ? to[0].start : null;

      // We assume from/to have same resolution (eg, hour-to-hour, day-to-day)
      var knownValues = from.knownValues;
      var unit, idx, max = -1;
      for (unit in knownValues) {
        idx = units.indexOf(unit); 
        if (idx < max) {
          max = idx;
        }
      }
      result.dtstart = getParsedDate(from);
      if (!to) {
        return;
      }
      if (unitsFreq.indexOf(rrule.freq) < max) {
        result.dtend = getParsedDate(to);
      } else {
        result.rrule.until = getParsedDate(to);
      }
    });
    return match[1];
  }

  return extractEnding(phrase, result);
}

function extractEnding(phrase, result) {
  var match = RE_OTHER_END.exec(phrase);
  if (match) {
    result.rrule.until = parseDate(match[2], result.refDate);
    return match[1];
  }
  return phrase;
}

function parseRecurringTime(phrase, result) {
  var parsedTime = dateParser.parse(phrase, result.refDate);
  for (var i=0; i<parsedTime.length; i++) {
    if (!parsedTime[i].start) {
      continue;
    }
    if (parsedTime[i].start.isCertain('hour')) {
      result.rrule.byhour.push(parsedTime[i].start.get('hour'));
    }
    if (parsedTime[i].start.isCertain('minute')) {
      result.rrule.byminute.push(parsedTime[i].start.get('minute'));
    }
  }
}

function parseDate(date, refDate) {
  // parse a single date
  var parsed = dateParser.parse(date, refDate);
  return parsed.length ? parsed[0].start : null;
}

function parseDateTime(date, refDate) {
  // parse a date/datetime and return the chrono parseResult
  var parsed = dateParser.parse(date, refDate);
  return parsed.length ? parsed : null;
}


var onRecurrenceParsedListeners = [];
function onRecurrenceParsed(cb) {
  onRecurrenceParsedListeners.push(cb);
}
function fireOnRecurrenceParsed(rrule) {
  for (var i=0; i<onRecurrenceParsedListeners.length; i++) {
    onRecurrenceParsedListeners[i](rrule);
  }
}

function parseRecurrence(phrase, result) {
  var t = new Tokenizer(phrase);
  t.filterTypes(Object.keys(RECUR_TYPES));

  if (!t.length) {
    return null;
  }

  var rrule = result.rrule;

  // daily
  if (t.hasType('daily')) {
    rrule.interval = 1;
    rrule.freq = 'daily';
    return true;
  }

  // explicit weekdays
  if (t.hasType('pluralWeekday')) {
    if (t.textContains('weekdays')) {
      // "RRULE:FREQ=WEEKLY;WKST=MO;BYDAY=MO,TU,WE,TH,FR"
      rrule.interval = 1;
      rrule.freq = 'weekly';
      rrule.weekdays = ['MO', 'TU', 'WE', 'TH', 'FR'];
    } else if (t.textContains('weekends')) {
      rrule.interval = 1;
      rrule.freq = 'weekly';
      rrule.weekdays = ['SA', 'SU'];
    } else {
      // a plural weekday can really only mean one
      // of two things, weekly or biweekly
      rrule.freq = 'weekly';
      if (t.textContains('bi') || t.textContains('every other')) {
        rrule.interval = 2;
      } else {
        rrule.interval = 1;
      }
      for (var i=0; i<RE_DOWS.length; i++) {
        if (RE_DOWS[i].test(phrase)) {
          // this supports "thursdays and fridays"
          rrule.weekdays.push(weekdayCodes[i]);
        }
      }
    }
    return true;
  }

  // recurring phrases
  if (t.hasType('every') || t.hasType('recurringUnit')) {
    if (t.textContains('every other')) {
      rrule.interval = 2;
    } else {
      rrule.interval = 1;
    }

    t.removeByType('every');

    var ordDowString = function(dow, i) {
      return i.toString() + dow;
    };

    var n, index = 0;
    while (index < t.length) {
      if (t.get(index).type === 'number') {
        // we assume a bare number always specifies the interval
        n = getNumber(t.get(index).text);
        if (!isNaN(n)) {
          rrule.interval = n;
        }
      } else if (t.get(index).type === 'unit') {
        // we assume a bare unit (grow up...) always specifies the
        // frequency
        rrule.freq = getUnitFreq(t.get(index).text);
      } else if (t.get(index).type === 'ordinal') {
        var ords = [getOrdinalIndex(t.get(index).text)];

        // grab all iterated ordinals (e.g. 1st, 3rd and 4th of
        // november)
        while (index + 1 < t.length && t.get(index + 1).type === 'ordinal') {
          ords.push(getOrdinalIndex(t.get(index + 1).text));
          index += 1;
        }

        if (index + 1 < t.length && t.get(index + 1).type === 'weekday') {
          // "first wednesday of/in ..."
          var dow = getDaysOfWeek(t.get(index + 1).text)[0];
          var dowOrds = ords.map(ordDowString.bind(this, dow));
          rrule.ordinalWeekdays = rrule.ordinalWeekdays.concat(dowOrds);
          index += 1;
          if (index >= t.length) {
            break;
          }
        } else if (index + 1 < t.length && t.get(index + 1).type === 'unit') {
          // "first of the month/year"
          rrule.freq = getUnitFreq(t.get(index + 1).text);
          if (rrule.freq === 'monthly') {
            rrule.bymonthday = rrule.bymonthday.concat(ords.map(String));
          }
          if (rrule.freq === 'yearly') {
            rrule.byearday = rrule.byyearday.concat(ords.map(String));
          }
          index += 1;
          if (index >= t.length) {
            break;
          }
        }
      } else if (t.get(index).type === 'weekday') {
        // if we have a day of week, we can assume the frequency is
        // weekly if it hasnt been set yet.
        if (!rrule.freq) {
          rrule.freq = 'weekly';
        }
        rrule.weekdays = rrule.weekdays.concat(getDaysOfWeek(t.get(index).text));
      } else if (t.get(index).type === 'month') {
        // if we have a month we assume frequency is yearly if it hasnt
        // been set.
        if (!rrule.freq) {
          rrule.freq = 'yearly';
        }
        rrule.bymonth.push((getMonth(t.get(index).text)).toString());
        // TODO: should iterate this ordinal as well...
        if (index + 1 < t.length && t.get(index + 1).type === 'ordinal') {
          rrule.bymonthday.push(
            getOrdinalIndex(t.get(index + 1).text).toString());
        }
      }
      index += 1;
    }
    return true;
  }
  // No recurring match, return false
  return false;
}

return {
  parse: parse,
  getParsedDate: getParsedDate,
  ParsedResult: ParsedResult,
  RRule: RRule
};

})();
