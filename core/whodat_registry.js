export function verifyWhoDat(sourceId) {
  const trustedSources = [
    "one2lvos.core",
    "core.boot",
    "infinity.frontend",
    "perception.engine"
  ];

  const verified = trustedSources.includes(sourceId);

  return {
    source_id: sourceId,
    verified,
    signature: verified ? "local-trust" : "untrusted-source"
  };
}
