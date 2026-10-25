# Update the 5.5 Records website

Edit the files here to update [fivepointfiverecords.com](https://www.fivepointfiverecords.com). **Row order = website order.** Move a whole row up or down to move that item. No website-code changes or redeployment are needed.

## Which file do I edit?

| What to change | File |
| --- | --- |
| Current artist names and Spotify links | [current-artists.csv](content/current-artists.csv) |
| Alumni names and Spotify links | [alumni-artists.csv](content/alumni-artists.csv) |
| Catalogue titles, artist credits, years, covers and release links | [releases.csv](content/releases.csv) |
| Front-page sleeves, New Releases and playable tracks | [new-releases.csv](content/new-releases.csv) |
| Covers on the wall shelf | [shelf.csv](content/shelf.csv) |
| Shop names, rupee prices, buy links and photos | [shop.csv](content/shop.csv) |
| Social accounts and their order | [socials.csv](content/socials.csv) |
| Email, logos, wall artwork and form settings | [settings.json](content/settings.json) |

## Save a change

1. Open the file and click the **pencil / Edit** button.
2. Edit, add, remove or move a row. **Keep the first/header line unchanged.**
3. Click **Commit changes** and save to **main**.
4. Open **Actions**. Wait for the newest **Check and publish content** run to turn green, then refresh the website.

Publishing and caching can take a few minutes. A red check explains what needs fixing; the website keeps its last good content. For several related file changes, use one branch and pull request, then merge them together.

## Common changes

**Add an artist:** add their name and exact Spotify artist link to the Current or Alumni file. `genre` is optional. Remove the row to remove the name.

**Add a release:** add its details to `releases.csv` with a new, unused `id`. Set `in_catalogue` to `yes`. To feature it on the homepage, also add that ID to `new-releases.csv`; to put it on the shelf, add it to `shelf.csv`. Homepage and shelf order come from their own files, independently of catalogue order.

**Homepage music:** `youtube` is the exact official YouTube/YouTube Music audio URL. `playback_title` is optional. A blank audio URL links out to the release instead. Check new tracks in the player: some videos cannot be embedded.

**Display space:** the front crate has **7 slots** and the shelf has **5**. Replace or remove a selection when full. Removing a selection does not delete its catalogue entry. To delete a release entirely, also remove its ID from both selection files.

**Shop:** one product per row. `price` uses rupees as digits, such as `899` or `899.50`. `link` is the checkout URL. Separate multiple picture paths with `|`, in the order they should appear. Extra products create more shop pages.

**Pictures:** open [images/](images/) → **Add file → Upload files**. Use JPG, PNG or WebP. Commit the picture first, then put its path in the content file, for example `images/merch/new-shirt.jpg`. Use a new filename for replacement artwork. Direct HTTPS image URLs also work when the image host allows cross-origin use; uploading here is more reliable.

**Email and forms:** the public email address is in `settings.json`. Form notification recipients are set in Formspark, not by changing that email. Contact and newsletter use separate public `https://submit-form.com/...` URLs. Newsletter signup stays disabled until configured and enabled; it collects addresses, not newsletter campaigns.

## Get help from a text-only AI

Send the assistant this README or the repository link. **If it cannot open links, paste this README and the full relevant file(s), including their header lines.** It can prepare the text while you make the GitHub edit.

Copy this prompt:

> Help me update the 5.5 Records content using this README. I want to: [describe the change]. I will edit GitHub myself. Ask me for the current file contents and any missing names, links, prices or pictures. Then give me the exact filename, complete replacement text, and short save instructions. Keep unrelated rows and their order. Do not invent details or claim you have saved anything.

For a new homepage release, paste `releases.csv` and `new-releases.csv`. For a shop change, paste `shop.csv`. To remove a release everywhere, paste all three release/selection files. Upload images yourself before saving rows that reference them.

## Avoid common mistakes

Keep IDs unique and unchanged. Put quotes around a field containing commas: `"ARTIST ONE, ARTIST TWO"`. Inside quoted text, double a quote: `"A ""Special"" Release"`. Do not paste Markdown tables or `...` into a CSV. Empty optional fields are fine.

This repository is public. **Never upload passwords, secret keys, customer messages or subscriber lists.** Edit `content/` and `images/`; leave `scripts/`, `.github/` and the generated `published` branch alone.

Need a column explained? See the [field reference](docs/FIELDS.md). AI agents with tools should also read [AGENTS.md](AGENTS.md).
