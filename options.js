import {trySaveRule, convertAlias} from "./common.js"

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

addButton.onclick = () => trySaveRule(aliasInput, urlInput, aliasPrompt, urlPrompt, renderRules);

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
  buttonElement.onclick = () => deleteSingleRule(convertAlias(alias));
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