// When the ADD button is clicked, do the following:
// 1. check inputs, alias and url.
// 2. save alias and url. Use chrome.storage.sync.set
// 3. reset inputs value
export function trySaveRule(aliasInput, urlInput, aliasPrompt, urlPrompt, renderMethod) {
  // the first four arguments are corresponding elements in the input form
  // renderMethod is used to re-render after adding the new rule. Use null if no need to re-render
  let alias = aliasInput.value;
  let url = urlInput.value;
  let isAliasValid = checkAlias(alias, aliasPrompt);
  let isUrlValid = checkUrl(url, urlPrompt);
  if (isAliasValid && isUrlValid) {
    saveRule(alias, url, renderMethod);
    aliasInput.value = "go/";
    urlInput.value = "";
    urlPrompt.className = "help is-primary";
    urlPrompt.innerText = "Success!";
  }
}

function checkAlias(alias, aliasPrompt) {
  if (alias.length == 0) {
    aliasPrompt.innerText = "please use a non-empty alias";
    return false;
  }
  aliasPrompt.innerText = "";
  return true;
}

function checkUrl(url, urlPrompt) {
  urlPrompt.className = "help is-danger";
  if (url.length == 0) {
    urlPrompt.innerText = "please use a non-empty url";
    return false;
  }
  urlPrompt.innerText = "";
  return true;
}

function saveRule(alias, url, renderMethod) {
  let value = {alias: tryAppendSlash(alias), url: url, cnt: 0};
  let obj = {};
  let key = convertAlias(alias);
  obj[key] = value;
  chrome.storage.sync.set(obj, function() {
    if (renderMethod) {
      renderMethod();
    }
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
export function convertAlias(alias) {
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