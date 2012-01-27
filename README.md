This is an attempt to get a simple l10n library for modern browsers.
At the moment we’re using properties files (like for Gecko and Java) but this
could easily be extended to other file formats: the point is mainly to test the
HTML syntax and the JS API.

Demo: http://kazhack.org/webL10n/

License: MIT

HTML Markup
-----------

L10n resource files are linked to the HTML document like this:
  <link rel="resource" type="text/l10n" href="locales/data.intl" />
  <link rel="resource" type="text/l10n" href="locales/hello.intl" />

* rel: resource (any better idea?)
* type: text/l10n (l20n files) or text/properties (Java-like properties files)
* href: resource file for the default locale

l10n.js tries to load the resource file with a 'navigator.lang' suffix
(e.g. locales/data.intl.fr for a French browser), then loads the default
resource file if not found.

Translatable elements carry data-l10n- attributes:

* data-l10n-id: string identifier
* data-l10n-args: (optional) arguments
* data-l10n-path: (optional) XPath selector
* data-l10n-select: (optional) CSS selector

JavaScript API
--------------

The whole library exposes an 'l10n' object:

* l10n.get(key) : get the translation corresponding to the `key' identifier
* l10n.text     : get the text resources that have been loaded so far
* l10n.data     : get the main object containing all l10n data
* l10n.language : get/set the current locale
                  + load the corresponding resource files
                  + translate the whole document
* l10n.translate(node) : translate the target node (default = whole document)

Note: _() is a shortcut for l10n.get()

The 'l10nLocaleLoaded' event is fired when all files corresponding to the
current locale have been loaded and parsed.

