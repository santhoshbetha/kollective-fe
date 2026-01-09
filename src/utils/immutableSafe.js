// Defensive helpers to accept Immutable-like inputs and plain JS
// and provide safe accessors/converters used across slices and normalizers.
export const asPlain = (v) => {
  if (v == null) return v;
  if (typeof v.toJS === "function") {
    try {
      return v.toJS();
    } catch {
      // fallthrough
    }
  }
  if (typeof v.toObject === "function") {
    try {
      return v.toObject();
    } catch {
      // fallthrough
    }
  }
  // Immutable Maps may implement `get` / `keySeq` — try best-effort conversion
  if (typeof v.get === "function") {
    try {
      if (typeof v.keySeq === "function") {
        const out = {};
        v.keySeq().forEach((k) => {
          try {
            out[k] = v.get(k);
          } catch {
            out[k] = undefined;
          }
        });
        return out;
      }
    } catch {
      // fallthrough
    }
  }
  return v;
};

export const getProp = (obj, key) => {
  if (!obj) return undefined;
  if (typeof obj.get === "function") {
    try {
      return obj.get(key);
    } catch {
      // fallthrough
    }
  }
  return obj[key];
};

export const getIn = (obj, path) => {
  if (!path || path.length === 0) return obj;
  if (obj == null) return undefined;
  if (typeof obj.getIn === "function") {
    try {
      return obj.getIn(path);
    } catch {
      // fallthrough
    }
  }
  if (typeof obj.get === "function" && path.length === 1) {
    try {
      return obj.get(path[0]);
    } catch {
      // fallthrough
    }
  }
  // plain JS traversal
  let cur = obj;
  for (let i = 0; i < path.length; i++) {
    if (cur == null) return undefined;
    cur = cur[path[i]];
  }
  return cur;
};

export const setIn = (obj, path, value) => {
  if (!path || path.length === 0) return value;
  if (obj == null) obj = Array.isArray(path[0]) ? [] : {};
  if (typeof obj.setIn === "function") {
    try {
      return obj.setIn(path, value);
    } catch {
      // fallthrough to plain clone
    }
  }

  const key = path[0];
  const rest = path.slice(1);
  const clone = Array.isArray(obj) ? obj.slice() : { ...(obj || {}) };
  if (rest.length === 0) {
    clone[key] = value;
  } else {
    clone[key] = setIn((obj && obj[key]) || undefined, rest, value);
  }
  return clone;
};

export const asArray = (maybe) => {
  if (maybe == null) return [];
  if (typeof maybe.toArray === "function") {
    try {
      return maybe.toArray();
    } catch {
      // fallthrough
    }
  }
  if (typeof maybe.toJS === "function") {
    try {
      const v = maybe.toJS();
      return Array.isArray(v) ? v : Array.from(v || []);
    } catch {
      // fallthrough
    }
  }
  if (Array.isArray(maybe)) return maybe.slice();
  try {
    return Array.from(maybe);
  } catch {
    return [];
  }
};

export const getId = (v) => {
  if (!v) return undefined;
  if (typeof v.get === "function") {
    try {
      const val = v.get("id");
      if (val !== undefined) return val;
    } catch {
      // fallthrough
    }
  }
  return v.id;
};

export default {
  asPlain,
  getProp,
  getIn,
  setIn,
  asArray,
  getId,
};
