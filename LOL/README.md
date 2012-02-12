l10n.js used to support 'LOL' files from the
[Mozilla l20n](https://wiki.mozilla.org/L20n) project:

* [l20n toolbox](https://wiki.mozilla.org/L20n/Toolbox) real-life examples
* [l20n grammar](http://zbraniecki.github.com/l20n/docs/grammar.html) extensive
  description of the file format
* [project repository](https://github.com/zbraniecki/l20n) (BSD license)

Instead of the limited key-value approach, l20n supports indexes/parameters on
keys and relies on logical expressions to handle grammatical rules. The
resulting file format includes:

* identifiers: ID + optional [index] or (params)
* JSON-like values: string | array | list
* C-style logical expressions
* C-style comments
* 'LOL' entities, instead of the conventional “ID:value” approach. :-/

Identifiers, values, expressions and comments make perfect sense, but to meet
our needs we need a nestable format for l20n entities (instead of the 'LOL' one)
in order to group entities by language (client-side language selection), by
media queries (desktop/mobile adaptation) — or more generally, to use more
complex structures than HTML elements. We considered two alternatives:

* JSON-like entities, keeping the rest of the l20n format “as is”;
* YAML-like format: the whole l20n data would use an indentation-based structure.

As the idea of nestable entities has been strongly rejected by the l20n team,
we’re now looking for a more flexible alternative. Our l20n-related files have
been removed from l10n.js, we leave our 'LOL' parser (which also supports a
JSON-like variant) and our test files in this directory, in case someone else
is interested.

