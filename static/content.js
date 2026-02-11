console.log('Content script loaded');

let scrollTimeout;
const pageTitle = document.title;
const pageBody = getScrolledContent();

// Function to check if element is navigation-related
function isNavigationElement(element) {
  const navSelectors = [
    'nav',
    'header',
    'footer',
    'aside',
    '[role="navigation"]',
    '.nav',
    '.navigation',
    '.menu',
    '.header',
    '.footer',
    '.sidebar'
  ];

  // Check if element matches navigation selectors
  for (const selector of navSelectors) {
    if (element.matches && element.matches(selector)) {
      return true;
    }
  }

  // Check if any parent is a navigation element
  let parent = element.parentElement;
  while (parent) {
    for (const selector of navSelectors) {
      if (parent.matches && parent.matches(selector)) {
        return true;
      }
    }
    parent = parent.parentElement;
  }

  return false;
}

// Function to get visible/scrolled content
function getScrolledContent() {
  const scrollPosition = window.scrollY + window.innerHeight;
  const elements = document.body.querySelectorAll('*');
  let visibleText = '';

  elements.forEach((element) => {
    // Skip navigation elements
    if (isNavigationElement(element)) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;

    // Only include elements that are above or at the current scroll position
    if (elementTop <= scrollPosition && element.childNodes.length > 0) {
      // Only get direct text nodes to avoid duplicates
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          visibleText += node.textContent.trim() + ' ';
        }
      });
    }
  });

  return visibleText.trim();
}

// Send data to the background script (guarded)
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
  chrome.runtime.sendMessage({ type: 'PAGE_INFO', title: pageTitle, body: pageBody });
}

// Listen for scroll events to update content
if (document.body) {
  document.body.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const updatedBody = getScrolledContent();
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'PAGE_INFO', title: pageTitle, body: updatedBody });
      }
    }, 500);
  });
}
