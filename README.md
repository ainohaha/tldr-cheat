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

### Step 1: Add HTML Attributes

You don't need to change your existing HTML structure, just add `data-attributes` to your elements.

* **On your button controls:**
    * Add `data-read-control` to the main wrapper of your button group.
    * Add `data-read-mode-btn="short"` (or "mid", "full") to each button. The value must match the content section it controls.
    * Add `data-read-indicator` to the empty `<div>` or `<span>` you want to use as the sliding underline.
* **On your content sections:**
    * Add `data-read-section="short"` (or "mid", "full") to the wrapper for each version of your case study content. The value must match the button that controls it.

### Step 2: Link the CSS and JS Files

You need to link the `style.css` and `script.js` files to your main HTML page.

* **CSS:** Add the `style.css` file to your project. In your HTML file, place a `<link>` tag pointing to it inside your `<head>` section.
* **JS:** Add the `script.js` file to your project. In your HTML file, place a `<script>` tag pointing to it just before the closing `</body>` tag.

### Step 3: Configure the Script

This is the most important part for the smart anchor linking to work.

1.  Open the **`script.js`** file in a text editor.
2.  At the very top, you will see a "USER CONFIGURATION" section with several constants.
3.  **`CANON`**: Edit this Map to define your "official" section slugs. You must map the text of your headings (like "The Purpose") to a simple slug (like "purpose").
4.  **`LINK_ALIASES`**: Edit this Map to catch any alternate link names. For example, if your nav link is `href="#why"`, you can map it to your canonical "purpose" slug.
5.  **`ALLOWED`**: Add all your final canonical slugs (like "purpose", "results", etc.) to this Set. This is a security filter.
6.  **`VALID_MODES`**: If you don't use "short", "mid", "full", you must update this Set to match the values you used in your HTML `data-` attributes (e.g., "summary", "detailed").

---

## Platform-Specific Notes

* **Webflow:** This code can be used directly in Webflow.
    1.  Copy the contents of `style.css` and paste them into your project's `Custom Code` in the `<head>` tag.
    2.  Copy the contents of `script.js` and paste them into your project's `Custom Code` in the `</body>` tag.
    3.  Use the Webflow Designer to add the required `data-` attributes to your elements (e.g., `data-read-control`, `data-read-section="short"`, etc.).
* **WordPress:** You can use a plugin like "Insert Headers and Footers" or "Code Snippets" to add the CSS and JS. Then, in the block editor (Gutenberg), you can add custom `data-` attributes to your "Group" or "Column" blocks, or by editing the HTML directly.
* **Any Other CMS:** As long as your platform allows you to add custom CSS/JS and add `data-attributes` to your HTML elements, this script will work.
