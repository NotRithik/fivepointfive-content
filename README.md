# Update the 5.5 Records website

Edit these files to update [fivepointfiverecords.com](https://www.fivepointfiverecords.com). **Row order = website order.** Move a whole row to move an item. No website-code changes or redeployment are needed.

## Which file?

| Change | File |
| --- | --- |
| Current artists and Spotify links | [current-artists.csv](content/current-artists.csv) |
| Alumni and Spotify links | [alumni-artists.csv](content/alumni-artists.csv) |
| Catalogue titles, credits, years, covers and links | [releases.csv](content/releases.csv) |
| Front-page sleeves, New Releases and playable tracks | [new-releases.csv](content/new-releases.csv) |
| Covers on the wall shelf | [shelf.csv](content/shelf.csv) |
| Shop names, rupee prices, buy links and photos | [shop.csv](content/shop.csv) |
| Social accounts and their order | [socials.csv](content/socials.csv) |
| Email, logos, wall artwork and form settings | [settings.json](content/settings.json) |

## Save a change

1. Open the file → click the **pencil / Edit** button.
2. Edit, add, remove or move rows. **Keep the header line unchanged.**
3. Click **Commit changes** → save to **main**.
4. Open **Actions**. When **Check and publish content** is green, refresh the website.

Publishing can take a few minutes. Each new page load checks the published commit for changes; refresh an open page to apply them. A red check explains the error; the website keeps its last good content. Save related changes together using a branch and pull request.

## Things to know

**Releases:** add the release to `releases.csv` with a unique permanent `id`. Set `in_catalogue=yes` to show it. Reference its ID in `new-releases.csv` or `shelf.csv` to feature it there. Their orders are independent. The homepage has **7 slots**; the shelf has **5**. Remove references from both files before deleting a release entirely.

**Music:** `youtube` is the exact official audio/YouTube Music link. Leave it blank to link out instead of playing inside the site. Test new tracks: some videos cannot be embedded.

**Pictures:** open [images/](images/) → **Add file → Upload files**. Commit the JPG/PNG/WebP first, then use its path, e.g. `images/merch/new-shirt.jpg`. Direct HTTPS image links also work when the host allows cross-origin use. Uploading here is more reliable.

**Shop:** one product per row. Use prices such as `899` or `899.50`, and a complete checkout URL. Separate photo paths with `|`; their order controls rotation. Extra products create more shop pages.

**Contact:** change the public email in `settings.json`. Form notification recipients are managed in Formspark. Contact and newsletter need separate public submission URLs; newsletter signup stays disabled until configured and enabled. It collects addresses, not newsletter campaigns.

**CSV:** quote fields containing commas: `"ARTIST ONE, ARTIST TWO"`. Keep IDs unique. Never paste Markdown tables or `...` over existing rows.

## Ask an AI assistant

**An agent with GitHub write access can do the edits for you.** Send the repo link and say: “Read README.md and AGENTS.md, make these changes, commit them and check publication.” It needs permission to write to this repository; viewing Markdown or reading files alone does not let it save to GitHub.

Send it this README or the repository link. If it cannot open links, paste **this README and the full relevant files, including headers**. For a text-only assistant, no account access is needed: it prepares text; you save it in GitHub.

Copy this prompt:

> Help me update 5.5 Records using this README. I want to: [change]. I will edit GitHub myself. Ask for the current file contents and missing details. Return the exact filename, complete replacement text and short save instructions. Preserve unrelated rows and their order. Do not invent links or claim you saved anything.

For a new homepage release, paste `releases.csv` and `new-releases.csv`. For a shop change, paste `shop.csv`. Upload any new pictures before saving the prepared rows. If a check fails, paste its error into the chat for help.

More detail: [field reference](docs/FIELDS.md). Instructions for agents with tools: [AGENTS.md](AGENTS.md).

**This repo is public. Never upload passwords, secret keys, customer messages or subscriber lists.** Edit `content/` and `images/`; leave the publishing scripts and generated `published` branch alone.
