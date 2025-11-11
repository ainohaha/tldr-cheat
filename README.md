# Tldr; Case Study (Dynamic Reading Modes)

This repository provides a drop-in solution for creating dynamic "reading time" versions of a case study or article. It allows a user to select a "short," "medium," or "full" version of the content, and it intelligently handles anchor links to scroll to the correct section within the *visible* content block.

This solution is platform-agnostic. It was originally built for Webflow but has been generalized with `data-attributes` to work on any CMS or static site builder (WordPress, Ghost, Shopify, etc.).


![tldr_gif](https://github.com/user-attachments/assets/3c0c5220-842e-4b24-bf7d-f17482a108c2)


## Features

* **Content Toggling:** Allows users to toggle between different-length versions of your content (e.g., "Summary," "Standard," "Full").
* **Sliding Underline:** Includes a CSS-animated sliding indicator for the active control button.
* **State Persistence:** Remembers the user's last-selected mode using `localStorage` and also updates the URL (e.g., `.../page?read=mid`), making it shareable.
* **Smart Anchor Linking:** This is the key feature. If you have a navigation menu with links like `#purpose` or `#results`, the script will find that heading *within the currently active content block* and scroll to it.

---

## How to Use

### Step 1: Add the HTML Structure

This script relies on specific `data-attributes` to function. You must add these attributes to your HTML.

#### 1. The Controls

This is the button group for toggling modes.

* `[data-read-control]`: The wrapper for the entire button group.
* `[data-read-mode-btn="..."]`: The individual buttons. The value **must match** the value of the content section it controls (e.g., "short", "mid", "full").
* `[data-read-indicator]`: The empty element used for the sliding underline.

**Example HTML:**
```html
<div class="read-control" data-read-control>
  <div class="read-seg">
    <button class="seg-btn" data-read-mode-btn="short">
      <span class="seg-label">Short</span>
    </button>
    <button class="seg-btn" data-read-mode-btn="mid">
      <span class="seg-label">Medium</span>
    </button>
    <button class="seg-btn" data-read-mode-btn="full">
      <span class="seg-label">Full</span>
    </button>
    <div class="seg-indicator" data-read-indicator></div>
  </div>
</div>
