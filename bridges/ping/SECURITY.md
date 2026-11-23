# Security policy

Please use [GitHub's private vulnerability reporting form](https://github.com/open-mqtt-bridges/ping/security/advisories/new).
Do not post suspected vulnerabilities or live credentials in public issues.
If private reporting is unavailable, ask a maintainer for a private channel
without disclosing the vulnerability in public.
Include the affected commit or version, the impact, and safe diagnostic
details using a synthetic configuration.

Security fixes target the current development branch and the latest published
stable release, once one exists. Run the bridge as a non-root user, keep its
health endpoint private, and restrict broker access to its own topic prefix.
