const API_URL = process.env.REACT_APP_API_URL || "http://localhost:54321";

function getToken() {
  return localStorage.getItem("access_token");
}

function setToken(token) {
  localStorage.setItem("access_token", token);
}

function clearToken() {
  localStorage.removeItem("access_token");
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  return res.json();
}

// ─── Table Query Builder ───────────────────────────────

function createTableQuery(table) {
  let _select = "*";
  let _filters = [];
  let _single = false;

  const chain = {
    select(fields) {
      _select = fields;
      return chain;
    },
    eq(column, value) {
      _filters.push({ column, value });
      return chain;
    },
    single() {
      _single = true;
      return chain;
    },
    async then(resolve, reject) {
      try {
        const params = new URLSearchParams();
        params.set("select", _select);
        _filters.forEach((f) => {
          params.set(f.column, `eq.${f.value}`);
        });

        const data = await apiFetch(`/rest/v1/${table}?${params.toString()}`);
        if (_single) {
          resolve({ data: data[0] || null, error: data.length === 0 ? { message: "Row not found" } : null });
        } else {
          resolve({ data, error: null });
        }
      } catch (err) {
        resolve({ data: null, error: { message: err.message } });
      }
    },
  };

  return chain;
}

// ─── Public API ────────────────────────────────────────

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }) {
      try {
        const data = await apiFetch("/auth/v1/token?grant_type=password", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        if (data.error) {
          return { data: { session: null, user: null }, error: { message: data.error } };
        }

        setToken(data.data.session.access_token);
        localStorage.setItem("role", data.data.session.user.role);

        return { data: data.data, error: null };
      } catch (err) {
        return { data: { session: null, user: null }, error: { message: err.message } };
      }
    },

    async getSession() {
      const token = getToken();
      if (!token) {
        return { data: { session: null }, error: null };
      }

      try {
        const data = await apiFetch("/auth/v1/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return { data: data.data, error: null };
      } catch (err) {
        return { data: { session: null }, error: { message: err.message } };
      }
    },

    signOut() {
      clearToken();
      localStorage.removeItem("role");
    },
  },

  from(table) {
    return createTableQuery(table);
  },

  rpc(functionName, params) {
    return {
      async then(resolve, reject) {
        try {
          const data = await apiFetch(`/rest/v1/rpc/${functionName}`, {
            method: "POST",
            body: JSON.stringify(params),
          });

          if (data.error) {
            resolve({ data: null, error: { message: data.error } });
          } else {
            resolve({ data, error: null });
          }
        } catch (err) {
          resolve({ data: null, error: { message: err.message } });
        }
      },
    };
  },

  storage: {
    from(bucket) {
      return {
        async upload(filePath, file) {
          try {
            const formData = new FormData();
            formData.append("file", file);

            const token = getToken();
            const res = await fetch(
              `${API_URL}/storage/upload`,
              {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
              }
            );
            const data = await res.json();

            if (data.error) {
              return { data: null, error: { message: data.error } };
            }
            return { data: data.data, error: null };
          } catch (err) {
            return { data: null, error: { message: err.message } };
          }
        },

        getPublicUrl(filePath) {
          const publicUrl = `${API_URL}/uploads/${filePath.split("/").pop()}`;
          return { data: { publicUrl } };
        },
      };
    },
  },

  insert(table) {
    return {
      async then(resolve, reject) {
        try {
          const data = await apiFetch(`/rest/v1/${table}`, {
            method: "POST",
            body: JSON.stringify(arguments[0] || {}),
          });
          resolve({ data, error: null });
        } catch (err) {
          resolve({ data: null, error: { message: err.message } });
        }
      },
    };
  },
};
