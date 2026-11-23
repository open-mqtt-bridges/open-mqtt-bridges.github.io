# Data Model

- **Bridge**: Unique catalog slug, name, repository link, guide path and active or archived status.
- **Source pin**: Active bridge slug, public Git repository and exact commit recorded as a Git submodule. A pin must be reachable and contain the designated documentation inputs.
- **Guide**: Overview and ordered reader sections; assets scoped to the guide's path. An archived guide has an archive message instead of active setup instructions.
- **Legacy entry**: Previously published route or tracked section anchor and its preserved path or mapped destination.
- **Publication state**: Separate deployment active → central artifact independently verified → central site serving the guide → final links verified. A failed live probe halts further cutover and triggers the affected rollback.
