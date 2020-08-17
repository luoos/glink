const ADD_BUTTON_ID = "add-button";
const ALIAS_INPUT_ID = "alias-input";
const URL_INPUT_ID = "url-input";
const EXISTING_RULES_SECTION_ID = "existing-rules";
const EXISTING_RULES_SECTION_META_ID = "existing-rules-meta";
const ALIAS_PROMPT_ID = "alias-prompt";
const URL_PROMPT_ID = "url-prompt";

var aliasInput = document.getElementById(ALIAS_INPUT_ID)
var urlInput = document.getElementById(URL_INPUT_ID)
var addButton = document.getElementById(ADD_BUTTON_ID);
var existingRulesSection = document.getElementById(EXISTING_RULES_SECTION_ID);
var existingRulesSectionMeta = document.getElementById(EXISTING_RULES_SECTION_META_ID);
var aliasPrompt = document.getElementById(ALIAS_PROMPT_ID);
var urlPrompt = document.getElementById(URL_PROMPT_ID);

addButton.onclick = trySaveRule;

renderRules();

// render the rules based on item in storage
function renderRules() {
  chrome.storage.sync.get(null, function(rules) {
    existingRulesSection.innerHTML = "";
    if (Object.keys(rules).length > 0) {
      let items = Object.values(rules);
      items.sort(compare);  // sorted by cnt, with descending order
      let ruleElements = items.map(r => createRuleElement(r));
      existingRulesSectionMeta.style.display = "block";
      ruleElements.forEach(element =>
          existingRulesSection.appendChild(element));
    } else {
      existingRulesSectionMeta.style.display = "none";
    }
  })
}

function createRuleElement(rule) {
  let aliasElement = createAliasInputElement(rule.alias);
  let urlElement = createURLInputElement(rule.url);
  let accessCntElement = createAccessCntInputElement(rule.cnt);
  let deleteButton = createDeleteButtonElement(rule.alias);

  let columns = document.createElement("div");
  columns.className = "columns";
  columns.appendChild(aliasElement);
  columns.appendChild(urlElement);
  columns.appendChild(accessCntElement);
  columns.appendChild(deleteButton);
  return columns;
}

function createAliasInputElement(alias) {
  return createInputElement(alias, "is-2");
}

function createURLInputElement(url) {
  return createInputElement(url, "auto");
}

function createAccessCntInputElement(cnt) {
  return createInputElement(cnt, "is-2");
}

function createDeleteButtonElement(alias) {
  let columnElement = document.createElement("div");
  columnElement.classList.add("column", "is-1");
  let controlElement = document.createElement("div");
  controlElement.className = "control";
  let buttonElement = document.createElement("button");
  buttonElement.classList.add("button", "is-danger", "is-outlined",
      "is-fullwidth");
  buttonElement.innerText = "Delete"
  buttonElement.onclick = function() {deleteSingleRule(convertAlias(alias))};
  controlElement.appendChild(buttonElement);
  columnElement.appendChild(controlElement);
  return columnElement;
}

function createInputElement(value, width) {
  let columnElement = document.createElement("div");
  columnElement.classList.add("column", width);
  let fieldElement = document.createElement("div");
  fieldElement.className = "field";
  let controlElement = document.createElement("div");
  controlElement.className = "control";
  let inputElement = document.createElement("input");
  inputElement.className = "input";
  inputElement.type = "text";
  inputElement.value = value;
  inputElement.disabled = true;

  controlElement.appendChild(inputElement);
  fieldElement.appendChild(controlElement);
  columnElement.appendChild(fieldElement);
  return columnElement;
}

// compare function used to sort rule items
// the item with greater cnt comes first
function compare(ruleItem1, ruleItem2) {
  if (ruleItem1.cnt > ruleItem2.cnt) {
    return -1;
  }
  return 1;
}


// When the ADD button is clicked, do the following:
// 1. check inputs, alias and url.
// 2. save alias and url. Use chrome.storage.sync.set
// 3. reset inputs value
function trySaveRule() {
  let alias = aliasInput.value;
  let url = urlInput.value;
  let isAliasValid = checkAlias(alias);
  let isUrlValid = checkUrl(url);
  if (isAliasValid && isUrlValid) {
    saveRule(alias, url);
    aliasInput.value = "go/";
    urlInput.value = "";
  }
}

function checkAlias(alias) {
  console.log(alias);
  if (alias.length == 0) {
    aliasPrompt.innerText = "please use a non-empty alias";
    return false;
  }
  aliasPrompt.innerText = "";
  return true;
}

function checkUrl(url) {
  console.log(url);
  if (url.length == 0) {
    urlPrompt.innerText = "please use a non-empty url";
    return false;
  }
  urlPrompt.innerText = "";
  return true;
}

function saveRule(alias, url) {
  let value = {alias: tryAppendSlash(alias), url: url, cnt: 0};
  let obj = {};
  let key = convertAlias(alias);
  obj[key] = value;
  chrome.storage.sync.set(obj, function() {
    renderRules();
  });
}

// For an alias that doesn't include a slash '/', sometime it just means the
// keyword used by search engine like google.
// For example, user types "bi". It could be alias, while it could also be
// search engine keyword.
// To differentiate these two cases, we need the user explicitly append the '/'
// to indicate this is an alias, otherwise it just a normal keyword for search
// engine.
function tryAppendSlash(alias) {
  if (!alias.includes("/")) {
    return alias.concat("/");
  }
  return alias;
}

// When we type an alias in the chrome, chrome will automatically
// add some prefix (and suffix).
// For example:
//   1. if we type "c", chrome will convert it into "http://c/"
//   2. if we type "go/c", chrome will convert it into "http://go/c"
// For prefix, we will add the "http://" as prefix
// For suffix
//   1. there is no "/" in the alias, then we append "/"
//   2. otherwise, we don't append "/"
function convertAlias(alias) {
  let key = alias;
  // check prefix: http://
  if (!key.startsWith("http://")) {
    key = "http://".concat(key);
  }
  // check suffix: /
  // 7 means starting after the leading "http://"
  if (!key.includes('/', 7)) {
    key = key.concat("/");
  }
  return key;
}

function deleteSingleRule(alias) {
  chrome.storage.sync.remove(alias, function() {
    renderRules();
  });
}

function clearAllExistingRules() {
  chrome.storage.sync.clear(function() {
    renderRules();
  });
}