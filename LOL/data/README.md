Here’s a proposal to make the 'LOL' format less weird and more extensible.


'LOL' Format
------------

Entities:

    <identifier[index]? content? attributes?>
     
     - identifier = key string + optional [index] list
     - content    = value (generally: HTML element content)
     - attributes = « key: value » sequence
     
    where:
     - each index is a C-style logical expression
     - each value is a JSON object: string | array | list

Macros:

    <identifier(params) {expression}>

Comments:

    /* C-style comment */

In other words, the 'LOL' format is a mix of:

 * C-style comments and logical expressions
 * JSON-like values: string | array | list
 * DTD-like entities (ugh!)

Identifiers, values, expressions and comments make perfect sense, but to meet
our needs we need a nestable format for entities instead of the 'LOL' one.


The « identifier: value » Paradigm
----------------------------------

In most web-related languages (CSS, JSON, YAML…), values are assigned like this:

    ID: value

In order to use ``ID: value`` instead of ``<ID content? attributes?>``, we have
to express the content and attributes as a single object. As an example:

    <test "hello, world!"
        style: "color: red;"
        title: "failed">

could become:

    test: {  ~: "hello, world!",
        .style: "color: red;",
        .title: "failed",
    }

We suggest using ``~`` as a content identifier. This might be OK in general but
for an HTML element, we may want to use something like ``#content`` for
innerHTML and ``#text`` for contentText.

Attributes are prefixed with a dot to match the current LOL syntax. This is
mostly a namespace story.

We considered two alternatives:

 * JSON-like entities, keeping the rest of the l20n format “as is”;
 * YAML-like format: the whole l20n data would use an indentation-based structure.


JSON-like Alternative
---------------------

The simplest possible change would be to replace 'LOL' entities by ``ID: value``
assignments, to become consistent with the JSON syntax applied to 'LOL' values.

The resulting format looks like JSON but is *NOT* JSON-compliant: the whole data
is not enclosed in a main {…} block, identifiers aren’t inclosed in strings,
comments are allowed. Besides, we suggest the comma separator should be
optional at EOL (required otherwise).

Key benefits:

 * overall consistency;
 * a JavaScript / JSON syntax highlighter can be used;
 * allows to group entities, and have an entity tree instead of a flat list;
 * very close to the 'LOL' format: the 'LOL' parser we propose required very
   little effort to support this JSON-like variant.

Of course, this formats supports all LOL features.


YAML-like Alternative
---------------------

The JSON-like format could also be written with a YAML syntax: structure blocks
are replaced by indentation rules, and strings don’t have to be enclosed in
quote marks. YAML makes a lot of sense to handle wrapped text of multiline
text, with the ``>`` and ``|`` operators respectively.

Compared to the JSON-like variant:
 * pro: no structure delimiters! no weird characters required!
 * pro: much simpler to handle text in general;
 * pro: format errors are easier to detect;
 * con: some people don’t like to deal with indentation;
 * con: requires a more specific parser.

This format looks like YAML, it can be syntax-highlighted as YAML, but is *NOT*
strictly YAML-compliant. Again, it supports all LOL features.


Why bother?
-----------

Consistency, extensibility. Lower WTF-factor.

The l20n project brings a generic solution (expressions) to handle complex
grammatical rules, which is great. It relies on a specific and unconventional
syntax, which feels wrong — and not needed.

By design, LOL entities are not nestable. This gets in the developer’s way
when dealing with more complex structures than just HTML elements. For our
project, we intended to group entities by language and by media queries (to
handle client-side language selection and mobile/desktop adaptation,
respectively), this would be straight-forward with a JSON/YAML-like variant
(see the lang.json and lang.yaml files in this directory), but impossible with
the current LOL syntax.

__There’s a point where the WTF-effect becomes a technical issue.__
We feel like we’re beyond that point.

