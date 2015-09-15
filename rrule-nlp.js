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

// unique filter
var unique = function(array) {
  return array.filter(function(v, i, self) {
    return self.indexOf(v) === i;
  });
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
var RE_EVERY_OTHER = new RegExp('every_other');
var RE_THROUGH = new RegExp('(through|thru)$');
var RE_DAILY = new RegExp('(daily|every_?day|each_?day)');
var RE_RECURRING_UNIT = new RegExp('(bi)?(weekly|monthly|yearly)');

// TODO support biweekly, bimonthly, semianually, etc...

var RE_AT_TIME = new RegExp('at\\s(.+)'); 
var RE_STARTING = new RegExp('start(?:s|ing)?');
var RE_ENDING = new RegExp('(?:\\bend|until)(?:s|ing)?');
var RE_REPEAT = new RegExp('(?:every|each|\\bon\\b|repeat(s|ing)?)');
var RE_START = new RegExp('(' + RE_STARTING.source + ')\\s(.*)');
var RE_EVENT = new RegExp(
  '((?:every|each|\\bon\\b|repeat|' + RE_DAILY.source + '|' + 
  RE_PLURAL_WKDAY.source + ')(?:s|ing)?(.*))');
var RE_END = new RegExp('(' + RE_ENDING.source + ')(.*)');
var RE_START_EVENT = new RegExp(RE_START.source + '\\s' + RE_EVENT.source);
var RE_EVENT_START = new RegExp(RE_EVENT.source + '\\s' + RE_START.source);
var RE_FROM_TO = new RegExp(
  '(.*)(from)(.*)(to|through|thru)(.*)');
var RE_OTHER_END = new RegExp('(.*)\\s' + RE_END.source);
var RE_SEP = new RegExp(
  '^(from|to|through|thru|on|at|of|in|a|an|the|and|o|both)$');
var RE_AMBIGMOD = new RegExp('(this|next|last)$');
var RE_OTHER = new RegExp('other|alternate');
var RE_FROM_NOW = new RegExp('(.+) from now');
var RE_HRS_MINUTES = new RegExp('(.+) hours(?: and)? (.+) minutes');

var RE_WKDAY_TYPE = new RegExp(RE_DOW.source + '|(weekday)|(weekend)');

//patterns that should be parsed as a single token (replaces spaces w/ _)
var COMBINE = [
  new RegExp('(each|every)\\s+day', 'g'),
  new RegExp('every\\s+other', 'g')
];

var RECUR_TYPES = {
  daily: RE_DAILY,
  every: RE_EVERY,
  everyOther: RE_EVERY_OTHER,
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

// support single digits as hours, given the option 
var digitAsHourParser = new chrono.Parser();
digitAsHourParser.pattern = function() {
  return /(?:[^\w:]|^)(\d+)(?![\d\w:]|\s+(h((ou)?rs?)?|m(in)?))/i;
};
digitAsHourParser.extract = function(text, ref, match, opt) {
  if (!opt.digitAsHour) {
    return;
  }
  return new chrono.ParsedResult({
    ref: ref,
    text: match[0],
    index: match.index,
    start: {
      hour: parseInt(match[1])
    }
  });
};
dateParser.parsers.push(digitAsHourParser);

dateParser.parsers = dateParser.parsers.concat(chrono.casual.parsers);

//=============================================================================
// Utility Functions
//=============================================================================

function replaceAt(text, start, length, replace) {
  return text.substr(0, start) + replace + text.substr(start + replace.length);
}

function groupIndex(match, group) {
  return match.index + match[0].indexOf(match[group]);
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
  if (parsed instanceof Date) {
    return true;
  }
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
  var dateCertain, timeCertain, date = parsed;
  if (date instanceof Date) {
    date = moment(date);
    dateCertain = true;
    timeCertain = true;
  } else {
    dateCertain = anyCertain(parsed, 'day', 'weekday', 'month', 'year');
    timeCertain = anyCertain(parsed, 'hour', 'minute', 'second');
    date = moment(parsed.date());
    if (!dateCertain) {
      var ref = moment(refDate);
      date.set({year: ref.year(), month: ref.month(), date: ref.date()});
    }
    if (!timeCertain) {
      date.set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    }
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

function Token(text, phraseIndex, match, type) {
  this.index = null;
  this.match = match;
  this.phraseIndex = phraseIndex;
  this.text = text;
  this.type = type;
}

Token.prototype = {
  toString: function() {
    return '<Token "' + this.text + '": ' + this.type + '>';
  },
  contains: function(s) {
    return this.text.indexOf(s) !== -1;
  }
};


//=============================================================================
// TokenList
//=============================================================================

function getArgs(args) {
  if (args.length === 1 && args[0] instanceof Array) {
    return args[0];
  }
  return Array.prototype.slice.apply(args);
}
function TokenList(tokens) {
  this._tokens = tokens || [];
  this._iter = -1;
  this.push = Array.prototype.push.bind(this._tokens);
}
TokenList.prototype = {
  get: function(index) {
    index = index || 0;
    return this._tokens[index];
  },
  next: function(incr) {
    var idx = this._iter + 1;
    if (incr !== false) {
      this._iter = idx;
    }
    return this._tokens[idx];
  },
  before: function(token) {
    var tokens = [];
    for (var i=0; i<this._tokens.length; i++) {
      if (this._tokens[i].phraseIndex < token.phraseIndex) {
        tokens.push(this._tokens[i]);
      } else {
        break;
      }
    }
    return new TokenList(tokens);
  },
  after: function(token) {
    var tokens = this._tokens;
    var index;
    for (var i=0; i<tokens.length; i++) {
      if (tokens[i].index > token.index) {
        index = i;
        break;
      }
    }
    if (index) {
      tokens = tokens.slice(index, tokens.length);
    }
    return new TokenList(tokens);
  },
  withType: function() {
    var types = getArgs(arguments);
    var tokens = this._tokens.filter(function(token) {
      return types.indexOf(token.type) !== -1;
    });
    return new TokenList(tokens);
  },
  withoutType: function() {
    var types = getArgs(arguments);
    var tokens = this._tokens.filter(function(token) {
      return types.indexOf(token.type) === -1;
    });
    return new TokenList(tokens);
  },
  hasType: function() {
    return !!this.findFirst(getArgs(arguments));
  },
  findFirst: function() {
    var types = getArgs(arguments);
    for (var i=0; i < this._tokens.length; i++) {
      if (types.indexOf(this._tokens[i].type) !== -1) {
        return this._tokens[i];
      }
    }
    return null;
  },
  add: function(text, phraseIndex, match, type) {
    var len = this._tokens.push(new Token(text, phraseIndex, match, type));
    this._tokens[len - 1].index = len - 1;
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


function tokenize(text) {
  tokens = new TokenList();
  var i, m, type, tokens;
  
  // handle words that should be parsed as one token
  for (i=0; i<COMBINE.length; i++) {
    while ((m = COMBINE[i].exec(text)) !== null) {
      // TODO this only works with regexps with one match group
      text = replaceAt(text, m.index, m[0].length, m[0].replace(' ', '_'));
    }
  }

  var rawToken, rawTokens = text.split(' ');
  var phraseIndex = 0;
  for (i=0; i<rawTokens.length; i++) {
    rawToken = rawTokens[i];
    for (type in TOKEN_TYPES) {
      var match = TOKEN_TYPES[type].exec(rawToken);
      if (match) {
        tokens.add(rawToken, phraseIndex, match, type);
        break;
      }
    }
    // plus 1 for the space
    phraseIndex += (rawToken.length + 1);
  }

  return tokens;
} 

//=============================================================================
// RRule
//=============================================================================

var BaseRRule = RRule;
function getRRuleDescriptor(opt) {
  if (opt === 'dtstart') {
    return {
      get: function() {
        return null;
      },
      set: function(value) {
        this.options[opt] = value;
      }
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
    var hrs = this.byhour.map(function(h, i) {
      var m = ('00' + (this.byminute[i] || '')).slice(-2);
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

var Event = function(refDate) {
  this.phrase = null;
  this.rrule = null;
  this._dtstart = null;
  this.refDate = refDate;
  this.dtend = null;
  this.parsed = [];
};
Event.prototype = {
  get dtstart() {
    return this._dtstart;
  },
  set dtstart(value) {
    this._dtstart = value;
    if (this.rrule) {
      this.rrule.options.dtstart = value;
    }
  },
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
  
  getParsedRange: function() {
    var start, end, s, e;
    for (var i=0; i<this.parsed.length; i++) {
      s = this.parsed[i].index;
      e = s + this.parsed[i].text.length;
      if (!start || s < start) {
        start = s;
      }
      if (!end || e > end) {
        end = e;
      }
    }
    return {start: start, end: end};
  }
};

Event.prototype._addResult = function (result, offset) {
  this.parsed.push({
    index: (result.phraseIndex || result.index) + (offset || 0),
    text: result[0] || result.text
  });
};

function parse(phrase, opts) {
  opts = opts || {};
  var defaults = {
    preferAMStart: 8,
    preferFuture: false,
    refDate: new Date()
  };

  opts = extend(defaults, opts);
  var unparsed;
  var event = new Event(opts.refDate);
  if (!phrase) {
    return event;
  }

  event.opts = opts;
  event.phrase = normalize(phrase);
  event.rrule = new RRule();

  unparsed = parseStartAndEnd(event.phrase, event);

  if (!(unparsed && unparsed.text)) {
    event.rrule = null;
    return event;
  }

  var recurrence = parseRecurrence(unparsed.text, event, unparsed.index);
  fireOnRecurrenceParsed(event.rrule);
  if (!recurrence) {
    event.rrule = null;
  }

  if (event.rrule) {
    // get time/times if its obvious
    var match = RE_AT_TIME.exec(unparsed.text);
    if (match) {
      parseRecurringTime(match[0], event, unparsed.index + match.index);
    }
    // sort by* options
    var sortFunc = function(a, b) {
      if (key === 'byweekday') {
        return a.weekday - b.weekday;
      } else {
        return a - b;
      }
    };
    for (var key in event.rrule.options) {
      if (key.match(/^by[a-z]+/)) {
        var value = event.rrule[key];
        if (value instanceof Array && value.length > 1) {
          event.rrule[key] = value.slice().sort(sortFunc);
        }
      }
    }
  } else {
    // This is a single day, but before we assume it's just a date, we should 
    // check for multiple times.
    event.rrule = new RRule({freq: rrule.DAILY});
    parseRecurringTime(event.phrase, event);

    // if byhour or byminute have no more than 1 item, there's no recurrence.
    if (event.rrule.byhour.length > 1 || event.rrule.byminute.length > 1) {
      event.rrule.count = Math.max(
        event.rrule.byhour.length,
        event.rrule.byminute.length
      );
    } else {
      event.rrule = null;

      // no recurrence, try just date/time
      var parsed = parseDate(unparsed.text, opts);
      if (parsed.start) {
        event.dtstart = parsed.start;
        if (parsed.end) {
          event.dtend = parsed.end;
        }
        event._addResult(parsed, unparsed.index);
      }
    }
  }

  return event;
}

function parseStartAndEnd(phrase, event) {
  var start, match, parsedDate;

  match = RE_START_EVENT.exec(phrase);
  if (match) {
    parsedDate = parseDate(match[2], event.opts);
    event.dtstart = parsedDate.start;
    event._addResult(parsedDate, groupIndex(match, 2));
    return extractEnding(match[3], event, groupIndex(match, 3));
  }

  match = RE_EVENT_START.exec(phrase);
  if (match) {
    start = extractEnding(match[6], event, groupIndex(match, 6));
    parsedDate = parseDate(start.text, event.opts);
    event.dtstart = parsedDate.start;
    event._addResult({text: match[5], index: groupIndex(match, 5)});
    event._addResult(start);
    return {
      text: match[1],
      index: groupIndex(match, 1)
    };
  }

  match = RE_FROM_TO.exec(phrase);
  if (match) {
    // support, eg: "daily from 2pm to 5pm"
    // We need to know freq, so we do this in a callback
    // * when freq > from/to: from/to acts as recurring duration
    // * otherwise: from/to acts as the rrule bounds (rr.until)
    onRecurrenceParsed(function(rr) {
      // TODO:RANGE
      var from = parseDate(match[3], event.opts);
      var fromIdx = groupIndex(match, 3);
      var to = parseDate(match[5], event.opts);
      var toIdx = groupIndex(match, 5);

      // We assume from/to have same resolution (eg, hour-to-hour, day-to-day)
      var knownValues = from.start.knownValues;
      var unit, idx, max = -1;
      for (unit in knownValues) {
        idx = units.indexOf(unit); 
        if (idx < max) {
          max = idx;
        }
      }
      event.dtstart = from.start;
      event._addResult({text: match[2], index: groupIndex(match, 2)});
      event._addResult(from, fromIdx);
      if (!to.start) {
        return;
      }
      event._addResult({text: match[4], index: groupIndex(match, 4)});
      event._addResult(to, toIdx);
      if (rr.freq < max) {
        event.dtend = to.start;
      } else {
        event.rrule.until = to.start;
      }
    });
    return {
      text: match[1],
      index: groupIndex(match, 1)
    };
  }

  return extractEnding(phrase, event);
}

/**
 * Parser functions
 */
function extractEnding(phrase, event, offset) {
  offset = offset || 0;
  var match = RE_OTHER_END.exec(phrase);
  if (match) {
    event.rrule.until = parseDate(match[3], event.opts).start;
    event._addResult({text: match[2], index: offset + groupIndex(match, 2)});
    event._addResult({text: match[3], index: offset + groupIndex(match, 3)});
    return {
      text: match[1],
      index: offset + groupIndex(match, 1)
    };
  }
  return {
    text: phrase,
    index: offset
  };
}

function parseRecurringTime(phrase, event, offset) {
  offset = offset || 0;
  var dateResult, i;
  var parseOpts = {};

  if (RE_AT_TIME.test(phrase)) {
    parseOpts.digitAsHour = true;
  }
  
  var parsedTime = dateParser.parse(phrase, event.refDate, parseOpts);
  var hours = [];
  var minutes = [];

  for (i=0; i<parsedTime.length; i++) {
    if (!parsedTime[i].start) {
      continue;
    }
    dateResult = refineDate(parsedTime[i].start, event.opts);
    event._addResult(parsedTime[i], offset);
    hours.push(dateResult.get('hour'));
    minutes.push(dateResult.get('minute'));
  }

  event.rrule.byhour = unique(hours).sort();
  event.rrule.byminute = unique(minutes).sort();

  if (event.rrule.byminute.length > 1) {
    // Calculate BYSETPOS to select out the correct instances.
    event.rrule.bysetpos = minutes.map(function(m, i) {
      var idx = event.rrule.byminute.indexOf(m);
      return (i * event.rrule.byminute.length) + idx + 1; 
    });

    // This only works if DTSTART is before the first byhour/byminute
    if (!event.dtstart) {
      event.dtstart = new Date(event.refDate.getTime());
    }
    var dtstart = new Date(event.dtstart.getTime());
    dtstart.setHours(event.rrule.byhour[0]);
    dtstart.setMinutes(event.rrule.byminute[0]);
    if (dtstart < event.dtstart) {
      event.dtstart = dtstart;
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
  onRecurrenceParsedListeners = [];
}

function parseRecurrence(phrase, event, offset) {
  var tokens = tokenize(phrase).withType(Object.keys(RECUR_TYPES));

  if (!tokens.length) {
    return null;
  }

  var rr = event.rrule;

  // daily
  var daily = tokens.withType('daily').get();
  if (daily) {
    rr.interval = 1;
    rr.freq = rrule.DAILY;
    event._addResult(daily, offset);
    return true;
  }

  var hasRecurring = false;

  // explicit weekdays
  var pluralWeekdays = tokens.withType('pluralWeekday');
  var weekdays, otherWeekdays, pluralWeekday;

  pluralWeekday = pluralWeekdays.next();
  if (pluralWeekday) {
    rr.interval = 1;
    rr.freq = rrule.WEEKLY;
    
    weekdays = getDaysOfWeek(pluralWeekday.text);

    event._addResult(pluralWeekday, offset);
    if (weekdays.length == 1) {
      // token is not "weekends" or "weekdays" (eg, thursdays, fridays)
      
      // check for "every other"
      var before = tokens.before(pluralWeekday);
      if (pluralWeekday.contains('bi') || before.hasType('everyOther')) {
        rr.interval = 2;
      } else {
        rr.interval = 1;
      }

      // check for additional weekdays
      while ((pluralWeekday = pluralWeekdays.next())) {
        otherWeekdays = getDaysOfWeek(pluralWeekday.text);
        if (otherWeekdays.length == 1) {
          event._addResult(pluralWeekday, offset);
          weekdays = weekdays.concat(otherWeekdays);
        }
      }

      // uniqify weekdays
      weekdays = unique(weekdays);
    }
    
    rr.byweekday = weekdays;
    hasRecurring = true;
    
  }

  // recurring phrases
  var n, token;
  var recurring = tokens.withType('every', 'everyOther', 'recurringUnit').next();
  if (recurring) {
    if (recurring.type == 'everyOther') {
      rr.interval = 2;
    } else {
      rr.interval = 1;
    }

    event._addResult(recurring, offset);
    tokens = tokens.withoutType('every', 'everyOther', 'recurringUnit');

    while ((token = tokens.next())) {
      if (token.type === 'number') {
        // we assume a bare number when "every" is present always specifies the interval
        n = getNumber(token.text);
        if (!isNaN(n)) {
          rr.interval = n;
          event._addResult(token, offset);
        }
      } else if (token.type === 'unit') {
        // we assume a bare unit (grow up...) always specifies the frequency
        rr.freq = getUnitFreq(token.text);
        event._addResult(token, offset);
      } else if (token.type === 'ordinal') {
        var ords = [token];

        // grab all iterated ordinals (e.g. 1st, 3rd and 4th of november)
        while ((token = tokens.next()) && token.type == 'ordinal') {
          ords.push(token);
        }

        if (!token) {
          break;
        }

        if (token.type === 'weekday') {
          // "first wednesday of/in ..."
          var dayOfWeek = getDaysOfWeek(token.text)[0];
          for (n=0; n<ords.length; n++) {
            rr.byweekday.push(dayOfWeek.nth(getOrdinalIndex(ords[n].text))); 
            event._addResult(ords[n], offset);
          }
          event._addResult(token, offset);
        } else if (token.type === 'unit') {
          // "first of the month/year"
          rr.freq = getUnitFreq(token.text);
          event._addResult(token, offset);
          if (rr.freq === rrule.MONTHLY) {
            for (n=0; n<ords.length; n++) {
              rr.bymonthday.push(getOrdinalIndex(ords[n].text));
              event._addResult(ords[n], offset);
            }
          }
          if (rr.freq === rrule.YEARLY) {
            for (n=0; n<ords.length; n++) {
              rr.byyearday.push(getOrdinalIndex(ords[n].text));
              event._addResult(ords[n], offset);
            }
          }
        }
      } else if (!rr.byweeday && token.type === 'weekday') {
        // if we have a day of week, we can assume the frequency is
        // weekly if it hasnt been set yet.
        if (!rr.freq) {
          rr.freq = rrule.WEEKLY;
        }
        var daysOfWeek = getDaysOfWeek(token.text);
        if (!rr.byweekday) {
          rr.byweekday = [];
        }
        rr.byweekday = rr.byweekday.concat(daysOfWeek);
        event._addResult(token, offset);
      } else if (token.type === 'month') {
        // if we have a month we assume frequency is yearly if it hasnt
        // been set.
        if (!rr.freq) {
          rr.freq = rrule.YEARLY;
        }
        rr.bymonth.push(getMonth(token.text));
        event._addResult(token, offset);
        // TODO: should iterate this ordinal as well...
        token = tokens.next();
        if (!token) {
          break;
        }
        if (token.type === 'ordinal') {
          var oidx = getOrdinalIndex(token.text);
          rr.bymonthday.push(oidx);
          event._addResult(token, offset);
        }
      }
    }

    return true;
  }

  return hasRecurring;
}

rrule.parse = parse;
rrule.Event = Event;

return rrule;

})(RRule);

// vim: tw=79
