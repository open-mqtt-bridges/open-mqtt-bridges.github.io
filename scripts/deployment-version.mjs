/** Resolve the visible build identity from deployment inputs, never from a runtime API call. */
export function deploymentVersion(version, commit, override) {
  if (override?.trim()) return override.trim();
  return `v${version}+${commit ? commit.slice(0, 7) : 'local'}`;
}
