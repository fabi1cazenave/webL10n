This is an attempt to get a simple l10n library for modern browsers.
At the moment we support properties files (like for Gecko and Java) and Mozilla
l20n resources, and this could easily be extended to other file formats:
the point is mainly to test the HTML syntax and the JS API.

Demo: http://kazhack.org/webL10n/

License: BSD/MIT

HTML Markup
-----------

L10n resource files are linked to the HTML document like this:

```html
<link rel="resource" type="text/l10n"       href="locales/hello.intl" />
<link rel="resource" type="text/properties" href="locales/data.properties" />
```

* ```rel```: resource (any better idea?)
* ```type```: ```text/l10n``` (Mozilla l20n files) or ```text/properties``` (Java-like properties)
* ```href```: resource file for the default locale

l10n.js tries to load the resource file with a 'navigator.lang' suffix
(e.g. locales/data.intl.fr for a French browser), then loads the default
resource file if not found.

Translatable elements carry data-l10n- attributes:

* ```data-l10n-id```: string identifier
* ```data-l10n-args```: (optional) arguments
* ```data-l10n-path```: (optional) XPath selector
* ```data-l10n-select```: (optional) CSS selector

JavaScript API
--------------

This API is a work in progress. We intend to reuse the l20n one, but if you want
to try this library right now, here's how it goes.

The whole library exposes an 'l10n' object:

* ```l10n.get(key)``` : get the translation corresponding to the `key' identifier
* ```l10n.text```     : get the text resources that have been loaded so far
* ```l10n.data```     : get the main object containing all l10n data
* ```l10n.language``` : get the currently applied locale
* ```l10n.loadResource```  : load and parse a resource file
* ```l10n.loadLocale```    : load and parse all resource files for a locale
* ```l10n.translate```     : translate the target node (default = whole document)

Note: ```_()``` is a shortcut for ```l10n.get()```

The ```l10nLocaleLoaded``` event is fired when all files corresponding to the
current locale have been loaded and parsed.

References
----------

The text/l10n format comes from the Mozilla l20n project:

* on the Mozilla wiki: [l20n page](https://wiki.mozilla.org/L20n), [toolbox](https://wiki.mozilla.org/L20n/Toolbox);
* on Gandalf’s github: [l20n page](http://zbraniecki.github.com/l20n/),
  [grammar](http://zbraniecki.github.com/l20n/docs/grammar.html),
  [project](https://github.com/zbraniecki/l20n).

FTR there are JavaScript libraries to support gettext (e.g.
[jsgettext](http://jsgettext.berlios.de/) and
[jed](http://slexaxton.github.com/Jed/)), but the Mozilla l20n project aims
to supercede gettext.

