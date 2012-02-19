This is an attempt to get a simple l10n library for modern browsers.
The point is mainly to test the HTML syntax and the JS API before choosing a
suitable data format (see last section).

Demo: http://kazhack.org/webL10n/

License: BSD/MIT


Quick Start
-----------

L10n resource files are linked to the HTML document like this:

```html
<link rel="resource" type="application/l10n" href="data.properties" />
<link rel="resource" type="application/l10n" href="mobile.properties"
      media="screen and (max-width: 640px)" />
```

l10n.js currently relies on the \*.properties format, which is used in most
Mozilla and Java projects. It is bullet-proof but limited (= key/value pairs).
Our parser supports extensions to \*.properties, in order to allow client-side
language selection and “import” rules.

[More information on the Wiki.](https://github.com/fabi1cazenave/webL10n/wiki)

