# Layerstream Changelog

The public changelog for all Layerstream components, served at
**https://changelog.layerstream.se** from GitHub Pages.

```
releases/<component>/<version>.md    ← one Markdown file per release (the data)
src/                                 ← Astro static site
.github/actions/publish-entry/       ← action the component repos call on release
.github/workflows/deploy.yml         ← builds the site and deploys it to Pages
```

Each push to `main` rebuilds and deploys the site. Pull requests are built but not
deployed, so a broken entry is caught before it goes live.

## How releases get here

Each component's release workflow calls the `publish-entry` action after a successful
deploy. The action writes `releases/<component>/<version>.md` and pushes it to `main`,
which triggers the deploy.

> **Release notes are published publicly exactly as written.** Keep internal details
> (ticket links, hostnames, names) out of the release PR body. HTML comments
> (`<!-- … -->`) are stripped, so PR template hints are safe.

### Entry format

```markdown
---
component: core            # core | machine | manage
version: v1.4.0
date: 2026-10-12T14:03:00Z
title: Faster layer sync   # optional headline
---

## Added
- …

## Fixed
- …
```

You can add, fix or remove an entry by hand by editing the file and pushing to `main`.

### Adding a component

1. Add it to `src/lib/components.ts` (name, description, colour), and add a
   `--c-<key>` colour to `src/styles/global.css` for both themes.
2. Create `releases/<key>/.gitkeep`.

## Hooking up a component repository

1. **Create a token** that can push to this repo: a fine-grained PAT (or a GitHub App)
   with *Repository access: only `layerstream-changelog`* and *Contents: read & write*.
2. **Add it as a secret** named `CHANGELOG_TOKEN` in the component repo (or once as an
   organisation secret shared with the three repos).
3. **Add a job** to the release workflow:

```yaml
  changelog:
    needs: [release, deploy]   # only announce what actually shipped
    if: github.event.pull_request.body != ''   # skip releases without notes
    runs-on: ubuntu-latest
    steps:
      - uses: lkpg-technologies/layerstream-changelog/.github/actions/publish-entry@main
        with:
          component: core      # or machine / manage
          version: ${{ needs.release.outputs.version }}
          notes: ${{ github.event.pull_request.body }}
          token: ${{ secrets.CHANGELOG_TOKEN }}
```

`@main` always uses the latest action. To insulate the component repos from changes,
tag a release here (`git tag v1 && git push origin v1`) and reference `@v1` instead.

The job fails if the component is unknown, the version isn't `vX.Y.Z`, or the notes are
empty. Re-running it for the same version updates the entry and keeps the original date.

## One-time GitHub Pages setup

1. *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
2. *Settings → Pages → Custom domain:* `changelog.layerstream.se`, then enable
   **Enforce HTTPS** once the certificate has been issued.
3. DNS: `changelog.layerstream.se  CNAME  lkpg-technologies.github.io.`
4. Recommended: verify `layerstream.se` under the organisation's
   *Settings → Pages → Verified domains* to prevent domain takeover.

## Local development

Requires Node 22.12+.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```
