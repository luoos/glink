import {trySaveRule} from "./common.js";

const aliasInput = document.getElementById("alias-input")
const urlInput = document.getElementById("url-input");
const aliasPrompt = document.getElementById("alias-prompt");
const urlPrompt = document.getElementById("url-prompt");
const addButton = document.getElementById("add-button");
const optionButton = document.getElementById("option-button");

chrome.tabs.getSelected(null, function(tab) {
  urlInput.value = tab.url;
})

addButton.onclick = () => trySaveRule(aliasInput, urlInput, aliasPrompt, urlPrompt, null);

optionButton.onclick = () => chrome.runtime.openOptionsPage();