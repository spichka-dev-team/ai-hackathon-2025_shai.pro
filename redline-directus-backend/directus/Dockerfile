######
# Final Directus image with directus-sync only
######
FROM directus/directus:11.5.1

USER root

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
