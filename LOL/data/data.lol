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

/* arrays */
<drinks[num] [
    "Coca Cola",
    "Gatorade",
    "Water"
]>

/* lists */
<cookie[form] {
    one: "Cookie",
    many: "Cookies"
}>

/* nested lists */
<moreDrinks[type,num] {
    cup: { one: "Cup", many: "Cups" },
    pot: { one: "Pot", many: "Pots" }
}>

