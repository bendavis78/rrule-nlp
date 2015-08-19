/* globals chrono, moment */
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
var RE_PLURAL_WKDAY = new RegExp('weekdays|weekends|' + RE_PLURAL_DOW.source);

var weekdayCodes = [
  'MO','TU','WE','TH','FR', 'SA', 'SU',
  'MO,TU,WE,TH,FR', 'SA,SU'
];

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

var units = [
  'year', 'month', 'week', 'day', 
  'hour', 'minute', 'seconds'
];
var unitsFreq = [
  'yearly', 'monthly', 'weekly', 'daily', 
  'hourly', 'minutely', 'secondly'
];

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
  RE_PLURAL_WKDAY.source + ')(?:s|ing)?(.*))');
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
var RE_FROM_NOW = new RegExp('(.+) from now');
var RE_HRS_MINUTES = new RegExp('(.+) hours(?: and)? (.+) minutes');

var RECUR_TYPES = {
  daily: RE_DAILY,
  every: RE_EVERY,
  through: RE_THROUGH,
  unit: RE_UNITS,
  recurringUnit: RE_RECURRING_UNIT,
  ordinal: RE_ORDINAL,
  number: RE_NUMBER,
  pluralWeekday: RE_PLURAL_WKDAY,
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


/**
 * Chrono.js parser extensions
 */
dateParser.parsers = Array.prototype.slice.call(chrono.casual.parsers);

// support standalone month name, eg "next november"
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
dateParser.parsers.push(monthParser);

// support "2 hours and 30 minutes"
var hrsAndMinParser = new chrono.Parser();
hrsAndMinParser.pattern = function() {
  return new RegExp('in ' + RE_HRS_MINUTES.source);
};
hrsAndMinParser.extract = function(text, ref, match) {
  var resultHrs = dateParser.parse('in ' + match[1] + ' hours', ref);
  var resultMin = dateParser.parse('in ' + match[2] + ' minutes', ref);
  if (!resultHrs.length || !resultMin.length) {
    return null;
  }
  return new chrono.ParsedResult({
    ref: ref,
    text: match[0],
    index: match.index,
    start: {
      hour: resultHrs[0].start.knownValues.hour,
      minute: resultMin[0].start.knownValues.minute
    }
  });
};
dateParser.parsers.push(hrsAndMinParser);

// support time "from now", eg: "2 hours from now"
var fromNowParser = new chrono.Parser();
fromNowParser.pattern = function() {
  return RE_FROM_NOW;
};
fromNowParser.extract = function(text, ref, match) {
  var result = dateParser.parse('in ' + match[1], ref);
  if (!result.length) {
    return null;
  }
  return new chrono.ParsedResult({
    ref: ref,
    text: match[0],
    index: match.index,
    start: result[0].start.knownValues
  });
};
dateParser.parsers.push(fromNowParser);

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

function anyCertain(parsed) {
  var components = Array.prototype.slice.call(arguments, 1);
  for (var i=0; i<components.length; i++) {
    if (parsed.isCertain(components[i])) {
      return true;
    }
  }
}

/*
function allCertain(parsed) {
  var components = Array.prototype.slice.call(arguments, 1);
  for (var i=0; i<components.length; i++) {
    if (!parsed.isCertain(components[i])) {
      return false;
    }
  }
}
*/

function formatRFC(property, parsed, refDate) {
  var dateCertain = anyCertain(parsed, 'day', 'weekday', 'month', 'year');
  var timeCertain = anyCertain(parsed, 'hour', 'minute', 'second');
  var date = moment(parsed.date());
  if (!dateCertain) {
    var ref = moment(refDate);
    date.set({year: ref.year(), month: ref.month(), date: ref.date()});
  }
  if (!timeCertain) {
    date.set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  }

  // subject to change if a property needs to be a TIME type
  var validTypes, types = ['DATE-TIME', 'DATE'];
  if (property && property.toUpperCase() === 'COMPLETED') {
    types = ['DATE-TIME'];
  }

  if (dateCertain && timeCertain) {
    validTypes = ['DATE-TIME', 'DATE', 'TIME'];
  } else if (dateCertain) {
    validTypes = ['DATE', 'DATE-TIME', 'TIME'];
  } else if (timeCertain) {
    validTypes = ['TIME', 'DATE-TIME', 'DATE'];
  }

  var type = '';
  for (var t=0; t<validTypes.length; t++) {
    if (types.indexOf(validTypes[t]) !== -1) {
      type = validTypes[t];
      break;
    }
  }

  var format = {
    'DATE': 'YYYYMMDD',
    'TIME': 'HHmmss',
    'DATE-TIME': 'YYYYMMDDTHHmmss'
  }[type.toUpperCase()];

  if (!format) return '';

  return date.format(format);
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

  this.refDate = new Date();

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
    var rules = [];
    var v, k;
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
        v = formatRFC(k, v, this.refDate);
      }
      if (typeof(v) === 'string' || typeof(v) === 'number') {
        if (typeof(v) === 'string') {
          v = v.toUpperCase();
        }
        rules.push(k.toUpperCase() + '=' + v);
      }
    }
    return rules.join(';');
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
      lines.push('DTSTART:' + formatRFC('dtstart', this.dtstart, this.refDate));
      if (this.dtend) {
        lines.push('DTEND:' + formatRFC('dtstart', this.dtend, this.refDate));
      }
    }
    if (this.rrule) {
      lines.push('RRULE:' + this.rrule.toString());
    }
    return lines.join('\n');
  }
};


