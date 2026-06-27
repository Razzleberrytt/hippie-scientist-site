# Monetization CRO QA Checklist

## Layout

- [ ] Mobile pages have no horizontal overflow.
- [ ] Recommendation cards stack cleanly on small screens.
- [ ] Email capture buttons and inputs do not overflow.
- [ ] Top page CTA placement appears early, mid-page, and near the bottom.

## Accessibility

- [ ] Email inputs have accessible labels.
- [ ] Link text is descriptive.
- [ ] Disabled email state is visible in text and control state.
- [ ] Focus states remain visible on links, inputs, and buttons.

## Affiliate Compliance

- [ ] Affiliate links use `rel="sponsored nofollow noopener noreferrer"`.
- [ ] Non-affiliate external links use `rel="noopener noreferrer"`.
- [ ] Compact disclosure appears near recommendation sections.
- [ ] `/affiliate-disclosure` renders a full disclosure.
- [ ] Amazon Associates final disclosure language is reviewed by the owner.

## Safety and Claims

- [ ] Safety disclaimers appear on upgraded money pages.
- [ ] No page promises treatment, cure, or diagnosis.
- [ ] Sleep page mentions next-day grogginess, sedatives, alcohol, pregnancy/nursing, medication context, and no insomnia-treatment promise.
- [ ] Stress page does not replace mental health care.
- [ ] Focus page cautions against stimulant stacking.
- [ ] Brain fog and fatigue pages mention possible medical causes.
- [ ] Overthinking page avoids diagnosing anxiety or OCD.

## Links and Static Export

- [ ] `/free-guide` works.
- [ ] `/methodology` works.
- [ ] `/affiliate-disclosure` works.
- [ ] Target `/top` pages work.
- [ ] No API routes, middleware, server actions, runtime revalidation, or dynamic runtime code added.
- [ ] Placeholder/search affiliate links are documented before launch.
- [ ] No fake email signup success state is shown.

## Validation

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run check`
- [ ] `npm run build`
