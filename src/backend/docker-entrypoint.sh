#!/bin/sh
# Write environment variables to app/src/.env
touch /app/.env
cat <<EOF > /app/.env
SESSION_SECRET=${SESSION_SECRET}
DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
EOF

# Execute the original command
exec "$@"