/* vim: ft=javascript:ts=4:sw=4
 *   <entity value? attributes?>
 *   <macro { (expression) }>
 *
 * Note: the name of this format ('LOL') is its best feature.
 *
 *
 *
 *
 */

/* macros */
<plural(n) { n == 1 ? 'one' : 'many' }>
<download[plural(count)] {
    one: "one download",
    many: "{{count}} downloads"
}>

