/* vim: ft=javascript:ts=4:sw=4
 */
<plural(n) { n == 0 ? 'zero' : n == 1 ? 'one' : 'many' }>

/* simple case: string */
<drinks[plural(count)] {
    zero: "no downloads",
    one: "one download",
    many: "{{count}} downloads"
}>

/* tricky case: content + attributes */

/* variant #0: inline attributes */
<buttonClick "Click me {{count}} times">
<buttonClick.title: "use Ctrl+{{buttonClick.accesskey}} {{count}} times">
<buttonClick.accesskey: "c">

<buttonClick[plural(count)] {
    zero: "Done",
    one: "Click me once",
    many: "Click me {{count}} times"
}>
<buttonClick.title {
    zero: "(disabled)",
    one: "use Ctrl+{{buttonClick.accesskey}} once",
    many: "use Ctrl+{{buttonClick.accesskey}} {{count}} times"
}>
<buttonClick.accesskey: "c">


/* variant #1: LOL-like */
<buttonClick "Click me {{count}} times"
    title: "use Ctrl+{{buttonClick.accesskey}} {{count}} times"
    accesskey: "c">

<buttonClick[plural(count)] {
        zero: "Done",
        one: "Click me once",
        many: "Click me {{count}} times"
    }
    title: {
        zero: "(disabled)",
        one: "use Ctrl+{{buttonClick.accesskey}} once",
        many: "use Ctrl+{{buttonClick.accesskey}} {{count}} times"
    }
    accesskey: "c">

