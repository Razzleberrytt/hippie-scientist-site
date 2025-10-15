# QA Checklist (quick pass)

- [ ] `<meta name="viewport">` is `width=device-width, initial-scale=1` (single instance)
- [ ] Header/nav/footer stable at 320/375/768/1024/1280/1440 px
- [ ] No JS console errors in shipped code
- [ ] All `<img>`/`<Image>` have `alt` (decorative: `alt=""` + `aria-hidden="true"`)
- [ ] No duplicate `id` in DOM
- [ ] `!important` count trending down
