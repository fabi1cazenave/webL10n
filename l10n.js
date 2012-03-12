/*  Copyright (c) 2011 Mozilla.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to
  * deal in the Software without restriction, including without limitation the
  * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  * sell copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
  * IN THE SOFTWARE.
  */

'use strict';
(function(window, document, undefined) {
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

  function parseProperties(text, lang) {
    var reBlank = /^\s*|\s*$/;
    var reComment = /^\s*#|^\s*$/;
    var reSection = /^\s*\[(.*)\]\s*$/;
    var reImport = /^\s*@import\s+url\((.*)\)\s*$/i;

    // parse the *.properties file into an associative array
    var currentLang = '*';
    var supportedLang = [];
    var skipLang = false;
    var data = [];
    var match = '';
    var entries = text.replace(reBlank, '').split(/[\r\n]+/);
    for (var i = 0; i < entries.length; i++) {
      var line = entries[i];

      // comment or blank line?
      if (reComment.test(line))
        continue;

      // section start?
      if (reSection.test(line)) {
        match = reSection.exec(line);
        currentLang = match[1];
        skipLang = (currentLang != lang) && (currentLang != '*');
        continue;
      } else if (skipLang)
        continue;

      // @import rule?
      if (reImport.test(line)) {
        match = reImport.exec(line);
      }

      // key-value pair
      var tmp = line.split('=');
      if (tmp.length > 1)
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

  function parse(text, lang) {
    gTextData += text;
    // we only support *.properties files at the moment
    return parseProperties(text, lang);
  }

  // load and parse the specified resource file
  function loadResource(href, lang, onSuccess, onFailure) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', href, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          parse(xhr.responseText, lang);
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

    // check all <link type="application/l10n" href="..." /> nodes
    // and load the resource files
    var langLinks = document.querySelectorAll('link[type="application/l10n"]');
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
        loadResource(href, lang, callback, function() {
          console.warn(href + ' not found.');
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

  // translate a string
  function translateString(key, args) {
    var str = gL10nData[key];
    if (!str)
      return key;
    str = gL10nData[key].value || gL10nData[key];
    if (args) for (var k in args) {
      str = str.replace('{{' + k + '}}', args[k]);
    }
    return str;
  }

  // translate an HTML element
  function translateElement(element) {
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
      child.textContent = data.value || data;

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
    if (navigator.mozSettings) {
      var req = navigator.mozSettings.get('language.current');
      req.onsuccess = function() {
        loadLocale(req.result.value, translateElement);
      };
      req.onerror = function() {
        loadLocale(navigator.language, translateElement);
      };
    }
    else {
      loadLocale(navigator.language, translateElement);
    }
  }, false);

  navigator.mozL10n = {
    get: translateString,
    set: function(key, val) { gL10nData[key] = val; },
    get language() { return gLanguage; },
    set language(lang) { loadLocale(lang, translateElement); },
    get text() { return gTextData; },
    get data() { return gL10nData; },
    loadResource: loadResource,
    loadLocale: loadLocale,
    translate: translateElement,
    clear: clear
  };
})(window, document);

// gettext-like shortcut for navigator.mozL10n.get
if (window._ === undefined)
  var _ = navigator.mozL10n.get;

