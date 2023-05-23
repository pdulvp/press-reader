
function toggleClass(item, value) {
  if (hasClass(item, value)) {
    removeClass(item, value);
  } else {
    addClass(item, value);
  }
}

function hasClass(item, value) {
  return item.getAttribute("class") != null && (item.getAttribute("class").includes(value));
}

function removeClass(item, value) {
  if (hasClass(item, value)) {
    item.setAttribute("class", item.getAttribute("class").replace(value, "").trim());
  }
}

function addClass(item, value) {
  if (item == undefined || item == null) {
    console.warn("Unknown item");
  } else {
    if (!hasClass(item, value)) {
      let current = item.getAttribute("class");
      current = current == null ? "" : current;
      item.setAttribute("class", (current + " " + value + " ").trim());
    }
  }
}
export var domh = {
  toggleClass: toggleClass,
  hasClass: hasClass,
  removeClass: removeClass,
  addClass: addClass
}
