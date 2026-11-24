ARG NODE_BASE=node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5
### ####################
### BUILDER
### ####################
FROM ${NODE_BASE} AS build

# Install build tools (needed for some deps)
RUN apk add --no-cache python3 make g++ openssl

# Match the package manager pinned in package.json.
RUN npm install --global pnpm@11.28.9

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build TypeScript -> JS
# Verify transport security with temporary certificates before bundling.
RUN pnpm test

# Bundle into single JS file
RUN pnpm bundle


### ####################
### RUNNER
### ####################
FROM ${NODE_BASE} AS runtime

WORKDIR /app

# Copy only bundled output (no node_modules needed)
COPY --from=build /app/dist ./dist
COPY --chmod=0444 tools/readycheck.cjs ./readycheck.cjs
ENV NODE_ENV=production BRIDGE_READY_PORT=38083
USER node

CMD ["node", "dist/index.js"]
