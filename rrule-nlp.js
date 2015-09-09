/* globals chrono, moment, RRule: true */
/* exported rrule */
var rrule = (function(RRule) {

// exported module
var rrule = {};

// basic object extend utility
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

//=============================================================================
// Constants
//=============================================================================

var DAYS_OF_WEEK = [
  'mon(day)?',
  'tues?(day)?',
  '(we(dnes|nds|ns|des)day)|(wed)',
  '(th(urs|ers)day)|(thur?s?)',
  'fri(day)?',
  'sat([ue]rday)?',
  'sun(day)?'
];

var RE_DOWS = DAYS_OF_WEEK.map(function(r) {
  return new RegExp(r);
});
var RE_WEEKDAY = new RegExp('weekday');
var RE_WEEKEND = new RegExp('weekend');
var RE_DOW = new RegExp('(' + DAYS_OF_WEEK.join(')|(') + ')');
var RE_PLURAL_DOW = /(mon|tues|wednes|thurs|fri|satur|sun)days/;
var RE_PLURAL_WKDAY = new RegExp('weekdays|weekends|' + RE_PLURAL_DOW.source);

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
var RE_DAILY = new RegExp('daily|every_?day');
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

var RE_WKDAY_TYPE = new RegExp(RE_DOW.source + '|(weekday)|(weekend)');

//patterns that should be parsed as a single token (replaces spaces w/ _)
var COMBINE = [
  new RegExp('every\\s+day', 'g')
];

var RECUR_TYPES = {
  daily: RE_DAILY,
  every: RE_EVERY,
  through: RE_THROUGH,
  unit: RE_UNITS,
  recurringUnit: RE_RECURRING_UNIT,
  ordinal: RE_ORDINAL,
  number: RE_NUMBER,
  pluralWeekday: RE_PLURAL_WKDAY,
  weekday: RE_WKDAY_TYPE,
  month: RE_MONTH
};

var TOKEN_TYPES = extend({}, RECUR_TYPES, {
  ambigmod: RE_AMBIGMOD,
  starting: RE_STARTING,
  ending: RE_ENDING,
  repeat: RE_REPEAT,
  sep: RE_SEP,
  other: RE_OTHER,
});


//=============================================================================
// Chrono.js parser extensions
//=============================================================================

var dateParser = new chrono.Chrono();
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


//=============================================================================
// Utility Functions
//=============================================================================

function replaceAt(text, start, length, replace) {
  return text.substr(0, start) + replace + text.substr(start + replace.length);
}

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
      return [rrule.DAYS_OF_WEEK[i]];
    }
  }
  if (RE_WEEKDAY.test(s)) {
    return rrule.WEEKDAYS;
  }
  if (RE_WEEKEND.test(s)) {
    return rrule.WEEKENDS;
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
      return rrule[rrule.FREQUENCIES[i]];
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

//=============================================================================
// Token
//=============================================================================

function Token(tokenizer, text, type) {
  this.tokenizer = tokenizer;
  this.text = text;
  this.type = type;
}

Token.prototype.toString = function() {
  return '<Token "' + this.text + '": ' + this.type + '>';
};


//=============================================================================
// Tokenizer
//=============================================================================

function Tokenizer(text) {
  this._text = text;
  this._tokens = [];
  var i, m, type, tokens;
  
  for (i=0; i<COMBINE.length; i++) {
    while ((m = COMBINE[i].exec(text)) !== null) {
      // TODO this only works with regexps with one match group
      text = replaceAt(text, m.index, m[0].length, m[0].replace(' ', '_'));
    }
  }
  
  tokens = text.split(' ');
  for (i=0; i<tokens.length; i++) {
    for (type in TOKEN_TYPES) {
      if (TOKEN_TYPES[type].test(tokens[i])) {
        this._tokens.push(new Token(this, tokens[i], type));
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

//=============================================================================
// RRule
//=============================================================================

var BaseRRule = RRule;
function getRRuleDescriptor(opt) {
  if (opt === 'dtstart') {
    return {
      value: null
    };
  }
  var desc = {
    get: function() {
      if (this._parsedComponents[opt]) {
        return this._parsedComponents[opt];
      }
      return this.options[opt];
    },
    set: function(value) {
      if (value instanceof chrono.ParsedComponents) {
        this._parsedComponents[opt] = value;
        value = value.date();
      }
      this.options[opt] = value;
    }
  };

  return desc;
}
RRule = function(params, noCache) {
  params = params || {};
  var desc;
  for (var opt in BaseRRule.DEFAULT_OPTIONS) {
    desc = getRRuleDescriptor.call(this, opt);
    Object.defineProperty(this, opt, desc);
  }
  this._parsedComponents = {};

  BaseRRule.call(this, params, noCache);

  // don't let BaseRRule set a default wkst
  this.options.wkst = params.wkst || null;

  for (opt in BaseRRule.DEFAULT_OPTIONS) {
    // initialize by* keys to an empty array
    if (opt.match(/^by[a-z]+/)) {
      this[opt] = [];
    }
  }
};
RRule.prototype = Object.create(BaseRRule.prototype, {
  origOptions: {
    get: function() {
      var opts = {};
      var v;
      for (var k in this.options) {
        v = this.options[k]; 
        if (v instanceof Array && v.length === 0) {
          v = null;
        }
        opts[k] = v;
      }
      return opts;
    }
  }
});
RRule.prototype.fromText = function(phrase, opts) {
  return parse(phrase, opts);
};
RRule.prototype.optionsToString = function() {
  return BaseRRule.optionsToString(this.options);
};
RRule.prototype.toString = function() {
  return BaseRRule.optionsToString(this.options);
};
RRule.prototype.componentToRFCString = function(property) {
  return formatRFC(property, this[property], this.refDate); 
};
RRule.prototype.toText = function() {
  // monkeypatch options for toText()
  var orig = {};
  var v;
  for (var k in this.options) {
    v = this.options[k];
    orig[k] = v;
    if (v instanceof Array && v.length === 0) {
      if (!k.match(/^byn/)) {
        this.options[k] = null;
      }
    }
  }
  var text = BaseRRule.prototype.toText.call(this);
  this.options = orig;
  if (text.match(/RRule error:/)) {
    return null;
  }
  if (this.byhour.length) {
    text += ' at ';
    var hrs = this.byhour.map(function(h) {
      var m = ('00' + (this.byminute[0] || '')).slice(-2);
      return h % 12 + ':' + m + (h < 12 ? 'am' : 'pm');
    }.bind(this));
    text += hrs.join(', ');
  }
  return text;
};
RRule.prototype.constructor = RRule;

rrule.FREQUENCIES = BaseRRule.FREQUENCIES;
var i;
for (i=0; i<rrule.FREQUENCIES.length; i++) {
  rrule[rrule.FREQUENCIES[i]] = i;
}

rrule.DAYS_OF_WEEK = [
  BaseRRule.MO,
  BaseRRule.TU,
  BaseRRule.WE,
  BaseRRule.TH,
  BaseRRule.FR,
  BaseRRule.SA,
  BaseRRule.SU
];
for (i=0; i<rrule.DAYS_OF_WEEK.length; i++) {
  rrule[rrule.DAYS_OF_WEEK[i].toString()] = rrule.DAYS_OF_WEEK[i];
}
rrule.WEEKDAYS = rrule.DAYS_OF_WEEK.slice(0, 5);
rrule.WEEKENDS = rrule.DAYS_OF_WEEK.slice(5, 7);


//=============================================================================
// Event
//=============================================================================

function Event(refDate) {
  this.phrase = null;
  this.rrule = null;
  this.refDate = refDate;
  this.dtstart = null;
  this.dtend = null;
}
Event.prototype = {
  toRFCString: function() {
    var value = '';
    if (this.dtstart) {
      value += 'DTSTART:' + formatRFC('dtstart', this.dtstart, this.refDate) + '\n';
      if (this.dtend) {
        value += 'DTEND:' + formatRFC('dtstart', this.dtend, this.refDate) + '\n';
      }
    }
    if (this.rrule) {
      var rfcRRule = this.rrule.toString();
      value += rfcRRule.replace(/(;DTSTART=[^;]*)|(DTSTART=[^;]*;?)/, '');
    }
    return value;
  },

  componentToRFCString: function(property) {
    return formatRFC(property, this[property], this.refDate); 
  },

  toString: function() {
    if (this.rrule) {
      var text = this.rrule.toText();
      if (!text) {
        return this.phrase;
      }
      return text;
    } else if (this.dtstart) {
      return this.dtstart.date().toString();
    }
    return '';
  },
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
  var result = new Event(opts.refDate);
  if (!phrase) {
    return result;
  }

  result.opts = opts;
  result.phrase = unparsed = normalize(phrase);
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
      parseRecurringTime(match[0], result);
    }
    // sort by* options
    var sortFunc = function(a, b) {
      if (key === 'byweekday') {
        return a.weekday - b.weekday;
      } else {
        return a - b;
      }
    };
    for (var key in result.rrule.options) {
      if (key.match(/^by[a-z]+/)) {
        var value = result.rrule[key];
        if (value instanceof Array && value.length > 1) {
          result.rrule[key] = value.slice().sort(sortFunc);
        }
      }
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
    // * otherwise: from/to acts as the rrule bounds (rr.until)
    onRecurrenceParsed(function(rr) {
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
      if (rr.freq < max) {
        result.dtend = to;
      } else {
        result.rrule.until = to;
      }
    });
    return match[1];
  }

  return extractEnding(phrase, result);
}

/**
 * Parser functions
 */
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

  var rr = result.rrule;

  // daily
  if (t.hasType('daily')) {
    rr.interval = 1;
    rr.freq = rrule.DAILY;
    return true;
  }

  // explicit weekdays
  if (t.hasType('pluralWeekday')) {
    if (t.textContains('weekdays')) {
      // "RRULE:FREQ=WEEKLY;WKST=MO;BYDAY=MO,TU,WE,TH,FR"
      rr.interval = 1;
      rr.freq = rrule.WEEKLY;
      rr.byweekday = rrule.WEEKDAYS;
    } else if (t.textContains('weekends')) {
      rr.interval = 1;
      rr.freq = rrule.WEEKLY;
      rr.byweekday = rrule.WEEKENDS;
    } else {
      // a plural weekday can really only mean one
      // of two things, weekly or biweekly
      rr.freq = rrule.WEEKLY;
      if (t.textContains('bi') || t.textContains('every other')) {
        rr.interval = 2;
      } else {
        rr.interval = 1;
      }
      var i;
      var weekdays = [];
      for (i=0; i<RE_DOWS.length; i++) {
        if (RE_DOWS[i].test(phrase)) {
          weekdays.push(rrule.DAYS_OF_WEEK[i]);
        }
      }
      if (RE_WEEKDAY.test(phrase)) {
        weekdays = weekdays.concat(rrule.WEEKDAYS);
      }
      if (RE_WEEKEND.test(phrase)) {
        weekdays = weekdays.concat(rrule.WEEKENDS);
      }
      // uniqify weekdays
      weekdays = weekdays.filter(function(value, i, array) {
        return array.indexOf(value) === i;
      });
      rr.byweekday = weekdays;
    }
    return true;
  }

  // recurring phrases
  if (t.hasType('every') || t.hasType('recurringUnit')) {
    if (t.textContains('every other')) {
      rr.interval = 2;
    } else {
      rr.interval = 1;
    }

    t.removeByType('every');

    var n, index = 0;
    while (index < t.length) {
      if (t.get(index).type === 'number') {
        // we assume a bare number always specifies the interval
        n = getNumber(t.get(index).text);
        if (!isNaN(n)) {
          rr.interval = n;
        }
      } else if (t.get(index).type === 'unit') {
        // we assume a bare unit (grow up...) always specifies the
        // frequency
        rr.freq = getUnitFreq(t.get(index).text);
      } else if (t.get(index).type === 'ordinal') {
        var ords = [getOrdinalIndex(t.get(index).text)];

        // grab all iterated ordinals (e.g. 1st, 3rd and 4th of november)
        while (index + 1 < t.length && t.get(index + 1).type === 'ordinal') {
          ords.push(getOrdinalIndex(t.get(index + 1).text));
          index += 1;
        }

        if (index + 1 < t.length && t.get(index + 1).type === 'weekday') {
          // "first wednesday of/in ..."
          var dayOfWeek = getDaysOfWeek(t.get(index + 1).text)[0];
          for (n=0; n<ords.length; n++) {
            rr.byweekday.push(dayOfWeek.nth(ords[n])); 
          }
          index += 1;
          if (index >= t.length) {
            break;
          }
        } else if (index + 1 < t.length && t.get(index + 1).type === 'unit') {
          // "first of the month/year"
          rr.freq = getUnitFreq(t.get(index + 1).text);
          if (rr.freq === rrule.MONTHLY) {
            rr.bymonthday = rr.bymonthday.concat(ords);
          }
          if (rr.freq === rrule.YEARLY) {
            rr.byearday = rr.byyearday.concat(ords);
          }
          index += 1;
          if (index >= t.length) {
            break;
          }
        }
      } else if (t.get(index).type === 'weekday') {
        // if we have a day of week, we can assume the frequency is
        // weekly if it hasnt been set yet.
        if (!rr.freq) {
          rr.freq = rrule.WEEKLY;
        }
        var daysOfWeek = getDaysOfWeek(t.get(index).text);
        if (!rr.byweekday) {
          rr.byweekday = [];
        }
        rr.byweekday = rr.byweekday.concat(daysOfWeek);
      } else if (t.get(index).type === 'month') {
        // if we have a month we assume frequency is yearly if it hasnt
        // been set.
        if (!rr.freq) {
          rr.freq = rrule.YEARLY;
        }
        rr.bymonth.push(getMonth(t.get(index).text));
        // TODO: should iterate this ordinal as well...
        if (index + 1 < t.length && t.get(index + 1).type === 'ordinal') {
          var oidx = getOrdinalIndex(t.get(index + 1).text);
          rr.bymonthday.push(oidx);
        }
      }
      index += 1;
    }

    // sort by* values
    return true;
  }
  // No recurring match, return false
  return false;
}

rrule.parse = parse;
rrule.Event = Event;
rrule.RRule = RRule;
rrule.Tokenizer = Tokenizer;

return rrule;

})(RRule);

// vim: tw=79
