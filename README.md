This is an attempt to get a simple l10n library for modern browsers.
The parser supports properties files (like for Gecko and Java) and
[Mozilla l20n resources](https://wiki.mozilla.org/L20n).
The point is mainly to test the HTML syntax and the JS API.

Demo: http://kazhack.org/webL10n/

License: BSD/MIT

HTML Markup
-----------

L10n resource files are linked to the HTML document like this:

```html
<link rel="resource" type="text/properties" href="locales/data.properties" />
```

* ```rel```: resource (any better idea?)
* ```type```: ```application/l10n``` (Java-like properties),
* ```href```: resource file for the default locale

l10n.js loads strings from the *.properties file.
If this file contains several \[lang\] sections, the section corresponding to 
'navigator.lang' will be selected (if available).

Translatable elements carry data-l10n- attributes:

* ```data-l10n-id```: string identifier
* ```data-l10n-args```: (optional) arguments

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

Supported l10n formats
----------------------

l10n.js currently supports the *.properties format (= key/value pairs),
which is used in most Mozilla or Java projects.

For more advanced features (plural, context…), two other formats could be
supported by l10n.js:

* [GNU gettext](http://www.gnu.org/software/gettext/)
  — see [jsgettext](http://jsgettext.berlios.de/) and
  [jed](http://slexaxton.github.com/Jed/))
* [Mozilla l20n](https://wiki.mozilla.org/L20n) 
  — see the [toolbox](https://wiki.mozilla.org/L20n/Toolbox)
  and this [project](https://github.com/zbraniecki/l20n).

