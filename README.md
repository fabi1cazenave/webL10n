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
window.addEventListener('localized', function showBody() {
  var html = document.querySelector('html');
  var lang = document.mozL10n.language;
  html.setAttribute('lang', lang.name);
  html.setAttribute('dir', lang.direction);
}, false);
```
* `localized` event: fired when the page has been translated;
* `language` property (read-only): language of the current document
    * `language.name` (read/write): ISO-639-1 code of the current language
    * `language.dir` (read-only): direction (ltr|rtl) of the current language.
* `get` method: get a translated string.

```javascript
var message = document.mozL10n.get('test');
alert(message);
```

You will probably use a gettext-like alias:

```javascript
var _ = document.mozL10n.get;
alert(_('test'));
```

To handle complex strings, the `get()` method can accept optional arguments:

```javascript
alert(_('welcome', { user: "John" }));
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
welcome#mark=welcome, **{{user}}**!
```

### Multi-line strings

Multi-line and wrapped strings aren’t supported at the moment. The *.properties way to extend a string on several lines is to use a backslash at the end of line… but there could be sharper/easier ways to handle that.

YAML handles multi-line / wrapped strings nicely with the pipe and backslash operators, maybe we could reuse that in webL10n?


### Arrays and lists

There are (rare) cases where we’d want the entity to be an array or a list, instead of a string. We could use a JSON- or YAML-like syntax for that.


### Plural, gender…

The Mozilla l20n project introduces the concept of “expression”, which can be used to address most grammatical rules.

As an example, the following strings might be gramatically incorrect when `n` equals zero or one:

```ini
[en-US]
unread=You have {{n}} unread messages
[fr]
unread=Vous avez {{n}} nouveaux messages
```

Here’s a plural expression that can be used:

```ini
plural(n) {
  n == 0 ? 'zero' : (n == 1 ? 'one' : 'many')
}
[en-US]
unread[plural(n)]={
  zero:You have no unread messages
  one:You have one unread message
  many:You have {{n}} unread messages
}
[fr]
unread[plural(n)]={
  zero:Vous n’avez pas de nouveau message
  one:Vous avez un nouveau message
  many:Vous avez {{n}} nouveaux messages
}
```

Browser support
---------------

Tested on Mozilla Firefox. Should work on most modern browsers, including IE9 and later.


License
-------

BSD/MIT/WTFPL license. Use at your own risk.

