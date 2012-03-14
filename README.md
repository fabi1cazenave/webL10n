This is an attempt to get a simple l10n library for modern browsers.
The point is mainly to test the HTML syntax and the JS API before choosing a suitable data format (see last section).

Demo: <http://kazhack.org/webL10n/>

[More information on the Wiki.](https://github.com/fabi1cazenave/webL10n/wiki)

Quick Start
-----------

Here’s a quick way to get a multilingual HTML page:

```html
<html>
<head>
  <script type="text/javascript" src="l10n.js"></script>
  <link rel="resource" type="application/l10n" href="data.properties" />
</head>
<body>
  <button data-l10n-id="test" title="click me!">This is a test</button>
</body>
</html>
```

* l10n resource files are associated to the HTML document with a ``<link>`` element;
* translatable elements carry a ``data-l10n-id`` attribute;
* l10n resources are stored in a bullet-proof ``*.properties`` file:

```ini
[en-US]
test=This is a test
test.title=click me!
[fr]
test=Ceci est un test
test.title=cliquez-moi !
```


JavaScript API
--------------

``l10n.js`` exposes a rather simple ``document.mozL10n`` object.

```javascript
// Set the 'lang' and 'dir' attributes to <html> when the page is translated
window.addEventListener('l10nLocaleLoaded', function showBody() {
  var html = document.querySelector('html');
  html.setAttribute('lang', document.mozL10n.language);
  html.setAttribute('dir', document.mozL10n.direction);
}, false);
```
* `l10nLocaleLoaded` event: fired when the page has been translated
* `language` property (read/write): language of the current document;
* `direction` property (read-only): direction (ltr|rtl) of the current language.

To get a translated string from a script, just use the ``get()`` method:

```javascript
var message = document.mozL10n.get('test');
alert(message);
```

To handle complex strings, the `get()` method can accept optional arguments:

```javascript
var welcome = document.mozL10n.get('welcome', { user: "John" });
alert(welcome);
```

where `welcome` is defined like this:

```ini
[en-US]
welcome=welcome, {{user}}!
[fr]
welcome=bienvenue, {{user}} !
```


Further thoughts
----------------

### Media queries

For mobile apps, here’s what I’d like to do:

```html
<link rel="resource" type="application/l10n" href="data.properties" />
<link rel="resource" type="application/l10n" href="mobile.properties"
      media="screen and (max-width: 640px)" />
```

### innerHTML

For security concerns, we currently assume that all strings are applied as `textContent`. We’ll need a way to use localized strings as `innerHTML`, at least when the target element has non-text children. That can be achieved:

* by sanitizing the localized string before applying it as `innerHTML` (like in the PHP ``strip_tags`` method)
* by providing a text-to-HTML method, e.g. markdown.

```ini
welcome#text=welcome, {{user}}!
welcome#html=welcome, <strong>{{user}}</strong>!
welcome#markdown=welcome, **{{user}}**!
```

### Plural, gender…

`l10n.js` currently relies on the ``*.properties`` format, which is used in most Mozilla and Java projects. It is bullet-proof but limited (= key/value pairs), and we’re working on a more advanced alternative to support finer grammatical rules.


License
-------

BSD/MIT/WTFPL license. Use at your own risk.

