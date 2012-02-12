This is an attempt to get a simple l10n library for modern browsers.
The point is mainly to test the HTML syntax and the JS API before choosing a
suitable data format (see last section).

Demo: http://kazhack.org/webL10n/

License: BSD/MIT

HTML Markup
-----------

L10n resource files are linked to the HTML document like this:

```html
<link rel="resource" type="application/l10n" href="data.properties" />
<link rel="resource" type="application/l10n" href="mobile.properties"
      media="screen and (max-width: 640px)" />
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

This API is a work in progress and is likely to change any time.  If you want to
try the l10n.js library right now, here's how it goes.

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

l10n.js currently relies on the *.properties format, which is used in most
Mozilla and Java projects. It is bullet-proof but limited (= key/value pairs).
Our parser supports extensions to *.properties, in order to allow client-side
language selection and “import” rules.

For more advanced grammatical features (e.g. plural, context…), two other
formats can be considered:

* [GNU gettext](http://www.gnu.org/software/gettext/) is the /de facto/ standard
  — see [jsgettext](http://jsgettext.berlios.de/) (LGPL license) and
  [jed](http://slexaxton.github.com/Jed/) (WTFPL license)
* [Mozilla l20n](https://wiki.mozilla.org/L20n) aims to superceed gettext
  — see this [project](https://github.com/zbraniecki/l20n) (BSD license).

The Mozilla l20n format has been evaluated (see the 'LOL' directory in this
repo) but doesn’t meet our needs. Jed seems interesting and ready-to-use,
we still have to evaluate it for this project.

