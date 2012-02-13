l10n.js used to support 'LOL' files from the
[Mozilla l20n](https://wiki.mozilla.org/L20n) project:

* [l20n toolbox](https://wiki.mozilla.org/L20n/Toolbox) real-life examples
* [l20n grammar](http://zbraniecki.github.com/l20n/docs/grammar.html) extensive
  description of the file format
* [project repository](https://github.com/zbraniecki/l20n) (BSD license)

'LOL' files (Localizable Object List) are a flat list of localized entities.
Our project requires a way to group entities by selectors (language selection,
media queries), so we proposed a simplification of the LOL format to make it
more extensible and get a Localizable Object *Tree* — see the “data” directory
for more details.

As the idea of nestable entities has been strongly rejected by the l20n team,
we’re now looking for a more flexible alternative. Our l20n-related files have
been removed from l10n.js, we leave our 'LOL' parser and our test files here,
in case someone else is interested.

