/**
 * Get the set npm registry URL.
 *
 * @param scope - Retrieve the registry URL associated with an [npm scope](https://docs.npmjs.com/misc/scope). If the provided scope is not in the user's `.npmrc` file, then `registry-url` will check for the existence of `registry`, or if that's not set, fallback to the default npm registry.
 */
export default function registryUrl(scope?: string): string;
