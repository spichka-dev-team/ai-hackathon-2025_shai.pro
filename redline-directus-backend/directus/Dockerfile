######
# Stage 1: Build the zoom-rtms extension with devDependencies
######
FROM node:20-alpine AS zoom-rtms-builder
WORKDIR /app

# Install deps first to leverage Docker layer caching
COPY ./extensions/zoom-rtms/package*.json ./
RUN npm ci

# Copy the rest and build
COPY ./extensions/zoom-rtms/ ./
RUN npm run build

######
# Stage 2: Final Directus image
######
FROM directus/directus:11.5.1

USER root

RUN mkdir -p /directus/extensions/zoom-rtms

# Copy only the built output and package.json (runtime only)
COPY --from=zoom-rtms-builder /app/dist /directus/extensions/zoom-rtms/dist
COPY --from=zoom-rtms-builder /app/package.json /directus/extensions/zoom-rtms/package.json

# Install runtime dependencies for the zoom-rtms extension (eg. jsonwebtoken)
RUN npm ci --omit=dev --prefix /directus/extensions/zoom-rtms || npm install --omit=dev --prefix /directus/extensions/zoom-rtms

# -----------------------------
# directus-sync extension
# -----------------------------
RUN npm install --prefix /directus/extensions directus-extension-sync@^3.0.2 && \
    mv /directus/extensions/node_modules/directus-extension-sync \
       /directus/extensions/directus-extension-sync && \
    rm -rf /directus/extensions/node_modules

# Ensure proper ownership for the node user
RUN chown -R node:node /directus/extensions

USER node
