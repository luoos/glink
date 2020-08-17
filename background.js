// Intercept http request (not https), if the request url is saved in the routerGlobal,
// then redirect to the redirect url.
//
// routerGlobal will be update whenever the storage changes. It's a snapshot of the storage.
// routerGlobal schema:
//   {request_url: {alias: <alias>, url: <url>, cnt: <cnt>}}
// for example:
//   {http://y/:   {alias: "y/",   url: "https://youtube.com", cnt: 0},
//    http://go/c: {alias: "go/c", url: "https://calendar.google.com/calendar/r", cnt: 0}}
// alias and the url are inputted by users.
// cnt tracks an alias used by the user.
// The request_url is built by the alias. Chrome will automatically add a prefix to
// urls we type in the address bar. E.g. y/ -> http://y/

// Using a global variable seems an anti-pattern. But chrome.storage.sync.get is an async method,
// which can't be used in the blocking chrome.webRequest.onBeforeRequest. So I use the routerGlobal
// to snapshot the storage. There should be a better way.
var routerGlobal = {};

chrome.storage.onChanged.addListener(function(changes) {
  for (let key in changes) {
    let storageChange = changes[key];
    console.log("Storage key ", key, " changed. Old value was ", storageChange.oldValue,
                ", new value is ", storageChange.newValue);
    if (storageChange.newValue === undefined) {
      delete routerGlobal[key];
    } else {
      routerGlobal[key] = storageChange.newValue;
    }
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(request) {
    let rule = routerGlobal[request.url];
    if (rule != undefined) {
      console.log("Redirect ", request.url, " to ", rule.url);
      increaseAccessCnt(request.url, rule);
      return {redirectUrl: rule.url};
    }
    return null;
  },
  { urls: ["http://*/*"] },  // only intercept http, not https
  ["blocking"]
)

chrome.runtime.onInstalled.addListener(function(details) {
  chrome.storage.sync.get(null, function(rules) {
    console.log("onInstalled, sync routerGlobal");
    for (let key in rules) {
      console.log("key: ", key, "obj: ", rules[key]);
      routerGlobal[key] = rules[key];
    }
  });
});

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.sync.get(null, function(rules) {
    console.log("onStartup, sync routerGlobal");
    for (let key in rules) {
      console.log("key: ", key, "obj: ", rules[key]);
      routerGlobal[key] = rules[key];
    }
  });
});

function increaseAccessCnt(request_url, rule) {
  rule.cnt += 1;
  let obj = {};
  obj[request_url] = rule;
  chrome.storage.sync.set(obj);
}