// TODO tests fail with refDate of midnight
function parse(phrase, opts) {
  opts = opts || {};
  var defaults = {
    preferAMStart: 8,
    preferFuture: false
  };
  opts = extend(defaults, opts);
  var unparsed;
  var result = new ParsedResult();
  if (!phrase) {
    return result;
  }

  result.opts = opts;
  result.phrase = unparsed = normalize(phrase);
  result.rrule = new RRule({refDate: opts.refDate});

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
      parseRecurringTime(match[0], result);
    }
  } else {
    // no recurrence, try just date/time
    var parsed = parseDate(unparsed, opts);
    if (parsed.start) {
      result.dtstart = parsed.start;
      if (parsed.end) {
        result.dtend = parsed.end;
      }
    }
  }

  return result;
}

function parseStartAndEnd(phrase, result) {
  var start, match;

  match = RE_START_EVENT.exec(phrase);
  if (match) {
    result.dtstart = parseDate(match[2], result.opts).start;
    return extractEnding(match[3], result);
  }

  match = RE_EVENT_START.exec(phrase);
  if (match) {
    start = extractEnding(match[5], result);
    result.dtstart = parseDate(start, result.opts).start;
    return match[1];
  }

  match = RE_FROM_TO.exec(phrase);
  if (match) {
    // support, eg: "daily from 2pm to 5pm"
    // We need to know freq, so we do this in a callback
    // * when freq > from/to: from/to acts as recurring duration
    // * otherwise: from/to acts as the rrule bounds (rrule.until)
    onRecurrenceParsed(function(rrule) {
      var from = parseDate(match[2], result.opts).start;
      var to = parseDate(match[4], result.opts).start;

      // We assume from/to have same resolution (eg, hour-to-hour, day-to-day)
      var knownValues = from.knownValues;
      var unit, idx, max = -1;
      for (unit in knownValues) {
        idx = units.indexOf(unit); 
        if (idx < max) {
          max = idx;
        }
      }
      result.dtstart = from;
      if (!to) {
        return;
      }
      if (unitsFreq.indexOf(rrule.freq) < max) {
        result.dtend = to;
      } else {
        result.rrule.until = to;
      }
    });
    return match[1];
  }

  return extractEnding(phrase, result);
}

function extractEnding(phrase, result) {
  var match = RE_OTHER_END.exec(phrase);
  if (match) {
    result.rrule.until = parseDate(match[2], result.opts).start;
    return match[1];
  }
  return phrase;
}

function parseRecurringTime(phrase, result) {
  var dateResult;
  var parsedTime = dateParser.parse(phrase, result.opts.refDate);
  for (var i=0; i<parsedTime.length; i++) {
    if (!parsedTime[i].start) {
      continue;
    }

    dateResult = refineDate(parsedTime[i].start, result.opts);
    if (dateResult.isCertain('hour')) {
      result.rrule.byhour.push(dateResult.get('hour'));
    }
    if (dateResult.isCertain('minute')) {
      result.rrule.byminute.push(dateResult.get('minute'));
    }
  }
}

function refineDate(dateResult, opts) {
  if (!dateResult) {
    return dateResult;
  }
  if (opts.preferFuture && dateResult.date() < opts.refDate) {
    // if weekday is known but day is not, prefer the future date
    if (!dateResult.isCertain('day') && dateResult.isCertain('weekday')) {
      var date = moment(dateResult.date());
      date.add(7, 'days');
      dateResult.imply('day', date.date()); 
      dateResult.imply('month', date.month() + 1);
      dateResult.imply('year', date.year());
    }
  }
  var hour = dateResult.get('hour');
  if (!dateResult.isCertain('meridiem') && hour < opts.preferAMStart) {
    dateResult.assign('hour', hour +  12);
    dateResult.imply('meridiem', 1);
  }
  return dateResult;
}

function parseDate(date, opts) {
  var parsed = dateParser.parse(date, opts.refDate);
  parsed = parsed.length ? parsed[0] : {start: null, end: null};
  parsed.start = refineDate(parsed.start, opts);
  parsed.end = refineDate(parsed.end, opts);
  return parsed;
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
        var daysOfWeek = getDaysOfWeek(t.get(index).text);
        rrule.weekdays = rrule.weekdays.concat(daysOfWeek);
      } else if (t.get(index).type === 'month') {
        // if we have a month we assume frequency is yearly if it hasnt
        // been set.
        if (!rrule.freq) {
          rrule.freq = 'yearly';
        }
        rrule.bymonth.push((getMonth(t.get(index).text)).toString());
        // TODO: should iterate this ordinal as well...
        if (index + 1 < t.length && t.get(index + 1).type === 'ordinal') {
          var oidx = getOrdinalIndex(t.get(index + 1).text).toString();
          rrule.bymonthday.push(oidx);
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
  formatRFC: formatRFC,
  ParsedResult: ParsedResult,
  RRule: RRule
};

})();

// vim: tw=79
