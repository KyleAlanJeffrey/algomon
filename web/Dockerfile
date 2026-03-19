FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 3000

# Apply local D1 migrations then start dev server
CMD sh -c "npx wrangler d1 migrations apply algomon --local --yes 2>/dev/null || true && npx next dev -H 0.0.0.0"
