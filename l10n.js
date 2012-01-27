/* Copyright (c) 2011 Mozilla.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';
var l10n = (function(window, document, undefined) {
  var gL10nData = {};
  var gTextData = '';
  var gLanguage = '';

  function translate(fragment) {
    fragment = fragment || document;

    // list of translatable attributes
    var attrList = ['title', 'accesskey', 'alt', 'longdesc'];
    var attrCount = attrList.length;

    // check all translatable elements (= w/ a `data-l10n-id' attribute)
    var elements = fragment.querySelectorAll('*[data-l10n-id]');
    var elementCount = elements.length;
    for (var i = 0; i < elementCount; i++) {
      var element = elements[i];

      // translate the element
      var key = element.dataset.l10nId;
      var data = gL10nData[key];
      if (!data)
        continue;

      // element content
      element.innerHTML = data.value || data;

      // element attributes
      if (data.attributes) {
        for (var j = 0; j < attrCount; j++) {
          var attrName = attrList[j];
          var attrValue = data.attributes[attrName];
          if (attrValue && element.hasAttribute(attrName))
            element.setAttribute(attrName, attrValue);
        }
      }
    }
  }

  function evalString(text) {
    return text.replace(/\\\\/g, '\\')
               .replace(/\\n/g, '\n')
               .replace(/\\r/g, '\r')
               .replace(/\\t/g, '\t')
               .replace(/\\b/g, '\b')
               .replace(/\\f/g, '\f')
               .replace(/\\"/g, '"')
               .replace(/\\'/g, "'");
  }

  function parseProperties(text) {
    gTextData += text;

    // parse the *.properties file into an associative array
    var data = [];
    var entries = text.replace(/^\s*|\s*$/, '').split(/[\r\n]+/);
    for (var i = 0; i < entries.length; i++) {
      if ((/^\s*#|^\s*$/).test(entries[i])) // comment or blank line
        continue;
      var tmp = entries[i].split('=');
      data[tmp[0]] = evalString(tmp[1]);
    }

    // find the attribute descriptions, if any
    for (var key in data) {
      var hasAttribute = false;
      var index = key.lastIndexOf('.');
      if (index > 0) {
        var attr = key.substr(index + 1);
        var elt = key.substring(0, index);
        hasAttribute = (elt in data);
      }
      if (hasAttribute) {
        if (typeof gL10nData[elt] == 'string') {
          gL10nData[elt] = {};
          gL10nData[elt].value = data[elt];
          gL10nData[elt].attributes = {};
        }
        gL10nData[elt].attributes[attr] = data[key];
      } else
        gL10nData[key] = data[key];
    }
  }

  function parseL20n(text) {
    gTextData += text;

    function nextEntity() {
      while (true) {
        var match = /\/\*|</.exec(text);
        if (!match || !match.length)
          return false;
        switch (match[0]) {
          case '/*': // comment
            var end = text.indexOf('*/', match.index);
            if (end < 0)
              return false;
            text = text.substr(end + 2);
            break;
          case '<': // entity or macro
            text = text.substr(match.index);
            return true;
            break;
        }
      }
      return true;
    }
    function nextMatch(re) {
      var match = re.exec(text);
      if (!match || !match.length)
        return null;
      var rv = {
        value: text.substring(0, match.index),
        token: match[0],
        index: match.index
      };
      text = text.substr(match.index + match[0].length);
      return rv;
    }
    function readString() {
      //var value = nextMatch(/"/).value;
      // XXX we need a way to ignore \" sequences more properly
      var rv = nextMatch(/[^\\]"/);
      return evalString(rv.value + rv.token[0]);
    }
    function readValue() {
      //var token = nextMatch(/"/).token;
      //var token = nextMatch(/["\[\{]/).token;
      switch (nextMatch(/["\[\{]/).token) {
        case '"':
          return readString();
          break;
        case '[':
          return []; // TODO: readArray();
          break;
        case '{':
          return {}; // TODO: readHash();
          break;
      }
      return null;
    }
    while (nextEntity()) {
      // now expecting an identifier
      var id = nextMatch(/[a-zA-Z]\w*/).token;

      // XXX ignoring macros and indexes atm
      switch (text[0]) {
        case '[': // index
          break;
        case '(': // macro
          break;
      }

      // now expecting a value: string|array|hash
      var value = readValue();

      // now expecting either key-value pairs or the end of the entity
      var attributes = {};
      var hasAttrs = false;
      var endOfEntity = false;
      while (!endOfEntity) {
        var match = nextMatch(/[a-zA-Z]\w*|>/);
        if (match && (match.token != '>')) {
          nextMatch(/\s*:\s*/);
          attributes[match.token] = readValue();
          hasAttrs = true;
        } else
          endOfEntity = true;
      }
      if (hasAttrs) {
        //gL10nData[id] = new String(value);
        gL10nData[id] = {};
        gL10nData[id].value = value;
        gL10nData[id].attributes = attributes;
      } else
        gL10nData[id] = value;
    }
  }

  function l10nResource(href, parser) {
    function loadSync(src, success, failure) { // synchronous
      var xhr = new XMLHttpRequest();
      xhr.open('GET', src, false);
      xhr.send(null);
      if (xhr.status === 200)
        parser(xhr.responseText);
      else
        failure();
    }
    function loadAsync(src, success, failure) { // asynchronous
      var xhr = new XMLHttpRequest();
      xhr.open('GET', src, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            parser(xhr.responseText);
            success();
          } else {
            failure();
          }
        }
      };
      xhr.send(null);
    }
    // load asynchronously if `callback' is specified, synchronously otherwise
    this.load = function(lang, callback) {
      var applied = lang;
      var loadL10nFile = callback ? loadAsync : loadSync;
      loadL10nFile(href + '.' + lang, callback, function() {
        // load default l10n resource file if not found
        loadL10nFile(href, callback, callback);
        applied = '';
      });
      return applied; // return lang if found, an empty string if not found
    };
  }

  function loadLocale(lang, callback) {
    gL10nData = {};
    gTextData = '';
    gLanguage = lang;

    // check all <link type="text/l10n" src="..." /> nodes
    // and load the resource files
    var langLink = document.querySelectorAll(
        'link[type="text/l10n"], link[type="text/properties"]');
    var langCount = langLink.length;

    // start the callback when all resources are loaded
    var onResourceLoaded = null;
    if (callback) {
      var gCount = 0;
      onResourceLoaded = function() {
        gCount++;
        if (gCount >= langCount) {
          callback();
          // fire an 'l10nLocaleLoaded' DOM event
          var evtObject = document.createEvent('Event');
          evtObject.initEvent('l10nLocaleLoaded', false, false);
          window.dispatchEvent(evtObject);
        }
      }
    }

    // load all resource files
    for (var i = 0; i < langCount; i++) {
      var parser = (langLink[i].type == 'text/l10n') ?
        parseL20n : parseProperties;
      var resource = new l10nResource(langLink[i].href, parser);
      var rv = resource.load(lang, onResourceLoaded);
      if (rv != lang) // lang not found, used default resource instead
        gLanguage = '';
    }
  }

  window.addEventListener('DOMContentLoaded', function() {
    var async = true;
    if (async) {
      // asynchronous (recommended on non-local files)
      loadLocale(navigator.language, translate);
    } else {
      // synchronous (much faster but risky)
      loadLocale(navigator.language);
      translate();
    }
  }, false);

  return {
    get: function(key) {
      return gL10nData[key] ? (gL10nData[key].value || gL10nData[key]) : key;
    },
    set: function(key, val) { gL10nData[key] = val; },
    get language() { return gLanguage; },
    set language(lang) { loadLocale(lang, translate); },
    get text() { return gTextData; },
    get data() { return gL10nData; },
    translate: translate,
    load: loadLocale
  };
})(window, document);

// gettext-like shortcut for l10n.get
if (window._ === undefined)
  var _ = l10n.get;

