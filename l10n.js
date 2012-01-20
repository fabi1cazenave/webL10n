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

var l10n = (function(window, document, undefined) {
  'use strict';

  var gStrings = [];
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

      // translate the element content
      var key = element.dataset.l10nId;
      var value = gStrings[key];
      if (value)
        element.innerHTML = value;

      // translate the element attributes
      for (var j = 0; j < attrCount; j++) {
        var attrName = attrList[j];
        var attrValue = gStrings[key + '.' + attrName];
        if (attrValue && element.hasAttribute(attrName))
          element.setAttribute(attrName, attrValue);
      }
    }
  }

  function parseProperties(text) {
    var lines = text.replace(/^\s*|\s*$/, '').split(/[\r\n]+/);
    for (var i = 0; i < lines.length; i++) {
      if ((/^\s*#|^\s*$/).test(lines[i])) // comment or blank line
        continue;
      var tmp = lines[i].split('=');
      gStrings[tmp[0]] = tmp[1].replace(/\\n/g, '\n');
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

  function loadResources(lang, callback) {
    gStrings = [];
    gLanguage = lang;

    // check all <link type="text/l10n" src="..." /> nodes
    // and load the resource files
    var langLink = document.querySelectorAll('link[type="text/l10n"]');
    var langCount = langLink.length;

    // start the callback when all resources are loaded
    var onResourceLoaded = null;
    if (callback) {
      var gCount = 0;
      onResourceLoaded = function() {
        gCount++;
        if (gCount >= langCount)
          callback();
      }
    }

    // load all resource files
    for (var i = 0; i < langCount; i++) {
      var resource = new l10nResource(langLink[i].href, parseProperties);
      var rv = resource.load(lang, onResourceLoaded);
      if (rv != lang) // lang not found, used default resource instead
        gLanguage = '';
    }
  }

  window.addEventListener('DOMContentLoaded', function() {
    var async = true;
    if (async) {
      // asynchronous (recommended on non-local files)
      loadResources(navigator.language, translate);
    } else {
      // synchronous (much faster)
      loadResources(navigator.language);
      translate();
    }

  }, false);

  return {
    get: function(key) { return gStrings[key] ? gStrings[key] : key; },
    set: function(key, val) { gStrings[key] = val; },
    get language() { return gLanguage; },
    set language(lang) { loadResources(lang, translate); },
    translate: translate,
    load: loadResources
  };
})(window, document);

// gettext-like shortcut for l10n.get
if (window._ === undefined)
  var _ = l10n.get;

