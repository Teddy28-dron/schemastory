const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/u;

export function appendProperty(base, property) {
  return IDENTIFIER.test(property) ? `${base}.${property}` : `${base}[${JSON.stringify(property)}]`;
}

export function appendArrayItem(base) {
  return `${base}[]`;
}

export function isDescendantPath(candidate, ancestor) {
  if (candidate === ancestor || !candidate.startsWith(ancestor)) {
    return false;
  }

  const boundary = candidate.at(ancestor.length);
  return boundary === '.' || boundary === '[';
}
