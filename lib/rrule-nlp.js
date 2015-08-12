(function() {

function extend(destination, source) {
  for (var property in source) {
    if (source.hasOwnProperty(property)) {
      destination[property] = source[property];
    }
  }
  return destination;
}

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

var units = ['day', 'week', 'month', 'year', 'hour', 'minute', 'seconds'];
var unitsFreq = ['daily', 'weekly', 'monthly', 'yearly', 'hourly', 'minutely', 'secondly'];

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
//var RE_NUMBERS = numbers.map(function(r) {
//  return new RegExp(r + '$');
//});
var RE_NUMBER = new RegExp('(' + numbers.join('|') + ')$|(\\d+)$');

var RE_EVERY = new RegExp('(every|each|once)$');
var RE_THROUGH = new RegExp('(through|thru)$');
var RE_DAILY = new RegExp('daily|everyday');
var RE_RECURRING_UNIT = new RegExp('weekly|monthly|yearly');

var RE_TIME = new RegExp(
  '(\\d{1,2}):?(\\d{2})?\\s?(am|pm)?(o\'?clock)?');
var RE_AT_TIME = new RegExp('at\\s' + RE_TIME.source);
//var RE_AT_TIME_END = new RegExp('at\\s' + RE_TIME.source);
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

var CONTENT_TYPES = {
  daily: RE_DAILY,
  every: RE_EVERY,
  through: RE_THROUGH,
  unit: RE_UNITS,
  recurringUnit: RE_RECURRING_UNIT,
  ordinal: RE_ORDINAL,
  number: RE_NUMBER,
  pluralWeekday: RE_PLURAL_WEEKDAY,
  DoW: RE_DOW,
  MoY: RE_MONTH
};

var TYPES = extend(CONTENT_TYPES, {
  ambigmod: RE_AMBIGMOD,
  starting: RE_STARTING,
  ending: RE_ENDING,
  repeat: RE_REPEAT,
  sep: RE_SEP,
  time: RE_TIME,
  other: RE_OTHER,
});

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


/**
 * RecurrenceParser class
 */
function RecurrenceParser(nowDate, preferredTimeRange) {
  if (!preferredTimeRange) {
    preferredTimeRange = [8, 19];
  }
  if (!nowDate) {
    nowDate = new Date();
  }
  this.nowDate = nowDate;
  this.preferredTimeRange = preferredTimeRange;
  this._reset();
}
RecurrenceParser.prototype = {
  _reset: function() {
    // rrule params
    this.dtstart = null;
    this.until = null;
    this.interval = null;
    this.freq = null;
    this.weekdays = [];
    this.ordinalWeekdays = [];
    this.byday = null;
    this.bymonthday = [];
    this.byyearday = [];
    this.bymonth = [];
    this.byhour = [];
    this.byminute = [];

    // not supported currently
    this.count = null;
    this.bysetpos = null;
    this.byweekno = null;
  },

  getParams: function() {
    var params = {};
    // we shouldnt have weekdays and ordinal weekdays, but if we do,
    // ordinal weekdays take precedence.
    if (!this.ordinalWeekdays && this.weekdays) {
      params.byday = this.weekdays.join(',');
    } else if (this.ordinalWeekdays) {
      params.byday = this.ordinalWeekdays.join(',');
    }
    if (this.bymonthday) {
      params.bymonthday = this.bymonthday.join(',');
    }
    if (this.byyearday) {
      params.byyearday = this.byyearday.join(',');
    }
    if (this.bymonth) {
      params.bymonth = this.bymonth.join(',');
    }
    if (this.byhour) {
      params.byhour = this.byhour.join(',');
    }
    if (this.byminute) {
      params.byminute = this.byminute.join(',');
    }
    if (this.interval !== null) {
      params.interval = this.interval;
    }
    if (this.freq !== null) {
      params.freq = this.freq;
    }
    if (this.dtstart) {
      params.dtstart = dateToString(this.dtstart);
    }
    if (this.until) {
      params.until = dateToString(this.until);
    }
    return params;
  },

  getRfcRrule: function() {
    var rrule = '';
    var params = this.getParams();
    if (params.dtstart) {
      rrule += 'DTSTART:' + params.dtstart + '\n';
      delete params.dtstart;
    }
    rrule += 'RRULE:';
    var v, k, rules = [];
    for (k in params) {
      v = params[k];
      if (typeof(v) === 'string' || typeof(v) === 'number') {
        if (typeof(v) === 'string') {
          v = v.toUpperCase();
        }
        rules.push(k.toUpperCase() + '=' + v);
      }
    }
    return rrule + rules.join(';');
  },

  parse: function(expression) {
    // returns a rrule string if it is a recurring date, a datetime.datetime
    // if it is a non-recurring date, and none if it is neither.
    this._reset();
    if (!expression) {
      return false;
    }
    expression = normalize(expression);
    this.expression = expression;
    var event = this.parseStartAndEnd(expression);
    if (!event) {
      return false;
    }
    this.isRecurring = this.parseRecurrence(event);
    if (this.isRecurring) {
        // get time if its obvious
        var match = RE_AT_TIME.exec(expression);
        if (match) {
          this.byhour.push(this.getHour(match[1], match[3]));
          var mn = match[2];
          if (mn === null) {
              mn = 0;
          }
          if (!isNaN(mn)) {
            this.byminute.push(mn);
          }
        }
        return this.getRfcRrule();
    }
    var date = this.parseDate(expression);
    if (date) {
      return this.parseTime(expression, date) || date;
    }

    // maybe we have a simple time expression
    return this.parseTime(expression, this.nowDate);
  },

  parseTime: function(s, dt) {
    var match = RE_AT_TIME.exec(s);
    if (match) {
      var hr = this.getHour(match[1], match[3]);
      var mn = isNaN(match[2]) ? null : parseInt(mn);
      if (!isNaN(hr)) {
        dt.setHours(hr);
      }
      if (!isNaN(mn)) {
        dt.setMinutes(mn);
      }
      return dt;
    }
    return null;
  },

  parseStartAndEnd: function(s) {
    var event, start;
    var match = RE_START_EVENT.exec(s);
    if (match) {
      event = this.extractEnding(match[3]);
      this.dtstart = this.parseDate(match[2]);
      return event;
    }
    match = RE_EVENT_START.exec(s);
    if (match) {
      event = match[1];
      start = this.extractEnding(match[5]);
      this.dtstart = this.parseDate(start);
      return event;
    }
    match = RE_FROM_TO.exec(s);
    if (match) {
      event = match[1];
      this.dtstart = this.parseDate(match[2]);
      this.until = this.parseDate(match[4]);
      return event;
    }

    return this.extractEnding(s);
  },

  extractEnding: function(s) {
    var match = RE_OTHER_END.exec(s);
    if (match) {
      this.until = this.parseDate(match[2]);
      return match[1];
    }
    return s;
  },

  parseDate: function(dateString) {
    return chrono.parseDate(dateString);
  },

  parseRecurrence: function(expression) {
    var t = new Tokenizer(expression);
    t.filterTypes(Object.keys(CONTENT_TYPES));

    if (!t.length) {
      return null;
    }

    // daily
    if (t.hasType('daily')) {
      this.interval = 1;
      this.freq = 'daily';
      return true;
    }

    // explicit weekdays
    if (t.hasType('pluralWeekday')) {
      if (t.textContains('weekdays')) {
        // "RRULE:FREQ=WEEKLY;WKST=MO;BYDAY=MO,TU,WE,TH,FR"
        this.interval = 1;
        this.freq = 'weekly';
        this.weekdays = ['MO', 'TU', 'WE', 'TH', 'FR'];
      } else if (t.textContains('weekends')) {
        this.interval = 1;
        this.freq = 'weekly';
        this.weekdays = ['SA', 'SU'];
      } else {
        // a plural weekday can really only mean one
        // of two things, weekly or biweekly
        this.freq = 'weekly';
        if (t.textContains('bi') || t.textContains('every other')) {
          this.interval = 2;
        } else {
          this.interval = 1;
        }
        for (var i=0; i<RE_DOWS.length; i++) {
          if (RE_DOWS[i].test(expression)) {
            // this supports "thursdays and fridays"
            console.log(weekdayCodes);
            console.log(this.weekdays);
            console.log(this.ordinalWeekdays);
            this.weekdays.push(weekdayCodes[i]);
          }
        }
      }
      return true;
    }

    // recurring phrases
    if (t.hasType('every') || t.hasType('recurringUnit')) {
      if (t.textContains('every other')) {
        this.interval = 2;
      } else {
        this.interval = 1;
      }

      t.removeByType('every');

      var ordDowString = function(i) {
        return i.toString() + dow;
      };

      var n, index = 0;
      while (index < t.length) {
        if (t.get(index).type === 'number') {
          // we assume a bare number always specifies the interval
          n = getNumber(t.get(index).text);
          if (!isNaN(n)) {
            this.interval = n;
          }
        } else if (t.get(index).type === 'unit') {
          // we assume a bare unit (grow up...) always specifies the
          // frequency
          this.freq = getUnitFreq(t.get(index).text);
        } else if (t.get(index).type === 'ordinal') {
          var ords = [getOrdinalIndex(t.get(index).text)];

          // grab all iterated ordinals (e.g. 1st, 3rd and 4th of
          // november)
          while (index + 1 < t.length && t.get(index + 1).type === 'ordinal') {
            ords.push(getOrdinalIndex(t.get(index + 1).text));
            index += 1;
          }

          if (index + 1 < t.length && t.get(index + 1).type === 'DoW') {
            // "first wednesday of/in ..."
            var dow = getDaysOfWeek(t.get(index + 1).text)[0];
            var dowOrds = ords.map(ordDowString);
            this.ordinalWeekdays = this.ordinalWeekdays.concat(dowOrds);
            index += 1;
            if (index >= t.length) {
              break;
            }
          } else if (index + 1 < t.length && t.get(index + 1).type === 'unit') {
            // "first of the month/year"
            this.freq = getUnitFreq(t.get(index + 1).text);
            if (this.freq === 'monthly') {
              this.bymonthday.concat(ords.map(String));
            }
            if (this.freq === 'yearly') {
              this.byyearday.concat(ords.map(String));
            }
            index += 1;
            if (index >= t.length) {
              break;
            }
          }
        } else if (t.get(index).type === 'DoW') {
          // if we have a day of week, we can assume the frequency is
          // weekly if it hasnt been set yet.
          if (!this.freq) {
            this.freq = 'weekly';
          }
          this.weekdays.concat(getDaysOfWeek(t.get(index).text));
        } else if (t.get(index).type === 'MoY') {
          // if we have a month we assume frequency is yearly if it hasnt
          // been set.
          if (!this.freq) {
            this.freq = 'yearly';
          }
          this.bymonth.push((getMonth(t.get(index).text)).toString());
          // TODO: should iterate this ordinal as well...
          if (index + 1 < t.length && t.get(index + 1).type === 'ordinal') {
            this.bymonthday.push(
              getOrdinalIndex(t.get(index + 1).text).toString());
          }
        }
        index += 1;
      }
      return true;
    }
    // No recurring match, return false
    return false;
  },

  getHour: function(hr, mod) {
    hr = parseInt(hr);
    if (mod) {
      if (mod === 'pm') {
        return hr + 12;
      }
      if (hr === 12) {
        return 0;
      }
      return hr;
    }
    if (hr > 12) {
      return hr;
    }
    if (hr < this.preferredTimeRange[0]) {
      return hr + 12;
    }
    return hr;
  }
};

window.RecurrenceParser = RecurrenceParser;

// FIXME: remove the following debug lines
window.RecurrenceTokenizer = Tokenizer;

})();
