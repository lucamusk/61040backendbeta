type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

const operations: operation[] = [
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Update User",
    endpoint: "/api/users",
    method: "PATCH",
    fields: { update: { username: "input", password: "input" } },
  },
  {
    name: "Delete User",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Get Users (empty for all)",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: "input" },
  },
  {
    name: "Get favorites",
    endpoint: "/api/compilation/favorite",
    method: "GET",
    fields: {},
  },
  {
    name: "Add favorite",
    endpoint: "/api/compilation/add/favorite",
    method: "PUT",
    fields: { content: "input" },
  },
  {
    name: "Remove favorite",
    endpoint: "/api/compilation/remove/favorite",
    method: "PUT",
    fields: { content: "input" },
  },
  {
    name: "Create group",
    endpoint: "/api/group",
    method: "POST",
    fields: { name: "input" },
  },
  {
    name: "Get all groups",
    endpoint: "/api/group",
    method: "GET",
    fields: {},
  },
  {
    name: "Join group",
    endpoint: "/api/group/join/:name",
    method: "PUT",
    fields: { name: "input" },
  },
  {
    name: "Leave group",
    endpoint: "/api/group/leave/:name",
    method: "PUT",
    fields: { name: "input" },
  },
  {
    name: "Get group",
    endpoint: "/api/group/:name",
    method: "GET",
    fields: { name: "input" },
  },
  {
    name: "Add music",
    endpoint: "/api/music",
    method: "POST",
    fields: { audioLink: "input", artist: "input", name: "input", duration: "input" },
  },
  {
    name: "Get all music",
    endpoint: "/api/music",
    method: "GET",
    fields: {},
  },
  {
    name: "Get music by id",
    endpoint: "/api/music/id/:_id",
    method: "GET",
    fields: { _id: "input" },
  },
  {
    name: "Get music by artist",
    endpoint: "/api/music/artist/:artist",
    method: "GET",
    fields: { artist: "input" },
  },
  {
    name: "Get music by name",
    endpoint: "/api/music/name/:name",
    method: "GET",
    fields: { name: "input" },
  },
  {
    name: "Get Posts (empty author for all)",
    endpoint: "/api/posts",
    method: "GET",
    fields: { group: "input", author: "input" },
  },
  {
    name: "Create Post",
    endpoint: "/api/posts",
    method: "POST",
    fields: { music: "input", text: "input", group: "input" },
  },
  {
    name: "Update Post",
    endpoint: "/api/posts/:id",
    method: "PATCH",
    fields: { id: "input", update: { content: "input", options: { backgroundColor: "input" } } },
  },
  {
    name: "Delete Post",
    endpoint: "/api/posts/:id",
    method: "DELETE",
    fields: { id: "input", group: "input" },
  },
  {
    name: "Get Content by id",
    endpoint: "/api/caption/:_id",
    method: "GET",
    fields: { _id: "input" },
  },
  {
    name: "Create personal compilation",
    endpoint: "/api/compilation/personal",
    method: "POST",
    fields: { name: "input" },
  },
  {
    name: "Delete personal compilation",
    endpoint: "/api/compilation/personal",
    method: "DELETE",
    fields: { name: "input" },
  },
  {
    name: "Add personal compilation content",
    endpoint: "/api/compilation/personal/add",
    method: "PUT",
    fields: { name: "input", content: "input" },
  },
  {
    name: "Remove personal compilation content",
    endpoint: "/api/compilation/personal/remove",
    method: "PUT",
    fields: { name: "input", content: "input" },
  },
  {
    name: "Get personal playlist cntent",
    endpoint: "/api/compilation/personal/:name",
    method: "GET",
    fields: { name: "input" },
  },
  {
    name: "Create headline compilation",
    endpoint: "/api/compilation/headline",
    method: "POST",
    fields: { group: "input" },
  },
  {
    name: "Delete headline compilation",
    endpoint: "/api/compilation/personal",
    method: "DELETE",
    fields: { group: "input" },
  },
  {
    name: "Add headline compilation content",
    endpoint: "/api/compilation/headline/add",
    method: "PUT",
    fields: { group: "input", content: "input" },
  },
  {
    name: "Remove headliner compilation content",
    endpoint: "/api/compilation/headline/remove",
    method: "PUT",
    fields: { group: "input", content: "input" },
  },
  {
    name: "Get headline playlist content",
    endpoint: "/api/compilation/headline/:group",
    method: "GET",
    fields: { group: "input" },
  },
  {
    name: "Get recents playlist content",
    endpoint: "/api/compilation/recents/:group",
    method: "GET",
    fields: { group: "input" },
  },
  {
    name: "Get photo banner",
    endpoint: "/api/photobanner/:_id",
    method: "GET",
    fields: { item: "input" },
  },
  {
    name: "Set photo banner",
    endpoint: "/api/photobanner/:_id",
    method: "POST",
    fields: { item: "input", photoLink: "input" },
  },
  {
    name: "Upvote Post",
    endpoint: "/api/vote/upvote/:_id",
    method: "PUT",
    fields: { _id: "input" },
  },
  {
    name: "Downvote Post",
    endpoint: "/api/vote/downvote/:_id",
    method: "PUT",
    fields: { _id: "input" },
  },
  {
    name: "Get Post votes",
    endpoint: "/api/vote/:_id",
    method: "GET",
    fields: { _id: "input" },
  },
  {
    name: "Upvote Post",
    endpoint: "/api/vote/upvote/:_id",
    method: "PUT",
    fields: { post: "input" },
  },
  {
    name: "Set photo banner",
    endpoint: "/api/photobanner/:_id",
    method: "POST",
    fields: { item: "input", photoLink: "input" },
  },
  {
    name: "Get timeline",
    endpoint: "/api/compilation/timeline/:group",
    method: "GET",
    fields: { group: "input" },
  },
  {
    name: "Get rating sorted timeline content",
    endpoint: "/api/compilation/rated_timeline/:group",
    method: "GET",
    fields: { group: "input" },
  },
];

// Do not edit below here.
// If you are interested in how this works, feel free to ask on forum!

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${tag} name="${prefix}${name}"></${tag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (!value) {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
