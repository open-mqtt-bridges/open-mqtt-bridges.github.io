### ####################
### BUILDER
### ####################
FROM node:lts-alpine AS build

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
FROM node:lts-alpine AS runtime

WORKDIR /app

# Copy only bundled output (no node_modules needed)
COPY --from=build /app/dist ./dist
COPY tools/readycheck.cjs ./tools/readycheck.cjs
ENV BRIDGE_READY_PORT=38083

CMD ["node", "dist/index.js"]
