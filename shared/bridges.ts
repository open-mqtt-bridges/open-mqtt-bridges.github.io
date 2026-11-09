/** Public directory fields used by local search; URLs are validated at build time. */
export interface SearchableBridge {
  slug: string;
  name: string;
  description: string;
  category: string;
  tag: string;
}

/** Filter by device, repository or category without sending the query to a service. */
export function filterBridges<T extends SearchableBridge>(bridges: T[], query: string): T[] {
  const needle = query.trim().toLocaleLowerCase('en-US');
  return bridges.filter((bridge) =>
    `${bridge.name} ${bridge.slug} ${bridge.description} ${bridge.category} ${bridge.tag}`
      .toLocaleLowerCase('en-US')
      .includes(needle),
  );
}
