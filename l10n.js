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

  // parser

  function evalString(text) {
    return text.replace(/\\\\/g, '\\')
               .replace(/\\n/g, '\n')
               .replace(/\\r/g, '\r')
               .replace(/\\t/g, '\t')
               .replace(/\\b/g, '\b')
               .replace(/\\f/g, '\f')
               .replace(/\\{/g, '{')
               .replace(/\\}/g, '}')
               .replace(/\\"/g, '"')
               .replace(/\\'/g, "'");
  }

  function parseProperties(text) {
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
        if (typeof gL10nData[elt] === 'string') {
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
    var parsedText = '';
    function next(re) {
      var match = re.exec(text);
      if (!match || !match.length)
        return null;
      // the RegExp (re) should always start with /^\s* -- except for comments
      assert(match.index == 0 || match[0] == '*\/');
      var index = match.index + match[0].length;
      parsedText += text.substring(0, index);
      text = text.substr(index);
      return match[0].replace(/^\s*/, '');
    }
    function assert(test) {
      if (!test)
        throw 'l10n parsing error: \n' +
          parsedText.substr(parsedText.length - 128) +
          ' ### ' + text.substring(0, 128);
    }
    function check(re) {
      var rv = next(re);
      assert(rv);
      return rv;
    }

    // entity delimiters
    const reIdentifier = /^\s*[a-zA-Z]\w*/;
    const reNumber = /^\s*[0-9]\w*/;
    const reColonSep = /^\s*:\s*/;
    const reCommaSep = /^\s*,\s*/;
    const reValueBegin = /^\s*['"\[\{]/;
    const reStringDelim = /^\s*('''|"""|['"])/;

    // entity parser
    function nextEntity() {
      while (next(/^\s*\/\*/))
        check(/\*\//);      // commments are ignored
      return next(/^\s*</); // found entity or macro
    }
    // entity attributes (key:value pairs)
    function readAttributes() {
      var attributes = {};
      var empty = true;
      var id = next(reIdentifier);
      while (id) {
        check(reColonSep);
        attributes[id] = readValue();
        id = next(reIdentifier);
        empty = false;
      }
      return empty ? null : attributes;
    }

    // entity values (string|array|list)
    function readValue() {
      function getString() {
        // escape sequences: \, {{...}}
        var str = '';
        var len = text.length;
        var escapeMode = false;
        var delimFound = false;
        var delim = check(reStringDelim);
        var checkDelim = (delim.length == 1) ?
          function(pos) {
            return (text[pos] == delim);
          } : function(pos) {
            return (pos > 2) && (text.substring(pos - 2, pos + 1) == delim);
          };

        var i = 0;
        while (!delimFound && (i < len)) {
          if (escapeMode)
            escapeMode = false;
          else {
            delimFound = checkDelim(i);
            escapeMode = (text[i] == '\\');
            if ((i > 0) && (text[i] == '{') && (text[i - 1] == '{'))
              i = text.indexOf('}}', i);
          }
          i++;
        }
        if (delimFound) {
          parsedText += text.substring(0, i);
          str = evalString(text.substring(0, i - delim.length));
          text = text.substr(i);
        }
        return str;
      }
      function getSplitString() {
        // escape sequences: \, {{...}}
        var str = '';
        var len = text.length;
        var escapeMode = false;
        var delimFound = false;
        var delim = check(reStringDelim);
        var checkDelim = (delim.length == 1) ?
          function(pos) {
            return (text[pos] == delim);
          } : function(pos) {
            return (pos > 2) && (text.substring(pos - 2, pos + 1) == delim);
          };

        // same as readString() but splits the string when {{extends}} are found
        var i = 0;
        var last = 0;
        var output = [];
        while (!delimFound && (i < len)) {
          if (escapeMode)
            escapeMode = false;
          else {
            delimFound = checkDelim(i);
            escapeMode = (text[i] == '\\');
            if ((i > 0) && (text[i] == '{') && (text[i - 1] == '{')) {
              if (i > 1)
                output.push(evalString(text.substring(last, i - 1)));
              last = i - 1;
              i = text.indexOf('}}', last) + 2;
              output.push(evalString(text.substring(last, i)));
              last = i--;
            }
          }
          i++;
        }
        if (delimFound) {
          parsedText += text.substring(0, i);
          str = evalString(text.substring(last, i - delim.length));
          if (str.length)
            output.push(str);
          text = text.substr(i);
        } // else => trow exception
        return last ? output : str;
      }
      function getArray() {
        var reArrayEnd = /^\s*\]/;
        check(/^\s*\[/);
        if (next(reArrayEnd))
          return [];
        var table = [];
        do {
          table.push(readValue());
        } while (next(reCommaSep));
        check(reArrayEnd);
        return table;
      }
      function getList() {
        var reListEnd = /^\s*\}/;
        check(/^\s*\{/);
        if (next(reListEnd))
          return {};
        var list = {};
        do {
          var id = next(reIdentifier);
          check(reColonSep);
          list[id] = readValue();
        } while (next(reCommaSep));
        check(reListEnd);
        return list;
      }

      // return a string|array|list according to the first token
      var match = reValueBegin.exec(text);
      if (!match || !match.length)
        return null;
      var token = match[0];
      switch (token[token.length - 1]) {
        case '"':
        case "'":
          return getString();
          //return getSplitString();
          break;
        case '[':
          return getArray();
          break;
        case '{':
          return getList();
          break;
      }
      return null;
    }

    // entity expressions
    function readExpression() {
      // member parsing
      function getPrimary() { // (expression) | number | value | ID
        if (next(/^\s*\(/)) {           // (expression)
          var expr = readExpression();
          check(/^\s*\)/);
          return { expression: expr };
        }

        var num = next(reNumber);       // number
        if (num)
          return parseInt(num, 10);

        if (reValueBegin.test(text))    // value
          return readValue();

        var id = next(reIdentifier);    // ID
        if (id)
          return id;

        return null;
      }
      function getMember() {  // primary | attr | prop | call
        var primary = getPrimary();
        //assert(primary);
        if (!primary)
          return null;

        var isID = (typeof primary === 'string') && reIdentifier.test(primary);
        var expr, id;

        // attr: primary[.expression] | ID..ID
        var attrSep = next(/^\.\.|^\s*\[\./);
        if (attrSep) {
          if (attrSep == '[.') {
            expr = readExpression();
            check(/^\s*\]/);
            return {
              attr: { primary: primary, expression: expr }
            };
          }
          if (isID && (attrSep == '..')) {
            return {
              attr: { primary: primary, id: check(reIdentifier) }
            };
          }
          assert();
        }

        // prop: primary[expression] | ID.ID
        var propSep = next(/^\.|^\s*\[/);
        if (propSep) {
          if (propSep == '[') {
            expr = readExpression();
            check(/^\s*\]/);
            return {
              prop: { primary: primary, expression: expr }
            };
          }
          if (isID && (propSep == '.')) {
            return {
              prop: { primary: primary, id: check(reIdentifier) }
            };
          }
          assert();
        }

        // call: primary(expression, ...)
        var callSep = next(/^\s*\(/);
        if (callSep) {
          var params = [];
          do {
            params.push(readExpression());
          } while (next(reCommaSep));
          check(/\)/);
          return {
            call: { primary: primary, params: params }
          };
        }

        // default
        return primary;
      }

      // condition parsing
      const reUnaryOp = /^\s*[+\-!]/;
      const reBinaryOp = /^\s*(==|!=|<=|>=|\+|\-|\*|\/|%)/;
      const reLogicalOp = /^\s*(\|\||\&\&)/;
      function getUnary() {
        var operator = next(reUnaryOp);
        var member = getMember();
        return operator ? {
          operator: operator,
          member: member
        } : member;
      }
      function getBinary() {
        var left = getUnary();
        var operator = next(reBinaryOp);
        return operator ? {
          binary: {
            left: left,
            operator: operator,
            right: getBinary()
          }
        } : left;
      }
      function getLogical() {
        var left = getBinary();
        var operator = next(reLogicalOp);
        return operator ? {
          logical: {
            left: left,
            operator: operator,
            right: getLogical()
          }
        } : left;
      }
      function getConditional() {
        var logical = getLogical();
        if (next(/^\s*\?\s*/)) {
          var ifTrue = getConditional();
          check(reColonSep);
          var ifFalse = getConditional();
          return {
            conditional: {
              logical: logical,
              ifTrue: ifTrue,
              ifFalse: ifFalse
            }
          };
        } else
          return logical;
      }

      // an expression is always a conditional expression
      return getConditional();
    }

    // parsing loop
    while (nextEntity()) {
      var id = next(reIdentifier);

      // possible index or macro params
      var index = '';
      var params = [];
      switch (text[0]) {
        case '[': // index
          check(/^\[/);
          index = readExpression();
          check(/^\s*]/);
          break;
        case '(': // macro params
          check(/^\(/);
          do {
            params.push(readExpression());
          } while (next(reCommaSep));
          check(/^\s*\)/);
          break;
      }

      // value and attributes
      if (!params.length) { // entity (= general case)
        var value = readValue();           // (optional) string | array | list
        var attributes = readAttributes(); // (optional) key-value pairs
        if (!attributes && !index) {       // plain string (= general case)
          gL10nData[id] = value;
        } else {
          gL10nData[id] = {};
          if (index)
            gL10nData[id].index = index;
          if (value)
            gL10nData[id].value = value;
          if (attributes)
            gL10nData[id].attributes = attributes;
        }
      } else { // macro
        /*
        check(/^\s*\{/);
        gL10nData[id] = {};
        gL10nData[id].params = params;
        gL10nData[id].macro = readExpression();
        check(/^\s*\}/);
        */
        check(/^\s*\{/);
        var index = parsedText.length;
        var expr = readExpression();
        var source = parsedText.substr(index);
        var body = 'return (' + source + ')';
        check(/^\s*\}/);

        // XXX hack
        if (expr) {
          var macro;
          switch (params.length) {
            case 1:
              macro = new Function(params[0], body);
              break;
            case 2:
              macro = new Function(params[0], params[1], body);
              break;
            case 3:
              macro = new Function(params[0], params[1], params[2], body);
              break;
          }
          gL10nData[id] = {};
          gL10nData[id].macro = macro;
          gL10nData[id].source = source;
          gL10nData[id].params = params;
          gL10nData[id].expression = expr;
        }
      }

      // end of entity
      check(/^\s*>/);
    }
  }

  function parse(text, type) {
    gTextData += text;
    switch (type) {
      case 'text/properties':
        return parseProperties(text);
      case 'text/l10n':
        return parseL20n(text);
      default:
        if (/^\s*(#|[a-zA-Z])/.test(text))
          return parseProperties(text);
        if (/^\s*(\/\*|<)/.test(text))
          return parseL20n(text);
    }
    return null;
  }

  // load and parse the specified resource file
  function loadResource(href, type, onSuccess, onFailure) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', href, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          parse(xhr.responseText, type);
          if (onSuccess)
            onSuccess();
        } else {
          if (onFailure)
            onFailure();
        }
      }
    };
    xhr.send(null);
  }

  // load and parse all resources for the specified locale
  function loadLocale(lang, callback) {
    clear();

    // check all <link type="text/l10n" src="..." /> nodes
    // and load the resource files
    var langLinks = document.querySelectorAll(
        'link[type="text/l10n"], link[type="text/properties"]');
    var langCount = langLinks.length;

    // start the callback when all resources are loaded
    var onResourceLoaded = null;
    var gResourceCount = 0;
    onResourceLoaded = function() {
      gResourceCount++;
      if (gResourceCount >= langCount) {
        // execute the [optional] callback
        if (callback)
          callback();
        // fire an 'l10nLocaleLoaded' DOM event
        var evtObject = document.createEvent('Event');
        evtObject.initEvent('l10nLocaleLoaded', false, false);
        window.dispatchEvent(evtObject);
      }
    }

    // load all resource files
    function l10nResourceLink(link) {
      var href = link.href;
      var type = link.type;
      this.load = function(lang, callback) {
        var applied = lang;
        loadResource(href + '.' + lang, type, callback, function() {
          // load default l10n resource file if not found
          loadResource(href, type, callback, callback);
          applied = '';
        });
        return applied; // return lang if found, an empty string if not found
      };
    }
    gLanguage = lang;
    for (var i = 0; i < langCount; i++) {
      var resource = new l10nResourceLink(langLinks[i]);
      var rv = resource.load(lang, onResourceLoaded);
      if (rv != lang) // lang not found, used default resource instead
        gLanguage = '';
    }
  }

  // translate an element
  function translate(element) {
    element = element || document;

    // list of translatable attributes
    var attrList = ['title', 'accesskey', 'alt', 'longdesc'];
    var attrCount = attrList.length;

    // check all translatable children (= w/ a `data-l10n-id' attribute)
    var children = element.querySelectorAll('*[data-l10n-id]');
    var elementCount = children.length;
    for (var i = 0; i < elementCount; i++) {
      var child = children[i];

      // translate the child
      var key = child.dataset.l10nId;
      var data = gL10nData[key];
      if (!data)
        continue;

      // child content
      child.innerHTML = data.value || data;

      // child attributes
      if (data.attributes) {
        for (var j = 0; j < attrCount; j++) {
          var attrName = attrList[j];
          var attrValue = data.attributes[attrName];
          if (attrValue && child.hasAttribute(attrName))
            child.setAttribute(attrName, attrValue);
        }
      }
    }
  }

  // clear all l10n data
  function clear() {
    gL10nData = {};
    gTextData = '';
    gLanguage = '';
  }

  // load the default locale on startup
  window.addEventListener('DOMContentLoaded', function() {
    loadLocale(navigator.language, translate);
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
    loadResource: loadResource,
    loadLocale: loadLocale,
    translate: translate,
    clear: clear
  };
})(window, document);

// gettext-like shortcut for l10n.get
if (window._ === undefined)
  var _ = l10n.get;

