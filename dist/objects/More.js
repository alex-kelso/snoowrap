"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.emptyChildren = void 0;

var _lodash = require("lodash");

var _Promise = _interopRequireDefault(require("../Promise.js"));

var _helpers = require("../helpers.js");

var _constants = require("../constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var api_type = 'json';
/**
* The `More` class is a helper representing reddit's exposed `more` type in comment threads, used to fetch additional comments
on a thread.
* No instances of the `More` class are exposed externally by snoowrap; instead, comment lists are exposed as Listings.
Additional replies on an item can be fetched by calling `fetchMore` on a Listing, in the same manner as what would be done
with a Listing of posts. snoowrap should handle the differences internally, and expose a nearly-identical interface for the
two use-cases.

Combining reddit's `Listing` and `more` objects has the advantage of having a more consistent exposed interface; for example,
if a consumer iterates over the comments on a Submission, all of the iterated items will actually be Comment objects, so the
consumer won't encounter an unexpected `more` object at the end. However, there are a few disadvantages, namely that (a) this
leads to an increase in internal complexity, and (b) there are a few cases where reddit's `more` objects have different amounts
of available information (e.g. all the child IDs of a `more` object are known on creation), which leads to different optimal
behavior.
*/

var More = class More {
  constructor(options, _r) {
    Object.assign(this, options);
    this._r = _r;
  }
  /* Requests to /api/morechildren are capped at 20 comments at a time, but requests to /api/info are capped at 100, so
  it's easier to send to the latter. The disadvantage is that comment replies are not automatically sent from requests
  to /api/info. */


  fetchMore(options) {
    var startIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (options.amount <= 0 || startIndex >= this.children.length) {
      return _Promise.default.resolve([]);
    }

    if (!options.skipReplies) {
      return this.fetchTree(options, startIndex);
    }

    var ids = getNextIdSlice(this.children, startIndex, options.amount, _constants.MAX_API_INFO_AMOUNT).map(function (id) {
      return "t1_".concat(id);
    }); // Requests are capped at 100 comments. Send lots of requests recursively to get the comments, then concatenate them.
    // (This speed-requesting is only possible with comment Listings since the entire list of ids is present initially.)

    var promiseForThisBatch = this._r._getListing({
      uri: 'api/info',
      qs: {
        id: ids.join(',')
      }
    });

    var nextRequestOptions = _objectSpread({}, options, {
      amount: options.amount - ids.length
    });

    var promiseForRemainingItems = this.fetchMore(nextRequestOptions, startIndex + ids.length);
    return _Promise.default.all([promiseForThisBatch, promiseForRemainingItems]).then(_lodash.flatten);
  }

  fetchTree(options, startIndex) {
    var _this = this;

    if (options.amount <= 0 || startIndex >= this.children.length) {
      return _Promise.default.resolve([]);
    }

    var ids = getNextIdSlice(this.children, startIndex, options.amount, _constants.MAX_API_MORECHILDREN_AMOUNT);
    return this._r._get({
      uri: 'api/morechildren',
      qs: {
        depth: 1,
        sort: 'old',
        api_type,
        children: ids.join(','),
        link_id: this.link_id || this.parent_id
      }
    }).tap(_helpers.handleJsonErrors).then(function (res) {
      return res.json.data.things;
    }).map(_helpers.addEmptyRepliesListing).then(_helpers.buildRepliesTree).then(function (resultTrees) {
      /* Sometimes, when sending a request to reddit to get multiple comments from a `more` object, reddit decides to only
      send some of the requested comments, and then stub out the remaining ones in a smaller `more` object. ( ¯\_(ツ)_/¯ )
      In these cases, recursively fetch the smaller `more` objects as well. */
      var childMores = (0, _lodash.remove)(resultTrees, function (c) {
        return c instanceof More;
      });
      (0, _lodash.forEach)(childMores, function (c) {
        c.link_id = _this.link_id || _this.parent_id;
      });
      return _Promise.default.mapSeries(childMores, function (c) {
        return c.fetchTree(_objectSpread({}, options, {
          amount: Infinity
        }), 0);
      }).then(function (expandedTrees) {
        return _this.fetchMore(_objectSpread({}, options, {
          amount: options.amount - ids.length
        }), startIndex + ids.length).then(function (nexts) {
          return (0, _lodash.concat)(resultTrees, (0, _lodash.flatten)(expandedTrees), nexts);
        });
      });
    });
  }

  _clone() {
    return new More((0, _lodash.pick)(this, Object.getOwnPropertyNames(this)), this._r);
  }

};

function getNextIdSlice(children, startIndex, desiredAmount, limit) {
  return children.slice(startIndex, startIndex + Math.min(desiredAmount, limit));
}

var emptyChildren = new More({
  children: []
});
exports.emptyChildren = emptyChildren;
var _default = More;
exports.default = _default;