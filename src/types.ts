/**
 * App-local UI types. Domain types live in `@arli/contracts`, design tokens in
 * `@arli/tokens`. What remains here is presentation-only.
 */

/** A chat bubble. `align`/`bg`/`fg` are styling, not domain data. */
export interface Message {
  align: 'flex-start' | 'flex-end';
  bg: string;
  fg: string;
  text: string;
}
