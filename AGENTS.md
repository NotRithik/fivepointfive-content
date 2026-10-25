# Working with 5.5 Records content

Read `README.md` and, when needed, `docs/FIELDS.md` before preparing edits.

## Without browsing or editing tools

Do not assume you can read a GitHub link. Ask the editor to paste the complete relevant files, including their headers. Ask only for missing details: names, exact destination links, prices, cover/photo paths, audio edition, and intended position.

Return the exact filename and a complete copyable replacement file. For a one-row change, exact old/new rows are acceptable after seeing the current file. Never replace unseen content, omit rows with ellipses, invent IDs or URLs, or claim you committed/published anything. Explain the pencil → Commit changes → green Actions check → refresh steps. Images must be uploaded by the editor unless you have an authorized upload tool.

## With repository tools

- Change `content/` and `images/` for routine content work. Preserve unrelated rows, spelling, credits and exact URLs.
- **File order is authoritative.** Never alphabetize names or date-sort releases unless explicitly asked.
- `releases.csv` is the shared release library. Its `id` is permanent. `new-releases.csv` and `shelf.csv` reference it; remove references when deleting a release.
- Homepage order comes from `new-releases.csv`, maximum 7. Shelf order comes from `shelf.csv`, maximum 5. Do not silently drop excess selections.
- Product order comes from `shop.csv`; photo order comes from its `images` field, separated by `|`. Prices are INR numbers, not formatted currency strings.
- Upload new images before adding references, or commit both in the same change. Use only public JPG/PNG/WebP images. No fonts, secrets, private files, customer inquiries or subscriber data.
- Use exact official audio URLs; URL validation does not prove an embed works or grants music rights. Do not change musical editions or substitute a different song without instruction.
- Form endpoints must be public Formspark submission URLs. Changing the public contact email does not change notification recipients. Never submit a real test inquiry/signup or contact someone without explicit permission.
- Run `node --test scripts/schema.test.mjs` and `node scripts/build.mjs --check`. No package installation is required.
- Keep all related file changes together. Review the diff, then commit/push only when asked to save the change.
- After a main-branch push, inspect the **Check and publish content** result. An attempted edit is not a verified live update.

## Publication contract

The workflow compiles one validated snapshot to the `published` branch. The website reads that snapshot on page load. Do not manually edit generated `content.json` or rewrite the publisher for a routine content request. Invalid input must not replace the last good snapshot. Uploaded image URLs are pinned to the source commit. An open page keeps a consistent snapshot until refresh.

For structural changes to room geometry, animation, audio implementation, checkout or hosting, explain that the separate website application must be changed. Do not represent a CSV edit as accomplishing those changes.
